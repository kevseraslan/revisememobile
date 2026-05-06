import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, RefreshControl } from 'react-native';
import { apiService } from '../services/api';

const { width } = Dimensions.get('window');

const COLORS = {
  background: '#0e0e0e',
  surface: '#1c1b1b',
  surfaceVariant: '#2a2a2a',
  primary: '#cdbdff',
  primaryContainer: '#7c4dff',
  secondary: '#b0c6ff',
  tertiary: '#00daf3',
  onSurface: '#e5e2e1',
  onSurfaceVariant: '#cac3d8',
  outline: '#948ea1',
  error: '#ffb4ab',
};

export default function HomeScreen() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const result = await apiService.getDashboardData();
      if (result.success) {
        setData(result);
      }
    } catch (error) {
      console.error('Fetch Dashboard Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primaryContainer} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView 
        contentContainerStyle={styles.scrollContainer} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <LinearGradient colors={['rgba(124, 77, 255, 0.2)', 'rgba(124, 77, 255, 0.05)']} style={styles.heroCard}>
            <View style={styles.heroContent}>
              <View style={styles.planBadge}>
                <Text style={styles.planBadgeText}>ACTIVE PLAN</Text>
              </View>
              <Text style={styles.heroTitle}>YKS 2024 Prep</Text>
              <Text style={styles.heroDesc}>
                {data?.stats?.success_rate > 50 
                  ? `You've completed %${data.stats.success_rate} of your goals. Amazing work!` 
                  : `You've completed %${data?.stats?.success_rate || 0} of your goals. Keep pushing!`}
              </Text>
              
              <View style={styles.heroActions}>
                <TouchableOpacity style={styles.primaryBtn}>
                  <Text style={styles.primaryBtnText}>Resume Session</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondaryBtn}>
                  <Text style={styles.secondaryBtnText}>View Plan</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.heroDecor} />
          </LinearGradient>
        </View>

        {/* Dynamic Question Pools Grid */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Question Pools</Text>
            <TouchableOpacity><Text style={styles.viewAll}>View All</Text></TouchableOpacity>
          </View>
          
          <View style={styles.poolGrid}>
            {data?.pools && data.pools.length > 0 ? data.pools.map((pool: any) => (
              <TouchableOpacity 
                key={pool.id} 
                style={styles.poolCard}
                onPress={() => router.push({ pathname: '/category-questions', params: { id: pool.id, name: pool.name } })}
              >
                <Image source={{ uri: pool.image }} style={styles.poolImg} />
                <LinearGradient colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.9)']} style={styles.poolOverlay}>
                  <View style={[styles.poolIconBox, { backgroundColor: `${pool.color}20` }]}>
                    <MaterialIcons name={pool.icon as any} size={20} color={pool.color} />
                  </View>
                  <View style={styles.poolCountBox}>
                    <Text style={styles.poolCountLabel}>SORU SAYISI</Text>
                    <Text style={styles.poolCountValue}>{pool.count}</Text>
                  </View>
                  <View>
                    <Text style={styles.poolName}>{pool.name}</Text>
                    <View style={styles.poolProgressBg}>
                      <View style={[styles.poolProgressFill, { width: `${Math.min((pool.count / 100) * 100, 100)}%`, backgroundColor: pool.color }]} />
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            )) : (
              <View style={styles.emptyPools}>
                <Text style={styles.emptyText}>Henüz hiç soru havuzu oluşturulmamış.</Text>
              </View>
            )}
          </View>
        </View>

        {/* Real-time Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Başarı Oranı</Text>
            <Text style={[styles.statValue, { color: COLORS.tertiary }]}>%{data?.stats?.success_rate || '0'}</Text>
            <Text style={styles.statTrend}>+2.4% vs last week</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Toplam Çözülen</Text>
            <Text style={[styles.statValue, { color: COLORS.primary }]}>{data?.stats?.completed_questions || '0'}</Text>
            <Text style={styles.statTarget}>Target: {data?.stats?.total_questions || 0}</Text>
          </View>
        </View>

        {/* Dynamic Weekly Activity */}
        <View style={styles.section}>
          <View style={styles.activityCard}>
            <View style={styles.activityHeader}>
              <View style={styles.activityTitleCont}>
                <View style={styles.fireIcon}>
                  <MaterialCommunityIcons name="fire" size={20} color="#f97316" />
                </View>
                <View>
                  <Text style={styles.activityTitle}>Haftalık Aktivite</Text>
                  <Text style={styles.activitySubtitle}>Gerçek Zamanlı İlerleme</Text>
                </View>
              </View>
            </View>
            <View style={styles.chartArea}>
              {data?.weekly_activity ? data.weekly_activity.map((item: any, i: number) => (
                <View key={i} style={styles.barCont}>
                  <View style={[styles.bar, { height: item.height, backgroundColor: item.active ? COLORS.primaryContainer : COLORS.surfaceVariant }]}>
                    {item.active && <View style={styles.activeGlow} />}
                  </View>
                  <Text style={[styles.dayText, item.active && { color: COLORS.primary }]}>{item.day}</Text>
                </View>
              )) : null}
            </View>
          </View>
        </View>

        {/* Countdown */}
        <View style={styles.section}>
          <LinearGradient colors={['#1c1b1b', '#0e0e0e']} style={styles.timerCard}>
            <View style={styles.timerHeader}>
              <Text style={styles.timerTitle}>YKS 2026 GERİ SAYIM</Text>
              <MaterialIcons name="event" size={18} color={COLORS.primary} />
            </View>
            <View style={styles.timerGrid}>
              <View style={styles.timerBox}>
                <Text style={styles.timerNum}>45</Text>
                <Text style={styles.timerUnit}>GÜN</Text>
              </View>
              <View style={styles.timerBox}>
                <Text style={styles.timerNum}>11</Text>
                <Text style={styles.timerUnit}>SAAT</Text>
              </View>
              <View style={styles.timerBox}>
                <Text style={styles.timerNum}>25</Text>
                <Text style={styles.timerUnit}>DAKİKA</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Floating AI Assistant (Optional, can be moved to GlobalLayout if needed) */}
      <TouchableOpacity style={styles.fab}>
        <LinearGradient colors={[COLORS.primaryContainer, '#5635b5']} style={styles.fabGradient}>
          <MaterialCommunityIcons name="robot" size={28} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0e0e0e' },
  scrollContainer: { paddingBottom: 120, paddingTop: 20 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0e0e0e' },
  
  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 60, marginBottom: 24 },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarGlow: { padding: 2, borderRadius: 24, backgroundColor: 'rgba(124, 77, 255, 0.3)' },
  avatarBorder: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: COLORS.primaryContainer, overflow: 'hidden' },
  avatar: { width: '100%', height: '100%' },
  welcomeLabel: { color: COLORS.onSurfaceVariant, fontSize: 13 },
  userName: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  iconBtn: { width: 48, height: 48, backgroundColor: COLORS.surface, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  badge: { position: 'absolute', top: 12, right: 12, width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.error, borderWidth: 2, borderColor: COLORS.background },

  // Hero
  heroSection: { paddingHorizontal: 24, marginBottom: 32 },
  heroCard: { borderRadius: 32, padding: 24, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(124, 77, 255, 0.2)' },
  heroContent: { zIndex: 10 },
  planBadge: { backgroundColor: 'rgba(124, 77, 255, 0.15)', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginBottom: 12 },
  planBadgeText: { color: COLORS.primary, fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
  heroTitle: { color: '#fff', fontSize: 26, fontWeight: 'bold', marginBottom: 8 },
  heroDesc: { color: COLORS.onSurfaceVariant, fontSize: 15, lineHeight: 22, marginBottom: 24 },
  heroActions: { flexDirection: 'row', gap: 12 },
  primaryBtn: { flex: 1, backgroundColor: COLORS.primaryContainer, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  primaryBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  secondaryBtn: { flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  secondaryBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  heroDecor: { position: 'absolute', top: -50, right: -50, width: 150, height: 150, borderRadius: 75, backgroundColor: COLORS.primary, opacity: 0.05 },

  // Pools
  section: { paddingHorizontal: 24, marginBottom: 32 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sectionTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  viewAll: { color: COLORS.primary, fontSize: 13, fontWeight: 'bold' },
  poolGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  poolCard: { width: (width - 64) / 2, height: 220, borderRadius: 32, overflow: 'hidden', backgroundColor: COLORS.surface, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  poolImg: { ...StyleSheet.absoluteFillObject, opacity: 0.6 },
  poolOverlay: { ...StyleSheet.absoluteFillObject, padding: 20, justifyContent: 'space-between', backgroundColor: 'rgba(0,0,0,0.2)' },
  poolIconBox: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  poolCountBox: { position: 'absolute', top: 20, right: 20, alignItems: 'flex-end' },
  poolCountLabel: { color: COLORS.onSurfaceVariant, fontSize: 8, fontWeight: 'bold', letterSpacing: 0.5 },
  poolCountValue: { color: '#fff', fontSize: 36, fontWeight: '900', marginTop: -4, opacity: 0.8 },
  poolName: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  poolProgressBg: { height: 4, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' },
  poolProgressFill: { height: '100%', borderRadius: 2 },
  emptyPools: { width: '100%', padding: 40, alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 24 },
  emptyText: { color: COLORS.onSurfaceVariant, textAlign: 'center' },

  // Stats
  statsRow: { flexDirection: 'row', paddingHorizontal: 24, gap: 16, marginBottom: 32 },
  statCard: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 28, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  statLabel: { color: COLORS.onSurfaceVariant, fontSize: 12, marginBottom: 8 },
  statValue: { fontSize: 28, fontWeight: 'bold', marginBottom: 4 },
  statTrend: { color: '#10b981', fontSize: 10, fontWeight: 'bold' },
  statTarget: { color: COLORS.onSurfaceVariant, fontSize: 10 },

  // Activity
  activityCard: { backgroundColor: COLORS.surface, borderRadius: 32, padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  activityHeader: { marginBottom: 24 },
  activityTitleCont: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  fireIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(249, 115, 22, 0.1)', alignItems: 'center', justifyContent: 'center' },
  activityTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  activitySubtitle: { color: COLORS.onSurfaceVariant, fontSize: 12 },
  chartArea: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 120 },
  barCont: { alignItems: 'center', width: (width - 100) / 7 },
  bar: { width: 8, borderRadius: 4 },
  activeGlow: { ...StyleSheet.absoluteFillObject, backgroundColor: COLORS.primaryContainer, borderRadius: 4, shadowColor: COLORS.primaryContainer, shadowRadius: 10, shadowOpacity: 0.5 },
  dayText: { color: COLORS.onSurfaceVariant, fontSize: 10, fontWeight: 'bold' },

  // Timer
  timerCard: { borderRadius: 32, padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  timerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  timerTitle: { color: COLORS.primary, fontSize: 11, fontWeight: 'bold', letterSpacing: 1 },
  timerGrid: { flexDirection: 'row', gap: 16 },
  timerBox: { flex: 1, alignItems: 'center' },
  timerNum: { color: '#fff', fontSize: 28, fontWeight: 'bold' },
  timerUnit: { color: COLORS.onSurfaceVariant, fontSize: 10, fontWeight: 'bold', marginTop: 4 },

  // FAB
  fab: { position: 'absolute', bottom: 100, right: 24, width: 64, height: 64, borderRadius: 32, elevation: 10, shadowColor: COLORS.primaryContainer, shadowRadius: 15, shadowOpacity: 0.4 },
  fabGradient: { flex: 1, borderRadius: 32, alignItems: 'center', justifyContent: 'center' }
});
