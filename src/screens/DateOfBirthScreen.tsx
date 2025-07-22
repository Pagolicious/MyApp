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
import React, { useState, useEffect } from 'react';
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


const GenderOptions = ['Male', 'Female', 'Other'];


const DOBInput = () => {
  const { currentUser, userData } = useAuth();
  const [dob, setDob] = useState<Date | undefined>(undefined);
  const [showPicker, setShowPicker] = useState(false);
  const [formattedDateError, setFormattedDateError] = useState(false);
  const [genderError, setGenderError] = useState(false);
  const [selectedGender, setSelectedGender] = useState<'male' | 'female' | 'other' | undefined>(undefined);

  useEffect(() => {
    if (userData?.dateOfBirth) {
      const dobDate =
        userData.dateOfBirth.toDate?.() ?? userData.dateOfBirth;
      setDob(dobDate);
    }
    if (userData?.gender) {
      setSelectedGender(userData?.gender)
    }
  }, [userData]);


  const onChange = (event: any, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate) {
      setDob(selectedDate);
      setFormattedDateError(false)
    }
  };

  const addData = async () => {
    if (!currentUser || !userData) {
      return;
    }
    if (!selectedGender || !dob) {
      return
    }
    await firestore()
      .collection('users')
      .doc(currentUser.uid)
      .update({
        dateOfBirth: dob,
        gender: selectedGender.toLowerCase()
      })
      .then(() => {
        navigate('TabNav', { screen: 'SelectGroupScreen' });
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
        text2: 'Please enter your date of birth and gender.',
      });
    }, 300);

  const handleSubmit = () => {
    let hasError = false;

    if (!dob) {
      setFormattedDateError(true);
      hasError = true;
    } else {
      setFormattedDateError(false);
    }
    if (!selectedGender) {
      setGenderError(true);
      hasError = true;
    } else {
      setGenderError(false);
    }
    if (hasError) {
      showToast();
      return;
    }
    addData();

  }

  return (

    <View style={styles.container}>

      <ImageBackground
        source={require('../assets/BackgroundImages/whiteBackground.jpg')}
        style={styles.backgroundImage}
      >
        <View style={styles.content}>

          <Text style={styles.headingText}>What's your date of birth and gender?</Text>
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

          <View style={[styles.segmentContainer, genderError && { borderColor: 'red' }]}>
            {GenderOptions.map((option) => (
              <Pressable
                key={option}
                onPress={() => setSelectedGender(option as 'male' | 'female' | 'other')}
                android_ripple={{ color: 'rgba(0,0,0,0.2)' }}
                style={[
                  styles.segment,
                  selectedGender === option && styles.segmentSelected,
                ]}
              >
                <Text
                  style={
                    selectedGender === option
                      ? styles.textSelected
                      : styles.text
                  }
                >
                  {option}
                </Text>
              </Pressable>
            ))}
          </View>

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
  },
  segmentContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    backgroundColor: '#DCDCDC',
    borderRadius: scale(8),
    overflow: 'hidden',
    marginTop: verticalScale(10),
    marginBottom: verticalScale(10),
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: verticalScale(14),
  },
  segmentSelected: {
    backgroundColor: '#007AFF',
  },
  text: {
    color: '#000',
    fontSize: moderateScale(12)
  },
  textSelected: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: moderateScale(12)

  },
});

export default DOBInput;
