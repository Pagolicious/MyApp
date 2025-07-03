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
import React, { useState, useRef } from 'react';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import Toast from 'react-native-toast-message';
import DateTimePicker from '@react-native-community/datetimepicker';
import Ripple from 'react-native-material-ripple';

//Firebase
import firestore from '@react-native-firebase/firestore';

//Context
import { useAuth } from '../context/AuthContext';

//Services
import { navigate } from '../services/NavigationService';

//Utils
import handleFirestoreError from '../utils/firebaseErrorHandler';


const DOBInput = () => {
  const { currentUser } = useAuth();
  const [dob, setDob] = useState<Date | undefined>(undefined);
  const [showPicker, setShowPicker] = useState(false);
  const [formattedDateError, setFormattedDateError] = useState(false);

  const onChange = (event: any, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate) {
      setDob(selectedDate);
      setFormattedDateError(false)
    }
  };

  const addDOB = async () => {
    if (!currentUser) {
      return;
    }
    await firestore()
      .collection('users')
      .doc(currentUser.uid)
      .update({
        DateOfBirth: dob,
      })
      .then(() => {
        navigate('PublicApp', { screen: 'FindOrStart' })
      })
      .catch(error => {
        console.error('Error saving user data: ', error);
        Alert.alert('Error', 'Could not save user data');
        handleFirestoreError(error)
      });
  };

  const formattedDate = dob
    ? dob.toLocaleDateString()
    : 'Select your date of birth';

  const showToast = () =>
    setTimeout(() => {
      Toast.show({
        type: 'error',
        text1: 'Missing Information',
        text2: 'Please enter your date of birth.',
      });
    }, 300);

  const handleSubmit = () => {
    if (!dob) {
      setFormattedDateError(true)
      return showToast();
    } else {
      addDOB()
    }
  }

  return (

    <View style={styles.container}>

      <ImageBackground
        source={require('../assets/BackgroundImages/whiteBackground.jpg')}
        style={styles.backgroundImage}
      >
        <View style={styles.content}>

          <Text style={styles.headingText}>What's Your Date of Birth?</Text>
          <Pressable
            onPress={() => setShowPicker(true)}
            android_ripple={{ color: 'rgba(0,0,0,0.2)' }}
            style={[
              styles.input,
              formattedDateError && { borderColor: 'red' }
            ]}
          >
            <Text style={{ color: dob ? 'black' : 'gray', fontSize: moderateScale(18) }}>{formattedDate}</Text>
          </Pressable>

          {showPicker && (
            <DateTimePicker
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              value={dob || new Date(2000, 0, 1)}
              onChange={onChange}
              maximumDate={new Date()} // prevents future dates
            />
          )}

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
    backgroundColor: '#DCDCDC',
    borderRadius: 10,
    borderWidth: 1,
    padding: moderateScale(15),
  },
  button: {
    backgroundColor: '#007AFF',
    padding: moderateScale(10),
    borderRadius: 10
  },
  buttonText: {
    fontSize: moderateScale(20),
    textAlign: 'center',
    color: 'white'
  }
});

export default DOBInput;
