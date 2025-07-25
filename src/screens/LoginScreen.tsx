import { StyleSheet, Text, View, Alert, Platform, TouchableOpacity } from 'react-native';
import React, { useState, useContext, useEffect } from 'react';
import database from '@react-native-firebase/database';

//Components
import MyButton from '../components/MyButton';
import MyTextInput from '../components/MyTextInput';
import SocialMedia from '../components/SocialMedia';

//Firebase
import auth from '@react-native-firebase/auth';
import { getDatabase } from '../firebase/getDatabase';

//Context
import { AuthContext } from '../context/AuthContext';
// import { useGroup } from '../context/GroupContext'

//Services
import { navigate } from '../services/NavigationService';

const LoginScreen = () => {
  const { signIn, setCurrentUser, currentUser, userData } = useContext(AuthContext)!;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser || !userData) return;

    if (!userData.dateOfBirth || !userData.firstName || !userData.gender) {
      navigate('NamePage');
    } else {
      navigate('TabNav', {
        screen: 'My Groups',
        params: {
          screen: 'SelectGroupScreen'
        }
      })
    }

    setLoading(false);
  }, [userData]);


  // const loginWithEmailAndPassword = async () => {
  //   try {
  //     setLoading(true);
  //     await signIn(email, password); // This updates the Firebase auth state

  //     // Wait briefly to ensure `auth().currentUser` is updated
  //     const user = auth().currentUser;
  //     setCurrentUser(user);

  //     if (!user) {
  //       Alert.alert('User not found. Please try again.');
  //       setLoading(false);
  //       return;
  //     }

  //     // Wait for `userData` to be available
  //     let retries = 10;
  //     while (!userData && retries > 0) {
  //       await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms
  //       retries--;
  //     }

  //     if (!userData) {
  //       Alert.alert("Error loading user data. Please try again.");
  //       setLoading(false);
  //       return;
  //     }

  //     if (!userData.dateOfBirth || !userData.firstName || !userData.gender) {
  //       navigate('NamePage');
  //     } else if (userData.groups?.length > 0) {
  //       navigate('GroupApp', { screen: 'SelectGroupScreen' });
  //     } else {
  //       navigate('PublicApp', { screen: 'FindOrStart' })
  //     }
  //     setLoading(false);
  //     console.log("Writing to Realtime DB");


  //   } catch (error) {
  //     const errorMessage =
  //       (error as { message?: string }).message || 'An unknown error occurred';
  //     Alert.alert(errorMessage);
  //   }
  // };
  const loginWithEmailAndPassword = async () => {
    try {
      setLoading(true);
      await signIn(email, password); // this updates currentUser automatically
    } catch (error) {
      const errorMessage =
        (error as { message?: string }).message || 'An unknown error occurred';
      Alert.alert(errorMessage);
      setLoading(false);
    }
  };



  return (
    <View style={styles.container}>
      <View style={styles.imageBackground}>
        <Text style={styles.title}>MyApp</Text>
        <View style={styles.inputContainer}>
          <MyTextInput
            value={email}
            onChangeText={(text: string) => setEmail(text.trim())}
            placeholder="Email"
            placeholderTextColor="gray"
          />
          <MyTextInput
            value={password}
            onChangeText={(text: string) => setPassword(text.trim())}
            placeholder="Password"
            placeholderTextColor="gray"
            secureTextEntry
            style={{ color: 'black' }}
          />
          <MyButton title={'Login'} onPress={loginWithEmailAndPassword} />

          <View style={styles.lineContainer}>
            <View style={styles.line} />
            <Text style={styles.textOr}>Or</Text>
            <View style={styles.line} />
          </View>
          <Text style={styles.signInText}>Sign in with</Text>

          <SocialMedia />
          <View style={styles.containerHaveAccount}>
            <Text style={styles.textHaveAccount}>Don't have an account?</Text>
            <TouchableOpacity
              onPress={() => navigate('SignUpScreen')}>
              <Text style={styles.buttonSignIn}>Sign Up</Text>
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
    marginTop: Platform.OS === 'android' ? 60 : 110,
  },
  inputContainer: {
    height: 450,
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    paddingHorizontal: 20,
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
    backgroundColor: 'black',
    marginHorizontal: 10,
  },
  textOr: {
    fontSize: 16,
    textAlign: 'center',
  },
  signInText: {
    fontSize: 12,
    marginBottom: 5,
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
});

export default LoginScreen;
