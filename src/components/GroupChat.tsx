import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GiftedChat, IMessage, Bubble, Message } from 'react-native-gifted-chat';
import firestore from '@react-native-firebase/firestore';

//Components
import CustomAvatar from './CustomAvatar';

//Context
import { useAuth } from '../context/AuthContext';
import { useGroup } from '../context/GroupContext';

//Utils
import handleFirestoreError from '../utils/firebaseErrorHandler';

const GroupChat = () => {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const { currentUser, userData } = useAuth();
  const { currentGroupId } = useGroup();

  if (!currentUser) {
    return (
      <View style={styles.container}>
        <Text>User is not authenticated. Please log in.</Text>
      </View>
    );
  }

  useEffect(() => {
    if (currentGroupId && currentUser) {
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
              text: data.text || '',
              createdAt: data.createdAt
                ? data.createdAt.toDate()
                : new Date(),
              user: {
                _id: data.user?._id || 'unknown',
                name: data.user?.name || 'Unknown',
                avatar: data.user?.avatar || undefined,
              },
            };
          });
          setMessages(firebaseMessages);
        });

      return () => unsubscribe();
    }
  }, [currentGroupId, currentUser]);


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

  const renderAvatar = (props: any) => {
    const { _id, name } = props.currentMessage.user;

    return <CustomAvatar uid={_id} firstName={name} size={30} />;
  };

  const renderMessage = (props: any) => {
    const { currentMessage } = props;

    if (currentMessage?.user?._id === 'system') {
      return (
        <View style={styles.systemMessageContainer}>
          <Text style={styles.systemMessageText}>{currentMessage.text}</Text>
        </View>
      );
    }

    // ✅ For all others, render the default GiftedChat message
    return <Message {...props} />;
  };






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
        renderMessage={renderMessage}
        bottomOffset={70} // Add space for a bottom tab bar or other UI element
        renderAvatar={renderAvatar}
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
  systemMessageContainer: {
    alignItems: 'center',
    marginVertical: 5,
  },
  systemMessageText: {
    fontStyle: 'italic',
    color: 'gray',
    fontSize: 14,
  }

});

export default GroupChat;
