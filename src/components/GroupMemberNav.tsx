// import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
// import React from 'react';

// //Navigation
// import { RootStackParamList } from '../utils/types';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import { useNavigation, useRoute } from '@react-navigation/native';

// //Context
// import { useAuth } from '../context/AuthContext';
// import { useModal } from '../context/ModalContext';

// const GroupNav = () => {
//   const navigation =
//     useNavigation<NativeStackNavigationProp<RootStackParamList>>();
//   const { currentUser } = useAuth();
//   const { setLeaveModalVisible, leaveModalVisible } = useModal();
//   const route = useRoute();

//   const isActive = (screenName: string) => route.name === screenName;

//   if (!currentUser) {
//     return null;
//   }

//   return (
//     <View style={styles.container}>
//       {currentUser ? (
//         <>
//           <View style={styles.navbar}>
//             <View style={styles.contentRow}>
//               <View style={styles.leftButtons}>
//                 <View>
//                   <TouchableOpacity onPress={() => navigation.navigate('FindGroup')} style={styles.button}>
//                     <Text style={[styles.buttonText, isActive('FindGroup') ? { color: '#00BFFF' } : {},]}>Browse</Text>
//                   </TouchableOpacity>
//                   <View style={[styles.activePage, isActive('FindGroup') ? { backgroundColor: '#00BFFF' } : {},]}></View>
//                 </View>
//                 <View>
//                   <TouchableOpacity
//                     onPress={() => navigation.navigate('RequestScreen')}
//                     style={styles.button}>
//                     <Text style={[styles.buttonText, isActive('RequestScreen') ? { color: '#00BFFF' } : {},]}>Request</Text>
//                   </TouchableOpacity>
//                   <View style={[styles.activePage, isActive('RequestScreen') ? { backgroundColor: '#00BFFF' } : {},]}></View>
//                 </View>
//               </View>
//               <View style={styles.rightButton}>
//                 <View>
//                   <TouchableOpacity onPress={() => setLeaveModalVisible(true)} style={styles.button}>
//                     <Text style={[styles.leaveButtonText, leaveModalVisible === true ? { color: 'red' } : {},]}>Leave</Text>
//                   </TouchableOpacity>
//                   <View style={[styles.activePage, leaveModalVisible === true ? { backgroundColor: 'red' } : {},]}></View>
//                 </View>
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
//   navbar: {
//     width: '100%',
//     backgroundColor: '#5f4c4c',
//     justifyContent: 'center',
//   },
//   contentRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   leftButtons: {
//     flexDirection: 'row',
//   },
//   rightButton: {
//     flexDirection: 'row',
//     justifyContent: 'flex-end',
//   },
//   button: {
//     height: 50,
//     width: 100,
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
//     width: 100,
//     backgroundColor: '#5f4c4c',
//   }
// });
