import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View, TextInput } from 'react-native';
import PageWrapper from '../components/PageWrapper';
import { apiService } from '../services/api';

export default function AddQuestionScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  
  // Form State
  const [selectedCategory, setSelectedCategory] = useState('');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('Orta');
  const [explanation, setExplanation] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<any>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await apiService.getCategories();
      setCategories(data || []);
    } catch (error) {
      console.error('Fetch Categories Error:', error);
    }
  };

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
      setImageFile({
        uri: Platform.OS === 'ios' ? selectedImage.uri.replace('file://', '') : selectedImage.uri,
        name: 'question.jpg',
        type: 'image/jpeg',
      });
    }
  };

  const handleSave = async () => {
    if (!selectedCategory || !topic || !difficulty) {
      Alert.alert('Uyarı', 'Lütfen ders, konu ve zorluk seviyesini seçin.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('category', selectedCategory);
      formData.append('topic', topic);
      formData.append('difficulty', difficulty);
      formData.append('content', explanation);
      
      if (imageFile) {
        formData.append('question_image', imageFile as any);
      }

      const result = await apiService.addQuestion(formData);
      
      if (result.success) {
        Alert.alert('Başarılı', 'Soru başarıyla eklendi.', [
          { text: 'Tamam', onPress: () => router.replace('/home') }
        ]);
      } else {
        Alert.alert('Hata', result.message || 'Soru eklenirken bir hata oluştu.');
      }
    } catch (error) {
      console.error('Add Question Error:', error);
      Alert.alert('Hata', 'Bağlantı hatası oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper title="Soru Ekle">
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          <View style={styles.header}>
            <Text style={styles.title}>Yeni Soru Hazırla</Text>
            <Text style={styles.subtitle}>Lütfen sorunun detaylarını aşağıya giriniz.</Text>
          </View>

          {/* Form Fields */}
          <View style={styles.formContainer}>
            
            {/* Category Select */}
            <Text style={styles.label}>Kategori / Ders Seçiniz</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              {categories.map((cat) => (
                <TouchableOpacity 
                  key={cat.id} 
                  style={[
                    styles.categoryChip, 
                    selectedCategory === String(cat.id) && styles.categoryChipSelected
                  ]}
                  onPress={() => setSelectedCategory(String(cat.id))}
                >
                  <Text style={[
                    styles.categoryText,
                    selectedCategory === String(cat.id) && styles.categoryTextSelected
                  ]}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Topic Input */}
            <Text style={styles.label}>Konu Yazınız</Text>
            <TextInput 
              style={styles.input}
              placeholder="Örn: Türev, Sindirim Sistemi..."
              placeholderTextColor="#666"
              value={topic}
              onChangeText={setTopic}
            />

            {/* Difficulty Radio */}
            <Text style={styles.label}>Zorluk Seviyesi</Text>
            <View style={styles.difficultyContainer}>
              {['Kolay', 'Orta', 'Zor'].map((level) => (
                <TouchableOpacity 
                  key={level}
                  style={[
                    styles.difficultyButton,
                    difficulty === level && styles.difficultyButtonSelected,
                    difficulty === level && level === 'Kolay' && { backgroundColor: '#10b981' },
                    difficulty === level && level === 'Orta' && { backgroundColor: '#f59e0b' },
                    difficulty === level && level === 'Zor' && { backgroundColor: '#ef4444' },
                  ]}
                  onPress={() => setDifficulty(level)}
                >
                  <Text style={[
                    styles.difficultyText,
                    difficulty === level && styles.difficultyTextSelected
                  ]}>{level}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Explanation Input */}
            <Text style={styles.label}>Açıklama / Soru Metni</Text>
            <TextInput 
              style={[styles.input, styles.textArea]}
              placeholder="Soruyla ilgili eklemek istediğiniz metin veya notları buraya yazınız..."
              placeholderTextColor="#666"
              multiline
              numberOfLines={4}
              value={explanation}
              onChangeText={setExplanation}
            />

            {/* Image Upload Area */}
            <Text style={styles.label}>Soru Görseli</Text>
            <View style={styles.uploadContainer}>
              {image ? (
                <TouchableOpacity style={styles.imagePreviewContainer} onPress={() => pickImage()}>
                  <MaterialIcons name="edit" size={24} color="#fff" style={styles.editIcon} />
                  <Text style={styles.imagePlaceholderText}>Görsel Seçildi</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.actionButtons}>
                  <TouchableOpacity style={styles.uploadBox} onPress={() => pickImage(true)}>
                    <MaterialIcons name="photo-camera" size={32} color="#7c4dff" />
                    <Text style={styles.uploadBoxText}>Kamera</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.uploadBox} onPress={() => pickImage(false)}>
                    <MaterialIcons name="photo-library" size={32} color="#00daf3" />
                    <Text style={styles.uploadBoxText}>Galeri</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

          </View>

          {/* Submit Button */}
          <TouchableOpacity 
            style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <MaterialIcons name="save" size={20} color="#fff" />
                <Text style={styles.submitButtonText}>Soru Ekle</Text>
              </>
            )}
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </PageWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#948ea1',
    lineHeight: 20,
  },
  formContainer: {
    gap: 16,
  },
  label: {
    color: '#cac3d8',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 8,
  },
  categoryScroll: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#1c1b1b',
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  categoryChipSelected: {
    backgroundColor: '#7c4dff',
    borderColor: '#7c4dff',
  },
  categoryText: {
    color: '#948ea1',
    fontSize: 14,
    fontWeight: '600',
  },
  categoryTextSelected: {
    color: '#fff',
  },
  input: {
    backgroundColor: '#1c1b1b',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  difficultyContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  difficultyButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#1c1b1b',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  difficultyButtonSelected: {
    borderColor: 'transparent',
  },
  difficultyText: {
    color: '#948ea1',
    fontSize: 12,
    fontWeight: 'bold',
  },
  difficultyTextSelected: {
    color: '#fff',
  },
  uploadContainer: {
    height: 120,
    backgroundColor: '#1c1b1b',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#333',
    borderStyle: 'dashed',
    justifyContent: 'center',
    marginBottom: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  uploadBox: {
    alignItems: 'center',
    gap: 8,
  },
  uploadBoxText: {
    color: '#948ea1',
    fontSize: 12,
    fontWeight: '600',
  },
  imagePreviewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(124, 77, 255, 0.1)',
    borderRadius: 20,
  },
  editIcon: {
    marginBottom: 4,
  },
  imagePlaceholderText: {
    color: '#7c4dff',
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#6200ee',
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 20,
    shadowColor: '#6200ee',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
