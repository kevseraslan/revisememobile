import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, RefreshControl, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import PageWrapper from '../components/PageWrapper';
import { apiService, BASE_URL, QuestionItem } from '../services/api';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

// Premium Color Palette
const COLORS = {
  background: '#131313',
  primary: '#cdbdff',
  primaryContainer: '#7c4dff',
  surface: '#1c1b1b',
  surfaceVariant: '#2a2a2a',
  onSurface: '#e5e2e1',
  onSurfaceVariant: '#cac3d8',
  error: '#ffb4ab',
  success: '#4ade80',
  outline: '#948ea1',
};

export default function PastQuestionsScreen() {
  const router = useRouter();
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPastQuestions = async () => {
    try {
      setError(null);
      const data = await apiService.getPastQuestions();
      if (data.success) {
        setQuestions(data.questions);
      } else {
        setError(data.message || 'Veriler alınamadı.');
      }
    } catch (err: any) {
      if (err?.response?.status === 401) {
        setError('Oturumunuz kapalı. Lütfen giriş yapın.');
      } else {
        setError('Bağlantı hatası oluştu.');
      }
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPastQuestions();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPastQuestions();
  };

  if (loading && !refreshing) {
    return (
      <PageWrapper title="Geçmiş Sorular" hideHeader>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primaryContainer} />
        </View>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="Geçmiş Sorular" hideHeader>
      <View style={styles.flex1}>
        <ScrollView 
          contentContainerStyle={styles.container} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primaryContainer} />
          }
        >
          {/* Header Banner */}
          <View style={styles.banner}>
            <LinearGradient colors={[COLORS.primaryContainer, '#5635b5']} style={styles.bannerGradient}>
              <View style={styles.bannerContent}>
                <View style={styles.bannerText}>
                  <Text style={styles.bannerTitle}>Geçmiş Sorular</Text>
                  <Text style={styles.bannerSubtitle}>
                    Zamanı geçmiş sorular burada birikti. Düzeni sağlamak için soruları eritmeye başlayabilirsin!
                  </Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>{questions.length}</Text>
                  <Text style={styles.statLabel}>TOPLAM GECİKEN</Text>
                </View>
              </View>
              {/* Decorative circles */}
              <View style={[styles.decorCircle, { bottom: -40, right: -40, width: 120, height: 120, opacity: 0.2 }]} />
              <View style={[styles.decorCircle, { top: -20, left: -20, width: 80, height: 80, opacity: 0.1 }]} />
            </LinearGradient>
          </View>

          {error ? (
            <View style={styles.errorCard}>
              <MaterialIcons name="error-outline" size={32} color={COLORS.error} />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={fetchPastQuestions} style={styles.retryBtn}>
                <Text style={styles.retryBtnText}>Tekrar Dene</Text>
              </TouchableOpacity>
            </View>
          ) : questions.length > 0 ? (
            <View style={styles.listContainer}>
              {questions.map((q) => (
                <TouchableOpacity 
                  key={q.id} 
                  style={styles.qCard}
                  onPress={() => router.push({ pathname: '/question-detail', params: { id: q.id } })}
                >
                  {q.image ? (
                    <Image source={{ uri: `${BASE_URL}/static/${q.image}` }} style={styles.qImage} />
                  ) : (
                    <View style={styles.placeholderImg}>
                      <MaterialIcons name="image-not-supported" size={32} color="#444" />
                    </View>
                  )}
                  <LinearGradient colors={['transparent', 'rgba(0,0,0,0.9)']} style={styles.qGradient}>
                    <View style={styles.qHeader}>
                      <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText}>{q.category}</Text>
                      </View>
                      <View style={styles.delayBadge}>
                        <Text style={styles.delayText}>{q.delay_days} Gün Gecikti</Text>
                      </View>
                    </View>
                    <Text style={styles.qTopic} numberOfLines={2}>{q.topic || q.content || 'Başlıksız Soru'}</Text>
                    <View style={styles.solveBtn}>
                      <Text style={styles.solveBtnText}>Hemen Çöz</Text>
                      <MaterialIcons name="play-arrow" size={18} color="#fff" />
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconBg}>
                <MaterialIcons name="check-circle" size={56} color={COLORS.success} />
              </View>
              <Text style={styles.emptyTitle}>Tebrikler!</Text>
              <Text style={styles.emptySubtitle}>
                Şu an için gecikmiş herhangi bir sorunuz bulunmuyor. Programınıza sadık kaldığınız için harikasınız.
              </Text>
              
              <View style={styles.infoChip}>
                <MaterialIcons name="auto-awesome" size={16} color={COLORS.primary} />
                <Text style={styles.infoChipText}>Program güncel görünüyor</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Floating Action Button */}
        <TouchableOpacity style={styles.fab}>
          <MaterialIcons name="smart-toy" size={28} color={COLORS.onSurface} />
        </TouchableOpacity>
      </View>
    </PageWrapper>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  container: { padding: 20, paddingTop: 40, paddingBottom: 120 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  
  // Banner
  banner: { borderRadius: 32, overflow: 'hidden', marginBottom: 24, elevation: 8, shadowColor: COLORS.primaryContainer, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20 },
  bannerGradient: { padding: 24, minHeight: 160 },
  bannerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  bannerText: { flex: 1, marginRight: 16 },
  bannerTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  bannerSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 13, lineHeight: 18 },
  statBox: { backgroundColor: 'rgba(0,0,0,0.2)', padding: 12, borderRadius: 20, alignItems: 'center', minWidth: 80, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  statNumber: { color: '#fff', fontSize: 28, fontWeight: 'bold' },
  statLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 8, fontWeight: 'bold', textAlign: 'center', marginTop: 4 },
  decorCircle: { position: 'absolute', backgroundColor: '#fff', borderRadius: 100 },

  // List
  listContainer: { gap: 20 },
  qCard: { height: 200, borderRadius: 28, overflow: 'hidden', backgroundColor: COLORS.surface },
  qImage: { ...StyleSheet.absoluteFillObject },
  placeholderImg: { ...StyleSheet.absoluteFillObject, backgroundColor: '#1e1e1e', alignItems: 'center', justifyContent: 'center' },
  qGradient: { ...StyleSheet.absoluteFillObject, padding: 20, justifyContent: 'flex-end' },
  qHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  categoryBadge: { backgroundColor: 'rgba(124, 77, 255, 0.3)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  categoryText: { color: COLORS.primary, fontSize: 11, fontWeight: 'bold' },
  delayBadge: { backgroundColor: 'rgba(255, 107, 107, 0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  delayText: { color: '#ff6b6b', fontSize: 10, fontWeight: 'bold' },
  qTopic: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  solveBtn: { backgroundColor: COLORS.primaryContainer, height: 40, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, alignSelf: 'flex-start', paddingHorizontal: 16 },
  solveBtnText: { color: '#fff', fontSize: 13, fontWeight: 'bold' },

  // Empty State
  emptyState: { backgroundColor: COLORS.surface, borderRadius: 32, padding: 40, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(148, 142, 161, 0.1)' },
  emptyIconBg: { width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(74, 222, 128, 0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 24, borderWidth: 4, borderColor: 'rgba(74, 222, 128, 0.1)' },
  emptyTitle: { color: COLORS.onSurface, fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
  emptySubtitle: { color: COLORS.onSurfaceVariant, fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  infoChip: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(205, 189, 255, 0.05)', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 100, borderWidth: 1, borderColor: 'rgba(205, 189, 255, 0.1)' },
  infoChipText: { color: COLORS.onSurfaceVariant, fontSize: 13, fontWeight: '500' },

  // Error
  errorCard: { backgroundColor: 'rgba(255, 107, 107, 0.05)', padding: 32, borderRadius: 32, alignItems: 'center', gap: 16, borderWidth: 1, borderColor: 'rgba(255, 107, 107, 0.1)' },
  errorText: { color: COLORS.error, fontSize: 16, fontWeight: '600', textAlign: 'center' },
  retryBtn: { backgroundColor: COLORS.primaryContainer, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 16 },
  retryBtnText: { color: '#fff', fontWeight: 'bold' },

  // FAB
  fab: { position: 'absolute', bottom: 30, right: 24, width: 60, height: 60, borderRadius: 20, backgroundColor: COLORS.primaryContainer, alignItems: 'center', justifyContent: 'center', elevation: 10, shadowColor: COLORS.primaryContainer, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.4, shadowRadius: 15 },
});
