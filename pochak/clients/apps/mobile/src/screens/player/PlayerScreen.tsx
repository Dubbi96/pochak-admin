import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Ionicons, MaterialIcons} from '@expo/vector-icons';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../navigation/types';
import {colors} from '../../theme';
import {playerService} from '../../api/playerService';
import type {PlayerData, TimelineEvent} from '../../api/playerService';
import type {Chapter} from '../../components/player/ControlOverlay';
import {useFullscreen} from '../../hooks/useFullscreen';
import VideoPlayer from '../../components/player/VideoPlayer';
import type {VideoPlayerHandle} from '../../components/player/VideoPlayer';
import CommentSection from '../../components/player/CommentSection';
import RelatedContentList from '../../components/player/RelatedContentList';
import TimelineCardList from '../../components/player/TimelineCardList';
import ClipCreationOverlay from '../../components/player/ClipCreationOverlay';
import LiveCountdown from '../../components/player/LiveCountdown';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Props = NativeStackScreenProps<RootStackParamList, 'Player'>;

type PlayerTab = '추천영상' | '관련영상' | '내클립';

// ---------------------------------------------------------------------------
// Chapter generation
// ---------------------------------------------------------------------------

function generateChapters(timeline: TimelineEvent[]): Chapter[] {
  const periodEvents = timeline
    .filter(e => e.type === 'PERIOD')
    .sort((a, b) => a.time - b.time);

  if (periodEvents.length < 2) return [];

  const chapters: Chapter[] = [];

  for (let i = 0; i < periodEvents.length - 1; i++) {
    const current = periodEvents[i];
    const next = periodEvents[i + 1];

    let title: string;
    let type: Chapter['type'];

    if (current.label === '경기 시작' && next.label === '하프타임') {
      title = '전반';
      type = 'HALF';
    } else if (current.label === '하프타임' && next.label === '후반 시작') {
      title = '하프타임';
      type = 'BREAK';
    } else if (current.label === '후반 시작' && next.label === '경기 종료') {
      title = '후반';
      type = 'HALF';
    } else {
      title = `${current.label} ~ ${next.label}`;
      type = 'CUSTOM';
    }

    chapters.push({
      id: `ch-${i}`,
      title,
      type,
      startTime: current.time,
      endTime: next.time,
    });
  }

  return chapters;
}

// ---------------------------------------------------------------------------
// Analytics & watch history (mock)
// ---------------------------------------------------------------------------

function logAnalytics(event: string, params?: Record<string, unknown>) {
  // eslint-disable-next-line no-console
  console.log(`[Analytics] ${event}`, params ?? '');
}

function logWatchProgress(contentId: string, position: number) {
  // eslint-disable-next-line no-console
  console.log(`[UserService] recordWatchProgress`, {contentId, position});
}

// ---------------------------------------------------------------------------
// Mock data for sections below the player
// ---------------------------------------------------------------------------

const MOCK_TAGS = ['야구', '유료', '해설', 'MLB', '동대문구리틀야구', '군자초등학교'];

const MOCK_RELATED_ITEMS = [
  {id: 'r1', title: '전북 현대 vs 인천 유나이티드', subtitle: 'K리그1 5라운드', tags: ['축구', '무료']},
  {id: 'r2', title: '울산 HD vs 수원 FC', subtitle: 'K리그1 6라운드', tags: ['축구', '유료']},
  {id: 'r3', title: '포항 스틸러스 vs 대전 하나 시티즌', subtitle: 'K리그1 6라운드', tags: ['축구', '유료']},
  {id: 'r4', title: '제주 유나이티드 vs FC서울', subtitle: 'K리그1 6라운드', tags: ['축구', '무료']},
];

const MOCK_CLIP_ITEMS = [
  {id: 'c1', title: '결승골 장면', viewCount: 1200, likeCount: 340},
  {id: 'c2', title: '슈퍼 세이브 모음', viewCount: 800, likeCount: 120},
  {id: 'c3', title: '하이라이트 클립', viewCount: 2000, likeCount: 560},
  {id: 'c4', title: '베스트 플레이', viewCount: 450, likeCount: 90},
];

