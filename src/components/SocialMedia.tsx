import {Image, StyleSheet, View} from 'react-native';
import React from 'react';

const SocialMedia = () => {
  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/SocialMediaIcons/facebook.png')}
        style={styles.icons}
      />
      <Image
        source={require('../assets/SocialMediaIcons/twitter.png')}
        style={styles.twitterIcon}
      />
      <Image
        source={require('../assets/SocialMediaIcons/google.png')}
        style={styles.icons}
      />
    </View>
  );
};

export default SocialMedia;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
    alignItems: 'center',
  },
  icons: {
    height: 40,
    width: 40,
  },
  twitterIcon: {
    height: 60,
    width: 60,
    marginTop: 15,
  },
});
