import { StyleSheet, Text, View, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native'
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

//Hooks
import useOnlineStatus from '../../hooks/useOnlineStatus';

//Services
import { navigate } from '../../services/NavigationService';

//Icons
import Icon1 from 'react-native-vector-icons/AntDesign';

interface Friend {
  uid: string;
  firstName: string;
  lastName: string;
  isOnline: boolean;
}

const FriendScreen = () => {
  const { currentUser } = useAuth()
  const { userInGroup, currentGroup } = useGroup()
  const [userHasGroup, setUserHasGroup] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);
  // const isOnline = useOnlineStatus(currentUser.uid)
  // const route = useRoute();
  // const isOnline = useOnlineStatus();

  // const isActive = (screenName: string) => route.name === screenName;

  useEffect(() => {
    if (!currentUser) return;

    // Reference to the user's Firestore document
    const unsubscribeUser = firestore()
      .collection('users')
      .doc(currentUser.uid)
      .onSnapshot((doc) => {
        if (doc.exists) {
          const userData = doc.data();
          const friendsList = userData?.friends || [];

          // Store unsubscribe functions for each friend's listener
          const friendSubscriptions: (() => void)[] = friendsList.map((friend: Friend) =>
            firestore()
              .collection('users')
              .doc(friend.uid)
              .onSnapshot((friendDoc) => {
                if (friendDoc.exists) {
                  setFriends((prevFriends) =>
                    prevFriends.map((f) =>
                      f.uid === friend.uid
                        ? { ...f, isOnline: friendDoc.data()?.isOnline || false }
                        : f
                    )
                  );
                }
              })
          );

          // Cleanup all friend subscriptions when component unmounts
          return () => {
            friendSubscriptions.forEach((unsubscribe) => unsubscribe());
          };
        } else {
          setFriends([]);
        }
      });

    // Cleanup user subscription when component unmounts
    return () => unsubscribeUser();
  }, [currentUser]);




  useEffect(() => {
    if (currentUser) {
      setUserHasGroup(currentGroup?.createdBy === currentUser.uid);
    }
  }, [currentUser, currentGroup]);

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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigate("ProfileScreen")}>
          <Icon1 name="arrowleft" size={25} color="black" />
        </TouchableOpacity>
        <View style={styles.spacer} />

        <Text style={styles.headerText}>Friends list</Text>
        <View style={styles.spacer} />

      </View>
      <FriendNav />

      {/* <View style={styles.onlineHeader}>
        <Text style={styles.onlineText}>Online</Text>
      </View> */}
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
              <Text style={styles.nameText}>{item.firstName}</Text>
            </View>
            <Text style={{ color: item.isOnline ? 'green' : 'gray' }}>
              {item.isOnline ? '🟢 Online' : '⚪ Offline'}
            </Text>
            {/* {currentUser.uid !== item.uid &&
                <View>
                  <TouchableOpacity style={styles.inviteFriendBtn} onPress={() => inviteToGroup()}>
                    <Icon1 name="plus" size={20} color="black" />
                  </TouchableOpacity>
                </View>
              } */}
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.noFriendsText}>No friends available</Text>
        }
      />
      <View style={styles.background}>

      </View>
      {(userHasGroup || userInGroup) && <FooterGroupNav />}
      {(!userHasGroup && !userInGroup) && <FooterNav />}
    </View>
  )
}

export default FriendScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 65,
    backgroundColor: '#5f4c4c',
    padding: 15,
    alignItems: 'center',
    flexDirection: "row"
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginRight: 20,

  },
  spacer: {
    flex: 1,
  },
  background: {
    flex: 1,
    backgroundColor: "white"
  },
  // onlineHeader: {
  //   borderBottomWidth: 1,
  //   padding: 5
  // },
  // onlineText: {
  //   fontSize: 24,
  //   textAlign: "center"

  // },
  noFriendsText: {
    flex: 1,
    textAlign: "center",
    marginTop: 200,
    fontSize: 24
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
    padding: 10,
    flexDirection: "row",
  },
  row: {
    flexDirection: "row",
    alignItems: 'center',
  },
  nameText: {
    fontSize: 30,
    textAlign: "center",
    marginLeft: 15,
  },
  inviteFriendBtn: {
    backgroundColor: '#4CBB17',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
