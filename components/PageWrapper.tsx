import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, Platform, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import SideMenu from './SideMenu';
import GlobalHeader from './GlobalHeader';
import GlobalBottomNav from './GlobalBottomNav';
import { StatusBar } from 'expo-status-bar';

interface PageWrapperProps {
  children: React.ReactNode;
  title: string;
  showBottomNav?: boolean;
  hideHeader?: boolean;
}

export default function PageWrapper({ children, title, showBottomNav = true, hideHeader = false }: PageWrapperProps) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.content}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#131313',
  },
  content: {
    flex: 1,
  },
  absoluteMenuContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 40,
    left: 20,
    zIndex: 100,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
