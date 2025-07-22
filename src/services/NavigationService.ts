import React from 'react';
// import { NavigationContainerRef } from '@react-navigation/native';
// import { RootStackParamList } from '../utils/types';

// export const navigationRef = React.createRef<NavigationContainerRef<RootStackParamList>>();

// type NavigateArgs = Parameters<NavigationContainerRef<RootStackParamList>['navigate']>;

// export function navigate(...args: NavigateArgs) {
//   navigationRef.current?.navigate(...args);
// }

import { NavigationContainerRef, StackActions, ParamListBase } from '@react-navigation/native';

export const navigationRef = React.createRef<NavigationContainerRef<ParamListBase>>();

export function navigate(name: string, params?: object) {
  // console.log('navigation', name, params)
  navigationRef.current?.navigate(name, params);
}
