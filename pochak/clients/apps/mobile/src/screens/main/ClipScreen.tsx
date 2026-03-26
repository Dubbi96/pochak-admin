import React, {useState, useRef, useCallback, useEffect, useMemo} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Dimensions,
  ViewToken,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Ionicons, MaterialIcons, MaterialCommunityIcons} from '@expo/vector-icons';
import {useNavigation, useIsFocused} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../navigation/types';
import MediaImage from '../../components/common/MediaImage';
import {colors} from '../../theme';
import {useVideoPlayer, VideoView} from 'expo-video';
import ClipInteractionOverlay from '../../components/clip/ClipInteractionOverlay';
import {useClipInteraction} from '../../hooks/useClipInteraction';
import {contentService} from '../../api/contentService';
import {
  mockRecommendedClips,
  mockPopularClips,
  formatViewCount,
} from '../../services/clipApi';
import type {ClipItem, PopularClipItem} from '../../services/clipApi';

type ClipNavProp = NativeStackNavigationProp<RootStackParamList>;

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');
const GREEN = colors.green;
const BG = colors.bg;
const SURFACE = colors.surface;
const WHITE = colors.white;
const GRAY = colors.gray;
const GRAY_LIGHT = colors.grayLight;
const GRAY_DARK = colors.grayDark;

type SortMode = '인기순' | '최근순';

// HLS test streams as fallback video URLs
const CLIP_STREAMS = [
  'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
  'https://devstreaming-cdn.apple.com/videos/streaming/examples/bipbop_16x9/bipbop_16x9_variant.m3u8',
];

function getClipStreamUrl(index: number): string {
  return CLIP_STREAMS[index % CLIP_STREAMS.length];
}

// --- Recommended Tab: Full-screen vertical Shorts-like player ---

