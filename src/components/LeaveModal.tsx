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

interface LeaveModalProps {
  userParty?: PartyGroup | null;
}

const LeaveModal: React.FC<LeaveModalProps> = ({ userParty }) => {
  const { currentUser, userData } = useAuth()
  const [leaveModalVisible, setLeaveModalVisible] = useState(false)
  const { currentGroup, currentGroupId, setUserLeftManually } = useGroup()


  const handleLeaveParty = async () => {
    try {

      if (!userParty || !currentUser) {
        console.error("No party data provided or user not signed in!");
        return;
      }

      const updatedMembers = userParty.members.filter((member) => member.uid !== currentUser.uid);

      if (updatedMembers.length === 0) {
        // If no members are left, delete the entire group
        await firestore().collection("searchParties").doc(userParty.leaderUid).delete();

        await firestore()
          .collection('users')
          .doc(userParty.leaderUid)
          .update({ isPartyLeader: false });

        console.log("Group deleted as no members were left.");
      } else {
        // Otherwise, just update the members list
        await firestore()
          .collection("searchParties")
          .doc(userParty.leaderUid)
          .update({ members: updatedMembers });
      }

      await firestore()
        .collection('users')
        .doc(currentUser.uid)
        .update({ isPartyMember: false });

      setLeaveModalVisible(false);

      navigate('PublicApp', { screen: 'FindOrStart' })

    } catch {
      Alert.alert('Error', 'Something went wrong.');
    }
  }

  const handleLeaveGroup = async () => {
    if (!currentUser) return;

    try {

      setUserLeftManually(true)

      await firestore()
        .collection('groups')
        .doc(currentGroupId)
        .update({
          memberUids: firestore.FieldValue.arrayRemove(currentUser?.uid),
          members: currentGroup?.members.filter((member) => member.uid !== currentUser?.uid),
        });

      await firestore()
        .collection('users')
        .doc(currentUser.uid)
        .update({
          isGroupMember: false,
          groupId: ""
        })

      setLeaveModalVisible(false);
      // await checkUserInGroup();

      // Clear group context explicitly
      // await updateGroup(undefined);
      // await updateGroupId(undefined);

      navigate('PublicApp', { screen: 'FindOrStart' })

    } catch {
      Alert.alert('Error', 'Something went wrong.');
    }
  };

  return (
    <View>
      <TouchableOpacity style={styles.leaveButton} onPress={() => setLeaveModalVisible(true)}>
        <Text style={styles.leaveText}>Leave group</Text>
      </TouchableOpacity>
      {currentUser && (
        <Modal
          animationType="fade"
          transparent
          visible={leaveModalVisible}
          onRequestClose={() => setLeaveModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalView}>
              <TouchableOpacity
                style={styles.closeIcon}
                onPress={() => setLeaveModalVisible(false)}>
                <Text style={styles.closeText}>✖</Text>
              </TouchableOpacity>

              <Text style={styles.modalTitleText}>Leave group</Text>
              <Text style={styles.modalText}>Would you like to leave the group?</Text>


              <TouchableOpacity
                style={styles.submitBtn}
                onPress={() => {
                  if (userData && userData.isPartyMember) {
                    handleLeaveParty()
                  } else {
                    handleLeaveGroup()
                  }
                }}>
                <Text style={styles.submitBtnText}>Leave</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  )
}

export default LeaveModal

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
