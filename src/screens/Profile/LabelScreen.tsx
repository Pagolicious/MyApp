import { StyleSheet, Text, View, TouchableOpacity, FlatList, Pressable, Animated } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../utils/types';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { useNavigation } from '@react-navigation/native';
import { Dimensions } from 'react-native';

//Components
import NewLabelModal from '../../components/NewLabel'

//Contexts
import { useAuth } from '../../context/AuthContext';

//Firebase
import firestore from '@react-native-firebase/firestore';

//Icons
import ADIcon from 'react-native-vector-icons/AntDesign';
import MIcon from 'react-native-vector-icons/MaterialIcons';
import EIcon from 'react-native-vector-icons/Entypo';

//Types
import { Friend } from '../../types/userTypes';


type LabelScreenRouteProp = RouteProp<RootStackParamList, 'LabelScreen'>;

const LabelScreen = () => {
  const route = useRoute<LabelScreenRouteProp>();
  const { friend } = route.params;
  const { currentUser } = useAuth()
  const navigation = useNavigation();
  const [suggestionLabels, setSuggestionLabels] = useState<string[]>([
    'Close Friends', 'Badminton', 'Tennis', 'Colleagues', 'Family', 'Football', 'New Friends', 'Table Tennis'
  ]);
  const [showDelete, setShowDelete] = useState(false);
  const [userLabels, setUserLabels] = useState<string[]>([]);

  const deleteAnim = useRef(new Animated.Value(0)).current;
  const labelWidthAnim = useRef(new Animated.Value(1)).current; // 1 = 100%
  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = firestore()
      .collection('users')
      .doc(currentUser.uid)
      .onSnapshot(docSnap => {
        const data = docSnap.data();
        const friendDoc = data?.friends.find((f: Friend) => f.uid === friend.uid);
        if (friendDoc?.labels) {
          setUserLabels(friendDoc.labels);
        } else {
          setUserLabels([]);
        }
      });

    return () => unsubscribe();
  }, []);


  const toggleDeleteButtons = () => {
    setShowDelete(prev => !prev);

    Animated.parallel([
      Animated.timing(deleteAnim, {
        toValue: showDelete ? 0 : 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(labelWidthAnim, {
        toValue: showDelete ? 1 : 0.45,
        duration: 300,
        useNativeDriver: false,
      })
    ]).start();
  };

  const handleDeleteLabel = async (labelToRemove: string) => {

    if (!currentUser) return

    try {
      const userRef = firestore().collection('users').doc(currentUser.uid);
      const docSnap = await userRef.get();
      const data = docSnap.data();

      if (!data?.friends) return;

      const updatedFriends = data.friends.map((f: Friend) => {
        if (f.uid === friend.uid) {
          const newLabels = (f.labels || []).filter((label: string) => label !== labelToRemove);
          return { ...f, labels: newLabels };
        }
        return f;
      });

      await userRef.update({ friends: updatedFriends });
    } catch (error) {
      console.error('Failed to delete label:', error);
    }
  };

  const handleSuggestionPress = async (label: string) => {
    if (!currentUser) return

    try {
      const userRef = firestore().collection('users').doc(currentUser.uid);
      const docSnap = await userRef.get();
      const data = docSnap.data();

      if (!data?.friends) return;


      const updatedFriends = data.friends.map((f: Friend) => {
        if (f.uid === friend.uid) {
          const currentLabels = f.labels || [];
          if (!currentLabels.includes(label)) {
            return {
              ...f,
              labels: [...currentLabels, label]
            };
          }
        }
        return f;
      });

      await userRef.update({ friends: updatedFriends });

      setSuggestionLabels(prev =>
        prev.filter(s => s.toLowerCase() !== label.toLowerCase())
      );
    } catch (error) {
      console.error('Error updating Firestore labels:', error);

    }
  };

  // const handleLabelAdded = (label: string) => {
  //   setUserLabels(prev => [...prev, label]);
  //   setSuggestionLabels(prev => prev.filter(s => s !== label));
  // };



  const handleGoBackButton = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => handleGoBackButton()}>
          <ADIcon name="arrowleft" size={25} color="white" />
        </TouchableOpacity>
        <View style={styles.spacer} />
        <Text style={styles.headerText}>Labels</Text>
        <View style={styles.spacer} />


      </View>
      <View style={styles.labelTitleContainer}>
        <Text style={styles.labelTitleText}>Add Labels to {friend.firstName} {friend.lastName}</Text>
      </View>
      <View style={styles.labelContainer}>
        <View style={styles.labelContent}>
          {userLabels.map((label, index) => (
            <View key={`${label}-${index}`} style={styles.labelRow}>
              <Animated.View
                style={[
                  styles.label,
                  {
                    width: labelWidthAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [screenWidth * 0.5 - 30, screenWidth - 40],
                    }),
                  }
                ]}
              >
                <Text style={styles.labelText}>{label}</Text>
              </Animated.View>
              <Animated.View
                style={[
                  styles.deleteButtonContainer,
                  {
                    opacity: deleteAnim,
                    transform: [{
                      translateX: deleteAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                      })
                    }]
                  }
                ]}
              >

                <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteLabel(label)}>
                  <MIcon name="delete" size={20} color="#C41E3A" />
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              </Animated.View>


            </View>
          ))}

        </View>

      </View>
      <View style={styles.buttonContainer}>
        {currentUser && (
          <NewLabelModal
            friend={friend}
            currentUserId={currentUser.uid}
          // onLabelAdded={handleLabelAdded}

          />
        )}
        {/* <Pressable style={styles.createCustomButton}>
          <Text style={styles.buttonText}>Create Custom</Text>
        </Pressable> */}
        {userLabels.length > 0 && (
          <Pressable style={styles.editButton} onPress={toggleDeleteButtons}>
            <Text style={styles.buttonText}>Edit Labels</Text>
          </Pressable>
        )}

      </View>
      <View style={styles.line}></View>
      <Text style={styles.suggestionTitle}>Suggestion</Text>
      <View style={styles.suggestionContainer}>
        <View style={styles.labelList}>
          {suggestionLabels.map((label, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleSuggestionPress(label)}
              style={styles.suggestionButton}
            >
              <Text style={styles.suggestionText}>{label}</Text>
              <EIcon name="plus" size={20} color="black" style={styles.suggestionPlusIcon} />

            </TouchableOpacity>
          ))}
        </View>

      </View>
    </View>

  );
};

