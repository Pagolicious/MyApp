import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { GOOGLE_API_KEY } from '@env';
import { navigate } from '../services/NavigationService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RouteProp, useRoute } from '@react-navigation/native';

import { saveRecentSearch, getRecentSearches } from '../utils/recentSearchHelper';

//Types
import { AutocompleteSuggestion, PlaceDetails } from '../types/apiTypes';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { RootStackParamList } from '../utils/types';

type LocationSearchRouteProp = RouteProp<RootStackParamList, 'LocationSearchScreen'>;

const SearchLocationScreeen: React.FC = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [selected, setSelected] = useState<PlaceDetails | null>(null);
  const inputRef = useRef<TextInput>(null);
  const [recent, setRecent] = useState<AutocompleteSuggestion[]>([]);


  const route = useRoute<LocationSearchRouteProp>();

  const shortenAddress = (fullAddress: string): string => {
    const parts = fullAddress.split(',');
    if (parts.length >= 2) {
      const street = parts[0].trim();
      const city = parts[1].replace(/\d+/g, '').trim(); // remove postal code digits
      return `${street}, ${city}`;
    }
    return fullAddress;
  };

  const RECENT_KEY = 'recentSearches';


  useEffect(() => {
    getRecentSearches().then(setRecent);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100); // slight delay ensures it's mounted

    return () => clearTimeout(timer);
  }, []);


  const handleChange = async (text: string) => {
    setQuery(text);
    if (text.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://places.googleapis.com/v1/places:autocomplete?key=${GOOGLE_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            input: text,
            includedRegionCodes: ['SE'],
            // regionCode: "SE"
            languageCode: 'sv',
          }),
        }
      );

      const json = await response.json();
      console.log('🔍 Autocomplete Response:', JSON.stringify(json, null, 2));

      if (json.suggestions) {
        const formatted = json.suggestions.map((s: any) => ({
          placeId: s.placePrediction.placeId,
          description: `${s.placePrediction.structuredFormat.mainText.text}, ${s.placePrediction.structuredFormat.secondaryText.text}`,
          types: s.placePrediction.types,

        }));
        setSuggestions(formatted);
      } else {
        setSuggestions([]);
      }

    } catch (error) {
      console.error('Autocomplete fetch error:', error);
    }
  };


  const selectPlace = async (placeId: string, fromRecent = false) => {
    try {
      setSuggestions([]);
      setQuery('');

      const selectedItem = fromRecent
        ? recent.find((r: any) => r.placeId === placeId)
        : suggestions.find(s => s.placeId === placeId);


      if (!selectedItem) {
        console.warn('No matching suggestion found');
        return;
      }

      await saveRecentSearch(selectedItem);

      const response = await fetch(
        `https://places.googleapis.com/v1/places/${placeId}?fields=location,formattedAddress,displayName&key=${GOOGLE_API_KEY}&languageCode=sv`
      );
      const json = await response.json();

      console.log('📍 Full place details:', json);

      const lat = json.location?.latitude;
      const lng = json.location?.longitude;

      if (lat == null || lng == null) {
        console.warn('Missing coordinates from place details');
        return;
      }
      const fullAddress = json.formattedAddress || selectedItem.description;


      const locationData = {
        name: json.displayName?.text || selectedItem.description,
        address: shortenAddress(fullAddress),
        coordinates: {
          latitude: lat,
          longitude: lng,
        },
      };

      // Optional: Update local state if needed
      setSelected(locationData as any);

      navigate('StartGroup', {
        location: locationData,
        activity: route.params?.previousActivity || '',
        title: route.params?.previousTitle || ''
      });

    } catch (error) {
      console.error('❌ selectPlace error:', error);
    }
  };


  const defaultRegion: Region = {
    latitude: 59.3293,
    longitude: 18.0686,
    latitudeDelta: 0.5,
    longitudeDelta: 0.5,
  };

  const getIconForType = (types: string[]) => {
    if (types.includes('restaurant')) return '🍽️';
    if (types.includes('cafe')) return '☕';
    if (types.includes('hospital') || types.includes('pharmacy')) return '🏥';
    if (types.includes('school') || types.includes('university')) return '🎓';
    if (types.includes('park') || types.includes('natural_feature')) return '🌳';
    if (types.includes('airport') || types.includes('train_station')) return '✈️';
    if (types.includes('locality') || types.includes('sublocality')) return '🏙️';
    if (types.includes('country')) return '🌍';
    if (types.includes('route') || types.includes('street_address')) return '🛣️';
    if (types.includes('establishment')) return '🏢';

    return '📍';
  };


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inputWrapper}>
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder="Search..."
          placeholderTextColor={'grey'}
          value={query}
          onChangeText={handleChange}
          autoCorrect={false}
        />

        {suggestions.length > 0 && (
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item.placeId}
            renderItem={({ item }) => {
              const icon = getIconForType(item.types);


              return (
                <TouchableOpacity onPress={() => selectPlace(item.placeId)} style={styles.suggestionItem}>
                  <Text style={styles.suggestionText}>
                    {icon}  {item.description}
                  </Text>
                </TouchableOpacity>
              );
            }}

            style={styles.suggestionsList}
            keyboardShouldPersistTaps="handled"
          />
        )}
      </View>

      <View style={styles.recentContainer}>
        <View style={styles.row}>
          <Text style={styles.recentHeader}>Recent Searches</Text>
          <TouchableOpacity onPress={async () => {
            await AsyncStorage.removeItem(RECENT_KEY);
            setRecent([]);
          }}
            style={styles.clearButton}
          >
            <Text style={styles.clearText}>Clear recent searches</Text>
          </TouchableOpacity>

        </View>
        {suggestions.length === 0 && recent.length > 0 && (
          <>
            {recent.map((item) => (
              <TouchableOpacity
                key={item.placeId}
                onPress={() => selectPlace(item.placeId, true)}
                style={styles.recentItem}
              >
                <Text style={styles.recentText}>{getIconForType(item.types)} {item.description}</Text>
              </TouchableOpacity>
            ))}
          </>
        )}

      </View>



      {selected?.geometry?.location?.latitude &&
        selected?.geometry?.location?.longitude && (
          <MapView
            style={styles.map}
            region={{
              latitude: selected.geometry.location.latitude,
              longitude: selected.geometry.location.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <Marker
              coordinate={selected.geometry.location}
              title={selected.name}
              description={selected.formatted_address}
            />
          </MapView>
        )}

    </SafeAreaView>
  );
};

