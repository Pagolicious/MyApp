import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';

//Navigation
import { RootStackParamList } from '../App';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

//Context
import { useAuth } from '../context/AuthContext';
import { useGroup } from '../context/GroupContext';

//Icons
import Icon1 from 'react-native-vector-icons/Entypo';
import Icon2 from 'react-native-vector-icons/FontAwesome';
import Icon3 from 'react-native-vector-icons/AntDesign';



const FooterGroupNav = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { currentUser } = useAuth();
  const { currentGroup } = useGroup()

  if (!currentUser) {
    return null;
  }

  const handleNavigation = () => {
    if (currentGroup?.createdBy === currentUser.uid) {
      navigation.navigate('MyGroupScreen');
    } else {
      navigation.navigate('MembersHomeScreen');
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
            onPress={() => navigation.navigate('GroupChatScreen')}
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
            onPress={() => navigation.navigate('ProfileScreen')}
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
    // flex: 1,
    // justifyContent: 'flex-end',
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
    width: 120,
    borderRadius: 5,
    // borderWidth: 2,
    marginTop: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    color: 'lightgray',
    fontWeight: 'bold',
  },
});
