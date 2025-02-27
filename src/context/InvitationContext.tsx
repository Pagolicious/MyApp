import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert, Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import Toast from 'react-native-toast-message';

//Navigation
import { navigate } from '../services/NavigationService';

//Components
import TimedPopup from '../components/PartyInvitationPopup';

//Context
import { useAuth } from './AuthContext';
import { useGroup } from './GroupContext';

//Utils
import handleFirestoreError from '../utils/firebaseErrorHandler';
import FriendRequestScreen from '../screens/Profile/FriendRequestScreen';

// interface Group {
//   id: string;
//   activity: string;
//   location: string;
//   fromDate: string;
//   fromTime: string;
//   toTime: string;
//   groupId: string;
//   createdBy: string;
//   memberLimit: number;
//   details: string;
//   members: Member[];
//   memberUids: string[];
//   applicants: Applicant[];

// }
interface Member {
  uid: string;
  firstName: string;
  lastName: string;
  skillLevel: string;
}

interface GroupInvitation {
  id: string;
  groupId: string;
  sender: string;
  receiver: string;
  activity: string;
  location: string;
  fromDate: string;
  fromTime: string;
  toTime: string;
  status: 'pending' | 'accepted' | 'declined';
}

interface FriendRequest {
  sender: string,
  receiver: string,
  firstName: string,
  lastName: string,
  status: 'pending' | 'accepted' | 'declined';
}

interface PartyInvitation {
  id: string;
  sender: string,
  receiver: string,
  firstName: string,
  lastName: string,
  status: 'pending' | 'accepted' | 'declined';
}

interface InvitationContextType {
  groupInvitation: GroupInvitation | null;
  friendRequests: FriendRequest[];
  partyInvitation: PartyInvitation | null;
  respondToPartyInvitation: (invitationId: string, response: "accepted" | "declined") => Promise<void>;
  modalVisible: boolean;
  respondToGroupInvitation: (invitationId: string, response: 'accepted' | 'declined') => Promise<void>;
  closeModal: () => void;
}

type Applicant = {
  uid: string;
  firstName: string;
  lastName: string;
  skillLevel: string | number;
  note?: string;
};

const InvitationContext = createContext<InvitationContextType | null>(null);

export const useInvitation = () => {
  const context = useContext(InvitationContext);
  if (!context) {
    throw new Error('useInvitation must be used within an InvitationProvider');
  }
  return context;
};



