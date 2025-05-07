import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';

//Navigation
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
// import MyGroupStackNavigator
// from '../navigation/MyGroupStackNavigator';
import { StackNavigationProp } from '@react-navigation/stack';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigationState } from '@react-navigation/native';

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

// import { useNavigationState } from '@react-navigation/native';

// type GroupTabParamList = {
//   'My Group': undefined; // This is the bottom tab name
// };

// type MyGroupStackParamList = {
//   MyGroupScreen: undefined;
//   MembersHomeScreen: undefined;
// };

// type NavigationProps = CompositeNavigationProp<
//   BottomTabNavigationProp<GroupTabParamList, 'My Group'>,
//   StackNavigationProp<MyGroupStackParamList>
// >;

const GroupNav = () => {
  const navigation = useNavigation()

  const { currentUser, userData } = useAuth();
  // const [buttonText, setButtonText] = useState('Browse');
  // const { setDisbandModalVisible, disbandModalVisible } = useModal();
  // const { disbandGroup } = useGroup();
  const route = useRoute();

  const [currentScreen, setCurrentScreen] = useState<string | null>(null);

  // Track the active screen inside MyGroupStack
  const currentRouteName = useNavigationState((state) => {
    const activeTabRoute = state?.routes.find((r) => r.name === "My Group")?.state;

    // Default to "MyGroupScreen" if leader, otherwise "MembersHomeScreen"
    const defaultRoute = userData?.isGroupLeader ? "MyGroupScreen" : "MembersHomeScreen";

    return activeTabRoute && "routes" in activeTabRoute
      ? activeTabRoute.routes[activeTabRoute.index ?? 0]?.name || defaultRoute
      : defaultRoute;
  });

  useEffect(() => {
    if (currentRouteName) {
      navigation.setOptions({
        tabBarLabel: currentRouteName === 'MyGroupScreen' ? 'Applicants' : 'Members',
      });
    }
  }, [currentRouteName]);

  // const parentNavigation = navigation.getParent();
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
  useEffect(() => {
    console.log('Current Route:', currentRouteName);
  }, [currentRouteName]);


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>My Group</Text>
      </View>
      {currentUser ? (
        <>
          <View style={styles.navbar}>
            <View style={styles.contentRow}>
              {/* <View style={styles.leftButtons}> */}
              <View>
                <TouchableOpacity
                  onPress={() => navigate('MyGroupScreen')}
                  style={styles.button}>
                  <Text style={[styles.buttonText, currentRouteName === 'MyGroupScreen' ? { color: '#00BFFF' } : {},]}>Applicants</Text>
                </TouchableOpacity>
                <View style={[styles.activePage, currentRouteName === 'MyGroupScreen' ? { backgroundColor: '#00BFFF' } : {},]}></View>
              </View>
              <View>
                <TouchableOpacity
                  onPress={() => navigate('MembersHomeScreen')}
                  style={styles.button}>
                  <Text style={[styles.buttonText, currentRouteName === 'MembersHomeScreen' ? { color: '#00BFFF' } : {},]}>Members</Text>
                </TouchableOpacity>
                <View style={[styles.activePage, currentRouteName === 'MembersHomeScreen' ? { backgroundColor: '#00BFFF' } : {},]}></View>
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
  header: {
    height: 65,
    backgroundColor: '#5f4c4c',
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
    // marginBottom: 15
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
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
