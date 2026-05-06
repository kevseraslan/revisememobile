import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function SignUpScreen() {
  const router = useRouter();
  const [agreed, setAgreed] = useState(false);

  // Helper for Section Headers
  const SectionHeader = ({ title, color }) => (
    <View style={styles.sectionHeaderContainer}>
      <View style={[styles.sectionIndicator, { backgroundColor: color }]} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Top App Bar */}
        <View style={styles.appBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#7c4dff" />
          </TouchableOpacity>
          <Text style={styles.appBarTitle}>Create Account</Text>
          <View style={{ width: 40 }} /> {/* Spacer */}
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Hero Visual Section */}
          <View style={styles.heroSection}>
            <View style={styles.heroIconContainer}>
              <View style={styles.heroIconGlow} />
              <View style={styles.heroIconInner}>
                <MaterialIcons name="school" size={40} color="#fcf6ff" />
              </View>
            </View>
            <Text style={styles.heroTitle}>Geleceğini İnşa Et</Text>
            <Text style={styles.heroSubtitle}>AI destekli öğrenme yolculuğuna bugün katıl.</Text>
          </View>

          {/* Section 1: Kişisel Bilgiler */}
          <View style={styles.section}>
            <SectionHeader title="Kişisel Bilgiler" color="#7c4dff" />
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Adınız</Text>
                <TextInput style={styles.input} placeholder="Can" placeholderTextColor="#353534" />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Soyadınız</Text>
                <TextInput style={styles.input} placeholder="Yılmaz" placeholderTextColor="#353534" />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Username</Text>
              <View style={styles.inputWithIcon}>
                <TextInput style={[styles.input, { flex: 1, borderWidth: 0 }]} defaultValue="kevserr3" />
                <MaterialIcons name="verified" size={20} color="#cdbdff" style={styles.inputIcon} />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Doğum Yılı</Text>
              <TextInput style={styles.input} placeholder="2006" placeholderTextColor="#353534" keyboardType="numeric" />
            </View>
          </View>

          {/* Section 2: Akademik Bilgiler */}
          <View style={styles.section}>
            <SectionHeader title="Akademik Bilgiler" color="#00daf3" />
            <View style={styles.inputGroup}>
              <Text style={styles.label}>E-posta Adresiniz</Text>
              <TextInput style={styles.input} placeholder="ornek@edu.tr" placeholderTextColor="#353534" keyboardType="email-address" autoCapitalize="none" />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Sınıf Düzeyi</Text>
              <TouchableOpacity style={styles.dropdownLike}>
                <Text style={styles.dropdownText}>12. Sınıf</Text>
                <MaterialIcons name="expand-more" size={24} color="#cac3d8" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Lise Alanı</Text>
              <TouchableOpacity style={styles.dropdownLike}>
                <Text style={styles.dropdownText}>Sayısal (MF)</Text>
                <MaterialIcons name="expand-more" size={24} color="#cac3d8" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Kariyer / Üniversite Hedefiniz</Text>
              <TextInput 
                style={[styles.input, styles.textArea]} 
                placeholder="Örn: Bilgisayar Mühendisliği, Boğaziçi Üniversitesi" 
                placeholderTextColor="#353534" 
                multiline 
                numberOfLines={3} 
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Section 3: Güvenlik */}
          <View style={styles.section}>
            <SectionHeader title="Güvenlik" color="#b0c6ff" />
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Güvenlik Sorusu</Text>
              <TouchableOpacity style={styles.dropdownLike}>
                <Text style={styles.dropdownText}>İlk evcil hayvanınızın adı nedir?</Text>
                <MaterialIcons name="expand-more" size={24} color="#cac3d8" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Güvenlik Cevabı</Text>
              <TextInput style={styles.input} />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Şifre</Text>
              <View style={styles.inputWithIcon}>
                <TextInput style={[styles.input, { flex: 1, borderWidth: 0 }]} placeholder="••••••••" placeholderTextColor="#353534" secureTextEntry />
                <MaterialIcons name="visibility" size={20} color="#cac3d8" style={styles.inputIcon} />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Şifre Tekrar</Text>
              <TextInput style={styles.input} placeholder="••••••••" placeholderTextColor="#353534" secureTextEntry />
            </View>
          </View>

          {/* Section 4: Agreement */}
          <View style={styles.agreementSection}>
            <TouchableOpacity style={styles.checkboxContainer} onPress={() => setAgreed(!agreed)}>
              <MaterialIcons 
                name={agreed ? "check-box" : "check-box-outline-blank"} 
                size={24} 
                color={agreed ? "#7c4dff" : "#494455"} 
              />
              <Text style={styles.agreementText}>
                Bana özel analizleri kabul ediyor, <Text style={styles.agreementLink}>Kullanım Şartları</Text>'nı onaylıyorum.
              </Text>
            </TouchableOpacity>
          </View>

          {/* Section 5: CTA */}
          <TouchableOpacity style={styles.ctaButton} onPress={() => router.push('/home')}>
            <LinearGradient
              colors={['#7C4DFF', '#0068ED']}
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

        {/* Bottom Navigation Bar */}
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.bottomNavItem}>
            <MaterialIcons name="help-outline" size={24} color="#948ea1" />
            <Text style={styles.bottomNavText}>Help</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bottomNavItem}>
            <MaterialIcons name="contact-support" size={24} color="#948ea1" />
            <Text style={styles.bottomNavText}>Support</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#131313',
  },
  container: {
    flex: 1,
    backgroundColor: '#131313',
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(18, 18, 18, 0.7)',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  appBarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 100, // Space for bottom nav
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  heroIconContainer: {
    position: 'relative',
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroIconGlow: {
    position: 'absolute',
    width: 100,
    height: 100,
    backgroundColor: '#7c4dff',
    borderRadius: 50,
    opacity: 0.2,
    shadowColor: '#7c4dff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  heroIconInner: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: 'rgba(30, 30, 30, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#cac3d8',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionIndicator: {
    width: 4,
    height: 20,
    borderRadius: 2,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: '#cac3d8',
    marginBottom: 6,
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#0e0e0e',
    borderWidth: 1,
    borderColor: '#494455',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 15,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0e0e0e',
    borderWidth: 1,
    borderColor: '#494455',
    borderRadius: 8,
  },
  inputIcon: {
    paddingRight: 12,
  },
  dropdownLike: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0e0e0e',
    borderWidth: 1,
    borderColor: '#494455',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dropdownText: {
    color: '#fff',
    fontSize: 15,
  },
  textArea: {
    height: 80,
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
    color: '#cac3d8',
    lineHeight: 20,
  },
  agreementLink: {
    color: '#7c4dff',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  ctaButton: {
    marginTop: 24,
    marginBottom: 32,
    borderRadius: 12,
    shadowColor: '#7c4dff',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  ctaText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 24,
  },
  footerText: {
    color: '#cac3d8',
    fontSize: 14,
  },
  loginLink: {
    color: '#7c4dff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    backgroundColor: 'rgba(18, 18, 18, 0.9)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
  },
  bottomNavItem: {
    alignItems: 'center',
  },
  bottomNavText: {
    color: '#948ea1',
    fontSize: 10,
    marginTop: 4,
    fontWeight: '500',
  },
});