const MOCK_NEXT_VIDEO = {
  id: 'next-1',
  title: '전북 현대 vs 인천 유나이티드',
  subtitle: 'K리그1 5라운드',
};

const MOCK_MY_CLIPS = [
  {id: 'mc1', title: '결승골 하이라이트'},
  {id: 'mc2', title: '멋진 세이브 모음'},
  {id: 'mc3', title: '슛 장면 클립'},
  {id: 'mc4', title: '전반 하이라이트'},
];

// Scheduled live start time: 30 minutes from now (for demo/mock)
const MOCK_SCHEDULED_TIMESTAMP = Date.now() + 30 * 60 * 1000;

// ---------------------------------------------------------------------------
// MatchInfoSection (redesigned per design spec)
// ---------------------------------------------------------------------------

interface MatchInfoSectionProps {
  title: string;
  round: string;
  broadcastDate: string;
  tags: string[];
  competition: string;
  description?: string;
  likeCount: number;
  onClipPress?: () => void;
}

function MatchInfoSection({
  title,
  round,
  broadcastDate,
  tags,
  competition,
  description,
  likeCount,
  onClipPress,
}: MatchInfoSectionProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [currentLikeCount, setCurrentLikeCount] = useState(likeCount);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);

  const descText = description || '이 경기는 두 팀의 치열한 접전이 펼쳐진 명경기입니다. 양 팀의 주요 선수들이 활약하며 관중들에게 최고의 경기를 선사했습니다.';

  const handleLike = () => {
    setIsLiked(prev => {
      setCurrentLikeCount(c => prev ? c - 1 : c + 1);
      return !prev;
    });
  };

  return (
    <View style={styles.matchInfoContainer}>
      {/* Title + competition + date */}
      <Text style={styles.matchTitle}>{title}</Text>
      <Text style={styles.matchMeta}>
        {round} | {broadcastDate}
      </Text>

      {/* Hashtag pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.hashtagScroll}
        contentContainerStyle={styles.hashtagContainer}>
        {tags.map((tag, i) => (
          <View key={i} style={styles.hashtagChip}>
            <Text style={styles.hashtagText}>#{tag}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Description with expand/collapse */}
      <Text
        style={styles.descText}
        numberOfLines={descExpanded ? undefined : 2}>
        {descText}
      </Text>
      <TouchableOpacity onPress={() => setDescExpanded(prev => !prev)}>
        <Text style={styles.descToggle}>
          {descExpanded ? '접기' : '자세히보기'}
        </Text>
      </TouchableOpacity>

      {/* Team/competition logo + bookmark + actions row */}
      <View style={styles.competitionRow}>
        <View style={styles.competitionLeft}>
          <View style={styles.teamLogo}>
            <Text style={styles.competitionIcon}>🏆</Text>
          </View>
          <Text style={styles.competitionName}>{competition}</Text>
          <TouchableOpacity
            onPress={() => setIsBookmarked(prev => !prev)}
            style={styles.bookmarkBtn}>
            <MaterialIcons
              name={isBookmarked ? 'bookmark' : 'bookmark-border'}
              size={20}
              color={colors.green}
            />
            <Text style={styles.bookmarkLabel}>즐겨찾기</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.titleActions}>
          <TouchableOpacity onPress={handleLike} style={styles.titleActionBtn}>
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={20}
              color={isLiked ? '#E51728' : colors.white}
            />
            <Text style={styles.actionCountText}>{currentLikeCount}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.titleActionBtn}>
            <Ionicons name="share-social-outline" size={20} color={colors.white} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.titleActionBtn}>
            <Ionicons name="ellipsis-horizontal" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// NextVideoOverlay
// ---------------------------------------------------------------------------

