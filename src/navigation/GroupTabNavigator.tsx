import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';

import { createStackNavigator } from '@react-navigation/stack';
// import GroupNav from '../components/GroupNav';

// Screens (Only for Group Members)
import MyGroupScreen from '../screens/MyGroupScreen';
import FindGroup from '../screens/FindGroup';
import ProfileScreen from '../screens/ProfileScreen';
import MembersHomeScreen from '../screens/MembersHomeScreen';
import ChatListScreen from '../screens/ChatListScreen';
import SelectGroupScreen
  from '../screens/SelectGroupScreen';
import MyGroupStack from './MyGroupStack';

//Contexts
import { useAuth } from '../context/AuthContext';
import { useGroup } from '../context/GroupContext';

// Icons
import Icon1 from 'react-native-vector-icons/FontAwesome';
import Icon2 from 'react-native-vector-icons/Entypo';
import Icon3 from 'react-native-vector-icons/Feather';
import Icon4 from 'react-native-vector-icons/FontAwesome6';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const MyGroupTab = createBottomTabNavigator();

// const MyGroupStack = () => {
//   const { userData } = useAuth();

//   const initialRoute = userData?.isGroupLeader ? "MyGroupScreen" : "MembersHomeScreen";

//   return (
//     <View style={{ flex: 1 }}>
//       <GroupNav />
//       <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRoute}>
//         <Stack.Screen name="MembersHomeScreen" component={MembersHomeScreen} />
//         <Stack.Screen name="MyGroupScreen" component={MyGroupScreen} />
//       </Stack.Navigator>
//     </View>
//   );
// };

// const MyGroupStack = () => {
//   const { userData } = useAuth();
//   const { currentGroupId } = useGroup();

//   const shouldSelectGroup = !currentGroupId;

//   return (
//     <View style={{ flex: 1 }}>
//       <GroupNav />
//       <Stack.Navigator screenOptions={{ headerShown: false }}>
//         {shouldSelectGroup ? (
//           <Stack.Screen name="SelectGroupScreen" component={SelectGroupScreen} />
//         ) : (
//           <>
//             <Stack.Screen name="MembersHomeScreen" component={MembersHomeScreen} />
//             <Stack.Screen name="MyGroupScreen" component={MyGroupScreen} />
//           </>
//         )}
//       </Stack.Navigator>
//     </View>
//   );
// };


// const MyGroupEntryPoint = () => {
//   const { userData } = useAuth();
//   if (userData.groups.length === 1) {
//     setCurrentGroupId(userData.groups[0].groupId);
//     return <MyGroupStack />;
//   }
//   return <SelectGroupScreen />;
// };

// // in tab
// <Tab.Screen name="My Group" component={MyGroupEntryPoint} />


const GroupTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false, // Remove default labels to prevent duplication
        tabBarIcon: ({ focused }) => {
          let iconName: string = '';
          let IconComponent: React.ElementType = Icon1; // Default icon

          if (route.name === 'My Group') {
            IconComponent = Icon1;
            iconName = 'group';
          } else if (route.name === 'Browse') {
            IconComponent = Icon4;
            iconName = 'users-viewfinder';
          } else if (route.name === 'Chats') {
            IconComponent = Icon2;
            iconName = 'chat';
          } else if (route.name === 'More') {
            IconComponent = Icon3;
            iconName = 'more-horizontal';
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

      <Tab.Screen name="My Group" component={MyGroupStack} />
      <Tab.Screen name="Browse" component={FindGroup} options={{ title: 'Find' }} />
      <Tab.Screen name="Chats" component={ChatListScreen} />
      <Tab.Screen name="More" component={ProfileScreen} />

    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {

    backgroundColor: '#5f4c4c',
    height: 75,
  },
  subTabBar: {
    backgroundColor: '#8b7d7d',
    height: 60,
  },
  iconContainer: {

    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
    height: 75,
    borderRadius: 5,
    marginTop: 35,
  },
  iconText: {
    fontSize: 16,
    color: 'lightgray',
    marginTop: 3,
    fontWeight: 'bold',
  },
  activeText: {
    color: '#00BFFF',
  },
});

export default GroupTabNavigator;
