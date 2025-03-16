import React, { useEffect, useState, useCallback, } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl, TouchableOpacity, Modal, TouchableWithoutFeedback, Pressable } from 'react-native';
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
import Icon2 from 'react-native-vector-icons/Feather';

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
  const [moreModalVisible, setMoreModalVisible] = useState(false)
  const [selectedUser, setSelectedUser] = useState<Friend | null>(null);

  // Simulate data loading
  useEffect(() => {
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

  const handleAddFriend = async (selectedUser: Friend | null) => {
    if (!currentUser) return
    if (!selectedUser) {
      return
    }

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
          receiver: selectedUser.uid,
          firstName: userData?.firstName || 'Unknown',
          lastName: userData?.lastName || 'Unknown',
          status: 'pending', // Default status
          createdAt: firestore.FieldValue.serverTimestamp(),
        });

      Toast.show({
        type: 'success', // 'success' | 'error' | 'info'
        text1: `Friend request sent to ${selectedUser.firstName} 🎉`,
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

  const handleViewProfile = (selectedUser: Friend | null) => {
    if (!selectedUser) {
      return
    }
  }

  const handleReportUser = (selectedUser: Friend | null) => {
    if (!selectedUser) {
      return
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
                <TouchableOpacity onPress={() => {
                  setMoreModalVisible(true)
                  setSelectedUser(owner)
                }}>
                  <Icon2 name="more-vertical" size={25} color="black" />
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
                    // <TouchableOpacity style={styles.addFriendBtn} onPress={() => addFriend(item)}>
                    //   <Icon1 name="person-add" size={20} color="black" />
                    // </TouchableOpacity>
                    <TouchableOpacity onPress={() => {
                      setMoreModalVisible(true)
                      setSelectedUser(item)
                    }}>
                      <Icon2 name="more-vertical" size={25} color="black" />
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
        </>
      )}
      {currentUser && (
        <Modal
          animationType="fade"
          transparent
          visible={moreModalVisible}
          onRequestClose={() => setMoreModalVisible(false)}>
          <TouchableWithoutFeedback onPress={() => setMoreModalVisible(false)}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalView}>
                <Pressable
                  style={styles.buttonMid}
                  onPress={() => handleViewProfile(selectedUser)}
                  android_ripple={{ color: "rgba(0, 0, 0, 0.2)", borderless: false }}>
                  <Text style={styles.buttonText}>View Profile</Text>
                </Pressable>
                { }
                {!userData?.friends?.some(friend => friend.uid === selectedUser?.uid) && (
                  <Pressable
                    style={styles.buttonTop}
                    onPress={() => handleAddFriend(selectedUser)}
                    android_ripple={{ color: "rgba(0, 0, 0, 0.2)", borderless: false }}
                  >
                    <Text style={styles.buttonText}>Add Friend</Text>
                  </Pressable>
                )}
                {userData?.isGroupLeader &&
                  <Pressable
                    style={styles.buttonBottom}
                    onPress={() => handleReportUser(selectedUser)}
                    android_ripple={{ color: "rgba(0, 0, 0, 0.2)", borderless: false }}>
                    <Text style={styles.buttonRedText}>Remove</Text>
                  </Pressable>
                }
                <Pressable
                  style={styles.buttonBottom}
                  onPress={() => handleReportUser(selectedUser)}
                  android_ripple={{ color: "rgba(0, 0, 0, 0.2)", borderless: false }}>
                  <Text style={styles.buttonRedText}>Report</Text>
                </Pressable>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}
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
  // modalView: {
  //   width: 350,
  //   padding: 20,
  //   backgroundColor: 'white',
  //   borderRadius: 20,
  //   alignItems: 'center',

  // },
  modalView: {
    width: 300,
    // padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',

  },
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

  },
  buttonTop: {
    height: 50,
    width: "100%",
    borderStartStartRadius: 10,
    borderEndStartRadius: 10,
    justifyContent: 'center',
    // backgroundColor: "#6200ea",


  },
  buttonMid: {
    height: 50,
    width: "100%",
    justifyContent: 'center',

  },
  buttonBottom: {
    height: 50,
    width: "100%",
    borderEndEndRadius: 10,
    borderStartEndRadius: 10,
    justifyContent: 'center',

  },
  buttonText: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16
  },
  buttonRedText: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
    color: "#C41E3A",
  }

});

export default MembersHomeScreen;
