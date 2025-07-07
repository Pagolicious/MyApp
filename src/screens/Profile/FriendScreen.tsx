import { StyleSheet, Text, View, TouchableOpacity, FlatList, ActivityIndicator, Modal, TouchableWithoutFeedback, Pressable, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

//Firebase
import firestore from '@react-native-firebase/firestore';

//Components
import CustomAvatar from '../../components/CustomAvatar';

//Contexts
import { useAuth } from '../../context/AuthContext';
import { useGroup } from '../../context/GroupContext';

//Services
import { navigate } from '../../services/NavigationService';

//Utils
import { inviteApplicant } from '../../utils/inviteHelpers'

//Icons
import Icon1 from 'react-native-vector-icons/Feather';

//Types
import { Friend } from '../../types/userTypes';

const FriendScreen = () => {
  const { currentUser, userData } = useAuth()
  const { currentGroup, currentGroupId } = useGroup()
  const [userHasGroup, setUserHasGroup] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [moreModalVisible, setMoreModalVisible] = useState(false)
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);

  const isGroupLeader = userData?.groups?.some(
    group => group.groupId === currentGroupId && group.role === 'leader'
  );


  useEffect(() => {
    if (!currentUser) {
      setFriends([]);
      return;
    }
    // Reference to the user's Firestore document
    const unsubscribeUser = firestore()
      .collection('users')
      .doc(currentUser.uid)
      .onSnapshot((doc) => {
        if (!doc || !doc.exists) {
          console.warn("User document does not exist or was deleted.");
          setFriends([]);
          return;
        }
        const userData = doc.data();
        const friendsList = userData?.friends || [];

        setFriends(friendsList)
        // Store unsubscribe functions for each friend's listener
        const friendSubscriptions: (() => void)[] = friendsList.map((friend: Friend) =>
          firestore()
            .collection('users')
            .doc(friend.uid)
            .onSnapshot((friendDoc) => {
              if (!friendDoc || !friendDoc.exists) {
                return;
              }
              setFriends((prevFriends) =>
                prevFriends.map((f) =>
                  f.uid === friend.uid
                    ? { ...f, isOnline: friendDoc.data()?.isOnline || false }
                    : f
                )
              );

            })
        );

        // Cleanup all friend subscriptions when component unmounts
        return () => {
          friendSubscriptions.forEach((unsubscribe) => unsubscribe());
        };

      });

    // Cleanup user subscription when component unmounts
    return () => unsubscribeUser();
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      setUserHasGroup(currentGroup?.createdBy.uid === currentUser.uid);
    }
  }, [currentUser, currentGroup]);

  const handleInviteToSeacrhParty = async (friend: Friend) => {
    if (currentUser) {

      try {
        // Generate a new ID for the invitation document
        const searchPartyId = firestore().collection('searchPartyInvitation').doc().id;

        // Create the invitation document with a specific ID
        await firestore()
          .collection('searchPartyInvitation')
          .doc(searchPartyId)
          .set({
            sender: currentUser.uid,
            receiver: friend.uid,
            firstName: userData?.firstName || 'Unknown',
            lastName: userData?.lastName || 'Unknown',
            status: 'pending', // Default status
            createdAt: firestore.FieldValue.serverTimestamp(),
          });

        console.log('Search party invite sent successfully.');

      } catch (error) {
        console.error('Error sending search party invite:', error);
        Alert.alert('Error', "Couldn't invite to search party.");
      }
    }
  }

  const handleRemoveFriend = async (friend: Friend) => {
    if (!currentUser) return;

    try {

      const friendToRemove = {
        uid: friend.uid,
        firstName: friend.firstName,
        lastName: friend.lastName,
      };

      const userToRemove = {
        uid: currentUser.uid,
        firstName: userData?.firstName || 'Unknown',
        lastName: userData?.lastName || 'Unknown',
      };

      // Remove friend from current user's list
      await firestore().collection('users').doc(currentUser.uid).update({
        friends: firestore.FieldValue.arrayRemove(friendToRemove),
      });

      // Remove current user from the friend's list
      await firestore().collection('users').doc(friend.uid).update({
        friends: firestore.FieldValue.arrayRemove(userToRemove),
      });

      // Update UI instantly
      setFriends(prevFriends => prevFriends.filter(f => f.uid !== friend.uid));

      console.log("Friend removed successfully!");

    } catch (error) {
      console.error('Error removing friend:', error);
    }
  };

  const handleInviteToGroup = (selectedFriend: Friend | null) => {
    if (!currentUser) {
      Alert.alert("Error", "User is not authenticated. Please log in.");
      return;
    }

    if (!currentGroup || !currentGroupId) {
      Alert.alert('Error', 'Group not found. Please refresh the list or create a new group.');
      return;
    }

    if (!selectedFriend) {
      Alert.alert('Error', 'No friend selected.');
      return;
    }
    setMoreModalVisible(false);
    inviteApplicant(currentUser, currentGroup, currentGroupId, selectedFriend);
  };

  const viewProfile = (userId: string) => {
    navigate('ProfilePageScreen', { userId: userId })
  };


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
      <FlatList
        data={friends}
        keyExtractor={(item) => item.uid}
        renderItem={({ item }) => (
          <View style={styles.friendContainer}>
            <View style={styles.row}>
              <CustomAvatar
                uid={item.uid || 'default-uid'}
                firstName={item.firstName || 'Unknown'}
                size={60}
              />
              <Text style={styles.nameText}>{item.firstName} {item.lastName}</Text>
            </View>
            <Text style={{ color: item.isOnline ? 'green' : 'gray' }}>
              {item.isOnline ? '🟢 Online' : '⚪ Offline'}
            </Text>
            <TouchableOpacity onPress={() => {
              setMoreModalVisible(true)
              setSelectedFriend(item)
            }}>
              <Icon1 name="more-vertical" size={25} color="black" />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.noFriendsText}>No friends available</Text>
        }
      />
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
                  style={styles.buttonTop}
                  onPress={() => {
                    setMoreModalVisible(false)
                    if (selectedFriend) {
                      viewProfile(selectedFriend.uid)
                    }
                  }}
                  android_ripple={{ color: "rgba(0, 0, 0, 0.2)", borderless: false }}>
                  <Text style={styles.buttonText}>View Profile</Text>
                </Pressable>
                <Pressable
                  style={styles.buttonMid}
                  onPress={() => {
                    setMoreModalVisible(false)
                    if (selectedFriend) {
                      navigate('LabelScreen', { friend: selectedFriend });
                    }
                  }}
                  android_ripple={{ color: "rgba(0, 0, 0, 0.2)", borderless: false }}>
                  <Text style={styles.buttonText}>Add / Edit Labels</Text>
                </Pressable>
                {userData && !userData.isPartyMember &&
                  <Pressable
                    style={styles.buttonMid}
                    onPress={() => {
                      setMoreModalVisible(false)
                      if (selectedFriend) {
                        handleInviteToSeacrhParty(selectedFriend)

                      }
                    }}
                    android_ripple={{ color: "rgba(0, 0, 0, 0.2)", borderless: false }}>
                    <Text style={styles.buttonText}>Invite to search party</Text>
                  </Pressable>
                }
                <Pressable
                  style={styles.buttonMid}
                  onPress={() => setMoreModalVisible(false)}
                  android_ripple={{ color: "rgba(0, 0, 0, 0.2)", borderless: false }}>
                  <Text style={styles.buttonText}>Send message</Text>
                </Pressable>
                {isGroupLeader &&
                  <Pressable
                    style={styles.buttonMid}
                    onPress={() => handleInviteToGroup(selectedFriend)}
                    android_ripple={{ color: "rgba(0, 0, 0, 0.2)", borderless: false }}>
                    <Text style={styles.buttonText}>Invite to group</Text>
                  </Pressable>
                }
                <Pressable
                  style={styles.buttonBottom}
                  onPress={() => {
                    setMoreModalVisible(false)
                    if (selectedFriend) {
                      handleRemoveFriend(selectedFriend);
                    }
                  }}
                  android_ripple={{ color: "rgba(0, 0, 0, 0.2)", borderless: false }}>
                  <Text style={styles.buttonRedText}>Remove friend</Text>
                </Pressable>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}
      <View style={styles.background}>

      </View>
    </View>
  )
}

