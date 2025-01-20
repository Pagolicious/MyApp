import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';

//Navigation
import { RootStackParamList } from '../App';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';

//Firebase
import firestore from '@react-native-firebase/firestore';

//Context
import { useAuth } from '../context/AuthContext';
import { useGroup } from '../context/GroupContext';

// Services
import { navigate } from '../services/NavigationService';

// type GroupNavProps = {
//   route:
//   | RouteProp<RootStackParamList, 'MyGroupScreen'>
//   | RouteProp<RootStackParamList, 'GroupsScreen'>
//   | RouteProp<RootStackParamList, 'FindOrStart'>
//   | RouteProp<RootStackParamList, 'MembersHomeScreen'>

// };

const GroupNav = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { currentUser } = useAuth();
  // const [buttonText, setButtonText] = useState('Browse');
  const { currentGroupId, currentGroup, checkUserInGroup } = useGroup();


  if (!currentUser) {
    return null;
  }

  // useEffect(() => {
  //   if (currentUser) {
  //     if (route.name === 'GroupsScreen') {
  //       setButtonText('Go Back');
  //     } else {
  //       setButtonText('Browse');
  //     }
  //   }
  // }, [route, currentUser]);

  // const handleBrowsePress = () => {
  //   if (route.name === 'GroupsScreen') {
  //     navigation.goBack();
  //   } else {
  //     navigation.navigate('GroupsScreen');
  //   }
  // };

  const handleLeaveGroup = async () => {
    try {

      await firestore()
        .collection('groups')
        .doc(currentGroupId)
        .update({
          memberUids: firestore.FieldValue.arrayRemove(currentUser.uid),
          members: currentGroup?.members.filter((member) => member.uid !== currentUser.uid),

        });

      await checkUserInGroup();

      // Clear group context explicitly
      // await updateGroup(undefined);
      // await updateGroupId(undefined);

      navigation.navigate('FindOrStart');

    } catch {
      Alert.alert('Error', 'Something went wrong.');
    }
  };


  return (
    <View style={styles.container}>
      {currentUser ? (
        <>
          <View style={styles.footer}>
            <View style={styles.contentRow}>
              <TouchableOpacity onPress={() => navigation.navigate('FindGroup')} style={styles.button}>
                {/* <Text style={styles.title}>{buttonText}</Text> */}
                <Text style={styles.title}>Browse</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate('FindOrStart')}
                style={styles.button}>
                <Text style={styles.title}>Request</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleLeaveGroup} style={styles.button}>
                <Text style={styles.title}>Leave</Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      ) : (
        <Text>Please log in.</Text>
      )}
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
    backgroundColor: '#5f4c4c',
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
