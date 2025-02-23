import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';

import { createStackNavigator } from '@react-navigation/stack';
import GroupNav from '../components/GroupNav';

//Contexts
import { useAuth } from '../context/AuthContext';

// Screens
import FindOrStart from '../screens/FindOrStart';
import FindGroup from '../screens/FindGroup';
import ProfileScreen from '../screens/ProfileScreen';

// Icons
import Icon1 from 'react-native-vector-icons/FontAwesome5';
import Icon2 from 'react-native-vector-icons/FontAwesome6';
import Icon3 from 'react-native-vector-icons/AntDesign';

const Tab = createBottomTabNavigator();

const PublicTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false, // ✅ Remove default labels to prevent duplication
        tabBarIcon: ({ focused }) => {
          let iconName: string = '';
          let IconComponent: React.ElementType = Icon1; // Default icon

          if (route.name === 'Home') {
            IconComponent = Icon1;
            iconName = 'home';
          } else if (route.name === 'Find a Group') {
            IconComponent = Icon2;
            iconName = 'users-viewfinder';
          } else if (route.name === 'Profile') {
            IconComponent = Icon3;
            iconName = 'profile';
          }

          return (
            <View style={styles.iconContainer}>
              <IconComponent name={iconName} size={30} color={focused ? '#00BFFF' : 'lightgray'} />
              <Text style={[styles.iconText, focused && styles.activeText]}>
                {route.name}
              </Text>
            </View>
          );
        },
      })}>
      {/* <Tab.Screen name="My Group" component={MyGroupWithNav} /> */}
      {/* <Tab.Screen
          name="My Group"
          component=
          {MyGroupStack} // ✅ Opens the Stack Navigator
        /> */}
      <Tab.Screen name="Home" component={FindOrStart} />

      <Tab.Screen name="Find a Group" component={FindGroup} options={{ title: 'Find' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      {/* <Tab.Screen name="Members Home" component={MembersHomeScreen} /> */}

    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {

    backgroundColor: '#5f4c4c',
    height: 75,
    // paddingBottom: 5,
    // borderTopWidth: 0, // ✅ Removes default tab border
    // borderWidth: 2

  },
  subTabBar: {
    backgroundColor: '#8b7d7d',
    height: 60,
  },
  iconContainer: {

    alignItems: 'center',
    justifyContent: 'center',
    // flexDirection: 'column', // ✅ Ensures vertical alignment
    width: 100,
    height: 75,
    borderRadius: 5,
    marginTop: 35,
    // borderWidth: 2
  },
  iconText: {
    fontSize: 16,
    color: 'lightgray',
    marginTop: 3, // ✅ Adds better spacing
    fontWeight: 'bold',
  },
  activeText: {
    color: '#00BFFF', // ✅ Changes color when active
  },
});

export default PublicTabNavigator;
