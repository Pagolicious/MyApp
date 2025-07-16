import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Avatar {
  uid: string;
  firstName: string;
  size: number;
  style?: object;
}

// Define the colors array inside the component
const colors = [
  '#FF5733', // Fiery Red 🔥
  '#33FF57', // Neon Green 🍏
  '#3357FF', // Electric Blue 🔵
  '#F3FF33', // Neon Yellow 🍋
  '#FF33A8', // Hot Pink 💖
  '#00D9FF', // Cyber Sky Blue 🌊
  '#9B51E0', // Modern Purple 💜
  '#FF9800', // Burnt Orange 🍊
  '#00FFAA', // Mint Green 🌿
  '#C70039', // Deep Red Wine 🍷

  // 🔥 New Additions (10 More Colors)
  '#8B4513', // Rich Chocolate Brown 🍫
  '#4CAF50', // Fresh Forest Green 🌲
  '#FFD700', // Modern Gold ✨
  '#E91E63', // Deep Rose Pink 🌹
  '#673AB7', // Royal Violet 🟣
  '#40E0D0', // Turquoise Wave 🌊
  '#FF6347', // Warm Tomato Red 🍅
  '#708090', // Sleek Slate Gray ⚫
  '#FF4500', // Bold Orange-Red 🌶️
  '#ADD8E6', // Soft Pastel Blue ☁️
];

const CustomAvatar: React.FC<Avatar> = ({ uid, firstName, size, style }) => {

  // Function to determine the color based on userId
  const getColorForUser = (uid: string) => {
    let hash = 0;
    for (let i = 0; i < uid.length; i++) {
      hash = (hash * 31 + uid.charCodeAt(i)) % 1000000; // A more unique hash
    }
    return colors[Math.abs(hash) % colors.length]; // Use absolute value to avoid negative indices
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
        style
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
