import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Pressable,
  TouchableOpacity
} from 'react-native';
import { Group } from '../types/groupTypes';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { navigate } from '../services/NavigationService';
import Toast from 'react-native-toast-message';

//Context
import { useAuth } from '../context/AuthContext';
import { useGroupStore } from '../stores/groupStore'

//Icons
import Icon1 from 'react-native-vector-icons/Ionicons';
import Icon2 from 'react-native-vector-icons/Octicons';
import Icon3 from 'react-native-vector-icons/MaterialIcons';
import Icon4 from 'react-native-vector-icons/Fontisto';
import EIcon from 'react-native-vector-icons/Entypo';

//Types
import { User } from '../types/userTypes';



interface Props {
  group: Group;
  currentUserId: string;
  onPressApply: () => void;
  onCancelApply: () => void;
}

const GroupCard: React.FC<Props> = ({ group, currentUserId, onPressApply, onCancelApply }) => {
  const { currentUser, userData } = useAuth()
  const { disbandGroup } = useGroupStore()
  const [expanded, setExpanded] = useState(false);
  const [showSubmit, setShowSubmit] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);

  const animation = useRef(new Animated.Value(0)).current;
  const submitOpacity = useRef(new Animated.Value(0)).current;

  const isApplicant = group.applicants.some(a => a.uid === currentUserId);
  const isMember = group.memberUids.includes(currentUserId);
  const isOwner = group.createdBy.uid === currentUserId;


  const userHasSkillForGroup = (group: Group, userData: User): boolean => {
    const activity = group.activity?.toLowerCase();
    const hasSkill = userData?.skills?.some(
      s => s.sport.toLowerCase() === activity
    );
    return !!hasSkill;
  };

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

  const onPressButton = () => {
    if (!currentUser || !userData) return

    if (isOwner) {
      try {
        disbandGroup(currentUser.uid);
      } catch {
        console.log('Error', 'Can not disband group');
      }
    } else if (isApplicant) {
      onCancelApply()
    } else if (userData.isPartyMember) {
      Toast.show({
        type: 'info',
        text1: 'Not Allowed',
        text2: 'As a party member, only your leader can submit applications.',
      });
    }
    else if (userData?.groups?.length > 3) {
      Toast.show({
        type: 'error',
        text1: 'Group Limit Reached',
        text2: 'You already have 3 groups, which is the maximum allowed.',
      });
    }
    else {
      onPressApply()
    }
  }

  const handleMaps = () => {

  }

  const viewProfile = (userId: string) => {
    navigate('ProfilePageScreen', { userId: userId })
  };

  const animatedHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, contentHeight],
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
          borderColor: isMember || isOwner
            ? '#FFA500'   // 🟠 Orange for applicants
            : isApplicant
              ? '#50C878'   // ✅ Green for members/owners
              : '#6A9AB0',  // 🔵 Blue for others
          // opacity: pressed ? 0.8 : 1
        },
      ]}
    >
      {userData && !userHasSkillForGroup(group, userData) && !group.isIgnoreSkillLevel && group.activity !== 'Custom' && (
        <View style={styles.noSkillContainer}>
          <Text style={styles.noSkillText}>No skill rating yet</Text>
        </View>
      )}


      <View style={styles.row}>
        <View style={styles.column}>
          <Text style={styles.cardText}>{group.activity === 'Custom' ? group.title : group.activity}</Text>
          <Text style={styles.cardText}>{group.location}</Text>
        </View>
        <View style={styles.column}>
          <Text style={styles.cardText}>
            {new Date(group.fromDate).toLocaleDateString('sv-SE', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </Text>
          <Text style={styles.cardText}>{group.fromTime} - {group.toTime}</Text>
        </View>
        {/* <View style={styles.column}> */}
        <View style={styles.people}>
          {(!group.isIgnoreSkillLevel && group.skillLevel != null && group.skillLevel > 0) && (
            <View style={styles.starRating}>
              <Text style={styles.cardTextPeople}>
                {group.skillLevel}</Text>
              <EIcon name="star" size={16} color="black" />
            </View>
          )}
          <Text style={styles.cardTextPeople}>
            {group.memberUids.length}/{group.memberLimit}
          </Text>
        </View>

        {/* </View> */}
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
            <Icon3 name="location-on" size={25} color="black" />
            <Text style={styles.location}>{group.location}, adress...</Text>
            <TouchableOpacity
              onPress={() => handleMaps()}
              style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}
            >
              <Icon1 name="location-outline" size={16} color="#007AFF" />
              <Text style={{ color: '#007AFF', marginLeft: 4, fontSize: 14 }}>
                View on Map
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.contentRow}>
            <View style={styles.clockIconContainer}>
              <Icon4 name="clock" size={20} color="black" />
            </View>
            <Text style={styles.members}>{group.fromTime} - {group.toTime}, {new Date(group.fromDate).toLocaleDateString('sv-SE', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}</Text>
          </View>
          <View style={styles.contentRow}>
            <View style={styles.peopleIconContainer}>
              <Icon2 name="people" size={22} color="black" />
            </View>
            <Text style={styles.members}>{group.memberUids.length} of {group.memberLimit} people joined</Text>
          </View>
          <View style={styles.contentRow}>
            <Icon1 name="information-circle-outline" size={25} color="black" />
            <Text style={styles.details}>{group.details}</Text>
          </View>
          <View style={styles.creatorRow}>
            <Text style={styles.creatorText}>Created by: </Text>
            <Text style={styles.creatorName}>
              {group.createdBy.firstName}
              {group.createdBy.lastName ? `.${group.createdBy.lastName.charAt(0)}` : ''}
            </Text>
          </View>
          <View style={styles.creatorRow}>
            <TouchableOpacity onPress={() => viewProfile(group.createdBy.uid)}>
              <Text style={styles.profileButton}>View Profile</Text>
            </TouchableOpacity>
          </View>
        </View>
        {showSubmit && (
          <TouchableOpacity
            onPress={onPressButton}
            style={[
              styles.submitButton,
              { backgroundColor: isApplicant || isOwner || isMember ? '#C41E3A' : '#007AFF' }
            ]}
          >
            <Text style={styles.submitButtonText}>
              {isApplicant ? 'Cancel' : isOwner ? 'Disband' : isMember ? 'Leave' : 'Apply'}
            </Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    </Pressable >
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: verticalScale(15),
    marginHorizontal: scale(10),
    padding: scale(15),
    borderRadius: 10,
    borderWidth: 4,
    // backgroundColor: '#e0e0e0',

  },
  extendedContainer: {
    overflow: 'hidden',
    position: 'relative'
  },
  extendedContent: {
    paddingTop: 10
  },
  row: {
    flexDirection: 'row',
    // justifyContent: 'space-evenly'
  },
  column: {
    flex: 1,
    // borderWidth: 1,
    // justifyContent: 'flex-end'
  },
  people: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardText: {
    fontSize: moderateScale(15),
    fontWeight: 'bold',
    color: '#000',
    // borderWidth: 1
  },
  cardTextPeople: {
    fontSize: moderateScale(15),
    fontWeight: 'bold',
    // borderWidth: 1,
    marginRight: scale(2)
  },
  contentRow: {
    flexDirection: "row",
    paddingTop: verticalScale(10),
  },
  location: {
    color: '#333',
    marginHorizontal: scale(5),
    paddingTop: verticalScale(2)
  },
  members: {
    color: '#333',
    marginHorizontal: scale(8),
    paddingTop: verticalScale(2)

  },
  details: {
    color: '#333',
    marginHorizontal: scale(5),
    paddingTop: verticalScale(2),
    maxWidth: scale(260)
  },
  clockIconContainer: {
    marginLeft: scale(3),
  },
  peopleIconContainer: {
    marginLeft: scale(3)
  },
  creatorRow: {
    flexDirection: 'row',
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
  submitButton: {
    position: 'absolute',
    bottom: verticalScale(5),
    right: scale(5),
    paddingVertical: verticalScale(8),
    paddingHorizontal: scale(16),
    borderRadius: 6,
    elevation: 3,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  starRating: {
    flexDirection: 'row',
    // marginHorizontal: scale(10),
    alignItems: 'center',
    // borderWidth: 1
  },
  noSkillContainer: {
    position: 'absolute',
    top: -16, // Raise above the card top
    alignSelf: 'center',
    paddingVertical: 2,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    borderColor: '#6A9AB0',
    borderWidth: 3,
    borderRadius: 20,
    zIndex: 10, // Ensure it's above all card content
  },
  noSkillText: {
    fontSize: moderateScale(12),
    color: 'orange',
    // marginTop: 4,
    marginHorizontal: scale(5),
    fontStyle: 'italic',
    fontWeight: 'bold'
  }

});

export default GroupCard;
