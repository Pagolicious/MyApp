// import { createNavigationContainerRef } from '@react-navigation/native';
// import { RootStackParamList } from '../utils/types'; // ✅ Import RootStackParamList
// import { StackNavigationProp } from '@react-navigation/stack';

// export const navigationRef = createNavigationContainerRef<RootStackParamList>();

// export function navigate<RouteName extends keyof RootStackParamList>(
//   name: RouteName,
//   params?: RootStackParamList[RouteName] // ✅ Ensure correct params type
// ) {
//   if (navigationRef.isReady()) {
//     navigationRef.navigate(name, params as any); // ✅ Force correct param typing
//   } else {
//     console.log('Navigation is not ready yet');
//   }
// }
import React from 'react';
import { NavigationContainerRef, ParamListBase } from '@react-navigation/native';

export const navigationRef = React.createRef<NavigationContainerRef<ParamListBase>>();

export function navigate<RouteName extends keyof ParamListBase>(
  name: RouteName,
  params?: ParamListBase[RouteName]
) {
  navigationRef.current?.navigate(name, params);
}
