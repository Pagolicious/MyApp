// import React from 'react';
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import { View, Text, StyleSheet } from 'react-native';
// import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
// import { createStackNavigator } from '@react-navigation/stack';

// // Screens
// import FindOrStart from '../screens/FindOrStart';
// import FindGroup from '../screens/FindGroup';
// import ProfileScreen from '../screens/ProfileScreen';
// import ChatListScreen from '../screens/ChatListScreen';

// // Icons
// import Icon1 from 'react-native-vector-icons/FontAwesome5';
// import Icon2 from 'react-native-vector-icons/FontAwesome6';
// import Icon3 from 'react-native-vector-icons/Entypo';
// import Icon4 from 'react-native-vector-icons/Feather';


// const Tab = createBottomTabNavigator();

// const PublicTabNavigator = () => {
//   const ChatsStack = createStackNavigator();

//   const ChatsStackNavigator = () => (
//     <ChatsStack.Navigator
//       screenOptions={{
//         headerShown: true
//       }}
//     >
//       <ChatsStack.Screen
//         name="ChatListScreen"
//         component={ChatListScreen}
//         options={{
//           title: 'Chat List',
//           headerLeft: () => null,
//           headerStyle: {
//             backgroundColor: '#5f4c4c',
//           },
//           headerTitleStyle: {
//             fontSize: moderateScale(25),
//             // fontWeight: 'bold',
//             color: 'white'
//           },
//         }}
//       />
//     </ChatsStack.Navigator>
//   );

//   const FindGroupStackNavigator = () => (
//     <ChatsStack.Navigator
//       screenOptions={{
//         headerShown: true
//       }}
//     >
//       <ChatsStack.Screen
//         name="FindGroup"
//         component={FindGroup}
//         options={{
//           title: 'Find Group',
//           headerLeft: () => null,
//           headerStyle: {
//             backgroundColor: '#5f4c4c',
//           },
//           headerTitleStyle: {
//             fontSize: moderateScale(25),
//             // fontWeight: 'bold',
//             color: 'white'
//           },
//         }}
//       />
//     </ChatsStack.Navigator>
//   );
//   return (
//     <Tab.Navigator
//       screenOptions={({ route }) => ({
//         headerShown: false,
//         tabBarStyle: styles.tabBar,
//         tabBarShowLabel: false, // Remove default labels to prevent duplication
//         tabBarIcon: ({ focused }) => {
//           let iconName: string = '';
//           let IconComponent: React.ElementType = Icon1; // Default icon

//           if (route.name === 'Home') {
//             IconComponent = Icon1;
//             iconName = 'home';
//           } else if (route.name === 'Search') {
//             IconComponent = Icon2;
//             iconName = 'users-viewfinder';
//           } else if (route.name === 'Chats') {
//             IconComponent = Icon3;
//             iconName = 'chat';
//           } else if (route.name === 'More') {
//             IconComponent = Icon4;
//             iconName = 'more-horizontal';
//           }

//           return (
//             <View style={styles.iconContainer}>
//               <IconComponent name={iconName} size={30} color={focused ? '#00BFFF' : 'lightgray'} />
//               <Text style={[styles.iconText, focused && styles.activeText]}>
//                 {route.name}
//               </Text>
//             </View>
//           );
//         },
//       })}>
//       <Tab.Screen name="Home" component={FindOrStart} />
//       <Tab.Screen name="Search" component={FindGroupStackNavigator} />
//       <Tab.Screen name="Chats" component={ChatsStackNavigator} />
//       <Tab.Screen name="More" component={ProfileScreen} />
//     </Tab.Navigator>
//   );
// };

// const styles = StyleSheet.create({
//   tabBar: {

//     backgroundColor: '#5f4c4c',
//     height: 75,
//   },
//   subTabBar: {
//     backgroundColor: '#8b7d7d',
//     height: 60,
//   },
//   iconContainer: {

//     alignItems: 'center',
//     justifyContent: 'center',
//     width: 100,
//     height: 75,
//     borderRadius: 5,
//     marginTop: 35,
//   },
//   iconText: {
//     fontSize: 16,
//     color: 'lightgray',
//     marginTop: 3,
//     fontWeight: 'bold',
//   },
//   activeText: {
//     color: '#00BFFF',
//   },
// });

// export default PublicTabNavigator;
