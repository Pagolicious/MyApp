import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import { Alert, Modal, View, Text, Button, StyleSheet, Pressable } from 'react-native';
import Toast from 'react-native-toast-message'; // ✅ Import if not already

//Context
import { useAuth } from './AuthContext';

//Services
import { navigate } from '../services/NavigationService';

//Utils
import handleFirestoreError from '../utils/firebaseErrorHandler';

interface Group {
  id: string;
  activity: string;
  title?: string;
  location: string;
  fromDate: string;
  fromTime: string;
  toTime: string;
  toDate: string;
  skillvalue: number;
  createdBy: string;
  memberLimit: number;
  details: string;
  isDelisted: boolean;
  members: Member[];
  memberUids: string[];
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
  disbandGroup: () => Promise<void>;
  notificationModal: boolean;
  notificationMessage: string | null;
  closeNotificationModal: () => void;
  userLeftManually: boolean;
  setUserLeftManually: (value: boolean) => void;
  // userInGroup: boolean | undefined;
  // setUserInGroup: (inGroup: boolean | undefined) => void;
  // checkUserInGroup: () => Promise<void>;
  // clearGroupData: () => Promise<void>;
}

// Create the context with an initial value of undefined
const GroupContext = createContext<GroupContextType | undefined>(undefined);


