import React, {
  createContext,
  useEffect,
  useState,
  ReactNode,
  useContext,
} from 'react';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import database from '@react-native-firebase/database';

import { User } from '../types/userTypes';
import { getDatabase } from '../firebase/getDatabase';
import { useGroupStore } from '../stores/groupStore';


interface AuthContextType {
  currentUser: FirebaseAuthTypes.User | null;
  setCurrentUser: (user: FirebaseAuthTypes.User | null) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  userData: User | null;
  setUserData: (data: User | null) => void;

}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const { clearGroup } = useGroupStore()
  // Set up persistence and track authentication state
  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(user => {
      setCurrentUser(user); // Update state with the current user
    });

    return subscriber; // Cleanup subscription on unmount
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    console.log("👤 Setting up presence for:", currentUser.uid);

    const uid = currentUser.uid;
    const rtdbRef = getDatabase().ref(`/status/${uid}`);
    const fsRef = firestore()
      .collection('users')
      .doc(uid)
      .collection('status')
      .doc('presence');
    const connectedRef = getDatabase().ref('.info/connected');

    let isMounted = true;

    const onConnectionChanged = connectedRef.on('value', async (snapshot: any) => {
      if (!isMounted) return;

      const connected = snapshot.val();
      if (connected === false) {
        await fsRef.set({
          online: false,
          lastSeen: firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        return;
      }

      try {
        // Realtime DB presence
        await rtdbRef.set({
          online: true,
          lastSeen: { ".sv": "timestamp" }
        });

        rtdbRef.onDisconnect().set({
          online: false,
          lastSeen: { ".sv": "timestamp" }
        });

        // Firestore presence (for querying)
        await fsRef.set({
          online: true,
          lastSeen: firestore.FieldValue.serverTimestamp()
        }, { merge: true });
      } catch (error) {
        console.error("❌ Error setting presence:", error);
      }
    });

    return () => {
      isMounted = false;
      connectedRef.off('value', onConnectionChanged);
      console.log("🧹 Cleaned up presence listener for:", uid);
    };
  }, [currentUser]);

  //   useEffect(() => {
  //   if (!currentUser) {
  //     setUserData(null);
  //     return;
  //   }

  //   const unsubscribe = firestore()
  //     .collection('users')
  //     .doc(currentUser.uid)
  //     .onSnapshot(doc => {
  //       const data = doc.data();

  //       if (!data) {
  //         setUserData(null);
  //         return;
  //       }

  //       const typedUser: User = {
  //         uid: currentUser.uid,
  //         email: data.email,
  //         firstName: data.firstName,
  //         lastName: data.lastName,
  //         dateOfBirth: data.dateOfBirth,
  //         gender: data.gender,
  //         groups: data.groups || [],
  //       };

  //       setUserData(typedUser);
  //     });

  //   return () => unsubscribe();
  // }, [currentUser]);



  useEffect(() => {
    if (!currentUser?.uid) return;


    // Attach a real-time Firestore listener to the user's document
    const unsubscribe = firestore()
      .collection('users')
      .doc(currentUser.uid)
      .onSnapshot(
        (docSnapshot) => {
          if (docSnapshot.exists()) {
            const newUserData = docSnapshot.data() as User;
            setUserData((prevUserData) => {
              // Only update state if something actually changed
              if (JSON.stringify(prevUserData) !== JSON.stringify(newUserData)) {
                return newUserData;
              }
              return prevUserData;
            });
          } else {
            setUserData(null);
          }

        },
        (error) => {
          console.error('Error listening to user data:', error);
        }
      );

    // Cleanup the listener when the component unmounts or the user changes
    return () => unsubscribe();
  }, [currentUser?.uid]);

  const signIn = async (email: string, password: string) => {
    await auth().signInWithEmailAndPassword(email, password);
  };

  const clearPresence = async (uid: string) => {
    const rtdbRef = getDatabase().ref(`/status/${uid}`);
    const fsRef = firestore().doc(`users/${uid}/status/presence`);

    await Promise.allSettled([
      rtdbRef.set({ online: false, lastSeen: { ".sv": "timestamp" } }),
      fsRef.set({ online: false, lastSeen: firestore.FieldValue.serverTimestamp() }, { merge: true })
    ]);
  };

  const signOut = async () => {
    if (currentUser) {
      await clearPresence(currentUser.uid);
    }
    await auth().signOut();
    clearGroup()
    setCurrentUser(null);
    setUserData(null);
  };


  // const signOut = async () => {
  //   if (currentUser) {
  //     await firestore().collection('users').doc(currentUser.uid).set({ isOnline: false }, { merge: true });
  //   }
  //   setCurrentUser(null);
  //   await auth().signOut();


  // };

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser, signIn, signOut, userData, setUserData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
