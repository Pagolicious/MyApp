import {
  StyleSheet,
  Text,
  View,
  Alert,
  Platform,
  TouchableOpacity,

} from 'react-native';
import React, { useEffect, useState } from 'react';

//Navigation
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../utils/types';

//Components
import MyButton from '../components/MyButton';
import MyTextInput from '../components/MyTextInput';
import SocialMedia from '../components/SocialMedia';

//Firebase
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';
import inAppMessaging from '@react-native-firebase/in-app-messaging';
import FirebaseMessagingService from '../services/FirebaseMessagingService';

//Utils
import handleFirestoreError from '../utils/firebaseErrorHandler';

type NameProps = NativeStackScreenProps<RootStackParamList, 'SignUpScreen'>;

const SignUpScreen = ({ navigation }: NameProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const requestUserPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Authorization status:', authStatus);
    }
  };

  const signUp = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Passwords do not match');
      return;
    }
    try {
      // Create user with email and password
      const userCredential = await auth().createUserWithEmailAndPassword(
        email,
        password,
      );
      const userId = userCredential.user.uid;

      // Generate the FCM token
      const fcmToken = await messaging().getToken();

      // Save the user data along with the FCM token to Firestore
      await firestore().collection('users').doc(userId).set({
        email: email,
        fcmToken: fcmToken,
        createdAt: firestore.FieldValue.serverTimestamp(), // Track when the user was created
        isOnline: false,
        isPartyLeader: false,
        isPartyMember: false,
        isGroupLeader: false,
        isGroupMember: false,
        groupId: ''
      });

      Alert.alert('User Created! Please Login');
      navigation.navigate('LoginScreen');
    } catch (err: unknown) {
      const errorMessage =
        (err as Error).message || 'An unknown error occurred';
      Alert.alert(errorMessage);
      handleFirestoreError(err)
    }
  }
  useEffect(() => {
    requestUserPermission();

    inAppMessaging().setMessagesDisplaySuppressed(false);

    FirebaseMessagingService.setupMessagingHandlers(navigation);

    return () => {
      // Cleanup if necessary
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.imageBackground}>
        <Text style={styles.title}>MyApp</Text>
        <View style={styles.inputContainer}>
          <MyTextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor="lightgray"
          />
          <MyTextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor="lightgray"
            secureTextEntry
            style={{ color: 'black' }}
          />
          <MyTextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm Password"
            placeholderTextColor="lightgray"
            secureTextEntry
            style={{ color: 'black' }}
          />

          <MyButton onPress={signUp} title={'Sign Up'} />
          <View style={styles.lineContainer}>
            <View style={styles.line} />
            <Text style={styles.textOr}>Or</Text>
            <View style={styles.line} />
          </View>
          <Text style={styles.signInText}>Sign in with</Text>

          <SocialMedia />
          <View style={styles.containerHaveAccount}>
            <Text style={styles.textHaveAccount}>Already have an account?</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('LoginScreen')}>
              <Text style={styles.buttonSignIn}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageBackground: {
    backgroundColor: '#C41E3A',
    height: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 40,
    color: 'white',
    marginTop: Platform.OS == 'android' ? 60 : 110,
  },
  inputContainer: {
    height: 550,
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    paddingHorizontal: 20,
  },
  textHaveAccount: {
    alignSelf: 'center',
    marginRight: 10,
    color: 'black',
    marginBottom: 5,
    marginTop: 15,
    fontSize: 12,
  },
  containerHaveAccount: {
    flexDirection: 'row',
  },
  buttonSignIn: {
    alignSelf: 'center',
    marginRight: 10,
    color: 'blue',
    marginBottom: 5,
    marginTop: 15,
    fontSize: 12,
  },
  lineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: 'grey',
    marginHorizontal: 10,
  },
  textOr: {
    fontSize: 16,
    textAlign: 'center',
    color: 'black',
  },
  signInText: {
    fontSize: 12,
    marginBottom: 5,
    color: 'black',
  },
});

export default SignUpScreen;
