import { View, Text, StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';
import React from 'react';
import Toast from 'react-native-toast-message';

//Components
import FooterNav from '../components/FooterNav';
import MyButton from '../components/MyButton';

//Contexts
import { useAuth } from '../context/AuthContext';

//Services
import { navigate } from '../services/NavigationService';

const FindOrStart = () => {
  const { currentUser, userData } = useAuth();
  // const navigation =
  //   useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleStartGroup = () => {
    if (!userData) return;

    if (!userData.isPartyMember) {
      navigate("StartGroup")
    } else {
      Toast.show({
        type: 'error', // 'success' | 'error' | 'info'
        text1: 'Action Not Allowed 🚫',
        text2: 'Only the leader can start. Ask them or create your own!',
      });

    }
  }

  if (!currentUser) {
    return (
      <View style={styles.container}>
        <Text>Error: No user is logged in. Please log in first.</Text>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      {/* <View style={styles.content} /> */}
      <ImageBackground
        source={require('../assets/BackgroundImages/whiteBackground.jpg')} // Path to your background image
        style={styles.backgroundImage} // Style for the background image
      >
        <View style={styles.buttonContainer}>

          <TouchableOpacity onPress={() => navigate('PublicApp', { screen: 'Find a Group' })} style={styles.button}>
            <Text style={styles.buttonText}>Find a group</Text>
          </TouchableOpacity>
          <View style={styles.lineContainer}>
            <View style={styles.line} />
            <Text style={styles.textOr}>Or</Text>
            <View style={styles.line} />
          </View>

          <TouchableOpacity onPress={handleStartGroup} style={styles.button}>
            <Text style={styles.buttonText}>Start a group</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
      {/* <View style={styles.flexEnd}> */}
      {/* <FooterNav /> */}

      {/* </View> */}
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
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
  },
  button: {
    height: 50,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    backgroundColor: '#C41E3A',
    // marginTop: 30,
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
  },
  lineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    marginBottom: 40,
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

});
export default FindOrStart;
