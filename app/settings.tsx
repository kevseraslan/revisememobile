import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Platform, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import PageWrapper from '../components/PageWrapper';
import { apiService } from '../services/api';

export default function SettingsScreen() {
  const router = useRouter();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [repeatInterval, setRepeatInterval] = useState('7');
  const [theme, setTheme] = useState('light');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Ayarları Getir
  const fetchSettings = async () => {
    try {
      const data = await apiService.getSettings();
      if (data.success) {
        setEmailNotifications(data.settings.email_notifications);
        setPushNotifications(data.settings.push_notifications);
        setTheme(data.settings.theme);
        // Repeat interval backend modelde yoksa varsayılan 7 kalır
      }
    } catch (error) {
      console.error('Fetch Settings Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Ayar Güncelleme Fonksiyonu
  const updateSetting = async (key: string, value: any) => {
    setSaving(true);
    try {
      const updatedSettings = {
        email_notifications: key === 'email' ? value : emailNotifications,
        push_notifications: key === 'push' ? value : pushNotifications,
        theme: key === 'theme' ? value : theme,
        repeat_interval: key === 'repeat' ? value : repeatInterval
      };
      await apiService.updateSettings(updatedSettings);
    } catch (error) {
      console.error('Update Setting Error:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageWrapper title="Ayarlar">
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#7c4dff" />
        </View>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="Ayarlar">
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Hero Title Section */}
        <View style={styles.heroSection}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.heroTitle}>Ayarlar</Text>
            {saving && <ActivityIndicator size="small" color="#7c4dff" />}
          </View>
          <Text style={styles.heroSubtitle}>
            Hesap tercihlerinizi ve uygulama görünümünü buradan özelleştirebilirsiniz.
          </Text>
        </View>

        {/* Section: Bildirim Ayarları */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconContainer, { backgroundColor: 'rgba(124, 77, 255, 0.2)' }]}>
              <MaterialIcons name="notifications" size={20} color="#7c4dff" />
            </View>
            <Text style={styles.sectionTitle}>Bildirim Ayarları</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>E-posta Bildirimleri</Text>
                <Text style={styles.settingDesc}>Haftalık özet ve hatırlatıcılar</Text>
              </View>
              <Switch
                value={emailNotifications}
                onValueChange={(val) => {
                  setEmailNotifications(val);
                  updateSetting('email', val);
                }}
                trackColor={{ false: '#353534', true: '#7c4dff' }}
                thumbColor="#fff"
              />
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Anlık Bildirimler</Text>
                <Text style={styles.settingDesc}>Mobil cihazınıza anlık uyarılar</Text>
              </View>
              <Switch
                value={pushNotifications}
                onValueChange={(val) => {
                  setPushNotifications(val);
                  updateSetting('push', val);
                }}
                trackColor={{ false: '#353534', true: '#7c4dff' }}
                thumbColor="#fff"
              />
            </View>
          </View>
        </View>

        {/* Section: Tekrar Ayarları */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconContainer, { backgroundColor: 'rgba(0, 218, 243, 0.2)' }]}>
              <MaterialIcons name="refresh" size={20} color="#00daf3" />
            </View>
            <Text style={styles.sectionTitle}>Tekrar Ayarları</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.inputLabel}>TEKRAR ARALIĞI (GÜN)</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={repeatInterval}
                onChangeText={setRepeatInterval}
                onBlur={() => updateSetting('repeat', repeatInterval)}
                keyboardType="numeric"
                placeholderTextColor="#948ea1"
              />
              <Text style={styles.inputSuffix}>Gün</Text>
            </View>
            <Text style={styles.settingDesc}>
              Bu ayar, bir konunun ne sıklıkla tekrar listesine düşeceğini belirler.
            </Text>
          </View>
        </View>

        {/* Section: Görünüm Ayarları */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconContainer, { backgroundColor: 'rgba(124, 77, 255, 0.2)' }]}>
              <MaterialIcons name="palette" size={20} color="#7c4dff" />
            </View>
            <Text style={styles.sectionTitle}>Görünüm Ayarları</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.inputLabel}>TEMA TERCİHİ</Text>
            <TouchableOpacity 
              style={styles.selectContainer}
              onPress={() => {
                const nextTheme = theme === 'dark' ? 'light' : 'dark';
                setTheme(nextTheme);
                updateSetting('theme', nextTheme);
              }}
            >
              <Text style={styles.selectText}>
                {theme === 'dark' ? 'Koyu Tema (Dark Mode)' : 'Açık Tema (Klasik)'}
              </Text>
              <MaterialIcons name="swap-horiz" size={24} color="#948ea1" />
            </TouchableOpacity>
            <Text style={styles.settingDesc}>
              Uygulamanın renk temasını değiştirin. Şu an: {theme.toUpperCase()}
            </Text>
          </View>
        </View>

      </ScrollView>
    </PageWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 120,
  },
  heroSection: {
    marginBottom: 40,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#948ea1',
    lineHeight: 24,
  },
  section: {
    marginBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  sectionIconContainer: {
    padding: 8,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  card: {
    backgroundColor: 'rgba(30, 30, 30, 0.6)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 12,
    shadowColor: 'rgba(124, 77, 255, 0.08)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 32,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  settingDesc: {
    fontSize: 13,
    color: '#948ea1',
    marginTop: 4,
    lineHeight: 18,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#948ea1',
    letterSpacing: 1,
    marginBottom: 12,
  },
  inputContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#0e0e0e',
    borderWidth: 1,
    borderColor: '#494455',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 16,
  },
  inputSuffix: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -10 }],
    color: '#948ea1',
    fontSize: 14,
  },
  selectContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0e0e0e',
    borderWidth: 1,
    borderColor: '#494455',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  selectText: {
    color: '#fff',
    fontSize: 16,
  },
});
