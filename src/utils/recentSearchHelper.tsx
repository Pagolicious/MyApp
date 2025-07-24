import AsyncStorage from '@react-native-async-storage/async-storage';

import { AutocompleteSuggestion } from '../types/apiTypes';

const RECENT_KEY = 'recentSearches';

export const saveRecentSearch = async (item: AutocompleteSuggestion) => {
  const json = await AsyncStorage.getItem(RECENT_KEY);
  const list = json ? JSON.parse(json) : [];

  const filtered = list.filter((i: any) => i.placeId !== item.placeId);
  const updated = [item, ...filtered].slice(0, 5); // keep only 5

  await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(updated));
};

export const getRecentSearches = async () => {
  const json = await AsyncStorage.getItem(RECENT_KEY);
  return json ? JSON.parse(json) : [];
};
