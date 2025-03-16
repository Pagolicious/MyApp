import { StyleSheet, Text, View, Alert, Platform } from 'react-native';
import React, { useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

//Navigation
import { NativeStackScreenProps } from '@react-navigation/native-stack';
// import { RootStackParamList } from '../App';

//Components
import MyButton from '../components/MyButton';
import MyTextInput from '../components/MyTextInput';
import SocialMedia from '../components/SocialMedia';

//Firebase
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

//Context
import { AuthContext } from '../context/AuthContext';
import { useGroup } from '../context/GroupContext'

//Hooks
import { useGroupData } from '../hooks/useGroupData';

//Services
import { navigate } from '../services/NavigationService';

// type NameProps = NativeStackScreenProps<RootStackParamList, 'LoginScreen'>;

const LoginScreen = () => {
  const { signIn, setCurrentUser, currentUser, userData } = useContext(AuthContext)!;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const { currentGroup } = useGroup();

  const loginWithEmailAndPassword = async () => {
    try {
      setLoading(true);
      await signIn(email, password); // This updates the Firebase auth state

      // Wait briefly to ensure `auth().currentUser` is updated
      const user = auth().currentUser;
      setCurrentUser(user);



      if (!user) {
        Alert.alert('User not found. Please try again.');
        setLoading(false);
        return;
      }

      // ✅ Wait for `userData` to be available
      let retries = 10;
      while (!userData && retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms
        retries--;
      }

      if (!userData) {
        Alert.alert("Error loading user data. Please try again.");
        setLoading(false);
        return;
      }


      if (userData?.isGroupLeader) {
        navigate('GroupApp', { screen: 'MyGroupScreen' });
      } else if (userData?.isGroupMember) {
        navigate('GroupApp', { screen: 'MembersHomeScreen' });
      } else if (!userData?.firstName || !userData?.lastName) {
        navigate('NamePage');
      } else {
        navigate('PublicApp', { screen: 'FindOrStart' })
      }
      setLoading(false);

    } catch (error) {
      const errorMessage =
        (error as { message?: string }).message || 'An unknown error occurred';
      Alert.alert(errorMessage);
      // setLoading(false);
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
});

export default LoginScreen;
