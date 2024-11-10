import {StyleSheet, Text, View, Alert, Platform} from 'react-native';
import React, {useState, useContext} from 'react';

//Navigation
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../App';

//Components
import MyButton from '../components/MyButton';
import MyTextInput from '../components/MyTextInput';
import SocialMedia from '../components/SocialMedia';

//Firebase
import firestore from '@react-native-firebase/firestore';

//AuthContext
import {AuthContext} from '../context/AuthContext';
// import { useGroup } from '../context/GroupContext'

type NameProps = NativeStackScreenProps<RootStackParamList, 'LoginScreen'>;

const LoginScreen = ({navigation}: NameProps) => {
  const {signIn, currentUser} = useContext(AuthContext)!;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // const { currentGroupId } = useGroup()

  const loginWithEmailAndPassword = async () => {
    try {
      await signIn(email, password);
      if (currentUser) {
        const checkNewUser = await firestore()
          .collection('users')
          .doc(currentUser.uid)
          .get();

        const userOwnsGroupQuery = await firestore()
          .collection('groups')
          .where('createdBy', '==', currentUser.uid)
          .get();

        if (!userOwnsGroupQuery.empty) {
          navigation.navigate('MyGroupScreen');
        } else if (checkNewUser.exists && checkNewUser.data()?.firstName) {
          navigation.navigate('FindOrStart');
        } else {
          navigation.navigate('NamePage');
        }
      } else {
        Alert.alert('User not found. Please try again.');
      }
    } catch (error) {
      const errorMessage =
        (error as {message?: string}).message || 'An unknown error occurred';
      Alert.alert(errorMessage);
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
          />
          <MyTextInput
            value={password}
            onChangeText={(text: string) => setPassword(text.trim())}
            placeholder="Password"
            secureTextEntry
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
