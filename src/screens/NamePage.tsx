import { StyleSheet, Text, View, Alert, TextInput, Button } from 'react-native'
import React, { useState, useEffect } from 'react'

//Navigation
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { RootStackParamList } from '../App'

//Firebase
import firestore from '@react-native-firebase/firestore'

// AuthContext
import { useAuth } from '../context/AuthContext'


type NamePageProps = NativeStackScreenProps<RootStackParamList, 'NamePage'>

const NamePage = ({ navigation }: NamePageProps) => {
  const { currentUser } = useAuth();

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')

  const addName = () => {
    if (!currentUser) return // Ensure currentUser is defined
    firestore()
      .collection("users")
      .doc(currentUser.uid)
      .set({
        first_name: firstName,
        last_name: lastName
      })
      .then(() => {
        Alert.alert('Form Submitted', `${firstName} ${lastName}`)
        navigation.navigate("FindOrStart")
      })
      .catch((error) => {
        console.error("Error saving user data: ", error)
        Alert.alert('Error', 'Could not save user data')
      })
  }

  const getData = async () => {
    try {
      if (!currentUser) return // Ensure currentUser is defined
      const userDoc = await firestore().collection('users').doc(currentUser.uid).get()
      if (userDoc.exists) {
        const userData = userDoc.data();
        setFirstName(userData?.first_name || '');  // Set first name if it exists
        setLastName(userData?.last_name || '');    // Set last name if it exists
      }
    } catch (error) {
      console.error("Error fetching user data: ", error)
      Alert.alert('Error', 'Could not fetch user data')
    }
  }

  useEffect(() => {
    getData()
  }, [currentUser]);

  const handleSubmit = () => {
    if (firstName === '' || lastName === '') {
      Alert.alert('Error', 'Please fill out all fields.')
    } else {
      addName()
    }
  };

  return (
    <View style={styles.container}>
      <View>
        <Text>Welcome back, {firstName} {lastName}!</Text>
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
      <Text style={styles.infoText} >Others will not see your last name,
        only the first letter if there are multiple people with the same first name
        in the same group.</Text>
      {/* <Button title="Submit" onPress={handleSubmit} /> */}
      <Button title="Submit" onPress={handleSubmit} />
      <Button title="Move On" onPress={() => navigation.navigate("FindOrStart")} />

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 15,
  },
  headingText: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 55
  },
  input: {
    height: 50,
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
    marginBottom: 12,
    paddingLeft: 8,
    fontSize: 30
  },
  infoText: {
    margin: 10
  }

})

export default NamePage