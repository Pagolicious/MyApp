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

//AuthContext
import { AuthProvider } from './context/AuthContext';
import { GroupProvider } from './context/GroupContext';

//Services
// import { FirebaseMessagingService } from './services/FirebaseMessagingService';
import FirebaseMessagingService from './services/FirebaseMessagingService'; // Make sure the path is correct

export type RootStackParamList = {
  SignUpScreen: undefined;
  LoginScreen: undefined;
  NamePage: undefined;
  FindOrStart: undefined;
  FindGroup: undefined;
  StartGroup: undefined;
  GroupsScreen: undefined;
  MyGroupScreen: undefined;
  GroupChatScreen: undefined;
  ProfileScreen: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();


function App(): React.JSX.Element {

  // const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // const requestUserPermission = async () => {
  //   const authStatus = await messaging().requestPermission();
  //   const enabled =
  //     authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
  //     authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  //   if (enabled) {
  //     console.log('Authorization status:', authStatus);
  //   }
  // };

  // useEffect(() => {

  //   requestUserPermission();
  //   inAppMessaging().setMessagesDisplaySuppressed(false);

  //   FirebaseMessagingService.setupMessagingHandlers(navigation);

  //   return () => {
  //   };
  // }, [navigation]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <GroupProvider>
          <NavigationContainer>
            <Stack.Navigator initialRouteName="SignUpScreen">
              <Stack.Screen name="SignUpScreen" component={SignUpScreen} />
              <Stack.Screen name="LoginScreen" component={LoginScreen} />
              <Stack.Screen name="NamePage" component={NamePage} />
              <Stack.Screen name="FindOrStart" component={FindOrStart} />
              <Stack.Screen name="FindGroup" component={FindGroup} />
              <Stack.Screen name="StartGroup" component={StartGroup} />
              <Stack.Screen name="GroupsScreen" component={GroupsScreen} />
              <Stack.Screen name="MyGroupScreen" component={MyGroupScreen} />
              <Stack.Screen
                name="GroupChatScreen"
                component={GroupChatScreen}
              />
              <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </GroupProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

export default App;
