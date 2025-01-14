import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import { Alert, Modal, View, Text, Button, StyleSheet } from 'react-native';

//Context
import { useAuth } from './AuthContext';

//Services
import { navigate } from '../services/NavigationService';

//Utils
import handleFirestoreError from '../utils/firebaseErrorHandler';

interface Group {
  id: string;
  activity: string;
  location: string;
  fromDate: string;
  fromTime: string;
  toTime: string;
  createdBy: string;
  details: string;
  members: Member[];
  applicants: Applicant[];

}

interface Member {
  uid: string;
  firstName: string;
  lastName: string;
  skillLevel: string;
}

type Applicant = {
  uid: string;
  firstName: string;
  lastName: string;
  skillLevel: string | number;
  note?: string;
};

// Define a type for the context value
interface GroupContextType {
  currentGroupId: string | undefined;
  setCurrentGroupId: (groupId: string | undefined) => void;
  currentGroup: Group | undefined;
  setCurrentGroup: (group: Group | undefined) => void;
  delistGroup: () => Promise<void>;
  notificationModal: boolean;
  notificationMessage: string | null;
  closeNotificationModal: () => void;
}

// Create the context with an initial value of undefined
const GroupContext = createContext<GroupContextType | undefined>(undefined);


// Create a provider component
export const GroupProvider = ({ children }: { children: ReactNode }) => {
  const [currentGroupId, setCurrentGroupId] = useState<string | undefined>(undefined);
  const [currentGroup, setCurrentGroup] = useState<Group | undefined>(undefined);
  const [notificationModal, setNotificationModal] = useState<boolean>(false);
  const [notificationMessage, setNotificationMessage] = useState<string | null>(null);
  const { currentUser } = useAuth();


  // Load the group from storage when the provider mounts
  useEffect(() => {
    const loadGroupData = async () => {
      try {
        // Load currentGroupId and currentGroup from AsyncStorage
        const savedGroupId = await AsyncStorage.getItem('currentGroupId');
        const savedGroup = await AsyncStorage.getItem('currentGroup');

        console.log('Saved currentGroupId from AsyncStorage:', savedGroupId); // Debugging log
        console.log('Saved currentGroup from AsyncStorage:', savedGroup); // Debugging log

        if (savedGroupId) setCurrentGroupId(savedGroupId);
        if (savedGroup) setCurrentGroup(JSON.parse(savedGroup));
      } catch (error) {
        console.error('Error loading group data from AsyncStorage:', error);
        handleFirestoreError(error)
      }
    };

    loadGroupData();
  }, []);

  useEffect(() => {
    const reloadGroupData = async () => {
      if (!currentUser) {
        console.log('No current user after login, skipping group reload.');
        setCurrentGroupId(undefined);
        setCurrentGroup(undefined);
        return;
      }

      try {
        const savedGroupId = await AsyncStorage.getItem('currentGroupId');
        const savedGroup = await AsyncStorage.getItem('currentGroup');

        console.log('Reloaded currentGroupId from AsyncStorage:', savedGroupId); // Debugging log
        console.log('Reloaded currentGroup from AsyncStorage:', savedGroup); // Debugging log

        setCurrentGroupId(savedGroupId || undefined);
        setCurrentGroup(savedGroup ? JSON.parse(savedGroup) : undefined);
      } catch (error) {
        console.error('Error reloading group data from AsyncStorage:', error);
      }
    };

    reloadGroupData();
  }, [currentUser]);


  useEffect(() => {
    if (!currentGroupId || !currentUser) {
      setCurrentGroup(undefined);
      return;
    }

    // Real-time Firestore listener for the current group
    const unsubscribe = firestore()
      .collection('groups')
      .doc(currentGroupId)
      .onSnapshot(
        (doc) => {
          if (doc.exists) {
            const updatedGroup = { id: doc.id, ...doc.data() } as Group;
            setCurrentGroup(updatedGroup);

            // Save updated group to AsyncStorage
            AsyncStorage.setItem('currentGroup', JSON.stringify(updatedGroup));
          } else {
            setCurrentGroup(undefined);
          }
        },
        (error) => {
          console.error('Error listening to group updates:', error);
          handleFirestoreError(error)
        }
      );

    // Cleanup the listener when the component unmounts or currentGroupId changes
    return () => unsubscribe();
  }, [currentGroupId, currentUser]);
  // Update the stored group whenever it changes

  const updateGroupId = async (groupId: string | undefined) => {
    setCurrentGroupId(groupId);
    if (groupId) {
      await AsyncStorage.setItem('currentGroupId', groupId);
    } else {
      await AsyncStorage.removeItem('currentGroupId');
    }
  };

  const updateGroup = async (group: Group | undefined) => {
    setCurrentGroup(group);
    try {
      if (group) {
        await AsyncStorage.setItem('currentGroup', JSON.stringify(group));
      } else {
        await AsyncStorage.removeItem('currentGroup');
      }
    } catch (error) {
      console.error('Error updating currentGroup in AsyncStorage:', error);
    }
  };


  // useEffect(() => {
  //   console.log('Loaded currentGroupId from AsyncStorage:', currentGroupId);
  // }, [currentGroupId]);



  const delistGroup = async () => {

    if (!currentGroupId) {
      Alert.alert('Error', 'No group to delist.');
      return;
    }
    try {
      // Fetch the group document
      const groupDoc = await firestore().collection('groups').doc(currentGroupId).get();
      const groupData = groupDoc.data();

      // Notify all members using `memberUids`
      if (groupData && groupData.memberUids) {
        const notifyPromises = groupData.memberUids.map((uid: string) =>
          firestore().collection('users').doc(uid).update({
            notification: {
              type: 'GROUP_DELETED',
              message: 'Your group has been deleted by the leader.',
              groupId: currentGroupId,
              timestamp: new Date(),
            },
          })
        );
        await Promise.all(notifyPromises); // Wait for all notifications to complete
      }

      // Delete the group and associated chat
      await firestore().collection('groups').doc(currentGroupId).delete();

      // Handle the chat and its sub-collections
      const chatDocRef = firestore().collection('chats').doc(currentGroupId);
      const messagesSnapshot = await chatDocRef.collection('messages').get();
      const deleteMessagesPromises = messagesSnapshot.docs.map((doc) =>
        doc.ref.delete()
      );
      await Promise.all(deleteMessagesPromises);

      // Clear the current group ID and navigate to the home screen
      updateGroup(undefined)
      updateGroupId(undefined);
      navigate('FindOrStart');

    } catch (error) {
      Alert.alert('Error', 'Something went wrong.');
      handleFirestoreError(error)
    }
  };

  // Function to trigger the notification modal
  useEffect(() => {
    if (!currentUser || !currentGroupId) return;

    const unsubscribe = firestore()
      .collection('users')
      .doc(currentUser.uid)
      .onSnapshot(
        (doc) => {
          if (!doc.exists) {
            console.warn('Document does not exist.');
            setNotificationMessage(null);
            setNotificationModal(false);
            return;
          }

          const data = doc.data();
          if (data?.notification) {
            setNotificationMessage(data.notification.message);
            setNotificationModal(true);
          } else {
            setNotificationMessage(null);
            setNotificationModal(false);
          }
        },
        (error) => {
          handleFirestoreError(error);
        }
      );

    return () => unsubscribe();
  }, [currentUser, currentGroupId]);


  // Function to close the modal
  const closeNotificationModal = async () => {
    if (!currentUser) {
      console.warn('No current user, cannot delete notifications.');
      return;
    }

    try {
      // Delete the notification from Firestore
      await firestore().collection('users').doc(currentUser.uid).update({
        notification: firestore.FieldValue.delete(), // Remove the notification field
      });

      // Close the modal and clear local state
      setNotificationModal(false);
      setNotificationMessage(null);

      navigate('FindOrStart');

      console.log('Notification deleted successfully.');
    } catch (error) {
      console.error('Error deleting notification:', error);
      Alert.alert('Error', 'Failed to delete the notification.');
    }
  };

  return (
    <GroupContext.Provider
      value={{
        currentGroupId,
        setCurrentGroupId: updateGroupId,
        currentGroup,
        setCurrentGroup: updateGroup,
        delistGroup,
        notificationModal,
        notificationMessage,
        closeNotificationModal,
      }}
    >
      {children}
      {/* Modal for displaying notifications */}
      <Modal
        visible={notificationModal}
        animationType="slide"
        transparent={true}
        onRequestClose={closeNotificationModal}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Notification</Text>
            <Text>{notificationMessage}</Text>
            <Button title="Close" onPress={closeNotificationModal} />
          </View>
        </View>
      </Modal>
    </GroupContext.Provider>
  );
};

// Custom hook for using the context
export const useGroup = () => {
  const context = useContext(GroupContext);
  if (context === undefined) {
    throw new Error('useGroup must be used within a GroupProvider');
  }
  return context;
};

// Styles for the modal
const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    width: '80%',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});
