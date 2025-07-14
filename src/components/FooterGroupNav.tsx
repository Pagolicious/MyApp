import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import React from 'react';

//Navigation
import { useRoute } from '@react-navigation/native';

//Context
import { useAuth } from '../context/AuthContext';
import { useGroupStore } from '../stores/groupStore';

//Services
import { navigate } from '../services/NavigationService';

//Icons
import Icon1 from 'react-native-vector-icons/Entypo';
import Icon2 from 'react-native-vector-icons/FontAwesome';
import Icon3 from 'react-native-vector-icons/AntDesign';
import Icon4 from 'react-native-vector-icons/FontAwesome6';



const FooterGroupNav = () => {
  const route = useRoute();
  const { currentUser } = useAuth();
  const { currentGroup } = useGroupStore()

  if (!currentUser) {
    return null;
  }

  const handleNavigation = () => {
    if (currentGroup?.createdBy.uid === currentUser.uid) {
      navigate('MyGroupScreen');
    } else {
      navigate('MembersHomeScreen');
    }
  };

  const isActive = (screenName: string) => route.name === screenName;


  return (
    <View style={styles.container}>
      <View style={styles.footer}>
        <View style={styles.contentRow}>
          <TouchableOpacity onPress={handleNavigation} style={styles.button}>
            <Icon2
              name="group"
              size={30}
              color={isActive('MyGroupScreen') || isActive('MembersHomeScreen') ? '#00BFFF' : 'lightgray'}
            />
            <Text
              style={[
                styles.title,
                isActive('MyGroupScreen') || isActive('MembersHomeScreen')
                  ? { color: '#00BFFF' }
                  : {},
              ]}>
              My Group
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigate('FindGroup')}
            style={styles.button}>
            <Icon4
              name="users-viewfinder"
              size={30}
              color={isActive('FindGroup') ? '#00BFFF' : 'lightgray'}
            />
            <Text
              style={[
                styles.title,
                isActive('FindGroup') ? { color: '#00BFFF' } : {},
              ]}>
              Browse
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigate('GroupChatScreen')}
            style={styles.button}>
            <Icon1
              name="chat"
              size={30}
              color={isActive('GroupChatScreen') ? '#00BFFF' : 'lightgray'}
            />
            <Text
              style={[
                styles.title,
                isActive('GroupChatScreen') ? { color: '#00BFFF' } : {},
              ]}>
              Group Chat
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigate('ProfileScreen')}
            style={styles.button}>
            <Icon3
              name="profile"
              size={30}
              color={isActive('ProfileScreen') ? '#00BFFF' : 'lightgray'}
            />
            <Text
              style={[
                styles.title,
                isActive('ProfileScreen') ? { color: '#00BFFF' } : {},
              ]}>
              Profile
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default FooterGroupNav;

const styles = StyleSheet.create({
  container: {

  },
  footer: {
    height: 75,
    width: '100%',
    backgroundColor: '#5f4c4c',
    justifyContent: 'center',
  },
  contentRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  button: {
    height: 75,
    width: 100,
    borderRadius: 5,
    marginTop: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    color: 'lightgray',
    fontWeight: 'bold',
  },
});
