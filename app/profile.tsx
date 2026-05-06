import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, RefreshControl } from 'react-native';
import PageWrapper from '../components/PageWrapper';
import { apiService } from '../services/api';

export default function ProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState({
    name: '',
    surname: '',
    email: '',
    phone: '',
    class: '',
    aim: '',
    area: '',
    year_of_birth: '',
    stats: {
      total_questions: 0,
      success_rate: 0,
      badges: 0
    }
  });

  const [passwords, setPasswords] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const fetchProfile = async () => {
    try {
      const data = await apiService.getProfile();
      if (data.success) {
        setUser({
          ...data.user,
          year_of_birth: data.user.year_of_birth ? data.user.year_of_birth.toString() : ''
        });
      }
    } catch (error) {
      console.error('Fetch Profile Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdate = async () => {
    if (passwords.new_password && passwords.new_password !== passwords.confirm_password) {
      Alert.alert('Hata', 'Yeni şifreler eşleşmiyor.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...user,
        current_password: passwords.current_password,
        new_password: passwords.new_password
      };
      const response = await apiService.updateProfile(payload);
      if (response.success) {
        Alert.alert('Başarılı', 'Profil bilgileriniz güncellendi.');
        setPasswords({ current_password: '', new_password: '', confirm_password: '' });
        fetchProfile();
      } else {
        Alert.alert('Hata', response.message || 'Güncelleme başarısız.');
      }
    } catch (error) {
      console.error('Update Profile Error:', error);
      Alert.alert('Hata', 'Güncelleme sırasında bir sorun oluştu.');
    } finally {
      setSaving(false);
    }
  };

  if (loading && !refreshing) {
    return (
      <PageWrapper title="Profil">
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#7c4dff" />
        </View>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="Profilim">
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); fetchProfile();}} tintColor="#7c4dff" />
        }
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA92dDCVfyF-dj9hIC9M5KN0ypTtoMccrA09XJ0ddHLOfuBo2M01aehny1xI5XH--nTotqFBvUwBzDc0Da3_ig_ZQWBKp6T7enfJctEmndSPRdsRxWbHbjith3P575_fFlN6nAAyBiwUkYoTiiEUYu0FPeMzteLHxxnzTT55UpyUwgfsaxev-3h8nXuW54Vz_umOfbAOt5Um3N9E80fKbVpufRlqQ5y9JxWPFDlMAVaj6q4yuTtZKrCCDfqWwbhHo7y5q_6CYkoNUE' }}
              style={styles.avatar}
            />
            <TouchableOpacity style={styles.editAvatarBtn}>
              <MaterialIcons name="camera-alt" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{user.name} {user.surname}</Text>
          <Text style={styles.userEmail}>{user.email || 'E-posta belirtilmedi'}</Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{user.stats?.total_questions || 0}</Text>
            <Text style={styles.statLabel}>Soru</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{user.stats?.badges || 0}</Text>
            <Text style={styles.statLabel}>Rozet</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>%{user.stats?.success_rate || 0}</Text>
            <Text style={styles.statLabel}>Başarı</Text>
          </View>
        </View>

        {/* Info Form */}
        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>Kişisel Bilgiler</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>ADINIZ</Text>
            <TextInput
              style={styles.input}
              value={user.name}
              onChangeText={(text) => setUser({ ...user, name: text })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>SOYADINIZ</Text>
            <TextInput
              style={styles.input}
              value={user.surname}
              onChangeText={(text) => setUser({ ...user, surname: text })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>E-POSTA</Text>
            <TextInput
              style={styles.input}
              value={user.email}
              onChangeText={(text) => setUser({ ...user, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>TELEFON</Text>
            <TextInput
              style={styles.input}
              value={user.phone}
              onChangeText={(text) => setUser({ ...user, phone: text })}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>SINIF / SEVİYE</Text>
            <TextInput
              style={styles.input}
              value={user.class}
              onChangeText={(text) => setUser({ ...user, class: text })}
              placeholder="Örn: 12. Sınıf, Mezun..."
              placeholderTextColor="#494455"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>ALAN / BÖLÜM</Text>
            <TextInput
              style={styles.input}
              value={user.area}
              onChangeText={(text) => setUser({ ...user, area: text })}
              placeholder="Örn: Sayısal, Sözel..."
              placeholderTextColor="#494455"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>HEDEF / AMAÇ</Text>
            <TextInput
              style={styles.input}
              value={user.aim}
              onChangeText={(text) => setUser({ ...user, aim: text })}
              placeholder="Örn: Tıp Fakültesi..."
              placeholderTextColor="#494455"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>DOĞUM YILI</Text>
            <TextInput
              style={styles.input}
              value={user.year_of_birth}
              onChangeText={(text) => setUser({ ...user, year_of_birth: text })}
              keyboardType="numeric"
            />
          </View>

          {/* Security Section */}
          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Güvenlik</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>MEVCUT ŞİFRE (DEĞİŞTİRMEK İÇİN)</Text>
            <TextInput
              style={styles.input}
              value={passwords.current_password}
              onChangeText={(text) => setPasswords({ ...passwords, current_password: text })}
              secureTextEntry
              placeholder="Eski şifreniz"
              placeholderTextColor="#494455"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>YENİ ŞİFRE</Text>
            <TextInput
              style={styles.input}
              value={passwords.new_password}
              onChangeText={(text) => setPasswords({ ...passwords, new_password: text })}
              secureTextEntry
              placeholder="En az 6 karakter"
              placeholderTextColor="#494455"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>YENİ ŞİFRE (TEKRAR)</Text>
            <TextInput
              style={styles.input}
              value={passwords.confirm_password}
              onChangeText={(text) => setPasswords({ ...passwords, confirm_password: text })}
              secureTextEntry
              placeholder="Yeni şifreyi onaylayın"
              placeholderTextColor="#494455"
            />
          </View>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleUpdate}
            disabled={saving}
          >
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Değişiklikleri Kaydet</Text>}
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
    backgroundColor: '#131313'
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#7c4dff',
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#7c4dff',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#131313',
  },
  userName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  userEmail: {
    color: '#948ea1',
    fontSize: 14,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(30,30,30,0.6)',
    borderRadius: 24,
    padding: 20,
    marginBottom: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#948ea1',
    fontSize: 12,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  formContainer: {
    gap: 20,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    color: '#948ea1',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#1c1b1b',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  saveButton: {
    backgroundColor: '#7c4dff',
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
