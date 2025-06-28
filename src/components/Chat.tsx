import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { GiftedChat, IMessage, Bubble, Message } from 'react-native-gifted-chat';
import firestore from '@react-native-firebase/firestore';

//Components
import CustomAvatar from './CustomAvatar';

//Context
import { useAuth } from '../context/AuthContext';

//Utils
import handleFirestoreError from '../utils/firebaseErrorHandler';

type ChatProps = {
  chatId: string;
  participantsDetails?: {
    [uid: string]: {
      firstName: string;
      lastName: string;
    };
  };
};

const Chat: React.FC<ChatProps> = ({ chatId, participantsDetails }) => {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const { currentUser, userData } = useAuth();
  const [isTyping, setIsTyping] = useState(false);

  const getOtherUser = () => {
    if (!participantsDetails || !currentUser) return null;
    const otherUid = Object.keys(participantsDetails).find(uid => uid !== currentUser.uid);
    if (!otherUid) return null;
    return { uid: otherUid, ...participantsDetails[otherUid] };
  };

  const otherUser = getOtherUser();
  const otherUserName = otherUser?.firstName || 'Someone';


  if (!currentUser) {
    return (
      <View style={styles.container}>
        <Text>User is not authenticated. Please log in.</Text>
      </View>
    );
  }

  useEffect(() => {
    if (chatId && currentUser) {
      const unsubscribe = firestore()
        .collection('chats')
        .doc(chatId)
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
              readBy: data.readBy || []
            };
          });
          setMessages(firebaseMessages);
        });

      return () => unsubscribe();
    }
  }, [chatId, currentUser]);

  useEffect(() => {
    if (!chatId || !currentUser?.uid) return;

    const markMessagesAsRead = async () => {
      const snapshot = await firestore()
        .collection('chats')
        .doc(chatId)
        .collection('messages')
        .where('readBy', 'not-in', [currentUser.uid])
        .get();

      const batch = firestore().batch();
      snapshot.docs.forEach(doc => {
        batch.update(doc.ref, {
          readBy: firestore.FieldValue.arrayUnion(currentUser.uid)
        });
      });

      await batch.commit();
    };

    markMessagesAsRead();
  }, [chatId, currentUser?.uid]);


  useEffect(() => {
    const otherUser = getOtherUser();
    if (!otherUser) return;

    const typingRef = firestore()
      .collection('chats')
      .doc(chatId)
      .collection('typing')
      .doc(otherUser.uid);

    const unsubscribe = typingRef.onSnapshot(doc => {
      const data = doc.data();
      setIsTyping(data?.isTyping || false);
    });

    return () => unsubscribe();
  }, [chatId, currentUser.uid]);

  const onSend = useCallback(
    async (newMessages: IMessage[] = []) => {
      const message = {
        ...newMessages[0],
        createdAt: firestore.FieldValue.serverTimestamp(),
        readBy: [currentUser.uid],
      };

      const chatRef = firestore().collection('chats').doc(chatId);
      const typingRef = firestore()
        .collection('chats')
        .doc(chatId)
        .collection('typing')
        .doc(currentUser.uid);

      try {
        await chatRef.collection('messages').add(message);

        // 👇 Update the lastMessage field in parent chat doc
        await chatRef.update({
          lastMessage: {
            text: message.text,
            createdAt: firestore.FieldValue.serverTimestamp(),
          }
        });
        await typingRef.set({ isTyping: false });

      } catch (error) {
        handleFirestoreError(error);
      }
    },
    [chatId]
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

    // For all others, render the default GiftedChat message
    return <Message {...props} />;
  };

  // Custom renderBubble to show username above the message bubble
  const renderBubble = (props: any) => {
    const { currentMessage } = props;
    const isOtherUser = currentMessage?.user?._id !== currentUser.uid;

    const readBy = currentMessage?.readBy || [];

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
        {currentMessage.user._id === currentUser.uid && readBy.length > 1 && (
          <Text style={styles.readStatus}>Read</Text>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 70}
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
            .doc(chatId)
            .collection('typing')
            .doc(currentUser.uid);

          await typingRef.set({ isTyping: text.length > 0 });
        }}
        renderFooter={() =>
          isTyping ? (
            <Text style={{ marginLeft: 10, marginBottom: 5, color: 'gray' }}>
              {otherUserName} is typing...
            </Text>
          ) : null
        }
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
  },
  readStatus: {
    fontSize: 11,
    color: 'gray',
    textAlign: 'right',
    marginRight: 10,
    marginTop: 2,
  },


});

export default Chat;
