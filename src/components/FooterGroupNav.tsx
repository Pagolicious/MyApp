import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';

//Navigation
import { RootStackParamList } from '../App';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

//Context
import { useAuth } from '../context/AuthContext';
import { useGroup } from '../context/GroupContext';


const FooterGroupNav = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
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


  return (
    <View style={styles.container}>
      <View style={styles.footer}>
        <View style={styles.contentRow}>
          <TouchableOpacity onPress={handleNavigation} style={styles.button}>
            <Text style={styles.title}> My Group
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('GroupChatScreen')}
            style={styles.button}>
            <Text style={styles.title}>Group Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('ProfileScreen')}
            style={styles.button}>
            <Text style={styles.title}>Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default FooterGroupNav;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  footer: {
    height: 75,
    width: '100%',
    backgroundColor: 'grey',
    justifyContent: 'center',
  },
  contentRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  button: {
    height: 50,
    width: 100,
    borderRadius: 5,
    backgroundColor: '#C41E3A',
    marginTop: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
});
