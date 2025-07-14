// import React from 'react';
// import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
// import { useGroupStore } from '../stores/groupStore';

// const GroupNotificationModal = () => {
//   const { notificationModal, notificationMessage, closeNotificationModal } = useGroupStore();

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
//   );
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

import React, { useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, TouchableWithoutFeedback, Pressable } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useUIStore } from '../stores/uiStore';
import { useAuth } from '../context/AuthContext';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

const GroupNotificationModal = () => {
  const {
    notificationModal,
    notificationMessage,
    notificationId,
    setNotificationModal,
    setNotificationMessage,
    setNotificationId,
    closeNotificationModal
  } = useUIStore();


  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = firestore()
      .collection('groupNotifications')
      .where('userId', '==', currentUser.uid)
      .where('read', '==', false)
      .orderBy('timestamp', 'desc')
      .onSnapshot((snapshot) => {
        if (snapshot.empty) {
          setNotificationMessage(null);
          setNotificationModal(false);
          setNotificationId(null);
          return;
        }

        const doc = snapshot.docs[0];
        const data = doc.data();
        setNotificationId(doc.id);
        setNotificationMessage(data.message);
        setNotificationModal(true);
      });

    return () => unsubscribe();
  }, [currentUser]);

  const handleClose = async () => {
    if (notificationId) {
      await firestore().collection("groupNotifications").doc(notificationId).update({ read: true });
    }
    closeNotificationModal();
  };

  return (
    <Modal
      visible={notificationModal}
      animationType="fade"
      transparent
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitleText}>Notification</Text>
            <Text style={styles.modalText}>{notificationMessage}</Text>
            <Pressable
              onPress={handleClose}
              style={styles.button}
              android_ripple={{ color: 'rgba(0, 0, 0, 0.2)', borderless: false }}
            >
              <Text style={styles.buttonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
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
    width: scale(320),
    padding: moderateScale(20),
    backgroundColor: 'white',
    borderRadius: 20,
    alignItems: 'center',
  },
  modalTitleText: {
    fontSize: moderateScale(24),
    fontWeight: 'bold',
    color: 'black',
  },
  modalText: {
    marginTop: verticalScale(20),
    fontSize: moderateScale(16),
    color: 'black',
    marginBottom: verticalScale(20),
    textAlign: 'center'
  },
  button: {
    backgroundColor: '#007FFF',
    padding: moderateScale(10),
    width: scale(100),
    alignItems: 'center',
    borderRadius: 5,
    marginTop: verticalScale(15),
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default GroupNotificationModal;
