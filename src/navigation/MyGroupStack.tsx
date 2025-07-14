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

const Stack = createStackNavigator<MyGroupStackParamList>();

import { useNavigationState } from '@react-navigation/native';

const MyGroupStack = () => {

  return (
    <View style={{ flex: 1 }}>
      <Stack.Navigator
        initialRouteName="SelectGroupScreen"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="SelectGroupScreen" component={SelectGroupScreen} />
        <Stack.Screen name="GroupTopTabs" component={GroupTopTabs} />
      </Stack.Navigator>
    </View>
  );
};





export default MyGroupStack;
