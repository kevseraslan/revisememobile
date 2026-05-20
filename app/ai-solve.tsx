import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import PageWrapper from '../components/PageWrapper';
import { apiService } from '../services/api';

export default function AISolveScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);

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

  const handleAIAnalysis = async (imageAsset: any) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', {
        uri: Platform.OS === 'ios' ? imageAsset.uri.replace('file://', '') : imageAsset.uri,
        name: 'question.jpg',
        type: 'image/jpeg',
      } as any);

      const result = await apiService.solveImage(formData);

      if (!result || typeof result !== 'object') {
        Alert.alert('Hata', 'Yapay zeka yanıtı boş döndü.');
        return;
      }

      if (!result.detected_text && !result.topic) {
        Alert.alert('Hata', 'Soru analiz edilemedi. Lütfen daha net bir fotoğraf çekin.');
        return;
      }

      // Sonucu servise kaydet (büyük veri olduğu için URL'den geçmiyoruz)
      apiService.setLastAnalysis(result);

      // Analiz bittiğinde sonuç sayfasına yönlendir
      router.push({
        pathname: '/solve-question',
        params: {
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
            <Text style={styles.title}>AI ile Soru Çöz</Text>
            <Text style={styles.subtitle}>Sorunun fotoğrafını çekin, yapay zeka saniyeler içinde çözsün ve havuzunuza eklesin.</Text>
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
                  <MaterialIcons name="photo-camera" size={48} color="#7c4dff" />
                  <Text style={styles.uploadBoxText}>Kamera</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.uploadBox} onPress={() => pickImage(false)}>
                  <MaterialIcons name="photo-library" size={48} color="#00daf3" />
                  <Text style={styles.uploadBoxText}>Galeri</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Info Cards */}
          <View style={styles.infoCard}>
            <MaterialIcons name="auto-fix-high" size={24} color="#ffd54f" />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Gemini 2.5 Flash Gücü</Text>
              <Text style={styles.infoText}>
                En son teknoloji yapay zeka ile karmaşık soruları metne döker, analiz eder ve adım adım çözüm üretir.
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>İpuçları</Text>
            <View style={styles.tipItem}>
              <MaterialIcons name="lightbulb" size={20} color="#ffd54f" />
              <Text style={styles.tipItemText}>Sorunun net ve tam göründüğünden emin olun.</Text>
            </View>
            <View style={styles.tipItem}>
              <MaterialIcons name="lightbulb" size={20} color="#ffd54f" />
              <Text style={styles.tipItemText}>Yazılı metinler el yazısına göre daha hızlı analiz edilir.</Text>
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
    height: 240,
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
    gap: 16,
    backgroundColor: 'rgba(255,255,255,0.02)',
    padding: 24,
    borderRadius: 24,
    width: 120,
  },
  uploadBoxText: {
    color: '#e5e2e1',
    fontSize: 14,
    fontWeight: 'bold',
  },
  loadingOverlay: {
    alignItems: 'center',
    gap: 20,
  },
  loadingText: {
    color: '#7c4dff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(124, 77, 255, 0.1)',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    gap: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(124, 77, 255, 0.2)',
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    color: '#cdbdff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  infoText: {
    color: '#948ea1',
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
    gap: 12,
    backgroundColor: '#1c1b1b',
    padding: 16,
    borderRadius: 20,
  },
  tipItemText: {
    color: '#cac3d8',
    fontSize: 14,
  }
});