export default FriendScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white"
  },
  background: {
    flex: 1,
    backgroundColor: "white"
  },
  noFriendsText: {
    flex: 1,
    textAlign: "center",
    marginTop: verticalScale(200),
    fontSize: moderateScale(24)
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  friendContainer: {
    justifyContent: 'space-between',
    alignItems: "center",
    borderBottomWidth: 1,
    padding: moderateScale(10),
    flexDirection: "row",
  },
  row: {
    flexDirection: "row",
    alignItems: 'center',
  },
  nameText: {
    fontSize: moderateScale(20),
    textAlign: "center",
    marginLeft: scale(15),
  },
  inviteFriendBtn: {
    backgroundColor: '#4CBB17',
    width: scale(40),
    height: verticalScale(40),
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
    width: scale(250),
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',

  },
  buttonTop: {
    height: verticalScale(50),
    width: "100%",
    borderStartStartRadius: 10,
    borderEndStartRadius: 10,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  buttonMid: {
    height: verticalScale(50),
    width: "100%",
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  buttonBottom: {
    height: verticalScale(50),
    width: "100%",
    borderEndEndRadius: 10,
    borderStartEndRadius: 10,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  buttonText: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: moderateScale(16),
  },
  buttonRedText: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: moderateScale(16),
    color: "#C41E3A",
  }
})
