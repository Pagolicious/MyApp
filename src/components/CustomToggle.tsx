// CustomToggle.js
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';

type CustomToggleProps = {
  label: string;
  onToggle: (val: boolean) => void;
  value?: boolean;
};

const CustomToggle: React.FC<CustomToggleProps> = ({ label, onToggle, value = false }) => {
  const [isOn, setIsOn] = useState(value);
  const animValue = useRef(new Animated.Value(value ? 1 : 0)).current;

  // Sync internal state with external value
  useEffect(() => {
    setIsOn(value);
    Animated.timing(animValue, {
      toValue: value ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [value]);

  const toggle = () => {
    const newValue = !isOn;
    setIsOn(newValue);
    onToggle(newValue); // 🔁 Send the new value back to the parent
    Animated.timing(animValue, {
      toValue: newValue ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const translateX = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 22],
  });

  return (
    <View style={styles.wrapper}>
      {/* <Text style={styles.label}>{label}</Text> */}
      <TouchableOpacity style={styles.switch} onPress={toggle} activeOpacity={0.8}>
        <View style={[styles.track, isOn ? styles.on : styles.off]}>
          <Animated.View style={[styles.thumb, { transform: [{ translateX }] }]} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default CustomToggle;

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  label: {
    fontSize: 16,
    marginRight: 12,
  },
  switch: {
    marginLeft: 30
  },
  track: {
    width: 52,
    height: 30,
    borderRadius: 20,
    padding: 2,
    justifyContent: 'center',
  },
  on: { backgroundColor: '#1E90FF' },
  off: { backgroundColor: '#36454F' },
  thumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'white',
  },
});
