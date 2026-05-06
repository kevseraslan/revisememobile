import { Stack } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import GlobalLayout from '../components/GlobalLayout';

export default function Layout() {
  return (
    <View style={styles.container}>
      <GlobalLayout>
        <Stack screenOptions={{ headerShown: false }} />
      </GlobalLayout>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0e0e0e' },
});
