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
import { ParticipantDetails } from '../types/chatTypes';

//Icons
import Icon1 from 'react-native-vector-icons/AntDesign';

const GroupChatScreen = () => {
  const { currentUser, userData } = useAuth()
  const route = useRoute();
  const navigation = useNavigation();

  const { chatId, participantsDetails, groupId } = route.params as {
    groupId: string;
    chatId: string;
    participantsDetails?: ParticipantDetails;
  };

  const handleGoBackButton = () => {
    navigation.goBack();

    // navigate('GroupApp', { screen: 'Chats' });

  };

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
  },
});
