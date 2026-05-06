import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface GlobalHeaderProps {
  title: string;
  onMenuPress: () => void;
}

export default function GlobalHeader({ title, onMenuPress }: GlobalHeaderProps) {
  const router = useRouter();

  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.iconButton} onPress={onMenuPress}>
        <MaterialIcons name="menu" size={28} color="#cdbdff" />
      </TouchableOpacity>
      
      <Text style={styles.headerTitle}>{title}</Text>
      
      <View style={styles.headerRight}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/notifications')}>
          <MaterialIcons name="notifications" size={28} color="#cdbdff" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.profileContainer} 
          onPress={() => router.push('/profile')}
        >
          <Image 
            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCiPinBY7hKNjKNOpS2t3x5vt3BmrfRutP6DYfG0QoAR67Iaq5BI4b0YeuUOrX-24Vhl4GvN_rFAnYKRPDqKKHiFRQ87icZ9etO3e_P_v8mqcTlJb4lLcBs4zhordWCvgIl1XTI_w69pfILjTGHnCi0tvjYxjpwnngWggao9fr7vbsNofO3Tlcx5rsLKEfa-DibOIoEkfEcn6eN5HKRixCGKpbGCNIH0eTezzmwOOj7kEfX8NjQB1UPpKuyARa1QOeevKxMGff7sKg' }} 
            style={styles.profileImage}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: 70,
    backgroundColor: 'rgba(19, 19, 19, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    padding: 4,
  },
  profileContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'rgba(124, 77, 255, 0.3)',
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
});