export const InvitationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, userData } = useAuth();
  const [groupInvitation, setGroupInvitation] = useState<GroupInvitation | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [partyInvitation, setPartyInvitation] = useState<PartyInvitation | null>(null);

  const { setCurrentGroupId, setCurrentGroup } = useGroup();

  useEffect(() => {
    if (!currentUser) {
      setGroupInvitation(null);
      return;
    }

    const unsubscribe = firestore()
      .collection('groupInvitations')
      .where('receiver', '==', currentUser.uid)
      .where('status', '==', 'pending')
      .onSnapshot(
        (querySnapshot) => {
          if (!querySnapshot.empty) {
            querySnapshot.forEach((doc) => {
              const data = doc.data() as Omit<GroupInvitation, 'id'>;
              setGroupInvitation({ id: doc.id, ...data });
              setModalVisible(true);
            });
          } else {
            setGroupInvitation(null);
          }
        },
        (error) => {
          handleFirestoreError(error);
        }
      );

    return () => unsubscribe();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;

    // Firestore Listener for Friend Requests
    const unsubscribe = firestore()
      .collection('friendRequests')
      .where('receiver', '==', currentUser.uid)
      .where('status', '==', 'pending')
      .onSnapshot(snapshot => {
        const requests: FriendRequest[] = [];

        snapshot.docChanges().forEach(change => {
          if (change.type === 'added') {
            const request = change.doc.data() as FriendRequest;
            requests.push(request);

            // Show a toast notification for the received request
            Toast.show({
              type: 'info',
              text1: 'New Friend Request! 🎉',
              text2: `You got a request from ${request.firstName}`,
              onPress: () => navigate("FriendRequestScreen")
            });
          }
        });

        setFriendRequests(requests);
      });

    return () => unsubscribe(); // Cleanup when unmounting
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = firestore()
      .collection("searchPartyInvitation")
      .where("receiver", "==", currentUser.uid)
      .where("status", "==", "pending")
      .onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
          if (change.type === "added") {
            const newInvitation = { id: change.doc.id, ...change.doc.data() } as PartyInvitation;
            console.log("New invitation received:", newInvitation); // Debugging log
            setPartyInvitation(newInvitation);
          }
        });
      });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, [currentUser]);


  const respondToGroupInvitation = async (invitationId: string, response: 'accepted' | 'declined'): Promise<void> => {
    try {
      await firestore().collection('groupInvitations').doc(invitationId).update({
        status: response,
      });
    } catch (error) {
      handleFirestoreError(error);
    }


    if (!currentUser) return;

    // Get group reference
    try {
      const groupRef = firestore().collection('groups').doc(groupInvitation?.groupId);
      const groupDoc = await groupRef.get();
      const groupData = groupDoc.data();



      if (response === 'accepted') {

        setModalVisible(false);

        // Fetch current user data
        const userDoc = await firestore()
          .collection('users')
          .doc(currentUser.uid)
          .get();
        const currentUserData = userDoc.data()

        if (!currentUserData) {
          Alert.alert('Error', 'Unable to retrieve user data.');
          return;
        }

        const memberToAdd = {
          uid: currentUser.uid,
          firstName: currentUserData.firstName || 'Unknown',
          lastName: currentUserData.lastName || 'Unknown',
          skillLevel: currentUserData.skillLevel || 0,
        };



        if (!groupDoc.exists) {
          Alert.alert('Error', 'Group not found. Please refresh the list or create a new group.');
          return;
        }

        // Add the member to the group
        await groupRef.update({
          members: firestore.FieldValue.arrayUnion(memberToAdd),
          memberUids: firestore.FieldValue.arrayUnion(currentUser.uid),

        });
        await firestore()
          .collection('users')
          .doc(currentUser.uid)
          .update({
            isGroupMember: true,
            groupId: groupInvitation?.groupId
          })

        // setCurrentGroupId(groupData?.groupId)
        // setCurrentGroup({ id: groupData?.groupId, ...groupData });

        // console.log("YOOOOOOOOOOOOOOOOOOOO", groupData?.groupId)
        // await checkUserInGroup();

        navigate("GroupApp", { screen: 'MembersHomeScreen' })

      } else {
        setModalVisible(false);
      }

      if (groupData && groupData.applicants) {
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

      await firestore().collection('groupInvitations').doc(invitationId).delete();

      setGroupInvitation(null);
    } catch (error) {
      handleFirestoreError(error);
    }

  };

  const respondToPartyInvitation = async (invitationId: string, response: "accepted" | "declined") => {
    if (!partyInvitation || !currentUser) return;

    try {
      await firestore()
        .collection("searchPartyInvitation")
        .doc(invitationId)
        .update({ status: response });

      if (response === "accepted") {
        const searchPartiesRef = firestore().collection("searchParties");
        // const partyId = firestore().collection('searchParties').doc().id;
        const partyId = partyInvitation.sender; // Use sender ID as party ID

        const partyDoc = await searchPartiesRef.doc(partyId).get();

        if (!userData) {
          console.error("User data not found!");
          return;
        }

        const newMember = {
          uid: currentUser.uid,
          firstName: userData.firstName || "Unknown",
          lastName: userData.lastName || "Unknown",
        };

        if (!partyDoc.exists) {
          // If no party group exists, create one with the sender as the party leader
          await searchPartiesRef.doc(partyId).set({
            leaderUid: partyInvitation.sender,
            leaderFirstName: partyInvitation.firstName,
            leaderLastName: partyInvitation.lastName,
            members: [newMember], // Add first member
          });
        } else {
          // If party exists, add the new member to the list
          await searchPartiesRef.doc(partyId).update({
            members: firestore.FieldValue.arrayUnion(newMember),
          });
        }

        try {
          await firestore()
            .collection('users')
            .doc(currentUser.uid)
            .update({ isPartyMember: true })

          await firestore()
            .collection('users')
            .doc(partyInvitation.sender)
            .update({ isPartyLeader: true })
        } catch (error) {
          console.log("Can't update user isPartyMember or isPartyLeader", error)
        }

        navigate("SearchPartyScreen");
      }

      setPartyInvitation(null);
    } catch (error) {
      handleFirestoreError(error);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  return (
    <InvitationContext.Provider value={{ groupInvitation, friendRequests, partyInvitation, respondToPartyInvitation, modalVisible, respondToGroupInvitation, closeModal }}>
      {children}
      <Toast />
      {partyInvitation && (
        <>
          {console.log("Displaying TimedPopup for:", partyInvitation)}
          <TimedPopup
            firstName={partyInvitation.firstName}
            onAccept={() => respondToPartyInvitation(partyInvitation.id, "accepted")}
            onDecline={() => respondToPartyInvitation(partyInvitation.id, "declined")}
          />
        </>
      )}
      {modalVisible && (
        <Modal
          transparent
          animationType="fade"
          visible={modalVisible}
          onRequestClose={closeModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>Group Invitation</Text>
              <Text style={styles.modalText}>
                You have been invited to join:
              </Text>
              <View style={styles.column}>
                {/* Card Content: Activity & Location */}
                <View style={styles.cardContentActivity}>
                  <Text style={styles.cardText}>{groupInvitation?.activity}</Text>
                  <Text style={styles.cardText}>{groupInvitation?.location}</Text>
                </View>

                {/* Card Content: Date & Time */}
                <View style={styles.cardContentDate}>
                  <Text style={styles.cardText}>{groupInvitation?.fromDate}</Text>
                  <Text style={styles.cardText}>
                    {groupInvitation?.fromTime} - {groupInvitation?.toTime}
                  </Text>
                </View>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => respondToGroupInvitation(groupInvitation?.id || '', 'accepted')}
                >
                  <Text style={styles.buttonText}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.declineButton]}
                  onPress={() => respondToGroupInvitation(groupInvitation?.id || '', 'declined')}
                >
                  <Text style={styles.buttonText}>Decline</Text>
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
    // alignItems: "center"
    marginBottom: 15,
    // marginHorizontal: 50,
    // justifyContent: "space-between",
    // width: "100%"

  },
  cardContentActivity: {
    flex: 1,
    alignItems: "center",
    // marginRight: 80

  },
  cardContentDate: {
    flex: 1,
    alignItems: "center"

  },
  cardText: {
    fontSize: 16,
    // fontWeight: 'bold',
    color: 'black',
  },
});
