import React from 'react';
import { View, StyleSheet } from 'react-native';

// This screen should never be visible since we intercept the tab press
// and navigate to the modal instead. This is just a placeholder.
export default function CreateScreen() {
  return <View style={styles.container} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
});