declare module 'react-native-material-ripple' {
  import { Component } from 'react';
  import { ViewStyle, StyleProp, GestureResponderEvent } from 'react-native';

  interface RippleProps {
    rippleColor?: string;
    rippleOpacity?: number;
    rippleDuration?: number;
    rippleSize?: number;
    rippleContainerBorderRadius?: number;
    rippleCentered?: boolean;
    rippleSequential?: boolean;
    rippleFades?: boolean;
    disabled?: boolean;
    onPress?: (event: GestureResponderEvent) => void;
    style?: StyleProp<ViewStyle>;
    children?: React.ReactNode;
  }

  export default class Ripple extends Component<RippleProps> { }
}
