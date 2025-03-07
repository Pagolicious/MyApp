import React, { useEffect, useState, useCallback, } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl, TouchableOpacity, Modal, Alert } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import Toast from 'react-native-toast-message';


//Navigation
import { NativeStackScreenProps } from '@react-navigation/native-stack';
// import { RootStackParamList } from '../App';

//Components
import GroupNav from '../components/GroupNav';
import FooterGroupNav from '../components/FooterGroupNav';
import CustomAvatar from '../components/CustomAvatar';
import DelistModal from '../components/DelistModal';
import LeaveModal from '../components/LeaveModal';

//Context
import { useAuth } from '../context/AuthContext';
import { useGroup } from '../context/GroupContext';
import { useModal } from '../context/ModalContext';

//Hooks
import { useGroupData } from '../hooks/useGroupData';

//Services
import { navigate } from '../services/NavigationService';

//Icons
import Icon1 from 'react-native-vector-icons/MaterialIcons';

// type MembersHomeScreenProps = StackScreenProps<MyGroupStackParamList, 'MembersHomeScreen'>;


interface Friend {
  uid: string;
  firstName: string;
  lastName: string;
}

const MembersHomeScreen = () => {
  const { members = [], owner } = useGroupData();
  const { currentUser, userData } = useAuth()
  const [loading, setLoading] = useState(true); // Loading state for data container
  const [refreshing, setRefreshing] = useState(false); // For pull-to-refresh
  // const { leaveModalVisible, setLeaveModalVisible } = useModal();
  // const [leaveModalVisible, setLeaveModalVisible] = useState(false)
  // const [delistModalVisible, setDelistModalVisible] = useState(false)
  const { currentGroupId, currentGroup, delistGroup } = useGroup();

  // Simulate data loading
  useEffect(() => {
    // console.log("HELOOOOOOOOO", owner, members)
    if (owner || members && members.length > 0) {
      setLoading(false); // Stop loading when both owner and members are available
    } else {
      setLoading(true); // Keep loading if either owner or members is missing
    }
  }, [owner, members]);

  // useEffect(() => {
  //   console.log("Members: ", members);
  //   console.log("Owner: ", owner);
  // }, [members, owner]);


  // Refresh logic for the data container
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setLoading(true);
    setTimeout(() => {
      setRefreshing(false);
      setLoading(false); // Reset loading after refresh
    }, 1000); // Simulate a refresh delay
  }, []);

  const addFriend = async (friend: Friend) => {
    if (currentUser) {

      // const friendToAdd = {
      //   uid: friend.uid,
      //   firstName: friend.firstName || 'Unknown',
      //   lastName: friend.lastName || 'Unknown',
      // };

      try {
        // Generate a new ID for the invitation document
        const friendRequestId = firestore().collection('friendRequests').doc().id;

        // Create the invitation document with a specific ID
        await firestore()
          .collection('friendRequests')
          .doc(friendRequestId)
          .set({
            sender: currentUser.uid,
            receiver: friend.uid,
            firstName: userData?.firstName || 'Unknown',
            lastName: userData?.lastName || 'Unknown',
            status: 'pending', // Default status
            createdAt: firestore.FieldValue.serverTimestamp(),
          });

        Toast.show({
          type: 'success', // 'success' | 'error' | 'info'
          text1: `Friend request sent to ${friend.firstName} 🎉`,
          text2: 'Waiting for approval...',
        });

        // await firestore()
        //   .collection('users')
        //   .doc(currentUser.uid)
        //   .update({
        //     friends: firestore.FieldValue.arrayUnion(friendToAdd),

        //   });

      } catch (error) {
        console.error('Error sending friend request:', error);
        Toast.show({
          type: 'error',
          text1: 'Oops!',
          text2: 'Something went wrong.',
        });
      }
    }

  }

  if (!currentUser) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.nameText}>Loading User...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* <GroupNav /> */}

      {/* {currentUser && <GroupNav />} */}
      <Toast />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : (
        <>
          {/* <Text style={styles.textTitle}>Leader</Text> */}

          <View style={styles.ownerContainer}>
            <View style={styles.row}>
              <CustomAvatar
                uid={owner?.uid || 'default-uid'}
                firstName={owner?.firstName || 'Unknown'}
                size={60}
              />
              <Text style={styles.nameText}>{owner?.firstName || 'Unknown'}</Text>
            </View>
            {currentUser.uid !== owner?.uid && owner ? (
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.addFriendBtn} onPress={() => addFriend(owner)}>
                  <Icon1 name="person-add" size={20} color="black" />
                </TouchableOpacity>
              </View>
            ) : (
              // <TouchableOpacity style={styles.leaveButton} onPress={() => setDelistModalVisible(true)}>
              //   <Text style={styles.leaveText}>Delist group</Text>
              // </TouchableOpacity>
              <DelistModal />
            )}

          </View>

          {/* <Text style={styles.textTitle}>Members</Text> */}
          <FlatList
            data={members}
            keyExtractor={(item) => item.uid}
            renderItem={({ item }) => (
              <View style={styles.memberContainer}>
                <View style={styles.row}>
                  <CustomAvatar
                    uid={item.uid || 'default-uid'}
                    firstName={item.firstName || 'Unknown'}
                    size={60}
                  />
                  <Text style={styles.nameText}>{item.firstName}</Text>
                </View>
                <View style={styles.buttonContainer}>
                  {currentUser.uid !== item.uid ? (
                    <TouchableOpacity style={styles.addFriendBtn} onPress={() => addFriend(item)}>
                      <Icon1 name="person-add" size={20} color="black" />
                    </TouchableOpacity>
                  ) : (
                    <LeaveModal />
                  )}
                </View>
              </View>
            )}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
          {/* <Modal
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
                  onPress={handleLeaveGroup}>
                  <Text style={styles.submitBtnText}>Leave</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal> */}
          {/* <Modal
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
                  onPress={handleDelistMyGroup}>
                  <Text style={styles.submitBtnText}>Delist</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal> */}
        </>
      )}

      {/* <FooterGroupNav /> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberContainer: {
    justifyContent: 'space-between',
    alignItems: "center",
    borderBottomWidth: 1,
    padding: 10,
    flexDirection: "row",

  },
  ownerContainer: {
    justifyContent: 'space-between',
    alignItems: "center",
    borderBottomWidth: 10,
    borderColor: "grey",
    padding: 10,
    flexDirection: "row",
  },
  row: {
    flexDirection: "row",
    alignItems: 'center',
    // borderWidth: 1,

  },
  nameText: {
    fontSize: 30,
    textAlign: "center",
    marginLeft: 15,
    // borderWidth: 1,
  },
  // textTitle: {
  //   fontSize: 30,
  //   textAlign: "center",
  //   borderWidth: 1,

  // },
  buttonContainer: {
    // borderWidth: 1
  },
  addFriendBtn: {
    backgroundColor: '#4CBB17',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
    // fontWeight: 'bold',
    color: 'black',
    marginBottom: 20,
  },
  // modalExtendedContent: {
  //   alignItems: 'center',
  // },
  // modalObervationText: {
  //   fontSize: 14,
  //   color: 'red',
  //   fontWeight: 'bold',
  //   marginVertical: 10,
  // },
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
    // alignItems: "center",
    justifyContent: "center",
    borderRadius: 10
  },
  leaveText: {
    fontSize: 15,
    color: "white",
    fontWeight: "bold",
    textAlign: "center"

  }

});

export default MembersHomeScreen;
