import { StyleSheet, Text, View, FlatList } from 'react-native'
import React, { useState, useEffect } from 'react'
import firestore from "@react-native-firebase/firestore";

import CustomAvatar from './CustomAvatar'

//Contexts
import { useAuth } from '../context/AuthContext';

interface SearchParty {
  leaderUid: string;
  leaderFirstName: string;
  leaderLastName: string;
  members: Member[];
}

interface Member {
  uid: string;
  firstName: string;
  lastName?: string;
}

const PartyDisplay = () => {
  const [userParty, setUserParty] = useState<SearchParty | null>(null);
  const { currentUser } = useAuth()

  useEffect(() => {
    if (!currentUser) return;

    const fetchUserParty = async () => {
      try {
        const snapshot = await firestore().collection("searchParties").get();

        let foundParty: SearchParty | null = null;
        snapshot.forEach((doc) => {
          const data = doc.data();
          const members: Member[] = data.members || [];

          // Check if user is either the leader or a member
          if (data.leaderUid === currentUser.uid || members.some((m) => m.uid === currentUser.uid)) {
            foundParty = {
              leaderUid: data.leaderUid,
              leaderFirstName: data.leaderFirstName,
              leaderLastName: data.leaderLastName,
              members,
            };
          }
        });

        setUserParty(foundParty);
      } catch (error) {
        console.error("Error fetching user search party:", error);
      }
    };

    fetchUserParty();
  }, [currentUser]);

  // Handle empty party
  const members = userParty?.members || [];
  const displayedMembers = members.slice(0, 2); // Show up to 3 avatars
  const extraCount = members.length - 2;

  // Ensure leader is first
  const avatars: Member[] = [...displayedMembers]; // Copy members list
  avatars.unshift({
    uid: userParty?.leaderUid || '',
    firstName: userParty?.leaderFirstName || '',
  });

  return (
    <View style={styles.container}>
      <View style={styles.avatarStack}>
        {/* Render all avatars, including the leader first */}
        {avatars.map((member, index) => (
          <View key={member.uid} style={[styles.avatarWrapper, { marginLeft: index * 15, zIndex: avatars.length - index }]}>
            <CustomAvatar
              uid={member.uid}
              firstName={member.firstName}
              size={30}
            />
          </View>
        ))}

        {/* +X Extra Count */}
        {extraCount > 0 && (
          <View style={[styles.extraAvatar, { marginLeft: avatars.length * 21, zIndex: 1 }]}>
            <Text style={styles.extraText}>+{extraCount}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default PartyDisplay;

const styles = StyleSheet.create({
  container: {
    padding: 15,
    alignItems: 'center',
    // marginRight: 50

  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  avatarWrapper: {
    position: 'absolute',
  },
  extraAvatar: {
    // width: 40,
    // height: 40,
    // borderRadius: 20,
    // backgroundColor: '#ddd',
    // justifyContent: 'center',
    // alignItems: 'center',
    position: 'absolute',
    // left: 20

  },
  extraText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: "white",
  },
});

//   return (
//     <View style={styles.container}>
//       <View style={styles.row}>
//         <CustomAvatar
//           uid={userParty?.leaderUid || 'default-uid'}
//           firstName={userParty?.leaderFirstName || 'Unknown'}
//           size={30}
//         />
//         <FlatList
//           data={userParty?.members}
//           keyExtractor={(member) => member.uid}
//           renderItem={({ item }) => {
//             if (!item || !item.uid) return null;

//             return (
//               <View style={styles.extraAvatar}>
//                 <CustomAvatar
//                   uid={item.uid || 'default-uid'}
//                   firstName={item.firstName || 'Unknown'}
//                   size={30}
//                 />
//               </View>
//             )
//           }}
//         />
//       </View>
//     </View>
//   )
// }

// export default PartyDisplay

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,

//   },
//   row: {
//     flexDirection: "row",
//     // borderWidth: 2

//   },
//   extraAvatar: {
//     marginLeft: -15
//   }
// })
