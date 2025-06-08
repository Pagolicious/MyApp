import { StyleSheet, Text, View, TouchableOpacity, } from 'react-native';
import React, { useEffect, } from 'react';
import { useRoute } from '@react-navigation/native';

//Firebase
import firestore from '@react-native-firebase/firestore';

//Components
import FooterGroupNav from '../components/FooterGroupNav';
import GroupChat from '../components/GroupChat';

//Context
import { useAuth } from '../context/AuthContext';
import { useGroup } from '../context/GroupContext';

//Services
import { navigate } from '../services/NavigationService';

//Types
import { ParticipantDetails } from '../types/chatTypes';

//Icons
import Icon1 from 'react-native-vector-icons/AntDesign';

const GroupChatScreen = () => {
  const { currentUser, userData } = useAuth()
  const route = useRoute();
  const { chatId, participantsDetails } = route.params as {
    chatId: string;
    participantsDetails?: ParticipantDetails;
  };

  const handleGoBackButton = () => {
    if (!userData) return;
    if (userData.isGroupLeader || userData.isGroupMember) {
      navigate('GroupApp', { screen: 'Chats' });
    } else {
      navigate('PublicApp', { screen: 'Chats' });
    }
  };


  // useEffect(() => {
  //   if (!currentUser || !userData) return

  //   const ensureGroupChatExistsAndJoin = async () => {
  //     const chatRef = firestore().collection('chats').doc(currentGroupId);
  //     const doc = await chatRef.get();

  //     if (!doc.exists) {
  //       // 🆕 Create the chat if it doesn't exist
  //       const participants = [currentUser.uid];
  //       const participantsDetails = {
  //         [currentUser.uid]: {
  //           firstName: userData.firstName || '',
  //           lastName: userData.lastName || '',
  //         },
  //       };
  //       await chatRef.set({
  //         isGroup: true,
  //         activity: currentGroup?.activity,
  //         participants,
  //         participantsDetails,
  //         createdAt: firestore.FieldValue.serverTimestamp(),
  //         lastMessage: {
  //           text: '',
  //           createdAt: firestore.FieldValue.serverTimestamp()
  //         }
  //       });
  //     } else {
  //       // ✅ Safely add user if not already present
  //       await chatRef.update({
  //         participants: firestore.FieldValue.arrayUnion(currentUser.uid),
  //         [`participantsDetails.${currentUser.uid}`]: {
  //           firstName: userData?.firstName || '',
  //           lastName: userData?.lastName || '',
  //         },
  //       });
  //     }
  //   };

  //   if (currentGroupId && currentUser?.uid) {
  //     ensureGroupChatExistsAndJoin();
  //   }
  // }, [currentGroupId, currentUser?.uid]);



  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBackButton}>
          <Icon1 name="arrowleft" size={25} color="white" />
        </TouchableOpacity>
        <View style={styles.spacer} />
        <Text style={styles.headerText}>Chat</Text>
        <View style={styles.spacer} />
      </View>
      {!currentUser ? (
        <Text>Please log in to view groups.</Text>
      ) : (
        <>
          <View style={styles.chatContainer}>
            <GroupChat chatId={chatId} participantsDetails={participantsDetails} />
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
  header: {
    height: 65,
    backgroundColor: "#5f4c4c",
    padding: 15,
    alignItems: "center",
    flexDirection: "row",
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
  chatContainer: {
    flex: 1,
  },
  footerContainer: {
    // height: 76,
  },
});
