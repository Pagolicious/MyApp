import React, { createContext, useEffect, useState, ReactNode, useContext } from 'react';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';

interface AuthContextType {
  currentUser: FirebaseAuthTypes.User | null; // Use the User type from FirebaseAuthTypes
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseAuthTypes.User | null>(null);

  // Set up an effect to track the authentication state
  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(user => {
      setCurrentUser(user); // Update state with the current user
    });

    return subscriber; // Cleanup subscription on unmount
  }, []);

  const signIn = async (email: string, password: string) => {
    await auth().signInWithEmailAndPassword(email, password);
  };

  const signOut = async () => {
    await auth().signOut();
  };

  return (
    <AuthContext.Provider value={{ currentUser, signIn, signOut }}>
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
