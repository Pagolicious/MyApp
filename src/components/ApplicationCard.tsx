import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Pressable,
  TouchableOpacity
} from 'react-native';
import { Applicant, Group } from '../types/groupTypes'; // update path if needed
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { navigate } from '../services/NavigationService';
import Toast from 'react-native-toast-message';

//Context
import { useAuth } from '../context/AuthContext';
import { useGroup } from '../context/GroupContext'

//Icons
import Icon1 from 'react-native-vector-icons/Ionicons';
import Icon2 from 'react-native-vector-icons/Octicons';
import Icon3 from 'react-native-vector-icons/MaterialIcons';
import Icon4 from 'react-native-vector-icons/Fontisto';


interface Props {
  applicant: Applicant;
  currentUserId: string;
  currentGroup?: Group;
  onPressInvite: () => void;
  onPressDecline: () => void;
}

const ApplicationCard: React.FC<Props> = ({ applicant, currentUserId, currentGroup, onPressInvite, onPressDecline }) => {
  const { currentUser, userData } = useAuth()
  const [expanded, setExpanded] = useState(false);
  const [showSubmit, setShowSubmit] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);

  const animation = useRef(new Animated.Value(0)).current;
  const submitOpacity = useRef(new Animated.Value(0)).current;

  const toggleExpand = () => {
    const newState = !expanded;

    if (!newState) {
      // 👇 Fade out button first (faster), then collapse card
      Animated.timing(submitOpacity, {
        toValue: 0,
        duration: 100, // 👈 Quick fade out
        useNativeDriver: true,
      }).start(() => {
        setShowSubmit(false); // Only hide it after it's faded
        setExpanded(false); // THEN collapse
        Animated.timing(animation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }).start();
      });
    } else {
      // 👇 Expand first, then fade in the button
      setExpanded(true);
      Animated.timing(animation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start(() => {
        setShowSubmit(true);
        Animated.timing(submitOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    }
  };


  const viewProfile = (userId: string) => {
    // You could navigate or link to profile
    navigate('ProfilePageScreen', { userId: userId })
    // Example: navigation.navigate('UserProfile', { userId });
  };

  const animatedHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, contentHeight], // Adjust as needed
  });

  return (
    <Pressable
      onPress={toggleExpand}
      android_ripple={{ color: 'rgba(0,0,0,0.2)' }}
      style={({ pressed }) => [
        styles.card,
        {
          transform: [{ scale: pressed ? 0.96 : 1 }],
          backgroundColor: pressed ? '#ddd' : '#fff',
          borderColor: '#6A9AB0',
          // opacity: pressed ? 0.8 : 1
        },
      ]}
    >
      <View style={styles.cardContent}>
        {applicant.role === "leader" && (applicant.members?.length ?? 0) > 0 ? (
          <Text style={styles.cardText}>{applicant.firstName} + {applicant.members?.length}</Text>
        ) : (
          <Text style={styles.cardText}>{applicant.firstName}</Text>
        )}
        <View style={styles.rightContent}>

          {currentGroup?.activity !== "Custom" && (
            <View style={styles.row}>
              <Text style={styles.cardText}>
                {applicant.skillLevel ?? "N/A"}
              </Text>
              <View style={styles.cardStar}>
                <Icon2 name="star" size={18} color="black" />
              </View>
            </View>
          )}
          <View style={styles.timerContainer}>
            <Text style={styles.cardText}>14:26</Text>
          </View>
        </View>
      </View>

      {/* 🔽 Expanded Content */}
      <Animated.View style={[styles.extendedContainer, { height: animatedHeight }]}>
        <View
          onLayout={(event) => {
            const { height } = event.nativeEvent.layout;
            setContentHeight(height);
          }}
          style={styles.extendedContent}
        >
          <View style={styles.contentRow}>
            <View style={styles.clockIconContainer}>
              <Icon4 name="clock" size={20} color="black" />
            </View>
            <Text>   14:26</Text>
          </View>
          {applicant.role === "leader" && (applicant.members?.length ?? 0) > 0 && (
            <View style={styles.contentRow}>
              <View style={styles.peopleIconContainer}>
                <Icon2 name="people" size={22} color="black" />
              </View>
              <View>
                <Text style={styles.members}>• {applicant.firstName} (Leader)</Text>
                {applicant.members?.map((member, index) => (
                  <Text key={member.uid || index} style={styles.members}>
                    • {member.firstName}
                  </Text>
                ))}
              </View>
            </View>
          )}
          <View style={styles.contentRow}>
            <Icon1 name="information-circle-outline" size={25} color="black" />
            <Text style={[styles.note, { flex: 1, flexWrap: 'wrap' }]}>
              {applicant.note}
            </Text>
          </View>
          <View style={styles.creatorRow}>
            <Text style={styles.creatorText}>Applied by: </Text>
            <Text style={styles.creatorName}>
              {applicant.firstName}
              {applicant.lastName ? `.${applicant.lastName.charAt(0)}` : ''}
            </Text>
          </View>
          <View style={styles.creatorRow}>
            <TouchableOpacity onPress={() => viewProfile(applicant.uid)}>
              <Text style={styles.profileButton}>View Profile</Text>
            </TouchableOpacity>
          </View>
        </View>
        {showSubmit && (
          <View>
            <TouchableOpacity
              onPress={onPressInvite}
              style={[
                styles.inviteButton,
                { backgroundColor: '#007AFF' }
              ]}
            >
              <Text style={styles.buttonText}>
                Invite
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onPressDecline}
              style={[
                styles.declineButton,
                { backgroundColor: '#C41E3A' }
              ]}
            >
              <Text style={styles.buttonText}>
                Decline
              </Text>
            </TouchableOpacity>
          </View>


        )}
      </Animated.View>
    </Pressable >
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 10,
    padding: 15,
    borderRadius: 10,
    // elevation: 3,
    borderWidth: 4,
    backgroundColor: '#e0e0e0',

  },
  extendedContainer: {
    overflow: 'hidden',
    position: 'relative', // ⬅️ this is needed so the absolute button is placed correctly

    // borderWidth: 1,
    // paddingTop: 10
  },
  extendedContent: {
    // borderWidth: 1,
    paddingTop: 10
  },
  row: {
    flexDirection: 'row',
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // borderWidth: 1
  },
  rightContent: {
    flexDirection: 'row'
  },
  timerContainer: {
    marginLeft: 15
  },
  people: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardText: {
    fontSize: moderateScale(15),
    fontWeight: 'bold',
    color: '#000',
  },
  cardStar: {
    alignSelf: 'center',
    marginLeft: 4
  },
  cardTextPeople: {
    fontSize: moderateScale(17),
    fontWeight: 'bold',
  },
  contentRow: {
    flexDirection: "row",
    // alignItems: "center",
    paddingTop: verticalScale(8),
    // alignContent: "center",
    // justifyContent: "center",
    // borderWidth: 1
  },
  members: {
    color: '#333',
    marginHorizontal: scale(8),
    paddingTop: verticalScale(1)

  },
  note: {
    color: '#333',
    marginHorizontal: scale(5),
    paddingTop: verticalScale(2)
  },
  clockIconContainer: {
    marginLeft: scale(3)
  },
  peopleIconContainer: {
    marginLeft: scale(3)
  },
  creatorRow: {
    flexDirection: 'row',
    // justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: verticalScale(8),
    marginHorizontal: scale(5),
  },

  creatorText: {
    fontSize: 14,
    color: '#444',
  },

  creatorName: {
    fontWeight: 'bold',
    color: '#000',
  },

  profileButton: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },

  inviteButton: {
    position: 'absolute',
    bottom: verticalScale(5),
    right: scale(5),
    // backgroundColor: '#007AFF',
    paddingVertical: verticalScale(8),
    paddingHorizontal: scale(18),
    borderRadius: 6,
    elevation: 3,
  },
  declineButton: {
    position: 'absolute',
    bottom: verticalScale(5),
    right: scale(85),
    // backgroundColor: '#007AFF',
    paddingVertical: verticalScale(8),
    paddingHorizontal: scale(13),
    borderRadius: 6,
    elevation: 3,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  }



});

export default ApplicationCard;
