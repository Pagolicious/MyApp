import React from 'react';
import { View, Alert } from 'react-native';
// import GroupNav from '../components/GroupNav';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import MyGroupScreen from '../screens/MyGroupScreen';
import MembersHomeScreen from '../screens/MembersHomeScreen';
import { GroupTopTabsParamList } from '../utils/types'
import GroupListener from '../components/GroupListener';

const TopTab = createMaterialTopTabNavigator<GroupTopTabsParamList>();

const GroupTopTabs = () => {
  return (
    <>
      <GroupListener />
      <TopTab.Navigator
        initialRouteName="MyGroupScreen"
        screenOptions={{
          tabBarLabelStyle: { fontSize: moderateScale(16), fontWeight: 'bold' },
          tabBarIndicatorStyle: {
            backgroundColor: '#00BFFF',
            height: verticalScale(5),
            // paddingTop: 10
          },
          tabBarStyle: {
            backgroundColor: '#5f4c4c',
            height: 80, // 🔺 increase from default (~48)
            paddingTop: verticalScale(15),
          },
          tabBarActiveTintColor: '#00BFFF',
          tabBarInactiveTintColor: 'lightgray',
          swipeEnabled: true,
        }}
      >
        <TopTab.Screen
          name="MyGroupScreen"
          component={MyGroupScreen}
          options={{ tabBarLabel: 'Applicants' }}
        />
        <TopTab.Screen
          name="MembersHomeScreen"
          component={MembersHomeScreen}
          options={{ tabBarLabel: 'Members' }}
        />
      </TopTab.Navigator>
    </>
  );
};

export default GroupTopTabs;
