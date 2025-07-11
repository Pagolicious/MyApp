import React, {
  createContext,
  useEffect,
  useState,
  ReactNode,
  useContext,
} from 'react';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

import { User } from '../types/userTypes';

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

  // Set up persistence and track authentication state
  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(user => {
      setCurrentUser(user); // Update state with the current user
    });

    return subscriber; // Cleanup subscription on unmount
  }, []);

  useEffect(() => {
    if (!currentUser?.uid) return;


    // Attach a real-time Firestore listener to the user's document
    const unsubscribe = firestore()
      .collection('users')
      .doc(currentUser.uid)
      .onSnapshot(
        (docSnapshot) => {
          if (docSnapshot.exists) {
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

  const signOut = async () => {
    if (currentUser) {
      await firestore().collection('users').doc(currentUser.uid).set({ isOnline: false }, { merge: true });
    }
    setCurrentUser(null);
    await auth().signOut();


  };

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
