// SettingsScreen.tsx
import React from 'react';
import {
  SectionList,
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  SectionListData,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { navigate } from '../../services/NavigationService';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../utils/types';

// type RootStackParamList = {
//   ProfileScreen: undefined;
//   PasswordScreen: undefined;
//   PushSettings: undefined;
//   SoundSettings: undefined;
// };

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type SettingItem = {
  key: string;
  screen: keyof RootStackParamList;
};

type SettingSection = {
  title: string;
  data: SettingItem[];
};

const SETTINGS: SettingSection[] = [
  {
    title: 'Account',
    data: [
      { key: 'Profile Info', screen: 'EditProfileScreen' },
      { key: 'Change email/password', screen: 'EditProfileScreen' },
    ],
  },
  {
    title: 'Appearance',
    data: [
      { key: 'Theme (Light, Dark)', screen: 'EditProfileScreen' },
      { key: 'Font size / Accessibility', screen: 'EditProfileScreen' },
    ],
  },
  {
    title: 'Discovery Preferences',
    data: [
      { key: 'Search radius', screen: 'EditProfileScreen' },
      { key: 'Set search default settings', screen: 'EditProfileScreen' },
      { key: 'Display friends group always first', screen: 'EditProfileScreen' },
    ],
  },
  {
    title: 'Notifications',
    data: [
      { key: 'Push Notifications', screen: 'EditProfileScreen' },
      { key: 'Sound & Vibration', screen: 'EditProfileScreen' },
    ],
  },
  {
    title: 'Language & Region',
    data: [
      { key: 'App language', screen: 'EditProfileScreen' },
      { key: 'Region format', screen: 'EditProfileScreen' },
    ],
  },
  {
    title: 'Privacy & Safety',
    data: [
      { key: 'Who can view my profile', screen: 'EditProfileScreen' },
      { key: 'Blocked users', screen: 'EditProfileScreen' },
      { key: 'Location Visibility', screen: 'EditProfileScreen' },
    ],
  },
  {
    title: 'Billing & Subscription',
    data: [
      { key: 'Manage subscription', screen: 'EditProfileScreen' },
      { key: 'Payment methods', screen: 'EditProfileScreen' },
      { key: 'Purchase history', screen: 'EditProfileScreen' },
      { key: 'Billing support', screen: 'EditProfileScreen' },

    ],
  },
  {
    title: 'Help & Support',
    data: [
      { key: 'Contact support', screen: 'EditProfileScreen' },
      { key: 'Payment methods', screen: 'EditProfileScreen' },
      { key: 'FAQs / Knowledge base', screen: 'EditProfileScreen' },
      { key: 'Report a bug', screen: 'EditProfileScreen' },
      { key: 'Submit feedback', screen: 'EditProfileScreen' },

    ],
  },
  {
    title: 'About',
    data: [
      { key: 'App version', screen: 'EditProfileScreen' },
      { key: 'Terms of Service', screen: 'EditProfileScreen' },
      { key: 'Privacy Policy', screen: 'EditProfileScreen' },

    ],
  },
];

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const renderSection = ({ section }: { section: SectionListData<SettingItem, SettingSection> }) => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      {section.data.map((item, index) => (
        <TouchableOpacity key={index} onPress={() => navigate(item.screen)}>
          <View style={[styles.itemRow, index < section.data.length - 1 && styles.itemBorder]}>
            <Text>{item.key}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SectionList
      sections={SETTINGS}
      keyExtractor={(item, index) => item.key + index}
      renderSectionHeader={renderSection}
      renderItem={() => null} // Items handled inside renderSection
    />
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    margin: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    overflow: 'hidden',
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,

    // Android shadow
    elevation: 3,
  },
  sectionTitle: {
    padding: 16,
    fontWeight: 'bold',
    backgroundColor: '#e0e0e0',
  },
  itemRow: {
    padding: 16,
    backgroundColor: '#fff',
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
});

export default SettingsScreen;