function RecommendedClipItem({
  item,
  isActive,
  clipHeight,
  index,
  isFocused,
}: {
  item: ClipItem;
  isActive: boolean;
  clipHeight: number;
  index: number;
  isFocused: boolean;
}) {
  const [isMuted, setIsMuted] = useState(false);
  const [isLiked, setIsLiked] = useState(item.isLiked);
  const [likeCount, setLikeCount] = useState(item.likeCount);
  const navigation = useNavigation<ClipNavProp>();
  const streamUrl = item.videoUrl || getClipStreamUrl(index);

  const player = useVideoPlayer(streamUrl, p => {
    p.loop = true;
    p.muted = isMuted;
  });

  const handleLike = useCallback(async () => {
    const wasLiked = isLiked;
    const prevCount = likeCount;
    setIsLiked(!wasLiked);
    setLikeCount(wasLiked ? prevCount - 1 : prevCount + 1);
    try {
      await contentService.likeContent(item.id, 'clip');
    } catch {
      setIsLiked(wasLiked);
      setLikeCount(prevCount);
    }
  }, [isLiked, likeCount, item.id]);

  // Clip interaction hook (tap-to-pause, double-tap-to-like, progress bar)
  const {
    handleVideoPress,
    pauseIcon,
    pauseOpacity,
    heartScale,
    heartOpacity,
    progress,
    isManuallyPaused,
  } = useClipInteraction({
    player,
    isActive: isActive && isFocused,
    isLiked,
    onLike: handleLike,
  });

  // Auto-play/pause based on visibility AND tab focus
  useEffect(() => {
    if (isActive && isFocused && !isManuallyPaused) {
      player.play();
    } else {
      player.pause();
    }
  }, [isActive, isFocused, player, isManuallyPaused]);

  // Sync mute state
  useEffect(() => {
    player.muted = isMuted;
  }, [isMuted, player]);

  const handleToggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  return (
    <View style={[styles.fullClipContainer, {height: clipHeight}]}>
      {/* Video Area */}
      <View style={styles.videoArea}>
        <VideoView
          player={player}
          style={styles.videoView}
          contentFit="cover"
          nativeControls={false}
        />

        {/* Interaction overlay (tap-to-pause, double-tap heart, progress bar) */}
        <ClipInteractionOverlay
          onPress={handleVideoPress}
          pauseIcon={pauseIcon}
          pauseOpacity={pauseOpacity}
          heartScale={heartScale}
          heartOpacity={heartOpacity}
          progress={progress}>
          <View style={styles.videoView} />
        </ClipInteractionOverlay>

        {/* Top Right Buttons */}
        <View style={styles.topRightButtons}>
          <TouchableOpacity
            style={styles.soundButton}
            onPress={handleToggleMute}>
            <Ionicons
              name={isMuted ? 'volume-mute' : 'volume-high'}
              size={20}
              color={WHITE}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.aiButton}>
            <MaterialCommunityIcons name="robot" size={20} color={WHITE} />
            <Text style={styles.aiButtonText}>AI</Text>
          </TouchableOpacity>
        </View>

        {/* Right Side Action Buttons */}
        <View style={styles.rightActions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={28}
              color={isLiked ? '#E51728' : WHITE}
            />
            <Text style={styles.actionCount}>
              {formatViewCount(likeCount)}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="chatbubble-outline" size={26} color={WHITE} />
            <Text style={styles.actionCount}>0</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="share-social-outline" size={26} color={WHITE} />
            <Text style={styles.actionCount}>
              {formatViewCount(item.shareCount)}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="ellipsis-horizontal" size={26} color={WHITE} />
          </TouchableOpacity>
        </View>

        {/* Bottom Info */}
        <View style={styles.bottomInfo}>
          {/* Creator */}
          <View style={styles.creatorRow}>
            <View style={styles.creatorAvatar}>
              <Text style={styles.creatorAvatarText}>
                {item.creatorAvatar}
              </Text>
            </View>
            <Text style={styles.creatorName}>{item.creatorName}</Text>
          </View>

          {/* Title (green link) */}
          <Text style={styles.clipTitle}>{item.title}</Text>

          {/* Meta */}
          <Text style={styles.clipMeta}>
            {item.competitionName} | {item.createdAt.split(' ')[0]} |{' '}
            {formatViewCount(likeCount)} 좋아요
          </Text>

          {/* Full Match Button */}
          <TouchableOpacity
            style={styles.fullMatchButton}
            onPress={() =>
              navigation.navigate('Player', {
                contentType: 'vod',
                contentId: item.id,
              })
            }>
            <MaterialIcons
              name="play-circle-outline"
              size={16}
              color={GREEN}
            />
            <Text style={styles.fullMatchText}>풀 경기 보러가기</Text>
          </TouchableOpacity>

          {/* Tags */}
          <View style={styles.tagsRow}>
            {item.tags.map(tag => (
              <View key={tag} style={styles.tagChip}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

function RecommendedTab({clipHeight, isFocused}: {clipHeight: number; isFocused: boolean}) {
  const flatListRef = useRef<FlatList<ClipItem>>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const onViewableItemsChanged = useRef(
    ({viewableItems}: {viewableItems: ViewToken[]}) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setCurrentIndex(viewableItems[0].index);
      }
    },
  ).current;

  const getItemLayout = useCallback(
    (_data: ArrayLike<ClipItem> | null | undefined, index: number) => ({
      length: clipHeight,
      offset: clipHeight * index,
      index,
    }),
    [clipHeight],
  );

  return (
    <FlatList
      key="recommended-1"
      ref={flatListRef}
      data={mockRecommendedClips}
      keyExtractor={item => item.id}
      renderItem={({item, index}) => (
        <RecommendedClipItem
          item={item}
          isActive={index === currentIndex}
          clipHeight={clipHeight}
          index={index}
          isFocused={isFocused}
        />
      )}
      pagingEnabled
      showsVerticalScrollIndicator={false}
      snapToInterval={clipHeight}
      decelerationRate="fast"
      scrollEventThrottle={16}
      getItemLayout={getItemLayout}
      style={{height: clipHeight}}
      viewabilityConfig={viewabilityConfig}
      onViewableItemsChanged={onViewableItemsChanged}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor="#00CC33"
        />
      }
    />
  );
}

// --- Popular Tab: 2-column grid ---

function PopularClipCard({item}: {item: PopularClipItem}) {
  const navigation = useNavigation<ClipNavProp>();

  return (
    <TouchableOpacity
      style={styles.popularCard}
      onPress={() =>
        navigation.navigate('ClipPlayer', {contentId: item.id})
      }>
      <View style={styles.popularThumbnail}>
        <MediaImage
          uri={item.thumbnailUrl}
          style={styles.popularThumbnailImage}
        />
        <View style={styles.popularDuration}>
          <Text style={styles.popularDurationText}>{item.duration}</Text>
        </View>
      </View>
      <Text style={styles.popularTitle} numberOfLines={1}>
        {item.title}
      </Text>
      <Text style={styles.popularDesc} numberOfLines={1}>
        {item.description}
      </Text>
      <Text style={styles.popularViews}>
        조회수 {formatViewCount(item.viewCount)}
      </Text>
    </TouchableOpacity>
  );
}

function PopularTab() {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  return (
    <FlatList
      key="popular-2"
      data={mockPopularClips}
      keyExtractor={item => item.id}
      numColumns={2}
      columnWrapperStyle={styles.popularRow}
      contentContainerStyle={styles.popularContainer}
      showsVerticalScrollIndicator={false}
      renderItem={({item}) => <PopularClipCard item={item} />}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor="#00CC33"
        />
      }
    />
  );
}

// --- Main Component ---

export default function ClipScreen() {
  const [sortMode, setSortMode] = useState<SortMode>('인기순');
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const navigation = useNavigation<ClipNavProp>();

  // Tab bar always visible — always deduct its height
  const HEADER_HEIGHT = 56;
  const TAB_BAR_HEIGHT = 56;
  const clipHeight = SCREEN_HEIGHT - HEADER_HEIGHT - insets.top - TAB_BAR_HEIGHT - insets.bottom;

  return (
    <View style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header: back button + sort options */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.headerBackBtn}>
            <Ionicons name="arrow-back" size={22} color={WHITE} />
          </TouchableOpacity>
          <View style={styles.headerSortRow}>
            {(['인기순', '최근순'] as const).map(mode => (
              <TouchableOpacity
                key={mode}
                onPress={() => setSortMode(mode)}>
                <Text
                  style={[
                    styles.headerSortText,
                    sortMode === mode && styles.headerSortTextActive,
                  ]}>
                  {mode}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Content: always show recommended (Shorts) mode */}
        <RecommendedTab clipHeight={clipHeight} isFocused={isFocused} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG,
  },
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  headerBackBtn: {
    marginRight: 12,
    padding: 4,
  },
  headerSortRow: {
    flexDirection: 'row',
    gap: 16,
  },
  headerSortText: {
    fontSize: 15,
    fontWeight: '500',
    color: GRAY,
  },
  headerSortTextActive: {
    color: WHITE,
    fontWeight: '700',
  },
  // Full-screen clip
  fullClipContainer: {
    width: SCREEN_WIDTH,
  },
  videoArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoView: {
    width: '100%',
    height: '100%',
  },
  // Top Right Buttons
  topRightButtons: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    gap: 8,
  },
  soundButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    gap: 4,
  },
  aiButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: WHITE,
  },
  // Right Actions
  rightActions: {
    position: 'absolute',
    right: 12,
    bottom: 200,
    alignItems: 'center',
    gap: 16,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionCount: {
    fontSize: 11,
    color: WHITE,
    marginTop: 2,
  },
  // Bottom Info
  bottomInfo: {
    position: 'absolute',
    bottom: 16,
    left: 12,
    right: 60,
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  creatorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  creatorAvatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: WHITE,
  },
  creatorName: {
    fontSize: 14,
    fontWeight: '600',
    color: WHITE,
  },
  clipTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: GREEN,
    marginBottom: 4,
  },
  clipMeta: {
    fontSize: 12,
    color: GRAY_LIGHT,
    marginBottom: 8,
  },
  fullMatchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,200,83,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 8,
    gap: 4,
  },
  fullMatchText: {
    fontSize: 12,
    fontWeight: '600',
    color: GREEN,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagChip: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 11,
    color: WHITE,
  },
  // Popular Tab
  popularContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  popularRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  popularCard: {
    width: (SCREEN_WIDTH - 48) / 2,
  },
  popularThumbnail: {
    width: '100%',
    height: ((SCREEN_WIDTH - 48) / 2) * (16 / 9),
    borderRadius: 8,
    backgroundColor: SURFACE,
    overflow: 'hidden',
  },
  popularThumbnailImage: {
    width: '100%',
    height: '100%',
  },
  popularDuration: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  popularDurationText: {
    fontSize: 10,
    color: WHITE,
    fontWeight: '600',
  },
  popularTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: WHITE,
    marginTop: 6,
  },
  popularDesc: {
    fontSize: 11,
    color: GRAY,
    marginTop: 2,
  },
  popularViews: {
    fontSize: 11,
    color: GRAY_LIGHT,
    marginTop: 2,
  },
});
