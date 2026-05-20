import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

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
  academic: '#00daf3',
  security: '#b0c6ff',
};

export default function SignUpScreen() {
  const router = useRouter();
  const [agreed, setAgreed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Focus states
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Helper for Section Headers
  const SectionHeader = ({ title, color, icon }: { title: string, color: string, icon: string }) => (
    <View style={styles.sectionHeaderContainer}>
      <View style={[styles.sectionIndicator, { backgroundColor: color }]} />
      <MaterialCommunityIcons name={icon as any} size={18} color={color} style={{ marginRight: 6 }} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  return (
    <View style={styles.mainContainer}>
      <StatusBar style="light" />
      
      {/* Background Decorative Glows */}
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          style={styles.keyboardView} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Top App Bar */}
          <View style={styles.appBar}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <MaterialIcons name="arrow-back-ios" size={16} color={COLORS.onSurface} style={{ marginLeft: 6 }} />
            </TouchableOpacity>
            <Text style={styles.appBarTitle}>Kayıt Ol</Text>
            <View style={{ width: 36 }} /> {/* Spacer */}
          </View>

          <ScrollView 
            contentContainerStyle={styles.scrollContent} 
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Hero Visual Section */}
            <View style={styles.heroSection}>
              <View style={styles.heroIconContainer}>
                <View style={styles.heroIconGlow} />
                <View style={styles.heroIconInner}>
                  <MaterialIcons name="school" size={36} color={COLORS.primary} />
                </View>
              </View>
              <Text style={styles.heroTitle}>Geleceğini İnşa Et</Text>
              <Text style={styles.heroSubtitle}>AI destekli öğrenme yolculuğuna bugün katıl.</Text>
            </View>

            {/* Section 1: Kişisel Bilgiler */}
            <View style={styles.section}>
              <SectionHeader title="Kişisel Bilgiler" color={COLORS.primaryContainer} icon="account-outline" />
              
              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.label}>Adınız</Text>
                  <View style={[styles.inputWrapper, focusedField === 'name' && styles.inputWrapperFocused]}>
                    <TextInput 
                      style={styles.input} 
                      placeholder="Can" 
                      placeholderTextColor={COLORS.outline}
                      onFocus={() => setFocusedField('name')}
                      onBlur={() => setFocusedField(null)}
                    />
                  </View>
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.label}>Soyadınız</Text>
                  <View style={[styles.inputWrapper, focusedField === 'surname' && styles.inputWrapperFocused]}>
                    <TextInput 
                      style={styles.input} 
                      placeholder="Yılmaz" 
                      placeholderTextColor={COLORS.outline}
                      onFocus={() => setFocusedField('surname')}
                      onBlur={() => setFocusedField(null)}
                    />
                  </View>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Kullanıcı Adı</Text>
                <View style={[styles.inputWrapper, focusedField === 'username' && styles.inputWrapperFocused]}>
                  <MaterialCommunityIcons name="at" size={20} color={focusedField === 'username' ? COLORS.primary : COLORS.outline} style={styles.inputIcon} />
                  <TextInput 
                    style={styles.input} 
                    placeholder="kullanici_adi" 
                    placeholderTextColor={COLORS.outline}
                    defaultValue="kevserr3"
                    onFocus={() => setFocusedField('username')}
                    onBlur={() => setFocusedField(null)}
                  />
                  <MaterialIcons name="verified" size={18} color={COLORS.primary} style={{ marginLeft: 8 }} />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Doğum Yılı</Text>
                <View style={[styles.inputWrapper, focusedField === 'birthYear' && styles.inputWrapperFocused]}>
                  <MaterialCommunityIcons name="calendar-range" size={20} color={focusedField === 'birthYear' ? COLORS.primary : COLORS.outline} style={styles.inputIcon} />
                  <TextInput 
                    style={styles.input} 
                    placeholder="2006" 
                    placeholderTextColor={COLORS.outline} 
                    keyboardType="numeric"
                    onFocus={() => setFocusedField('birthYear')}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
              </View>
            </View>

            {/* Section 2: Akademik Bilgiler */}
            <View style={styles.section}>
              <SectionHeader title="Akademik Bilgiler" color={COLORS.academic} icon="book-education-outline" />
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>E-posta Adresiniz</Text>
                <View style={[styles.inputWrapper, focusedField === 'email' && styles.inputWrapperFocused]}>
                  <MaterialIcons name="mail-outline" size={20} color={focusedField === 'email' ? COLORS.academic : COLORS.outline} style={styles.inputIcon} />
                  <TextInput 
                    style={styles.input} 
                    placeholder="ornek@edu.tr" 
                    placeholderTextColor={COLORS.outline} 
                    keyboardType="email-address" 
                    autoCapitalize="none"
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Sınıf Düzeyi</Text>
                <TouchableOpacity style={styles.dropdownLike}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MaterialCommunityIcons name="school-outline" size={20} color={COLORS.outline} style={{ marginRight: 12 }} />
                    <Text style={styles.dropdownText}>12. Sınıf</Text>
                  </View>
                  <MaterialIcons name="expand-more" size={24} color={COLORS.outline} />
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Lise Alanı</Text>
                <TouchableOpacity style={styles.dropdownLike}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MaterialCommunityIcons name="math-compass" size={20} color={COLORS.outline} style={{ marginRight: 12 }} />
                    <Text style={styles.dropdownText}>Sayısal (MF)</Text>
                  </View>
                  <MaterialIcons name="expand-more" size={24} color={COLORS.outline} />
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Kariyer / Üniversite Hedefiniz</Text>
                <View style={[styles.inputWrapper, { height: 90, alignItems: 'flex-start', paddingTop: 12 }, focusedField === 'target' && styles.inputWrapperFocused]}>
                  <MaterialCommunityIcons name="bullseye-arrow" size={20} color={focusedField === 'target' ? COLORS.academic : COLORS.outline} style={[styles.inputIcon, { marginTop: 2 }]} />
                  <TextInput 
                    style={[styles.input, { height: '100%', textAlignVertical: 'top' }]} 
                    placeholder="Örn: Bilgisayar Mühendisliği, Boğaziçi Üniversitesi" 
                    placeholderTextColor={COLORS.outline} 
                    multiline 
                    numberOfLines={3}
                    onFocus={() => setFocusedField('target')}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
              </View>
            </View>

            {/* Section 3: Güvenlik */}
            <View style={styles.section}>
              <SectionHeader title="Güvenlik" color={COLORS.security} icon="shield-lock-outline" />
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Güvenlik Sorusu</Text>
                <TouchableOpacity style={styles.dropdownLike}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MaterialCommunityIcons name="help-circle-outline" size={20} color={COLORS.outline} style={{ marginRight: 12 }} />
                    <Text style={styles.dropdownText}>İlk evcil hayvanınızın adı nedir?</Text>
                  </View>
                  <MaterialIcons name="expand-more" size={24} color={COLORS.outline} />
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Güvenlik Cevabı</Text>
                <View style={[styles.inputWrapper, focusedField === 'securityAnswer' && styles.inputWrapperFocused]}>
                  <MaterialCommunityIcons name="key-outline" size={20} color={focusedField === 'securityAnswer' ? COLORS.security : COLORS.outline} style={styles.inputIcon} />
                  <TextInput 
                    style={styles.input} 
                    placeholder="Cevabınız" 
                    placeholderTextColor={COLORS.outline}
                    onFocus={() => setFocusedField('securityAnswer')}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Şifre</Text>
                <View style={[styles.inputWrapper, focusedField === 'password' && styles.inputWrapperFocused]}>
                  <MaterialIcons name="lock-outline" size={20} color={focusedField === 'password' ? COLORS.security : COLORS.outline} style={styles.inputIcon} />
                  <TextInput 
                    style={styles.input} 
                    placeholder="••••••••" 
                    placeholderTextColor={COLORS.outline} 
                    secureTextEntry={!showPassword}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                    <MaterialCommunityIcons 
                      name={showPassword ? "eye-off-outline" : "eye-outline"} 
                      size={20} 
                      color={COLORS.outline} 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Şifre Tekrar</Text>
                <View style={[styles.inputWrapper, focusedField === 'passwordConfirm' && styles.inputWrapperFocused]}>
                  <MaterialIcons name="lock-outline" size={20} color={focusedField === 'passwordConfirm' ? COLORS.security : COLORS.outline} style={styles.inputIcon} />
                  <TextInput 
                    style={styles.input} 
                    placeholder="••••••••" 
                    placeholderTextColor={COLORS.outline} 
                    secureTextEntry={!showConfirmPassword}
                    onFocus={() => setFocusedField('passwordConfirm')}
                    onBlur={() => setFocusedField(null)}
                  />
                  <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeBtn}>
                    <MaterialCommunityIcons 
                      name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                      size={20} 
                      color={COLORS.outline} 
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Section 4: Agreement */}
            <View style={styles.agreementSection}>
              <TouchableOpacity style={styles.checkboxContainer} onPress={() => setAgreed(!agreed)}>
                <MaterialIcons 
                  name={agreed ? "check-box" : "check-box-outline-blank"} 
                  size={24} 
                  color={agreed ? COLORS.primaryContainer : COLORS.outline} 
                />
                <Text style={styles.agreementText}>
                  Bana özel analizleri kabul ediyor, <Text style={styles.agreementLink}>Kullanım Şartları</Text>'nı onaylıyorum.
                </Text>
              </TouchableOpacity>
            </View>

            {/* Section 5: CTA Sign Up Button */}
            <TouchableOpacity 
              style={[styles.ctaButton, !agreed && { opacity: 0.5 }]} 
              onPress={() => router.push('/home')}
              disabled={!agreed}
            >
              <LinearGradient
                colors={[COLORS.primaryContainer, '#0068ED']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradient}
              >
                <Text style={styles.ctaText}>Kaydı Tamamla ve Başla</Text>
                <MaterialIcons name="rocket-launch" size={20} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>

            {/* Section 6: Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Zaten üye misin? </Text>
              <TouchableOpacity onPress={() => router.push('/')}>
                <Text style={styles.loginLink}>Giriş Yap</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Bottom Help/Support Info */}
          <View style={styles.bottomNav}>
            <TouchableOpacity style={styles.bottomNavItem}>
              <MaterialIcons name="help-outline" size={20} color={COLORS.outline} />
              <Text style={styles.bottomNavText}>Yardım</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.bottomNavItem}>
              <MaterialIcons name="contact-support" size={20} color={COLORS.outline} />
              <Text style={styles.bottomNavText}>Destek</Text>
            </TouchableOpacity>
          </View>
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
    backgroundColor: COLORS.primaryContainer, opacity: 0.08, 
  },
  glowBottom: { 
    position: 'absolute', bottom: height * -0.15, left: width * -0.3, 
    width: 400, height: 400, borderRadius: 200, 
    backgroundColor: COLORS.academic, opacity: 0.03, 
  },

  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 56,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appBarTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 100,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 36,
  },
  heroIconContainer: {
    position: 'relative',
    width: 84,
    height: 84,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroIconGlow: {
    position: 'absolute',
    width: 100,
    height: 100,
    backgroundColor: COLORS.primaryContainer,
    borderRadius: 50,
    opacity: 0.15,
  },
  heroIconInner: {
    width: 76,
    height: 76,
    borderRadius: 24,
    backgroundColor: 'rgba(28, 27, 27, 0.6)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
    letterSpacing: -0.5
  },
  heroSubtitle: {
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20
  },
  section: {
    marginBottom: 36,
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  sectionIndicator: {
    width: 4,
    height: 18,
    borderRadius: 2,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 0.2
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.outlineVariant,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
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
  dropdownLike: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.outlineVariant,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  dropdownText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
  eyeBtn: {
    padding: 8,
  },
  agreementSection: {
    marginVertical: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  agreementText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    lineHeight: 20,
  },
  agreementLink: {
    color: COLORS.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  ctaButton: {
    marginTop: 24,
    marginBottom: 32,
    borderRadius: 16,
    overflow: 'hidden',
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 58,
    borderRadius: 16,
  },
  ctaText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
    letterSpacing: 0.5
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 24,
  },
  footerText: {
    color: COLORS.onSurfaceVariant,
    fontSize: 15,
    fontWeight: '500'
  },
  loginLink: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    backgroundColor: 'rgba(11, 11, 12, 0.95)',
    borderTopWidth: 1.5,
    borderTopColor: COLORS.outlineVariant,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
  },
  bottomNavItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  bottomNavText: {
    color: COLORS.onSurfaceVariant,
    fontSize: 12,
    fontWeight: '600',
  },
});
