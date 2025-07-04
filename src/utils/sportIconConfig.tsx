import React from 'react';
import RockClimbingIcon from '../assets/Icons/rock-climbing.png';
import BoulderingIcon from '../assets/Icons/bouldering.png'
import DartIcon from '../assets/Icons/dart.png'
import Dart2Icon from '../assets/Icons/dart2.png'
import SkateboardingIcon from '../assets/Icons/skateboarding.png'
import BowlingIcon from '../assets/Icons/bowling.png'
import SnookerIcon from '../assets/Icons/snooker.png'
import SquashIcon from '../assets/Icons/squash.png'
import WeightliftingIcon from '../assets/Icons/weightlifting.png'


import { Image } from 'react-native';

import FAIcon from 'react-native-vector-icons/FontAwesome';
import FA5Icon from 'react-native-vector-icons/FontAwesome5';
import FA6Icon from 'react-native-vector-icons/FontAwesome6';
import MCIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import IonIcon from 'react-native-vector-icons/Ionicons';
import MIcon from 'react-native-vector-icons/MaterialIcons';

type IconConfig = {
  icon: React.ReactNode;
  color: string;
};

export const getSportIconConfig = (sport: string, size: number = 40): IconConfig => {
  const key = sport.toLowerCase();
  switch (key) {
    case 'football':
      return { icon: <FAIcon name="soccer-ball-o" size={size} color="#4CAF50" />, color: "#4CAF50" };
    case 'badminton':
      return { icon: <MCIcon name="badminton" size={size} color="#03A9F4" />, color: "#03A9F4" };
    case 'table tennis':
      return { icon: <FA5Icon name="table-tennis" size={size} color="#E91E63" />, color: "#E91E63" };
    case 'basket':
    case 'basketball':
      return { icon: <FA6Icon name="basketball" size={size} color="#FFA500" />, color: "#FFA500" };
    case 'tennis':
      return { icon: <IonIcon name="tennisball" size={size} color="#8BC34A" />, color: "#8BC34A" };
    case 'volleyball':
      return { icon: <FA6Icon name="volleyball" size={size} color="#FFD54F" />, color: "#FFD54F" };
    case 'baseball':
      return { icon: <FA6Icon name="baseball" size={size} color="#D32F2F" />, color: "#D32F2F" };
    case 'golf':
      return { icon: <FA6Icon name="golf-ball-tee" size={size} color="#4CAF50" />, color: "#4CAF50" };
    case 'cricket':
      return { icon: <MCIcon name="cricket" size={size} color="#689F38" />, color: "#689F38" };
    case 'swimming':
      return { icon: <FA6Icon name="person-swimming" size={size} color="#0288D1" />, color: "#0288D1" };
    case 'hockey':
      return { icon: <FA6Icon name="hockey-puck" size={size} color="#0D47A1" />, color: "#0D47A1" };
    case 'rugby':
      return { icon: <MCIcon name="rugby" size={size} color="#6D4C41" />, color: "#6D4C41" };
    case 'cycling':
      return { icon: <IonIcon name="bicycle" size={size} color="#FF9800" />, color: "#FF9800" };
    case 'martial arts':
      return { icon: <MIcon name="sports-martial-arts" size={size} color="#212121" />, color: "#212121" };
    case 'boxing':
      return { icon: <MCIcon name="boxing-glove" size={size} color="#C62828" />, color: "#C62828" };
    case 'skiing':
      return { icon: <FA6Icon name="person-skiing" size={size} color="#0288D1" />, color: "#0288D1" };
    case 'snowboarding':
      return { icon: <FA6Icon name="person-snowboarding" size={size} color="#00BCD4" />, color: "#00BCD4" };
    case 'surfing':
      return { icon: <MCIcon name="surfing" size={size} color="#039BE5" />, color: "#039BE5" };
    // case 'skateboarding':
    //   return { icon: <MCIcon name="skateboarding" size={size} color="#212121" />, color: "#212121" };
    case 'skateboarding':
      return {
        icon: <Image source={SkateboardingIcon} style={{ width: size, height: size, resizeMode: 'contain' }} />,
        color: '#212121',
      };
    case 'archery':
      return { icon: <MCIcon name="bow-arrow" size={size} color="#795548" />, color: "#795548" };
    case 'fencing':
      return { icon: <MCIcon name="fencing" size={size} color="#546E7A" />, color: "#212121" };
    case 'rowing':
      return { icon: <MCIcon name="rowing" size={size} color="#0277BD" />, color: "#795548" };
    case 'kayaking':
      return { icon: <MCIcon name="kayaking" size={size} color="#EF6C00" />, color: "#212121" };
    case 'sailing':
      return { icon: <MIcon name="sailing" size={size} color="#039BE5" />, color: "#795548" };
    case 'rock climbing':
      return {
        icon: <Image source={RockClimbingIcon} style={{ width: size, height: size, resizeMode: 'contain' }} />,
        color: '#5D4037',
      };
    case 'bouldering':
      return {
        icon: <Image source={BoulderingIcon} style={{ width: size, height: size, resizeMode: 'contain' }} />,
        color: '#757575',
      };
    case 'polo':
      return { icon: <MCIcon name="polo" size={size} color="#4E342E" />, color: "#212121" };
    case 'darts':
      return {
        icon: <Image source={Dart2Icon} style={{ width: size, height: size, resizeMode: 'contain' }} />,
        color: '#C62828 ',
      };
    case 'bowling':
      return {
        icon: <Image source={BowlingIcon} style={{ width: size, height: size, resizeMode: 'contain' }} />,
        color: '#37474F',
      };
    case 'snooker':
      return {
        icon: <Image source={SnookerIcon} style={{ width: size, height: size, resizeMode: 'contain' }} />,
        color: 'black',
      };
    case 'squash':
      return {
        icon: <Image source={SquashIcon} style={{ width: size, height: size, resizeMode: 'contain' }} />,
        color: 'CDDC39',
      };
    case 'weightlifting':
      return {
        icon: <Image source={WeightliftingIcon} style={{ width: size, height: size, resizeMode: 'contain' }} />,
        color: 'F44336',
      };
    case 'ice skating':
      return { icon: <FA5Icon name="skating" size={size} color="#81D4FA" />, color: "#81D4FA" };
    default:
      return { icon: <IonIcon name="help-circle-outline" size={size} color="#777" />, color: "#777" };
  }
};
