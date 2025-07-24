declare module 'react-native-places-input' {
  import { Component } from 'react';
  import { ViewStyle, TextStyle } from 'react-native';

  export interface PlacesInputProps {
    googleApiKey: string;
    placeHolder?: string;
    language?: string;
    queryCountries?: string[];
    queryTypes?: string;
    searchLatitude?: number;
    searchLongitude?: number;
    onSelect?: (place: {
      result: {
        name: string;
        geometry: {
          location: {
            lat: number;
            lng: number;
          };
        };
        [key: string]: any;
      };
    }) => void;
    stylesContainer?: ViewStyle;
    stylesInput?: TextStyle;
    stylesList?: ViewStyle;
    stylesListItem?: ViewStyle;
    [key: string]: any;
  }

  export default class PlacesInput extends Component<PlacesInputProps> { }
}
