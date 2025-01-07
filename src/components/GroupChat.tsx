import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GiftedChat, IMessage, Bubble } from 'react-native-gifted-chat';
import firestore from '@react-native-firebase/firestore';

//Context
import { useAuth } from '../context/AuthContext';
import { useGroup } from '../context/GroupContext';

const GroupChat = () => {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const { currentUser, userData } = useAuth();
  const { currentGroupId } = useGroup();

  if (!currentUser) {
    console.log("User is not authenticated.");
    return;
  }

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('chats')
      .doc(currentGroupId)
      .collection('messages')
      .orderBy('createdAt', 'desc')
      .onSnapshot((snapshot) => {
        const firebaseMessages: IMessage[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            _id: doc.id,
            text: data.text || '', // Fallback for missing text
            createdAt: data.createdAt ? data.createdAt.toDate() : new Date(), // Fallback to current date if createdAt is null
            user: {
              _id: data.user?._id || 'unknown', // Fallback for missing user ID
              name: data.user?.name || 'Unknown', // Fallback for missing user name
              avatar: data.user?.avatar || undefined, // Optional avatar field
            },
          };
        });
        setMessages(firebaseMessages);
      });

    return () => unsubscribe();
  }, [currentGroupId]);

  const onSend = useCallback(
    async (newMessages: IMessage[] = []) => {
      const message = newMessages[0];
      await firestore()
        .collection('chats')
        .doc(currentGroupId)
        .collection('messages')
        .add({
          ...message,
          createdAt: firestore.FieldValue.serverTimestamp(),
        });
    },
    [currentGroupId]
  );

  // Custom renderBubble to show username above the message bubble
  const renderBubble = (props: any) => {
    const { currentMessage } = props;
    const isOtherUser = currentMessage?.user?._id !== currentUser.uid;

    return (
      <View>
        {isOtherUser && currentMessage?.user?.name && (
          <Text style={styles.username}>{currentMessage.user.name}</Text>
        )}
        <Bubble {...props}
          wrapperStyle={{
            left: isOtherUser
              ? styles.otherUserBubble // Bubble style for other users
              : undefined,
            right: styles.currentUserBubble, // Bubble style for current user
          }} />
      </View>
    );
  };

  return (
    <View style={styles.container}>

      <GiftedChat
        messages={messages}
        onSend={(messages) => onSend(messages)}
        user={{
          _id: currentUser.uid,
          name: userData?.firstName,
          // avatar: userData?.avatar, // Current user's avatar
        }}
        renderBubble={renderBubble}
        bottomOffset={70} // Add space for a bottom tab bar or other UI element
      // isTyping={true}
      />
    </View>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  username: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 2,
    marginLeft: 10, // Adjust for alignment with the message bubble
    color: 'grey'
  },
  otherUserBubble: {
    backgroundColor: '#E0E0E0', // Light grey for other user
    padding: 10,
    borderRadius: 15,
  },
  currentUserBubble: {
    backgroundColor: '#007AFF', // Blue for current user
    padding: 10,
    borderRadius: 15,
  },
});

export default GroupChat;