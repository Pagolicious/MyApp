import { StyleSheet, Text, View, Alert } from 'react-native'
import React from 'react'

export const handleFirestoreError = (error: unknown) => {
  const errorMessage =
    (error as { message?: string }).message || 'An unknown error occurred';
  console.error('Firestore Error:', errorMessage);
  Alert.alert('Error', errorMessage);
};


export default handleFirestoreError

const styles = StyleSheet.create({})
