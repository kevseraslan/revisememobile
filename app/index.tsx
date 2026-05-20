import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { apiService } from '../services/api';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

const { width, height } = Dimensions.get('window');

const COLORS = {
  background: '#0B0B0C',
  surface: '#121214',
  surfaceHigh: '#1A1A1E',
  primary: '#cdbdff',
  primaryContainer: '#7c4dff',
  primaryDark: '#5635b5',
  onSurface: '#e5e2e1',
  onSurfaceVariant: '#cac3d8',
  outline: '#5c5866',
  outlineVariant: '#35323D',
  error: '#ffb4ab',
};

export default function SignInScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  // Focus states
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  // ── Google Auth ────────────────────────────────────────────────────────────
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    iosClientId: 'IOS_CLIENT_ID.apps.googleusercontent.com',
    androidClientId: 'ANDROID_CLIENT_ID.apps.googleusercontent.com',
    webClientId: 'WEB_CLIENT_ID.apps.googleusercontent.com',
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      handleGoogleLoginSuccess(id_token);
    } else if (response?.type === 'error' || response?.type === 'cancel') {
      setLoading(false);
    }
  }, [response]);

  const handleGoogleLoginSuccess = async (idToken: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await apiService.socialLogin('Google', '', '', idToken);
      
      if (res.success) {
        router.replace('/home');
      } else {
        setError(res.error || 'Google girişi başarısız.');
      }
    } catch (err: any) {
      setError('Google servisine bağlanılamadı.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    if (provider === 'Google') {
      setLoading(true);
      promptAsync();
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const testEmail = `${provider}_test@example.com`;
      const testName = `${provider} User`;
      const response = await apiService.socialLogin(provider, testEmail, testName);
      if (response.success) {
        router.replace('/home');
      } else {
        setError(response.message || `${provider} girişi başarısız.`);
      }
    } catch (err: any) {
      setError(`${provider} hatası: Servis bağlantı hatası`);
    } finally {
      setLoading(false);
    }
  };

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
        router.replace('/home');
      } else {
        setError(response.message || 'Kullanıcı adı veya şifre hatalı.');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Sunucuya bağlanılamadı.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar style="light" />
      
      {/* Premium Ambient Background Glows */}
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView style={styles.keyboardView} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          
          {/* Custom Transparent Header */}
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.backBtn} onPress={() => {}}>
              <MaterialIcons name="arrow-back-ios" size={16} color={COLORS.onSurface} style={{ marginLeft: 6 }} />
            </TouchableOpacity>
            <Text style={styles.topBarTitle}>Giriş Yap</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView 
            contentContainerStyle={styles.scrollContent} 
            keyboardShouldPersistTaps="handled" 
            showsVerticalScrollIndicator={false}
          >
            
            {/* Logo & Welcome Header */}
            <View style={styles.logoSection}>
              <View style={styles.logoContainer}>
                <View style={styles.logoGlow} />
                <View style={styles.logoRing}>
                  <Image 
                    source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDSYSM6ZDA6tzqw4MIpKPrBvZeYPVJlrr6lm7_AaiwkB3dPl5x-AWWRUEttoy_U6n4ItUuNTNLLzJBvjB_D1_4Hq4H9801Ryx1GnlgckxlTBMwD1um8pTOCIjdNJirPXOPeWUwOivICcBA8RPeU2a_a-tneysH-nz9VigmgtrqoVEGm8EZBX8rV8sBOvtlwPGxFlrmnz-t0FXyaaWkARnqSN8du76qcS0SbJi5lyY7VSSHiiXADwMTVgntJv4ar1Z2yHtNJzVyPbYU' }} 
                    style={styles.logo} 
                  />
                </View>
              </View>
              <Text style={styles.title}>Tekrar Hoş Geldin</Text>
              <Text style={styles.subtitle}>Yapay zeka desteğiyle hedeflerine daha hızlı ulaş.</Text>
            </View>

            {/* Login Form */}
            <View style={styles.formSection}>
              {error && (
                <View style={styles.errorBox}>
                  <MaterialIcons name="error-outline" size={20} color={COLORS.error} style={{ marginRight: 8 }} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              {/* Email Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>E-Posta Adresi / Kullanıcı Adı</Text>
                <View style={[styles.inputWrapper, emailFocused && styles.inputWrapperFocused]}>
                  <MaterialIcons 
                    name="mail-outline" 
                    size={20} 
                    color={emailFocused ? COLORS.primary : COLORS.outline} 
                    style={styles.inputIcon} 
                  />
                  <TextInput 
                    style={styles.input} 
                    placeholder="ornek@revise.me" 
                    placeholderTextColor={COLORS.outline} 
                    autoCapitalize="none"
                    value={username}
                    onChangeText={setUsername}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    editable={!loading}
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>Şifre</Text>
                  <TouchableOpacity>
                    <Text style={styles.forgotPass}>Şifremi Unuttum?</Text>
                  </TouchableOpacity>
                </View>
                <View style={[styles.inputWrapper, passwordFocused && styles.inputWrapperFocused]}>
                  <MaterialIcons 
                    name="lock-outline" 
                    size={20} 
                    color={passwordFocused ? COLORS.primary : COLORS.outline} 
                    style={styles.inputIcon} 
                  />
                  <TextInput 
                    style={styles.input} 
                    placeholder="••••••••" 
                    placeholderTextColor={COLORS.outline} 
                    secureTextEntry={!showPassword} 
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    editable={!loading}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                    <MaterialCommunityIcons 
                      name={showPassword ? "eye-off-outline" : "eye-outline"} 
                      size={20} 
                      color={passwordFocused ? COLORS.primary : COLORS.outline} 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Submit CTA Button */}
              <TouchableOpacity 
                style={[styles.signInBtn, loading && styles.signInBtnDisabled]} 
                onPress={handleLogin}
                disabled={loading}
              >
                <LinearGradient 
                  colors={[COLORS.primaryContainer, COLORS.primaryDark]} 
                  style={styles.btnGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <View style={styles.btnContent}>
                      <Text style={styles.signInBtnText}>Giriş Yap</Text>
                      <MaterialIcons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>VEYA ŞUNUNLA DEVAM ET</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Logins */}
            <View style={styles.socialRow}>
              <TouchableOpacity 
                style={[styles.socialBtn, !request && { opacity: 0.7 }]} 
                onPress={() => handleSocialLogin('Google')}
                disabled={!request || loading}
              >
                <Image 
                  source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAQU8jDer0eTW3Qaw45qDD958Km7gS7tTw1y1uSAlBAQoNKMCDiXJscE7svfxkSTYu8PWNs2ShLh4esxbawnjlWMxDWQZRhqoZd47zFfte6smvjcOojIjGsakZg2U0kbhyRA1L83X5uc-GdP5Ub1fAG4mthfGDoiec-rzSPKlSgkkI9P0_gZ3fiRmch1aPDuUpvCTpF1A9WaXUsN9JO5f0WJL9GrZUXC1CwTnYiEOEq43PU5vWjdsr5yDR_J4qsMYqqGuHNYdGLpYo' }} 
                  style={styles.socialIcon} 
                />
                <Text style={styles.socialBtnText}>Google</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.socialBtn} 
                onPress={() => handleSocialLogin('Apple')}
                disabled={loading}
              >
                <MaterialCommunityIcons name="apple" size={20} color={COLORS.onSurface} />
                <Text style={styles.socialBtnText}>Apple</Text>
              </TouchableOpacity>
            </View>

            {/* Footer Sign Up Link */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Hesabın yok mu? </Text>
              <TouchableOpacity onPress={() => router.push('/sign-up')}>
                <Text style={styles.signUpLink}>Kayıt Ol</Text>
              </TouchableOpacity>
            </View>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: COLORS.background },
  safeArea: { flex: 1 },
  keyboardView: { flex: 1 },
  
  glowTop: { 
    position: 'absolute', top: height * -0.1, right: width * -0.2, 
    width: 320, height: 320, borderRadius: 160, 
    backgroundColor: COLORS.primaryContainer, opacity: 0.12, 
  },
  glowBottom: { 
    position: 'absolute', bottom: height * -0.15, left: width * -0.3, 
    width: 400, height: 400, borderRadius: 200, 
    backgroundColor: '#00daf3', opacity: 0.04, 
  },

  topBar: { 
    height: 56, flexDirection: 'row', alignItems: 'center', 
    justifyContent: 'space-between',
    paddingHorizontal: 20, 
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' },
  topBarTitle: { color: COLORS.onSurface, fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },

  scrollContent: { paddingHorizontal: 24, paddingBottom: 60, paddingTop: 20 },
  
  logoSection: { alignItems: 'center', marginBottom: 36 },
  logoContainer: { width: 92, height: 92, marginBottom: 20, justifyContent: 'center', alignItems: 'center' },
  logoGlow: { position: 'absolute', width: 110, height: 110, borderRadius: 55, backgroundColor: COLORS.primaryContainer, opacity: 0.15 },
  logoRing: { 
    width: 90, height: 90, borderRadius: 28, 
    backgroundColor: 'rgba(28, 27, 27, 0.6)', 
    borderWidth: 1.5, borderColor: 'rgba(255, 255, 255, 0.1)', 
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden'
  },
  logo: { width: 72, height: 72, borderRadius: 20 },
  title: { fontSize: 28, fontWeight: '800', color: '#fff', textAlign: 'center', letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: COLORS.onSurfaceVariant, textAlign: 'center', marginTop: 8, lineHeight: 20, paddingHorizontal: 20 },
  
  formSection: { width: '100%' },
  inputGroup: { marginBottom: 20 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, paddingHorizontal: 4 },
  label: { color: COLORS.onSurfaceVariant, fontSize: 13, fontWeight: '600', letterSpacing: 0.2 },
  forgotPass: { color: COLORS.primary, fontSize: 12, fontWeight: '600' },
  
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.outlineVariant,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 58,
  },
  inputWrapperFocused: {
    borderColor: COLORS.primaryContainer,
    backgroundColor: COLORS.surfaceHigh,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: { 
    flex: 1, 
    color: '#fff', 
    fontSize: 15,
    fontWeight: '500',
    height: '100%',
  },
  eyeBtn: {
    padding: 8,
  },
  
  signInBtn: { borderRadius: 16, overflow: 'hidden', marginTop: 12 },
  btnGradient: { height: 58, alignItems: 'center', justifyContent: 'center' },
  btnContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  signInBtnDisabled: { opacity: 0.7 },
  signInBtnText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },

  errorBox: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(255, 180, 171, 0.08)', 
    padding: 16, 
    borderRadius: 16, 
    marginBottom: 24, 
    borderWidth: 1, 
    borderColor: 'rgba(255, 180, 171, 0.2)' 
  },
  errorText: { color: COLORS.error, fontSize: 13, fontWeight: '600', flex: 1 },

  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 32 },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255, 255, 255, 0.05)' },
  dividerText: { marginHorizontal: 16, color: COLORS.outline, fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },

  socialRow: { flexDirection: 'row', gap: 16, marginBottom: 36 },
  socialBtn: { 
    flex: 1, height: 54, backgroundColor: COLORS.surface, 
    borderRadius: 16, flexDirection: 'row', alignItems: 'center', 
    justifyContent: 'center', gap: 10, borderWidth: 1.5, borderColor: COLORS.outlineVariant 
  },
  socialIcon: { width: 20, height: 20 },
  socialBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },

  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerText: { color: COLORS.onSurfaceVariant, fontSize: 15, fontWeight: '500' },
  signUpLink: { color: COLORS.primary, fontSize: 15, fontWeight: '700' },
});
