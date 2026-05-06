import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SideMenu({ isOpen, onClose }: SideMenuProps) {
  const router = useRouter();
  const pathname = usePathname();
  const slideAnim = React.useRef(new Animated.Value(-width)).current;

  React.useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isOpen ? 0 : -width,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isOpen]);

  const navigateTo = (path: string) => {
    onClose();
    router.push(path as any);
  };

  if (!isOpen && slideAnim._value === -width) return null;

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Animated.View style={[styles.backdropTint, { opacity: isOpen ? 1 : 0 }]} />
      </Pressable>
      
      <Animated.View style={[styles.menuContainer, { transform: [{ translateX: slideAnim }] }]}>
        <BlurView intensity={80} tint="dark" style={styles.blurContainer}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>ReviseMe AI</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.menuItems}>
            <MenuItem 
              icon="play-circle-outline" 
              label="AI Shorts" 
              isActive={pathname === '/ai-shorts'} 
              onPress={() => navigateTo('/ai-shorts')} 
            />
            <MenuItem 
              icon="today" 
              label="Bugünün Soruları" 
              isActive={pathname === '/todays-questions'} 
              onPress={() => navigateTo('/todays-questions')} 
            />
            <MenuItem 
              icon="history" 
              label="Geçmiş Sorular" 
              isActive={pathname === '/past-questions'} 
              onPress={() => navigateTo('/past-questions')} 
            />
            <MenuItem 
              icon="star" 
              label="Yıldızlı Sorularım" 
              isActive={pathname === '/starred'} 
              onPress={() => navigateTo('/starred')} 
            />
            <MenuItem 
              icon="insights" 
              label="Gelişim Raporu" 
              isActive={pathname === '/progress-report'} 
              onPress={() => navigateTo('/progress-report')} 
            />
            <MenuItem 
              icon="timer" 
              label="Pomodoro Sayaç" 
              isActive={pathname === '/pomodoro'} 
              onPress={() => navigateTo('/pomodoro')} 
            />
            <MenuItem 
              icon="settings" 
              label="Ayarlar" 
              isActive={pathname === '/settings'} 
              onPress={() => navigateTo('/settings')} 
            />
          </View>


          <View style={styles.footer}>
            <Text style={styles.footerText}>v1.0.0</Text>
          </View>
        </BlurView>
      </Animated.View>
    </View>
  );
}

function MenuItem({ icon, label, isActive, onPress }: { icon: any, label: string, isActive: boolean, onPress: () => void }) {
  return (
    <TouchableOpacity 
      style={[styles.menuItem, isActive && styles.menuItemActive]} 
      onPress={onPress}
    >
      <MaterialIcons name={icon} size={24} color={isActive ? '#cdbdff' : '#948ea1'} />
      <Text style={[styles.menuItemLabel, isActive && styles.menuItemLabelActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  backdrop: {
    flex: 1,
  },
  backdropTint: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  menuContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: width * 0.75,
    backgroundColor: 'rgba(19, 19, 19, 0.95)',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.1)',
  },
  blurContainer: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  menuItems: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  menuItemActive: {
    backgroundColor: 'rgba(124, 77, 255, 0.1)',
  },
  menuItemLabel: {
    color: '#948ea1',
    fontSize: 16,
    marginLeft: 16,
    fontWeight: '500',
  },
  menuItemLabelActive: {
    color: '#cdbdff',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginVertical: 16,
  },
  footer: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  footerText: {
    color: '#353534',
    fontSize: 12,
  },
});
