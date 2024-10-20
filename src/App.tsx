import React from 'react';

//Navigation
import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { GestureHandlerRootView } from 'react-native-gesture-handler';

//Screens
import SignUpScreen from './screens/SignUpScreen';
import LoginScreen from './screens/LoginScreen';
import NamePage from './screens/NamePage';
import FindOrStart from './screens/FindOrStart';
import FindGroup from './screens/FindGroup';
import StartGroup from './screens/StartGroup';
import GroupsScreen from './screens/GroupsScreen';
import MyGroupScreen from './screens/MyGroupScreen';

//AuthContext
import { AuthProvider } from './context/AuthContext';

export type RootStackParamList = {
  SignUpScreen: undefined;
  LoginScreen: undefined;
  NamePage: { uid: string };
  FindOrStart: undefined;
  FindGroup: undefined;
  StartGroup: { uid: string };
  GroupsScreen: undefined;
  MyGroupScreen: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>()

function App(): React.JSX.Element {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>

      <AuthProvider>

        <NavigationContainer>
          <Stack.Navigator initialRouteName='SignUpScreen'>
            <Stack.Screen
              name='SignUpScreen'
              component={SignUpScreen}
            />
            <Stack.Screen
              name='LoginScreen'
              component={LoginScreen}
            />
            <Stack.Screen
              name='NamePage'
              component={NamePage}
            />
            <Stack.Screen
              name='FindOrStart'
              component={FindOrStart}
            />
            <Stack.Screen
              name='FindGroup'
              component={FindGroup}
            />
            <Stack.Screen
              name='StartGroup'
              component={StartGroup}
            />
            <Stack.Screen
              name='GroupsScreen'
              component={GroupsScreen}
            />
            <Stack.Screen
              name='MyGroupScreen'
              component={MyGroupScreen}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </AuthProvider>
    </GestureHandlerRootView>

  )
}

export default App
