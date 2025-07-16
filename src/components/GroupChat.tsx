import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { GiftedChat, IMessage, Bubble, Message, BubbleProps } from 'react-native-gifted-chat';
import firestore from '@react-native-firebase/firestore';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { getDatabase } from '../firebase/getDatabase';

//Components
import CustomAvatar from './CustomAvatar';

//Context
import { useAuth } from '../context/AuthContext';

//Types
import { MessageData } from '../types/chatTypes';

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

interface ExtendedMessage extends IMessage {
  readBy?: { [uid: string]: boolean };
}

const GroupChat: React.FC<ChatProps> = ({ chatId, participantsDetails, groupId }) => {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const { currentUser, userData } = useAuth();
  // const { currentGroupId } = useGroup();
  const [isTypingUsers, setIsTypingUsers] = useState<string[]>([]);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);
  const [lastReadMessagesByUser, setLastReadMessagesByUser] = useState<Record<string, string>>({});

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
          const firebaseMessages: ExtendedMessage[] = snapshot.docs.map((doc) => {
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
              readBy: data.readBy || {},
            };

          });

          setMessages(firebaseMessages);

          const latestReadByUser: Record<string, string> = {};

          for (const msg of firebaseMessages) {
            if (!msg.readBy) continue;

            Object.entries(msg.readBy).forEach(([uid, hasRead]) => {
              if (hasRead) {
                // Always overwrite with the most recent message (we're in descending order)
                if (!latestReadByUser[uid]) {
                  latestReadByUser[uid] = String(msg._id);
                }
              }
            });
          }



          setLastReadMessagesByUser(latestReadByUser); // 👈 create this state!
        });

      return () => unsubscribe();
    }

  }, [chatId, currentUser]);

  // const getLastMessage = async () => {
  //   const messagesSnapshot = await firestore()
  //     .collection('chats')
  //     .doc(chatId)
  //     .collection('messages')
  //     .orderBy('createdAt', 'desc')
  //     .limit(1)
  //     .get();

  //   const lastMessageDoc = messagesSnapshot.docs[0];
  //   if (!lastMessageDoc) return null;

  //   return {
  //     id: lastMessageDoc.id,
  //     ...lastMessageDoc.data()
  //   } as MessageData
  // };


  useEffect(() => {
    const markLastMessageAsRead = async () => {
      const lastMessage = messages?.[0] as ExtendedMessage;
      if (!lastMessage) return;

      await firestore()
        .collection('chats')
        .doc(chatId)
        .collection('messages')
        .doc(String(lastMessage._id))
        .update({
          [`readBy.${currentUser.uid}`]: true
        });
    };

    if (messages.length > 0 && currentUser) {
      markLastMessageAsRead();
    }
  }, [messages, currentUser]);

  useEffect(() => {
    if (!chatId) return;

    const typingRef = getDatabase().ref(`typingStatus/${chatId}`);

    typingRef.on('value', (snapshot) => {
      const data = snapshot.val() || {};
      const typingUsers = Object.keys(data).filter(
        uid => uid !== currentUser.uid && data[uid]
      );
      setIsTypingUsers(typingUsers);
    });

    return () => typingRef.off();
  }, [chatId, currentUser?.uid]);


  const onSend = useCallback(
    async (newMessages: IMessage[] = []) => {
      const message = {
        ...newMessages[0],
        createdAt: firestore.FieldValue.serverTimestamp(),
      };

      const chatRef = firestore().collection('chats').doc(chatId);

      try {
        await chatRef.collection('messages').add(message);

        await chatRef.update({
          lastMessage: {
            text: message.text,
            createdAt: firestore.FieldValue.serverTimestamp(),
          }
        });
        getDatabase()
          .ref(`typingStatus/${chatId}/${currentUser.uid}`)
          .set(false);

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

    const readerAvatars = Object.entries(lastReadMessagesByUser)
      .filter(([uid, msgId]) => msgId === currentMessage._id && uid !== currentUser.uid)
      .map(([uid]) => {
        const user = participantsDetails?.[uid];
        if (!user) return null;
        return (
          <CustomAvatar
            key={uid}
            uid={uid}
            firstName={user.firstName}
            size={16}
            style={{ marginLeft: scale(1) }}
          />

        );
      });

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
          {readerAvatars.length > 0 && (
            <View style={styles.readByAvatar}>
              {readerAvatars}
            </View>
          )}
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
        }}
      />
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
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
        onInputTextChanged={(text) => {
          const db = getDatabase();
          const typingRef = db.ref(`typingStatus/${chatId}/${currentUser.uid}`);
          typingRef.set(text.length > 0);

          if (typingTimeout.current) {
            clearTimeout(typingTimeout.current);
          }

          typingTimeout.current = setTimeout(() => {
            typingRef.set(false);
          }, 5000);
        }}
        renderTime={() => null}
        renderChatFooter={() => {
          const lastMessage = messages?.[0] as ExtendedMessage
          if (!lastMessage) return null;

          const typingNames = isTypingUsers
            .map(uid => participantsDetails?.[uid]?.firstName)
            .filter(Boolean);

          const typingText =
            typingNames.length === 1
              ? `${typingNames[0]} is typing...`
              : typingNames.length > 1
                ? `${typingNames.join(', ')} are typing...`
                : null;
          return (
            <View style={{ paddingHorizontal: 12, paddingBottom: 6 }}>

              {!!typingText && (
                <Text style={styles.isTypingText}>
                  {typingText}
                </Text>
              )}
            </View>
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
  isTypingText: {
    fontStyle: 'italic',
    color: 'gray',
  },
  readByAvatar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginVertical: verticalScale(5),
    marginHorizontal: scale(7)
  }
});

export default GroupChat;
