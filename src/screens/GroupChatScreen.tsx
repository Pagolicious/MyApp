import { StyleSheet, Text, View } from 'react-native';
import React from 'react';

//Components
import FooterGroupNav from '../components/FooterGroupNav';
import GroupChat from '../components/GroupChat';

const GroupChatScreen = () => {
  return (
    <View style={styles.container}>
      <View style={styles.chatContainer}>
        <GroupChat />
      </View>
      <View style={styles.footerContainer}>
        <FooterGroupNav />
      </View>
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
