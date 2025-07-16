import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { GiftedChat, IMessage, Bubble, Message, BubbleProps } from 'react-native-gifted-chat';
import firestore from '@react-native-firebase/firestore';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { getDatabase } from '../firebase/getDatabase';

//Components
import CustomAvatar from './CustomAvatar';

//Context
import { useAuth } from '../context/AuthContext';

//Utils
import handleFirestoreError from '../utils/firebaseErrorHandler';

//Types
import { ChatParameter } from '../types/chatTypes';

type ChatProps = {
  chatId: string;
  otherUser: {
    uid: string;
    firstName: string;
    lastName: string;
  } | null;
};


const Chat: React.FC<ChatProps> = ({ chatId, otherUser }) => {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const { currentUser, userData } = useAuth();
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);

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
    if (!otherUser) return;

    const typingRef = getDatabase()
      .ref(`typingStatus/${chatId}/${otherUser.uid}`);

    typingRef.on('value', snapshot => {
      const isTyping = snapshot.val();
      setIsTyping(!!isTyping);
    });


    return () => typingRef.off();
  }, [chatId, currentUser.uid]);

  const onSend = useCallback(
    async (newMessages: IMessage[] = []) => {
      const message = {
        ...newMessages[0],
        createdAt: firestore.FieldValue.serverTimestamp(),
        readBy: [currentUser.uid],
      };

      const chatRef = firestore().collection('chats').doc(chatId);
      getDatabase()
        .ref(`typingStatus/${chatId}/${currentUser.uid}`)
        .set(false);

      try {
        await chatRef.collection('messages').add(message);

        await chatRef.update({
          lastMessage: {
            text: message.text,
            createdAt: firestore.FieldValue.serverTimestamp(),
          }
        });
      } catch (error) {
        handleFirestoreError(error);
      }
    },
    [chatId]
  );


  const renderAvatar = (props: any) => {
    const { _id, name } = props.currentMessage.user;

    return (
      <View style={styles.avatarContainer}>
        <CustomAvatar uid={_id} firstName={name} size={30} />
      </View>
    )
  };

  const renderMessage = (props: any) => {
    const { currentMessage, previousMessage, nextMessage } = props;

    const isDifferentFromPrevious =
      previousMessage?.user?._id !== currentMessage.user?._id;

    const isDifferentFromNext =
      nextMessage?.user?._id !== currentMessage.user?._id;

    // Choose margin top or bottom depending on where the other user is
    const containerStyle = {
      marginTop: isDifferentFromPrevious ? 10 : 2,
      marginBottom: isDifferentFromNext ? 10 : 2,
    };

    if (currentMessage?.user?._id === 'system') {
      return (
        <View style={styles.systemMessageContainer}>
          <Text style={styles.systemMessageText}>{currentMessage.text}</Text>
        </View>
      );
    }

    const current = new Date(currentMessage.createdAt);
    const previous = previousMessage?.createdAt
      ? new Date(previousMessage.createdAt)
      : null;

    const diffInMinutes =
      previous && current
        ? Math.abs(current.getTime() - previous.getTime()) / 60000
        : 0;

    const showTimeSeparator = previous && diffInMinutes > 5;

    return (
      <>
        {showTimeSeparator && (
          <View style={styles.timeSeparator}>
            <Text style={styles.timeSeparatorText}>
              {current.toLocaleTimeString('sv-SE', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
              })}
            </Text>
          </View>
        )}
        <View style={containerStyle}>

          <Message {...props} />
        </View>
      </>
    );
  };

  // Custom renderBubble to show username above the message bubble
  const renderBubble = (props: BubbleProps<IMessage>) => {
    const { currentMessage, previousMessage } = props;
    const isOtherUser = currentMessage?.user?._id !== currentUser.uid;

    const isEmojiOnly = /^[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F680}-\u{1F6FF}\u2764\uFE0F\u200D]{1,5}$/u.test(
      currentMessage.text.trim()
    );

    if (isEmojiOnly) {
      return (
        <View>
          <Text style={styles.emojiOnlyText}>
            {currentMessage.text}
          </Text>
        </View>

      );
    }

    return (
      <Bubble {...props}
        wrapperStyle={{
          left: isOtherUser
            ? [styles.bubble, styles.otherUserBubble]
            : undefined,
          right: [styles.bubble, styles.currentUserBubble],
        }} />
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 70}
    >
      <GiftedChat
        messages={messages}
        onSend={(messages) => onSend(messages)}
        user={{
          _id: currentUser.uid,
          name: userData?.firstName,
        }}
        renderBubble={renderBubble}
        renderMessage={renderMessage}
        renderAvatar={renderAvatar}
        onInputTextChanged={(text: string) => {

          getDatabase()
            .ref(`typingStatus/${chatId}/${currentUser.uid}`)
            .set(text.length > 0);

          if (typingTimeout.current) {
            clearTimeout(typingTimeout.current);
          }
          typingTimeout.current = setTimeout(() => {
            getDatabase()
              .ref(`typingStatus/${chatId}/${currentUser.uid}`)
              .set(false);
          }, 5000);
        }}
        renderTime={() => null}
        renderChatFooter={() =>
          isTyping ? (
            <Text style={{ marginLeft: 15, marginBottom: 5, color: 'gray' }}>
              {otherUserName} is typing...
            </Text>
          ) : null
        }
      // isScrollToBottomEnabled={true}
      />
    </KeyboardAvoidingView>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  username: {
    fontSize: moderateScale(12),
    fontWeight: 'bold',
    marginBottom: verticalScale(2),
    marginLeft: scale(10),
    color: 'grey'
  },
  bubble: {
    maxWidth: '75%',
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(8),
    borderRadius: 16,
  },
  otherUserBubble: {
    backgroundColor: '#E0E0E0',
    padding: moderateScale(10),
    // marginVertical: verticalScale(5),
    borderRadius: 15,
  },
  currentUserBubble: {
    backgroundColor: '#007AFF',
    padding: moderateScale(10),
    // marginVertical: verticalScale(5),
    borderRadius: 15,
  },
  avatarContainer: {
    marginVertical: verticalScale(5),
  },
  systemMessageContainer: {
    alignItems: 'center',
    marginVertical: verticalScale(5),
  },
  systemMessageText: {
    fontStyle: 'italic',
    color: 'gray',
    fontSize: moderateScale(14),
  },
  readStatus: {
    fontSize: moderateScale(11),
    color: 'gray',
    textAlign: 'right',
    marginRight: scale(10),
    marginTop: verticalScale(2),
  },
  emojiOnlyText: {
    fontSize: moderateScale(40),
  },
  timeSeparator: {
    alignItems: 'center',
    marginVertical: 10,
  },
  timeSeparatorText: {
    fontSize: 11,
    color: 'gray',
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 10,
  },









});

export default Chat;
