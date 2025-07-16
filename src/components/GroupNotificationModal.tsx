import React, { useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, TouchableWithoutFeedback, Pressable } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useUIStore } from '../stores/uiStore';
import { useAuth } from '../context/AuthContext';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

//Types
import { GroupNotification } from '../types/invitationTypes';

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
          setNotificationMessage('');
          setNotificationModal(false);
          // setNotificationId(null);
          return;
        }

        const messages = snapshot.docs.map(doc => {
          const data = doc.data() as GroupNotification;
          const groupData = data.groupData

          const title = groupData?.activity === "Custom"
            ? `${groupData?.title} at ${groupData?.location}`
            : `${groupData?.activity} at ${groupData?.location}`;

          return {
            id: doc.id,
            message: title,
          };
        });

        if (messages.length === 1) {
          const single = messages[0];
          const data = snapshot.docs[0].data() as GroupNotification;
          const groupData = data.groupData;

          const fullMessage = groupData?.activity === "Custom"
            ? `${groupData?.title} at ${groupData?.location} was disbanded by the leader.`
            : `${groupData?.activity} at ${groupData?.location} was disbanded by the leader.`;

          setNotificationMessage(fullMessage);
          setNotificationId(single.id);
        } else {
          setNotificationMessage(messages); // List of group titles/locations
        }
        setNotificationModal(true);

      });

    return () => unsubscribe();
  }, [currentUser]);

  const handleClose = async () => {
    if (Array.isArray(notificationMessage)) {
      const batch = firestore().batch();
      notificationMessage.forEach(notif => {
        const ref = firestore().collection("groupNotifications").doc(notif.id);
        batch.update(ref, { read: true });
      });
      await batch.commit();
    } else if (notificationId) {
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
            {Array.isArray(notificationMessage) ? (
              <>
                <Text style={styles.modalText}>
                  The following groups were disbanded:
                </Text>
                {notificationMessage.map((notif, index) => (
                  <Text key={notif.id || index} style={styles.modalText}>
                    • {notif.message}
                  </Text>
                ))}
              </>
            ) : (
              <Text style={styles.modalText}>{notificationMessage}</Text>
            )}
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
    // marginBottom: verticalScale(10),
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