// Create a provider component
export const GroupProvider = ({ children }: { children: ReactNode }) => {
  const [currentGroupId, setCurrentGroupId] = useState<string | undefined>(undefined);
  const [currentGroup, setCurrentGroup] = useState<Group | undefined>(undefined);
  const [notificationModal, setNotificationModal] = useState<boolean>(false);
  const [notificationMessage, setNotificationMessage] = useState<string | null>(null);
  // const [userInGroup, setUserInGroup] = useState<boolean | undefined>(undefined);
  const [notificationId, setLatestNotificationId] = useState<string | undefined>(undefined);
  const [groupNotifications, setGroupNotifications] = useState()
  const { currentUser, userData } = useAuth();
  const [userLeftManually, setUserLeftManually] = useState(false);


  // const getStorageKey = (key: string, userId: string) => `${userId}_${key}`;

  // Load the group from storage when the provider mounts

  // const loadGroupData = async () => {
  //   try {
  //     // Load currentGroupId and currentGroup from AsyncStorage
  //     const savedGroupId = await AsyncStorage.getItem('currentGroupId');
  //     const savedGroup = await AsyncStorage.getItem('currentGroup');
  //     const savedUserInGroupString = await AsyncStorage.getItem('userInGroup');

  //     console.log('Saved currentGroupId from AsyncStorage:', savedGroupId); // Debugging log
  //     console.log('Saved currentGroup from AsyncStorage:', savedGroup); // Debugging log

  //     if (savedGroupId) setCurrentGroupId(savedGroupId);
  //     if (savedGroup) setCurrentGroup(JSON.parse(savedGroup));
  //     if (savedUserInGroupString) setUserInGroup(JSON.parse(savedUserInGroupString));

  //   } catch (error) {
  //     console.error('Error loading group data from AsyncStorage:', error);
  //     handleFirestoreError(error)
  //   }
  // };

  // const loadGroupData = async () => {
  //   if (!currentUser) {
  //     return
  //   }
  //   const groupIdKey = getStorageKey('currentGroupId', currentUser.uid);
  //   const groupKey = getStorageKey('currentGroup', currentUser.uid);
  //   const userInGroupKey = getStorageKey('userInGroup', currentUser.uid)

  //   const savedGroupId = await AsyncStorage.getItem(groupIdKey);
  //   const savedGroup = await AsyncStorage.getItem(groupKey);
  //   const savedUserInGroup = await AsyncStorage.getItem(userInGroupKey);

  //   console.log("📌 Loaded groupId from AsyncStorage:", savedGroupId);


  //   setCurrentGroupId(savedGroupId ? savedGroupId : undefined);
  //   setCurrentGroup(savedGroup ? JSON.parse(savedGroup) : undefined);
  //   setUserInGroup(savedUserInGroup ? JSON.parse(savedUserInGroup) : undefined);
  // };


  // useEffect(() => {
  //   loadGroupData();
  // }, []);

  // useEffect(() => {
  //   const reloadGroupData = async () => {
  //     if (!currentUser) {
  //       console.log('No current user after login, skipping group reload.');
  //       setCurrentGroupId(undefined);
  //       setCurrentGroup(undefined);
  //       setUserInGroup(undefined);
  //       return;
  //     }
  //     await loadGroupData()

  //   };

  //   reloadGroupData();
  // }, [currentUser]);


  // useEffect(() => {
  //   if (!currentGroupId || !currentUser) {

  //     console.log("No currentGroupId or currentUser, setting currentGroup to undefined");

  //     setCurrentGroup(undefined);
  //     return;
  //   }

  //   console.log("Listening for group updates in Firestore...");

  //   const groupKey = getStorageKey('currentGroup', currentUser.uid);

  //   // Real-time Firestore listener for the current group
  //   const unsubscribe = firestore()
  //     .collection('groups')
  //     .doc(currentGroupId)
  //     .onSnapshot(
  //       (doc) => {
  //         if (doc.exists) {
  //           const updatedGroup = { id: doc.id, ...doc.data() } as Group;
  //           setCurrentGroup(updatedGroup);

  //           // Save updated group to AsyncStorage
  //           AsyncStorage.setItem(groupKey, JSON.stringify(updatedGroup));
  //         } else {
  //           setCurrentGroup(undefined);
  //         }
  //       },
  //       (error) => {
  //         console.error('Error listening to group updates:', error);
  //         handleFirestoreError(error)
  //       }
  //     );

  //   // Cleanup the listener when the component unmounts or currentGroupId changes
  //   return () => unsubscribe();
  // }, [currentGroupId, currentUser]);
  // // Update the stored group whenever it changes

  // const updateGroupId = async (groupId: string | undefined) => {
  //   if (!currentUser) return;
  //   const key = getStorageKey('currentGroupId', currentUser.uid);

  //   setCurrentGroupId(groupId);
  //   if (groupId) {
  //     await AsyncStorage.setItem(key, groupId);
  //   } else {
  //     await AsyncStorage.removeItem(key);
  //   }
  // };

  // const updateGroup = async (group: Group | undefined) => {
  //   if (!currentUser) return;
  //   const key = getStorageKey('currentGroup', currentUser.uid);
  //   setCurrentGroup(group);
  //   try {
  //     if (group) {
  //       await AsyncStorage.setItem(key, JSON.stringify(group));
  //     } else {
  //       await AsyncStorage.removeItem(key);
  //     }
  //   } catch (error) {
  //     console.error('Error updating currentGroup in AsyncStorage:', error);
  //   }
  // };

  // const updateUserInGroup = async (inGroup: boolean | undefined) => {
  //   if (!currentUser) return;
  //   const key = getStorageKey('userInGroup', currentUser.uid);
  //   setUserInGroup(inGroup);
  //   try {
  //     if (inGroup !== undefined) {
  //       await AsyncStorage.setItem(key, JSON.stringify(inGroup));
  //     } else {
  //       await AsyncStorage.removeItem(key);
  //     }
  //   } catch (error) {
  //     console.error('Error updating userInGroup in AsyncStorage:', error);
  //   }
  // };

  // 🔥 **Listen for changes in `userData.groupId` instead of AsyncStorage**
  useEffect(() => {
    if (!currentUser) return;

    const userDocRef = firestore().collection('users').doc(currentUser.uid);
    const unsubscribe = userDocRef.onSnapshot((doc) => {
      if (doc.exists) {
        const userData = doc.data();
        const groupId = userData?.groupId || undefined;
        setCurrentGroupId(groupId);

        // ✅ Automatically navigate if user is removed from group
        if (!groupId) {
          if (userLeftManually) {
            setUserLeftManually(false);
          } else {
            Toast.show({
              type: 'info',
              text1: 'You have been removed from the group.',
            });
          }

          navigate('PublicApp', { screen: 'FindOrStart' });
        }

      } else {
        setCurrentGroupId(undefined);
      }
    });

    return () => unsubscribe();
  }, [currentUser]);


  // 🔥 **Listen for changes in `currentGroupId` to get Group Data**
  useEffect(() => {
    if (!currentUser) return;
    if (!currentGroupId) {
      setCurrentGroup(undefined);
      return;
    }

    const groupDocRef = firestore().collection('groups').doc(currentGroupId);
    const unsubscribe = groupDocRef.onSnapshot(
      (doc) => {
        if (doc.exists) {
          setCurrentGroup({ id: doc.id, ...doc.data() } as Group);
        } else {
          setCurrentGroup(undefined);
        }
      },
      (error) => {
        console.error('Error fetching group data:', error);
        handleFirestoreError(error);
      }
    );

    return () => unsubscribe();
  }, [currentGroupId, currentUser]);

  // const checkUserInGroup = async () => {
  //   if (!currentUser || !currentUser.uid) {
  //     console.log('Skipping user group check due to missing currentUser.');
  //     return;
  //   }
  //   try {
  //     const memberInGroup = await firestore()
  //       .collection('groups')
  //       .where('memberUids', 'array-contains', currentUser.uid)
  //       .get();

  //     const isInGroup = !memberInGroup.empty;
  //     await updateUserInGroup(isInGroup); // Update state and save to AsyncStorage
  //   } catch (error) {
  //     console.error('Error checking user in group:', error);
  //   }
  // };


  // useEffect(() => {
  //   console.log('Loaded currentGroupId from AsyncStorage:', currentGroupId);
  // }, [currentGroupId]);

  // const clearGroupData = async () => {
  //   if (!currentUser) {
  //     console.warn('No current user; cannot clear group data.');
  //     return;
  //   }
  //   try {
  //     // Generate user-specific keys
  //     // const groupIdKey = getStorageKey('currentGroupId', currentUser.uid);
  //     // const groupKey = getStorageKey('currentGroup', currentUser.uid);
  //     // const userInGroupKey = getStorageKey('userInGroup', currentUser.uid);

  //     // Remove all user-specific group data from AsyncStorage
  //     // await AsyncStorage.multiRemove([groupIdKey, groupKey, userInGroupKey]);

  //     setCurrentGroupId(undefined);
  //     setCurrentGroup(undefined);
  //     // setUserInGroup(undefined);
  //   } catch (error) {
  //     console.error('Error clearing group data:', error);
  //   }
  // };

  const disbandGroup = async () => {

    if (!currentGroupId || !currentUser) {
      Alert.alert('Error', 'No group to disband or no signed user.');
      return;
    }
    try {
      // Fetch the group document
      const groupData = currentGroup || (await firestore().collection('groups').doc(currentGroupId).get()).data();

      await firestore().collection("users").doc(currentUser.uid).update({
        isGroupLeader: false,
        groupId: ""
      });

      // Notify all members using `memberUids`
      if (groupData && groupData.memberUids) {
        await Promise.all(
          groupData.members.map(async (member: Member) => {
            firestore().collection("groupNotifications").add({
              userId: member.uid,
              type: "GROUP_DELETED",
              message: "Your group has been deleted by the leader.",
              groupId: currentGroupId,
              timestamp: firestore.FieldValue.serverTimestamp(),
              read: false, // Mark as unread
            })
            await firestore().collection("users").doc(member.uid).update({
              isGroupMember: false,
              groupId: ""
            });

          })
        )
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

      // Clear state
      // await clearGroupData();
      setCurrentGroupId(undefined);
      setCurrentGroup(undefined);

      // await updateGroup(undefined);
      // await updateGroupId(undefined);
      // await updateUserInGroup(false); // User is no longer in a group
      navigate('PublicApp', { screen: 'FindOrStart' });

    } catch (error) {
      Alert.alert('Error', 'Something went wrong.');
      handleFirestoreError(error)
    }
  };

  // Function to trigger the notification modal
  // useEffect(() => {
  //   if (!currentUser || !currentGroupId) return;

  //   const unsubscribe = firestore()
  //     .collection('users')
  //     .doc(currentUser.uid)
  //     .onSnapshot(
  //       (doc) => {
  //         if (!doc.exists) {
  //           console.warn('Document does not exist.');
  //           setNotificationMessage(null);
  //           setNotificationModal(false);
  //           return;
  //         }

  //         const data = doc.data();
  //         if (data?.notification) {
  //           setNotificationMessage(data.notification.message);
  //           setNotificationModal(true);
  //         } else {
  //           setNotificationMessage(null);
  //           setNotificationModal(false);
  //         }
  //       },
  //       (error) => {
  //         handleFirestoreError(error);
  //       }
  //     );

  //   return () => unsubscribe();
  // }, [currentUser, currentGroupId]);

  useEffect(() => {
    if (!currentUser) {
      console.log("🚨 No current user found!");
      return;
    }

    console.log("🔍 Listening for notifications for user:", currentUser.uid);

    const unsubscribe = firestore()
      .collection("groupNotifications")
      .where("userId", "==", currentUser.uid)
      .where("read", "==", false)
      .orderBy("timestamp", "desc")
      .limit(1)
      .onSnapshot(
        (snapshot) => {
          console.log("📌 Firestore Snapshot Size:", snapshot.size);

          if (!snapshot || snapshot.empty) {
            console.log("🚨 No unread notifications found.");
            setNotificationMessage(null);
            setNotificationModal(false);
            return;
          }

          // ✅ Get the latest notification document and its ID
          const latestNotificationDoc = snapshot.docs[0];
          const latestNotification = latestNotificationDoc.data();
          const notificationId = latestNotificationDoc.id; // ✅ Get correct Firestore document ID

          console.log("✅ Latest Notification:", latestNotification, "ID:", notificationId);

          setLatestNotificationId(notificationId);
          setNotificationMessage(latestNotification.message);
          setNotificationModal(true);


        },
        (error) => {
          console.error("🚨 Firestore onSnapshot Error:", error);
        }
      );

    return () => unsubscribe();
  }, [currentUser]);




  // Function to close the modal
  const closeNotificationModal = async () => {
    if (!currentUser) {
      console.warn('No current user, cannot delete notifications.');
      return;
    }

    if (!notificationId) {
      console.warn('No notificationId found, skipping Firestore update.');
      setNotificationModal(false);
      setNotificationMessage(null);
      navigate('FindOrStart');
      return;
    }

    try {
      await firestore()
        .collection("groupNotifications")
        .doc(notificationId)
        .update({ read: true });

      // await clearGroupData();
      // setCurrentGroupId(undefined);
      // setCurrentGroup(undefined);

      console.log("✅ Notification marked as read.");
    } catch (error) {
      console.error("🚨 Error marking notification as read:", error);
    }
    // Delete the notification from Firestore
    // await firestore().collection('users').doc(currentUser.uid).update({
    //   notification: firestore.FieldValue.delete(), // Remove the notification field
    // });

    // Close the modal and clear local state
    setNotificationModal(false);
    setNotificationMessage(null);


    navigate("PublicApp", { screen: 'FindOrStart' })
  };

  useEffect(() => {
    if (!currentUser || !userData) return;

    const newGroupId = userData.groupId || undefined;

    // ✅ First, update state before checking navigation
    if (newGroupId !== currentGroupId) {
      setCurrentGroupId(newGroupId);

      if (newGroupId) {
        console.log("✅ User's groupId updated, navigating to MyGroupScreen...");

        Toast.show({
          type: 'info',
          text1: 'You have been added to a group!',
          text2: 'Redirecting to MyGroupScreen...',
        });

        // ✅ Delay navigation by 2 seconds
        setTimeout(() => navigate("GroupApp", { screen: 'MembersHomeScreen' })
          , 2000);
      }
    }
  }, [userData]);



  return (
    <GroupContext.Provider
      value={{
        currentGroupId,
        setCurrentGroupId,
        currentGroup,
        setCurrentGroup,
        disbandGroup,
        notificationModal,
        notificationMessage,
        closeNotificationModal,
        userLeftManually,
        setUserLeftManually,
        // userInGroup,
        // setUserInGroup,
        // checkUserInGroup, // Add this to allow other components to trigger updates
        // clearGroupData
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
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitleText}>Notification</Text>
            <Text style={styles.modalText}>{notificationMessage}</Text>
            <Pressable
              onPress={closeNotificationModal}
              style={styles.button}
              android_ripple={{ color: "rgba(0, 0, 0, 0.2)", borderless: false }}>
              <Text style={styles.buttonText}>Close</Text>
            </Pressable>
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: 350,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    alignItems: 'center',
  },
  modalTitleText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
  },
  modalText: {
    marginTop: 20,
    fontSize: 16,
    color: 'black',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007FFF',
    padding: 10,
    width: 100,
    alignItems: 'center',
    borderRadius: 5,
    marginTop: 15,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
