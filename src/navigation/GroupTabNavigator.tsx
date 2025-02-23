import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';

import { createStackNavigator } from '@react-navigation/stack';
import GroupNav from '../components/GroupNav';

// Screens (Only for Group Members)
import MyGroupScreen from '../screens/MyGroupScreen';
import MyGroupWithNav from '../components/MyGroupWithNav';
import FindGroup from '../screens/FindGroup';
import GroupChatScreen from '../screens/GroupChatScreen';
import ProfileScreen from '../screens/ProfileScreen';
import MembersHomeScreen from '../screens/MembersHomeScreen';
// import MyGroupStackNavigator from '../navigation/MyGroupStackNavigator'; // ✅ Use Stack Navigator

//Contexts
import { useAuth } from '../context/AuthContext';


// Icons
import Icon1 from 'react-native-vector-icons/FontAwesome';
import Icon2 from 'react-native-vector-icons/Entypo';
import Icon3 from 'react-native-vector-icons/AntDesign';
import Icon4 from 'react-native-vector-icons/FontAwesome6';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const MyGroupTab = createBottomTabNavigator();

const MyGroupStack = () => {
  const { userData } = useAuth();

  const initialRoute = userData?.isGroupLeader ? "MyGroupScreen" : "MembersHomeScreen";

  return (
    <View style={{ flex: 1 }}>
      <GroupNav />
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRoute}>
        <Stack.Screen name="MembersHomeScreen" component={MembersHomeScreen} />
        <Stack.Screen name="MyGroupScreen" component={MyGroupScreen} />
      </Stack.Navigator>
    </View>
  );
};

const GroupTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false, // ✅ Remove default labels to prevent duplication
        tabBarIcon: ({ focused }) => {
          let iconName: string = '';
          let IconComponent: React.ElementType = Icon1; // Default icon

          if (route.name === 'My Group') {
            IconComponent = Icon1;
            iconName = 'group';
          } else if (route.name === 'Browse') {
            IconComponent = Icon4;
            iconName = 'users-viewfinder';
          } else if (route.name === 'Group Chat') {
            IconComponent = Icon2;
            iconName = 'chat';
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
      <Tab.Screen name="My Group" component={MyGroupStack} />

      <Tab.Screen name="Browse" component={FindGroup} options={{ title: 'Find' }} />
      <Tab.Screen name="Group Chat" component={GroupChatScreen} />
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

export default GroupTabNavigator;
