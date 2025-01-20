import React, { useEffect } from 'react';
import messaging from '@react-native-firebase/messaging';
import inAppMessaging from '@react-native-firebase/in-app-messaging';

//Navigation
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

//Screens
import SignUpScreen from './screens/SignUpScreen';
import LoginScreen from './screens/LoginScreen';
import NamePage from './screens/NamePage';
import FindOrStart from './screens/FindOrStart';
import FindGroup from './screens/FindGroup';
import StartGroup from './screens/StartGroup';
import GroupsScreen from './screens/GroupsScreen';
import MyGroupScreen from './screens/MyGroupScreen';
import GroupChatScreen from './screens/GroupChatScreen';
import ProfileScreen from './screens/ProfileScreen';
import MembersHomeScreen from './screens/MembersHomScreen';
import FriendScreen from './screens/Profile/FriendScreen';
import MessageScreen from './screens/Profile/MessageScreen';
import SettingScreen from './screens/Profile/SettingScreen';
import AboutAppScreen from './screens/Profile/AboutAppScreen';

//Contexts
import { AuthProvider } from './context/AuthContext';
import { GroupProvider } from './context/GroupContext';
import { InvitationProvider } from './context/InvitationContext';

//Services
import { navigationRef } from './services/NavigationService';


export type RootStackParamList = {
  SignUpScreen: undefined;
  LoginScreen: undefined;
  NamePage: undefined;
  FindOrStart: undefined;
  FindGroup: undefined;
  StartGroup: undefined;
  GroupsScreen: { activity: string };
  MyGroupScreen: undefined;
  GroupChatScreen: undefined;
  ProfileScreen: undefined;
  MembersHomeScreen: undefined;
  FriendScreen: undefined;
  MessageScreen: undefined;
  SettingScreen: undefined;
  AboutAppScreen: undefined;

};

const Stack = createNativeStackNavigator<RootStackParamList>();


function App(): React.JSX.Element {

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <GroupProvider>
          <InvitationProvider>
            <NavigationContainer ref={navigationRef}>
              <Stack.Navigator initialRouteName="SignUpScreen">
                <Stack.Screen name="SignUpScreen" component={SignUpScreen} />
                <Stack.Screen name="LoginScreen" component={LoginScreen} />
                <Stack.Screen name="NamePage" component={NamePage} />
                <Stack.Screen name="FindOrStart" component={FindOrStart} />
                <Stack.Screen name="FindGroup" component={FindGroup} />
                <Stack.Screen name="StartGroup" component={StartGroup} />
                <Stack.Screen
                  name="GroupsScreen"
                  component={GroupsScreen}
                  initialParams={{ activity: 'Any' }}
                />
                <Stack.Screen name="MyGroupScreen" component={MyGroupScreen} />
                <Stack.Screen
                  name="GroupChatScreen"
                  component={GroupChatScreen}
                />
                <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
                <Stack.Screen name="MembersHomeScreen" component={MembersHomeScreen} />
                <Stack.Screen name="FriendScreen" component={FriendScreen} />
                <Stack.Screen name="MessageScreen" component={MessageScreen} />
                <Stack.Screen name="SettingScreen" component={SettingScreen} />
                <Stack.Screen name="AboutAppScreen" component={AboutAppScreen} />
              </Stack.Navigator>
            </NavigationContainer>
          </InvitationProvider>
        </GroupProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

export default App;
