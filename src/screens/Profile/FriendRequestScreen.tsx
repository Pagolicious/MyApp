import { StyleSheet, Text, View, TouchableOpacity, FlatList, Pressable, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import LinearGradient from 'react-native-linear-gradient';

//Firebase
import firestore from '@react-native-firebase/firestore';

//Components
import FooterGroupNav from '../../components/FooterGroupNav';
import FooterNav from '../../components/FooterNav';
import FriendNav from '../../components/FriendNav';
import CustomAvatar from '../../components/CustomAvatar';

//Contexts
import { useAuth } from '../../context/AuthContext';
import { useGroup } from '../../context/GroupContext';

//Services
import { navigate } from '../../services/NavigationService';

//Icons
import Icon1 from 'react-native-vector-icons/AntDesign';

interface FriendRequest {
  id: string;
  groupId: string;
  sender: string;
  receiver: string;
  firstName: string;
  lastName: string;
  status: 'pending' | 'accepted' | 'rejected';
}

const FriendRequestScreen = () => {
  const { currentUser, userData } = useAuth()
  const { currentGroup } = useGroup()
  const [userHasGroup, setUserHasGroup] = useState(false);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);

  useEffect(() => {
    if (currentUser) {
      setUserHasGroup(currentGroup?.createdBy.uid === currentUser.uid);
    }
  }, [currentUser, currentGroup]);

  useEffect(() => {
    if (!currentUser) return;

    const fetchFriendRequests = async () => {
      try {
        const snapshot = await firestore()
          .collection('friendRequests')
          .where('receiver', '==', currentUser.uid)
          .where('status', '==', 'pending')
          .get();

        const requests: FriendRequest[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        } as FriendRequest));
        setFriendRequests(requests);
      } catch (error) {
        console.error('Error fetching friend requests:', error);
      }
    };

    fetchFriendRequests();
  }, [currentUser]);

  const handleAcceptRequest = async (requestId: string, senderId: string, senderFirstName: string, senderLastName: string) => {
    if (!currentUser) return;

    try {
      const friendToAdd = {
        uid: senderId,
        firstName: senderFirstName || 'Unknown',
        lastName: senderLastName || 'Unknown',
      };

      const userToAdd = {
        uid: currentUser.uid,
        firstName: userData?.firstName || 'Unknown',
        lastName: userData?.lastName || 'Unknown',
      };

      // Add friend to current user's friend list
      await firestore().collection('users').doc(currentUser.uid).update({
        friends: firestore.FieldValue.arrayUnion(friendToAdd),
      });

      // Add current user to sender's friend list
      await firestore().collection('users').doc(senderId).update({
        friends: firestore.FieldValue.arrayUnion(userToAdd),
      });

      // // Remove the friend request document from Firestore
      // await firestore().collection('friendRequests').doc(requestId).delete();

      // Update friend request to accepted in the Firestore collection
      await firestore().collection('friendRequests').doc(requestId).update({
        status: 'accepted',
      });

      // Remove the request from UI
      setFriendRequests(prev => prev.filter(req => req.id !== requestId));

      console.log("Friend added successfully!");

    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };


  const handleRejectRequest = async (requestId: string) => {
    try {
      await firestore().collection('friendRequests').doc(requestId).update({
        status: 'rejected',
      });
      setFriendRequests(prev => prev.filter(req => req.id !== requestId)); // Remove from UI
    } catch (error) {
      console.error('Error rejecting friend request:', error);
    }
  }


  return (
    <View style={styles.container}>
      {/* <FriendNav /> */}
      <View style={styles.background}>
        <View style={styles.flatListContainer}>

          <FlatList
            data={friendRequests}
            keyExtractor={(item) => item.id.toString()} // Ensure each item has a unique key
            renderItem={({ item }) => {

              return (
                <View style={styles.requestCard}>
                  <View style={styles.topRow}>

                    <View style={styles.avatar}>
                      <CustomAvatar
                        uid={item.receiver || 'default-uid'}
                        firstName={item.firstName || 'Unknown'}
                        size={70}
                      />
                    </View>
                    <Text style={styles.requestText}>
                      {item.firstName} {item.lastName} sent you a friend request.
                    </Text>
                  </View>
                  <View style={styles.bottomRow}>
                    <TouchableOpacity
                      style={styles.acceptButton}
                      onPress={() => handleAcceptRequest(item.id, item.sender, item.firstName, item.lastName)}
                    >
                      <Text style={styles.buttonText}>Accept</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.rejectButton}
                      onPress={() => handleRejectRequest(item.id)}
                    >
                      <Text style={styles.buttonText}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )
            }}
            ListEmptyComponent={
              <Text style={styles.noApplicantsText}>No friend requests available</Text>
            }
          />
        </View>
      </View>
      {/* {(userHasGroup || userInGroup) && <FooterGroupNav />}
      {(!userHasGroup && !userInGroup) && <FooterNav />} */}
    </View>
  )
}

export default FriendRequestScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // header: {
  //   height: 65,
  //   backgroundColor: '#5f4c4c',
  //   padding: 15,
  //   alignItems: 'center',
  //   flexDirection: "row"
  // },
  // headerText: {
  //   fontSize: 20,
  //   fontWeight: 'bold',
  //   color: 'white',
  //   marginRight: 20,

  // },
  // spacer: {
  //   flex: 1,
  // },
  background: {
    flex: 1,
    backgroundColor: "white"
  },
  flatListContainer: {
    marginTop: 10
  },
  noApplicantsText: {
    flex: 1,
    textAlign: "center",
    marginTop: 200,
    fontSize: 24
  },
  requestCard: {
    backgroundColor: "lightgrey",
    padding: 15,
    borderRadius: 10,
    margin: 15
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    // alignItems: "center",
  },
  requestText: {
    fontSize: 16,
    // fontWeight: "bold"
    // borderWidth: 2
  },
  avatar: {
    // borderWidth: 2
  },
  acceptButton: {
    backgroundColor: "green",
    padding: 10,
    borderRadius: 5,
    marginRight: 15
  },
  rejectButton: {
    backgroundColor: "red",
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
})
