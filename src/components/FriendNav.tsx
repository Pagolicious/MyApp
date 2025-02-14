import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';

//Navigation
import { RootStackParamList } from '../App';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';

// AuthContext
import { useAuth } from '../context/AuthContext';
import { useGroup } from '../context/GroupContext';
import { useModal } from '../context/ModalContext';

//Services
import { navigate } from '../services/NavigationService';


// type GroupNavProps = {
//   route:
//   | RouteProp<RootStackParamList, 'MyGroupScreen'>
//   | RouteProp<RootStackParamList, 'GroupsScreen'>
//   | RouteProp<RootStackParamList, 'FindOrStart'>
//   | RouteProp<RootStackParamList, 'MembersHomeScreen'>

// };

const FriendNav = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { currentUser } = useAuth();
  // const [buttonText, setButtonText] = useState('Browse');
  // const { setDelistModalVisible, delistModalVisible } = useModal();
  // const { delistGroup } = useGroup();
  const route = useRoute();


  const isActive = (screenName: string) => route.name === screenName;

  // if (!currentUser) {
  //   return null;
  // }

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
  // if (route.name === 'GroupsScreen') {
  //   navigation.goBack();
  // } else {
  //   navigation.navigate('GroupsScreen');
  // }

  // };

  // const handleDelistMyGroup = async () => {
  //   try {
  //     await delistGroup();
  //   } catch {
  //     Alert.alert('Error', 'Something went wrong.');
  //   }
  // };


  return (
    <View style={styles.container}>
      {currentUser ? (
        <>
          <View style={styles.navbar}>
            <View style={styles.contentRow}>
              <View>
                <TouchableOpacity onPress={() => navigation.navigate('FriendScreen')} style={styles.button}>
                  {/* <Text style={styles.title}>{buttonText}</Text> */}
                  <Text style={[styles.buttonText, isActive('FriendScreen') ? { color: '#00BFFF' } : {},]}>Friends list</Text>
                </TouchableOpacity>
                <View style={[styles.activePage, isActive('FriendScreen') ? { backgroundColor: '#00BFFF' } : {},]}></View>
              </View>
              <View>
                <TouchableOpacity
                  onPress={() => navigation.navigate('FriendRequestScreen')}
                  style={styles.button}>
                  <Text style={[styles.buttonText, isActive('FriendRequestScreen') ? { color: '#00BFFF' } : {},]}>Friend requests</Text>
                </TouchableOpacity>
                <View style={[styles.activePage, isActive('FriendRequestScreen') ? { backgroundColor: '#00BFFF' } : {},]}></View>
              </View>
            </View>
          </View>
        </>
      ) : (
        <Text>Please log in.</Text>
      )}
    </View>
  );
};

export default FriendNav;

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    // justifyContent: "flex-end",
    // backgroundColor: "blue",
    // height: 75,
  },
  navbar: {
    // height: 75,
    width: '100%',
    backgroundColor: '#5f4c4c',
    justifyContent: 'center',
    // marginBottom: 15
  },
  contentRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    // borderWidth: 2,
    // width: "100%"
  },
  // leftButtons: {
  //   flexDirection: 'row',
  // },
  // rightButton: {
  //   flexDirection: 'row',
  //   justifyContent: 'flex-end',
  // },
  button: {
    height: 50,
    minWidth: "50%",
    // borderRadius: 50,
    backgroundColor: '#5f4c4c',
    // backgroundColor: 'red',

    // marginTop: 10,
    justifyContent: 'center',
    alignItems: 'center',
    // marginBottom: 8,
    // borderWidth: 2
  },
  buttonText: {
    fontSize: 16,
    color: 'lightgrey',
    fontWeight: 'bold',
  },
  leaveButtonText: {
    fontSize: 16,
    // color: '#e60023',
    color: 'lightgrey',
    fontWeight: 'bold',
  },
  activePage: {
    height: 5,
    width: "100%",
    // width: 10,
    backgroundColor: '#5f4c4c',
    // borderWidth: 5
  }
});
