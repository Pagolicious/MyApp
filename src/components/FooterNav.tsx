import {StyleSheet, Text, View, TouchableOpacity, Alert} from 'react-native';
import React, {useState, useEffect} from 'react';

//Navigation
import {RootStackParamList} from '../App';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

//Firebase
import firestore from '@react-native-firebase/firestore';

// AuthContext
import {useAuth} from '../context/AuthContext';

// type FooterNavProps = {
//   route: RouteProp<RootStackParamList, 'FindOrStart'> | RouteProp<RootStackParamList, 'GroupChatScreen'> | RouteProp<RootStackParamList, 'ProfileScreen'>
// }

const FooterNav = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {currentUser} = useAuth();
  // const [groupStatus, setGroupStatus] = useState({
  //   hasCreatedGroup: false,
  //   isInGroup: false,
  // });

  if (!currentUser) {
    return;
  }

  useEffect(() => {
    const checkUserGroupStatus = async () => {
      if (!currentUser) {
        return;
      }

      try {
        // Check if user has created a group
        const createdGroupSnapshot = await firestore()
          .collection('groups')
          .where('createdBy', '==', currentUser.uid)
          .get();

        const hasCreatedGroup = !createdGroupSnapshot.empty;

        // Check if user is part of any group as an applicant
        const joinedGroupSnapshot = await firestore()
          .collection('groups')
          .where('member', 'array-contains', {uid: currentUser.uid})
          .get();

        const isInGroup = !joinedGroupSnapshot.empty;

        // Update the state with the group status
        // setGroupStatus({hasCreatedGroup, isInGroup});
      } catch (error) {
        const errorMessage =
          (error as {message?: string}).message || 'An error occurred';
        Alert.alert('Error', errorMessage);
      }
    };

    checkUserGroupStatus();
  }, [currentUser]);

  return (
    <View style={styles.container}>
      <View style={styles.footer}>
        <View style={styles.contentRow}>
          <TouchableOpacity
            onPress={() => navigation.navigate('FindOrStart')}
            style={styles.button}>
            <Text style={styles.title}>Home</Text>
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

export default FooterNav;

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
