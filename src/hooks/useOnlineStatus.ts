import { useEffect } from 'react';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { AppState } from 'react-native';

const useOnlineStatus = () => {
  useEffect(() => {
    const updateStatus = async (isOnline: boolean) => {
      const user = auth().currentUser;
      if (user) {
        console.log(`Updating online status for ${user.uid}: ${isOnline}`);
        await firestore()
          .collection('users')
          .doc(user.uid)
          .update({ isOnline })
          .catch(error => console.error('Firestore update error:', error));
      }
    };

    // App state change listener (Handles app going to background/inactive)
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        updateStatus(false); // Set offline when app closes
      } else if (nextAppState === 'active') {
        updateStatus(true); // Set online when app is reopened
      }
    };

    const appStateListener = AppState.addEventListener('change', handleAppStateChange);

    // Auth state change listener (Handles login/logout)
    const unsubscribeAuth = auth().onAuthStateChanged(user => {
      if (user) {
        updateStatus(true); // User logged in → Set online
      } else {
        updateStatus(false); // User logged out → Set offline
      }
    });

    return () => {
      console.log('Cleaning up useOnlineStatus'); // Debugging log
      appStateListener.remove();
      unsubscribeAuth();
    };
  }, []);

  return null;
};

export default useOnlineStatus;
