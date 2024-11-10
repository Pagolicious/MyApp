import {View, Text, StyleSheet} from 'react-native';
import React from 'react';

//Navigation
import {RootStackParamList} from '../App';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

//Components
import FooterNav from '../components/FooterNav';
import MyButton from '../components/MyButton';
//AuthContext
import {useAuth} from '../context/AuthContext';

const FindOrStart = () => {
  const {currentUser} = useAuth();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  if (!currentUser) {
    return (
      <View style={styles.container}>
        <Text>Error: No user is logged in. Please log in first.</Text>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <View style={styles.content} />

      <View style={styles.buttons}>
        <MyButton
          title={'Find a Group'}
          onPress={() => navigation.navigate('FindGroup')}
        />
        <MyButton
          title={'Start a Group'}
          onPress={() => navigation.navigate('StartGroup')}
        />
      </View>

      {/* <View style={styles.flexEnd}> */}
      <FooterNav />

      {/* </View> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    width: '100%',
    height: 400,
    backgroundColor: 'grey',
  },
  buttons: {
    padding: 15,
  },
  // flexEnd: {
  //   justifyContent: "flex-end"
  // }
});
export default FindOrStart;
