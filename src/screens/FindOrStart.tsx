import { View, Text, StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';
import React from 'react';
import Toast from 'react-native-toast-message';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

//Hooks
import { useOnlineStatus } from '../hooks/useOnlineStatus'

//Contexts
import { useAuth } from '../context/AuthContext';

//Services
import { navigate } from '../services/NavigationService';

const FindOrStart = () => {
  const { currentUser, userData } = useAuth();
  useOnlineStatus();

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
        source={require('../assets/BackgroundImages/whiteBackground.jpg')}
        style={styles.backgroundImage}
      >
        <View style={styles.content}>

          <View style={styles.messageContainer}>
            <Text style={styles.messageText}>You're not part of any groups yet.</Text>
          </View>
          <View style={styles.buttonContainer}>

            <TouchableOpacity onPress={() =>
              navigate('TabNav', {
                screen: 'Search',
                params: {
                  screen: 'FindGroup'
                }
              })} style={styles.button}>
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
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    // alignItems: 'center',
  },
  messageContainer: {
    // marginVertical: 50,
    alignItems: 'center',
  },
  messageText: {
    fontSize: moderateScale(16),
    textAlign: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#C41E3A', // or any accent color
    paddingBottom: 5,
    fontWeight: 'bold'
  },
  buttonContainer: {
    // flex: 1,
    // justifyContent: 'center',
    // alignItems: 'center',
    marginVertical: verticalScale(30),
    padding: moderateScale(25),
    // borderWidth: 1
  },
  button: {
    // height: verticalScale(40),
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    backgroundColor: '#C41E3A',
    padding: scale(10)
  },
  buttonText: {
    color: 'white',
    fontSize: moderateScale(20),
  },
  lineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: verticalScale(40),
    marginBottom: verticalScale(40),
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: 'black',
    marginHorizontal: scale(10),
  },
  textOr: {
    fontSize: moderateScale(16),
    textAlign: 'center',
  },

});
export default FindOrStart;
