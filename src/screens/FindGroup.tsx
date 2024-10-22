import { View, Text, StyleSheet, TextInput, Alert } from 'react-native'
import React, { useState } from 'react'

//Navigation
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { RootStackParamList } from '../App'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

//Components
import MyButton from '../components/MyButton'
import FooterNav from '../components/FooterNav'

const FindGroup = () => {

  const [activity, setActivity] = useState('Any')
  const [Location, setLocation] = useState('Close to your location')

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()


  const SearchGroup = async () => {
    try {
      navigation.navigate("GroupsScreen")
    } catch (error) {
      const errorMessage = (error as { message?: string }).message || "An unknown error occurred"
      Alert.alert(errorMessage)
    }

  };


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Find a Group</Text>
      </View>
      <View style={styles.bodyContainer}>
        <Text style={styles.bodyTitle}>Acticity</Text>
        <TextInput
          style={styles.input}
          value={activity}
          onChangeText={setActivity}
        />
      </View>
      <View style={styles.bodyContainer}>
        <Text style={styles.bodyTitle}>Location</Text>

        <TextInput
          style={styles.input}
          value={Location}
          onChangeText={setLocation}
        />
      </View>
      <MyButton title={"Find a Group"} onPress={SearchGroup} />

      <FooterNav />

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 150,
    backgroundColor: "lightblue",
    padding: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  headerText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "black"
  },
  bodyContainer: {
    borderBottomWidth: 1,
    borderColor: "grey"
  },
  bodyTitle: {
    marginTop: 15,
    paddingLeft: 20,
    fontSize: 17,
    color: "grey",
  },
  input: {
    height: 50,
    borderBottomColor: 'gray',
    paddingLeft: 20,
    fontSize: 25,

  },
  activityContainer: {
    borderBottomWidth: 1,
    borderColor: "grey"
  }

})

export default FindGroup
