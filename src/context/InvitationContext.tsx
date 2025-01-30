import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert, Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import firestore from '@react-native-firebase/firestore';

//Navigation
import { navigate } from '../services/NavigationService';

//Context
import { useAuth } from './AuthContext';
import { useGroup } from './GroupContext';

//Utils
import handleFirestoreError from '../utils/firebaseErrorHandler';

interface Member {
  uid: string;
  firstName: string;
  lastName: string;
  skillLevel: string;
}

interface Invitation {
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

interface InvitationContextType {
  invitation: Invitation | null;
  modalVisible: boolean;
  respondToInvitation: (invitationId: string, response: 'accepted' | 'declined') => Promise<void>;
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
  const { currentUser } = useAuth();
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const { checkUserInGroup } = useGroup();

  useEffect(() => {
    if (!currentUser) {
      setInvitation(null);
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
              const data = doc.data() as Omit<Invitation, 'id'>;
              setInvitation({ id: doc.id, ...data });
              setModalVisible(true);
            });
          } else {
            setInvitation(null);
          }
        },
        (error) => {
          handleFirestoreError(error);
        }
      );

    return () => unsubscribe();
  }, [currentUser]);


  const respondToInvitation = async (invitationId: string, response: 'accepted' | 'declined'): Promise<void> => {
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
      const groupRef = firestore().collection('groups').doc(invitation?.groupId);
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

        await checkUserInGroup();

        navigate("MembersHomeScreen")

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

      setInvitation(null);
    } catch (error) {
      handleFirestoreError(error);
    }

  };

  const closeModal = () => {
    setModalVisible(false);
  };

  return (
    <InvitationContext.Provider value={{ invitation, modalVisible, respondToInvitation, closeModal }}>
      {children}
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
                  <Text style={styles.cardText}>{invitation?.activity}</Text>
                  <Text style={styles.cardText}>{invitation?.location}</Text>
                </View>

                {/* Card Content: Date & Time */}
                <View style={styles.cardContentDate}>
                  <Text style={styles.cardText}>{invitation?.fromDate}</Text>
                  <Text style={styles.cardText}>
                    {invitation?.fromTime} - {invitation?.toTime}
                  </Text>
                </View>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => respondToInvitation(invitation?.id || '', 'accepted')}
                >
                  <Text style={styles.buttonText}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.declineButton]}
                  onPress={() => respondToInvitation(invitation?.id || '', 'declined')}
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
