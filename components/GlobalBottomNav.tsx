import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { MaterialIcons, MaterialSymbols } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import { BlurView } from 'expo-blur';

export default function GlobalBottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { name: 'Home', icon: 'dashboard', route: '/home' },
    { name: 'Library', icon: 'menu-book', route: '/todays-questions' },
    { name: 'Stats', icon: 'leaderboard', route: '/progress-report' },
    { name: 'Settings', icon: 'settings', route: '/settings' },
  ];

  return (
    <View style={styles.container}>
      <BlurView intensity={90} tint="dark" style={styles.blurContainer}>
        {navItems.map((item, index) => {
          const isActive = pathname === item.route;
          
          return (
            <TouchableOpacity 
              key={index} 
              style={[styles.navItem, isActive && styles.navItemActive]} 
              onPress={() => router.push(item.route as any)}
            >
              <MaterialIcons 
                name={item.icon as any} 
                size={24} 
                color={isActive ? '#cdbdff' : '#948ea1'} 
              />
              <Text style={[styles.navText, isActive && styles.navTextActive]}>{item.name}</Text>
            </TouchableOpacity>
          );
        })}
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    height: 90, 
    zIndex: 1000,
    backgroundColor: 'transparent'
  },
  blurContainer: { 
    flex: 1, 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    alignItems: 'center', 
    paddingBottom: Platform.OS === 'ios' ? 25 : 10, 
    borderTopLeftRadius: 32, 
    borderTopRightRadius: 32, 
    overflow: 'hidden', 
    borderTopWidth: 1, 
    borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  navItem: { 
    alignItems: 'center', 
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4
  },
  navItemActive: {
    backgroundColor: 'rgba(124, 77, 255, 0.15)',
  },
  navText: { 
    color: '#948ea1', 
    fontSize: 10, 
    fontWeight: 'bold',
    fontFamily: 'Inter' 
  },
  navTextActive: { 
    color: '#cdbdff' 
  },
});
