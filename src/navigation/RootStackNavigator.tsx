import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import GroupTabNavigator from './TabNavigator';
// import PublicTabNavigator from './PublicTabNavigator';
import { navigationRef } from '../services/NavigationService';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';

import { RootStackParamList } from '../utils/types';
import { useAuth } from '../context/AuthContext';

// Import Screens (for non-tab navigation)
import SignUpScreen from '../screens/SignUpScreen';
import LoginScreen from '../screens/LoginScreen';
import NamePage from '../screens/NamePage';
import DateOfBirthScreen from '../screens/DateOfBirthScreen';
import FindOrStart from '../screens/FindOrStart';
import FindGroup from '../screens/FindGroup';
import StartGroup from '../screens/StartGroup';
import GroupsScreen from '../screens/GroupsScreen';
import GroupChatScreen from '../screens/GroupChatScreen';
import ProfileScreen from '../screens/ProfileScreen';
import MembersHomeScreen from '../screens/MembersHomeScreen';
import FriendScreen from '../screens/Profile/FriendScreen';
import SearchPartyScreen from '../screens/Profile/SearchPartyScreen';
import ProfilePageScreen from '../screens/Profile/ProfilePageScreen';
import ChatListScreen from '../screens/ChatListScreen';
import SettingScreen from '../screens/Profile/SettingScreen';
import AboutAppScreen from '../screens/Profile/AboutAppScreen';
import FriendRequestScreen from '../screens/Profile/FriendRequestScreen';
import ChatRoomScreen from '../screens/ChatRoomScreen'
import LabelScreen from '../screens/Profile/LabelScreen'
import EditProfileScreen from '../screens/settings/EditProfileScreen'

import PresenceDebugScreen from '../screens/PresenceDebugScreen';

//Types
import { GroupChatParameter, ParticipantDetails } from '../types/chatTypes';

//Component
import PartyDisplay from '../components/PartyDisplay';

//Stacks
import FriendStack from './FriendStack';

// Icons
import Icon from 'react-native-vector-icons/Feather';


const Stack = createStackNavigator<RootStackParamList>();

const RootStackNavigator = () => {
  const { currentUser, userData } = useAuth();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        title: '',
        headerStyle: {
          backgroundColor: '#5f4c4c',
        },
        headerTitleStyle: {
          fontSize: moderateScale(25),
          color: 'white',
        },
        headerTintColor: 'white',
      }}
    >

      <Stack.Screen
        name="LoginScreen"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SignUpScreen"
        component={SignUpScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TabNav"
        component={GroupTabNavigator}
        options={{ headerShown: false }}
      />
      {/* <Stack.Screen
        name="PublicApp"
        component={PublicTabNavigator}
        options={{ headerShown: false }}
      /> */}
      <Stack.Screen
        name="GroupsScreen"
        component={GroupsScreen}
        options={{
          title: 'Groups',
          headerRight: () =>
            userData && (userData.isPartyLeader || userData.isPartyMember) ? (
              <View style={styles.partyContainer}>
                <PartyDisplay />
              </View>
            ) : null,
        }}
      />
      <Stack.Screen
        name="StartGroup"
        component={StartGroup}
        options={({ route }) => ({
          title: route?.params?.isEdit ? 'Edit Group' : 'Create a Group'
        })}
      />
      <Stack.Screen
        name="NamePage"
        component={NamePage}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DateOfBirthScreen"
        component={DateOfBirthScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="GroupChatScreen"
        component={GroupChatScreen}
        options={({ route }) => {
          const { chatName, title, activity } = (route.params ?? {}) as Partial<GroupChatParameter>;
          return {
            title: chatName || title || activity || 'Chat',
          };
        }}
      />
      <Stack.Screen
        name="ChatRoomScreen"
        component={ChatRoomScreen}
        options={({ route }) => {
          const { otherFirstName, otherLastName } = (route.params ?? {}) as {
            otherFirstName?: string;
            otherLastName?: string;
          };
          return {
            title: `${otherFirstName ?? ''} ${otherLastName ?? ''}`.trim() || 'Chat',
          };
        }}
      />
      <Stack.Screen
        name="Friends"
        component={FriendStack}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SearchPartyScreen"
        component={SearchPartyScreen}
        options={{ title: 'Search Party' }}
      />


      <Stack.Screen
        name="SettingScreen"
        component={SettingScreen}
        options={{ title: 'Settings' }}
      />
      <Stack.Screen
        name="ProfilePageScreen"
        component={ProfilePageScreen}
        options={({ navigation }) => ({
          title: 'Profile',
          headerRight: () => (
            <View style={styles.iconContainer}>
              <Icon
                name="edit"
                size={22}
                color="white"
                style={{ marginRight: 15 }}
                onPress={() => navigation.navigate('EditProfileScreen')}
              />
            </View>

          ),
        })} />
      <Stack.Screen
        name="LabelScreen"
        component={LabelScreen}
        options={{ title: 'Labels' }}
      />
      <Stack.Screen
        name="EditProfileScreen"
        component={EditProfileScreen}
        options={{ title: 'Edit Profile' }}
      />
      <Stack.Screen name="AboutAppScreen" component={AboutAppScreen} />
      <Stack.Screen name="PresenceDebugScreen" component={PresenceDebugScreen} />


    </Stack.Navigator>
  );
};

export default RootStackNavigator;

const styles = StyleSheet.create({
  partyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    width: scale(160),
    height: verticalScale(40),
    paddingRight: scale(10),
  },
  iconContainer: {
    marginHorizontal: scale(10)
  }
});
