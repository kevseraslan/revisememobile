import axios from 'axios';
import { Platform } from 'react-native';

// ── Ağ Ayarı ────────────────────────────────────────────────────────────────
// Fiziksel cihazdan test için: bilgisayarın yerel IP adresini buraya yaz.
// Emülatör: Android → 10.0.2.2,  iOS simülatör → localhost
// Fiziksel cihaz → ör. 192.168.1.45
const LOCAL_IP = '192.168.1.101'; // 👈 Kendi IP adresinle değiştir!

export const BASE_URL =
  Platform.OS === 'android'
    ? `http://${LOCAL_IP}:5000`  // Hem emülatör hem fiziksel cihaz
    : `http://${LOCAL_IP}:5000`; // iOS fiziksel cihaz

// ── Tip Tanımları ────────────────────────────────────────────────────────────
export interface Notification {
  id: number;
  title: string;
  message: string;
  date: string;
  type?: 'repeat' | 'overdue' | 'achievement' | 'info';
}

export interface QuestionItem {
  id: number;
  content: string;
  topic: string;
  category: string;
  difficulty: string;
  image: string | null;
  repeat_count: number;
  created_at: string;
  delay_days?: number;
}

export interface DashboardStats {
  username: string;
  today_count: number;
  past_count: number;
  completion_rate: number;
  performance_grade: string;
  solved_today?: number;
  today_questions?: QuestionItem[];
  past_questions?: QuestionItem[];
}

