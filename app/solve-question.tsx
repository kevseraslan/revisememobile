import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Alert, Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import PageWrapper from '../components/PageWrapper';
import { apiService } from '../services/api';

export default function SolveQuestionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(false);

  // Params'dan gelen verileri ayrıştır
  const analysisResult = params.analysisResult ? JSON.parse(params.analysisResult as string) : null;
  const imageUri = params.imageUri as string;

  const handleSave = async () => {
    if (!analysisResult) return;

    setLoading(true);
    try {
      // Backend'e kaydetme isteği
      const formData = new FormData();
      formData.append('detected_text', analysisResult.detected_text);
      formData.append('subject', analysisResult.subject);
      formData.append('topic', analysisResult.topic);
      formData.append('difficulty', analysisResult.difficulty);
      formData.append('solution_steps', JSON.stringify(analysisResult.solution_steps));
      formData.append('final_answer', analysisResult.final_answer);

      // Resim varsa onu da gönder
      if (imageUri) {
        formData.append('image', {
          uri: Platform.OS === 'ios' ? imageUri.replace('file://', '') : imageUri,
          name: 'solved_question.jpg',
          type: 'image/jpeg',
        } as any);
      }

      await apiService.addQuestion(formData);
      Alert.alert('Başarılı', 'Soru başarıyla havuzunuza eklendi!', [
        { text: 'Tamam', onPress: () => router.replace('/home') }
      ]);
    } catch (error) {
      console.error('Save Question Error:', error);
      Alert.alert('Hata', 'Soru kaydedilirken bir sorun oluştu.');
    } finally {
      setLoading(false);
    }
  };

  if (!analysisResult) {
    return (
      <PageWrapper title="Soru Çözümü">
        <View style={styles.centerContainer}>
          <Text style={{ color: '#fff' }}>Analiz verisi bulunamadı.</Text>
        </View>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="Soru Çözümü">
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Question Image */}
        {imageUri && (
          <View style={styles.imageCard}>
            <Image source={{ uri: imageUri }} style={styles.questionImage} resizeMode="contain" />
          </View>
        )}

        {/* Question Text Analysis */}
        <View style={styles.analysisCard}>
          <View style={styles.cardHeader}>
            <View style={styles.badgeRow}>
              <View style={styles.subjectBadge}>
                <Text style={styles.subjectText}>{analysisResult.subject}</Text>
              </View>
              <View style={[styles.difficultyBadge, { backgroundColor: analysisResult.difficulty === 'zor' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)' }]}>
                <Text style={[styles.difficultyText, { color: analysisResult.difficulty === 'zor' ? '#ef4444' : '#22c55e' }]}>
                  {analysisResult.difficulty.toUpperCase()}
                </Text>
              </View>
            </View>
            <Text style={styles.topicText}>{analysisResult.topic}</Text>
          </View>
          <Text style={styles.detectedText}>{analysisResult.detected_text}</Text>
        </View>

        {/* AI Solution Steps */}
        <View style={styles.solutionSection}>
          <Text style={styles.sectionTitle}>Adım Adım Çözüm</Text>
          {analysisResult.solution_steps.map((step, index) => (
            <View key={index} style={styles.stepCard}>
              <View style={styles.stepNumberContainer}>
                <Text style={styles.stepNumber}>{index + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>

        {/* Final Answer */}
        <View style={styles.finalAnswerCard}>
          <LinearGradient colors={['#7c4dff', '#4c1d95']} style={styles.finalAnswerGradient}>
            <Text style={styles.finalAnswerLabel}>DOĞRU CEVAP</Text>
            <Text style={styles.finalAnswerText}>{analysisResult.final_answer}</Text>
          </LinearGradient>
        </View>

        {/* Actions */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : (
              <>
                <MaterialIcons name="save" size={24} color="#fff" />
                <Text style={styles.saveButtonText}>Soru Havuzuna Ekle</Text>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
            <Text style={styles.retryButtonText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </PageWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 120,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageCard: {
    backgroundColor: '#1c1b1b',
    borderRadius: 24,
    padding: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  questionImage: {
    width: '100%',
    height: 250,
    borderRadius: 16,
  },
  analysisCard: {
    backgroundColor: '#1c1b1b',
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  cardHeader: {
    marginBottom: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  subjectBadge: {
    backgroundColor: 'rgba(124, 77, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  subjectText: {
    color: '#cdbdff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  topicText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  detectedText: {
    color: '#948ea1',
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  solutionSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  stepCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  stepNumberContainer: {
    width: 28,
    height: 28,
    backgroundColor: '#7c4dff',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumber: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepText: {
    flex: 1,
    color: '#e5e2e1',
    fontSize: 15,
    lineHeight: 22,
  },
  finalAnswerCard: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 32,
  },
  finalAnswerGradient: {
    padding: 24,
    alignItems: 'center',
  },
  finalAnswerLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 8,
  },
  finalAnswerText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  actionButtons: {
    gap: 12,
  },
  saveButton: {
    height: 64,
    backgroundColor: '#7c4dff',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  retryButton: {
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  retryButtonText: {
    color: '#948ea1',
    fontSize: 16,
    fontWeight: '600',
  }
});
