import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { navigate } from '../../services/NavigationService';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import firestore from '@react-native-firebase/firestore';
import Toast from 'react-native-toast-message';

//Componets
import CustomToggle from '../../components/CustomToggle';

//Contexts
import { useAuth } from '../../context/AuthContext';

const EditProfileScreen = () => {
  const navigation = useNavigation();
  const { currentUser, userData } = useAuth()
  const [displayFullName, setDisplayFullName] = useState(true)
  const [displayAge, setDisplayAge] = useState(true)
  const [displayCity, setDisplayCity] = useState('')
  const [displayBio, setDisplayBio] = useState('')
  const [displayLanguages, setDisplayLanguages] = useState('')

  const handleSave = async () => {
    if (!currentUser) return
    try {
      await firestore().collection('users').doc(currentUser.uid).update({
        isDisplayFullName: displayFullName,
        isDisplayAge: displayAge,
        city: displayCity,
        bio: displayBio,
        languages: displayLanguages,
      });
      setTimeout(() => {
        Toast.show({
          type: 'success',
          text1: 'Profile Updated',
        });
      }, 1000);

      navigate('ProfilePageScreen', { userId: currentUser.uid })
    } catch (error: unknown) {
      const err = error as Error;
      Toast.show({
        type: 'error',
        text1: 'Save Failed',
        text2: err.message,
      });
    }

  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={handleSave}
          style={styles.saveButton}
        >
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, displayFullName, displayAge, displayCity, displayBio, displayLanguages]);


  useEffect(() => {
    if (!userData) return

    setDisplayFullName(userData.isDisplayFullName ?? true);
    setDisplayAge(userData.isDisplayAge ?? true);
    setDisplayCity(userData.city || '');
    setDisplayBio(userData.bio || '');
    setDisplayLanguages(userData.languages || '');

  }, [userData]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: verticalScale(40) }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>

          <Text style={styles.titleText}>Top Section</Text>
          <View style={styles.bottomBorder}>
            <View style={styles.contentRow}>
              <Text style={styles.text}>Display your full name:</Text>
              <CustomToggle
                label="Age"
                value={displayFullName}
                onToggle={(val: boolean) => setDisplayFullName(val)}
              />
            </View>
          </View>
          <View style={styles.bottomBorder}>
            <View style={styles.contentRow}>
              <Text style={styles.text}>Display your age:</Text>
              <CustomToggle
                label="Age"
                value={displayAge}
                onToggle={(val: boolean) => setDisplayAge(val)}
              />
            </View>
          </View>
          <View style={styles.contentColumn}>
            <Text style={styles.text}>City you live in:</Text>
            <TextInput
              style={styles.input}
              // placeholder="..."
              // placeholderTextColor="gray"
              value={displayCity}
              onChangeText={setDisplayCity}
            />
          </View>

        </View>

        <View style={styles.card}>
          <Text style={styles.titleText}>Middle Section</Text>
          <View style={styles.bottomBorder}>

            <View style={styles.contentColumn}>

              <Text style={styles.text}>Display Bio:</Text>
              <TextInput
                style={styles.areaInput}
                multiline={true}
                numberOfLines={3}
                placeholder="Write a bio for your profile"
                placeholderTextColor="gray"
                value={displayBio}
                onChangeText={setDisplayBio}
              />
            </View>
          </View>

          <View style={styles.contentColumn}>
            <Text style={styles.text}>Languages:</Text>
            <TextInput
              style={styles.input}
              // placeholder="..."
              // placeholderTextColor="gray"
              value={displayLanguages}
              onChangeText={setDisplayLanguages}
            />
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EditProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#fff',
  },
  card: {
    margin: moderateScale(22),
    paddingBottom: verticalScale(8),
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',

    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,

    // Android shadow
    elevation: 3,
  },
  contentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: scale(12),
    paddingVertical: verticalScale(12),
    // borderWidth: 1
  },
  contentColumn: {
    marginHorizontal: scale(12),
    paddingVertical: verticalScale(12),
    // borderWidth: 1
    // borderWidth: 1
  },
  titleText: {
    fontSize: moderateScale(16),
    padding: moderateScale(16),
    fontWeight: 'bold',
    backgroundColor: '#e0e0e0',
  },
  text: {
    fontSize: moderateScale(16),
    padding: moderateScale(10)
  },
  input: {
    // height: verticalScale(50),
    paddingLeft: scale(10),
    borderWidth: 1,
    borderColor: 'grey',
    borderRadius: 10,
    fontSize: moderateScale(16),
  },
  areaInput: {
    height: verticalScale(100),
    textAlignVertical: 'top',
    paddingLeft: scale(10),
    borderWidth: 1,
    borderColor: 'grey',
    borderRadius: 10,
    fontSize: moderateScale(16),
    marginBottom: verticalScale(10)
  },
  bottomBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  saveButton: {
    marginHorizontal: scale(15),
    backgroundColor: '#32CD32',
    paddingVertical: verticalScale(5),
    paddingHorizontal: scale(12),
    borderRadius: 10
  },
  saveText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: moderateScale(17)
  }

});
