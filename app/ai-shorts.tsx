import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function AIShortsScreen() {
  return (
    <View style={styles.container}>
      <LinearGradient colors={['#000', '#1a1a1a']} style={styles.videoMock}>
        <MaterialIcons name="play-circle-outline" size={80} color="rgba(255,255,255,0.2)" />
        <View style={styles.overlay}>
          <Text style={styles.topic}>Hücre Bölünmesi</Text>
          <Text style={styles.desc}>Mitoz ve Mayoz bölünme arasındaki farklar #biyoloji #tyt</Text>
        </View>
        <View style={styles.sideActions}>
          <TouchableOpacity style={styles.action}><MaterialIcons name="favorite" size={32} color="#fff" /></TouchableOpacity>
          <TouchableOpacity style={styles.action}><MaterialIcons name="bookmark" size={32} color="#fff" /></TouchableOpacity>
          <TouchableOpacity style={styles.action}><MaterialIcons name="share" size={32} color="#fff" /></TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  videoMock: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  overlay: { position: 'absolute', bottom: 100, left: 20, right: 80 },
  topic: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  desc: { color: 'rgba(255,255,255,0.8)', marginTop: 8 },
  sideActions: { position: 'absolute', right: 20, bottom: 120, gap: 24 },
  action: { alignItems: 'center' }
});
