// import React, {
//   createContext,
//   useContext,
//   useState,
//   useEffect,
//   useRef,
//   ReactNode,
// } from 'react';
// import { Alert, Modal, View, Text, Pressable, StyleSheet, TouchableWithoutFeedback } from 'react-native';
// import Toast from 'react-native-toast-message';
// import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

// //Firestore
// import firestore from '@react-native-firebase/firestore';

// //Contexts
// import { useAuth } from './AuthContext';

// //Services
// import { navigate } from '../services/NavigationService';
// import {
//   listenToGroupData,
//   listenToUserGroupId,
//   disbandGroup as disbandGroupService,
// } from '../services/groupService';

// //Types
// import { Group } from '../types/groupTypes';

// //Utils
// import handleFirestoreError from '../utils/firebaseErrorHandler';

// interface GroupContextType {
//   currentGroupId: string | undefined;
//   setCurrentGroupId: (groupId: string | undefined) => void;
//   currentGroup: Group | undefined;
//   setCurrentGroup: (group: Group | undefined) => void;
//   disbandGroup: () => Promise<void>;
//   notificationModal: boolean;
//   notificationMessage: string | null;
//   closeNotificationModal: () => void;
//   userLeftManually: boolean;
//   setUserLeftManually: (value: boolean) => void;
// }

// const GroupContext = createContext<GroupContextType | undefined>(undefined);

// export const GroupProvider = ({ children }: { children: ReactNode }) => {
//   const { currentUser, userData } = useAuth();
//   const [currentGroupId, setCurrentGroupId] = useState<string | undefined>();
//   const [currentGroup, setCurrentGroup] = useState<Group | undefined>();
//   const [notificationModal, setNotificationModal] = useState(false);
//   const [notificationMessage, setNotificationMessage] = useState<string | null>(null);
//   const [notificationId, setNotificationId] = useState<string | undefined>();
//   const [userLeftManually, setUserLeftManually] = useState(false);

//   const previousGroupId = useRef<string | undefined>(undefined);

//   // const getPrimaryGroupId = (): string | undefined => {
//   //   return currentGroupId || userData?.groupId || userData?.groups?.[0]?.groupId;
//   // };

//   // 🔁 Listen for groupId changes
//   useEffect(() => {
//     if (!currentUser) return;
//     if (!userData) return

//     const unsubscribe = listenToUserGroupId(currentUser.uid, (groupId) => {
//       if (!groupId && previousGroupId.current) {
//         if (!userLeftManually) {
//           Toast.show({ type: 'info', text1: 'You have been removed from the group.' });
//           if (userData.groups.length > 0) {
//             navigate('GroupApp', { screen: 'SelectGroupScreen' });
//           } else {
//             navigate('PublicApp', { screen: 'FindOrStart' })
//           }

//         }
//         setUserLeftManually(false);
//       }
//       setCurrentGroupId(groupId);
//       previousGroupId.current = groupId;
//     });

//     return () => unsubscribe();
//   }, [currentUser, userLeftManually]);

//   useEffect(() => {
//     if (userData?.selectedGroupId) {
//       setCurrentGroupId(userData.selectedGroupId);
//     }
//   }, [userData?.selectedGroupId]);


//   // 🔁 Listen for group data changes
//   useEffect(() => {
//     if (!currentUser || !currentGroupId) {
//       setCurrentGroup(undefined);
//       return;
//     }
//     setCurrentGroup(undefined);

//     const unsubscribe = listenToGroupData(currentGroupId, setCurrentGroup);
//     return () => unsubscribe();
//   }, [currentUser, currentGroupId]);

//   // 🧨 Disband group
//   const disbandGroup = async () => {
//     if (!currentGroupId || !currentUser || !currentGroup) {
//       Alert.alert('Error', 'No group to disband or no signed user.');
//       return;
//     }

//     setUserLeftManually(true);

//     try {
//       await disbandGroupService(currentGroup, currentUser.uid);

//       const chatRef = firestore().collection('chats').doc(currentGroupId);
//       const messagesSnapshot = await chatRef.collection('messages').get();

//       const batch = firestore().batch();
//       messagesSnapshot.forEach(doc => batch.delete(doc.ref));
//       await batch.commit();

//       await chatRef.delete();

//       setCurrentGroupId(undefined);
//       setCurrentGroup(undefined);

//       // 🔁 Fetch updated user doc
//       const userRef = firestore().collection('users').doc(currentUser.uid);
//       const freshUser = await userRef.get();
//       const userGroups = freshUser.data()?.groups || [];

//       if (userGroups.length > 0) {
//         Toast.show({
//           type: 'info',
//           text1: 'Group disbanded',
//           text2: 'Please select a new group.',
//         });

//         navigate('GroupApp', { screen: 'SelectGroupScreen' });
//       } else {
//         navigate('PublicApp', { screen: 'FindOrStart' });
//         Alert.alert(userGroups.length)
//       }

