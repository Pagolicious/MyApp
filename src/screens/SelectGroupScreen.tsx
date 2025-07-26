import { Pressable, StyleSheet, Text, View, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import LinearGradient from 'react-native-linear-gradient';
import { Animated } from 'react-native';
import Toast from 'react-native-toast-message';
import { RootStackParamList } from '../utils/types';

import { navigate } from '../services/NavigationService';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MyGroupStackParamList } from '../utils/types';
import firestore from '@react-native-firebase/firestore';
import { Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ripple from 'react-native-material-ripple';
import { useNavigationStore } from '../stores/navigationStore';
import { useFocusEffect } from '@react-navigation/native';

//Screens
import FindOrStart from './FindOrStart';

//Hooks
import { useOnlineStatus } from '../hooks/useOnlineStatus'

//Context
import { useAuth } from '../context/AuthContext';
import { useGroupStore } from '../stores/groupStore';

//Services
import { stopListeningToGroup } from '../services/firebase/groupListener';

//Types
import { UserGroups } from '../types/userTypes';
import { Group } from '../types/groupTypes';

//Icons
import Icon1 from 'react-native-vector-icons/Ionicons';
import Icon2 from 'react-native-vector-icons/Octicons';
import Icon3 from 'react-native-vector-icons/MaterialIcons';
import Icon4 from 'react-native-vector-icons/Fontisto';
import EIcon from 'react-native-vector-icons/Entypo';
import FIcon from 'react-native-vector-icons/Feather';


// Simple template to start
const SelectGroupScreen = () => {
  const { userData, currentUser } = useAuth();

  const { setGroupId, setGroup } = useGroupStore();
  const groups: UserGroups[] = userData?.groups || [];
  const navigation = useNavigation<StackNavigationProp<MyGroupStackParamList>>();
  const [fullGroups, setFullGroups] = useState<Record<string, Group>>({});

  // if (!groups || groups.length === 0) {
  //   return <FindOrStart />;
  // }

  // const { height: screenHeight } = Dimensions.get('window');

  // const HEADER_HEIGHT = verticalScale(65) + scale(20); // header + bottom margin
  // const CARD_COUNT = 3;
  // const cardHeight = (screenHeight - HEADER_HEIGHT) / CARD_COUNT;

  const size = moderateScale(50);
  useOnlineStatus()



  // useFocusEffect(
  //   React.useCallback(() => {
  //     const { lastScreen, lastParams } = useNavigationStore.getState();

  //     if (lastScreen && lastScreen !== 'SelectGroupScreen') {
  //       // ✅ Type-safe navigation
  //       navigate(lastScreen as keyof RootStackParamList, lastParams);
  //     }
  //   }, [])
  // );


  useEffect(() => {
    const fetchGroupDetails = async () => {
      const results: Record<string, Group> = {};
      for (const g of groups) {
        const doc = await firestore().collection('groups').doc(g.groupId).get();
        if (doc.exists()) {
          results[g.groupId] = doc.data() as Group;
        }
      }
      setFullGroups(results);
    };

    if (groups.length > 0) {
      fetchGroupDetails();
    }
  }, [groups]);



  const handleSelect = async (userGroup: UserGroups) => {
    if (!currentUser) return

    const group = fullGroups[userGroup.groupId];
    if (!group) {
      Alert.alert("Error", "Could not load group data.");
      return;
    }
    try {
      stopListeningToGroup();
      // 1. Set local context
      setGroupId(group.id);
      setGroup(group)
      console.log(group)
      // console.log(fullGroups)
      // 2. Save selection to Firestore
      // await firestore()
      //   .collection('users')
      //   .doc(currentUser.uid)
      //   .update({ selectedGroupId: group.id });

      // const { initGroupDataListeners } = useGroupStore.getState();
      // initGroupDataListeners(currentUser.uid, userData); // 🔥 critical step

      // 3. Navigate
      navigate("GroupTopTabs");
    } catch (error) {
      console.error("Failed to select group:", error);
      Alert.alert("Error", "Could not switch groups. Please try again.");
    }
  };

  const formatDate = (isoString: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString('sv-SE', { month: 'short', day: 'numeric' });
  };



  // Pad to always have 3 cards
  const paddedGroups: (UserGroups | null)[] = [...groups];
  while (paddedGroups.length < 3) {
    paddedGroups.push(null);
  }

  const handleCreateGroup = () => {

    if (!userData) return;


    if (!userData.isPartyMember) {
      navigate("StartGroup", { isEdit: false })
    } else {
      Toast.show({
        type: 'error', // 'success' | 'error' | 'info'
        text1: 'Action Not Allowed 🚫',
        text2: 'Only the leader can start. Ask them or create your own!',
      });
    }

  }

  const handleFindGroup = () => {
    if (!userData) return;

    navigate('TabNav', { screen: 'Search' })

  }

  //   const AnimatedRippleButton = ({ icon, label, onPress }) => {
  //   const scaleAnim = useRef(new Animated.Value(1)).current;

  //   const handlePressIn = () => {
  //     Animated.spring(scaleAnim, {
  //       toValue: 0.94,
  //       useNativeDriver: true,
  //     }).start();
  //   };

  //   const handlePressOut = () => {
  //     Animated.spring(scaleAnim, {
  //       toValue: 1,
  //       friction: 3,
  //       useNativeDriver: true,
  //     }).start();
  //   };

  //   return (
  //     <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
  //       <Ripple
  //         rippleColor="#ccc"
  //         rippleContainerBorderRadius={30}
  //         onPressIn={handlePressIn}
  //         onPressOut={handlePressOut}
  //         onPress={onPress}
  //         style={styles.iconButton}
  //       >
  //         <FIcon name={icon} size={24} color="#333" />
  //       </Ripple>
  //       <Text style={styles.iconLabel}>{label}</Text>
  //     </Animated.View>
  //   );
  // };



  return (
    <SafeAreaView style={styles.container}>
      {!groups || groups.length === 0 ? (
        <FindOrStart />
      ) : (
        <View style={styles.cardContainer}>

          {paddedGroups.map((group, index) => (
            // <View style={styles.cardWrapper}>

            <Pressable
              key={group?.groupId ?? `placeholder-${index}`}
              // style={[
              //   styles.card,
              //   !group && styles.disabledCard,

              // ]}
              style={({ pressed }) => [
                styles.card,
                !group && styles.disabledCard,

                {
                  transform: [{ scale: pressed ? 0.96 : 1 }],
                  backgroundColor: pressed ? '#ddd' : '#blue',
                },
              ]}
              onPress={() => group && handleSelect(group)}
              disabled={!group}
            >
              {/* <Ripple
                            rippleColor="black"
                            rippleContainerBorderRadius={10}
                            style={styles.button}
                            onPress={handleSubmit}
                          ></Ripple> */}

              {group ? (
                <View style={styles.cardContent}>

                  <LinearGradient
                    colors={['#F97316', '#FB923C']} // darker orange → lighter orange
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.topDesignCard}
                  >
                    {fullGroups[group.groupId]?.activity === "Custom" ? (
                      <Text style={styles.titleText}>{fullGroups[group.groupId]?.title}</Text>
                    ) :
                      <Text style={styles.titleText}>{fullGroups[group.groupId]?.activity}</Text>
                    }
                  </LinearGradient>

                  <View style={styles.groupInfo}>
                    <View style={styles.contentRow}>
                      <Icon3 name="location-on" size={25} color="black" />
                      <Text style={styles.locationText}>{fullGroups[group.groupId]?.location.name}, {fullGroups[group.groupId]?.location.address}</Text>
                    </View>
                    <View style={styles.contentRow}>
                      <View style={styles.clockIconContainer}>
                        <Icon4 name="clock" size={20} color="black" />
                      </View>
                      <Text style={styles.timeText}>
                        {fullGroups[group.groupId]?.fromTime} - {fullGroups[group.groupId]?.toTime}, {new Date(fullGroups[group.groupId]?.fromDate).
                          toLocaleDateString('sv-SE', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}</Text>
                    </View>
                    <View style={styles.contentRow}>
                      <View style={styles.peopleIconContainer}>
                        <Icon2 name="people" size={22} color="black" />
                      </View>
                      <Text style={styles.membersText}>{fullGroups[group.groupId]?.memberUids.length} of {fullGroups[group.groupId]?.memberLimit} people joined</Text>
                    </View>
                    {/* <Text>Role: {group.role}</Text> */}
                  </View>
                  <View style={styles.roleCard}>
                    <Text style={styles.roleText}>
                      {group.role.charAt(0).toUpperCase() + group.role.slice(1)}
                    </Text>
                  </View>
                  <LinearGradient
                    colors={['#F97316', '#FB923C']} // darker orange → lighter orange
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.bottomDesignCard}
                  >
                  </LinearGradient>
                </View>

              ) : (
                <View style={styles.noGroupContainer}>
                  <Text style={styles.placeholderText}>No Group</Text>

                  <View style={styles.noGroupContent}>
                    <View style={styles.row}>
                      <View style={styles.createGroupContainer}>
                        <Pressable style={({ pressed }) => [
                          styles.createGroupButton,
                          {
                            transform: [{ scale: pressed ? 0.96 : 1 }],
                            backgroundColor: pressed ? '#ddd' : '#fff',
                          },
                        ]}
                          onPress={handleCreateGroup}
                        >
                          <FIcon name="plus" size={27} color="#0f5e9c" />
                        </Pressable>

                        <Text style={styles.createGroupText}>Create Group</Text>
                      </View>
                      <View style={styles.orContainer}>
                        <Text style={styles.orText}>Or</Text>
                      </View >
                      <View style={styles.findGroupContainer}>
                        <Pressable style={({ pressed }) => [
                          styles.findGroupButton,
                          {
                            transform: [{ scale: pressed ? 0.96 : 1 }],
                            backgroundColor: pressed ? '#ddd' : '#fff',
                          },
                        ]}
                          onPress={handleFindGroup}
                        >
                          <FIcon name="search" size={22} color="#0f5e9c" />
                        </Pressable>
                        <Text style={styles.findGroupText}>Find Group</Text>

                      </View>
                    </View>
                  </View>
                </View>
              )}

            </Pressable>
            // </View>

          ))}
        </View>
      )}
    </SafeAreaView>
  );
};

