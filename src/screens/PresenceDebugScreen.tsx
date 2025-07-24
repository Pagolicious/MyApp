import React, { useState } from 'react';
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

interface AutocompleteSuggestion {
  placeId: string;
  description: string;
}

interface PlaceDetails {
  geometry: {
    location: {
      latitude: number;
      longitude: number;
    };
  };
  name: string;
  formatted_address: string;
}

const SearchLocation: React.FC = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [selected, setSelected] = useState<PlaceDetails | null>(null);

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
        }));
        setSuggestions(formatted);
      } else {
        setSuggestions([]);
      }

    } catch (error) {
      console.error('Autocomplete fetch error:', error);
    }
  };


  const selectPlace = async (placeId: string) => {
    setSuggestions([]);
    setQuery('');

    try {
      const response = await fetch(
        `https://places.googleapis.com/v1/places/${placeId}?key=${GOOGLE_API_KEY}&languageCode=sv`
      );
      const json = await response.json();

      const lat = json.geometry.location.lat;
      const lng = json.geometry.location.lng;

      setSelected({
        geometry: {
          location: {
            latitude: lat,
            longitude: lng,
          },
        },
        name: json.displayName?.text || json.name,
        formatted_address: json.formattedAddress,
      });
    } catch (error) {
      console.error('Place details error:', error);
    }
  };

  const defaultRegion: Region = {
    latitude: 59.3293,
    longitude: 18.0686,
    latitudeDelta: 0.5,
    longitudeDelta: 0.5,
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholder="Search in Sweden..."
          value={query}
          onChangeText={handleChange}
          autoCorrect={false}
        />

        {suggestions.length > 0 && (
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item.placeId}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => selectPlace(item.placeId)}
                style={styles.suggestionItem}
              >
                <Text>{item.description}</Text>
              </TouchableOpacity>
            )}
            style={styles.suggestionsList}
            keyboardShouldPersistTaps="handled"
          />
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
  container: { flex: 1 },
  inputWrapper: {
    marginHorizontal: 16,
    marginTop: 20,
    zIndex: 10,
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
    maxHeight: 200,
    elevation: 3,
  },

  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  // item: {
  //   padding: 12,
  //   backgroundColor: '#fafafa',
  //   borderBottomWidth: 1,
  //   borderColor: '#eee',
  //   zIndex: 1,
  // },
  map: {
    width: screen.width,
    height: screen.height,
  },
});

export default SearchLocation;
