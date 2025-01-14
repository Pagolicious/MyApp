import { StyleSheet, Text, View } from 'react-native';
import React from 'react';

//Components
import FooterGroupNav from '../components/FooterGroupNav';
import GroupChat from '../components/GroupChat';

//Context
import { useAuth } from '../context/AuthContext';

const GroupChatScreen = () => {
  const { currentUser } = useAuth()
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
            <FooterGroupNav />
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
    height: 76,
  },
});
