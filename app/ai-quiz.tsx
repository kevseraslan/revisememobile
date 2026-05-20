import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import PageWrapper from '../components/PageWrapper';
import { apiService } from '../services/api';
import { useRouter } from 'expo-router';

export default function AIQuizScreen() {
  const router = useRouter();
  const [quizStarted, setQuizStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [quizFinished, setQuizFinished] = useState(false);

  const startQuiz = async () => {
    setLoading(true);
    setQuizStarted(true);
    try {
      const response = await apiService.getAIQuiz();
      if (response.success && response.quiz) {
        setQuestions(response.quiz);
      } else {
        Alert.alert('Bilgi', response.error || 'Soru üretilemedi.');
        setQuizStarted(false);
      }
    } catch (error: any) {
      console.error('AI Quiz Error:', error);
      let errorMsg = 'Sınav oluşturulurken bir hata oluştu.';
      if (error.code === 'ECONNABORTED') {
        errorMsg = 'Yapay zeka yanıt vermede gecikti. Lütfen tekrar deneyin.';
      } else if (error.response && error.response.status === 401) {
        errorMsg = 'Oturum süreniz dolmuş olabilir. Lütfen tekrar giriş yapın.';
      } else if (error.message) {
        errorMsg = `Bağlantı hatası: ${error.message}`;
      }
      Alert.alert('Hata', errorMsg);
      setQuizStarted(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (index: number) => {
    if (isAnswered) return;
    setSelectedOptionIndex(index);
  };

  const handleAnswer = () => {
    if (selectedOptionIndex === null) return;
    setIsAnswered(true);

    const currentQ = questions[currentIndex];
    const selectedLetter = String.fromCharCode(65 + selectedOptionIndex); // 0=A, 1=B, etc.
    
    if (selectedLetter === currentQ.correct_answer) {
      setScore(score + 1);
    }

    setUserAnswers(prev => {
      const newAnswers = [...prev];
      newAnswers[currentIndex] = selectedOptionIndex;
      return newAnswers;
    });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOptionIndex(null);
      setIsAnswered(false);
    } else {
      setQuizFinished(true);
    }
  };

  const resetQuiz = () => {
    setQuizStarted(false);
    setQuizFinished(false);
    setQuestions([]);
    setCurrentIndex(0);
    setScore(0);
    setUserAnswers([]);
    setSelectedOptionIndex(null);
    setIsAnswered(false);
  };

  if (loading) {
    return (
      <PageWrapper title="AI Quiz">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7c4dff" />
          <Text style={styles.loadingTitle}>Yapay Zeka Hazırlanıyor</Text>
          <Text style={styles.loadingSubtitle}>
            Geçmiş başarı ve hatalarınız analiz ediliyor. Size özel sorular üretiliyor...
          </Text>
        </View>
      </PageWrapper>
    );
  }

  if (quizFinished) {
    return (
      <PageWrapper title="AI Quiz Sonuç">
        <ScrollView style={styles.resultContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.resultHeader}>
            <MaterialCommunityIcons name="trophy" size={80} color="#ffd54f" style={{ marginBottom: 20 }} />
            <Text style={styles.resultTitle}>Sınav Tamamlandı!</Text>
            <Text style={styles.resultScore}>
              Doğru Sayısı: <Text style={{ color: '#10b981' }}>{score}</Text> / {questions.length}
            </Text>
          </View>

          <View style={styles.resultsList}>
            {questions.map((q, idx) => {
              const userAnswerIndex = userAnswers[idx];
              const correctAnswerLetter = q.correct_answer;
              const correctAnswerIndex = correctAnswerLetter.charCodeAt(0) - 65;
              const isCorrect = userAnswerIndex === correctAnswerIndex;

              return (
                <View key={idx} style={styles.resultCard}>
                  <View style={styles.resCardHeader}>
                    <Text style={styles.resCardNum}>Soru {idx + 1}</Text>
                    <View style={[styles.resStatusBadge, { backgroundColor: isCorrect ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' }]}>
                      <Text style={{ color: isCorrect ? '#10b981' : '#ef4444', fontSize: 12, fontWeight: 'bold' }}>
                        {isCorrect ? 'DOĞRU' : 'YANLIŞ'}
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={styles.resQuestionText}>{q.question}</Text>
                  
                  <View style={styles.resAnswersSection}>
                    <View style={[styles.resAnswerRow, !isCorrect && styles.resWrongAnswer]}>
                      <MaterialIcons name={isCorrect ? "check-circle" : "cancel"} size={20} color={isCorrect ? "#10b981" : "#ef4444"} />
                      <Text style={[styles.resAnswerText, { color: isCorrect ? "#10b981" : "#ef4444" }]}>
                        Senin Cevabın: {q.options[userAnswerIndex]}
                      </Text>
                    </View>
                    
                    {!isCorrect && (
                      <View style={[styles.resAnswerRow, styles.resCorrectAnswer]}>
                        <MaterialIcons name="check-circle" size={20} color="#10b981" />
                        <Text style={[styles.resAnswerText, { color: "#10b981" }]}>
                          Doğru Cevap: {q.options[correctAnswerIndex]}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.resExpSection}>
                    <Text style={styles.resExpTitle}>Açıklama</Text>
                    <Text style={styles.resExpText}>{q.explanation}</Text>
                  </View>
                </View>
              );
            })}
          </View>
          
          <View style={styles.resultActions}>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/home')}>
              <Text style={styles.primaryBtnText}>Ana Sayfaya Dön</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} onPress={resetQuiz}>
              <Text style={styles.secondaryBtnText}>Yeniden Sınav Ol</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="AI Quiz">
      <View style={styles.container}>
        {!quizStarted ? (
          <View style={styles.startSection}>
            <LinearGradient colors={['#7c4dff', '#4c1d95']} style={styles.heroCard}>
              <MaterialIcons name="psychology" size={64} color="#fff" />
              <Text style={styles.heroTitle}>Kişiselleştirilmiş AI Sınavı</Text>
              <Text style={styles.heroSubtitle}>Gemini 2.5 AI, zayıf olduğun konuları tespit eder ve seni geliştirecek tamamen sana özel yepyeni sorular üretir.</Text>
            </LinearGradient>
            
            <View style={styles.features}>
              <View style={styles.featureItem}>
                <MaterialIcons name="auto-awesome" size={24} color="#ffd54f" />
                <Text style={styles.featureText}>Tamamen sana özel 5 soru</Text>
              </View>
              <View style={styles.featureItem}>
                <MaterialIcons name="insights" size={24} color="#10b981" />
                <Text style={styles.featureText}>Geçmiş analizlerine dayalı içerik</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.startBtn} onPress={startQuiz}>
              <Text style={styles.startBtnText}>Sınavı Başlat</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {questions.length > 0 && (
              <View style={styles.questionSection}>
                <View style={styles.qHeader}>
                  <Text style={styles.qProgress}>Soru {currentIndex + 1} / {questions.length}</Text>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{questions[currentIndex].difficulty}</Text>
                  </View>
                </View>

                <Text style={styles.topicText}>{questions[currentIndex].topic}</Text>
                
                <View style={styles.qCard}>
                  <Text style={styles.qText}>{questions[currentIndex].question}</Text>
                </View>

                <View style={styles.optionsList}>
                  {questions[currentIndex].options.map((option: string, index: number) => {
                    const isSelected = selectedOptionIndex === index;
                    const letter = String.fromCharCode(65 + index); // A, B, C, D
                    const isCorrect = letter === questions[currentIndex].correct_answer;
                    
                    let bgStyle = styles.optionNormal;
                    let textStyle = styles.optionTextNormal;
                    let borderStyle = {};

                    if (isAnswered) {
                      if (isCorrect) {
                        bgStyle = styles.optionCorrect;
                        textStyle = styles.optionTextCorrect;
                      } else if (isSelected && !isCorrect) {
                        bgStyle = styles.optionWrong;
                        textStyle = styles.optionTextWrong;
                      }
                    } else if (isSelected) {
                      bgStyle = styles.optionSelected;
                      borderStyle = { borderColor: '#7c4dff', borderWidth: 2 };
                    }

                    return (
                      <TouchableOpacity 
                        key={index} 
                        style={[styles.option, bgStyle, borderStyle]} 
                        onPress={() => handleSelectOption(index)}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.optText, textStyle]}>{option}</Text>
                        {isAnswered && isCorrect && <MaterialIcons name="check-circle" size={24} color="#10b981" />}
                        {isAnswered && isSelected && !isCorrect && <MaterialIcons name="cancel" size={24} color="#ef4444" />}
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {isAnswered && (
                  <View style={styles.explanationCard}>
                    <View style={styles.expHeader}>
                      <MaterialIcons name="lightbulb" size={20} color="#ffd54f" />
                      <Text style={styles.expTitle}>Açıklama</Text>
                    </View>
                    <Text style={styles.expText}>{questions[currentIndex].explanation}</Text>
                  </View>
                )}

                <View style={styles.actionRow}>
                  {!isAnswered ? (
                    <TouchableOpacity 
                      style={[styles.primaryBtn, selectedOptionIndex === null && { opacity: 0.5 }]} 
                      onPress={handleAnswer}
                      disabled={selectedOptionIndex === null}
                    >
                      <Text style={styles.primaryBtnText}>Cevapla</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity style={styles.primaryBtn} onPress={handleNext}>
                      <Text style={styles.primaryBtnText}>
                        {currentIndex < questions.length - 1 ? 'Sonraki Soru' : 'Sınavı Bitir'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </PageWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  scrollContent: { paddingBottom: 100 },
  
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  loadingTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginTop: 24, marginBottom: 12 },
  loadingSubtitle: { color: '#948ea1', fontSize: 15, textAlign: 'center', lineHeight: 22 },
  
  startSection: { flex: 1, justifyContent: 'center' },
  heroCard: { padding: 32, borderRadius: 32, alignItems: 'center', marginBottom: 32 },
  heroTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginTop: 16 },
  heroSubtitle: { color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginTop: 12, lineHeight: 22 },
  
  features: { gap: 16, marginBottom: 40 },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#1c1b1b', padding: 16, borderRadius: 16 },
  featureText: { color: '#e5e2e1', fontSize: 15, fontWeight: '500' },
  
  startBtn: { backgroundColor: '#7c4dff', height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  startBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  
  questionSection: { gap: 16 },
  qHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  qProgress: { color: '#948ea1', fontSize: 14, fontWeight: 'bold' },
  badge: { backgroundColor: 'rgba(124, 77, 255, 0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  badgeText: { color: '#cdbdff', fontSize: 12, fontWeight: 'bold' },
  topicText: { color: '#cdbdff', fontSize: 14, fontWeight: 'bold', marginBottom: 16 },
  
  qCard: { backgroundColor: '#1c1b1b', padding: 24, borderRadius: 24, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  qText: { color: '#fff', fontSize: 18, fontWeight: '500', lineHeight: 28 },
  
  optionsList: { gap: 12, marginBottom: 24 },
  option: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderRadius: 16, borderWidth: 2, borderColor: 'transparent' },
  optionNormal: { backgroundColor: '#1c1b1b' },
  optionSelected: { backgroundColor: 'rgba(124, 77, 255, 0.1)' },
  optionCorrect: { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: '#10b981' },
  optionWrong: { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: '#ef4444' },
  optText: { flex: 1, fontSize: 16, fontWeight: '500' },
  optionTextNormal: { color: '#e5e2e1' },
  optionTextCorrect: { color: '#10b981' },
  optionTextWrong: { color: '#ef4444' },
  
  explanationCard: { backgroundColor: 'rgba(255,213,79,0.05)', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,213,79,0.2)', marginBottom: 24 },
  expHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  expTitle: { color: '#ffd54f', fontSize: 16, fontWeight: 'bold' },
  expText: { color: '#e5e2e1', fontSize: 14, lineHeight: 22 },

  actionRow: { flexDirection: 'row', justifyContent: 'flex-end' },
  primaryBtn: { backgroundColor: '#7c4dff', paddingHorizontal: 32, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  secondaryBtn: { backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 32, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  secondaryBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  resultContainer: { flex: 1, padding: 24 },
  resultHeader: { alignItems: 'center', marginBottom: 32, marginTop: 20 },
  resultTitle: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginBottom: 12 },
  resultScore: { color: '#e5e2e1', fontSize: 18, fontWeight: '500' },
  
  resultsList: { gap: 20, marginBottom: 32 },
  resultCard: { backgroundColor: '#1c1b1b', padding: 20, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  resCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  resCardNum: { color: '#948ea1', fontSize: 14, fontWeight: 'bold' },
  resStatusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  resQuestionText: { color: '#fff', fontSize: 16, fontWeight: '500', lineHeight: 24, marginBottom: 20 },
  
  resAnswersSection: { gap: 12, marginBottom: 20 },
  resAnswerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 12 },
  resWrongAnswer: { backgroundColor: 'rgba(239, 68, 68, 0.05)' },
  resCorrectAnswer: { backgroundColor: 'rgba(16, 185, 129, 0.05)' },
  resAnswerText: { flex: 1, fontSize: 14, fontWeight: '600' },
  
  resExpSection: { backgroundColor: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 16 },
  resExpTitle: { color: '#cdbdff', fontSize: 13, fontWeight: 'bold', marginBottom: 6, textTransform: 'uppercase' },
  resExpText: { color: '#948ea1', fontSize: 14, lineHeight: 22 },
  
  resultActions: { gap: 12, paddingBottom: 40 }
});
