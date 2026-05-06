import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform, ActivityIndicator, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import PageWrapper from '../components/PageWrapper';
import { apiService } from '../services/api';

type TimerMode = 'pomodoro' | 'short_break' | 'long_break';

export default function PomodoroScreen() {
  const router = useRouter();
  
  // Settings State
  const [studyTime, setStudyTime] = useState('25');
  const [shortBreak, setShortBreak] = useState('5');
  const [longBreak, setLongBreak] = useState('15');
  
  // Timer State
  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [sessionCount, setSessionCount] = useState(1);
  
  // Backend Data State
  const [activeTask, setActiveTask] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Verileri Çek
  const fetchData = async () => {
    try {
      const data = await apiService.getTimerData();
      if (data.success) {
        setActiveTask(data.active_task);
        setHistory(data.pomodoro_history || []);
      }
    } catch (error) {
      console.error('Fetch Timer Data Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Timer Mantığı
  useEffect(() => {
    if (isActive && secondsLeft > 0) {
      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0) {
      handleSessionComplete();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, secondsLeft]);

  const handleSessionComplete = async () => {
    setIsActive(false);
    
    // Backend'e Kaydet
    try {
      const duration = mode === 'pomodoro' ? parseInt(studyTime) : mode === 'short_break' ? parseInt(shortBreak) : parseInt(longBreak);
      await apiService.savePomodoroSession(duration, mode);
      fetchData(); // Geçmişi güncelle
      
      Alert.alert(
        mode === 'pomodoro' ? 'Tebrikler!' : 'Mola Bitti',
        mode === 'pomodoro' ? 'Bir odaklanma oturumunu başarıyla tamamladın.' : 'Şimdi tekrar odaklanma vakti!',
        [{ text: 'Tamam' }]
      );

      // Otomatik mod geçişi
      if (mode === 'pomodoro') {
        if (sessionCount % 4 === 0) {
          switchMode('long_break');
        } else {
          switchMode('short_break');
        }
        setSessionCount(prev => prev + 1);
      } else {
        switchMode('pomodoro');
      }
    } catch (error) {
      console.error('Save Session Error:', error);
    }
  };

  const switchMode = (newMode: TimerMode) => {
    setMode(newMode);
    setIsActive(false);
    if (newMode === 'pomodoro') setSecondsLeft(parseInt(studyTime) * 60);
    else if (newMode === 'short_break') setSecondsLeft(parseInt(shortBreak) * 60);
    else if (newMode === 'long_break') setSecondsLeft(parseInt(longBreak) * 60);
  };

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    if (mode === 'pomodoro') setSecondsLeft(parseInt(studyTime) * 60);
    else if (mode === 'short_break') setSecondsLeft(parseInt(shortBreak) * 60);
    else if (mode === 'long_break') setSecondsLeft(parseInt(longBreak) * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <PageWrapper title="Pomodoro Sayaç">
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#7c4dff" />
        </View>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="Pomodoro Sayaç">
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Session Indicator */}
        <View style={styles.sessionContainer}>
          <View style={styles.dotsRow}>
            {[1, 2, 3, 4].map((i) => (
              <View key={i} style={[styles.dot, (sessionCount % 4 || 4) >= i && styles.dotActive]} />
            ))}
          </View>
          <Text style={styles.sessionLabel}>OTURUM {sessionCount % 4 || 4} / 4</Text>
        </View>

        {/* Circular Timer */}
        <View style={styles.timerContainer}>
          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={toggleTimer}
            style={[styles.timerOuterRing, isActive && { borderColor: '#7c4dff' }]}
          >
            <View style={styles.timerInnerContent}>
              <Text style={styles.timerText}>{formatTime(secondsLeft)}</Text>
              <Text style={styles.timerStatus}>
                {mode === 'pomodoro' ? 'FOCUS TIME' : mode === 'short_break' ? 'SHORT BREAK' : 'LONG BREAK'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Active Task Info */}
        {activeTask && (
          <View style={styles.activeTaskCard}>
            <View style={styles.activeTaskHeader}>
              <MaterialIcons name="assignment" size={16} color="#7c4dff" />
              <Text style={styles.activeTaskLabel}>ŞU AN ODAKLANILAN GÖREV</Text>
            </View>
            <Text style={styles.activeTaskTitle}>{activeTask.title}</Text>
            <Text style={styles.activeTaskCategory}>{activeTask.category}</Text>
          </View>
        )}

        {/* Timer Controls */}
        <View style={styles.controlsRow}>
          <TouchableOpacity style={styles.controlBtnSmall} onPress={resetTimer}>
            <MaterialIcons name="replay" size={32} color="#948ea1" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.playBtnContainer} onPress={toggleTimer}>
            <LinearGradient
              colors={['#7c4dff', '#0068ed']}
              style={styles.playBtn}
            >
              <MaterialIcons name={isActive ? "pause" : "play-arrow"} size={48} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlBtnSmall} onPress={handleSessionComplete}>
            <MaterialIcons name="skip-next" size={32} color="#948ea1" />
          </TouchableOpacity>
        </View>

        {/* Mode Selector */}
        <View style={styles.modeSelector}>
          <TouchableOpacity 
            style={[styles.modeBtn, mode === 'pomodoro' && styles.modeBtnActive]} 
            onPress={() => switchMode('pomodoro')}
          >
            <Text style={[styles.modeBtnText, mode === 'pomodoro' && styles.modeBtnTextActive]}>Pomodoro</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.modeBtn, mode === 'short_break' && styles.modeBtnActive]} 
            onPress={() => switchMode('short_break')}
          >
            <Text style={[styles.modeBtnText, mode === 'short_break' && styles.modeBtnTextActive]}>Kısa Mola</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.modeBtn, mode === 'long_break' && styles.modeBtnActive]} 
            onPress={() => switchMode('long_break')}
          >
            <Text style={[styles.modeBtnText, mode === 'long_break' && styles.modeBtnTextActive]}>Uzun Mola</Text>
          </TouchableOpacity>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Süre Ayarları</Text>
          <View style={styles.settingsCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>ÇALIŞMA SÜRESİ (DK)</Text>
              <TextInput 
                style={styles.input} 
                value={studyTime} 
                onChangeText={(text) => {
                  setStudyTime(text);
                  if (mode === 'pomodoro' && !isActive) setSecondsLeft(parseInt(text || '0') * 60);
                }}
                keyboardType="numeric"
                placeholderTextColor="#353534"
              />
            </View>
            
            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>KISA MOLA</Text>
                <TextInput 
                  style={styles.input} 
                  value={shortBreak} 
                  onChangeText={(text) => {
                    setShortBreak(text);
                    if (mode === 'short_break' && !isActive) setSecondsLeft(parseInt(text || '0') * 60);
                  }}
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 16 }]}>
                <Text style={styles.inputLabel}>UZUN MOLA</Text>
                <TextInput 
                  style={styles.input} 
                  value={longBreak} 
                  onChangeText={(text) => {
                    setLongBreak(text);
                    if (mode === 'long_break' && !isActive) setSecondsLeft(parseInt(text || '0') * 60);
                  }}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>
        </View>

        {/* History Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Oturum Geçmişi</Text>
          <View style={styles.historyCard}>
            {history.length > 0 ? history.map((item, index) => (
              <View key={index} style={[styles.historyItem, index !== 0 && { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' }]}>
                <View style={styles.historyItemLeft}>
                  <View style={styles.historyIconBg}>
                    <MaterialIcons name="check-circle" size={24} color="#cdbdff" />
                  </View>
                  <View>
                    <Text style={styles.historyTitle}>Pomodoro Oturumu</Text>
                    <Text style={styles.historyTime}>{item.created_at}</Text>
                  </View>
                </View>
                <Text style={styles.historyDuration}>{item.duration} dk</Text>
              </View>
            )) : (
              <View style={styles.historyItem}>
                <Text style={styles.historyTime}>Henüz tamamlanmış oturum yok.</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </PageWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 120 },
  sessionContainer: { alignItems: 'center', marginBottom: 32 },
  dotsRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#494455' },
  dotActive: { backgroundColor: '#7c4dff' },
  sessionLabel: { color: '#cac3d8', fontSize: 12, fontWeight: '600', letterSpacing: 2 },
  timerContainer: { alignItems: 'center', marginBottom: 40 },
  timerOuterRing: { 
    width: 250, height: 250, borderRadius: 125, borderWidth: 4, borderColor: '#494455',
    alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(30,30,30,0.5)'
  },
  timerInnerContent: { alignItems: 'center' },
  timerText: { fontSize: 56, fontWeight: 'bold', color: '#fff' },
  timerStatus: { fontSize: 10, color: '#7c4dff', fontWeight: '800', letterSpacing: 3, marginTop: 8 },
  activeTaskCard: { 
    backgroundColor: 'rgba(124, 77, 255, 0.05)', borderRadius: 20, padding: 20, 
    marginBottom: 32, borderWidth: 1, borderColor: 'rgba(124, 77, 255, 0.2)'
  },
  activeTaskHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  activeTaskLabel: { fontSize: 10, color: '#7c4dff', fontWeight: '800' },
  activeTaskTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  activeTaskCategory: { color: '#948ea1', fontSize: 12, marginTop: 2 },
  controlsRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 40, marginBottom: 40 },
  controlBtnSmall: { padding: 8 },
  playBtnContainer: { shadowColor: '#7c4dff', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20 },
  playBtn: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  modeSelector: { flexDirection: 'row', backgroundColor: '#201f1f', borderRadius: 16, padding: 4, marginBottom: 32 },
  modeBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12 },
  modeBtnActive: { backgroundColor: 'rgba(124, 77, 255, 0.15)' },
  modeBtnText: { color: '#948ea1', fontSize: 12, fontWeight: '600' },
  modeBtnTextActive: { color: '#7c4dff' },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 16 },
  settingsCard: { backgroundColor: '#201f1f', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)' },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 11, color: '#948ea1', fontWeight: '700', marginBottom: 8 },
  input: { backgroundColor: '#0e0e0e', borderWidth: 1, borderColor: '#494455', borderRadius: 12, padding: 12, color: '#fff', fontSize: 16 },
  inputRow: { flexDirection: 'row' },
  historyCard: { backgroundColor: '#201f1f', borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)' },
  historyItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  historyItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  historyIconBg: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(205, 189, 255, 0.1)', alignItems: 'center', justifyContent: 'center' },
  historyTitle: { fontSize: 15, fontWeight: '700', color: '#fff' },
  historyTime: { fontSize: 11, color: '#948ea1', marginTop: 2 },
  historyDuration: { color: '#cdbdff', fontSize: 13, fontWeight: '800' },
});
