import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { apiService } from '../services/api';

export default function SignInScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Lütfen kullanıcı adı ve şifrenizi girin.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.login(username, password);
      
      if (response.success) {
        // Backend başarılı yanıt döndü ve session cookie oluşturuldu.
        router.replace('/home');
      } else {
        setError(response.message || 'Giriş başarısız.');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Sunucuya bağlanılamadı. İnternet bağlantınızı kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          <View style={styles.logoSection}>
            <Image 
              source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDSYSM6ZDA6tzqw4MIpKPrBvZeYPVJlrr6lm7_AaiwkB3dPl5x-AWWRUEttoy_U6n4ItUuNTNLLzJBvjB_D1_4Hq4H9801Ryx1GnlgckxlTBMwD1um8pTOCIjdNJirPXOPeWUwOivICcBA8RPeU2a_a-tneysH-nz9VigmgtrqoVEGm8EZBX8rV8sBOvtlwPGxFlrmnz-t0FXyaaWkARnqSN8du76qcS0SbJi5lyY7VSSHiiXADwMTVgntJv4ar1Z2yHtNJzVyPbYU' }} 
              style={styles.logo} 
            />
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Elevate your learning with AI intelligence.</Text>
          </View>

          <View style={styles.formSection}>
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Kullanıcı Adı</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Kullanıcı adınız" 
                placeholderTextColor="#948ea1" 
                autoCapitalize="none"
                value={username}
                onChangeText={setUsername}
                editable={!loading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Şifre</Text>
              <TextInput 
                style={styles.input} 
                placeholder="••••••••" 
                placeholderTextColor="#948ea1" 
                secureTextEntry 
                value={password}
                onChangeText={setPassword}
                editable={!loading}
              />
            </View>

            <TouchableOpacity 
              style={[styles.signInButton, loading && styles.signInButtonDisabled]} 
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.signInButtonText}>Giriş Yap</Text>
              )}
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#131313' },
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 },
  logoSection: { alignItems: 'center', marginBottom: 48 },
  logo: { width: 100, height: 100, marginBottom: 24, borderRadius: 24 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#e5e2e1', textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#948ea1', textAlign: 'center', marginTop: 8 },
  formSection: { width: '100%' },
  inputGroup: { marginBottom: 24 },
  label: { color: '#cac3d8', fontSize: 14, fontWeight: '600', marginBottom: 10, marginLeft: 4 },
  input: { backgroundColor: '#1c1b1b', borderWidth: 1, borderColor: '#353534', borderRadius: 16, padding: 18, color: '#fff', fontSize: 16 },
  signInButton: { backgroundColor: '#7c4dff', padding: 20, borderRadius: 16, alignItems: 'center', marginTop: 12, shadowColor: '#7c4dff', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 },
  signInButtonDisabled: { backgroundColor: '#5635b5', shadowOpacity: 0.1, elevation: 2 },
  signInButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  errorContainer: { backgroundColor: '#ef444420', padding: 12, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: '#ef444450' },
  errorText: { color: '#ef4444', fontSize: 14, textAlign: 'center' },
});
