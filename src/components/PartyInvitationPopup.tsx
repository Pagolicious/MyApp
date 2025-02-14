import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, Animated, StyleSheet, Dimensions } from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width * 0.8; // 80% of screen width


// Define prop types
interface TimedPopupProps {
  firstName: string;
  onAccept: () => void;
  onDecline: () => void;
}

const TimedPopup: React.FC<TimedPopupProps> = ({ firstName, onAccept, onDecline }) => {
  const [visible, setVisible] = useState(true);
  const slideAnim = useRef(new Animated.Value(-100)).current; // Start off-screen
  const progressAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current; // Full width

  useEffect(() => {
    // Slide in animation
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Animate progress bar from full width to 0
    Animated.timing(progressAnim, {
      toValue: 0,
      duration: 10000, // Match the timeout (10 seconds)
      useNativeDriver: false, // Width animation does not support native driver
    }).start();

    // Auto-hide after 5 seconds
    const timer = setTimeout(() => {
      onDecline();
      hidePopup();
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  const hidePopup = () => {
    Animated.timing(slideAnim, {
      toValue: -100,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setVisible(false));
  };

  if (!visible) return null;

  return (
    <Animated.View style={[styles.popup, { transform: [{ translateY: slideAnim }] }]}>
      {/* Progress Bar on Top with No Space */}
      <View style={styles.progressBarContainer}>
        <Animated.View style={[styles.progressBar, { width: progressAnim }]} />
      </View>

      {/* Popup Content */}
      <View style={styles.content}>
        <Text style={styles.text}>
          <Text style={styles.senderName}>{firstName}</Text> invited you to a search party!
        </Text>
        <View style={styles.buttons}>
          <TouchableOpacity onPress={() => { onAccept(); hidePopup(); }} style={styles.button}>
            <Text style={styles.accept}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { onDecline(); hidePopup(); }} style={styles.button}>
            <Text style={styles.decline}>Decline</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  popup: {
    position: "absolute",
    top: 50,
    left: "10%",
    right: "10%",
    backgroundColor: "#333",
    borderRadius: 10,
    elevation: 5,
    overflow: "hidden", // Ensures progress bar sticks on top with no gap
  },
  progressBarContainer: {
    width: "100%", // Match popup width
    height: 5,
    backgroundColor: "#555",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "green", // Progress bar color
  },
  content: {
    padding: 15, // Padding inside popup, below progress bar
    alignItems: "center",
  },
  text: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
  senderName: {
    fontWeight: "bold",
    color: "lightblue",
  },
  buttons: {
    flexDirection: "row",
    marginTop: 10,
  },
  button: {
    marginHorizontal: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  accept: { color: "green", fontWeight: "bold" },
  decline: { color: "red", fontWeight: "bold" },
});

export default TimedPopup;
