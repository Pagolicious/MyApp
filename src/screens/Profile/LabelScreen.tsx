import { StyleSheet, Text, View, TouchableOpacity, FlatList } from 'react-native';
import React, { useState, useEffect } from 'react';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../utils/types';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { useNavigation } from '@react-navigation/native';

//Assets
import sportsList from "../../assets/JsonFiles/sportsList.json"

//Icons
import ADIcon from 'react-native-vector-icons/AntDesign';
import MIcon from 'react-native-vector-icons/MaterialIcons';
import EIcon from 'react-native-vector-icons/Entypo';


type LabelScreenRouteProp = RouteProp<RootStackParamList, 'LabelScreen'>;

const LabelScreen = () => {
  const route = useRoute<LabelScreenRouteProp>();
  const { friend } = route.params;
  const navigation = useNavigation();
  const [suggestionLabels, setSuggestionLabels] = useState<string[]>([
    'Close Friends', 'Badminton', 'Tennis', 'Colleagues', 'Family', 'Football', 'New Friends', 'Table Tennis'
  ]);



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
        <View style={styles.row}>
          <TouchableOpacity style={styles.addLabel}>
            <EIcon name="plus" size={45} color="black" style={styles.plusIcon} />
          </TouchableOpacity>
          <View style={styles.delLabel}>
            <TouchableOpacity style={styles.delLabelBtn} onPress={() => console.log('d')}>
              <MIcon name="delete" size={25} color="red" />
              <Text>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <View style={styles.line}></View>
      <Text style={styles.suggestionTitle}>Suggestion</Text>
      <View style={styles.suggestionContainer}>
        <FlatList
          data={suggestionLabels}
          keyExtractor={(item, index) => item + index}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.labelItem}>
              <Text style={styles.labelText}>{item}</Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.labelList}
        />
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
    marginVertical: verticalScale(15)
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-evenly'
  },
  addLabel: {
    width: scale(200),
    height: verticalScale(40),
    borderWidth: 1,
    borderTopLeftRadius: 10,
    borderTopEndRadius: 10,
    borderStartEndRadius: 10,
    backgroundColor: '#f2f2f2',
    justifyContent: 'center',
    alignItems: 'flex-end', // aligns icon to the right
    paddingRight: 20, // space for icon's base position
    overflow: 'visible', // allow icon to render outside
  },

  plusIcon: {
    position: 'absolute',
    right: -23, // move slightly outside the right border
    // bottom: 0,
    top: '85%',
    transform: [{ translateY: -15 }],

  },
  delLabel: {

  },
  delLabelBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    width: scale(80),
    height: verticalScale(40),
    borderRadius: 10,
    backgroundColor: "lightgrey"
  },
  // subtitle: {
  //   marginTop: 10,
  //   fontSize: 16,
  //   color: 'gray',
  // },
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
  labelItem: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    alignSelf: 'flex-start',
  },
  labelText: {
    fontSize: 16,
  },

});
