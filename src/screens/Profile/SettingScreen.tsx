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
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  ProfileScreen: undefined;
  PasswordScreen: undefined;
  PushSettings: undefined;
  SoundSettings: undefined;
};

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
      { key: 'Profile Info', screen: 'ProfileScreen' },
      { key: 'Change email/password', screen: 'PasswordScreen' },
    ],
  },
  {
    title: 'Appearance',
    data: [
      { key: 'Theme (Light, Dark)', screen: 'ProfileScreen' },
      { key: 'Font size / Accessibility', screen: 'PasswordScreen' },
    ],
  },
  {
    title: 'Discovery Preferences',
    data: [
      { key: 'Search radius', screen: 'PushSettings' },
      { key: 'Set search default settings', screen: 'SoundSettings' },
      { key: 'Display friends group always first', screen: 'SoundSettings' },
    ],
  },
  {
    title: 'Notifications',
    data: [
      { key: 'Push Notifications', screen: 'PushSettings' },
      { key: 'Sound & Vibration', screen: 'SoundSettings' },
    ],
  },
  {
    title: 'Language & Region',
    data: [
      { key: 'App language', screen: 'ProfileScreen' },
      { key: 'Region format', screen: 'PasswordScreen' },
    ],
  },
  {
    title: 'Privacy & Safety',
    data: [
      { key: 'Who can view my profile', screen: 'ProfileScreen' },
      { key: 'Blocked users', screen: 'PasswordScreen' },
      { key: 'Location Visibility', screen: 'PasswordScreen' },
    ],
  },
  {
    title: 'Billing & Subscription',
    data: [
      { key: 'Manage subscription', screen: 'ProfileScreen' },
      { key: 'Payment methods', screen: 'PasswordScreen' },
      { key: 'Purchase history', screen: 'PasswordScreen' },
      { key: 'Billing support', screen: 'PasswordScreen' },

    ],
  },
  {
    title: 'Help & Support',
    data: [
      { key: 'Contact support', screen: 'ProfileScreen' },
      { key: 'Payment methods', screen: 'PasswordScreen' },
      { key: 'FAQs / Knowledge base', screen: 'PasswordScreen' },
      { key: 'Report a bug', screen: 'PasswordScreen' },
      { key: 'Submit feedback', screen: 'PasswordScreen' },

    ],
  },
  {
    title: 'About',
    data: [
      { key: 'App version', screen: 'ProfileScreen' },
      { key: 'Terms of Service', screen: 'PasswordScreen' },
      { key: 'Privacy Policy', screen: 'PasswordScreen' },

    ],
  },
];

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const renderSection = ({ section }: { section: SectionListData<SettingItem, SettingSection> }) => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      {section.data.map((item, index) => (
        <TouchableOpacity key={index} onPress={() => navigation.navigate(item.screen)}>
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