export default LabelScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,

  },
  header: {
    height: verticalScale(65),
    backgroundColor: "#5f4c4c",
    padding: moderateScale(15),
    alignItems: "center",
    flexDirection: "row",
  },
  headerText: {
    fontSize: moderateScale(20),
    fontWeight: "bold",
    color: "white",
    marginRight: scale(20),
  },
  spacer: {
    flex: 1,
  },
  labelTitleContainer: {
    // borderWidth: 1,
    padding: moderateScale(15)
  },
  labelTitleText: {
    fontSize: moderateScale(22),
    fontWeight: 'bold',
    textAlign: "center",

  },
  labelContainer: {
    marginVertical: verticalScale(15),
    marginHorizontal: scale(20)
  },
  labelContent: {
    flexDirection: 'column',
    gap: 10,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: '100%',
  },

  label: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    // backgroundColor: '#e0e0e0',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'green',
    marginRight: 5,
  },
  labelText: {
    fontSize: moderateScale(16),
    // color: '#333',
  },
  deleteButtonContainer: {
    // borderWidth: 1,
    // borderRadius: 10,
  },
  deleteButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#C41E3A',
    borderWidth: 1,
    borderRadius: 10,
    padding: 8,


  },
  deleteText: {
    fontSize: moderateScale(16)
  },


  // delLabelBtn: {
  //   alignItems: 'center',
  //   justifyContent: 'center',
  //   flexDirection: 'row',
  //   width: scale(80),
  //   height: verticalScale(40),
  //   borderRadius: 10,
  //   backgroundColor: "lightgrey"
  // },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginVertical: 15
  },
  editButton: {
    backgroundColor: '#007AFF',
    // borderWidth: 1,
    paddingVertical: verticalScale(8),
    paddingHorizontal: scale(16),
    borderRadius: 6,
    elevation: 3,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  line: {
    height: 1,
    backgroundColor: 'black',
    marginHorizontal: 25,
    marginVertical: 20,
    // borderWidth: 1
  },
  suggestionTitle: {
    textAlign: 'center',
    fontSize: moderateScale(25)
  },
  suggestionContainer: {
    // borderWidth: 1,
    marginHorizontal: 30,
    marginVertical: 30,

  },

  labelList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 15,
  },
  suggestionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    flexDirection: 'row',
    // alignSelf: 'flex-start',
    // overflow: 'visible', // allow icon to render outside
    // paddingRight: 20, // space for icon's base position
    // justifyContent: 'center',
    // alignItems: 'flex-end',
    alignItems: 'center'

  },
  suggestionText: {
    fontSize: 16,
  },
  suggestionPlusIcon: {
  }
  // width: scale(200),
  //     height: verticalScale(40),
  //     borderWidth: 1,
  //     borderTopLeftRadius: 10,
  //     borderTopEndRadius: 10,
  //     borderStartEndRadius: 10,
  //     backgroundColor: '#f2f2f2',
  //     justifyContent: 'center',
  //     alignItems: 'flex-end',
  //     paddingRight: 20,
  //     overflow: 'visible',
});
