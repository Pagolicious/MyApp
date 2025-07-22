import { StyleSheet, Text, View, TouchableOpacity, } from 'react-native';
import React from 'react';
import { useRoute } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';

//Components
import GroupChat from '../components/GroupChat';

//Context
import { useAuth } from '../context/AuthContext';

//Services
import { navigate } from '../services/NavigationService';

//Types
import { GroupChatParameter, ParticipantDetails } from '../types/chatTypes';

//Icons
import Icon1 from 'react-native-vector-icons/AntDesign';

const GroupChatScreen = () => {
  const { currentUser, userData } = useAuth()
  const route = useRoute();
  const navigation = useNavigation();

  const { chatId, participantsDetails, groupId, activity, title, chatName } = route.params as GroupChatParameter

  return (
    <View style={styles.container}>
      {!currentUser ? (
        <Text>Please log in to view groups.</Text>
      ) : (
        <>
          <View style={styles.chatContainer}>
            <GroupChat chatId={chatId} groupId={groupId} participantsDetails={participantsDetails} />
          </View>
          <View style={styles.footerContainer}>
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
  },
});