// ── Axios Instance ───────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// ── API Servisleri ───────────────────────────────────────────────────────────
export const apiService = {
  // Profil İşlemleri
  getProfile: async () => {
    try {
      const response = await api.get('/profile');
      return response.data;
    } catch (error) {
      console.error('Get Profile Error:', error);
      throw error;
    }
  },

  updateProfile: async (profileData: any) => {
    try {
      const response = await api.post('/profile', profileData);
      return response.data;
    } catch (error) {
      console.error('Update Profile Error:', error);
      throw error;
    }
  },

  // Soru Analiz Et (AI)
  solveImage: async (formData: FormData) => {
    try {
      const response = await api.post('/api/solve-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      console.error('Solve Image Error:', error);
      throw error;
    }
  },

  // Auth İşlemleri
  login: async (username: string, password: string) => {
    try {
      const response = await api.post('/login', { username, password });
      return response.data;
    } catch (error) {
      console.error('Login Error:', error);
      throw error;
    }
  },

  // Ana Sayfa Verileri
  getDashboardData: async () => {
    try {
      const response = await api.get('/hedefleyici');
      return response.data;
    } catch (error) {
      console.error('Dashboard Error:', error);
      throw error;
    }
  },

  // Favori Soruları Getir
  getFavorites: async () => {
    try {
      const response = await api.get('/favorites');
      return response.data;
    } catch (error) {
      console.error('Favorites Error:', error);
      throw error;
    }
  },

  // AI Shorts Getir
  getShorts: async () => {
    try {
      const response = await api.get('/api/shorts/videos');
      return response.data;
    } catch (error) {
      console.error('AI Shorts Error:', error);
      throw error;
    }
  },

  // AI Quiz Oluştur
  getAIQuiz: async () => {
    try {
      const response = await api.post('/generate_ai_quiz');
      return response.data;
    } catch (error) {
      console.error('AI Quiz Error:', error);
      throw error;
    }
  },

  // Gelişim Raporu Getir
  getProgressReport: async () => {
    try {
      const response = await api.get('/progress_report');
      return response.data;
    } catch (error) {
      console.error('Progress Report Error:', error);
      throw error;
    }
  },

  // Soruları Getir (Mobil için optimize edilmiş endpoint)
  getQuestions: async () => {
    try {
      const response = await api.get('/api/today_questions');
      return response.data;
    } catch (error) {
      console.error('Questions Error:', error);
      throw error;
    }
  },

  // ── Bildirimleri (Dashboard Stats) Getir — Mobil API ────────────────────────
  getNotifications: async (): Promise<DashboardStats> => {
    try {
      const response = await api.get<DashboardStats>('/api/today_questions');
      return response.data;
    } catch (error) {
      console.error('Notifications Error:', error);
      throw error;
    }
  },

  // ── Favori Soruları (Yıldızlı) Getir ─────────────────────────────────────────
  getFavorites: async () => {
    try {
      // Backend'in is_json kontrolünden geçmesi için Content-Type: application/json gönderilir
      const response = await api.get('/favorites', {
        headers: { 'Content-Type': 'application/json' }
      });
      return response.data;
    } catch (error) {
      console.error('Favorites Error:', error);
      throw error;
    }
  },

  // Geçmiş Soruları Getir
  getPastQuestions: async () => {
    try {
      const response = await api.get('/past_questions', {
        headers: { 'Content-Type': 'application/json' }
      });
      return response.data;
    } catch (error) {
      console.error('Past Questions Error:', error);
      throw error;
    }
  },

  // Gelişim Raporu (Performance) Verilerini Getir
  getPerformanceReport: async () => {
    try {
      const response = await api.get('/hedefleyici', {
        headers: { 'Accept': 'application/json' }
      });
      return response.data;
    } catch (error) {
      console.error('Performance Report Error:', error);
      throw error;
    }
  },

  // Soru Ekle
  addQuestion: async (formData: FormData) => {
    try {
      const response = await api.post('/api/shorts/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      console.error('Add Question Error:', error);
      throw error;
    }
  },
  // Pomodoro Verilerini Getir
  getTimerData: async () => {
    try {
      const response = await api.get('/timer', {
        headers: { 'Accept': 'application/json' }
      });
      return response.data;
    } catch (error) {
      console.error('Timer Data Error:', error);
      throw error;
    }
  },

  // Pomodoro Oturumunu Kaydet
  savePomodoroSession: async (duration: number, type: 'pomodoro' | 'short_break' | 'long_break') => {
    try {
      const response = await api.post('/save_pomodoro', { duration, type });
      return response.data;
    } catch (error) {
      console.error('Save Pomodoro Error:', error);
      throw error;
    }
  },
  // Ayarları Getir
  getSettings: async () => {
    try {
      const response = await api.get('/api/settings');
      return response.data;
    } catch (error) {
      console.error('Get Settings Error:', error);
      throw error;
    }
  },

  // Ayarları Güncelle
  updateSettings: async (settings: any) => {
    try {
      const response = await api.post('/api/settings', settings);
      return response.data;
    } catch (error) {
      console.error('Update Settings Error:', error);
      throw error;
    }
  },
  // Soru Detaylarını Getir
  getQuestionDetails: async (id: number) => {
    try {
      const response = await api.get(`/view_question/${id}`, {
        headers: { 'Accept': 'application/json' }
      });
      return response.data;
    } catch (error) {
      console.error('Get Question Details Error:', error);
      throw error;
    }
  },

  // Soruyu Tamamlandı Olarak İşaretle
  markQuestionCompleted: async (id: number) => {
    try {
      const response = await api.post(`/mark_completed/${id}`);
      return response.data;
    } catch (error) {
      console.error('Mark Question Completed Error:', error);
      throw error;
    }
  },
  // Kategori Bazlı Sorular
  getCategoryQuestions: async (categoryId: number) => {
    try {
      const response = await api.get(`/api/category_questions/${categoryId}`);
      return response.data;
    } catch (error) {
      console.error('Get Category Questions Error:', error);
      throw error;
    }
  },

  // Dashboard Verileri (Ana Sayfa)
  getDashboardData: async () => {
    try {
      const response = await api.get('/api/dashboard');
      return response.data;
    } catch (error) {
      console.error('Get Dashboard Data Error:', error);
      throw error;
    }
  },

  // Soruyu Sil
  deleteQuestion: async (id: number) => {
    try {
      const response = await api.post(`/delete_question/${id}`);
      return response.data;
    } catch (error) {
      console.error('Delete Question Error:', error);
      throw error;
    }
  },

  // Favorilere Ekle/Çıkar
  toggleFavorite: async (id: number) => {
    try {
      const response = await api.post(`/toggle_favorite/${id}`);
      return response.data;
    } catch (error) {
      console.error('Toggle Favorite Error:', error);
      throw error;
    }
  },

  // Not Ekle
  addNote: async (questionId: number, content: string) => {
    try {
      const response = await api.post(`/add_note/${questionId}`, { content });
      return response.data;
    } catch (error) {
      console.error('Add Note Error:', error);
      throw error;
    }
  },
};

export default api;
