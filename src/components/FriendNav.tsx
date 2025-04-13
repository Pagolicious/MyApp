import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';

//Navigation
import { RootStackParamList } from '../utils/types';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useNavigationState } from '@react-navigation/native';

// AuthContext
import { useAuth } from '../context/AuthContext';
import { useGroup } from '../context/GroupContext';
import { useModal } from '../context/ModalContext';

//Services
import { navigate } from '../services/NavigationService';

//Icons
import Icon1 from 'react-native-vector-icons/AntDesign';

// type GroupNavProps = {
//   route:
//   | RouteProp<RootStackParamList, 'MyGroupScreen'>
//   | RouteProp<RootStackParamList, 'GroupsScreen'>
//   | RouteProp<RootStackParamList, 'FindOrStart'>
//   | RouteProp<RootStackParamList, 'MembersHomeScreen'>

// };

const FriendNav = () => {
  const navigation = useNavigation();

  const { currentUser, userData } = useAuth();
  // const [buttonText, setButtonText] = useState('Browse');
  // const { setDisbandModalVisible, disbandModalVisible } = useModal();
  // const { disbandGroup } = useGroup();
  // const route = useRoute();


  // ✅ Get active screen inside `FriendStack`
  const currentRouteName = useNavigationState((state) => {
    if (!state) return "FriendScreen"
    const activeTabRoute = state?.routes.find((r) => r.name === "Friends")?.state;
    return activeTabRoute && "routes" in activeTabRoute
      ? activeTabRoute.routes[activeTabRoute.index ?? 0]?.name || "FriendScreen"
      : "FriendScreen";
  });

  useEffect(() => {
    if (currentRouteName) {
      navigation.setOptions({
        headerTitle: currentRouteName === 'FriendScreen' ? 'Friends List' : 'Friend Requests',
      });
    }
  }, [currentRouteName, navigation]);
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

  // const handleDisbandMyGroup = async () => {
  //   try {
  //     await disbandGroup();
  //   } catch {
  //     Alert.alert('Error', 'Something went wrong.');
  //   }
  // };
  const handleGoBackButton = () => {
    if (!userData) return;

    if (userData.isGroupLeader || userData.isGroupMember) {
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'GroupApp' as keyof RootStackParamList, // ✅ Ensures GroupApp is recognized
            params: { screen: 'Profile' }, // ✅ Ensure 'ProfileScreen' exists in RootStackParamList
          } as unknown as never,
        ],
      });
    } else {
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'PublicApp' as keyof RootStackParamList, // ✅ Ensures GroupApp is recognized
            params: { screen: 'Profile' }, // ✅ Ensure 'ProfileScreen' exists in RootStackParamList
          } as unknown as never,
        ],
      });
    }
  }

  useEffect(() => {
    console.log('Current Route:', currentRouteName, 'Navigation State:', navigation.getState());
  }, [currentRouteName, navigation]);


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => handleGoBackButton()}>
          <Icon1 name="arrowleft" size={25} color="white" />
        </TouchableOpacity>
        <View style={styles.spacer} />

        <Text style={styles.headerText}>{currentRouteName === 'FriendScreen' ? 'Friends List' : 'Friend Requests'}</Text>
        <View style={styles.spacer} />
      </View>
      {currentUser ? (
        <>
          <View style={styles.navbar}>
            <View style={styles.contentRow}>
              <View>
                <TouchableOpacity onPress={() => navigate('Friends', { screen: 'FriendScreen' })} style={styles.button}>
                  {/* <Text style={styles.title}>{buttonText}</Text> */}
                  <Text style={[styles.buttonText, currentRouteName === 'FriendScreen' ? { color: '#00BFFF' } : {},]}>Friends list</Text>
                </TouchableOpacity>
                <View style={[styles.activePage, currentRouteName === 'FriendScreen' ? { backgroundColor: '#00BFFF' } : {},]}></View>
              </View>
              <View>
                <TouchableOpacity
                  onPress={() => navigate('Friends', { screen: 'FriendRequestScreen' })}
                  style={styles.button}>
                  <Text style={[styles.buttonText, currentRouteName === 'FriendRequestScreen' ? { color: '#00BFFF' } : {},]}>Friend requests</Text>
                </TouchableOpacity>
                <View style={[styles.activePage, currentRouteName === 'FriendRequestScreen' ? { backgroundColor: '#00BFFF' } : {},]}></View>
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
  header: {
    height: 65,
    backgroundColor: '#5f4c4c',
    padding: 15,
    alignItems: 'center',
    flexDirection: "row"
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginRight: 20,

  },
  spacer: {
    flex: 1,
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
