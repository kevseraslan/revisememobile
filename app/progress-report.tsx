import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, ActivityIndicator, RefreshControl, Image, TouchableOpacity } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import { apiService } from '../services/api';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

// Tailwind Config'deki renkler
const COLORS = {
  background: '#131313',
  surface: '#131313',
  surfaceContainerLow: '#1c1b1b',
  primaryContainer: '#7c4dff',
  primary: '#cdbdff',
  tertiary: '#00daf3',
  secondary: '#b0c6ff',
  error: '#ffb4ab',
  outline: '#948ea1',
  onSurface: '#e5e2e1',
};

interface Stats {
  total_questions: number;
  completed_questions: number;
  success_rate: number;
  completed_tasks: number;
  tasks_this_week: number;
  questions_this_week: number;
}

interface CategoryStat {
  name: string;
  total: number;
  completed: number;
  rate: number;
}

const CircularProgress = ({ size, strokeWidth, percentage, color }: { size: number, strokeWidth: number, percentage: number, color: string }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#353534"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <Text style={[styles.progressText, { color: percentage > 0 ? color : '#fff' }]}>%{percentage}</Text>
    </View>
  );
};

interface Recommendation {
  type: string;
  icon: string;
  title: string;
  desc: string;
}

export default function ProgressReportScreen() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [categories, setCategories] = useState<CategoryStat[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const data = await apiService.getPerformanceReport();
      if (data.success) {
        setStats(data.stats);
        setCategories(data.categories);
        setRecommendations(data.recommendations || []);
      }
    } catch (err) {
      console.error(err);
      setError('Veriler güncellenirken bir hata oluştu.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ... (loading state logic remains the same)

  const getIcon = (iconName: string) => {
    // MaterialIcons eşleştirmesi
    const iconMap: any = {
      'trending_down': 'warning',
      'running_with_errors': 'rocket-launch',
      'psychology': 'psychology',
      'verified': 'verified',
      'lightbulb': 'lightbulb',
      'info': 'info'
    };
    return iconMap[iconName] || 'info';
  };

  const getStatusColor = (type: string) => {
    switch (type) {
      case 'warning': return COLORS.error;
      case 'danger': return COLORS.primaryContainer;
      case 'success': return '#4ade80';
      default: return COLORS.secondary;
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.primaryContainer} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ... (Header remains the same) */}
      <BlurView intensity={80} tint="dark" style={styles.header}>
        <View style={styles.headerLeft}>
          <Image 
            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA92dDCVfyF-dj9hIC9M5KN0ypTtoMccrA09XJ0ddHLOfuBo2M01aehny1xI5XH--nTotqFBvUwBzDc0Da3_ig_ZQWBKp6T7enfJctEmndSPRdsRxWbHbjith3P575_fFlN6nAAyBiwUkYoTiiEUYu0FPeMzteLHxxnzTT55UpyUwgfsaxev-3h8nXuW54Vz_umOfbAOt5Um3N9E80fKbVpufRlqQ5y9JxWPFDlMAVaj6q4yuTtZKrCCDfqWwbhHo7y5q_6CYkoNUE' }} 
            style={styles.profileImg}
          />
          <Text style={styles.headerTitle}>Gelişim Raporu</Text>
        </View>
        <TouchableOpacity style={styles.searchBtn}>
          <MaterialIcons name="search" size={24} color="#948ea1" />
        </TouchableOpacity>
      </BlurView>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); fetchData();}} tintColor={COLORS.primaryContainer} />}
      >
        {/* ... (Stat Grid and Goal Section remain the same) */}
        <View style={styles.statGrid}>
          <View style={styles.glassCard}>
            <Text style={styles.statLabel}>TOPLAM SORU</Text>
            <Text style={[styles.statValue, { color: COLORS.primaryContainer }]}>{stats?.total_questions || 0}</Text>
          </View>
          <View style={styles.glassCard}>
            <Text style={styles.statLabel}>ÇÖZÜLEN SORU</Text>
            <Text style={[styles.statValue, { color: COLORS.tertiary }]}>{stats?.completed_questions || 0}</Text>
          </View>
          <View style={styles.glassCard}>
            <Text style={styles.statLabel}>GÖREVLER</Text>
            <Text style={[styles.statValue, { color: COLORS.secondary }]}>{stats?.completed_tasks || 0}</Text>
          </View>
          <View style={[styles.glassCard, { borderColor: 'rgba(124, 77, 255, 0.3)' }]}>
            <Text style={styles.statLabel}>BAŞARI ORANI</Text>
            <Text style={[styles.statValue, { color: COLORS.primary }]}>%{stats?.success_rate || 0}</Text>
          </View>
        </View>

        <View style={styles.goalSection}>
          <View style={styles.goalHeader}>
            <Text style={styles.sectionTitle}>Haftalık Hedef</Text>
            <TouchableOpacity style={styles.editBtn}>
              <Text style={styles.editBtnText}>Hedefi Düzenle</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.goalItem}>
            <View style={styles.goalMeta}>
              <Text style={styles.goalLabel}>SORU ÇÖZÜMÜ</Text>
              <Text style={styles.goalValue}>{stats?.questions_this_week || 0}/100</Text>
            </View>
            <View style={styles.progressBg}>
              <LinearGradient 
                colors={[COLORS.primaryContainer, COLORS.tertiary]} 
                start={{x: 0, y: 0}} end={{x: 1, y: 0}}
                style={[styles.progressFill, { width: `${Math.min(((stats?.questions_this_week || 0) / 100) * 100, 100)}%` }]} 
              />
            </View>
          </View>

          <View style={styles.goalItem}>
            <View style={styles.goalMeta}>
              <Text style={styles.goalLabel}>GÖREV</Text>
              <Text style={styles.goalValue}>0/10</Text>
            </View>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: '0%', backgroundColor: COLORS.secondary }]} />
            </View>
          </View>
        </View>

        {/* Subject Performance */}
        <View style={styles.subjectSection}>
          <View style={styles.goalHeader}>
            <Text style={styles.sectionTitle}>Tüm Derslerin Performansı</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{categories.length} Branş</Text>
            </View>
          </View>

          <View style={styles.subjectGrid}>
            {categories.map((item, index) => (
              <View key={index} style={styles.subjectCard}>
                <CircularProgress 
                  size={64} 
                  strokeWidth={6} 
                  percentage={item.rate} 
                  color={index % 3 === 0 ? COLORS.primaryContainer : index % 3 === 1 ? COLORS.tertiary : COLORS.secondary} 
                />
                <Text style={styles.subjectName} numberOfLines={1}>{item.name}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Dynamic Suggestions */}
        <View style={styles.suggestionHeader}>
           <Text style={styles.sectionTitle}>Sistem Önerileri</Text>
        </View>

        {recommendations.length > 0 ? (
          recommendations.map((item, index) => (
            <View key={index} style={[styles.suggestionCard, { borderLeftColor: getStatusColor(item.type) }]}>
              <MaterialIcons name={getIcon(item.icon) as any} size={24} color={getStatusColor(item.type)} style={styles.suggestionIcon} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.suggestionLabel, { color: getStatusColor(item.type) }]}>{item.type.toUpperCase()}</Text>
                <Text style={styles.suggestionTitle}>{item.title}</Text>
                <Text style={styles.suggestionText}>{item.desc}</Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.glassCard}>
            <Text style={styles.suggestionText}>Henüz bir öneri bulunmuyor.</Text>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Nav Mockup */}
      <BlurView intensity={90} tint="dark" style={styles.bottomNav}>
        <View style={styles.navItem}>
          <MaterialIcons name="home" size={24} color="#666" />
          <Text style={styles.navText}>Ana Sayfa</Text>
        </View>
        <View style={[styles.navItem, styles.navItemActive]}>
          <MaterialIcons name="insights" size={24} color={COLORS.primaryContainer} />
          <Text style={[styles.navText, { color: COLORS.primaryContainer }]}>Raporlar</Text>
        </View>
        <View style={styles.navItem}>
          <MaterialIcons name="school" size={24} color="#666" />
          <Text style={styles.navText}>Eğitim</Text>
        </View>
        <View style={styles.navItem}>
          <MaterialIcons name="person" size={24} color="#666" />
          <Text style={styles.navText}>Profil</Text>
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { justifyContent: 'center', alignItems: 'center' },
  header: { 
    position: 'absolute', top: 0, left: 0, right: 0, height: 90, zIndex: 10,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, paddingTop: 40, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)'
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  profileImg: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: COLORS.primaryContainer },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  searchBtn: { padding: 8 },
  scrollContent: { paddingTop: 110, paddingHorizontal: 24 },
  
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  glassCard: { 
    width: (width - 60) / 2, backgroundColor: 'rgba(30,30,30,0.7)', borderRadius: 16, 
    padding: 16, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)'
  },
  statLabel: { color: '#666', fontSize: 10, fontWeight: '700', marginBottom: 4 },
  statValue: { fontSize: 24, fontWeight: '800' },

  goalSection: { 
    backgroundColor: 'rgba(30,30,30,0.7)', borderRadius: 20, padding: 24, 
    marginBottom: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)'
  },
  goalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  editBtn: { backgroundColor: 'rgba(124, 77, 255, 0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  editBtnText: { color: COLORS.primaryContainer, fontSize: 11, fontWeight: '700' },
  goalItem: { marginBottom: 20 },
  goalMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  goalLabel: { color: '#948ea1', fontSize: 11, fontWeight: '700' },
  goalValue: { color: '#fff', fontSize: 12, fontWeight: '700' },
  progressBg: { height: 10, backgroundColor: '#353534', borderRadius: 5, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 5 },

  subjectSection: { 
    backgroundColor: 'rgba(30,30,30,0.7)', borderRadius: 20, padding: 24, 
    marginBottom: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)'
  },
  countBadge: { backgroundColor: '#2a2a2a', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  countBadgeText: { color: '#948ea1', fontSize: 10, fontWeight: '700' },
  subjectGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 20, justifyContent: 'space-between' },
  subjectCard: { alignItems: 'center', width: (width - 120) / 3, gap: 8 },
  progressText: { position: 'absolute', fontSize: 12, fontWeight: '800' },
  subjectName: { color: '#948ea1', fontSize: 11, fontWeight: '600', textAlign: 'center' },

  suggestionHeader: { marginBottom: 16 },
  suggestionCard: { 
    backgroundColor: 'rgba(30,30,30,0.7)', borderRadius: 16, padding: 16, 
    flexDirection: 'row', gap: 16, marginBottom: 12, borderLeftWidth: 4,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)'
  },
  suggestionIcon: { marginTop: 2 },
  suggestionLabel: { fontSize: 10, fontWeight: '800', marginBottom: 2 },
  suggestionTitle: { color: '#fff', fontSize: 15, fontWeight: '700' },
  suggestionText: { color: '#948ea1', fontSize: 11, marginTop: 2, lineHeight: 16 },

  bottomNav: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 85,
    flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',
    paddingBottom: 20, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)'
  },
  navItem: { alignItems: 'center', gap: 4 },
  navItemActive: { backgroundColor: 'rgba(124, 77, 255, 0.1)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  navText: { fontSize: 10, fontWeight: '600', color: '#666' },
});
