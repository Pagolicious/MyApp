import { StyleSheet, Text, View } from 'react-native';
import React, { useEffect } from 'react';
import { useRoute } from '@react-navigation/native';

//Firebase
import firestore from '@react-native-firebase/firestore';

//Components
import GroupChat from '../../components/GroupChat';
import Chat from '../../components/Chat';

//Context
import { useAuth } from '../../context/AuthContext';

const ChatroomScreen = () => {
  const { currentUser } = useAuth()
  const route = useRoute();
  const { chatId } = route.params as { chatId: string };

  return (
    <View style={styles.container}>
      {!currentUser ? (
        <Text>Please log in to view groups.</Text>
      ) : (
        <>
          <View style={styles.chatContainer}>
            <Chat chatId={chatId} />
          </View>
          <View style={styles.footerContainer}>
            {/* <FooterGroupNav /> */}
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
  },
  footerContainer: {
    // height: 76,
  },
});
