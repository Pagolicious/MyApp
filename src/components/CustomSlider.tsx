import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
} from 'react-native';

const RIGHT_THRESHOLD = 60;
const LEFT_THRESHOLD = -60;
const SLIDER_WIDTH = 200;
const THUMB_SIZE = 63;
const MAX_SWIPE_LEFT = -(SLIDER_WIDTH - THUMB_SIZE);
const INITIAL_X = 0

type Props = {
  onDelist?: () => void;
  onReactivate?: () => void;
};

const CustomSlider = ({ onDelist, onReactivate }: Props) => {
  const panX = useRef(new Animated.Value(INITIAL_X)).current;
  const [isDelisted, setIsDelisted] = useState(false);
  const dragOffsetX = useRef(0);
  const isDelistedRef = useRef(false);

  useEffect(() => {
    isDelistedRef.current = isDelisted;
  }, [isDelisted]);


  const searchingOpacity = panX.interpolate({
    inputRange: [MAX_SWIPE_LEFT / 2, 0],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const almostThereOpacity = panX.interpolate({
    inputRange: [MAX_SWIPE_LEFT, MAX_SWIPE_LEFT / 2],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const revealTranslateX = panX.interpolate({
    inputRange: [MAX_SWIPE_LEFT, 0],
    outputRange: [10, 0],
    extrapolate: 'clamp',
  });

  const thumbBackground = panX.interpolate({
    inputRange: [MAX_SWIPE_LEFT, 0],
    outputRange: ['rgb(255,0,0)', 'rgb(33,150,243)'],
    extrapolate: 'clamp',
  });

  const containerBorderColor = panX.interpolate({
    inputRange: [MAX_SWIPE_LEFT, 0],
    outputRange: ['rgb(255,0,0)', '#2196F3'],
    extrapolate: 'clamp',
  });



  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dx) > 5,
      onPanResponderGrant: () => {
        panX.setOffset(isDelistedRef.current ? MAX_SWIPE_LEFT : 0); // set initial offset
        panX.setValue(0); // reset value so dx starts from 0
      },

      onPanResponderMove: (_, gesture) => {
        const dx = gesture.dx;
        const currentOffset = isDelistedRef.current ? MAX_SWIPE_LEFT : 0;
        const nextX = dx + currentOffset;

        if (nextX >= MAX_SWIPE_LEFT && nextX <= 0) {
          panX.setValue(dx); // Just the delta!
        }
      },


      onPanResponderRelease: (_, gesture) => {
        panX.flattenOffset();

        if (gesture.dx <= LEFT_THRESHOLD && !isDelisted) {
          // Slide left to delist
          Animated.timing(panX, {
            toValue: MAX_SWIPE_LEFT,
            duration: 200,
            useNativeDriver: false,
          }).start(() => {
            setIsDelisted(true);
            onDelist?.();
          });
        } else if (gesture.dx >= RIGHT_THRESHOLD && isDelistedRef.current) {
          // Slide right to re-activate
          Animated.timing(panX, {
            toValue: INITIAL_X,
            duration: 200,
            useNativeDriver: false,
          }).start(() => {
            setIsDelisted(false);
            onReactivate?.();
          });
        } else {
          // Not enough movement → go back to current position
          Animated.spring(panX, {
            toValue: isDelisted ? MAX_SWIPE_LEFT : INITIAL_X,
            useNativeDriver: false,
          }).start();
        }
      }

    })
  ).current;

  // const resetSlider = () => {
  //   Animated.spring(panX, {
  //     toValue: INITIAL_X,
  //     useNativeDriver: false,
  //   }).start();
  // };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          borderColor: containerBorderColor,
          borderWidth: 2,
        },
      ]}
    >
      <Animated.Text style={[styles.label, { opacity: searchingOpacity }]}>
        Searching...
      </Animated.Text>
      <Animated.View
        style={{
          position: 'absolute',
          right: THUMB_SIZE - 15,
          opacity: almostThereOpacity,
          transform: [{ translateX: revealTranslateX }],
          zIndex: 1,
        }}
      >
        <Text style={{ fontSize: 14, color: '#444' }}>Delist group</Text>
      </Animated.View>

      <Animated.View
        style={[
          styles.thumb,
          {
            transform: [{ translateX: panX }],
            backgroundColor: thumbBackground,
          },
        ]}
        {...panResponder.panHandlers}
      >
        <Text style={styles.thumbText}>{isDelisted ? '❌' : '🔍'}</Text>
      </Animated.View>
    </Animated.View>
  );

};

const styles = StyleSheet.create({
  container: {
    width: SLIDER_WIDTH,
    height: 60,
    backgroundColor: 'lightgrey',
    borderRadius: 30,
    // overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: 10,
    position: 'relative',
  },
  label: {
    fontSize: 16,
    color: '#444',
    marginRight: THUMB_SIZE + 10,
    zIndex: 0,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    backgroundColor: '#2196F3',
    borderRadius: THUMB_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    right: 0,
    zIndex: 2,
  },
  thumbText: {
    fontSize: 22,
    color: 'white',
  },
});

export default CustomSlider;
