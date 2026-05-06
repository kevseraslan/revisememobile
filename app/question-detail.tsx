import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Modal } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import PageWrapper from '../components/PageWrapper';
import { apiService, BASE_URL } from '../services/api';

export default function QuestionDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState<any>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const [newNote, setNewNote] = useState('');
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchQuestion = async () => {
    try {
      setLoading(true);
      const data = await apiService.getQuestionDetails(Number(id));
      if (data.success) {
        setQuestion(data.question);
        setNotes(data.notes || []);
      } else {
        Alert.alert('Hata', data.message || 'Soru yüklenemedi.');
      }
    } catch (error: any) {
      console.error('Fetch Question Error:', error);
      Alert.alert('Bağlantı Hatası', 'Sunucuya ulaşılamıyor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchQuestion();
  }, [id]);

  const handleComplete = async () => {
    try {
      const data = await apiService.markQuestionCompleted(Number(id));
      if (data.success) {
        Alert.alert('Tebrikler!', 'Soru başarıyla tamamlandı.', [{ text: 'Tamam', onPress: () => router.back() }]);
      }
    } catch (error) {
      Alert.alert('Hata', 'İşlem sırasında bir hata oluştu.');
    }
  };

  const handleToggleFavorite = async () => {
    try {
      const data = await apiService.toggleFavorite(Number(id));
      if (data.success) {
        setQuestion({ ...question, is_favorite: !question.is_favorite });
      }
    } catch (error) {
      Alert.alert('Hata', 'Favori işlemi başarısız oldu.');
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Soruyu Sil',
      'Bu soruyu kalıcı olarak silmek istediğinize emin misiniz?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        { 
          text: 'Sil', 
          style: 'destructive', 
          onPress: async () => {
            try {
              const data = await apiService.deleteQuestion(Number(id));
              if (data.success) {
                router.back();
              }
            } catch (error) {
              Alert.alert('Hata', 'Silme işlemi başarısız oldu.');
            }
          } 
        }
      ]
    );
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    setActionLoading(true);
    try {
      const data = await apiService.addNote(Number(id), newNote);
      if (data.success) {
        setNotes([data.note, ...notes]);
        setNewNote('');
        setNoteModalVisible(false);
      }
    } catch (error) {
      Alert.alert('Hata', 'Not eklenemedi.');
    } finally {
      setActionLoading(false);
    }
  };

  const getImageUrl = (path: string) => {
    if (!path) return null;
    const filename = path.split(/[\\/]/).pop();
    return `${BASE_URL}/static/uploads/${filename}`;
  };

  if (loading) {
    return (
      <PageWrapper title="Soru Detayı">
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#7c4dff" />
        </View>
      </PageWrapper>
    );
  }

  if (!question) return null;

  const radius = 45;
  const stroke = 8;
  const circumference = radius * 2 * Math.PI;
  const progressPercent = (question.repeat_count / 3) * 100;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <PageWrapper title="Soru Çöz">
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header Badges */}
        <View style={styles.topHeader}>
          <View style={styles.badgeGroup}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{question.category}</Text>
            </View>
            <View style={styles.difficultyRow}>
              <View style={styles.dot} />
              <Text style={styles.difficultyText}>{question.difficulty}</Text>
            </View>
          </View>
          <View style={styles.topicInfo}>
            <Text style={styles.topicLabel}>KONU</Text>
            <Text style={styles.topicValue}>{question.topic}</Text>
          </View>
        </View>

        {/* Main Question Card */}
        <View style={styles.questionCard}>
          <View style={styles.cardHeader}>
            <TouchableOpacity style={styles.headerIcon} onPress={handleToggleFavorite}>
              <MaterialIcons name={question.is_favorite ? "favorite" : "favorite-border"} size={22} color={question.is_favorite ? "#ef4444" : "#948ea1"} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIcon} onPress={handleDelete}>
              <MaterialIcons name="delete-outline" size={22} color="#948ea1" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIcon}>
              <MaterialIcons name="edit" size={22} color="#948ea1" />
            </TouchableOpacity>
          </View>

          <View style={styles.imageWrapper}>
            {question.image_path ? (
              <Image source={{ uri: getImageUrl(question.image_path)! }} style={styles.questionImage} resizeMode="contain" />
            ) : (
              <View style={styles.placeholderImg}>
                <MaterialIcons name="image" size={64} color="#333" />
                <Text style={styles.placeholderText}>{question.content}</Text>
              </View>
            )}
          </View>

          {/* Action Row */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.skipBtn} onPress={() => router.back()}>
              <MaterialIcons name="fast-forward" size={20} color="#948ea1" />
              <Text style={styles.skipBtnText}>Soruyu Atla</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.failBtn} onPress={() => Alert.alert('Bilgi', 'Soruyu daha sonra tekrar çözmek üzere atladınız.')}>
              <MaterialCommunityIcons name="emoticon-sad-outline" size={20} color="#d97706" />
              <Text style={styles.failBtnText}>Çözemedim</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.successBtn} onPress={handleComplete}>
              <MaterialIcons name="check-circle-outline" size={20} color="#fff" />
              <Text style={styles.successBtnText}>Çözdüm</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Info Grid */}
        <View style={styles.infoGrid}>
          {/* Progress Card */}
          <View style={styles.progressCard}>
            <Text style={styles.infoTitle}>TEKRAR İLERLEMESİ</Text>
            <View style={styles.ringCont}>
              <Svg height="120" width="120" viewBox="0 0 120 120">
                <Circle cx="60" cy="60" r={radius} stroke="rgba(255,255,255,0.05)" strokeWidth={stroke} fill="transparent" />
                <Circle 
                  cx="60" cy="60" r={radius} stroke="#7c4dff" strokeWidth={stroke}
                  strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round" fill="transparent" transform="rotate(-90 60 60)"
                />
              </Svg>
              <View style={styles.ringTextCont}>
                <Text style={styles.ringValue}>{question.progress_text}</Text>
                <Text style={styles.ringLabel}>ADIM</Text>
              </View>
            </View>
            <View style={styles.nextDateBox}>
              <Text style={styles.nextDateLabel}>Sıradaki Tekrar:</Text>
              <Text style={styles.nextDateValue}>{question.next_repeat_date}</Text>
            </View>
          </View>

          {/* Notes Card */}
          <View style={styles.notesCard}>
            <View style={styles.notesHeader}>
              <MaterialIcons name="segment" size={20} color="#7c4dff" />
              <Text style={styles.infoTitle}>Kişisel Notlar</Text>
              <TouchableOpacity 
                style={styles.addNoteBtn} 
                onPress={() => setNoteModalVisible(true)}
              >
                <MaterialIcons name="add" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.notesList}>
              {notes.length > 0 ? notes.map((n: any) => (
                <Text key={n.id} style={styles.noteItem}>• {n.content}</Text>
              )) : (
                <Text style={styles.noNotes}>Bu soruyla ilgili henüz notunuz bulunmuyor...</Text>
              )}
            </ScrollView>
          </View>
        </View>

        {/* Add Note Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={noteModalVisible}
          onRequestClose={() => setNoteModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Not Ekle</Text>
              <TextInput
                style={styles.noteInput}
                placeholder="Notunuzu buraya yazın..."
                placeholderTextColor="#494455"
                multiline
                value={newNote}
                onChangeText={setNewNote}
              />
              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={styles.cancelBtn} 
                  onPress={() => setNoteModalVisible(false)}
                >
                  <Text style={styles.cancelBtnText}>Vazgeç</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.confirmBtn} 
                  onPress={handleAddNote}
                  disabled={actionLoading}
                >
                  {actionLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmBtnText}>Kaydet</Text>}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

      </ScrollView>
    </PageWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 100 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#131313' },
  
  topHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, backgroundColor: 'rgba(255,255,255,0.02)', padding: 16, borderRadius: 20 },
  badgeGroup: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  categoryBadge: { backgroundColor: '#ede9fe', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  categoryText: { color: '#7c4dff', fontWeight: 'bold', fontSize: 13 },
  difficultyRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#f59e0b' },
  difficultyText: { color: '#948ea1', fontSize: 13, fontWeight: '500' },
  topicInfo: { alignItems: 'flex-end' },
  topicLabel: { color: '#948ea1', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
  topicValue: { color: '#fff', fontSize: 15, fontWeight: 'bold' },

  questionCard: { backgroundColor: '#1c1b1b', borderRadius: 32, padding: 24, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  cardHeader: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginBottom: 20 },
  headerIcon: { padding: 8 },
  imageWrapper: { backgroundColor: '#131313', borderRadius: 24, padding: 12, minHeight: 250, justifyContent: 'center', marginBottom: 24 },
  questionImage: { width: '100%', height: 250 },
  placeholderImg: { alignItems: 'center', padding: 20 },
  placeholderText: { color: '#948ea1', textAlign: 'center', marginTop: 12, fontSize: 15, lineHeight: 22 },

  actionRow: { flexDirection: 'row', gap: 10 },
  skipBtn: { flex: 1, height: 50, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  skipBtnText: { color: '#948ea1', fontWeight: 'bold', fontSize: 12 },
  failBtn: { flex: 1.2, height: 50, backgroundColor: 'rgba(217, 119, 6, 0.1)', borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1, borderColor: 'rgba(217, 119, 6, 0.2)' },
  failBtnText: { color: '#d97706', fontWeight: 'bold', fontSize: 12 },
  successBtn: { flex: 1.5, height: 50, backgroundColor: '#059669', borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  successBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },

  infoGrid: { gap: 16 },
  progressCard: { backgroundColor: '#1c1b1b', borderRadius: 32, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  infoTitle: { color: '#948ea1', fontSize: 12, fontWeight: 'bold', letterSpacing: 1, marginBottom: 20, textTransform: 'uppercase' },
  ringCont: { position: 'relative', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  ringTextCont: { position: 'absolute', alignItems: 'center' },
  ringValue: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  ringLabel: { color: '#948ea1', fontSize: 10, fontWeight: 'bold' },
  nextDateBox: { backgroundColor: 'rgba(255,255,255,0.02)', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 16, alignItems: 'center' },
  nextDateLabel: { color: '#948ea1', fontSize: 11, marginBottom: 4 },
  nextDateValue: { color: '#fff', fontSize: 14, fontWeight: 'bold' },

  notesCard: { backgroundColor: '#1c1b1b', borderRadius: 32, padding: 24, minHeight: 200, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  notesHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  addNoteBtn: { marginLeft: 'auto', backgroundColor: '#7c4dff', width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  notesList: { flex: 1 },
  noteItem: { color: '#e5e2e1', fontSize: 14, lineHeight: 22, marginBottom: 8 },
  noNotes: { color: '#494455', fontSize: 13, fontStyle: 'italic', textAlign: 'center', marginTop: 20 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#1c1b1b', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  noteInput: { backgroundColor: '#131313', borderRadius: 16, padding: 16, color: '#fff', minHeight: 120, textAlignVertical: 'top', marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  modalActions: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  cancelBtnText: { color: '#948ea1', fontWeight: 'bold' },
  confirmBtn: { flex: 2, height: 50, backgroundColor: '#7c4dff', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  confirmBtnText: { color: '#fff', fontWeight: 'bold' }
});
