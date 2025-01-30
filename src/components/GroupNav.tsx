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

const GroupNav = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { currentUser } = useAuth();
  // const [buttonText, setButtonText] = useState('Browse');
  const { setDelistModalVisible, delistModalVisible } = useModal();
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
              <View style={styles.leftButtons}>
                <View>
                  <TouchableOpacity onPress={() => navigation.navigate('FindGroup')} style={styles.button}>
                    {/* <Text style={styles.title}>{buttonText}</Text> */}
                    <Text style={[styles.buttonText, isActive('FindGroup') ? { color: '#00BFFF' } : {},]}>Browse</Text>
                  </TouchableOpacity>
                  <View style={[styles.activePage, isActive('FindGroup') ? { backgroundColor: '#00BFFF' } : {},]}></View>
                </View>
                <View>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('FindGroup')}
                    style={styles.button}>
                    <Text style={[styles.buttonText, isActive('GroupsScreen') ? { color: '#00BFFF' } : {},]}>Edit</Text>
                  </TouchableOpacity>
                  <View style={[styles.activePage, isActive('GroupsScreen') ? { backgroundColor: '#00BFFF' } : {},]}></View>
                </View>
              </View>
              <View style={styles.rightButton}>
                <View>
                  <TouchableOpacity onPress={() => setDelistModalVisible(true)} style={styles.button}>
                    <Text style={[styles.leaveButtonText, delistModalVisible === true ? { color: 'red' } : {},]}>Delist</Text>
                  </TouchableOpacity>
                  <View style={[styles.activePage, delistModalVisible === true ? { backgroundColor: 'red' } : {},]}></View>
                </View>
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

export default GroupNav;

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
    justifyContent: 'space-between',
    alignItems: 'center',

  },
  leftButtons: {
    flexDirection: 'row',
  },
  rightButton: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    height: 50,
    width: 100,
    // borderRadius: 50,
    backgroundColor: '#5f4c4c',
    // backgroundColor: 'red',

    // marginTop: 10,
    justifyContent: 'center',
    alignItems: 'center',
    // marginBottom: 8,
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
    width: 100,
    // width: 10,
    backgroundColor: '#5f4c4c',
    // borderWidth: 5
  }
});
