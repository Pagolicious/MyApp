import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { GiftedChat, IMessage, Bubble, Message } from 'react-native-gifted-chat';
import firestore from '@react-native-firebase/firestore';

//Components
import CustomAvatar from './CustomAvatar';

//Context
import { useAuth } from '../context/AuthContext';
// import { useGroup } from '../context/GroupContext';

//Utils
import handleFirestoreError from '../utils/firebaseErrorHandler';

type ChatProps = {
  chatId: string;
  groupId: string;
  participantsDetails?: {
    [uid: string]: {
      firstName: string;
      lastName: string;
    };
  };
};

const GroupChat: React.FC<ChatProps> = ({ chatId, participantsDetails, groupId }) => {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const { currentUser, userData } = useAuth();
  // const { currentGroupId } = useGroup();
  const [isTypingUsers, setIsTypingUsers] = useState<string[]>([]);


  if (!currentUser) {
    return (
      <View style={styles.container}>
        <Text>User is not authenticated. Please log in.</Text>
      </View>
    );
  }

  useEffect(() => {
    if (groupId && currentUser) {
      const unsubscribe = firestore()
        .collection('chats')
        .doc(groupId)
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
  }, [groupId, currentUser]);

  useEffect(() => {
    if (!groupId) {
      // Alert.alert('Error', 'Missing groupId!');
      return;

    }
    const typingRef = firestore()
      .collection('chats')
      .doc(groupId)
      .collection('typing');

    const unsubscribe = typingRef.onSnapshot(snapshot => {
      const typing = snapshot.docs
        .filter(doc => doc.data().isTyping && doc.id !== currentUser.uid)
        .map(doc => doc.id);
      setIsTypingUsers(typing);
    });

    return () => unsubscribe();
  }, [groupId, currentUser?.uid]);

  const onSend = useCallback(
    async (newMessages: IMessage[] = []) => {
      const message = {
        ...newMessages[0],
        createdAt: firestore.FieldValue.serverTimestamp(),
      };

      const chatRef = firestore().collection('chats').doc(groupId);

      try {
        await chatRef.collection('messages').add(message);

        // 👇 Update the lastMessage field in parent chat doc
        await chatRef.update({
          lastMessage: {
            text: message.text,
            createdAt: firestore.FieldValue.serverTimestamp(),
          }
        });
        await firestore()
          .collection('chats')
          .doc(groupId)
          .collection('typing')
          .doc(currentUser.uid)
          .set({ isTyping: false });

      } catch (error) {
        handleFirestoreError(error);
        Alert.alert(groupId, 'dawd')

      }
    },
    [groupId]
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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 70} // adjust as needed
    >

      <GiftedChat
        messages={messages}
        onSend={(messages) => onSend(messages)}
        user={{
          _id: currentUser.uid,
          name: userData?.firstName,
          // avatar: userData?.avatar
        }}
        renderBubble={renderBubble}
        renderMessage={renderMessage}
        renderAvatar={renderAvatar}
        onInputTextChanged={async (text) => {
          const typingRef = firestore()
            .collection('chats')
            .doc(groupId)
            .collection('typing')
            .doc(currentUser.uid);

          await typingRef.set({ isTyping: text.length > 0 });
        }}
        renderFooter={() => {
          if (isTypingUsers.length === 0) return null;

          const typingNames = isTypingUsers
            .map(uid => participantsDetails?.[uid]?.firstName)
            .filter(Boolean); // remove undefined/null

          const typingText =
            typingNames.length === 1
              ? `${typingNames[0]} is typing...`
              : `${typingNames.join(', ')} are typing...`;

          return (
            <Text style={{ marginLeft: 10, marginBottom: 5, color: 'gray' }}>
              {typingText}
            </Text>
          );
        }}
      />
    </KeyboardAvoidingView>

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
    marginLeft: 10,
    color: 'grey'
  },
  otherUserBubble: {
    backgroundColor: '#E0E0E0',
    padding: 10,
    borderRadius: 15,
  },
  currentUserBubble: {
    backgroundColor: '#007AFF',
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
