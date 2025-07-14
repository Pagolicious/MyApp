// import React, { useEffect, useState } from 'react';
// import { View, Text, StyleSheet, ScrollView } from 'react-native';
// import auth from '@react-native-firebase/auth';
// import firestore from '@react-native-firebase/firestore';
// import database from '@react-native-firebase/database';

// const PresenceDebugScreen = () => {
//   const [firestorePresence, setFirestorePresence] = useState<any>(null);
//   const [rtdbPresence, setRtdbPresence] = useState<any>(null);
//   const uid = auth().currentUser?.uid;

//   useEffect(() => {
//     if (!uid) return;

//     const fsUnsub = firestore()
//       .collection('users')
//       .doc(uid)
//       .collection('status')
//       .doc('presence')
//       .onSnapshot(doc => {
//         setFirestorePresence(doc.data());
//       });

//     const rtdbRef = database().ref(`status/${uid}`);
//     const rtdbListener = rtdbRef.on('value', snapshot => {
//       setRtdbPresence(snapshot.val());
//     });

//     return () => {
//       fsUnsub();
//       rtdbRef.off('value', rtdbListener);
//     };
//   }, [uid]);

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Text style={styles.title}>Presence Debug</Text>

//       <Text style={styles.header}>Firestore Presence</Text>
//       <Text>{JSON.stringify(firestorePresence, null, 2)}</Text>

//       <Text style={styles.header}>Realtime DB Presence</Text>
//       <Text>{JSON.stringify(rtdbPresence, null, 2)}</Text>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: { padding: 20 },
//   title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
//   header: { fontSize: 18, fontWeight: '600', marginTop: 15 },
// });

// export default PresenceDebugScreen;

import React, { useState } from 'react';
import { View, Text, Button, SafeAreaView } from 'react-native';
import database from '@react-native-firebase/database';
import { firebase } from '@react-native-firebase/database';

const PresenceDebugScreen = () => {
  const [kingValue, setKingValue] = useState<number | null>(null);

  const readKingValue = async () => {
    console.log('Reading /king...');
    try {
      const db = firebase
        .app()
        .database('https://react-native-myapp-29737-default-rtdb.europe-west1.firebasedatabase.app');

      // const snap = await db.ref('/king').once('value');

      const snapshot = await db.ref('/king').once('value');
      const value = snapshot.val();
      console.log('🔥 Fetched King Value:', value);
      setKingValue(value);
    } catch (error) {
      console.error('❌ Failed to read /king:', error);
    }
  };


  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button title="Load King" onPress={() => {
        console.log('Button Pressed 🧠');
        readKingValue();
      }} />

      {kingValue !== null ? (
        <Text style={{ marginTop: 20, fontSize: 18 }}>👑 King Value: {kingValue}</Text>
      ) : (
        <Text style={{ marginTop: 20 }}>No King value loaded yet.</Text>
      )}
    </SafeAreaView>
  );
};



export default PresenceDebugScreen;
