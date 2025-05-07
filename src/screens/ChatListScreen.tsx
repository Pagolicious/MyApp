import { StyleSheet, Text, View, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';

//Firebase
import firestore from '@react-native-firebase/firestore';

//Contexts
import { useAuth } from '../context/AuthContext';

//Components
import CustomAvatar from '../components/CustomAvatar';


//Services
import { navigate } from '../services/NavigationService';

//Types
import { Friend } from '../types/userTypes';

//Icons
import Icon1 from 'react-native-vector-icons/AntDesign';

type ParticipantDetails = {
  [uid: string]: {
    firstName: string;
    lastName: string;
  };
};

type ChatItem = {
  id: string;
  isGroup: boolean;
  activity?: string;
  chatName?: string;
  participants: string[];
  participantsDetails: ParticipantDetails;
  lastMessage?: {
    text: string;
    createdAt: any; // or use FirebaseFirestoreTypes.Timestamp
  };
};


const ChatListScreen = () => {
  const { currentUser, userData } = useAuth();
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [friends, setFriends] = useState<Friend[]>([]);

  const getOtherParticipantName = (item: ChatItem): string => {
    const otherId = item.participants.find(uid => uid !== currentUser?.uid);
    const otherUser = (item as ChatItem).participantsDetails?.[otherId || ''];

    if (otherUser?.firstName) {
      return `${otherUser.firstName} ${otherUser.lastName}`;
    }

    return 'Direct Chat';
  };

  // const handleGoBackButton = () => {
  //   if (!userData) return;
  //   if (userData.isGroupLeader || userData.isGroupMember) {
  //     navigate('GroupApp', { screen: 'Profile' });
  //   } else {
  //     navigate('PublicApp', { screen: 'Profile' });
  //   }
  // };

  useEffect(() => {
    if (!currentUser?.uid) return;

    const unsubscribe = firestore()
      .collection('chats')
      .where('participants', 'array-contains', currentUser.uid)
      .orderBy('lastMessage.createdAt', 'desc')
      .onSnapshot(snapshot => {
        if (!snapshot || snapshot.empty) {
          setChats([]);
          setLoading(false);
          return;
        }

        const chatsData: ChatItem[] = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            isGroup: data.isGroup,
            activity: data.activity,
            chatName: data.chatName,
            participants: data.participants,
            participantsDetails: data.participantsDetails,
            lastMessage: data.lastMessage,
          };
        });

        setChats(chatsData);
        setLoading(false);
      }, error => {
        console.error('Firestore error:', error);
        setChats([]);
        setLoading(false);
      });

    return () => unsubscribe();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) {
      setFriends([]); // Clear friends list on logout
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

  const handleStartChatWithFriend = async (friend: Friend) => {
    if (!currentUser) return

    const chatQuery = await firestore()
      .collection('chats')
      .where('isGroup', '==', false)
      .where('participants', 'array-contains', currentUser.uid)
      .get();

    // Check if chat with this friend already exists
    const existingChat = chatQuery.docs.find(doc => {
      const participants = doc.data().participants;
      return participants.includes(friend.uid) && participants.length === 2;
    });

    if (existingChat) {
      navigate('ChatRoomScreen', { chatId: existingChat.id });
    } else {

      const participants = [currentUser.uid, friend.uid];

      const participantsDetails = {
        [currentUser.uid]: {
          firstName: userData?.firstName || '',
          lastName: userData?.lastName || '',
        },
        [friend.uid]: {
          firstName: friend.firstName || '',
          lastName: friend.lastName || '',
        },
      };
      const newChat = await firestore().collection('chats').add({
        isGroup: false,
        participants,
        participantsDetails,
        createdAt: firestore.FieldValue.serverTimestamp(),
        lastMessage: {
          text: '',
          createdAt: firestore.FieldValue.serverTimestamp()
        }
      });
      navigate('ChatRoomScreen', { chatId: newChat.id });
    }
  };



  const renderItem = ({ item }: { item: ChatItem }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => {
        if (item.isGroup) {
          // navigate('GroupChatScreen', { chatId: item.id });
          navigate('GroupChatScreen')

        } else {
          navigate('ChatRoomScreen', { chatId: item.id });
        }
      }}>
      <Text style={styles.chatTitle}>
        {item.isGroup ? item.chatName || `Group Chat - ${item.activity}` : getOtherParticipantName(item)}
      </Text>
      <Text style={styles.chatSubtitle} numberOfLines={1}>
        {item.lastMessage?.text || 'No messages yet'}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* <TouchableOpacity onPress={handleGoBackButton}>
          <Icon1 name="arrowleft" size={25} color="white" />
        </TouchableOpacity> */}
        {/* <View style={styles.spacer} /> */}
        <Text style={styles.headerText}>Chats</Text>
        {/* <View style={styles.spacer} /> */}
      </View>

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 20 }} />
      ) : chats.length === 0 ? (
        <Text style={styles.emptyText}>You have no messages yet.</Text>
      ) : (
        <View>
          <Text style={{ fontWeight: 'bold', fontSize: 20, marginTop: 20, marginLeft: 15 }}>Group Chats</Text>
          <FlatList
            data={chats}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ padding: 10 }}
          />
          <View style={{ padding: 10 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 10, marginLeft: 5 }}>Start a New Chat</Text>
            {friends.map(friend => (
              <View key={friend.uid} style={styles.friendCard}>
                <View style={styles.friendInfo}>
                  <CustomAvatar
                    uid={friend.uid || 'default-uid'}
                    firstName={friend.firstName || 'Unknown'}
                    size={42}
                  />
                  <Text style={styles.friendName}>{friend.firstName} {friend.lastName}</Text>
                </View>
                <TouchableOpacity
                  style={styles.startChatButton}
                  onPress={() => handleStartChatWithFriend(friend)}
                >
                  <Text style={{ color: 'white' }}>Start Conversation</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

        </View>
      )}
    </View>
  );
};

export default ChatListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    height: 65,
    backgroundColor: "#5f4c4c",
    padding: 15,
    alignItems: "center",
    // flexDirection: "row",
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginRight: 20,
  },
  spacer: {
    flex: 1,
  },
  chatItem: {
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  chatTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 4,
  },
  chatSubtitle: {
    color: "#666",
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 30,
    color: "#888",
    fontSize: 16,
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ccc',
    marginRight: 10,
  },
  friendName: {
    fontSize: 16,
    marginLeft: 15
  },
  startChatButton: {
    backgroundColor: '#0554F2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 5,
  }

});
