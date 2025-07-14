import React, { useEffect } from 'react';
import messaging from '@react-native-firebase/messaging';
import inAppMessaging from '@react-native-firebase/in-app-messaging';
import Toast from 'react-native-toast-message';

// import { NewAppScreen } from '@react-native/new-app-screen';
// import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';

//Navigation
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import PublicTabNavigator from './navigation/PublicTabNavigator';
import GroupTabNavigator from './navigation/GroupTabNavigator';
import RootStackNavigator from './navigation/RootStackNavigator';

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
import MembersHomeScreen from './screens/MembersHomeScreen';
import RequestScreen from './screens/RequestScreen';

import FriendScreen from './screens/Profile/FriendScreen';
import SearchPartyScreen from './screens/Profile/SearchPartyScreen';
import MessageScreen from './screens/ChatListScreen';
import SettingScreen from './screens/Profile/SettingScreen';
import AboutAppScreen from './screens/Profile/AboutAppScreen';
import FriendRequestScreen from './screens/Profile/FriendRequestScreen';

//Components
import { useAuth } from './context/AuthContext';
import GroupNotificationModal from './components/GroupNotificationModal';

//Contexts
import { AuthProvider } from './context/AuthContext';
// import { GroupProvider } from './context/GroupContext';
import { InvitationProvider } from './context/InvitationContext';
// import { ModalProvider } from './context/ModalContext';

//Services
import { navigationRef } from './services/NavigationService';

//Hooks
import useOnlineStatus from './hooks/useOnlineStatus';


// export type RootStackParamList = {
//   SignUpScreen: undefined;
//   LoginScreen: undefined;
//   NamePage: undefined;
//   FindOrStart: undefined;
//   FindGroup: undefined;
//   StartGroup: undefined;
//   GroupsScreen: { activity: string };
//   MyGroupScreen: undefined;
//   GroupChatScreen: undefined;
//   ProfileScreen: undefined;
//   MembersHomeScreen: undefined;
//   FriendScreen: undefined;
//   SearchPartyScreen: undefined;
//   MessageScreen: undefined;
//   SettingScreen: undefined;
//   AboutAppScreen: undefined;
//   RequestScreen: undefined;
//   FriendRequestScreen: undefined;
// };

// const Stack = createNativeStackNavigator<RootStackParamList>();

// const AppNavigator = () => {
//   const { currentUser, userData } = useAuth();
//   if (!currentUser) return;

//   return (
//     <NavigationContainer>
//       {userData?.isGroupLeader || userData?.isGroupMember ? (
//         <GroupTabNavigator /> // ✅ Show Group Navigation for Group Members
//       ) : (
//         <PublicTabNavigator /> // ✅ Show Public Navigation for Others
//       )}
//     </NavigationContainer>
//   );
// };






// <View style={styles.container}>
//   <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
//   <NewAppScreen templateFileName="App.tsx" />
// </View>


function App(): React.JSX.Element {

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <OnlineStatusWrapper />
        {/* <GroupProvider> */}
        <InvitationProvider>
          {/* <ModalProvider> */}
          <GroupNotificationModal />

          <NavigationContainer ref={navigationRef}>

            {/* <NavigationContainer ref={navigationRef}>
                <Stack.Navigator
                  initialRouteName="SignUpScreen"
                  screenOptions={{
                    headerShown: false
                  }}>
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
                  <Stack.Screen name="SearchPartyScreen" component={SearchPartyScreen} />
                  <Stack.Screen name="MessageScreen" component={MessageScreen} />
                  <Stack.Screen name="SettingScreen" component={SettingScreen} />
                  <Stack.Screen name="AboutAppScreen" component={AboutAppScreen} />
                  <Stack.Screen name="RequestScreen" component={RequestScreen} />
                  <Stack.Screen name="FriendRequestScreen" component={FriendRequestScreen} />

                </Stack.Navigator>
              </NavigationContainer> */}
            <RootStackNavigator />
            {/* <AppNavigator /> */}
          </NavigationContainer>
          <Toast position="top" topOffset={50} />
          {/* </ModalProvider> */}
        </InvitationProvider>
        {/* </GroupProvider> */}
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

const OnlineStatusWrapper = () => {
  useOnlineStatus();
  return null; // No UI needed, just runs the hook
};

export default App;
