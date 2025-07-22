// import { StyleSheet, Text, View, ImageBackground, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native'
// import React, { useEffect, useState } from 'react'

// //Firebase
// import firestore from '@react-native-firebase/firestore';

// //Components
// // import GroupMemberNav from '../components/GroupMemberNav';
// import FooterGroupNav from '../components/FooterGroupNav';
// import CustomAvatar from '../components/CustomAvatar';

// //Context
// import { useAuth } from '../context/AuthContext';

// //Icons
// import Icon1 from 'react-native-vector-icons/Entypo';

// //Types
// import { Friend } from '../types/userTypes';

// const RequestScreen = () => {
//   const { currentUser } = useAuth()
//   const [friends, setFriends] = useState<Friend[]>([]);

//   useEffect(() => {
//     if (!currentUser) return;

//     const unsubscribe = firestore()
//       .collection('users')
//       .doc(currentUser.uid)
//       .onSnapshot((doc) => {
//         if (doc.exists) {
//           const userData = doc.data();
//           setFriends(userData?.friends || []);
//         } else {
//           setFriends([])
//         }
//       }, (error) => {
//         console.error('Error fetching friends:', error);
//       });

//     return () => unsubscribe();
//   }, [currentUser]);

//   const inviteToGroup = () => {

//   }

//   if (!currentUser) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#0000ff" />
//         <Text style={styles.nameText}>Loading User...</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <ImageBackground
//         source={require('../assets/BackgroundImages/whiteBackground.jpg')}
//         style={styles.backgroundImage}
//       >
//         <View style={styles.onlineHeader}>
//           <Text style={styles.onlineText}>Online</Text>
//         </View>
//         <FlatList
//           data={friends}
//           keyExtractor={(item) => item.uid}
//           renderItem={({ item }) => (
//             <View style={styles.friendContainer}>
//               <View style={styles.row}>
//                 <CustomAvatar
//                   uid={item.uid || 'default-uid'}
//                   firstName={item.firstName || 'Unknown'}
//                   size={60}
//                 />
//                 <Text style={styles.nameText}>{item.firstName}</Text>
//               </View>
//               {currentUser.uid !== item.uid &&
//                 <View>
//                   <TouchableOpacity style={styles.inviteFriendBtn} onPress={() => inviteToGroup()}>
//                     <Icon1 name="plus" size={20} color="black" />
//                   </TouchableOpacity>
//                 </View>
//               }
//             </View>
//           )}
//           ListEmptyComponent={
//             <Text style={styles.noFriendsText}>No friends available</Text>
//           }
//         />

//       </ImageBackground>
//       <FooterGroupNav />
//     </View>
//   )
// }

// export default RequestScreen

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
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
//   backgroundImage: {
//     flex: 1,
//     resizeMode: "cover",
//   },
//   onlineHeader: {
//     borderBottomWidth: 1,
//     padding: 5
//   },
//   onlineText: {
//     fontSize: 24,
//     textAlign: "center"

//   },
//   noFriendsText: {
//     flex: 1,
//     textAlign: "center",
//     marginTop: 200,
//     fontSize: 24
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   friendContainer: {
//     justifyContent: 'space-between',
//     alignItems: "center",
//     borderBottomWidth: 1,
//     padding: 10,
//     flexDirection: "row",
//   },
//   row: {
//     flexDirection: "row",
//     alignItems: 'center',
//   },
//   nameText: {
//     fontSize: 30,
//     textAlign: "center",
//     marginLeft: 15,
//   },
//   inviteFriendBtn: {
//     backgroundColor: '#4CBB17',
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
// })
