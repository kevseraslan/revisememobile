import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { apiService, BASE_URL } from '../services/api';

export default function CategoryQuestionsScreen() {
  const router = useRouter();
  const { id, name } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<any[]>([]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const data = await apiService.getCategoryQuestions(Number(id));
      if (data.success) {
        setQuestions(data.questions);
      }
    } catch (error) {
      console.error('Fetch Category Questions Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchQuestions();
  }, [id]);

  const getImageUrl = (path: string) => {
    if (!path) return null;
    // Eğer yol zaten tam bir URL ise (http ile başlıyorsa) direkt dön
    if (path.startsWith('http')) return path;
    
    // Sadece dosya adını ayıklamak yerine, yolu temizleyip BASE_URL ile birleştirelim
    const cleanPath = path.replace('static/', '').replace('uploads/', '');
    return `${BASE_URL}/static/uploads/${cleanPath}`;
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => router.push({ pathname: '/question-detail', params: { id: item.id } })}
    >
      <View style={styles.cardImageCont}>
        {item.image ? (
          <Image 
            source={{ uri: getImageUrl(item.image)! }} 
            style={styles.cardImage} 
            resizeMode="contain"
          />
        ) : (
          <View style={styles.placeholderImg}>
            <MaterialIcons name="image" size={32} color="#494455" />
          </View>
        )}
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.topicText}>{item.topic || 'Genel Konu'}</Text>
        <Text style={styles.contentText} numberOfLines={2}>{item.content || 'Soru içeriği bulunmuyor...'}</Text>
        <View style={styles.badgeRow}>
          <View style={[styles.difficultyBadge, { backgroundColor: item.difficulty === 'zor' ? '#fee2e2' : item.difficulty === 'orta' ? '#fef3c7' : '#dcfce7' }]}>
            <Text style={[styles.difficultyText, { color: item.difficulty === 'zor' ? '#ef4444' : item.difficulty === 'orta' ? '#f59e0b' : '#10b981' }]}>
              {item.difficulty}
            </Text>
          </View>
          <Text style={styles.dateText}>{item.created_at}</Text>
        </View>
      </View>
      <MaterialIcons name="chevron-right" size={24} color="#494455" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#7c4dff" />
        </View>
      ) : (
        <FlatList
          data={questions}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="inventory" size={64} color="#1c1b1b" />
              <Text style={styles.emptyTitle}>Soru Bulunamadı</Text>
              <Text style={styles.emptySubtitle}>{name} havuzunda henüz hiç soru bulunmuyor.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0e0e0e' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 20, paddingBottom: 100 },
  card: { backgroundColor: '#1c1b1b', borderRadius: 20, padding: 12, marginBottom: 16, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  cardImageCont: { width: 70, height: 70, borderRadius: 12, backgroundColor: '#0e0e0e', overflow: 'hidden', marginRight: 12 },
  cardImage: { width: '100%', height: '100%' },
  placeholderImg: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  cardInfo: { flex: 1 },
  topicText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  contentText: { color: '#948ea1', fontSize: 13, marginBottom: 8 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  difficultyBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  difficultyText: { fontSize: 10, fontWeight: 'bold', textTransform: 'capitalize' },
  dateText: { color: '#494455', fontSize: 11 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginTop: 20 },
  emptySubtitle: { color: '#948ea1', fontSize: 14, textAlign: 'center', marginTop: 8, paddingHorizontal: 40 },
});
