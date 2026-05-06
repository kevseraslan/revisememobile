import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import PageWrapper from '../components/PageWrapper';

export default function AIQuizScreen() {
  const [quizStarted, setQuizStarted] = useState(false);

  return (
    <PageWrapper title="AI Quiz">
      <View style={styles.container}>
        {!quizStarted ? (
          <View style={styles.startSection}>
            <LinearGradient colors={['#7c4dff', '#4c1d95']} style={styles.heroCard}>
              <MaterialIcons name="psychology" size={64} color="#fff" />
              <Text style={styles.heroTitle}>Kişiselleştirilmiş AI Sınavı</Text>
              <Text style={styles.heroSubtitle}>Zayıf olduğun konuları tespit eder ve seni geliştirir.</Text>
            </LinearGradient>
            <TouchableOpacity style={styles.startBtn} onPress={() => setQuizStarted(true)}>
              <Text style={styles.startBtnText}>Sınavı Başlat</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.questionSection}>
            <Text style={styles.qText}>1. Fonksiyonun x=2 noktasındaki türevi nedir?</Text>
            <TouchableOpacity style={styles.option}><Text style={styles.optText}>A) 10</Text></TouchableOpacity>
            <TouchableOpacity style={styles.option}><Text style={styles.optText}>B) 20</Text></TouchableOpacity>
            <TouchableOpacity style={styles.option}><Text style={styles.optText}>C) 30</Text></TouchableOpacity>
          </View>
        )}
      </View>
    </PageWrapper>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, flex: 1 },
  startSection: { flex: 1, justifyContent: 'center' },
  heroCard: { padding: 32, borderRadius: 32, alignItems: 'center', marginBottom: 40 },
  heroTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginTop: 16 },
  heroSubtitle: { color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginTop: 8 },
  startBtn: { backgroundColor: '#7c4dff', height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  startBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  questionSection: { gap: 16 },
  qText: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 24 },
  option: { backgroundColor: '#1c1b1b', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  optText: { color: '#fff' }
});
