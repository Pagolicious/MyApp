// SkillModal.tsx
import React, { useEffect, useRef } from 'react'
import { Modal, View, Text, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import StarRating from 'react-native-star-rating-widget';

interface SkillModalProps {
  visible: boolean;
  onClose: () => void;
  skillLevel: number;
  setSkillLevel: (level: number) => void;
  onSubmit: () => void;
}

const SkillModal = ({ visible, onClose, skillLevel, setSkillLevel, onSubmit }: SkillModalProps) => {

  const animationValue = useRef(new Animated.Value(0)).current // Initialize animated value

  useEffect(() => {
    if (skillLevel > 0) {
      Animated.timing(animationValue, {
        toValue: 1, // Fully expanded
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(animationValue, {
        toValue: 0, // Collapsed
        duration: 300,
        easing: Easing.in(Easing.ease),
        useNativeDriver: false,
      }).start();
    }
  }, [skillLevel]);

  // Interpolate animated value for opacity and height
  const animatedStyle = {
    opacity: animationValue,
    height: animationValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 100], // Adjust height as needed
    }),
  };

  // const addSkillLevel = async () => {
  //   if (!currentUser || !selectedActivity) return; // Ensure currentUser and selectedActivity are defined

  //   const skillLevelKey = `${selectedActivity.toLowerCase()}_skill_level`;
  //   try {
  //     await firestore()
  //       .collection("users")
  //       .doc(currentUser.uid)
  //       .update({
  //         [skillLevelKey]: skillLevel
  //       })
  //     setSkillModalVisible(false)
  //     setHasSkillLevel(true); // Set hasSkillLevel to true after saving
  //   }
  //   catch (error) {
  //     console.error("Error saving user data: ", error)
  //     Alert.alert('Error', 'Could not save user data')
  //   }
  // }

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalView}>
          <TouchableOpacity style={styles.closeIcon} onPress={onClose}>
            <Text style={styles.closeText}>✖</Text>
          </TouchableOpacity>

          <Text style={styles.modalTitleText}>Skill Level</Text>
          <Text style={styles.modalText}>We need to know your skill level for this activity</Text>

          <StarRating rating={skillLevel} onChange={setSkillLevel} enableHalfStar={false} />

          <Animated.View style={[styles.modalExtendedContent, animatedStyle]}>
            <Text style={styles.modalObervationText}>You can NOT change your skill level later</Text>
            <TouchableOpacity
              style={styles.addSkillLevelButton}
              onPress={async () => {
                onSubmit()
              }}

            >
              <Text style={styles.addSkillLevelText}>Submit</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: 350,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    alignItems: 'center',
  },
  closeIcon: {
    position: 'absolute',
    top: 5,
    right: 15,
  },
  closeText: {
    fontSize: 24,
    color: '#888',
  },
  modalTitleText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "black",
  },
  modalText: {
    marginTop: 20,
    fontSize: 18,
    color: "black",
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: "green",
    padding: 10,
    width: 100,
    alignItems: "center",
    borderRadius: 5,
    marginTop: 15,
  },
  submitButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  modalExtendedContent: {
    alignItems: "center"
  },
  modalObervationText: {
    fontSize: 14,
    color: "red",
    fontWeight: "bold",
    marginVertical: 10,
  },
  addSkillLevelButton: {
    backgroundColor: "green",
    padding: 10,
    width: 100,
    alignItems: "center",
    borderRadius: 5,
    marginTop: 15
  },
  addSkillLevelText: {
    color: "white",
    fontWeight: "bold"

  },
});

export default SkillModal;
