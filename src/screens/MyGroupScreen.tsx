import { View, Text, StyleSheet, TextInput, Alert } from 'react-native'
import React, { useState } from 'react'

//Navigation
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { RootStackParamList } from '../App'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

//Components
import FooterNav from '../components/FooterNav'


type MyGroupScreenProps = NativeStackScreenProps<RootStackParamList, 'MyGroupScreen'>

const MyGroupScreen = ({ route }: MyGroupScreenProps) => {



  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>My Group</Text>
      </View>
      <FooterNav route={route} />
    </View>
  )
}

export default MyGroupScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 150,
    backgroundColor: "#EAD8B1",
    padding: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  headerText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "black"
  },
})
