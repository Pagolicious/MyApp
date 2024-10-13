import { StyleSheet, Text, View, Alert, Platform, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'

//Navigation
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { RootStackParamList } from '../App'

//Components
import MyButton from '../components/MyButton'
import MyTextInput from '../components/MyTextInput'
import SocialMedia from '../components/SocialMedia'

//Firebase
import auth from "@react-native-firebase/auth"


type NameProps = NativeStackScreenProps<RootStackParamList, 'SignUpScreen'>

const SignUpScreen = ({ navigation }: NameProps) => {

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const signUp = () => {
    auth()
      .createUserWithEmailAndPassword(email, password)
      .then(() => {
        Alert.alert("User Created! Please Login")
        navigation.navigate("LoginScreen")
      })
      .catch(err => {
        const errorMessage = err.message || "An unknown error occurred"
        Alert.alert(errorMessage)
      });

  }

  return (
    <View style={styles.container}>
      <View style={styles.imageBackground}>
        <Text style={styles.title}>MyApp</Text>
        <View style={styles.inputContainer}>
          <MyTextInput value={email} onChangeText={setEmail} placeholder="Email" />
          <MyTextInput value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry />
          <MyTextInput value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Confirm Password" secureTextEntry />


          <MyButton onPress={signUp} title={"Sign Up"} />
          <View style={styles.lineContainer}>
            <View style={styles.line} />
            <Text style={styles.textOr}>Or</Text>
            <View style={styles.line} />
          </View>
          <Text style={styles.signInText}>Sign in with</Text>

          <SocialMedia />
          <View style={styles.containerHaveAccount}>
            <Text style={styles.textHaveAccount}>Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate("LoginScreen")}>
              <Text style={styles.buttonSignIn}>Sign In</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageBackground: {
    backgroundColor: "#C41E3A",
    height: "100%",
    alignItems: "center",
    paddingHorizontal: 20
  },
  title: {
    fontSize: 40,
    color: "white",
    marginTop: Platform.OS == "android" ? 60 : 110
  },
  inputContainer: {
    height: 550,
    width: "100%",
    backgroundColor: "white",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
    paddingHorizontal: 20
  },
  textHaveAccount: {
    alignSelf: "center",
    marginRight: 10,
    color: "black",
    marginBottom: 5,
    marginTop: 15,
    fontSize: 12
  },
  containerHaveAccount: {
    flexDirection: "row"
  },
  buttonSignIn: {
    alignSelf: "center",
    marginRight: 10,
    color: "blue",
    marginBottom: 5,
    marginTop: 15,
    fontSize: 12
  },
  lineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
    marginBottom: 20
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "grey",
    marginHorizontal: 10
  },
  textOr: {
    fontSize: 16,
    textAlign: "center",
    color: "black"
  },
  signInText: {
    fontSize: 12,
    marginBottom: 5,
    color: "black",

  }

})

export default SignUpScreen
