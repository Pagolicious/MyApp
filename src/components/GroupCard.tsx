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
import { useGroup } from '../context/GroupContext'

//Icons
import Icon1 from 'react-native-vector-icons/Ionicons';
import Icon2 from 'react-native-vector-icons/Octicons';
import Icon3 from 'react-native-vector-icons/MaterialIcons';
import Icon4 from 'react-native-vector-icons/Fontisto';


interface Props {
  group: Group;
  currentUserId: string;
  onPressApply: () => void;
  onCancelApply: () => void;
}

const GroupCard: React.FC<Props> = ({ group, currentUserId, onPressApply, onCancelApply }) => {
  const { currentUser, userData } = useAuth()
  const { disbandGroup } = useGroup()
  const [expanded, setExpanded] = useState(false);
  const [showSubmit, setShowSubmit] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);

  const animation = useRef(new Animated.Value(0)).current;
  const submitOpacity = useRef(new Animated.Value(0)).current;

  const isApplicant = group.applicants.some(a => a.uid === currentUserId);
  const isMember = group.memberUids.includes(currentUserId);
  const isOwner = group.createdBy.uid === currentUserId;


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

    if (userData.isGroupLeader && isOwner) {
      try {
        disbandGroup();
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
    } else if (userData.isGroupLeader || userData.isGroupMember) {
      Toast.show({
        type: 'info',
        text1: 'Already in a Group',
        text2: 'You can’t apply to a new group while in another one.',
      });
    } else {
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
        <View style={styles.people}>
          <Text style={styles.cardTextPeople}>{group.memberUids.length}/{group.memberLimit}</Text>
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
    margin: 10,
    padding: 15,
    borderRadius: 10,
    borderWidth: 4,
    backgroundColor: '#e0e0e0',

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
  },
  column: {
    flex: 1,
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
  cardTextPeople: {
    fontSize: moderateScale(17),
    fontWeight: 'bold',
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
    paddingTop: verticalScale(2)

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
  }
});

export default GroupCard;
