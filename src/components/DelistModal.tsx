import { StyleSheet, Text, View, TouchableOpacity, Alert, Modal, TouchableWithoutFeedback, Pressable } from 'react-native'
import React, { useEffect, useState } from 'react'

//Context
import { useAuth } from '../context/AuthContext'
import { useGroup } from '../context/GroupContext'

const DelistModal = () => {
  const { currentUser, userData } = useAuth()
  const [delistModalVisible, setDelistModalVisible] = useState(false)
  const { delistGroup } = useGroup()


  const handleDelistMyParty = async () => {

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
