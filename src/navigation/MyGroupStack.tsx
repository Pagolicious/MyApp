import React, { useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SelectGroupScreen from '../screens/SelectGroupScreen';
import MyGroupScreen from '../screens/MyGroupScreen';
import MembersHomeScreen from '../screens/MembersHomeScreen';
// import GroupNav from '../components/GroupNav';
import { View, Alert } from 'react-native';
import { MyGroupStackParamList } from '../utils/types';
// import { useGroup } from '../context/GroupContext';
import GroupTopTabs from './GroupTopTabs';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

const Stack = createStackNavigator<MyGroupStackParamList>();

import { useNavigationState } from '@react-navigation/native';

const MyGroupStack = () => {
  // const ChatsStack = createStackNavigator();

  // const ChatsStackNavigator = () => (
  //   <ChatsStack.Navigator
  //     screenOptions={{
  //       headerShown: true
  //     }}
  //   >
  //     <ChatsStack.Screen
  //       name="ChatListScreen"
  //       component={ChatListScreen}
  //       options={{
  //         title: 'Chat List',
  //         headerLeft: () => null,
  //         headerStyle: {
  //           backgroundColor: '#5f4c4c',
  //         },
  //         headerTitleStyle: {
  //           fontSize: moderateScale(25),
  //           // fontWeight: 'bold',
  //           color: 'white'
  //         },
  //       }}
  //     />
  //   </ChatsStack.Navigator>
  // );

  return (
    <View style={{ flex: 1 }}>
      <Stack.Navigator
        initialRouteName="SelectGroupScreen"
        screenOptions={{ headerShown: true }}
      >
        <Stack.Screen name="SelectGroupScreen" component={SelectGroupScreen}
          options={{
            title: 'My Groups',
            headerLeft: () => null,
            headerStyle: {
              backgroundColor: '#5f4c4c',


            },
            headerTitleStyle: {
              fontSize: moderateScale(25),
              // fontWeight: 'bold',
              color: 'white',
            },
          }}
        />
        <Stack.Screen
          name="GroupTopTabs"
          component={GroupTopTabs}
          options={{
            title: 'Group',
            headerStyle: {
              backgroundColor: '#5f4c4c',
              elevation: 0, // Android
              shadowOpacity: 0, // iOS
              borderBottomWidth: 0, // Optional
            },
            headerTintColor: 'white',
            headerTitleStyle: {
              fontSize: moderateScale(25),
              fontWeight: 'bold',
              // marginBottom: 0
              paddingBottom: 0
            },
          }} />
      </Stack.Navigator>
    </View>
  );
};





export default MyGroupStack;
