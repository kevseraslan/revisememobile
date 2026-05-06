import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import PageWrapper from '../components/PageWrapper';
import { apiService } from '../services/api';

export default function AddQuestionScreen() {
  const router = useRouter();
  const [difficulty, setDifficulty] = useState('orta');
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);

  const pickImage = async (useCamera = false) => {
    let result;
    if (useCamera) {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Hata', 'Kamera izni gerekli!');
        return;
      }
      result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Hata', 'Galeri izni gerekli!');
        return;
      }
      result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        quality: 0.8,
      });
    }

    if (!result.canceled) {
      const selectedImage = result.assets[0];
      setImage(selectedImage.uri);
      handleAIAnalysis(selectedImage);
    }
  };

  const handleAIAnalysis = async (imageAsset) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', {
        uri: Platform.OS === 'ios' ? imageAsset.uri.replace('file://', '') : imageAsset.uri,
        name: 'question.jpg',
        type: 'image/jpeg',
      } as any);

      const result = await apiService.solveImage(formData);

      // Analiz bittiğinde sonuç sayfasına yönlendir
      router.push({
        pathname: '/solve-question',
        params: {
          analysisResult: JSON.stringify(result),
          imageUri: imageAsset.uri
        }
      });
    } catch (error) {
      console.error('AI Analysis Error:', error);
      Alert.alert('Hata', 'Yapay zeka analizi sırasında bir sorun oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper title="AI Soru Çöz">
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          <View style={styles.header}>
            <Text style={styles.title}>Yeni Soru Analiz Et</Text>
            <Text style={styles.subtitle}>Görseli yükle, yapay zeka saniyeler içinde çözsün.</Text>
          </View>

          {/* Upload Area */}
          <View style={styles.uploadContainer}>
            {loading ? (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#7c4dff" />
                <Text style={styles.loadingText}>Yapay Zeka Analiz Ediyor...</Text>
              </View>
            ) : (
              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.uploadBox} onPress={() => pickImage(true)}>
                  <MaterialIcons name="photo-camera" size={40} color="#7c4dff" />
                  <Text style={styles.uploadBoxText}>Kamera</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.uploadBox} onPress={() => pickImage(false)}>
                  <MaterialIcons name="photo-library" size={40} color="#00daf3" />
                  <Text style={styles.uploadBoxText}>Galeri</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Info Card */}
          <View style={styles.infoCard}>
            <MaterialIcons name="lightbulb" size={24} color="#ffd54f" />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Nasıl Çalışır?</Text>
              <Text style={styles.infoText}>
                Sorunun fotoğrafını çekin veya yükleyin. Gemini AI soruyu metne döker, konuyu belirler ve adım adım çözüm üretir.
              </Text>
            </View>
          </View>

          {/* Tips Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>En İyi Sonuç İçin</Text>
            <View style={styles.tipItem}>
              <MaterialIcons name="check-circle" size={18} color="#22c55e" />
              <Text style={styles.tipItemText}>Sorunun tamamını kareye alın.</Text>
            </View>
            <View style={styles.tipItem}>
              <MaterialIcons name="check-circle" size={18} color="#22c55e" />
              <Text style={styles.tipItemText}>Yeterli ışık olduğundan emin olun.</Text>
            </View>
            <View style={styles.tipItem}>
              <MaterialIcons name="check-circle" size={18} color="#22c55e" />
              <Text style={styles.tipItemText}>Yazıların net ve okunur olması önemlidir.</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </PageWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 120,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#948ea1',
    lineHeight: 22,
  },
  uploadContainer: {
    height: 200,
    backgroundColor: '#1c1b1b',
    borderRadius: 32,
    borderWidth: 2,
    borderColor: 'rgba(124, 77, 255, 0.2)',
    borderStyle: 'dashed',
    justifyContent: 'center',
    marginBottom: 32,
    overflow: 'hidden',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  uploadBox: {
    alignItems: 'center',
    gap: 12,
  },
  uploadBoxText: {
    color: '#e5e2e1',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingOverlay: {
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: '#7c4dff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 213, 79, 0.1)',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    gap: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 213, 79, 0.2)',
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    color: '#ffd54f',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  infoText: {
    color: '#cac3d8',
    fontSize: 13,
    lineHeight: 18,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#1c1b1b',
    padding: 12,
    borderRadius: 16,
  },
  tipItemText: {
    color: '#948ea1',
    fontSize: 14,
  }
});
