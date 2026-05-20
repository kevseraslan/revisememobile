import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, usePathname } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Animated, Dimensions, Image, StyleSheet, Text, TouchableOpacity, View, Modal, TouchableWithoutFeedback } from 'react-native';

const { width, height } = Dimensions.get('window');

const COLORS = {
  background: '#0e0e0e',
  surface: '#1c1b1b',
  primary: '#cdbdff',
  primaryContainer: '#7c4dff',
  onSurface: '#e5e2e1',
  onSurfaceVariant: '#cac3d8',
};

export default function GlobalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const sidebarAnim = React.useRef(new Animated.Value(-width * 0.8)).current;

  // Real-time clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleSidebar = (open: boolean) => {
    setIsSidebarOpen(open);
    Animated.timing(sidebarAnim, {
      toValue: open ? 0 : -width * 0.8,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const formatDate = () => {
    const options: any = { day: 'numeric', month: 'long', year: 'numeric' };
    return currentTime.toLocaleDateString('tr-TR', options);
  };

  const formatTime = () => {
    return currentTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const menuItems = [
    { id: 'home', icon: 'home-variant', label: 'Ana Sayfa', path: '/home' },
    { id: 'fav', icon: 'star', label: 'Favori Sorularım', path: '/starred' },
    { id: 'today', icon: 'calendar-today', label: 'Bugünün Soruları', path: '/todays-questions' },
    { id: 'past', icon: 'history', label: 'Geçmiş Sorular', path: '/past-questions' },
    { id: 'report', icon: 'chart-bar', label: 'Gelişim Raporu', path: '/progress-report' },
    { id: 'timer', icon: 'timer', label: 'Sayaç', path: '/pomodoro' },
    { id: 'settings', icon: 'cog', label: 'Ayarlar', path: '/settings' },
  ];

  const bottomItems = [
    { id: 'add', icon: 'plus-box', label: 'Soru Ekle', path: '/add-question' },
    { id: 'solve', icon: 'lightbulb-on', label: 'Soru Çöz', path: '/ai-solve' },
    { id: 'quiz', icon: 'brain', label: 'AI Quiz', path: '/ai-quiz' },
    { id: 'shorts', icon: 'play-box-multiple', label: 'AI Shorts', path: '/ai-shorts' },
  ];

  const navigate = (path: any) => {
    toggleSidebar(false);
    router.push(path);
  };

  const isAuthScreen = pathname === '/' || pathname === '/sign-up';

  if (isAuthScreen) {
    return <View style={styles.container}>{children}</View>;
  }

  return (
    <View style={styles.container}>
      
      {/* Premium Global Header */}
      <LinearGradient colors={['#1c1b1b', '#0e0e0e']} style={styles.header}>
        <TouchableOpacity onPress={() => toggleSidebar(true)} style={styles.menuBtn}>
          <MaterialIcons name="menu" size={28} color={COLORS.primary} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerDate}>{formatDate()}</Text>
          <Text style={styles.headerTime}>{formatTime()}</Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => router.push('/notifications')} style={styles.notifBtn}>
            <MaterialIcons name="notifications-none" size={26} color={COLORS.onSurfaceVariant} />
            <View style={styles.notifBadge} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/profile')} style={styles.profileBtn}>
            <Image 
              source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBVte85MkxGt2lJ4e2QzC7hRKSc4Qpti7XLHj_jxL61LN4QksrFxnQmRax2bi1fTzKAOUILqfdzVka1aj65ojhTWpNSITsnvh6LbgkZUFZBs3s_joKENLCmm1gRRfd1Us2bKzHaO4N8Kxph6rO-tJm3D2FaEo0EZ59i81xmjYtYFj-mrgb2iM29logmPBbeb1Lo_8YFiuw0huY4RHPn-fMZWRjrA2HuXb4AT3_JEoiulg3SPTtpvHnMrhwWSW0HSvqdXFhUuZTKttU' }} 
              style={styles.profileImg} 
            />
            <View style={styles.onlineBadge} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Main Content Area */}
      <View style={styles.content}>
        {children}
      </View>

      {/* Global Bottom Navigation */}
      <View style={styles.bottomNav}>
        <LinearGradient colors={['rgba(28, 27, 27, 0.95)', 'rgba(14, 14, 14, 0.98)']} style={styles.bottomNavGradient}>
          {bottomItems.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              onPress={() => router.push(item.path as any)} 
              style={styles.bottomTab}
            >
              <MaterialCommunityIcons 
                name={item.icon as any} 
                size={24} 
                color={pathname === item.path ? COLORS.primary : COLORS.onSurfaceVariant} 
              />
              <Text style={[styles.bottomTabText, pathname === item.path && styles.activeTabText]}>
                {item.label}
              </Text>
              {pathname === item.path && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          ))}
        </LinearGradient>
      </View>

      {/* Global Sidebar (Drawer) */}
      <Modal visible={isSidebarOpen} transparent animationType="none">
        <TouchableWithoutFeedback onPress={() => toggleSidebar(false)}>
          <View style={styles.modalOverlay}>
            <Animated.View style={[styles.sidebar, { transform: [{ translateX: sidebarAnim }] }]}>
              <TouchableWithoutFeedback>
                <View style={styles.sidebarContent}>
                  <View style={styles.sidebarHeader}>
                    <LinearGradient colors={[COLORS.primaryContainer, '#5635b5']} style={styles.sidebarLogo}>
                      <MaterialCommunityIcons name="rocket-launch" size={32} color="#fff" />
                    </LinearGradient>
                    <Text style={styles.sidebarTitle}>ReviseMe</Text>
                    <Text style={styles.sidebarSubtitle}>Premium Learning</Text>
                  </View>

                  <View style={styles.sidebarMenu}>
                    {menuItems.map((item) => (
                      <TouchableOpacity 
                        key={item.id} 
                        onPress={() => navigate(item.path)} 
                        style={[styles.menuItem, pathname === item.path && styles.activeMenuItem]}
                      >
                        <MaterialCommunityIcons 
                          name={item.icon as any} 
                          size={24} 
                          color={pathname === item.path ? COLORS.primary : COLORS.onSurfaceVariant} 
                        />
                        <Text style={[styles.menuItemText, pathname === item.path && styles.activeMenuItemText]}>
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <View style={styles.sidebarFooter}>
                    <TouchableOpacity 
                      style={styles.logoutBtn}
                      onPress={() => {
                        toggleSidebar(false);
                        router.replace('/');
                      }}
                    >
                      <MaterialIcons name="logout" size={20} color={COLORS.error} />
                      <Text style={styles.logoutText}>Çıkış Yap</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0e0e0e' },
  content: { flex: 1 },
  
  // Header
  header: {
    height: 110,
    paddingTop: 50,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  menuBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.03)' },
  headerContent: { flex: 1, alignItems: 'center' },
  headerDate: { color: COLORS.onSurfaceVariant, fontSize: 11, fontWeight: 'bold', letterSpacing: 1, textTransform: 'uppercase' },
  headerTime: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginTop: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  notifBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.03)' },
  notifBadge: { position: 'absolute', top: 12, right: 12, width: 8, height: 8, borderRadius: 4, backgroundColor: '#ffb4ab', borderWidth: 1, borderColor: '#1c1b1b' },
  profileBtn: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: COLORS.primaryContainer, overflow: 'hidden' },
  profileImg: { width: '100%', height: '100%' },
  onlineBadge: { position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, borderRadius: 6, backgroundColor: '#10b981', borderWidth: 2, borderColor: '#1c1b1b' },

  // Bottom Nav
  bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 90, paddingBottom: 25 },
  bottomNavGradient: { flex: 1, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  bottomTab: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  bottomTabText: { color: COLORS.onSurfaceVariant, fontSize: 10, marginTop: 4, fontWeight: '500' },
  activeTabText: { color: COLORS.primary },
  activeIndicator: { position: 'absolute', top: -12, width: 20, height: 3, backgroundColor: COLORS.primary, borderRadius: 2 },

  // Sidebar
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)' },
  sidebar: { width: width * 0.8, height: height, backgroundColor: '#131313', shadowColor: '#000', shadowOffset: { width: 5, height: 0 }, shadowOpacity: 0.5, shadowRadius: 15, elevation: 20 },
  sidebarContent: { flex: 1, padding: 30, paddingTop: 60 },
  sidebarHeader: { marginBottom: 40 },
  sidebarLogo: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
  sidebarTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  sidebarSubtitle: { color: COLORS.onSurfaceVariant, fontSize: 12 },
  sidebarMenu: { flex: 1 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 15, paddingVertical: 15, paddingHorizontal: 12, borderRadius: 12, marginBottom: 5 },
  activeMenuItem: { backgroundColor: 'rgba(124, 77, 255, 0.1)' },
  menuItemText: { color: COLORS.onSurfaceVariant, fontSize: 15, fontWeight: '500' },
  activeMenuItemText: { color: COLORS.primary, fontWeight: 'bold' },
  sidebarFooter: { paddingTop: 20, borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoutText: { color: '#ffb4ab', fontSize: 15, fontWeight: 'bold' },
});