//     } catch (error) {
//       Alert.alert('Error', 'Something went wrong.');
//       handleFirestoreError(error);
//     }
//   };

//   useEffect(() => {
//     if (!currentUser || !userData) return;

//     // ✅ Only proceed if currentGroupId is NOT already set
//     if (!currentGroupId) {
//       const newGroupId = userData.selectedGroupId || userData.groups?.[0]?.groupId || undefined;

//       if (newGroupId) {
//         setCurrentGroupId(newGroupId);

//         console.log("✅ User's groupId updated, navigating to MyGroupScreen...");

//         firestore()
//           .collection('chats')
//           .doc(newGroupId)
//           .collection('messages')
//           .add({
//             _id: `${Date.now()}-system`, // Unique ID
//             text: `${userData.firstName} has joined the group.`,
//             createdAt: firestore.FieldValue.serverTimestamp(),
//             user: {
//               _id: 'system',
//               name: 'System',
//             },
//             type: 'system',
//           });

//         Toast.show({
//           type: 'info',
//           text1: 'You have been added to a group!',
//           text2: 'Redirecting to MyGroupScreen...',
//         });

//         setTimeout(() => navigate("GroupApp", { screen: 'MembersHomeScreen' }), 2000);
//       }
//     }
//   }, [userData, currentUser]);


//   // 🔔 Notifications
//   useEffect(() => {
//     if (!currentUser) return;

//     const unsubscribe = firestore()
//       .collection('groupNotifications')
//       .where('userId', '==', currentUser.uid)
//       .where('read', '==', false)
//       .orderBy('timestamp', 'desc')
//       .limit(1)
//       .onSnapshot((snapshot) => {
//         if (snapshot.empty || !snapshot) {
//           setNotificationMessage(null);
//           setNotificationModal(false);
//           return;
//         }

//         const doc = snapshot.docs[0];
//         const data = doc.data();
//         setNotificationId(doc.id);
//         setNotificationMessage(data.message);
//         setNotificationModal(true);
//       });


//     return () => unsubscribe();
//   }, [currentUser]);

//   const closeNotificationModal = async () => {
//     if (notificationId) {
//       await firestore()
//         .collection("groupNotifications")
//         .doc(notificationId)
//         .update({ read: true });
//     }
//     setNotificationModal(false);
//     setNotificationMessage(null);
//     // navigate("PublicApp", { screen: 'FindOrStart' });

//   };

//   return (
//     <GroupContext.Provider
//       value={{
//         currentGroupId,
//         setCurrentGroupId,
//         currentGroup,
//         setCurrentGroup,
//         disbandGroup,
//         notificationModal,
//         notificationMessage,
//         closeNotificationModal,
//         userLeftManually,
//         setUserLeftManually,
//       }}
//     >
//       {children}
//       <Modal
//         visible={notificationModal}
//         animationType="fade"
//         transparent
//         onRequestClose={closeNotificationModal}
//       >
//         <TouchableWithoutFeedback onPress={closeNotificationModal}>

//           <View style={styles.modalOverlay}>
//             <View style={styles.modalView}>
//               <Text style={styles.modalTitleText}>Notification</Text>
//               <Text style={styles.modalText}>{notificationMessage}</Text>
//               <Pressable
//                 onPress={closeNotificationModal}
//                 style={styles.button}
//                 android_ripple={{ color: 'rgba(0, 0, 0, 0.2)', borderless: false }}
//               >
//                 <Text style={styles.buttonText}>Close</Text>
//               </Pressable>
//             </View>
//           </View>
//         </TouchableWithoutFeedback>
//       </Modal>
//     </GroupContext.Provider>
//   );
// };

// export const useGroup = () => {
//   const context = useContext(GroupContext);
//   if (!context) throw new Error('useGroup must be used within a GroupProvider');
//   return context;
// };

// const styles = StyleSheet.create({
//   modalOverlay: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//   },
//   modalView: {
//     width: scale(320),
//     padding: moderateScale(20),
//     backgroundColor: 'white',
//     borderRadius: 20,
//     alignItems: 'center',
//   },
//   modalTitleText: {
//     fontSize: moderateScale(24),
//     fontWeight: 'bold',
//     color: 'black',
//   },
//   modalText: {
//     marginTop: verticalScale(20),
//     fontSize: moderateScale(16),
//     color: 'black',
//     marginBottom: verticalScale(20),
//     textAlign: 'center'
//   },
//   button: {
//     backgroundColor: '#007FFF',
//     padding: moderateScale(10),
//     width: scale(100),
//     alignItems: 'center',
//     borderRadius: 5,
//     marginTop: verticalScale(15),
//   },
//   buttonText: {
//     color: 'white',
//     fontWeight: 'bold',
//   },
// });
