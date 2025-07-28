import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import { navigate } from '../services/NavigationService';

import { useAuth } from './AuthContext';
import { useGroupStore } from '../stores/groupStore';

import TimedPopup from '../components/PartyInvitationPopup';
import handleFirestoreError from '../utils/firebaseErrorHandler';
import firestore from '@react-native-firebase/firestore';

import {
  listenToGroupInvitations,
  listenToFriendRequests,
  listenToPartyInvitations,
  updateGroupInvitationStatus,
  updatePartyInvitationStatus,
} from '../services/invitationService';

import { Applicant } from '../types/groupTypes'
import { FriendRequest, GroupInvitation, PartyInvitation } from '../types/invitationTypes';
import { Member } from '../types/groupTypes';

interface InvitationContextType {
  groupInvitation: GroupInvitation | null;
  friendRequests: FriendRequest[];
  partyInvitation: PartyInvitation | null;
  respondToPartyInvitation: (id: string, response: 'accepted' | 'declined') => Promise<void>;
  respondToGroupInvitation: (id: string, response: 'accepted' | 'declined') => Promise<void>;
  modalVisible: boolean;
  closeModal: () => void;
}

const InvitationContext = createContext<InvitationContextType | null>(null);

export const useInvitation = () => {
  const context = useContext(InvitationContext);
  if (!context) throw new Error('useInvitation must be used within an InvitationProvider');
  return context;
};

