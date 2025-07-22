import { StyleSheet, Text, View, TouchableOpacity, FlatList, ScrollView, } from 'react-native';
import React, { useRef, useEffect, useState } from 'react';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { PieChart } from 'react-native-chart-kit';

//Navigation
import { Dimensions } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';

//Firebase
import firestore from '@react-native-firebase/firestore';

//Components
import CustomAvatar from '../../components/CustomAvatar';

//Context
import { useAuth } from '../../context/AuthContext';

//Icons
import ADIcon from 'react-native-vector-icons/AntDesign';
import FAIcon from 'react-native-vector-icons/FontAwesome';
import MCIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import FA5Icon from 'react-native-vector-icons/FontAwesome5';
import FA6Icon from 'react-native-vector-icons/FontAwesome6';
import IonIcon from 'react-native-vector-icons/Ionicons';

//Types
import { User } from '../../types/userTypes';

//Utils
import { getSportIconConfig } from '../../utils/sportIconConfig';



const ProfilePageScreen = () => {
  const { currentUser } = useAuth()
  const route = useRoute();
  const [profileUserData, setProfileUserData] = useState<User | null>(null);
  const navigation = useNavigation();
  const { userId } = route.params as { userId?: string };
  const finalUserId = userId || currentUser?.uid;
  const flatListRef = useRef<FlatList<any>>(null);
  // const ITEM_WIDTH = 110;


  // const scrollToMiddle = () => {
  //   if (flatListRef.current) {
  //     flatListRef.current.scrollToOffset({ offset: ITEM_WIDTH * sportsPlayed.length, animated: false });
  //   }
  // };


  const fetchUser = async () => {
    if (!finalUserId) return;

    const doc = await firestore().collection('users').doc(finalUserId).get();
    if (doc.exists()) {
      const user = doc.data();
      if (user) {
        setProfileUserData(user as User);
      }
    }
  };

  useEffect(() => {
    fetchUser();
  }, [finalUserId]);



  // useEffect(() => {
  //   scrollToMiddle();
  // }, []);

  const screenWidth = Dimensions.get('window').width;

  const sportsPlayed = [
    { sport: 'Football', count: 13 },
    { sport: 'Badminton', count: 9 },
    { sport: 'Table tennis', count: 2 },
    { sport: 'Basket', count: 5 },
    { sport: 'Tennis', count: 3 },
    { sport: 'Volleyball', count: 1 },
    { sport: 'Baseball', count: 1 },
    { sport: 'Golf', count: 1 },
    { sport: 'Cricket', count: 1 },
    { sport: 'Swimming', count: 1 },
    { sport: 'Hockey', count: 1 },
    { sport: 'Rugby', count: 1 },
    { sport: 'Cycling', count: 1 },
    { sport: 'Martial Arts', count: 1 },
    { sport: 'Boxing', count: 1 },
    { sport: 'Skiing', count: 1 },
    { sport: 'Snowboarding', count: 1 },
    { sport: 'Surfing', count: 1 },
    { sport: 'Skateboarding', count: 1 },
    { sport: 'Archery', count: 1 },
    { sport: 'Fencing', count: 1 },
    { sport: 'Rowing', count: 1 },
    { sport: 'Kayaking', count: 1 },
    { sport: 'Sailing', count: 1 },
    { sport: 'Rock Climbing', count: 1 },
    { sport: 'Bouldering', count: 1 },
    { sport: 'Polo', count: 1 },
    { sport: 'Darts', count: 1 },
    { sport: 'Bowling', count: 1 },
    { sport: 'Snooker', count: 1 },
    { sport: 'Squash', count: 1 },
    { sport: 'Weightlifting', count: 1 },
    { sport: 'Ice Skating', count: 1 },
  ];

  const userStats = {
    shows: 14,
    noShows: 2,
    hosted: 5
  };

  // const repeatedData = [...sportsPlayed, ...sportsPlayed, ...sportsPlayed,];


  const total = userStats.shows + userStats.noShows;

  const pieDataShowd = [
    {
      name: 'Showed Up',
      count: userStats.shows,
      color: '#10B981',
      legendFontColor: '#333',
      legendFontSize: 13,
    },
    {
      name: 'No-Show',
      count: userStats.noShows,
      color: '#F87171',
      legendFontColor: '#333',
      legendFontSize: 13,
    },
  ];


  const pieDataHosted = [
    {
      name: 'Hosted',
      count: userStats.hosted,
      color: '#4F46E5',
      legendFontColor: '#333',
      legendFontSize: 13,
    },
    {
      name: 'Joined',
      count: (userStats.noShows + userStats.shows - userStats.hosted),
      color: '#60A5FA',
      legendFontColor: '#333',
      legendFontSize: 13,
    },
  ];


  // const getSportIcon = (sport: string, size = 40, color = '#50C878') => {
  //   switch (sport.toLowerCase()) {
  //     case 'football':
  //       return <FAIcon name="soccer-ball-o" size={size} color="#4CAF50" />;
  //     case 'table tennis':
  //       return <FA5Icon name="table-tennis" size={size} color="#D32F2F" />;
  //     case 'badminton':
  //       return <MCIcon name="badminton" size={size} color="#03A9F4" />;
  //     case 'basket':
  //       return <FA6Icon name="basketball" size={size} color="#FFA500" />;
  //     case 'tennis':
  //       return <IonIcon name="tennisball" size={size} color="#8BC34A" />;
  //     case 'volleyball':
  //       return <FA6Icon name="volleyball" size={size} color="#FFD54F" />;

  //     default:
  //       return <IonIcon name="help-circle-outline" size={size} color={color} />;
  //   }
  // };

  const calculateAge = (birthDate: Date): number => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--; // birthday hasn't happened yet this year
    }
    return age;
  };


  return (
    <ScrollView style={{ flex: 1 }}>

      <View style={styles.topSection}>
        <View style={styles.avatar}>
          <CustomAvatar
            uid={finalUserId || 'default-uid'}
            firstName={profileUserData?.firstName || 'Unknown'}
            size={moderateScale(160)}
          />
        </View>
        <View style={styles.userInformation}>
          <Text style={styles.profileNameText}>{profileUserData?.firstName} {profileUserData?.lastName}</Text>
          <Text style={styles.profileAgeLocationText}>
            {profileUserData?.dateOfBirth
              ? `${calculateAge(new Date(profileUserData.dateOfBirth.toDate()))} years old, Göteborg`
              : 'Göteborg'}
          </Text>
        </View>
        <View style={styles.bioContainer}>
          <Text style={styles.bioText}>
            Just moved to Gothenburg and love playing all kinds of sports — especially football, badminton, and tennis.
          </Text>
        </View>

      </View>
      <FlatList
        ref={flatListRef}
        horizontal
        data={sportsPlayed}
        keyExtractor={(item, index) => item.sport + index}
        contentContainerStyle={styles.sportListContainer}
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        renderItem={({ item }) => {
          const { icon, color } = getSportIconConfig(item.sport);
          return (
            <View style={styles.card}>
              <View style={styles.cardContent}>
                <View style={styles.iconWrapper}>
                  {/* {getSportIcon(item.sport)} */}
                  {icon}

                </View>
                {/* <Text style={styles.sportName}>{item.sport}</Text> */}
                <Text style={styles.sportName}>{item.sport}</Text>

              </View>
              <Text style={styles.playedText}>{item.count} played</Text>
            </View>
          )
        }}
      />


      <View style={styles.chartContainer}>
        <PieChart
          data={pieDataShowd}
          width={screenWidth - 100}
          height={100}
          chartConfig={{
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          accessor="count"
          backgroundColor="transparent"
          paddingLeft="5"
          absolute

        />
        <PieChart
          data={pieDataHosted}
          width={screenWidth - 100}
          height={100}
          chartConfig={{
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          accessor="count"
          backgroundColor="transparent"
          paddingLeft="5"
          absolute
        />
      </View>

    </ScrollView>
  );
};


const styles = StyleSheet.create({
  container: {
  },
  topSection: {
    alignItems: 'center',
  },
  avatar: {
    marginVertical: verticalScale(15),
  },
  profileNameText: {
    fontSize: moderateScale(24),
    fontWeight: 'bold',
  },
  profileAgeLocationText: {
    fontSize: moderateScale(18),
    marginTop: verticalScale(5),
  },
  userInformation: {
    alignItems: 'center',
  },
  bioContainer: {
    paddingVertical: verticalScale(25),
    paddingHorizontal: scale(45)
  },
  bioText: {
    fontSize: moderateScale(14),
    textAlign: "center",
    color: '#555',
  },
  sportListContainer: {
    paddingHorizontal: scale(10),
  },
  card: {
    alignItems: 'center',
    padding: moderateScale(10),
    marginRight: scale(7),
    backgroundColor: '#F4F4F4',
    borderRadius: 12,
  },
  cardContent: {
    borderWidth: 1,
    borderRadius: 12,
    padding: moderateScale(7),
    width: scale(90),
    alignItems: 'center',
  },
  iconWrapper: {
    marginBottom: verticalScale(6),
  },

  sportName: {
    fontSize: moderateScale(11),
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  playedText: {
    fontSize: 12,
    color: '#555',
    marginVertical: verticalScale(5)
  },
  chartContainer: {
    flexDirection: 'column',
    padding: moderateScale(10),
    margin: moderateScale(20),
    borderWidth: 1,
    borderRadius: 12
  },
});


export default ProfilePageScreen;
