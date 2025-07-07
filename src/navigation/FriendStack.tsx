// import React from 'react';
// import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
// import FriendScreen from '../screens/Profile/FriendScreen';
// import FriendRequestScreen from '../screens/Profile/FriendRequestScreen';
// import FriendNav from '../components/FriendNav';

// const Stack = createStackNavigator();

// const FriendStack = () => {
//   return (
//     <React.Fragment>
//       <FriendNav />

//       <Stack.Navigator
//         screenOptions={{
//           headerShown: false,
//           ...TransitionPresets.FadeFromBottomAndroid, // Smooth fade transition
//           cardStyle: { backgroundColor: 'white' }, // Prevents grey background
//         }}
//         initialRouteName="FriendScreen"
//       >
//         <Stack.Screen name="FriendScreen" component={FriendScreen} />
//         <Stack.Screen name="FriendRequestScreen" component={FriendRequestScreen} />
//       </Stack.Navigator>
//     </React.Fragment>
//   );
// };

// export default FriendStack;


import React from 'react';
import { View, Alert } from 'react-native';
// import GroupNav from '../components/GroupNav';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import FriendScreen from '../screens/Profile/FriendScreen';
import FriendRequestScreen from '../screens/Profile/FriendRequestScreen';
import { FriendStackParamList } from '../utils/types'

const TopTab = createMaterialTopTabNavigator<FriendStackParamList>();

const GroupTopTabs = () => {
  return (
    <TopTab.Navigator
      initialRouteName="FriendScreen"
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
        name="FriendScreen"
        component={FriendScreen}
        options={{ tabBarLabel: 'Friends List' }}
      />
      <TopTab.Screen
        name="FriendRequestScreen"
        component={FriendRequestScreen}
        options={{ tabBarLabel: 'Friend Requests' }}
      />
    </TopTab.Navigator>
  );
};

export default GroupTopTabs;
