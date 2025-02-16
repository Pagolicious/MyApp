import { StyleSheet, Text, View, TouchableOpacity, Alert, Modal, TouchableWithoutFeedback, Pressable } from 'react-native'
import React, { useEffect, useState } from 'react'

//Firebase
import firestore from '@react-native-firebase/firestore';

//Context
import { useAuth } from '../context/AuthContext'
import { useGroup } from '../context/GroupContext'

//Services
import { navigate } from '../services/NavigationService';

interface PartyGroup {
  leaderFirstName: string;
  leaderLastName: string;
  leaderUid: string;
  members: { uid: string; firstName: string; lastName: string }[];
}

interface DelistModalProps {
  userParty?: PartyGroup | null;
}

const DelistModal: React.FC<DelistModalProps> = ({ userParty }) => {
  const { currentUser, userData } = useAuth()
  const [delistModalVisible, setDelistModalVisible] = useState(false)
  const { delistGroup } = useGroup()


  const handleDelistMyParty = async () => {
    try {

      if (!userData || !userData.isPartyLeader) {
        console.error("Only the party leader can delist the party!");
        return;
      }
      if (!userParty || !currentUser) {
        console.error("Party not found or user not signed in!");
        return;
      }
      const members = userParty?.members || [];
      await firestore()
        .collection("searchParties")
        .doc(currentUser.uid)
        .delete()

      // if (groupData && groupData.memberUids) {
      //   const notifyPromises = groupData.memberUids.map((uid: string) =>
      //     firestore().collection('users').doc(uid).update({
      //       notification: {
      //         type: 'GROUP_DELETED',
      //         message: 'Your group has been deleted by the leader.',
      //         groupId: currentGroupId,
      //         timestamp: new Date(),
      //       },
      //     })
      //   );
      //   await Promise.all(notifyPromises); // Wait for all notifications to complete
      // }

      await Promise.all(
        members.map(async (member) => {
          await firestore().collection("partyNotifications").add({
            userId: member.uid,
            message: "The party has been disbanded by the leader.",
            timestamp: firestore.FieldValue.serverTimestamp(),
          });

          // Update each member to indicate they are no longer in a party
          await firestore().collection("users").doc(member.uid).update({
            isPartyMember: false,
          });
          await firestore().collection("users").doc(currentUser.uid).update({
            isPartyLeader: false,
          });
        })
      );
      setDelistModalVisible(false);
      navigate("FindOrStart");
    } catch (error) {
      console.error("Error deleting party:", error);
      Alert.alert("Error", "Something went wrong while deleting the party.");
    }
  }

  const handleDelistMyGroup = async () => {
    try {
      setDelistModalVisible(false);
      await delistGroup();
    } catch {
      Alert.alert('Error', 'Something went wrong.');
    }
  };

  return (
    <View>
      <TouchableOpacity style={styles.leaveButton} onPress={() => setDelistModalVisible(true)}>
        <Text style={styles.leaveText}>Delist group</Text>
      </TouchableOpacity>
      {currentUser && (
        <Modal
          animationType="fade"
          transparent
          visible={delistModalVisible}
          onRequestClose={() => setDelistModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalView}>
              <TouchableOpacity
                style={styles.closeIcon}
                onPress={() => setDelistModalVisible(false)}>
                <Text style={styles.closeText}>✖</Text>
              </TouchableOpacity>

              <Text style={styles.modalTitleText}>Delist group</Text>
              <Text style={styles.modalText}>Would you like to delist the group?</Text>


              <TouchableOpacity
                style={styles.submitBtn}
                onPress={() => {
                  if (userData && userData.isPartyLeader) {
                    handleDelistMyParty()
                  } else {
                    handleDelistMyGroup()
                  }
                }}>
                <Text style={styles.submitBtnText}>Delist</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  )
}

export default DelistModal

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
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.25,
    // shadowRadius: 4,
    // elevation: 5,
    // position: 'relative', // Needed for positioning the close button
  },
  // modalDetailContainer: {
  //   width: 300,
  //   height: 120,
  //   borderRadius: 5,
  //   backgroundColor: '#F9F6EE',
  //   borderWidth: 1,
  //   borderColor: 'grey',
  // },
  // modalDetailText: {
  //   padding: 10,
  //   color: 'black',
  // },
  closeIcon: {
    position: 'absolute',
    top: 5,
    right: 15,
    padding: 5,
  },
  closeText: {
    fontSize: 24,
    color: '#888',
  },
  modalTitleText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
  },
  modalText: {
    marginTop: 20,
    fontSize: 18,
    color: 'black',
    marginBottom: 20,
  },
  submitBtn: {
    backgroundColor: 'green',
    padding: 10,
    width: 100,
    alignItems: 'center',
    borderRadius: 5,
    marginTop: 15,
  },
  submitBtnText: {
    color: 'white',
    fontWeight: 'bold',
  },
  leaveButton: {
    width: 110,
    height: 50,
    backgroundColor: "#C41E3A",
    justifyContent: "center",
    borderRadius: 10
  },
  leaveText: {
    fontSize: 15,
    color: "white",
    fontWeight: "bold",
    textAlign: "center"

  }
})
