import { View, Text, Button, StyleSheet, Pressable } from 'react-native'
import React, { useContext } from 'react'

//Navigation
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { RootStackParamList } from '../App'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

//AuthContext
import { useAuth } from '../context/AuthContext'


const FindOrStart = () => {

  const { currentUser } = useAuth()
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()

  if (!currentUser) {
    return (
      <View style={styles.container}>
        <Text>Error: No user is logged in. Please log in first.</Text>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <Pressable
        style={({ pressed }) => [
          {
            backgroundColor: pressed ? '#0056b3' : '#007BFF'
          },
          styles.button
        ]}
        onPress={() => navigation.navigate("FindGroup")}
      >
        <Text style={styles.buttonText}>Find a Group</Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [
          {
            backgroundColor: pressed ? '#0056b3' : '#007BFF'
          },
          styles.button
        ]}
        onPress={() => navigation.navigate("StartGroup", { uid: currentUser.uid })}
      >
        <Text style={styles.buttonText}>Start a Group</Text>
      </Pressable>

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 15,
  },
  button: {
    padding: 15,
    borderRadius: 20,
    marginVertical: 30,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  underline: {
    width: 150,
    height: 2,
    backgroundColor: "black"
  }
})
export default FindOrStart
