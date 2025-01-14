import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

//Context
import { useAuth } from '../context/AuthContext';

interface Avatar {
  uid: string,
  firstName: string,
  size: number
}

// Define the colors array inside the component
const colors = ['#FF5733', '#33FF57', '#3357FF', '#F3FF33', '#FF33A8'];

const CustomAvatar: React.FC<Avatar> = ({ uid, firstName, size }) => {

  // Function to determine the color based on userId
  const getColorForUser = (uid: string) => {
    const hash = uid.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  // Get the letter from the user's name
  const letter = firstName.charAt(0).toUpperCase() || '';

  // Get the color for the user
  const color = getColorForUser(uid);

  return (
    <View
      style={[
        styles.avatar,
        {
          backgroundColor: color,
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    >
      <Text style={[styles.letter, { fontSize: size / 2 }]}>{letter}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  letter: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});

export default CustomAvatar;
