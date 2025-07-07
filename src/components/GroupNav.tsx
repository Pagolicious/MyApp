// import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
// import React, { useState, useEffect } from 'react';

// //Navigation
// import { useNavigation } from '@react-navigation/native';
// import { useNavigationState } from '@react-navigation/native';

// // AuthContext
// import { useAuth } from '../context/AuthContext';

// //Services
// import { navigate } from '../services/NavigationService';

// const GroupNav = () => {
//   const navigation = useNavigation()

//   const { currentUser, userData } = useAuth();

//   const currentRouteName = useNavigationState((state) => {
//     const activeTabRoute = state?.routes.find((r) => r.name === "My Group")?.state;

//     const defaultRoute = userData?.isGroupLeader ? "MyGroupScreen" : "MembersHomeScreen";

//     return activeTabRoute && "routes" in activeTabRoute
//       ? activeTabRoute.routes[activeTabRoute.index ?? 0]?.name || defaultRoute
//       : defaultRoute;
//   });

//   useEffect(() => {
//     if (currentRouteName) {
//       navigation.setOptions({
//         tabBarLabel: currentRouteName === 'MyGroupScreen' ? 'Applicants' : 'Members',
//       });
//     }
//   }, [currentRouteName]);

//   useEffect(() => {
//     console.log('Current Route:', currentRouteName);
//   }, [currentRouteName]);


//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <Text style={styles.headerText}>My Group</Text>
//       </View>
//       {currentUser ? (
//         <>
//           <View style={styles.navbar}>
//             <View style={styles.contentRow}>
//               <View>
//                 <TouchableOpacity
//                   onPress={() => navigate('MyGroupScreen')}
//                   style={styles.button}>
//                   <Text style={[styles.buttonText, currentRouteName === 'MyGroupScreen' ? { color: '#00BFFF' } : {},]}>Applicants</Text>
//                 </TouchableOpacity>
//                 <View style={[styles.activePage, currentRouteName === 'MyGroupScreen' ? { backgroundColor: '#00BFFF' } : {},]}></View>
//               </View>
//               <View>
//                 <TouchableOpacity
//                   onPress={() => navigate('MembersHomeScreen')}
//                   style={styles.button}>
//                   <Text style={[styles.buttonText, currentRouteName === 'MembersHomeScreen' ? { color: '#00BFFF' } : {},]}>Members</Text>
//                 </TouchableOpacity>
//                 <View style={[styles.activePage, currentRouteName === 'MembersHomeScreen' ? { backgroundColor: '#00BFFF' } : {},]}></View>
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

// export default GroupNav;

// const styles = StyleSheet.create({
//   container: {
//   },
//   header: {
//     height: 65,
//     backgroundColor: '#5f4c4c',
//     padding: 15,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   headerText: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: 'white',
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
