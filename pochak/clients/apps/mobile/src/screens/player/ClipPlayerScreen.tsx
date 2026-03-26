import React, {useState, useCallback, useEffect, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
  Share,
  Modal,
  ScrollView,
  FlatList,
  ViewToken,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Ionicons, MaterialIcons, MaterialCommunityIcons} from '@expo/vector-icons';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RouteProp} from '@react-navigation/native';
import type {RootStackParamList} from '../../navigation/types';
import {colors} from '../../theme';
import {useVideoPlayer, VideoView} from 'expo-video';
import {contentService} from '../../api/contentService';
import {getClipShareUrl} from '../../utils/shareUrl';
import CommentSection from '../../components/player/CommentSection';
import ClipInteractionOverlay from '../../components/clip/ClipInteractionOverlay';
import {useClipInteraction} from '../../hooks/useClipInteraction';
import {
  mockRecommendedClips,
  formatViewCount,
} from '../../services/clipApi';
import type {ClipItem} from '../../services/clipApi';

type ClipPlayerNavProp = NativeStackNavigationProp<RootStackParamList>;
type ClipPlayerRouteProp = RouteProp<RootStackParamList, 'ClipPlayer'>;

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

// HLS test streams as fallback video URLs
const CLIP_STREAMS = [
  'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
  'https://devstreaming-cdn.apple.com/videos/streaming/examples/bipbop_16x9/bipbop_16x9_variant.m3u8',
];

function getClipStreamUrl(index: number): string {
  return CLIP_STREAMS[index % CLIP_STREAMS.length];
}

// Build a feed starting from the given contentId
function buildClipFeed(startId: string): ClipItem[] {
  const startIndex = mockRecommendedClips.findIndex(c => c.id === startId);
  if (startIndex === -1) {
    return mockRecommendedClips;
  }
  // Put the selected clip first, then the rest
  return [
    ...mockRecommendedClips.slice(startIndex),
    ...mockRecommendedClips.slice(0, startIndex),
  ];
}

// --- Single Clip Item in the swipeable feed ---

