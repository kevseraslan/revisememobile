import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import { apiService, BASE_URL } from '../services/api';

const { width } = Dimensions.get('window');

const COLORS = {
  primary: '#cdbdff',
  primaryContainer: '#7c4dff',
  tertiary: '#00daf3',
  background: '#131313',
  surface: '#1c1b1b',
  surfaceVariant: '#201f1f',
  outline: '#494455',
  onSurface: '#e5e2e1',
  onSurfaceVariant: '#cac3d8',
  error: '#ffb4ab',
  success: '#4ade80',
  orange: '#f97316',
};

export default function TodaysQuestionsScreen() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getNotifications(); 
      setData(response);
    } catch (error) {
      console.error('Fetch Today Questions Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primaryContainer} />
      </View>
    );
  }

  const todayCount = data?.today_count || 0;
  const username = data?.username || 'Öğrenci';
  const solvedToday = data?.solved_today || 0;
  
  const remainingToday = todayCount;
  const totalToday = remainingToday + solvedToday;
  const dailyProgress = totalToday > 0 ? Math.round((solvedToday / totalToday) * 100) : 0;
  const remaining = remainingToday;
  const questions = data?.today_questions || [];

  const chartRadius = 45;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * chartRadius;
  const strokeDashoffset = circumference - (dailyProgress / 100) * circumference;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <BlurView intensity={80} tint="dark" style={styles.topNav}>
        <View style={styles.navLeft}>
          <TouchableOpacity style={styles.menuBtn}>
            <MaterialIcons name="menu" size={24} color={COLORS.primaryContainer} />
          </TouchableOpacity>
          <Text style={styles.navTitle}>AI Academy</Text>
        </View>
        <View style={styles.avatarBorder}>
          <Image 
            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAkiMUB2Ak77dtfeyawFjzTuZEwYFqrW7ulHkSrpfTCr9D22kf1qAyQaS0Pv_KAi6OjOgJw-Prrp-aAulhh_DIJzqlPBxhhF2UEi6Vf3D-sos2IKGFleljulMaRO2ew1UB2AC9FxqxD5CY6QzZdTEtkxTa5wmEbG9QAkFbqJ8uER7RL9y81xV_WRK25lU-PMuVagtAwhRS-9FVttfMsZ3SfltPqKW8i8RysgBpu2-xav9kzEBwijV98US0oUMHaxmewIO0dy4r2tSs' }} 
            style={styles.avatar}
          />
        </View>
      </BlurView>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primaryContainer} />
        }
      >
        <View style={styles.breadcrumbCont}>
          <Text style={styles.breadcrumbSub}>ECOSYSTEM</Text>
          <MaterialIcons name="chevron-right" size={14} color={COLORS.outline} />
          <Text style={styles.breadcrumbActive}>REVISION</Text>
        </View>
        <Text style={styles.pageTitle}>Bugünün Soruları</Text>

        {todayCount === 0 ? (
          <View style={styles.glassCard}>
            <LinearGradient
              colors={['rgba(124, 77, 255, 0.15)', 'transparent']}
              style={styles.glowEffect}
              start={{ x: 1, y: 0 }}
              end={{ x: 0, y: 1 }}
            />
            <View style={styles.checkCircleCont}>
              <MaterialIcons name="check-circle" size={48} color={COLORS.primary} />
            </View>
            <Text style={styles.completionTitle}>Harika İş Çıkardın!</Text>
            <Text style={styles.completionDesc}>
              Tebrikler! Bugün için planlanan tüm soruları başarıyla tamamladın. Bilgilerini taze tutmak için yarın tekrar gelmeyi unutma.
            </Text>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => router.replace('/notifications')}>
              <Text style={styles.primaryBtnText}>Soru Bankasına Dön</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.questionsList}>
            {questions.map((q: any) => (
              <TouchableOpacity 
                key={q.id} 
                style={styles.qCard}
                onPress={() => router.push({ pathname: '/question-detail', params: { id: q.id } })}
              >
                <View style={styles.qCardInner}>
                  <View style={styles.qCardLeft}>
                    {q.image ? (
                      <Image 
                        source={{ uri: `${BASE_URL}/static/${q.image}` }} 
                        style={styles.qCardImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={[styles.qCardImage, styles.qCardImagePlaceholder]}>
                        <MaterialIcons name="image" size={32} color={COLORS.outline} />
                      </View>
                    )}
                  </View>

                  <View style={styles.qCardRight}>
                    <View style={styles.qCardHeader}>
                      <View style={styles.topicContainer}>
                        <Text style={styles.topicText} numberOfLines={1}>
                          {q.topic || (q.category ? q.category.toUpperCase() : 'GENEL')}
                        </Text>
                      </View>
                      <View style={styles.repeatBadge}>
                        <Text style={styles.repeatText}>{q.repeat_count + 1}. Tekrar</Text>
                      </View>
                    </View>

                    <Text style={styles.qContent} numberOfLines={2}>
                      {q.content || 'Soru metni bulunmuyor.'}
                    </Text>

                    <View style={styles.qCardFooter}>
                      <View style={styles.todayBadge}>
                        <MaterialIcons name="schedule" size={14} color={COLORS.onSurfaceVariant} />
                        <Text style={styles.todayText}>Bugün</Text>
                      </View>
                      
                      <View style={styles.solveButton}>
                        <Text style={styles.solveButtonText}>Hemen Çöz</Text>
                        <MaterialIcons name="arrow-forward" size={16} color="#fff" />
                      </View>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.infoGrid}>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>SENİN GÜNLÜK HEDEFİN</Text>
            <View style={styles.progressRingCont}>
              <Svg height="120" width="120" viewBox="0 0 120 120">
                <Circle
                  cx="60" cy="60" r={chartRadius} stroke="rgba(255,255,255,0.08)" strokeWidth={strokeWidth} fill="transparent"
                />
                <Circle
                  cx="60" cy="60" r={chartRadius} stroke={COLORS.primary} strokeWidth={strokeWidth}
                  strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round" fill="transparent" transform="rotate(-90 60 60)"
                />
              </Svg>
              <View style={styles.progressTextCont}>
                <Text style={styles.progressVal}>%{dailyProgress}</Text>
                <Text style={styles.progressSub}>TAMAMLANDI</Text>
              </View>
            </View>
            <Text style={styles.goalText}>
              Hedefine ulaşmak için <Text style={{ color: COLORS.primary, fontWeight: 'bold' }}>{remaining} soru</Text> kaldı.
            </Text>
          </View>

          <View style={[styles.infoCard, styles.rowCard]}>
            <View>
              <Text style={styles.infoLabelSmall}>UZMAN ÖNERİSİ</Text>
              <Text style={[styles.infoVal, { color: COLORS.tertiary }]}>20 Soru/Gün</Text>
            </View>
            <View style={styles.trendIconCont}>
              <MaterialIcons name="trending-up" size={24} color={COLORS.tertiary} />
            </View>
          </View>

          <View style={[styles.infoCard, styles.tipCard]}>
            <View style={styles.tipIconBg}>
              <MaterialIcons name="lightbulb" size={64} color={COLORS.primaryContainer} style={{ opacity: 0.1 }} />
            </View>
            <View style={styles.tipHeader}>
              <MaterialIcons name="info" size={18} color={COLORS.primaryContainer} />
              <Text style={styles.tipLabel}>SİSTEM İPUCU</Text>
            </View>
            <Text style={styles.tipText}>
              Aralıklı Tekrar algoritması, öğrendiklerini unutmaya başladığın anda sana hatırlatarak kalıcı öğrenmeyi sağlar.
            </Text>
          </View>

          <View style={[styles.infoCard, styles.rowCard]}>
            <View style={styles.streakIconCont}>
              <MaterialCommunityIcons name="fire" size={32} color={COLORS.orange} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.streakTitle}>1 Gün Serisi</Text>
              <Text style={styles.streakSub}>MÜKEMMEL BİR BAŞLANGIÇ</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <BlurView intensity={90} tint="dark" style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/notifications')}>
          <MaterialIcons name="home" size={24} color={COLORS.outline} />
          <Text style={styles.navItemText}>Ana Sayfa</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItemActive}>
          <MaterialIcons name="explore" size={24} color={COLORS.primaryContainer} />
          <Text style={styles.navItemTextActive}>Keşfet</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <MaterialIcons name="menu-book" size={24} color={COLORS.outline} />
          <Text style={styles.navItemText}>Kütüphane</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/profile')}>
          <MaterialIcons name="person" size={24} color={COLORS.outline} />
          <Text style={styles.navItemText}>Profil</Text>
        </TouchableOpacity>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' },
  topNav: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 90,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, paddingTop: Platform.OS === 'ios' ? 40 : 20,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)', zIndex: 100,
  },
  navLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuBtn: { padding: 8, borderRadius: 20 },
  navTitle: { color: '#fff', fontSize: 20, fontWeight: '900', letterSpacing: -0.5 },
  avatarBorder: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(124, 77, 255, 0.3)', overflow: 'hidden' },
  avatar: { width: '100%', height: '100%' },
  scrollContent: { paddingTop: 110, paddingHorizontal: 24, paddingBottom: 40 },
  breadcrumbCont: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  breadcrumbSub: { fontSize: 10, color: COLORS.onSurfaceVariant, letterSpacing: 1.5, fontWeight: '700', opacity: 0.6 },
  breadcrumbActive: { fontSize: 10, color: COLORS.primary, letterSpacing: 1.5, fontWeight: '700' },
  pageTitle: { fontSize: 32, fontWeight: '600', color: COLORS.onSurface, marginBottom: 24 },
  glassCard: {
    backgroundColor: 'rgba(30, 30, 30, 0.6)', borderRadius: 32, padding: 32,
    alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden', marginBottom: 24,
  },
  glowEffect: { position: 'absolute', top: -100, right: -100, width: 250, height: 250, borderRadius: 125 },
  checkCircleCont: {
    width: 96, height: 96, backgroundColor: 'rgba(124, 77, 255, 0.1)',
    borderRadius: 48, borderWidth: 1, borderColor: 'rgba(124, 77, 255, 0.2)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 24,
  },
  completionTitle: { fontSize: 24, fontWeight: '600', color: COLORS.onSurface, marginBottom: 8 },
  completionDesc: { fontSize: 18, color: COLORS.onSurfaceVariant, textAlign: 'center', lineHeight: 28, marginBottom: 32 },
  primaryBtn: {
    backgroundColor: COLORS.primaryContainer, paddingHorizontal: 32, paddingVertical: 16,
    borderRadius: 32, shadowColor: COLORS.primaryContainer, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3, shadowRadius: 24, elevation: 8,
  },
  primaryBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  questionsList: { gap: 16, marginBottom: 24 },
  qCard: {
    backgroundColor: 'rgba(30, 30, 30, 0.8)', borderRadius: 24, padding: 16,
    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  qCardInner: { flexDirection: 'row', gap: 16 },
  qCardLeft: { width: 100, height: 100, borderRadius: 16, overflow: 'hidden' },
  qCardImage: { width: '100%', height: '100%', backgroundColor: '#2a2a2a' },
  qCardImagePlaceholder: { alignItems: 'center', justifyContent: 'center' },
  qCardRight: { flex: 1, justifyContent: 'space-between' },
  qCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  topicContainer: { backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, flex: 1, marginRight: 8 },
  topicText: { color: '#fff', fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  repeatBadge: { backgroundColor: 'rgba(74, 222, 128, 0.1)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  repeatText: { color: '#4ade80', fontSize: 10, fontWeight: '700' },
  qContent: { color: COLORS.onSurface, fontSize: 14, fontWeight: '600', lineHeight: 20, marginBottom: 8 },
  qCardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  todayBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  todayText: { color: COLORS.onSurfaceVariant, fontSize: 12, fontWeight: '600' },
  solveButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.primaryContainer, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 16, shadowColor: COLORS.primaryContainer, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  solveButtonText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  infoGrid: { gap: 16 },
  infoCard: {
    backgroundColor: 'rgba(30, 30, 30, 0.6)', borderRadius: 24, padding: 24,
    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  infoLabel: { fontSize: 12, color: COLORS.onSurfaceVariant, letterSpacing: 1, fontWeight: '600', marginBottom: 20 },
  progressRingCont: { alignItems: 'center', justifyContent: 'center', marginBottom: 16, position: 'relative' },
  progressTextCont: { position: 'absolute', alignItems: 'center' },
  progressVal: { fontSize: 24, fontWeight: '600', color: COLORS.onSurface },
  progressSub: { fontSize: 10, color: COLORS.onSurfaceVariant, fontWeight: '700' },
  goalText: { fontSize: 16, color: COLORS.onSurfaceVariant, textAlign: 'center' },
  rowCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  infoLabelSmall: { fontSize: 10, color: COLORS.onSurfaceVariant, letterSpacing: 1, fontWeight: '700', marginBottom: 4 },
  infoVal: { fontSize: 24, fontWeight: '600' },
  trendIconCont: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(0, 218, 243, 0.1)', borderWidth: 1, borderColor: 'rgba(0, 218, 243, 0.2)', alignItems: 'center', justifyContent: 'center' },
  tipCard: { backgroundColor: 'rgba(124, 77, 255, 0.1)', borderColor: 'rgba(124, 77, 255, 0.2)', overflow: 'hidden' },
  tipIconBg: { position: 'absolute', right: -10, top: -10 },
  tipHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  tipLabel: { fontSize: 10, color: COLORS.primaryContainer, letterSpacing: 1.5, fontWeight: '700' },
  tipText: { fontSize: 14, color: COLORS.onSurfaceVariant, lineHeight: 22 },
  streakIconCont: { width: 64, height: 64, borderRadius: 16, backgroundColor: 'rgba(249, 115, 22, 0.1)', borderWidth: 1, borderColor: 'rgba(249, 115, 22, 0.2)', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  streakTitle: { fontSize: 24, fontWeight: '600', color: COLORS.onSurface },
  streakSub: { fontSize: 10, color: COLORS.orange, letterSpacing: 1.5, fontWeight: '700' },
  bottomNav: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 85,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around',
    paddingBottom: Platform.OS === 'ios' ? 25 : 5, borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  navItem: { alignItems: 'center', gap: 4 },
  navItemActive: { backgroundColor: 'rgba(124, 77, 255, 0.1)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16, alignItems: 'center', gap: 4 },
  navItemText: { fontSize: 11, color: COLORS.outline, fontWeight: '500' },
  navItemTextActive: { fontSize: 11, color: COLORS.primaryContainer, fontWeight: '700' },
});
