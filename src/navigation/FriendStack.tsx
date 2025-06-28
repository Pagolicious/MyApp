import React from 'react';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import FriendScreen from '../screens/Profile/FriendScreen';
import FriendRequestScreen from '../screens/Profile/FriendRequestScreen';
import FriendNav from '../components/FriendNav';

const Stack = createStackNavigator();

const FriendStack = () => {
  return (
    <React.Fragment>
      <FriendNav />

      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          ...TransitionPresets.FadeFromBottomAndroid, // Smooth fade transition
          cardStyle: { backgroundColor: 'white' }, // Prevents grey background
        }}
        initialRouteName="FriendScreen"
      >
        <Stack.Screen name="FriendScreen" component={FriendScreen} />
        <Stack.Screen name="FriendRequestScreen" component={FriendRequestScreen} />
      </Stack.Navigator>
    </React.Fragment>
  );
};

export default FriendStack;