export const InvitationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser, userData } = useAuth();
  // const { setCurrentGroupId } = useGroupStore();

  const [groupInvitation, setGroupInvitation] = useState<GroupInvitation | null>(null);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [partyInvitation, setPartyInvitation] = useState<PartyInvitation | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // 🔁 Listen to all invitation types
  useEffect(() => {
    if (!currentUser) return;

    const unsubGroup = listenToGroupInvitations(currentUser.uid, (inv) => {
      setGroupInvitation(inv);
      setModalVisible(!!inv);
    });

    const unsubFriends = listenToFriendRequests(currentUser.uid, (requests) => {
      setFriendRequests(requests);
      if (requests.length > 0) {
        Toast.show({
          type: 'info',
          text1: 'New Friend Request! 🎉',
          text2: `You got a request from ${requests[0].firstName}`,
          onPress: () => navigate('FriendRequestScreen'),
        });
      }
    });

    const unsubParty = listenToPartyInvitations(currentUser.uid, (invite) => {
      setPartyInvitation(invite);
    });

    return () => {
      unsubGroup();
      unsubFriends();
      unsubParty();
    };
  }, [currentUser]);

  // ✅ Accept / Decline Group Invitation
  const respondToGroupInvitation = async (invitationId: string, response: 'accepted' | 'declined') => {
    if (!currentUser || !groupInvitation) return;

    if (!groupInvitation?.groupId) {
      console.error("No groupId on groupInvitation");
      return;
    }


    try {
      await updateGroupInvitationStatus(invitationId, response);

      const groupRef = firestore().collection('groups').doc(groupInvitation.groupId);
      const groupDoc = await groupRef.get();
      const groupData = groupDoc.data();

      if (response === 'accepted') {
        const userDoc = await firestore().collection('users').doc(currentUser.uid).get();
        const userData = userDoc.data();

        const memberToAdd = {
          uid: currentUser.uid,
          firstName: userData?.firstName || 'Unknown',
          lastName: userData?.lastName || 'Unknown',
          skillLevel: userData?.skillLevel || 0,
        };

        // Get all members from `groupInvitation` (excluding currentUser)
        const invitedMembers = (groupInvitation?.members ?? []).map(member => ({
          uid: member.uid,
          firstName: member.firstName || 'Unknown',
          lastName: member.lastName || 'Unknown',
          // skillLevel: member.skillLevel || 0,
        }));

        // Combine `currentUser` and invited members into one list
        const allMembersToAdd = [memberToAdd, ...invitedMembers];

        // Add members to the group in Firestore
        const groupRef = firestore().collection('groups').doc(groupInvitation.groupId);
        await groupRef.update({
          members: firestore.FieldValue.arrayUnion(...allMembersToAdd),
          memberUids: firestore.FieldValue.arrayUnion(...allMembersToAdd.map(m => m.uid)),
        });

        const chatRef = firestore().collection('chats').doc(groupInvitation.groupId);

        const chatDoc = await chatRef.get();
        if (chatDoc.exists()) {
          const newParticipants = allMembersToAdd.map(m => m.uid);
          const newDetails = allMembersToAdd.reduce((acc, m) => {
            acc[m.uid] = {
              firstName: m.firstName,
              lastName: m.lastName,
            };
            return acc;
          }, {} as { [uid: string]: { firstName: string; lastName: string } });

          await chatRef.update({
            participants: firestore.FieldValue.arrayUnion(...newParticipants),
            ...Object.keys(newDetails).reduce((fields, uid) => {
              fields[`participantsDetails.${uid}`] = newDetails[uid];
              return fields;
            }, {} as Record<string, { firstName: string; lastName: string }>)
          });
        }


        const userUpdates = allMembersToAdd.map(async (member) => {

          const userRef = firestore().collection('users').doc(member.uid);
          const userSnap = await userRef.get();
          const userDoc = userSnap.data();

          const newGroupEntry = {
            groupId: groupInvitation.groupId,
            role: 'member',
            joinedAt: new Date().toISOString(),
            status: 'active',
          };

          const updatedGroups = [...(userDoc?.groups || []), newGroupEntry];

          return userRef.update({
            groups: updatedGroups,
            selectedGroupId: groupInvitation.groupId
          });
        });

        await Promise.all(userUpdates);

        const updatedGroupDoc = await groupRef.get();
        const updatedGroupData = updatedGroupDoc.data();
        const currentMembers = updatedGroupData?.members ?? [];
        const memberLimit = updatedGroupData?.memberLimit ?? 1;

        if (currentMembers.length >= memberLimit) {
          await groupRef.update({
            isDelisted: true,
          });
        }

        // setCurrentGroupId(undefined);
        setTimeout(() => {
          navigate('TabNav', {
            screen: 'My Groups',
            params: {
              screen: 'SelectGroupScreen'
            }
          })
        }, 100);
      }

      setModalVisible(false);

      if (groupData?.applicants) {
        const applicantToRemove = groupData.applicants.find(
          (applicant: Applicant) => applicant.uid === currentUser.uid,
        );
        if (applicantToRemove) {
          // Remove the applicant from the applicants list
          await groupRef.update({
            applicants: firestore.FieldValue.arrayRemove(applicantToRemove),
          });
        }
      }

      // await firestore().collection('groupInvitations').doc(invitationId).delete();
      await firestore().collection('searchParties').doc(currentUser.uid).delete()

      setGroupInvitation(null);
    } catch (error) {
      handleFirestoreError(error);
    }
  };

  // ✅ Accept / Decline Party Invitation
  const respondToPartyInvitation = async (invitationId: string, response: 'accepted' | 'declined') => {
    if (!partyInvitation || !currentUser) return;

    try {
      await updatePartyInvitationStatus(invitationId, response);

      if (response === 'accepted' && userData) {
        const newMember = {
          uid: currentUser.uid,
          firstName: userData.firstName || 'Unknown',
          lastName: userData.lastName || 'Unknown',
        };

        const partyRef = firestore().collection('searchParties').doc(partyInvitation.sender);
        const partyDoc = await partyRef.get();

        if (partyDoc.exists()) {
          await partyRef.update({
            members: firestore.FieldValue.arrayUnion(newMember),
          });
        } else {
          await partyRef.set({
            leaderUid: partyInvitation.sender,
            leaderFirstName: partyInvitation.firstName,
            leaderLastName: partyInvitation.lastName,
            members: [newMember],
          });
        }

        await firestore().collection('users').doc(currentUser.uid).update({ isPartyMember: true });
        await firestore().collection('users').doc(partyInvitation.sender).update({ isPartyLeader: true });

        navigate('SearchPartyScreen');
      }

      setPartyInvitation(null);
    } catch (error) {
      handleFirestoreError(error);
    }
  };

  const closeModal = () => setModalVisible(false);

  return (
    <InvitationContext.Provider
      value={{
        groupInvitation,
        friendRequests,
        partyInvitation,
        respondToPartyInvitation,
        respondToGroupInvitation,
        modalVisible,
        closeModal,
      }}
    >
      {children}
      {partyInvitation && (
        <TimedPopup
          firstName={partyInvitation.firstName}
          onAccept={() => respondToPartyInvitation(partyInvitation.id, 'accepted')}
          onDecline={() => respondToPartyInvitation(partyInvitation.id, 'declined')}
        />
      )}
      {modalVisible && groupInvitation && (
        <Modal
          transparent
          animationType="fade"
          visible={modalVisible}
          onRequestClose={closeModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>Group Invitation</Text>
              <Text style={styles.modalText}>You have been invited to join:</Text>
              <View style={styles.column}>
                <View style={styles.cardContentActivity}>
                  <Text style={styles.cardText}>
                    {groupInvitation.activity === 'Custom' ? (
                      groupInvitation.title
                    ) : (
                      groupInvitation.activity
                    )}
                  </Text>
                  <Text style={styles.cardText}>{groupInvitation.locationName}</Text>
                </View>
                <View style={styles.cardContentDate}>
                  <Text style={styles.cardText}>{new Date(groupInvitation.fromDate).toLocaleDateString('sv-SE', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}</Text>
                  <Text style={styles.cardText}>
                    {groupInvitation.fromTime} - {groupInvitation.toTime}
                  </Text>
                </View>
              </View>
              <View style={styles.modalActions}>

                <TouchableOpacity
                  style={[styles.actionButton, styles.declineButton]}
                  onPress={() => respondToGroupInvitation(groupInvitation.id, 'declined')}
                >
                  <Text style={styles.buttonText}>Decline</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => respondToGroupInvitation(groupInvitation.id, 'accepted')}
                >
                  <Text style={styles.buttonText}>Accept</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </InvitationContext.Provider>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'black',
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: 'black',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  actionButton: {
    flex: 1,
    margin: 5,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    backgroundColor: 'green',
  },
  declineButton: {
    backgroundColor: 'red',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  column: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  cardContentActivity: {
    flex: 1,
    alignItems: 'center',
  },
  cardContentDate: {
    flex: 1,
    alignItems: 'center',
  },
  cardText: {
    fontSize: 16,
    color: 'black',
  },
});
