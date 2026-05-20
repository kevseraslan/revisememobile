import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity,
  FlatList, ActivityIndicator, SafeAreaView, ImageBackground,
  Animated, StatusBar, Platform, Linking,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { WebView } from 'react-native-webview';
import { useRouter } from 'expo-router';
import { apiService } from '../services/api';

const { width, height } = Dimensions.get('window');
const ITEM_HEIGHT = height;

const TOPIC_CHIPS = [
  { label: '🎯 Tümü',      value: 'Tümü',      color: 'rgba(255,255,255,0.16)' },
  { label: '📐 Matematik', value: 'Matematik', color: '#6C3AFA' },
  { label: '📏 Geometri',  value: 'Geometri',  color: '#0EA5E9' },
  { label: '⚡ Fizik',     value: 'Fizik',     color: '#E34040' },
  { label: '🧪 Kimya',     value: 'Kimya',     color: '#17A779' },
  { label: '🧬 Biyoloji',  value: 'Biyoloji',  color: '#F4A019' },
];

interface ShortVideo {
  video_id: string;
  title: string;
  topic: string;
  sub_topic?: string;
  color: string;
  exam_type?: string;
  liked?: boolean;
  saved?: boolean;
}

/* ─── Single Card ─────────────────────────────────────────── */
function VideoCard({
  item,
  isActive,
  onLike,
  onSave,
  onScrollNext,
}: {
  item: ShortVideo;
  isActive: boolean;
  onLike: () => void;
  onSave: () => void;
  onScrollNext: () => void;
}) {
  const [playing, setPlaying] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Fade in card when active
  useEffect(() => {
    if (isActive) {
      setVideoError(false);
      Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start();
    } else {
      setPlaying(false);
      setVideoError(false);
      fadeAnim.setValue(0);
    }
  }, [isActive]);

  const thumbHQ = `https://img.youtube.com/vi/${item.video_id}/maxresdefault.jpg`;
  const thumbHD = `https://img.youtube.com/vi/${item.video_id}/hqdefault.jpg`;

  const embedHTML = `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{background:#000;display:flex;align-items:center;justify-content:center;height:100vh;overflow:hidden}
    iframe{width:100vw;height:100vh;border:none}
  </style>
</head>
<body>
  <iframe
    src="https://www.youtube-nocookie.com/embed/${item.video_id}?autoplay=1&playsinline=1&controls=1&modestbranding=1&rel=0&origin=https://www.youtube-nocookie.com"
    allow="autoplay; fullscreen; encrypted-media"
    allowfullscreen>
  </iframe>
</body>
</html>`;

  return (
    <Animated.View style={[styles.card, { opacity: isActive ? fadeAnim : 1 }]}>
      {/* Background: Player OR Thumbnail */}
      <View style={StyleSheet.absoluteFill}>
        {playing ? (
          <WebView
            source={{ html: embedHTML, baseUrl: 'https://www.youtube-nocookie.com' }}
            style={{ flex: 1, backgroundColor: '#000' }}
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            javaScriptEnabled
            scrollEnabled={false}
            bounces={false}
            userAgent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
            onError={() => { setVideoError(true); setPlaying(false); }}
            onHttpError={() => { setVideoError(true); setPlaying(false); }}
          />
        ) : (
          <ImageBackground
            source={{ uri: thumbHQ }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
            onError={() => {}} // fallback to hqdefault handled by YouTube
          >
            <View style={styles.thumbDim} />
            {/* Blurred bg + sharp center (like TikTok) */}
          </ImageBackground>
        )}
      </View>

      {/* Gradients */}
      {!playing && (
        <LinearGradient
          colors={['rgba(0,0,0,0.75)', 'transparent', 'rgba(0,0,0,0.95)']}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
      )}

      {/* Overlay UI – always on top */}
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">

        {/* Topic Badge + TYT/AYT Label */}
        <View style={styles.badgeRow}>
          <View style={[styles.badge, { backgroundColor: '#FF0000' }]}>
            <Text style={styles.badgeText}>{item.exam_type || 'TYT/AYT'}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: item.color }]}>
            <Text style={styles.badgeText}>{item.sub_topic || item.topic}</Text>
          </View>
        </View>

        {/* Play Button (center, only when not playing) */}
        {!playing && !videoError && (
          <TouchableOpacity style={styles.playCta} onPress={() => setPlaying(true)} activeOpacity={0.85}>
            <View style={styles.playRing}>
              <MaterialIcons name="play-arrow" size={52} color="#fff" style={{ marginLeft: 5 }} />
            </View>
            <Text style={styles.playLabel}>İZLE</Text>
          </TouchableOpacity>
        )}

        {/* Video Error Fallback */}
        {videoError && (
          <View style={styles.errorBox}>
            <MaterialIcons name="error-outline" size={36} color="rgba(255,255,255,0.5)" />
            <Text style={styles.errorTitle}>Bu Video Yüklenemedi</Text>
            <Text style={styles.errorSub}>Video bu uygulamada oynatılamıyor.</Text>
            <TouchableOpacity
              style={styles.ytBtn}
              onPress={() => Linking.openURL(`https://www.youtube.com/watch?v=${item.video_id}`)}
              activeOpacity={0.8}
            >
              <MaterialIcons name="open-in-new" size={18} color="#fff" />
              <Text style={styles.ytBtnText}>YouTube'da Aç</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.skipBtnSmall} onPress={onScrollNext}>
              <Text style={styles.skipBtnSmallText}>⏭ Sonraki Videoya Geç</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Bottom info */}
        <View style={styles.bottomInfo} pointerEvents="box-none">
          <Text style={styles.titleText} numberOfLines={2}>📖 {item.title}</Text>
          <Text style={styles.subtitleText}>1 Dakikada 1 Soru • Hemen izle</Text>

          {!playing && (
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.skipBtn} onPress={onScrollNext} activeOpacity={0.8}>
                <MaterialIcons name="skip-next" size={18} color="#fff" />
                <Text style={styles.skipBtnText}>Sonraki</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.watchBtn, { backgroundColor: item.color }]}
                onPress={() => setPlaying(true)}
                activeOpacity={0.8}
              >
                <MaterialIcons name="play-circle" size={18} color="#fff" />
                <Text style={styles.watchBtnText}>İzle</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Right actions */}
        <View style={styles.rightActions} pointerEvents="box-none">
          {/* Like */}
          <TouchableOpacity style={styles.actionBtn} onPress={onLike} activeOpacity={0.75}>
            <View style={[styles.iconCircle, item.liked && styles.iconLiked]}>
              <MaterialIcons
                name={item.liked ? 'favorite' : 'favorite-border'}
                size={26}
                color={item.liked ? '#f43f5e' : '#fff'}
              />
            </View>
            <Text style={styles.actionLabel}>Beğen</Text>
          </TouchableOpacity>

          {/* Save */}
          <TouchableOpacity style={styles.actionBtn} onPress={onSave} activeOpacity={0.75}>
            <View style={[styles.iconCircle, item.saved && styles.iconSaved]}>
              <MaterialIcons
                name={item.saved ? 'bookmark' : 'bookmark-border'}
                size={26}
                color={item.saved ? '#fbbf24' : '#fff'}
              />
            </View>
            <Text style={styles.actionLabel}>{item.saved ? 'Eklendi' : 'Kaydet'}</Text>
          </TouchableOpacity>

          {/* Watch again */}
          <TouchableOpacity style={styles.actionBtn} onPress={() => setPlaying(true)} activeOpacity={0.75}>
            <View style={styles.iconCircle}>
              <MaterialIcons name="smart-display" size={26} color="#fff" />
            </View>
            <Text style={styles.actionLabel}>İzle</Text>
          </TouchableOpacity>
        </View>

        {/* Stop playing button */}
        {playing && (
          <TouchableOpacity style={styles.stopBtn} onPress={() => setPlaying(false)}>
            <MaterialIcons name="close" size={22} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
}

/* ─── Main Screen ─────────────────────────────────────────── */
export default function AIShortsScreen() {
  const router = useRouter();
  const [videos, setVideos] = useState<ShortVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeTopic, setActiveTopic] = useState('Tümü');
  const [filterOpen, setFilterOpen] = useState(false);
  const filterHeight = useRef(new Animated.Value(0)).current;
  const flatRef = useRef<FlatList>(null);

  const toggleFilter = useCallback(() => {
    const toValue = filterOpen ? 0 : 108;
    Animated.timing(filterHeight, { toValue, duration: 260, useNativeDriver: false }).start();
    setFilterOpen(v => !v);
  }, [filterOpen]);

  const loadVideos = useCallback(async (count = 1, reset = false) => {
    try {
      if (reset) {
        setLoading(true);
      } else {
        setFetchingMore(true);
      }
      const newVids: ShortVideo[] = [];
      for (let i = 0; i < count; i++) {
        const res = await apiService.fetchYouTubeShort(activeTopic);
        if (res?.success && res?.data) {
          newVids.push({ ...res.data, liked: false, saved: false });
        }
      }
      if (reset) {
        setVideos(newVids);
      } else {
        setVideos(prev => [...prev, ...newVids]);
      }
    } catch (e) {
      console.error('Shorts load error:', e);
    } finally {
      setLoading(false);
      setFetchingMore(false);
    }
  }, [activeTopic]);

  useEffect(() => {
    loadVideos(5, true);
  }, [activeTopic]);

  const handleTopicChange = (topic: string) => {
    if (topic === activeTopic) return;
    setActiveTopic(topic);
    setActiveIndex(0);
    Animated.timing(filterHeight, { toValue: 0, duration: 220, useNativeDriver: false }).start();
    setFilterOpen(false);
  };

  const scrollNext = () => {
    const nextIdx = activeIndex + 1;
    if (nextIdx < videos.length) {
      flatRef.current?.scrollToIndex({ index: nextIdx, animated: true });
    }
  };

  const toggleLike = (index: number) => {
    setVideos(prev =>
      prev.map((v, i) => (i === index ? { ...v, liked: !v.liked } : v))
    );
  };

  const toggleSave = async (index: number) => {
    const vid = videos[index];
    if (vid.saved) return;
    setVideos(prev => prev.map((v, i) => (i === index ? { ...v, saved: true } : v)));
    try {
      await apiService.handleShortAction(vid, 'bookmark');
    } catch (e) {
      console.error(e);
    }
  };

  const renderItem = ({ item, index }: { item: ShortVideo; index: number }) => (
    <VideoCard
      item={item}
      isActive={index === activeIndex}
      onLike={() => toggleLike(index)}
      onSave={() => toggleSave(index)}
      onScrollNext={scrollNext}
    />
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <View style={styles.loaderSpinner} />
        <Text style={styles.loaderText}>Videolar Yükleniyor…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Filter bar */}
      <Animated.View style={[styles.filterBar, { height: filterHeight }]}>
        <View style={styles.filterInner}>
          <Text style={styles.filterLabel}>KONU FİLTRELE</Text>
          <View style={styles.chipsRow}>
            {TOPIC_CHIPS.map(chip => {
              const active = chip.value === activeTopic;
              return (
                <TouchableOpacity
                  key={chip.value}
                  style={[styles.chip, active && { backgroundColor: chip.color, borderColor: 'transparent' }]}
                  onPress={() => handleTopicChange(chip.value)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.chipText, active && { color: '#fff' }]}>{chip.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Animated.View>

      {/* Feed */}
      <FlatList
        ref={flatRef}
        data={videos}
        renderItem={renderItem}
        keyExtractor={(item, i) => item.video_id + i}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={ITEM_HEIGHT}
        snapToAlignment="start"
        bounces={false}
        onMomentumScrollEnd={e => {
          const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
          setActiveIndex(idx);
        }}
        onEndReached={() => { if (!fetchingMore) loadVideos(3); }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          fetchingMore ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator color="#7c4dff" />
            </View>
          ) : null
        }
        getItemLayout={(_, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
      />

      {/* Absolute header */}
      <SafeAreaView style={styles.header} pointerEvents="box-none">
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.brandBox}>
          <Text style={styles.brandText}>ReviseMe <Text style={styles.brandAccent}>Shorts</Text></Text>
          <View style={styles.liveDot} />
        </View>
        <TouchableOpacity style={styles.filterBtn} onPress={toggleFilter}>
          <MaterialIcons name="tune" size={22} color="#fff" />
        </TouchableOpacity>
      </SafeAreaView>

      {/* Progress bar */}
      {videos.length > 0 && (
        <View style={styles.progressTrack} pointerEvents="none">
          <View
            style={[
              styles.progressFill,
              { width: `${((activeIndex + 1) / videos.length) * 100}%` },
            ]}
          />
        </View>
      )}
    </View>
  );
}

/* ─── Styles ──────────────────────────────────────────────── */
const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#000' },

  loader: {
    flex: 1, backgroundColor: '#000',
    justifyContent: 'center', alignItems: 'center', gap: 20,
  },
  loaderSpinner: {
    width: 52, height: 52, borderRadius: 26,
    borderWidth: 4, borderColor: 'rgba(108,58,250,0.25)',
    borderTopColor: '#6C3AFA',
  },
  loaderText: {
    color: 'rgba(255,255,255,0.5)', fontSize: 12,
    fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.2,
  },

  /* Card */
  card: { width, height: ITEM_HEIGHT, backgroundColor: '#0d0d0d', overflow: 'hidden' },
  thumbDim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },

  badge: {
    paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 10, zIndex: 5,
  },
  badgeRow: {
    position: 'absolute', top: 90, left: 16,
    flexDirection: 'row', gap: 8, zIndex: 5,
  },
  badgeText: {
    color: '#fff', fontSize: 10, fontWeight: '900',
    textTransform: 'uppercase', letterSpacing: 1.4,
  },

  playCta: {
    position: 'absolute', top: '42%', alignSelf: 'center',
    alignItems: 'center', gap: 12, zIndex: 5,
    left: width / 2 - 45,
  },
  playRing: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.38)',
    justifyContent: 'center', alignItems: 'center',
  },
  playLabel: {
    color: 'rgba(255,255,255,0.75)', fontSize: 13,
    fontWeight: '800', letterSpacing: 2,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4,
  },

  bottomInfo: { position: 'absolute', bottom: 32, left: 16, right: 76, zIndex: 5 },
  titleText: {
    color: '#fff', fontSize: 17, fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4,
  },
  subtitleText: {
    color: 'rgba(255,255,255,0.5)', fontSize: 11,
    fontWeight: '600', marginTop: 4, marginBottom: 14,
  },
  actionRow: { flexDirection: 'row', gap: 10 },
  skipBtn: {
    flex: 1, height: 46, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 6,
  },
  skipBtnText: {
    color: '#fff', fontSize: 12, fontWeight: '800',
    textTransform: 'uppercase', letterSpacing: 0.8,
  },
  watchBtn: {
    flex: 1, height: 46, borderRadius: 14,
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 6,
  },
  watchBtnText: { color: '#fff', fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },

  rightActions: { position: 'absolute', right: 14, bottom: 120, alignItems: 'center', gap: 22, zIndex: 5 },
  actionBtn:    { alignItems: 'center', gap: 5 },
  iconCircle: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.48)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center', alignItems: 'center',
  },
  iconLiked: { backgroundColor: 'rgba(244,63,94,0.15)', borderColor: 'rgba(244,63,94,0.3)' },
  iconSaved: { backgroundColor: 'rgba(251,191,36,0.15)', borderColor: 'rgba(251,191,36,0.3)' },
  actionLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: '700' },

  stopBtn: {
    position: 'absolute', top: 56, right: 16,
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center', zIndex: 20,
  },

  /* Header */
  header: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 15,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? 44 : 12, paddingBottom: 12,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center', alignItems: 'center',
  },
  brandBox:   { flexDirection: 'row', alignItems: 'center', gap: 6 },
  brandText:  { color: '#fff', fontSize: 17, fontWeight: '900' },
  brandAccent:{ color: '#a78bfa' },
  liveDot: {
    width: 7, height: 7, borderRadius: 3.5,
    backgroundColor: '#f43f5e',
  },
  filterBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center', alignItems: 'center',
  },

  /* Filter bar */
  filterBar: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
    backgroundColor: 'rgba(6,6,10,0.95)',
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)',
    overflow: 'hidden',
  },
  filterInner: { paddingTop: Platform.OS === 'android' ? 88 : 60, paddingHorizontal: 16, paddingBottom: 14 },
  filterLabel: {
    color: 'rgba(255,255,255,0.4)', fontSize: 10,
    fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10,
  },
  chipsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 40,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  chipText: { color: 'rgba(255,255,255,0.55)', fontSize: 12, fontWeight: '700' },

  /* Progress */
  progressTrack: {
    position: 'absolute', top: 0, left: 0, right: 0,
    height: 2.5, backgroundColor: 'rgba(255,255,255,0.08)', zIndex: 25,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6C3AFA',
    borderTopRightRadius: 2, borderBottomRightRadius: 2,
  },


  footerLoader: { height: ITEM_HEIGHT, justifyContent: 'center', alignItems: 'center' },

  /* Error fallback */
  errorBox: {
    position: 'absolute', top: '35%', left: 24, right: 24,
    alignItems: 'center', gap: 12, zIndex: 10,
    backgroundColor: 'rgba(10,10,20,0.82)',
    borderRadius: 20, padding: 28,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  errorTitle: {
    color: '#fff', fontSize: 16, fontWeight: '800',
    textAlign: 'center',
  },
  errorSub: {
    color: 'rgba(255,255,255,0.45)', fontSize: 12,
    fontWeight: '500', textAlign: 'center',
  },
  ytBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#FF0000', borderRadius: 12,
    paddingHorizontal: 22, paddingVertical: 12, marginTop: 6,
  },
  ytBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  skipBtnSmall: { marginTop: 4, padding: 8 },
  skipBtnSmallText: {
    color: 'rgba(255,255,255,0.5)', fontSize: 12,
    fontWeight: '600', textDecorationLine: 'underline',
  },
});

