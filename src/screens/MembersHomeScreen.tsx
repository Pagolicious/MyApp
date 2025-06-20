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
import DisbandModal from '../components/DisbandModal';
import LeaveModal from '../components/LeaveModal';

//Context
import { useAuth } from '../context/AuthContext';
import { useGroup } from '../context/GroupContext';
import { useModal } from '../context/ModalContext';

//Hooks
// import { useGroupData } from '../hooks/useGroupData';

//Services
import { navigate } from '../services/NavigationService';

//Icons
import Icon1 from 'react-native-vector-icons/MaterialIcons';
import Icon2 from 'react-native-vector-icons/Feather';

//Types
import { Friend } from '../types/userTypes';

// type MembersHomeScreenProps = StackScreenProps<MyGroupStackParamList, 'MembersHomeScreen'>;


// interface Friend {
//   uid: string;
//   firstName: string;
//   lastName: string;
// }

const MembersHomeScreen = () => {
  // const { members = [], owner } = useGroupData();
  const { currentGroupId, currentGroup, disbandGroup } = useGroup();
  const members = currentGroup?.members ?? [];
  const { currentUser, userData } = useAuth()
  const [loading, setLoading] = useState(true); // Loading state for data container
  const [refreshing, setRefreshing] = useState(false); // For pull-to-refresh
  // const { leaveModalVisible, setLeaveModalVisible } = useModal();
  // const [leaveModalVisible, setLeaveModalVisible] = useState(false)
  // const [disbandModalVisible, setdisbandModalVisible] = useState(false)
  const [moreModalVisible, setMoreModalVisible] = useState(false)
  const [selectedUser, setSelectedUser] = useState<Friend | null>(null);
  // const [ownerUser, setOwnerUser] = useState<any>(null);

  useEffect(() => {
    setLoading(!(currentGroup?.members?.length || currentGroup?.createdBy));
  }, [currentGroup]);


  // useEffect(() => {
  //   if (!currentGroup?.createdBy) return;
  //   const fetchOwner = async () => {
  //     const ownerDoc = await firestore().collection('users').doc(currentGroup.createdBy).get();
  //     if (ownerDoc.exists) {
  //       setOwnerUser({ uid: ownerDoc.id, ...ownerDoc.data() });
  //     }
  //   };
  //   fetchOwner();
  // }, [currentGroup?.createdBy]);


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


  const handleViewProfile = (selectedUser: Friend | null) => {
    if (!selectedUser) {
      return
    }
  }

  const handleAddFriend = async (selectedUser: Friend | null) => {
    if (!currentUser) return
    if (!selectedUser) {
      return
    }

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

    } catch (error) {
      console.error('Error sending friend request:', error);
      Toast.show({
        type: 'error',
        text1: 'Oops!',
        text2: 'Something went wrong.',
      });
    }


  }

  const handleSendMessage = (selectedUser: Friend | null) => {
    if (!selectedUser) {
      return
    }
  }

  const handleRemoveUser = async (selectedUser: Friend | null) => {
    if (!selectedUser) {
      return
    }
    try {
      await firestore()
        .collection('groups')
        .doc(currentGroupId)
        .update({
          memberUids: firestore.FieldValue.arrayRemove(selectedUser.uid),
          members: currentGroup?.members.filter((member) => member.uid !== selectedUser.uid),
        });

      await firestore()
        .collection('users')
        .doc(selectedUser.uid)
        .update({
          isGroupMember: false,
          groupId: ""
        })

      // Also remove the user from the corresponding group chat
      await firestore()
        .collection('chats')
        .doc(currentGroupId)
        .update({
          participants: firestore.FieldValue.arrayRemove(selectedUser.uid),
          [`participantsDetails.${selectedUser.uid}`]: firestore.FieldValue.delete()
        });


      // setLeaveModalVisible(false);
      // await checkUserInGroup();

      // Clear group context explicitly
      // await updateGroup(undefined);
      // await updateGroupId(undefined);

      // navigate('PublicApp', { screen: 'FindOrStart' })
      setMoreModalVisible(false)
    } catch (error) {
      console.log('Error', 'Something went wrong.', error);
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
      {/* <Toast /> */}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : (
        <>
          {/* <View style={styles.ownerContainer}>
            <View style={styles.row}>
              <CustomAvatar
                uid={ownerUser?.uid || 'default-uid'}
                firstName={ownerUser?.firstName || 'Unknown'}
                size={60}
              />
              <Text style={styles.nameText}>{ownerUser?.firstName || 'Unknown'}</Text>
            </View>
            {currentUser.uid !== ownerUser?.uid ? (
              <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={() => {
                  setMoreModalVisible(true)
                  setSelectedUser(ownerUser)
                }}>
                  <Icon2 name="more-vertical" size={25} color="black" />
                </TouchableOpacity>
              </View>
            ) : (
              <DisbandModal />
            )}

          </View> */}

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
                  ) : currentUser.uid === currentGroup?.createdBy.uid ? (
                    <DisbandModal />
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
                {!userData?.friends?.some(friend => friend.uid === selectedUser?.uid) ? (
                  <Pressable
                    style={styles.buttonTop}
                    onPress={() => handleAddFriend(selectedUser)}
                    android_ripple={{ color: "rgba(0, 0, 0, 0.2)", borderless: false }}
                  >
                    <Text style={styles.buttonText}>Add Friend</Text>
                  </Pressable>
                ) : (
                  <Pressable
                    style={styles.buttonTop}
                    onPress={() => handleSendMessage(selectedUser)}
                    android_ripple={{ color: "rgba(0, 0, 0, 0.2)", borderless: false }}
                  >
                    <Text style={styles.buttonText}>Send Message</Text>
                  </Pressable>
                )}
                {userData?.isGroupLeader &&
                  <Pressable
                    style={styles.buttonBottom}
                    onPress={() => handleRemoveUser(selectedUser)}
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
