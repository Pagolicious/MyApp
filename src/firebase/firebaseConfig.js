import { initializeApp } from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBPqTR6oxbYO1qV_A8yiLSFYSHaZFojZso",
  authDomain: "react-native-myapp-29737.firebaseapp.com",
  projectId: "react-native-myapp-29737",
  storageBucket: "react-native-myapp-29737.appspot.com",
  messagingSenderId: "116087539647",
  appId: "1:116087539647:android:91518bb7a19c3456b5830a",
};

// Initialize Firebase
const FirebaseApp = initializeApp(firebaseConfig);

export default FirebaseApp;
export { auth }; // Export auth for use in other files
