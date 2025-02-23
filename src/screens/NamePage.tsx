import { StyleSheet, Text, View, Alert, TextInput, Button } from 'react-native';
import React, { useState } from 'react';

//Navigation
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../utils/types'

//Firebase
import firestore from '@react-native-firebase/firestore';

//Context
import { useAuth } from '../context/AuthContext';

//Services
import { navigate } from '../services/NavigationService';

//Utils
import handleFirestoreError from '../utils/firebaseErrorHandler';


const NamePage = () => {
  const { currentUser } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const addName = async () => {
    if (!currentUser) {
      return;
    } // Ensure currentUser is defined
    await firestore()
      .collection('users')
      .doc(currentUser.uid)
      .update({
        firstName: firstName,
        lastName: lastName,
      })
      .then(() => {
        Alert.alert('Form Submitted', `${firstName} ${lastName}`);
        navigate('FindOrStart');
      })
      .catch(error => {
        console.error('Error saving user data: ', error);
        Alert.alert('Error', 'Could not save user data');
        handleFirestoreError(error)
      });
  };

  const handleSubmit = () => {
    if (firstName === '' || lastName === '') {
      Alert.alert('Error', 'Please fill out all fields.');
    } else {
      addName();
    }
  };

  return (
    <View style={styles.container}>
      <View>
        <Text>
          Welcome back, {firstName} {lastName}!
        </Text>
        <Text>Update your name if needed.</Text>
      </View>
      <Text style={styles.headingText}>What's Your Name?</Text>
      <TextInput
        style={styles.input}
        placeholder="First Name"
        value={firstName}
        onChangeText={setFirstName}
      />
      <TextInput
        style={styles.input}
        placeholder="Last Name"
        value={lastName}
        onChangeText={setLastName}
      />
      <Text style={styles.infoText}>
        Others will not see your last name, only the first letter if there are
        multiple people with the same first name in the same group.
      </Text>
      {/* <Button title="Submit" onPress={handleSubmit} /> */}
      <Button title="Submit" onPress={handleSubmit} />
      <Button
        title="Move On"
        onPress={() => navigate('FindOrStart')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 15,
  },
  headingText: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 55,
  },
  input: {
    height: 50,
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
    marginBottom: 12,
    paddingLeft: 8,
    fontSize: 30,
  },
  infoText: {
    margin: 10,
  },
});

export default NamePage;
