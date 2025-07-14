import { StyleSheet, Text, View, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';

//Firebase
import firestore from '@react-native-firebase/firestore';

//Contexts
import { useAuth } from '../context/AuthContext';
import { useGroupStore } from '../stores/groupStore';

//Components
import CustomAvatar from '../components/CustomAvatar';


//Services
import { navigate } from '../services/NavigationService';

//Types
import { Friend } from '../types/userTypes';
import { ChatItem } from '../types/chatTypes';

const ChatListScreen = () => {
  const { currentUser, userData } = useAuth();
  // const { setCurrentGroupId } = useGroupStore();

  const [groupedChats, setGroupedChats] = useState<{
    groupChats: ChatItem[];
    directChats: ChatItem[];
  }>({ groupChats: [], directChats: [] });
  const [loading, setLoading] = useState(true);
  const [friends, setFriends] = useState<Friend[]>([]);


  const getOtherParticipantInfo = (item: ChatItem) => {
    const otherId = item.participants.find(uid => uid !== currentUser?.uid);
    const otherUser = item.participantsDetails?.[otherId || ''];

    return {
      uid: otherId,
      firstName: otherUser?.firstName || 'Unknown',
      lastName: otherUser?.lastName || '',
    };
  };


  const getOtherParticipantName = (item: ChatItem): string => {
    const info = getOtherParticipantInfo(item);
    return `${info.firstName} ${info.lastName}`.trim();
  };

  useEffect(() => {
    if (!currentUser?.uid) return;

    const unsubscribe = firestore()
      .collection('chats')
      .where('participants', 'array-contains', currentUser.uid)
      .orderBy('lastMessage.createdAt', 'desc')
      .onSnapshot(snapshot => {
        if (!snapshot || snapshot.empty) {
          setGroupedChats({ groupChats: [], directChats: [] });
          setLoading(false);
          return;
        }

        const chatsData: ChatItem[] = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            isGroup: data.isGroup,
            activity: data.activity,
            title: data.title,
            groupId: data.groupId,
            chatName: data.chatName,
            participants: data.participants,
            participantsDetails: data.participantsDetails,
            lastMessage: data.lastMessage,
          };
        });

        const groupChats = chatsData.filter(chat => chat.isGroup);
        const directChats = chatsData.filter(chat => !chat.isGroup);

        setGroupedChats({ groupChats, directChats });
        setLoading(false);
      }, error => {
        console.error('Firestore error:', error);
        setGroupedChats({ groupChats: [], directChats: [] });
        setLoading(false);
      });

    return () => unsubscribe();
  }, [currentUser]);

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
          // setCurrentGroupId(item.groupId);
          Alert.alert(item.groupId || 'Missing')
          navigate('GroupChatScreen', {
            chatId: item.id,
            groupId: item.groupId,
            participantsDetails: item.participantsDetails
          })

        } else {
          navigate('ChatRoomScreen', { chatId: item.id, participantsDetails: item.participantsDetails });
        }
      }}>
      <View style={styles.avatarContainer}>
        {!item.isGroup && (() => {
          const info = getOtherParticipantInfo(item);
          return (
            <CustomAvatar
              uid={info.uid || 'default-uid'}
              firstName={info.firstName}
              size={45}
            />
          );
        })()}
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.chatTitle}>
          {item.isGroup
            ? item.chatName || (item.activity === 'Custom' ? item.title : item.activity)
            : getOtherParticipantName(item)}
        </Text>
        <Text style={styles.chatSubtitle} numberOfLines={1}>
          {item.lastMessage?.text || 'No messages yet'}
        </Text>
      </View>

    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Chats</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 20 }} />
      ) : groupedChats.groupChats.length === 0 && groupedChats.directChats.length === 0 ? (
        <Text style={styles.emptyText}>You have no messages yet.</Text>
      ) : (
        <View>
          {groupedChats.groupChats.length > 0 && (
            <Text style={styles.titleText}>Group Chats</Text>
          )}
          <FlatList
            data={groupedChats.groupChats}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ padding: 10 }}
          />
          {groupedChats.directChats.length > 0 && (
            <Text style={styles.titleText}>Chats</Text>
          )}
          <FlatList
            data={groupedChats.directChats}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ padding: 10 }}
          />
          <View style={{ padding: 10 }}>
            <Text style={styles.titleTextNewChat}>Start a New Chat</Text>
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
  titleText: {
    fontWeight: 'bold',
    fontSize: 20,
    marginTop: 20,
    marginLeft: 15
  },
  titleTextNewChat: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 10,
    marginLeft: 5
  },
  chatItem: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  avatarContainer: {
  },
  textContainer: {
    marginHorizontal: 15,
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
