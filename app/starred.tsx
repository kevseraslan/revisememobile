import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, RefreshControl, Dimensions, SafeAreaView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import PageWrapper from '../components/PageWrapper';
import { apiService, BASE_URL } from '../services/api';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

// Premium Color Palette from HTML
const COLORS = {
  background: '#131313',
  primary: '#cdbdff',
  primaryContainer: '#7c4dff',
  surface: '#131313',
  surfaceContainerLow: '#1c1b1b',
  surfaceContainerHigh: '#2a2a2a',
  onSurface: '#e5e2e1',
  onSurfaceVariant: '#cac3d8',
  outline: '#948ea1',
  outlineVariant: '#494455',
  error: '#ffb4ab',
  tertiary: '#00daf3',
  starYellow: '#facc15',
};

interface FavoriteQuestion {
  id: number;
  content: string;
  topic: string;
  category: string;
  difficulty: number | string;
  image: string;
  created_at: string;
}

export default function StarredQuestionsScreen() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<FavoriteQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFavorites = async () => {
    try {
      setError(null);
      const data = await apiService.getFavorites();
      if (data.success && data.questions) {
        setFavorites(data.questions);
      } else if (data.success) {
        setFavorites([]);
      } else {
        setError(data.message || 'Veriler alınamadı.');
      }
    } catch (err: any) {
      if (err?.response?.status === 401) {
        setError('Oturumunuz kapalı. Lütfen giriş yapın.');
      } else {
        setError('Favori sorular yüklenirken bir sorun oluştu.');
      }
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchFavorites();
  };

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    const formattedPath = imagePath.replace(/\\/g, '/');
    return `${BASE_URL}/static/${formattedPath}`;
  };

  if (loading && !refreshing) {
    return (
      <PageWrapper title="Yıldızlı Sorularım" hideHeader>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primaryContainer} />
        </View>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="Yıldızlı Sorularım" hideHeader>
      <View style={styles.flex1}>
        {/* Custom Header (Glassmorphism) */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color={COLORS.primaryContainer} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Yıldızlı Sorularım</Text>
        </View>

        <ScrollView 
          contentContainerStyle={styles.container} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primaryContainer} />
          }
        >
          {/* Header Section */}
          <View style={styles.headerSection}>
            <Text style={styles.headerSubtitle}>
              Tekrar etmek üzere kaydettiğin veya özellikle beğendiğin soruların koleksiyonu.
            </Text>
          </View>

          {/* Filter Controls */}
          <View style={styles.filterSection}>
            <TouchableOpacity style={styles.filterBtn}>
              <MaterialIcons name="filter-list" size={20} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.categoryDropdown}>
              <Text style={styles.categoryDropdownText}>Tüm Dersler/Kategoriler</Text>
              <MaterialIcons name="keyboard-arrow-down" size={20} color={COLORS.outline} />
            </TouchableOpacity>
          </View>

          {error ? (
            <View style={styles.errorCard}>
              <MaterialIcons name="error-outline" size={32} color={COLORS.error} />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={fetchFavorites} style={styles.retryBtn}>
                <Text style={styles.retryBtnText}>Tekrar Dene</Text>
              </TouchableOpacity>
            </View>
          ) : favorites.length > 0 ? (
            <View style={styles.grid}>
              {favorites.map((q) => (
                <View key={q.id} style={styles.qCard}>
                  {/* Image Section */}
                  <View style={styles.cardImageContainer}>
                    {getImageUrl(q.image) ? (
                      <Image source={{ uri: getImageUrl(q.image)! }} style={styles.cardImage} />
                    ) : (
                      <View style={styles.placeholderImg}>
                        <MaterialIcons name="image-not-supported" size={48} color="#333" />
                      </View>
                    )}
                    
                    {/* Difficulty Badge */}
                    <View style={styles.difficultyBadge}>
                      <View style={styles.difficultyDot} />
                      <Text style={styles.difficultyText}>
                        {typeof q.difficulty === 'number' ? (q.difficulty > 2 ? 'ZOR' : q.difficulty > 1 ? 'ORTA' : 'KOLAY') : q.difficulty || 'ORTA'}
                      </Text>
                    </View>

                    {/* Star Icon */}
                    <TouchableOpacity style={styles.starIconBtn}>
                      <MaterialIcons name="star" size={24} color={COLORS.starYellow} />
                    </TouchableOpacity>
                  </View>

                  {/* Content Section */}
                  <View style={styles.cardContent}>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryText}>{q.category?.toUpperCase() || 'GENEL'}</Text>
                    </View>
                    
                    <Text style={styles.topicText} numberOfLines={2}>
                      {q.topic || q.content || 'Bu sorunun metin içeriği bulunmuyor. Detaylı çözüm için inceleyebilirsiniz.'}
                    </Text>

                    <View style={styles.cardFooter}>
                      <Text style={styles.dateText}>EKLENME: {q.created_at || 'BİLİNMİYOR'}</Text>
                      <TouchableOpacity 
                        style={styles.viewBtn}
                        onPress={() => router.push({ pathname: '/question-detail', params: { id: q.id } })}
                      >
                        <MaterialIcons name="visibility" size={18} color={COLORS.onSurface} />
                        <Text style={styles.viewBtnText}>Görüntüle</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconBg}>
                <MaterialIcons name="star-outline" size={56} color={COLORS.outline} />
              </View>
              <Text style={styles.emptyTitle}>Henüz Yıldız Yok</Text>
              <Text style={styles.emptySubtitle}>
                Soruları çözerken önemli bulduklarını yıldızlayarak burada saklayabilirsin.
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </PageWrapper>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1, backgroundColor: COLORS.background },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  // Header
  header: { height: 64, flexDirection: 'row', alignItems: 'center', px: 16, backgroundColor: 'rgba(18, 18, 18, 0.7)', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 16 },
  backBtn: { p: 8, marginRight: 8 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', fontFamily: 'Inter' },

  container: { paddingHorizontal: 16, pt: 16, paddingBottom: 100 },
  
  // Header Section
  headerSection: { marginBottom: 24 },
  headerSubtitle: { color: COLORS.onSurfaceVariant, fontSize: 14, lineHeight: 22, maxWidth: '90%' },

  // Filters
  filterSection: { flexDirection: 'row', gap: 16, marginBottom: 32 },
  filterBtn: { backgroundColor: COLORS.surfaceContainerHigh, width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(73, 68, 85, 0.3)' },
  categoryDropdown: { flex: 1, backgroundColor: COLORS.surfaceContainerHigh, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, borderWidth: 1, borderColor: 'rgba(73, 68, 85, 0.3)' },
  categoryDropdownText: { color: COLORS.onSurface, fontSize: 14, fontWeight: '500' },

  // Grid & Cards
  grid: { gap: 24 },
  qCard: { backgroundColor: COLORS.surfaceContainerLow, borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(73, 68, 85, 0.2)', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 5 },
  cardImageContainer: { height: 220, width: '100%' },
  cardImage: { width: '100%', height: '100%', objectFit: 'cover' },
  placeholderImg: { width: '100%', height: '100%', backgroundColor: '#1e1e1e', alignItems: 'center', justifyContent: 'center' },
  
  difficultyBadge: { position: 'absolute', top: 16, left: 16, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(19, 19, 19, 0.8)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100 },
  difficultyDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.tertiary, shadowColor: COLORS.tertiary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 8 },
  difficultyText: { color: COLORS.tertiary, fontSize: 10, fontWeight: 'bold' },
  
  starIconBtn: { position: 'absolute', top: 16, right: 16, backgroundColor: 'rgba(19, 19, 19, 0.8)', p: 10, borderRadius: 100, width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },

  cardContent: { padding: 24 },
  categoryBadge: { backgroundColor: 'rgba(205, 189, 255, 0.1)', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, marginBottom: 16 },
  categoryText: { color: COLORS.primary, fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
  topicText: { color: COLORS.onSurfaceVariant, fontSize: 14, lineHeight: 22, marginBottom: 24 },
  
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', pt: 16, borderTopWidth: 1, borderTopColor: 'rgba(73, 68, 85, 0.1)' },
  dateText: { color: COLORS.outline, fontSize: 10, fontWeight: '500', letterSpacing: -0.2 },
  viewBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.primaryContainer, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, shadowColor: COLORS.primaryContainer, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  viewBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  // Empty State
  emptyState: { backgroundColor: COLORS.surfaceContainerLow, borderRadius: 32, padding: 40, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(148, 142, 161, 0.1)' },
  emptyIconBg: { width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(148, 142, 161, 0.05)', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  emptyTitle: { color: COLORS.onSurface, fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
  emptySubtitle: { color: COLORS.onSurfaceVariant, fontSize: 15, textAlign: 'center', lineHeight: 22 },

  // Error
  errorCard: { backgroundColor: 'rgba(255, 107, 107, 0.05)', padding: 32, borderRadius: 32, alignItems: 'center', gap: 16, borderWidth: 1, borderColor: 'rgba(255, 107, 107, 0.1)' },
  errorText: { color: COLORS.error, fontSize: 16, fontWeight: '600', textAlign: 'center' },
  retryBtn: { backgroundColor: COLORS.primaryContainer, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 16 },
  retryBtnText: { color: '#fff', fontWeight: 'bold' },
});
