// import React from 'react';
// import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
// import Icon from 'react-native-vector-icons/AntDesign';
// import { StackHeaderProps } from '@react-navigation/stack';
// import { moderateScale, verticalScale } from 'react-native-size-matters';

// const CustomHeader: React.FC<StackHeaderProps> = ({ navigation, options, back }) => {
//   return (
//     <View style={styles.header}>
//       {back && options?.showBackButton !== false ? (
//   <TouchableOpacity onPress={navigation.goBack}>
//     <Icon name="arrowleft" size={25} color="white" />
//   </TouchableOpacity>
// ) : (
//   <View style={{ width: 25 }} />
// )}


//       <Text style={styles.headerText}>{options.title || ''}</Text>

//       {options.headerRight ? options.headerRight({ tintColor: 'white' }) : <View style={{ width: 25 }} />}
//     </View>
//   );
// };

// export default CustomHeader;

// const styles = StyleSheet.create({
//   header: {
//     height: verticalScale(65),
//     backgroundColor: '#5f4c4c',
//     paddingHorizontal: moderateScale(15),
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   headerText: {
//     fontSize: moderateScale(20),
//     fontWeight: 'bold',
//     color: 'white',
//   },
// });