const screen = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  inputWrapper: {
    marginHorizontal: 16,
    marginTop: 20,
    zIndex: 10,
    // flex: 1
  },

  input: {
    height: 50,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    borderRadius: 8,
    elevation: 3,
  },

  suggestionsList: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    maxHeight: 600,
    elevation: 3,
    position: 'absolute',
    top: 60, // directly under input
    left: 0,
    right: 0,
    zIndex: 999,

  },

  suggestionItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },

  suggestionText: {
    fontSize: 16,
    color: '#333',
  },
  item: {
    padding: 12,
    backgroundColor: '#fafafa',
    borderBottomWidth: 1,
    borderColor: '#eee',
    zIndex: 1,
  },
  map: {
    flex: 1, // fill remaining space
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },

  recentContainer: {
    flex: 1,
    marginTop: verticalScale(18),
    backgroundColor: '#f6f6f6',
    borderTopWidth: 1,
    borderColor: '#ddd'
  },
  row: {
    flexDirection: 'row',
    // borderWidth: 1,
    margin: scale(10),
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  recentHeader: {
    fontSize: moderateScale(18),
  },
  clearButton: {
    // borderWidth: 1,
    borderRadius: 10,
    padding: scale(5)
  },
  clearText: {
    fontSize: moderateScale(14),
    color: '#C41E3A',
  },
  recentItem: {
    borderBottomWidth: 1,
    borderColor: '#ddd'
  },
  recentText: {
    padding: scale(15)
  }
});

export default SearchLocationScreeen;
