import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';

//Navigation
import { RootStackParamList } from '../App';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';

// AuthContext
import { useAuth } from '../context/AuthContext';
import { useGroup } from '../context/GroupContext';

type GroupNavProps = {
  route:
  | RouteProp<RootStackParamList, 'MyGroupScreen'>
  | RouteProp<RootStackParamList, 'GroupsScreen'>
  | RouteProp<RootStackParamList, 'FindOrStart'>
  | RouteProp<RootStackParamList, 'MembersHomeScreen'>

};

const GroupNav = ({ route }: GroupNavProps) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { currentUser } = useAuth();
  const [buttonText, setButtonText] = useState('Browse');
  const { currentGroupId } = useGroup();
  const { delistGroup } = useGroup();



  if (!currentUser) {
    return null;
  }

  useEffect(() => {
    if (route.name === 'GroupsScreen') {
      setButtonText('Go Back');
    } else {
      setButtonText('Browse');
    }
  }, [route]);

  const handleBrowsePress = () => {
    if (route.name === 'GroupsScreen') {
      navigation.goBack();
    } else {
      navigation.navigate('GroupsScreen');
    }
  };

  const handleDelistMyGroup = async () => {
    try {
      await delistGroup();
    } catch {
      Alert.alert('Error', 'Something went wrong.');
    }
  };


  return (
    <View style={styles.container}>
      <View style={styles.footer}>
        <View style={styles.contentRow}>
          <TouchableOpacity onPress={handleBrowsePress} style={styles.button}>
            <Text style={styles.title}>{buttonText}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('FindOrStart')}
            style={styles.button}>
            <Text style={styles.title}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelistMyGroup} style={styles.button}>
            <Text style={styles.title}>Delist</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default GroupNav;

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    // justifyContent: "flex-end",
    // backgroundColor: "blue",
    // height: 75,
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