interface NextVideoOverlayProps {
  title: string;
  subtitle: string;
  onPlay: () => void;
  onDismiss: () => void;
}

function NextVideoOverlay({title, subtitle, onPlay, onDismiss}: NextVideoOverlayProps) {
  return (
    <View style={styles.nextVideoOverlay}>
      <TouchableOpacity style={styles.nextVideoDismiss} onPress={onDismiss}>
        <Ionicons name="close" size={20} color={colors.white} />
      </TouchableOpacity>
      <View style={styles.nextVideoThumb}>
        <Ionicons name="play" size={24} color="rgba(255,255,255,0.7)" />
      </View>
      <Text style={styles.nextVideoTitle} numberOfLines={2}>{title}</Text>
      <Text style={styles.nextVideoSubtitle} numberOfLines={1}>{subtitle}</Text>
      <TouchableOpacity style={styles.nextVideoPlayBtn} onPress={onPlay} activeOpacity={0.7}>
        <Ionicons name="play" size={16} color="#000" />
        <Text style={styles.nextVideoPlayText}>다음영상 재생</Text>
      </TouchableOpacity>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Tab Bar Component
// ---------------------------------------------------------------------------

function PlayerTabBar({
  activeTab,
  onTabChange,
}: {
  activeTab: PlayerTab;
  onTabChange: (tab: PlayerTab) => void;
}) {
  const TABS: PlayerTab[] = ['추천영상', '관련영상', '내클립'];

  return (
    <View style={styles.playerTabBar}>
      {TABS.map(tab => (
        <TouchableOpacity
          key={tab}
          style={[styles.playerTab, activeTab === tab && styles.playerTabActive]}
          onPress={() => onTabChange(tab)}>
          <Text
            style={[
              styles.playerTabText,
              activeTab === tab && styles.playerTabTextActive,
            ]}>
            {tab}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Tab Content Components
// ---------------------------------------------------------------------------

function RecommendedTabContent({
  events,
  tags,
  onSeekTo,
}: {
  events: TimelineEvent[];
  tags: string[];
  onSeekTo: (seconds: number) => void;
}) {
  const [selectedTag, setSelectedTag] = useState<string>('');
  const filterTags = tags.map(t => `#${t}`);

  return (
    <View>
      {/* Tag filter pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.recTagScroll}
        contentContainerStyle={styles.recTagContainer}>
        {filterTags.map((tag, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.recTagChip, selectedTag === tag && styles.recTagChipActive]}
            onPress={() => setSelectedTag(prev => prev === tag ? '' : tag)}>
            <Text style={[styles.recTagText, selectedTag === tag && styles.recTagTextActive]}>
              {tag}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Timeline cards */}
      <TimelineCardList events={events} onSeekTo={onSeekTo} />

      {/* Recommended video list (vertical, thumbnail left + title + competition + tags) */}
      <RelatedContentList
        title=""
        items={MOCK_RELATED_ITEMS}
        horizontal={false}
      />
    </View>
  );
}

function RelatedTabContent() {
  const [subTab, setSubTab] = useState<'영상' | '클립'>('영상');
  const [sort, setSort] = useState<'인기순' | '최근순'>('인기순');

  return (
    <View>
      {/* Sub-tabs: 영상 | 클립 with sort button */}
      <View style={styles.relatedFilterRow}>
        <View style={styles.relatedSubTabs}>
          {(['영상', '클립'] as const).map(t => (
            <TouchableOpacity
              key={t}
              style={[styles.relatedSubTab, subTab === t && styles.relatedSubTabActive]}
              onPress={() => setSubTab(t)}>
              <Text style={[styles.relatedSubTabText, subTab === t && styles.relatedSubTabTextActive]}>
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity
          style={styles.sortBtn}
          onPress={() => setSort(prev => prev === '인기순' ? '최근순' : '인기순')}>
          <MaterialIcons name="swap-vert" size={16} color={colors.grayLight} />
          <Text style={styles.sortBtnText}>{sort}</Text>
        </TouchableOpacity>
      </View>

      {subTab === '영상' ? (
        <RelatedContentList
          title=""
          items={MOCK_RELATED_ITEMS}
          horizontal={false}
        />
      ) : (
        /* 클립: 2-column grid with 9:16 ratio */
        <RelatedContentList
          title=""
          items={MOCK_CLIP_ITEMS}
          horizontal={false}
          clipMode
        />
      )}
    </View>
  );
}

function MyClipsTabContent() {
  return (
    <View style={styles.myClipsGrid}>
      {MOCK_MY_CLIPS.map(clip => (
        <TouchableOpacity key={clip.id} style={styles.myClipCard}>
          <View style={styles.myClipThumb}>
            <Ionicons name="play" size={24} color="rgba(255,255,255,0.6)" />
          </View>
          <Text style={styles.myClipTitle} numberOfLines={1}>
            {clip.title}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// PlayerScreen
// ---------------------------------------------------------------------------

const PlayerScreen: React.FC<Props> = ({navigation, route}) => {
  const {contentType, contentId} = route.params;
  const isLiveContent = contentType === 'live';

  // ---- Dynamic dimensions ------------------------------------------------
  const {width: screenWidth} = useWindowDimensions();
  const portraitVideoHeight = screenWidth * (9 / 16);

  // ---- Data loading state ------------------------------------------------
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ---- UI state ----------------------------------------------------------
  const {isFullscreen, toggleFullscreen} = useFullscreen();
  const [showClipCreation, setShowClipCreation] = useState(false);
  const [liveCountdownActive, setLiveCountdownActive] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [activeTab, setActiveTab] = useState<PlayerTab>('추천영상');
  const [showNextVideo, setShowNextVideo] = useState(false);

  // ---- Refs --------------------------------------------------------------
  const watchProgressInterval = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const videoPlayerRef = useRef<VideoPlayerHandle>(null);

  // ---- Data fetching -----------------------------------------------------
  const loadPlayerData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await playerService.getPlayerData(contentId);
      setPlayerData(data);

      if (isLiveContent && !data.streamInfo.url) {
        setLiveCountdownActive(true);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : '콘텐츠를 불러올 수 없습니다.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [contentId, isLiveContent]);

  useEffect(() => {
    loadPlayerData();
  }, [loadPlayerData]);

  // ---- Chapters ----------------------------------------------------------
  const chapters = useMemo(
    () => (playerData ? generateChapters(playerData.timeline) : []),
    [playerData],
  );

  // ---- Analytics ---------------------------------------------------------
  useEffect(() => {
    if (playerData) {
      logAnalytics('content_play', {
        contentId: playerData.contentId,
        contentType,
        title: playerData.title,
        isLive: playerData.isLive,
      });
    }
  }, [playerData, contentType]);

  // ---- Watch history (every 30s) -----------------------------------------
  useEffect(() => {
    if (!playerData) return;

    watchProgressInterval.current = setInterval(() => {
      logWatchProgress(playerData.contentId, currentTime);
    }, 30_000);

    return () => {
      if (watchProgressInterval.current) {
        clearInterval(watchProgressInterval.current);
        watchProgressInterval.current = null;
      }
    };
  }, [playerData, currentTime]);

  // Log final position on unmount
  useEffect(() => {
    return () => {
      if (playerData) {
        logWatchProgress(playerData.contentId, currentTime);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Handlers ----------------------------------------------------------
  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleContentComplete = useCallback(() => {
    if (playerData) {
      logAnalytics('content_complete', {
        contentId: playerData.contentId,
        contentType,
      });
      setShowNextVideo(true);
    }
  }, [playerData, contentType]);

  const handleClipPress = useCallback(() => {
    setShowClipCreation(true);
  }, []);

  const handleClipClose = useCallback(() => {
    setShowClipCreation(false);
  }, []);

  const handleClipNext = useCallback(
    (startTime: number, endTime: number) => {
      setShowClipCreation(false);
      navigation.navigate('ClipEdit', {
        startTime,
        endTime,
        sourceContentType: contentType,
        sourceContentId: contentId,
      });
    },
    [navigation, contentType, contentId],
  );

  const handleClipPreview = useCallback(
    (_startTime: number, _endTime: number) => {
      // TODO: seek video to startTime for preview
    },
    [],
  );

  const handleCountdownEnd = useCallback(() => {
    setLiveCountdownActive(false);
    loadPlayerData();
  }, [loadPlayerData]);

  const handleTimeUpdate = useCallback((time: number) => {
    setCurrentTime(time);
  }, []);

  const handleDurationChange = useCallback((dur: number) => {
    setDuration(dur);
  }, []);

  const handleSeekTo = useCallback((seconds: number) => {
    // This will be wired through VideoPlayer
    videoPlayerRef.current?.seekTo(seconds);
  }, []);

  // ---- Render helpers ----------------------------------------------------

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.green} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !playerData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>
            {error ?? '콘텐츠를 불러올 수 없습니다.'}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadPlayerData}>
            <Text style={styles.retryButtonText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ---- Main render -------------------------------------------------------

  return (
    <SafeAreaView
      style={styles.container}
      edges={isFullscreen ? [] : ['top', 'bottom']}>
      {/* Video player area */}
      <View
        style={
          isFullscreen
            ? styles.fullscreenVideo
            : {width: screenWidth, height: portraitVideoHeight, backgroundColor: '#000'}
        }>
        {liveCountdownActive ? (
          <LiveCountdown
            targetTimestamp={MOCK_SCHEDULED_TIMESTAMP}
            onCountdownEnd={handleCountdownEnd}
          />
        ) : (
          <VideoPlayer
            ref={videoPlayerRef}
            source={playerData.streamInfo.url}
            title={playerData.title}
            isLive={playerData.isLive}
            events={playerData.timeline}
            chapters={chapters}
            isFullscreen={isFullscreen}
            onBack={handleBack}
            onFullscreenToggle={toggleFullscreen}
            onTimeUpdate={handleTimeUpdate}
            onDurationChange={handleDurationChange}
            onComplete={handleContentComplete}
            onClipPress={handleClipPress}
          />
        )}
      </View>

      {/* Below-player content — hidden in fullscreen */}
      {!isFullscreen && (
        <ScrollView
          style={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {/* Redesigned match info section */}
          <MatchInfoSection
            title={playerData.title}
            round={playerData.competitionName}
            broadcastDate={new Date().toLocaleDateString('ko-KR')}
            tags={MOCK_TAGS}
            competition={playerData.competitionName}
            likeCount={100}
            onClipPress={handleClipPress}
          />

          {/* Tab Bar */}
          <PlayerTabBar activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Tab Content */}
          {activeTab === '추천영상' && (
            <RecommendedTabContent
              events={playerData.timeline}
              tags={MOCK_TAGS}
              onSeekTo={handleSeekTo}
            />
          )}
          {activeTab === '관련영상' && <RelatedTabContent />}
          {activeTab === '내클립' && <MyClipsTabContent />}

          {/* Comments (collapsible, below tabs) */}
          <CommentSection
            contentType={contentType}
            contentId={contentId}
          />
        </ScrollView>
      )}

      {/* Clip creation overlay */}
      <ClipCreationOverlay
        visible={showClipCreation}
        isLive={playerData.isLive}
        currentTime={currentTime}
        duration={duration}
        onClose={handleClipClose}
        onNext={handleClipNext}
        onPreview={handleClipPreview}
      />

      {/* Next video overlay (shown after content completes) */}
      {showNextVideo && (
        <NextVideoOverlay
          title={MOCK_NEXT_VIDEO.title}
          subtitle={MOCK_NEXT_VIDEO.subtitle}
          onPlay={() => {
            setShowNextVideo(false);
            // TODO: Navigate to next video
          }}
          onDismiss={() => setShowNextVideo(false)}
        />
      )}
    </SafeAreaView>
  );
};

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: 15,
    color: colors.grayLight,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.green,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  fullscreenVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    backgroundColor: '#000',
  },
  scrollContent: {
    flex: 1,
  },

  // ── Match Info Section ──
  matchInfoContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.bg,
  },
  matchTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 4,
  },
  matchMeta: {
    fontSize: 13,
    color: colors.grayLight,
    marginBottom: 10,
  },
  titleActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  titleActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 4,
  },
  actionCountText: {
    fontSize: 12,
    color: colors.grayLight,
    fontWeight: '600',
  },
  descText: {
    fontSize: 13,
    color: colors.grayLight,
    lineHeight: 20,
    marginBottom: 4,
  },
  descToggle: {
    fontSize: 13,
    color: colors.green,
    fontWeight: '600',
    marginBottom: 10,
  },
  hashtagScroll: {
    marginBottom: 10,
  },
  hashtagContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  hashtagChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.green,
  },
  hashtagText: {
    fontSize: 13,
    color: colors.green,
  },
  competitionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 0.5,
    borderTopColor: colors.grayDark,
  },
  competitionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  teamLogo: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  competitionIcon: {
    fontSize: 14,
  },
  competitionName: {
    fontSize: 14,
    color: colors.white,
    fontWeight: '600',
  },
  bookmarkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.green,
  },
  bookmarkLabel: {
    fontSize: 12,
    color: colors.green,
  },

  // ── Player Tab Bar ──
  playerTabBar: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: colors.grayDark,
    backgroundColor: colors.bg,
  },
  playerTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  playerTabActive: {
    borderBottomColor: colors.green,
  },
  playerTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray,
  },
  playerTabTextActive: {
    color: colors.green,
    fontWeight: '700',
  },

  // ── Recommended Tab Tag Filters ──
  recTagScroll: {
    paddingLeft: 16,
    marginTop: 8,
    marginBottom: 12,
  },
  recTagContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 16,
  },
  recTagChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.grayDark,
    backgroundColor: colors.surface,
  },
  recTagChipActive: {
    borderColor: colors.green,
    backgroundColor: 'rgba(0,200,83,0.1)',
  },
  recTagText: {
    fontSize: 13,
    color: colors.grayLight,
  },
  recTagTextActive: {
    color: colors.green,
  },

  // ── Related Tab Filters ──
  relatedFilterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  relatedSubTabs: {
    flexDirection: 'row',
    gap: 0,
  },
  relatedSubTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.grayDark,
    marginRight: 8,
  },
  relatedSubTabActive: {
    borderColor: colors.green,
    backgroundColor: 'rgba(0,200,83,0.1)',
  },
  relatedSubTabText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.grayLight,
  },
  relatedSubTabTextActive: {
    color: colors.green,
    fontWeight: '700',
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  sortBtnText: {
    fontSize: 12,
    color: colors.grayLight,
  },

  // ── My Clips Grid ──
  myClipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  myClipCard: {
    width: '48%',
  },
  myClipThumb: {
    width: '100%',
    aspectRatio: 9 / 16,
    backgroundColor: colors.grayDark,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  myClipTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
  },

  // ── Next Video Overlay ──
  nextVideoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    paddingHorizontal: 40,
  },
  nextVideoDismiss: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextVideoThumb: {
    width: 160,
    height: 90,
    backgroundColor: colors.grayDark,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  nextVideoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
    textAlign: 'center',
    marginBottom: 4,
  },
  nextVideoSubtitle: {
    fontSize: 13,
    color: colors.grayLight,
    textAlign: 'center',
    marginBottom: 20,
  },
  nextVideoPlayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.green,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  nextVideoPlayText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },
});

export default PlayerScreen;
