import { StyleSheet, Text, View, TouchableOpacity, FlatList } from 'react-native'
import React, { useEffect, useState } from 'react'

//Firebase
import firestore from '@react-native-firebase/firestore';

//Components
import CustomAvatar from '../../components/CustomAvatar';

//Contexts
import { useAuth } from '../../context/AuthContext';

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
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);


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
      <View style={styles.background}>
        <View style={styles.flatListContainer}>

          <FlatList
            data={friendRequests}
            keyExtractor={(item) => item.id.toString()}
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
    </View>
  )
}

export default FriendRequestScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
  },
  requestText: {
    fontSize: 16,
  },
  avatar: {
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
