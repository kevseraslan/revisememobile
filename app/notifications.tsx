import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl, Image, Platform, Dimensions } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { apiService, DashboardStats, QuestionItem } from '../services/api';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const COLORS = {
  primary: '#cdbdff',
  secondary: '#b0c6ff',
  tertiary: '#00daf3',
  background: '#131313',
  surface: '#201f1f',
  surfaceVariant: '#353534',
  outline: '#948ea1',
  error: '#ffb4ab',
  onBackground: '#e5e2e1',
  primaryContainer: '#7c4dff',
  secondaryContainer: '#0068ed',
  errorContainer: '#93000a',
};

export default function NotificationsScreen() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setError(null);
      const data = await apiService.getNotifications();
      if (data.success === false) {
        setError(data.message || 'Veriler yüklenirken bir sorun oluştu.');
      } else {
        setStats(data);
      }
    } catch (err: any) {
      if (err?.response?.status === 401) {
        setError('Oturum açmanız gerekiyor.');
      } else {
        setError('Veriler yüklenirken bir sorun oluştu.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const renderQuestionItem = (item: QuestionItem, isPast: boolean = false) => (
    <TouchableOpacity 
      key={item.id} 
      style={[styles.questionCard, isPast && styles.questionCardPast]}
      onPress={() => router.push({ pathname: '/question-detail', params: { id: item.id } })}
    >
      <View style={styles.questionCardLeft}>
        <View style={[styles.categoryIcon, { backgroundColor: isPast ? 'rgba(255, 180, 171, 0.1)' : 'rgba(205, 189, 255, 0.1)' }]}>
          <Text style={[styles.categoryInitial, { color: isPast ? COLORS.error : COLORS.primary }]}>
            {item.category ? item.category[0].toUpperCase() : 'S'}
          </Text>
        </View>
        <View style={styles.questionContent}>
          <View style={styles.questionMeta}>
            <Text style={styles.categoryLabel}>{item.category || 'Genel'}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Tekrar {item.repeat_count + 1}</Text>
            </View>
          </View>
          <Text style={styles.questionText} numberOfLines={1}>{item.content}</Text>
        </View>
      </View>
      <TouchableOpacity 
        style={[styles.solveBtn, { backgroundColor: isPast ? COLORS.error : COLORS.primaryContainer }]}
        onPress={() => router.push({ pathname: '/question-detail', params: { id: item.id } })}
      >
        <Text style={styles.solveBtnText}>{isPast ? 'Tekrar Et' : 'Çöz'}</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={[styles.mainContainer, styles.centerContainer]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error || !stats) {
    return (
      <View style={[styles.mainContainer, styles.centerContainer]}>
        <Text style={styles.errorText}>{error || 'Veri bulunamadı.'}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={fetchStats}>
          <Text style={styles.retryText}>Tekrar Dene</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const radius = 40;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (stats.completion_rate / 100) * circumference;

  return (
    <View style={styles.mainContainer}>
      {/* Top AppBar */}
      <BlurView intensity={80} tint="dark" style={styles.topNav}>
        <View style={styles.navLeft}>
          <View style={styles.avatarContainer}>
            <Image 
              source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBVte85MkxGt2lJ4e2QzC7hRKSc4Qpti7XLHj_jxL61LN4QksrFxnQmRax2bi1fTzKAOUILqfdzVka1aj65ojhTWpNSITsnvh6LbgkZUFZBs3s_joKENLCmm1gRRfd1Us2bKzHaO4N8Kxph6rO-tJm3D2FaEo0EZ59i81xmjYtYFj-mrgb2iM29logmPBbeb1Lo_8YFiuw0huY4RHPn-fMZWRjrA2HuXb4AT3_JEoiulg3SPTtpvHnMrhwWSW0HSvqdXFhUuZTKttU' }} 
              style={styles.avatar}
            />
          </View>
          <Text style={styles.navTitle}>Dashboard</Text>
        </View>
        <TouchableOpacity style={styles.iconBtn}>
          <MaterialIcons name="notifications-none" size={24} color={COLORS.outline} />
        </TouchableOpacity>
      </BlurView>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Header */}
        <View style={styles.header}>
          <Text style={styles.welcomeTitle}>Hoş geldin, {stats.username}! 👋</Text>
          <Text style={styles.welcomeSubtitle}>
            Bugün odaklanman gereken <Text style={styles.highlightText}>{stats.today_count}</Text> yeni soru ve geçmişten sarkan <Text style={[styles.highlightText, { color: COLORS.error }]}>{stats.past_count}</Text> kritik tekrar bulunuyor.
          </Text>
        </View>

        {/* Quick Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: COLORS.primary }]}>{stats.today_count}</Text>
            <Text style={styles.statLabel}>BUGÜNÜN</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: COLORS.error }]}>{stats.past_count}</Text>
            <Text style={styles.statLabel}>GEÇMİŞ</Text>
          </View>
        </View>

        {/* Today's Questions Section */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleCont}>
            <MaterialIcons name="calendar-today" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitleText}>Bugünün Soruları</Text>
          </View>
          <View style={[styles.countBadge, { backgroundColor: COLORS.primary + '20' }]}>
            <Text style={[styles.countBadgeText, { color: COLORS.primary }]}>{stats.today_count} Soru</Text>
          </View>
        </View>

        <View style={styles.listContainer}>
          {stats.today_questions && stats.today_questions.length > 0 ? (
            stats.today_questions.slice(0, 6).map(q => renderQuestionItem(q, false))
          ) : (
            <View style={styles.emptyCard}>
              <MaterialIcons name="check-circle" size={40} color="#4ade80" />
              <Text style={styles.emptyTitle}>Harika gidiyorsun!</Text>
              <Text style={styles.emptySubtitle}>Bugün için planlanan tekrarın yok.</Text>
            </View>
          )}
          {stats.today_count > 6 && (
            <TouchableOpacity style={styles.seeAllBtn} onPress={() => router.push('/todays-questions')}>
              <Text style={styles.seeAllText}>Tüm Listeyi Gör</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Past Questions Section */}
        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <View style={styles.sectionTitleCont}>
            <MaterialIcons name="history" size={20} color={COLORS.error} />
            <Text style={styles.sectionTitleText}>Geçmiş Tekrarlar</Text>
          </View>
          <View style={[styles.countBadge, { backgroundColor: COLORS.error + '20' }]}>
            <Text style={[styles.countBadgeText, { color: COLORS.error }]}>{stats.past_count} Kritik</Text>
          </View>
        </View>

        <View style={[styles.listContainer, styles.pastListContainer]}>
          {stats.past_questions && stats.past_questions.length > 0 ? (
            <>
              {stats.past_questions.slice(0, 6).map(q => renderQuestionItem(q, true))}
              <View style={styles.urgencyAlert}>
                <MaterialIcons name="warning" size={18} color="#fff" />
                <Text style={styles.urgencyText}>Unutma Eğrisi etkisini azaltmak için hemen tamamla!</Text>
              </View>
            </>
          ) : (
            <View style={styles.emptyCard}>
              <MaterialIcons name="emoji-events" size={40} color="#fbbf24" />
              <Text style={styles.emptyTitle}>Hiçbir tekrarı kaçırmadın!</Text>
              <Text style={styles.emptySubtitle}>Gecikmiş bir sorunuz bulunmuyor.</Text>
            </View>
          )}
          {stats.past_count > 6 && (
            <TouchableOpacity style={styles.seeAllBtnPast} onPress={() => router.push('/past-questions')}>
              <Text style={styles.seeAllTextPast}>Tüm Gecikmiş Soruları Gör</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Performance Analysis */}
        <View style={[styles.card, { marginTop: 24 }]}>
          <Text style={styles.cardTitle}>Performans Analizi</Text>
          <View style={styles.perfContent}>
            <View style={styles.progressContainer}>
              <Svg height={100} width={100} viewBox="0 0 100 100">
                <Circle
                  cx="50"
                  cy="50"
                  r={normalizedRadius * 1.5}
                  stroke={COLORS.surfaceVariant}
                  strokeWidth={stroke}
                  fill="transparent"
                />
                <Circle
                  cx="50"
                  cy="50"
                  r={normalizedRadius * 1.5}
                  stroke={COLORS.primaryContainer}
                  strokeWidth={stroke}
                  strokeDasharray={circumference * 1.5}
                  strokeDashoffset={strokeDashoffset * 1.5}
                  strokeLinecap="round"
                  fill="transparent"
                  transform="rotate(-90 50 50)"
                />
              </Svg>
              <View style={styles.progressTextCenter}>
                <Text style={styles.progressPercent}>{stats.completion_rate}%</Text>
                <Text style={styles.progressLabelSmall}>TAMAMLAMA</Text>
              </View>
            </View>

            <View style={styles.perfStats}>
              <Text style={styles.perfDesc}>
                Şu ana kadarki tekrarların doğrultusunda genel tamamlama oranın <Text style={{ color: COLORS.primaryContainer, fontWeight: 'bold' }}>%{stats.completion_rate}</Text>. 
                Toplam başarı notun <Text style={{ color: COLORS.primary, fontWeight: 'bold' }}>{stats.performance_grade}</Text> seviyesinde ilerliyor. 
                {stats.completion_rate >= 80 ? " Bu harika tempoyu koru!" : " Tekrarlarını hızlandırarak başarı notunu artırabilirsin!"}
              </Text>
              
              <View style={styles.legend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: COLORS.primaryContainer }]} />
                  <Text style={styles.legendText}>Yapılan ({stats.completion_rate}%)</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: COLORS.surfaceVariant }]} />
                  <Text style={styles.legendText}>Kalan ({100 - stats.completion_rate}%)</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fabContainer} activeOpacity={0.8}>
        <LinearGradient
          colors={[COLORS.primaryContainer, COLORS.secondaryContainer]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fab}
        >
          <MaterialCommunityIcons name="robot" size={32} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>

      {/* Bottom Navigation */}
      <BlurView intensity={90} tint="dark" style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItemActive}>
          <MaterialIcons name="grid-view" size={24} color={COLORS.primary} />
          <Text style={styles.navTextActive}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/progress-report')}>
          <MaterialIcons name="analytics" size={24} color={COLORS.outline} />
          <Text style={styles.navText}>Activity</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/ai-shorts')}>
          <MaterialIcons name="school" size={24} color={COLORS.outline} />
          <Text style={styles.navText}>Learn</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/profile')}>
          <MaterialIcons name="person" size={24} color={COLORS.outline} />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: COLORS.background },
  centerContainer: { justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingTop: 100, paddingHorizontal: 24, paddingBottom: 20 },
  topNav: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 90,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, paddingTop: Platform.OS === 'ios' ? 40 : 20,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)', zIndex: 100,
  },
  navLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarContainer: { width: 40, height: 40, borderRadius: 20, overflow: 'hidden', borderWidth: 2, borderColor: 'rgba(205, 189, 255, 0.2)' },
  avatar: { width: '100%', height: '100%' },
  navTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
  iconBtn: { width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  header: { marginBottom: 24 },
  welcomeTitle: { color: COLORS.onBackground, fontSize: 28, fontWeight: '700', marginBottom: 8 },
  welcomeSubtitle: { color: COLORS.outline, fontSize: 16, lineHeight: 24 },
  highlightText: { color: COLORS.primary, fontWeight: '700' },
  statsGrid: { flexDirection: 'row', gap: 16, marginBottom: 24 },
  statBox: {
    flex: 1, backgroundColor: 'rgba(30, 30, 30, 0.7)', borderRadius: 16, padding: 20,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  statValue: { fontSize: 32, fontWeight: '700', marginBottom: 4 },
  statLabel: { fontSize: 10, color: COLORS.outline, fontWeight: '600', letterSpacing: 1 },
  
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitleCont: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitleText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  countBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  countBadgeText: { fontSize: 10, fontWeight: '700' },

  listContainer: { gap: 12 },
  pastListContainer: { backgroundColor: 'rgba(255, 180, 171, 0.02)', padding: 12, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255, 180, 171, 0.05)' },
  
  questionCard: {
    backgroundColor: 'rgba(30, 30, 30, 0.8)', padding: 16, borderRadius: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.03)',
  },
  questionCardPast: { borderColor: 'rgba(255, 180, 171, 0.2)' },
  questionCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  categoryIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  categoryInitial: { fontSize: 18, fontWeight: '800' },
  questionContent: { flex: 1 },
  questionMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  categoryLabel: { color: COLORS.outline, fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  badge: { backgroundColor: 'rgba(74, 222, 128, 0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  badgeText: { color: '#4ade80', fontSize: 8, fontWeight: '700' },
  questionText: { color: COLORS.onBackground, fontSize: 14, fontWeight: '600' },
  solveBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  solveBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  emptyCard: { backgroundColor: 'rgba(30, 30, 30, 0.4)', padding: 24, borderRadius: 20, alignItems: 'center', borderStyle: 'dashed', borderWidth: 2, borderColor: 'rgba(255, 255, 255, 0.05)' },
  emptyTitle: { color: '#fff', fontSize: 16, fontWeight: '700', marginTop: 12 },
  emptySubtitle: { color: COLORS.outline, fontSize: 12, marginTop: 4 },

  seeAllBtn: { paddingVertical: 12, alignItems: 'center', borderStyle: 'dashed', borderWidth: 2, borderColor: 'rgba(205, 189, 255, 0.2)', borderRadius: 20 },
  seeAllText: { color: COLORS.primary, fontSize: 12, fontWeight: '700' },
  seeAllBtnPast: { marginTop: 12, alignItems: 'center' },
  seeAllTextPast: { color: COLORS.error, fontSize: 12, fontWeight: '700', textDecorationLine: 'underline' },

  urgencyAlert: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.errorContainer, padding: 12, borderRadius: 16, marginTop: 8 },
  urgencyText: { color: '#fff', fontSize: 11, fontWeight: '700', flex: 1 },

  card: { backgroundColor: 'rgba(30, 30, 30, 0.7)', borderRadius: 16, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)' },
  cardTitle: { color: COLORS.onBackground, fontSize: 20, fontWeight: '700', marginBottom: 2 },
  perfContent: { marginTop: 16, alignItems: 'center', gap: 20 },
  progressContainer: { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  progressTextCenter: { position: 'absolute', alignItems: 'center' },
  progressPercent: { color: '#fff', fontSize: 24, fontWeight: '700' },
  progressLabelSmall: { color: COLORS.outline, fontSize: 8, fontWeight: '700', marginTop: 2 },
  perfStats: { flex: 1 },
  perfDesc: { color: '#cac3d8', fontSize: 15, lineHeight: 22, marginBottom: 16, textAlign: 'center' },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: 20 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { color: COLORS.outline, fontSize: 12 },
  
  fabContainer: { position: 'absolute', bottom: 100, right: 24, zIndex: 1000 },
  fab: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', elevation: 8 },
  bottomNav: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 80,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around',
    paddingBottom: Platform.OS === 'ios' ? 20 : 0, borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  navItem: { alignItems: 'center', gap: 4 },
  navItemActive: { backgroundColor: 'rgba(205, 189, 255, 0.1)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16, alignItems: 'center', gap: 4 },
  navText: { color: COLORS.outline, fontSize: 11, fontWeight: '500' },
  navTextActive: { color: COLORS.primary, fontSize: 11, fontWeight: '600' },
  errorText: { color: COLORS.error, fontSize: 16, textAlign: 'center', marginBottom: 16 },
  retryBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  retryText: { color: '#20005f', fontSize: 16, fontWeight: '700' },
});
