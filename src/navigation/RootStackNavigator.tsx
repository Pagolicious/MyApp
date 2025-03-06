import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import GroupTabNavigator from './GroupTabNavigator';
import PublicTabNavigator from './PublicTabNavigator';
import { navigationRef } from '../services/NavigationService';

import { RootStackParamList } from '../utils/types';
import { useAuth } from '../context/AuthContext';

// Import Screens (for non-tab navigation)
import SignUpScreen from '../screens/SignUpScreen';
import LoginScreen from '../screens/LoginScreen';
import NamePage from '../screens/NamePage';
import FindOrStart from '../screens/FindOrStart';
import FindGroup from '../screens/FindGroup';
import StartGroup from '../screens/StartGroup';
import GroupsScreen from '../screens/GroupsScreen';
import GroupChatScreen from '../screens/GroupChatScreen';
import ProfileScreen from '../screens/ProfileScreen';
import MembersHomeScreen from '../screens/MembersHomeScreen';
import FriendScreen from '../screens/Profile/FriendScreen';
import SearchPartyScreen from '../screens/Profile/SearchPartyScreen';
import MessageScreen from '../screens/Profile/MessageScreen';
import SettingScreen from '../screens/Profile/SettingScreen';
import AboutAppScreen from '../screens/Profile/AboutAppScreen';
import FriendRequestScreen from '../screens/Profile/FriendRequestScreen';

//Stacks
import FriendStack from './FriendStack';

const Stack = createStackNavigator<RootStackParamList>();

const RootStackNavigator = () => {
  const { currentUser, userData } = useAuth();

  return (
    <Stack.Navigator
      initialRouteName={currentUser ? (userData?.isGroupLeader || userData?.isGroupMember ? "GroupApp" : "PublicApp") : "SignUpScreen"}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="SignUpScreen" component={SignUpScreen} />
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen name="GroupApp" component={GroupTabNavigator} />
      <Stack.Screen name="PublicApp" component={PublicTabNavigator} />
      <Stack.Screen name="GroupsScreen" component={GroupsScreen} />
      <Stack.Screen name="StartGroup" component={StartGroup} />
      <Stack.Screen name="NamePage" component={NamePage} />

      {/* 🚀 TAB NAVIGATOR (MAIN APP) */}
      {/* <Stack.Screen name="MainApp" component={GroupTabNavigator} /> */}

      {/* 🚀 OTHER NON-TAB SCREENS */}
      {/* <Stack.Screen name="GroupChatScreen" component={GroupChatScreen} />
        <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
        <Stack.Screen name="MembersHomeScreen" component={MembersHomeScreen} /> */}
      <Stack.Screen name="Friends" component={FriendStack} />
      <Stack.Screen name="SearchPartyScreen" component={SearchPartyScreen} />
      <Stack.Screen name="MessageScreen" component={MessageScreen} />
      <Stack.Screen name="SettingScreen" component={SettingScreen} />
      <Stack.Screen name="AboutAppScreen" component={AboutAppScreen} />
    </Stack.Navigator>
  );
};

export default RootStackNavigator;
