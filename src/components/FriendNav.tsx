// import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
// import React, { useEffect } from 'react';

// //Navigation
// import { RootStackParamList } from '../utils/types';
// import { useNavigation, useRoute } from '@react-navigation/native';
// import { useNavigationState } from '@react-navigation/native';

// // AuthContext
// import { useAuth } from '../context/AuthContext';

// //Services
// import { navigate } from '../services/NavigationService';

// //Icons
// import Icon1 from 'react-native-vector-icons/AntDesign';

// const FriendNav = () => {
//   const navigation = useNavigation();

//   const { currentUser, userData } = useAuth();

//   // Get active screen inside `FriendStack`
//   const currentRouteName = useNavigationState((state) => {
//     if (!state) return "FriendScreen"
//     const activeTabRoute = state?.routes.find((r) => r.name === "Friends")?.state;
//     return activeTabRoute && "routes" in activeTabRoute
//       ? activeTabRoute.routes[activeTabRoute.index ?? 0]?.name || "FriendScreen"
//       : "FriendScreen";
//   });

//   useEffect(() => {
//     if (currentRouteName) {
//       navigation.setOptions({
//         headerTitle: currentRouteName === 'FriendScreen' ? 'Friends List' : 'Friend Requests',
//       });
//     }
//   }, [currentRouteName, navigation]);

//   const handleGoBackButton = () => {
//     if (!userData) return;

//     if (userData.isGroupLeader || userData.isGroupMember) {
//       navigation.reset({
//         index: 0,
//         routes: [
//           {
//             name: 'GroupApp' as keyof RootStackParamList, // Ensures GroupApp is recognized
//             params: { screen: 'More' }, // Ensure 'ProfileScreen' exists in RootStackParamList
//           } as unknown as never,
//         ],
//       });
//     } else {
//       navigation.reset({
//         index: 0,
//         routes: [
//           {
//             name: 'PublicApp' as keyof RootStackParamList, // Ensures GroupApp is recognized
//             params: { screen: 'More' }, // Ensure 'ProfileScreen' exists in RootStackParamList
//           } as unknown as never,
//         ],
//       });
//     }
//   }

//   useEffect(() => {
//     console.log('Current Route:', currentRouteName, 'Navigation State:', navigation.getState());
//   }, [currentRouteName, navigation]);


//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => handleGoBackButton()}>
//           <Icon1 name="arrowleft" size={25} color="white" />
//         </TouchableOpacity>
//         <View style={styles.spacer} />

//         <Text style={styles.headerText}>{currentRouteName === 'FriendScreen' ? 'Friends List' : 'Friend Requests'}</Text>
//         <View style={styles.spacer} />
//       </View>
//       {currentUser ? (
//         <>
//           <View style={styles.navbar}>
//             <View style={styles.contentRow}>
//               <View>
//                 <TouchableOpacity onPress={() => navigate('Friends', { screen: 'FriendScreen' })} style={styles.button}>
//                   {/* <Text style={styles.title}>{buttonText}</Text> */}
//                   <Text style={[styles.buttonText, currentRouteName === 'FriendScreen' ? { color: '#00BFFF' } : {},]}>Friends list</Text>
//                 </TouchableOpacity>
//                 <View style={[styles.activePage, currentRouteName === 'FriendScreen' ? { backgroundColor: '#00BFFF' } : {},]}></View>
//               </View>
//               <View>
//                 <TouchableOpacity
//                   onPress={() => navigate('Friends', { screen: 'FriendRequestScreen' })}
//                   style={styles.button}>
//                   <Text style={[styles.buttonText, currentRouteName === 'FriendRequestScreen' ? { color: '#00BFFF' } : {},]}>Friend requests</Text>
//                 </TouchableOpacity>
//                 <View style={[styles.activePage, currentRouteName === 'FriendRequestScreen' ? { backgroundColor: '#00BFFF' } : {},]}></View>
//               </View>
//             </View>
//           </View>
//         </>
//       ) : (
//         <Text>Please log in.</Text>
//       )}
//     </View>
//   );
// };

// export default FriendNav;

// const styles = StyleSheet.create({
//   container: {
//   },
//   header: {
//     height: 65,
//     backgroundColor: '#5f4c4c',
//     padding: 15,
//     alignItems: 'center',
//     flexDirection: "row"
//   },
//   headerText: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: 'white',
//     marginRight: 20,
//   },
//   spacer: {
//     flex: 1,
//   },
//   navbar: {
//     width: '100%',
//     backgroundColor: '#5f4c4c',
//     justifyContent: 'center',
//   },
//   contentRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-evenly',
//     alignItems: 'center',
//   },
//   button: {
//     height: 50,
//     minWidth: "50%",
//     backgroundColor: '#5f4c4c',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   buttonText: {
//     fontSize: 16,
//     color: 'lightgrey',
//     fontWeight: 'bold',
//   },
//   leaveButtonText: {
//     fontSize: 16,
//     color: 'lightgrey',
//     fontWeight: 'bold',
//   },
//   activePage: {
//     height: 5,
//     width: "100%",
//     backgroundColor: '#5f4c4c',
//   }
// });
