import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React from 'react';
import { useRoute } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';

//Components
import Chat from '../components/Chat';

//Context
import { useAuth } from '../context/AuthContext';

//Services
import { navigate } from '../services/NavigationService';

//Types
import { ChatParameter, ParticipantDetails } from '../types/chatTypes';

//Icons
import Icon1 from 'react-native-vector-icons/AntDesign';

const ChatroomScreen = () => {
  const { currentUser, userData } = useAuth()
  const route = useRoute();
  const navigation = useNavigation();

  const { chatId, participantsDetails } = route.params as ChatParameter

  const getOtherUser = () => {
    if (!participantsDetails || !currentUser) return null;
    const otherUid = Object.keys(participantsDetails).find(uid => uid !== currentUser.uid);
    if (!otherUid) return null;
    return { uid: otherUid, ...participantsDetails[otherUid] };
  };

  const otherUser = getOtherUser();

  return (
    <View style={styles.container}>
      {!currentUser ? (
        <Text>Please log in to view groups.</Text>
      ) : (
        <>
          <View style={styles.chatContainer}>
            <Chat chatId={chatId} otherUser={otherUser} />
          </View>
          <View style={styles.footerContainer}>
          </View>
        </>
      )}
    </View>
  );

};

export default ChatroomScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chatContainer: {
    flex: 1,
    // marginVertical: 10
  },
  footerContainer: {
  },
});