function ClipFeedItem({
  item,
  isActive,
  index,
  topInset,
}: {
  item: ClipItem;
  isActive: boolean;
  index: number;
  topInset: number;
}) {
  const navigation = useNavigation<ClipPlayerNavProp>();
  const [isLiked, setIsLiked] = useState(item.isLiked);
  const [likeCount, setLikeCount] = useState(item.likeCount);
  const [isMuted, setIsMuted] = useState(false);
  const [showMoreSheet, setShowMoreSheet] = useState(false);
  const [showCommentSheet, setShowCommentSheet] = useState(false);

  const streamUrl = item.videoUrl || getClipStreamUrl(index);

  const player = useVideoPlayer(streamUrl, p => {
    p.loop = true;
    p.muted = false;
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
    isActive,
    isLiked,
    onLike: handleLike,
  });

  // Auto-play/pause based on visibility (respects manual pause)
  useEffect(() => {
    if (isActive && !isManuallyPaused) {
      player.play();
    } else if (!isActive) {
      player.pause();
    }
  }, [isActive, player, isManuallyPaused]);

  // Sync mute state
  useEffect(() => {
    player.muted = isMuted;
  }, [isMuted, player]);

  const handleToggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  const handleShare = useCallback(async () => {
    try {
      const shareUrl = getClipShareUrl(item.id);
      await Share.share({
        message: `Pochak에서 클립을 시청하세요! - ${item.title}`,
        url: shareUrl,
      });
    } catch {
      // User cancelled or error
    }
  }, [item.id, item.title]);

  const handleFullMatch = useCallback(() => {
    navigation.navigate('Player', {contentType: 'vod', contentId: item.id});
  }, [navigation, item.id]);

  return (
    <View style={styles.clipItem}>
      {/* Full-screen vertical video with interaction overlay */}
      <VideoView
        player={player}
        style={styles.video}
        contentFit="cover"
        nativeControls={false}
      />
      <ClipInteractionOverlay
        onPress={handleVideoPress}
        pauseIcon={pauseIcon}
        pauseOpacity={pauseOpacity}
        heartScale={heartScale}
        heartOpacity={heartOpacity}
        progress={progress}>
        {/* Transparent child — video is rendered behind via absolute positioning */}
        <View style={styles.video} />
      </ClipInteractionOverlay>

      {/* Top-right controls: Sound + AI badge */}
      <View style={[styles.topRightControls, {top: topInset + 12}]}>
        <TouchableOpacity
          style={styles.overlayChip}
          onPress={handleToggleMute}>
          <Ionicons
            name={isMuted ? 'volume-mute' : 'volume-high'}
            size={18}
            color={colors.white}
          />
        </TouchableOpacity>
        <View style={styles.aiBadge}>
          <MaterialCommunityIcons
            name="robot"
            size={16}
            color={colors.white}
          />
          <Text style={styles.aiBadgeText}>AI</Text>
        </View>
      </View>

      {/* Right side action buttons */}
      <View style={styles.rightActions}>
        <TouchableOpacity style={styles.sideActionBtn} onPress={handleLike}>
          <Ionicons
            name={isLiked ? 'heart' : 'heart-outline'}
            size={28}
            color={isLiked ? '#E51728' : colors.white}
          />
          <Text style={styles.sideActionText}>
            {formatViewCount(likeCount)}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.sideActionBtn}
          onPress={() => setShowCommentSheet(true)}>
          <Ionicons name="chatbubble-outline" size={26} color={colors.white} />
          <Text style={styles.sideActionText}>0</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sideActionBtn} onPress={handleShare}>
          <Ionicons
            name="share-social-outline"
            size={26}
            color={colors.white}
          />
          <Text style={styles.sideActionText}>
            {formatViewCount(item.shareCount)}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.sideActionBtn}
          onPress={() => setShowMoreSheet(true)}>
          <Ionicons
            name="ellipsis-horizontal"
            size={26}
            color={colors.white}
          />
        </TouchableOpacity>
      </View>

      {/* Bottom overlay content */}
      <View style={styles.bottomOverlay}>
        {/* Creator */}
        <View style={styles.creatorRow}>
          <View style={styles.creatorAvatar}>
            <Text style={styles.creatorAvatarText}>{item.creatorAvatar}</Text>
          </View>
          <Text style={styles.creatorName}>{item.creatorName}</Text>
        </View>

        {/* Title */}
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>

        {/* Competition info + date + like count */}
        <Text style={styles.infoText}>
          {item.competitionName} | {item.createdAt.split(' ')[0]} |{' '}
          {formatViewCount(item.likeCount)} 좋아요
        </Text>

        {/* Full match link */}
        <TouchableOpacity
          style={styles.fullMatchLink}
          onPress={handleFullMatch}>
          <MaterialIcons
            name="play-circle-outline"
            size={16}
            color={colors.green}
          />
          <Text style={styles.fullMatchLinkText}>풀 경기 보러가기</Text>
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

      {/* Comment Bottom Sheet */}
      <Modal
        visible={showCommentSheet}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCommentSheet(false)}>
        <TouchableOpacity
          style={styles.commentSheetBackdrop}
          activeOpacity={1}
          onPress={() => setShowCommentSheet(false)}>
          <View
            style={styles.commentSheet}
            onStartShouldSetResponder={() => true}>
            <View style={styles.commentSheetHandle} />
            <Text style={styles.commentSheetTitle}>댓글</Text>
            <ScrollView
              style={styles.commentSheetScroll}
              showsVerticalScrollIndicator={false}>
              <CommentSection contentType="clip" contentId={item.id} />
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* More Bottom Sheet */}
      {showMoreSheet && (
        <TouchableOpacity
          style={styles.sheetBackdrop}
          activeOpacity={1}
          onPress={() => setShowMoreSheet(false)}>
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHandle} />
            {[
              {
                label: '공유하기',
                icon: 'share' as const,
                onPress: () => {
                  setShowMoreSheet(false);
                  handleShare();
                },
              },
              {
                label: '신고하기',
                icon: 'flag' as const,
                onPress: () => {
                  setShowMoreSheet(false);
                },
              },
            ].map((menuItem, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.sheetItem}
                onPress={menuItem.onPress}>
                <MaterialIcons
                  name={menuItem.icon}
                  size={22}
                  color={colors.white}
                  style={styles.sheetItemIcon}
                />
                <Text style={styles.sheetItemText}>{menuItem.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

// --- Main ClipPlayerScreen ---

export default function ClipPlayerScreen() {
  const navigation = useNavigation<ClipPlayerNavProp>();
  const route = useRoute<ClipPlayerRouteProp>();
  const insets = useSafeAreaInsets();
  const {contentId} = route.params;

  const [currentIndex, setCurrentIndex] = useState(0);
  const clipFeed = useRef(buildClipFeed(contentId)).current;

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

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
      length: SCREEN_HEIGHT,
      offset: SCREEN_HEIGHT * index,
      index,
    }),
    [],
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      <FlatList
        data={clipFeed}
        keyExtractor={item => item.id}
        renderItem={({item, index}) => (
          <ClipFeedItem
            item={item}
            isActive={index === currentIndex}
            index={index}
            topInset={insets.top}
          />
        )}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={SCREEN_HEIGHT}
        decelerationRate="fast"
        scrollEventThrottle={16}
        getItemLayout={getItemLayout}
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={onViewableItemsChanged}
      />

      {/* Back button (top-left, floating above FlatList) */}
      <TouchableOpacity style={[styles.backButton, {top: insets.top + 12}]} onPress={handleGoBack}>
        <Ionicons name="arrow-back" size={24} color={colors.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  clipItem: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: '#000',
  },
  video: {
    ...StyleSheet.absoluteFillObject,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },

  // Back button
  backButton: {
    position: 'absolute',
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },

  // Top-right controls
  topRightControls: {
    position: 'absolute',
    right: 16,
    gap: 10,
    alignItems: 'center',
    zIndex: 10,
  },
  overlayChip: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  aiBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.white,
  },

  // Right side actions (Shorts-style)
  rightActions: {
    position: 'absolute',
    right: 12,
    bottom: 200,
    alignItems: 'center',
    gap: 16,
    zIndex: 5,
  },
  sideActionBtn: {
    alignItems: 'center',
  },
  sideActionText: {
    fontSize: 11,
    color: colors.white,
    marginTop: 2,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 3,
  },

  // Bottom overlay
  bottomOverlay: {
    position: 'absolute',
    bottom: 32,
    left: 12,
    right: 60,
    zIndex: 5,
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
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  creatorAvatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 2,
  },
  creatorName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.green,
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 4,
  },
  infoText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 10,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 3,
  },
  fullMatchLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,200,83,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  fullMatchLinkText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.green,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 3,
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
    color: colors.white,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 3,
  },

  // Comment sheet
  commentSheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
    zIndex: 20,
  },
  commentSheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingTop: 8,
    paddingBottom: 16,
  },
  commentSheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.grayDark,
    alignSelf: 'center',
    marginBottom: 8,
  },
  commentSheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
    textAlign: 'center',
    marginBottom: 8,
  },
  commentSheetScroll: {
    flex: 1,
  },

  // More sheet
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    zIndex: 20,
  },
  bottomSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
    paddingBottom: 32,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.grayDark,
    alignSelf: 'center',
    marginBottom: 12,
  },
  sheetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  sheetItemIcon: {
    marginRight: 12,
  },
  sheetItemText: {
    fontSize: 16,
    color: colors.white,
  },
});
