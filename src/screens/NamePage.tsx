import {
  StyleSheet,
  Text,
  View,
  Alert,
  TextInput,
  ImageBackground,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import Toast from 'react-native-toast-message';
import Ripple from 'react-native-material-ripple';


//Firebase
import firestore from '@react-native-firebase/firestore';

//Context
import { useAuth } from '../context/AuthContext';

//Services
import { navigate } from '../services/NavigationService';

//Utils
import handleFirestoreError from '../utils/firebaseErrorHandler';


const NamePage = () => {
  const { currentUser, userData } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [firstNameError, setFirstNameError] = useState(false);
  const [lastNameError, setLastNameError] = useState(false);
  const firstNameRef = useRef<TextInput>(null);
  const lastNameRef = useRef<TextInput>(null);

  useEffect(() => {
    if (userData) {
      if (userData.firstName) setFirstName(userData.firstName);
      if (userData.lastName) setLastName(userData.lastName);
    }
  }, [userData]);


  const addName = async () => {
    if (!currentUser) {
      return;
    }
    await firestore()
      .collection('users')
      .doc(currentUser.uid)
      .update({
        firstName: firstName,
        lastName: lastName,
      })
      .then(() => {
        navigate('DateOfBirthScreen')
      })
      .catch(error => {
        console.error('Error saving user data: ', error);
        Alert.alert('Error', 'Could not save user data');
        handleFirestoreError(error)
      });
  };

  const showToast = () =>
    setTimeout(() => {
      Toast.show({
        type: 'error',
        text1: 'Missing Information',
        text2: 'Please enter both your first and last name.',
      });
    }, 300);

  const handleSubmit = () => {
    const firstEmpty = firstName.trim() === '';
    const lastEmpty = lastName.trim() === '';

    setFirstNameError(firstEmpty);
    setLastNameError(lastEmpty);

    if (firstEmpty && !userData?.firstName) {
      firstNameRef.current?.focus();
      return showToast();
    }

    if (lastEmpty && !userData?.lastName) {
      lastNameRef.current?.focus();
      return showToast();
    }
    addName();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>

          <ImageBackground
            source={require('../assets/BackgroundImages/whiteBackground.jpg')} // Path to your background image
            style={styles.backgroundImage} // Style for the background image
          >
            <View style={styles.content}>

              <Text style={styles.headingText}>What's Your Name?</Text>
              <TextInput
                ref={firstNameRef}
                style={[
                  styles.input,
                  firstNameError && { borderColor: 'red' }
                ]}
                placeholder="First Name"
                placeholderTextColor={'grey'}
                value={firstName}
                onChangeText={text => {
                  setFirstName(text);
                  if (text.trim() !== '') setFirstNameError(false);
                }} />
              <TextInput
                ref={lastNameRef}
                style={[
                  styles.input,
                  lastNameError && { borderColor: 'red' }
                ]}
                placeholder="Last Name"
                placeholderTextColor={'grey'}
                value={lastName}
                onChangeText={text => {
                  setLastName(text);
                  if (text.trim() !== '') setLastNameError(false);
                }} />

              <Ripple
                rippleColor="black"
                rippleContainerBorderRadius={10}
                style={styles.button}
                onPress={handleSubmit}
              >
                <Text style={styles.buttonText}>Next</Text>
              </Ripple>
            </View>
          </ImageBackground>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
    padding: moderateScale(25),
  },
  content: {
    gap: verticalScale(15),
  },
  headingText: {
    fontSize: moderateScale(25),
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: verticalScale(10)
  },
  input: {
    fontSize: moderateScale(20),
    backgroundColor: '#DCDCDC',
    // borderBottomColor: 'gray',
    borderRadius: 10,
    paddingHorizontal: scale(15),
    borderWidth: 1,
    // borderColor: '#007AFF'
  },
  button: {
    overflow: 'hidden',
    backgroundColor: '#007AFF',
    padding: moderateScale(10),
    borderRadius: 10
  },
  buttonText: {
    fontSize: moderateScale(20),
    textAlign: 'center',
    color: 'white'
  }
  // infoText: {
  //   margin: 10,
  // },
});

export default NamePage;