export default SelectGroupScreen;

const styles = StyleSheet.create({

  container: {
    flex: 1,
    // backgroundColor: '#FFF',
  },
  cardContainer: {
    flex: 1,
  },
  cardWrapper: {
    flex: 1, // ensures each card is 1/3 height
  },


  card: {
    flex: 1,
    // height: verticalScale(160),
    marginHorizontal: scale(20),
    marginBottom: scale(20),
    borderWidth: 1,
    borderColor: '#444',
    // backgroundColor: 'grey',

    borderRadius: 8,
    elevation: 4,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContent: {
    flex: 1,
    // borderWidth: 1,
    backgroundColor: '#fef9f5',

    justifyContent: 'space-between',
    // padding: scale(16),

  },
  topDesignCard: {
    // height: '35%',
    height: verticalScale(45),
    // borderTopLeftRadius: 6,
    // borderTopRightRadius: 6,
    borderBottomLeftRadius: 45,
    borderBottomRightRadius: 45,
    justifyContent: 'center'
  },
  titleText: {
    color: 'white',
    fontSize: moderateScale(20),
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  groupInfo: {
    marginHorizontal: scale(12),
    // borderWidth: 1
  },
  contentRow: {
    flexDirection: "row",
    paddingTop: verticalScale(5),
  },
  locationText: {
    color: '#333',
    marginHorizontal: scale(5),
    paddingTop: verticalScale(2),
    fontSize: moderateScale(12)

  },
  clockIconContainer: {
    marginLeft: scale(3),
  },
  timeText: {
    color: '#333',
    marginHorizontal: scale(8),
    paddingTop: verticalScale(1),
    fontSize: moderateScale(12)

  },
  peopleIconContainer: {
    marginLeft: scale(3)
  },
  membersText: {
    color: '#333',
    marginHorizontal: scale(8),
    paddingTop: verticalScale(1),
    fontSize: moderateScale(12)
  },
  roleCard: {
    position: 'absolute',
    bottom: moderateScale(10),
    right: moderateScale(10),
    backgroundColor: 'white',
    borderWidth: 1,
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(4),
    borderRadius: 6,
    zIndex: 10,
  },
  roleText: {
    fontSize: moderateScale(12),
    // color: 'white',
    fontWeight: 'bold',
  },
  bottomDesignCard: {
    height: verticalScale(20),
    // borderBottomLeftRadius: 6,
    // borderBottomRightRadius: 6,
  },
  disabledCard: {
    backgroundColor: '#eee',
    borderColor: '#ccc',
  },
  noGroupContainer: {
    flex: 1,
    padding: moderateScale(15),
    backgroundColor: '#eee'
  },
  noGroupContent: {
    flex: 1,
    // borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#999',
    textAlign: 'center',
    fontSize: moderateScale(16),

  },
  row: {
    flexDirection: 'row',
    // borderWidth: 1
  },
  createGroupContainer: {
    // borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createGroupButton: {
    borderWidth: 1,
    borderColor: '#0f5e9c',
    borderRadius: 60 / 2,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    margin: moderateScale(15)

  },
  createGroupText: {
    fontSize: moderateScale(14)

  },
  orContainer: {
    // borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: scale(20)
  },
  orText: {
    textAlign: 'center',
    color: '#555',

  },
  findGroupContainer: {
    // borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  findGroupButton: {
    borderWidth: 1,
    borderColor: '#0f5e9c',
    borderRadius: 60 / 2,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    margin: moderateScale(15)
  },
  findGroupText: {
    fontSize: moderateScale(14)
  },

});
