import { StyleSheet, Text, View, TouchableOpacity, Alert, Modal, TouchableWithoutFeedback, Pressable } from 'react-native'
import React, { useState } from 'react'
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

//Firebase
import firestore from '@react-native-firebase/firestore';

//Context
import { useAuth } from '../context/AuthContext'
import { useGroupStore } from '../stores/groupStore'

//Types
import { SearchParty } from '../types/groupTypes';

//Services
import { stopListeningToGroup } from '../services/firebase/groupListener';
import { navigate } from '../services/NavigationService';

interface DisbandModalProps {
  userParty?: SearchParty | null;
}

const DisbandModal: React.FC<DisbandModalProps> = ({ userParty }) => {
  const { currentUser, userData } = useAuth()
  const [disbandModalVisible, setDisbandModalVisible] = useState(false)
  const { disbandGroup, currentGroupId, setUserLeftManually } = useGroupStore()


  const handleDisbandMyParty = async () => {
    try {

      if (!userData || !userData.isPartyLeader) {
        console.error("Only the party leader can disband the party!");
        return;
      }
      if (!userParty || !currentUser) {
        console.log(userParty)
        console.error("Party not found or user not signed in!");
        return;
      }
      const members = userParty?.members || [];
      await firestore()
        .collection("searchParties")
        .doc(currentUser.uid)
        .delete()

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
      setDisbandModalVisible(false);
    } catch (error) {
      console.error("Error deleting party:", error);
      Alert.alert("Error", "Something went wrong while deleting the party.");
    }
  }

  // const handleDisbandMyGroup = async () => {
  //   if (!currentUser) return
  //   try {
  //     setDisbandModalVisible(false);
  //     await disbandGroup(currentUser.uid);
  //   } catch {
  //     Alert.alert('Error', 'Something went wrong.');
  //   }
  // };

  const handleDisbandMyGroup = async () => {
    if (!currentUser || !currentGroupId) {
      Alert.alert('error')
      return;
    }
    if (!userData) {
      Alert.alert('error1')
      return;
    }
    console.log('1')
    try {
      console.log('2')
      setDisbandModalVisible(false);
      setUserLeftManually(true)
      stopListeningToGroup();
      await disbandGroup(currentGroupId, currentUser.uid);

      if (userData.groups.length > 0) {
        navigate('GroupApp', {
          screen: 'My Group',
          params: {
            screen: 'SelectGroupScreen'
          }
        });
      } else {
        navigate('PublicApp', { screen: 'FindOrStart' })
      }
    } catch {
      Alert.alert('Error', 'Something went wrong.');
    }
  };


  return (
    <View>
      <TouchableOpacity style={styles.leaveButton} onPress={() => setDisbandModalVisible(true)}>
        <Text style={styles.leaveText}>Disband group</Text>
      </TouchableOpacity>
      {currentUser && (
        <Modal
          animationType="fade"
          transparent
          visible={disbandModalVisible}
          onRequestClose={() => setDisbandModalVisible(false)}>
          <TouchableWithoutFeedback onPress={() => setDisbandModalVisible(false)}>

            <View style={styles.modalOverlay}>
              <View style={styles.modalView}>
                <TouchableOpacity
                  style={styles.closeIcon}
                  onPress={() => setDisbandModalVisible(false)}>
                  <Text style={styles.closeText}>✖</Text>
                </TouchableOpacity>

                <Text style={styles.modalTitleText}>Disband group</Text>
                <Text style={styles.modalText}>Would you like to disband the group?</Text>


                <TouchableOpacity
                  style={styles.submitBtn}
                  onPress={() => {
                    if (userParty) {
                      handleDisbandMyParty()
                    } else {
                      handleDisbandMyGroup()
                    }
                  }}>
                  <Text style={styles.submitBtnText}>Disband</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}
    </View>
  )
}

export default DisbandModal

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: scale(300),
    padding: moderateScale(20),
    backgroundColor: 'white',
    borderRadius: 20,
    alignItems: 'center',
  },
  closeIcon: {
    position: 'absolute',
    top: verticalScale(5),
    right: scale(15),
    padding: moderateScale(5),
  },
  closeText: {
    fontSize: 24,
    color: '#888',
  },
  modalTitleText: {
    fontSize: moderateScale(24),
    fontWeight: 'bold',
    color: 'black',
  },
  modalText: {
    marginTop: verticalScale(20),
    fontSize: moderateScale(18),
    color: 'black',
    marginBottom: verticalScale(20),
    textAlign: 'center'

  },
  submitBtn: {
    backgroundColor: 'green',
    padding: moderateScale(10),
    width: scale(100),
    alignItems: 'center',
    borderRadius: 5,
    marginTop: verticalScale(15),
  },
  submitBtnText: {
    color: 'white',
    fontWeight: 'bold',
  },
  leaveButton: {
    width: scale(120),
    height: verticalScale(50),
    backgroundColor: "#C41E3A",
    justifyContent: "center",
    borderRadius: 10
  },
  leaveText: {
    fontSize: moderateScale(15),
    color: "white",
    fontWeight: "bold",
    textAlign: "center"

  }
})
