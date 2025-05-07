import { StyleSheet, Text, View } from 'react-native';
import React, { useEffect } from 'react';

//Firebase
import firestore from '@react-native-firebase/firestore';

//Components
import FooterGroupNav from '../components/FooterGroupNav';
import GroupChat from '../components/GroupChat';

//Context
import { useAuth } from '../context/AuthContext';
import { useGroup } from '../context/GroupContext';

const GroupChatScreen = () => {
  const { currentUser, userData } = useAuth()
  const { currentGroup, currentGroupId } = useGroup()


  useEffect(() => {
    if (!currentUser || !userData) return

    const ensureGroupChatExistsAndJoin = async () => {
      const chatRef = firestore().collection('chats').doc(currentGroupId);
      const doc = await chatRef.get();

      if (!doc.exists) {
        // 🆕 Create the chat if it doesn't exist
        const participants = [currentUser.uid];
        const participantsDetails = {
          [currentUser.uid]: {
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
          },
        };
        await chatRef.set({
          isGroup: true,
          activity: currentGroup?.activity,
          participants,
          participantsDetails,
          createdAt: firestore.FieldValue.serverTimestamp(),
          lastMessage: {
            text: '',
            createdAt: firestore.FieldValue.serverTimestamp()
          }
        });
      } else {
        // ✅ Safely add user if not already present
        await chatRef.update({
          participants: firestore.FieldValue.arrayUnion(currentUser.uid),
          [`participantsDetails.${currentUser.uid}`]: {
            firstName: userData?.firstName || '',
            lastName: userData?.lastName || '',
          },
        });
      }
    };

    if (currentGroupId && currentUser?.uid) {
      ensureGroupChatExistsAndJoin();
    }
  }, [currentGroupId, currentUser?.uid]);



  return (
    <View style={styles.container}>
      {!currentUser ? (
        <Text>Please log in to view groups.</Text>
      ) : (
        <>
          <View style={styles.chatContainer}>
            <GroupChat />
          </View>
          <View style={styles.footerContainer}>
            {/* <FooterGroupNav /> */}
          </View>
        </>
      )}
    </View>
  );

};

export default GroupChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chatContainer: {
    flex: 1,
  },
  footerContainer: {
    // height: 76,
  },
});
