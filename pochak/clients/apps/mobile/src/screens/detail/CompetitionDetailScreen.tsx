import React, {useState, useEffect, useCallback} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import {Ionicons, MaterialIcons} from '@expo/vector-icons';
import {colors} from '../../theme';
import type {RootStackParamList} from '../../navigation/types';
import {
  toggleFollow,
  getFollowerCount,
  isFollowing,
} from '../../services/followApi';
import {contentService} from '../../api/contentService';
import type {
  CompetitionData,
  CompetitionVideoItem,
  CompetitionMatchItem,
} from '../../api/contentService';

type CompetitionDetailRouteProp = RouteProp<RootStackParamList, 'CompetitionDetail'>;

// ─── Types ───────────────────────────────────────────────

type TabName = '홈' | '영상' | '일정' | '게시글' | '정보';
type VideoSubTab = '영상' | '클립';

// CompetitionData, CompetitionVideoItem, CompetitionMatchItem are imported from contentService

interface PostItem {
  id: string;
  title: string;
  authorName: string;
  createdAt: string;
  likeCount: number;
  commentCount: number;
}

const TABS: TabName[] = ['홈', '영상', '일정', '게시글', '정보'];

// ─── Helpers ─────────────────────────────────────────────

function groupMatchesByDate(matches: CompetitionMatchItem[]): Record<string, CompetitionMatchItem[]> {
  const grouped: Record<string, CompetitionMatchItem[]> = {};
  for (const m of matches) {
    if (!grouped[m.date]) grouped[m.date] = [];
    grouped[m.date].push(m);
  }
  return grouped;
}

function statusLabel(status: CompetitionMatchItem['status']): string {
  switch (status) {
    case 'LIVE': return 'LIVE';
    case 'COMPLETED': return '종료';
    case 'SCHEDULED': return '예정';
  }
}

function statusColor(status: CompetitionMatchItem['status']): string {
  switch (status) {
    case 'LIVE': return colors.error;
    case 'COMPLETED': return colors.gray;
    case 'SCHEDULED': return colors.green;
  }
}

// ─── Component ───────────────────────────────────────────

export default function CompetitionDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<CompetitionDetailRouteProp>();
  const {competitionId} = route.params;

  const [competition, setCompetition] = useState<CompetitionData | null>(null);
  const [videos, setVideos] = useState<CompetitionVideoItem[]>([]);
  const [clips, setClips] = useState<CompetitionVideoItem[]>([]);
  const [matches, setMatches] = useState<CompetitionMatchItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const [activeTab, setActiveTab] = useState<TabName>('홈');
  const [videoSubTab, setVideoSubTab] = useState<VideoSubTab>('영상');
  const [bookmarked, setBookmarked] = useState(false);
  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);

  useEffect(() => {
    isFollowing('competition', competitionId).then(setFollowing);
    getFollowerCount('competition', competitionId).then(setFollowerCount);

    setIsLoading(true);
    setHasError(false);
    Promise.all([
      contentService.getCompetition(competitionId),
      contentService.getCompetitionVideos(competitionId),
      contentService.getCompetitionMatches(competitionId),
    ])
      .then(([compData, contentsData, matchesData]) => {
        setCompetition(compData);
        setVideos(contentsData.videos);
        setClips(contentsData.clips);
        setMatches(matchesData);
      })
      .catch(() => setHasError(true))
      .finally(() => setIsLoading(false));
  }, [competitionId]);

  const handleToggleFollow = useCallback(async () => {
    const prev = following;
    const prevCount = followerCount;
    setFollowing(!prev);
    setFollowerCount(prev ? prevCount - 1 : prevCount + 1);
    try {
      const result = await toggleFollow('competition', competitionId);
      setFollowing(result);
    } catch {
      setFollowing(prev);
      setFollowerCount(prevCount);
    }
  }, [following, followerCount, competitionId]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.green} />
        </View>
      </SafeAreaView>
    );
  }

  if (hasError || !competition) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>대회 상세</Text>
          <View style={styles.shareButton} />
        </View>
        <View style={styles.centerContainer}>
          <MaterialIcons name="error-outline" size={48} color={colors.grayDark} />
          <Text style={styles.errorText}>대회 정보를 불러올 수 없습니다.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          대회 상세
        </Text>
        <TouchableOpacity activeOpacity={0.7} style={styles.shareButton}>
          <Ionicons name="share-outline" size={22} color={colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <View style={styles.bannerWrap}>
          <Image
            source={{uri: competition.bannerUrl}}
            style={styles.banner}
            resizeMode="cover"
          />
          <View style={styles.bannerOverlay} />
          <View style={styles.bannerLogoWrap}>
            <Image
              source={{uri: competition.imageUrl}}
              style={styles.bannerLogo}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* Competition Info */}
        <View style={styles.infoSection}>
          <Text style={styles.competitionName}>{competition.name}</Text>
          <View style={styles.infoRow}>
            <View style={styles.sportBadge}>
              <Text style={styles.sportBadgeText}>{competition.sport}</Text>
            </View>
            {competition.isFree ? (
              <View style={styles.freeBadge}>
                <Text style={styles.freeBadgeText}>무료</Text>
              </View>
            ) : (
              <View style={styles.paidBadge}>
                <Text style={styles.paidBadgeText}>유료</Text>
              </View>
            )}
            <Text style={styles.dateRange}>
              {competition.startDate} ~ {competition.endDate}
            </Text>
          </View>
          <Text style={styles.description}>{competition.description}</Text>

          {/* Follow row */}
          <View style={styles.followRow}>
            <View style={styles.followerInfo}>
              <MaterialIcons name="people" size={14} color={colors.grayLight} />
              <Text style={styles.followerCountText}>
                팔로워 {followerCount.toLocaleString()}명
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.followButton, following && styles.followingBtn]}
              onPress={handleToggleFollow}
              activeOpacity={0.8}>
              {following && (
                <MaterialIcons
                  name="check"
                  size={14}
                  color={colors.green}
                  style={{marginRight: 4}}
                />
              )}
              <Text
                style={[
                  styles.followButtonText,
                  following && styles.followingBtnText,
                ]}>
                {following ? '팔로잉' : '팔로우'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            {!competition.isFree && (
              <TouchableOpacity style={styles.purchaseButton} activeOpacity={0.8}>
                <Text style={styles.purchaseButtonText}>구매하기</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setBookmarked(!bookmarked)}
              activeOpacity={0.7}>
              <Ionicons
                name={bookmarked ? 'bookmark' : 'bookmark-outline'}
                size={22}
                color={bookmarked ? colors.green : colors.grayLight}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
              <Ionicons name="ellipsis-horizontal" size={22} color={colors.grayLight} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabRow}>
          {TABS.map(tab => {
            const isActive = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.tabItem, isActive && styles.tabItemActive]}
                onPress={() => setActiveTab(tab)}
                activeOpacity={0.7}>
                <Text
                  style={[
                    styles.tabText,
                    isActive && styles.tabTextActive,
                  ]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Tab Content */}
        {activeTab === '홈' && <HomeTab videos={videos} clips={clips} />}
        {activeTab === '영상' && (
          <VideoTab
            subTab={videoSubTab}
            onSubTabChange={setVideoSubTab}
            videos={videos}
            clips={clips}
          />
        )}
        {activeTab === '일정' && <ScheduleTab matches={matches} />}
        {activeTab === '게시글' && <PostsTab />}
        {activeTab === '정보' && <InfoTab competition={competition} />}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Home Tab ────────────────────────────────────────────

function HomeTab({
  videos,
  clips,
}: {
  videos: CompetitionVideoItem[];
  clips: CompetitionVideoItem[];
}) {
  return (
    <View>
      {/* Live Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.liveDot} />
            <Text style={styles.sectionTitle}>라이브</Text>
          </View>
        </View>
        <View style={styles.liveEmpty}>
          <MaterialIcons name="live-tv" size={36} color={colors.grayDark} />
          <Text style={styles.liveEmptyText}>진행 중인 라이브가 없습니다</Text>
        </View>
      </View>

      {/* Recent Clips */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>최근 클립</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.sectionMore}>전체보기</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={clips.slice(0, 4)}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
          keyExtractor={item => item.id}
          renderItem={({item}) => <ClipCard item={item} />}
          ListEmptyComponent={<Text style={styles.emptyText}>클립이 없습니다</Text>}
        />
      </View>

      {/* Recent Videos */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>최근 영상</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.sectionMore}>전체보기</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={videos.slice(0, 3)}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
          keyExtractor={item => item.id}
          renderItem={({item}) => <VideoCard item={item} />}
          ListEmptyComponent={<Text style={styles.emptyText}>영상이 없습니다</Text>}
        />
      </View>
    </View>
  );
}

// ─── Video Tab ───────────────────────────────────────────

function VideoTab({
  subTab,
  onSubTabChange,
  videos,
  clips,
}: {
  subTab: VideoSubTab;
  onSubTabChange: (t: VideoSubTab) => void;
  videos: CompetitionVideoItem[];
  clips: CompetitionVideoItem[];
}) {
  return (
    <View>
      {/* Sub-tabs */}
      <View style={styles.subTabRow}>
        {(['영상', '클립'] as VideoSubTab[]).map(tab => {
          const isActive = subTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.subTabItem, isActive && styles.subTabItemActive]}
              onPress={() => onSubTabChange(tab)}
              activeOpacity={0.7}>
              <Text
                style={[
                  styles.subTabText,
                  isActive && styles.subTabTextActive,
                ]}>
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {subTab === '영상' && (
        <View style={styles.videoListSection}>
          {videos.length === 0 ? (
            <Text style={styles.emptyText}>영상이 없습니다</Text>
          ) : (
            videos.map(video => (
              <TouchableOpacity
                key={video.id}
                style={styles.videoListItem}
                activeOpacity={0.7}>
                <View style={styles.videoListThumbnailWrap}>
                  <Image
                    source={{uri: video.thumbnailUrl}}
                    style={styles.videoListThumbnail}
                    resizeMode="cover"
                  />
                  <View style={styles.videoDuration}>
                    <Text style={styles.videoDurationText}>{video.duration}</Text>
                  </View>
                </View>
                <View style={styles.videoListInfo}>
                  <Text style={styles.videoListTitle} numberOfLines={2}>
                    {video.title}
                  </Text>
                  <Text style={styles.videoListMeta}>
                    {video.date} · 조회 {video.viewCount.toLocaleString()}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      )}

      {subTab === '클립' && (
        <View style={styles.clipGrid}>
          {clips.length === 0 ? (
            <Text style={styles.emptyText}>클립이 없습니다</Text>
          ) : (
            clips.map(clip => (
              <TouchableOpacity
                key={clip.id}
                style={styles.clipGridItem}
                activeOpacity={0.7}>
                <View style={styles.clipGridThumbnailWrap}>
                  <Image
                    source={{uri: clip.thumbnailUrl}}
                    style={styles.clipGridThumbnail}
                    resizeMode="cover"
                  />
                  <View style={styles.clipDuration}>
                    <Text style={styles.clipDurationText}>{clip.duration}</Text>
                  </View>
                </View>
                <Text style={styles.clipGridTitle} numberOfLines={2}>
                  {clip.title}
                </Text>
                <Text style={styles.clipGridViews}>
                  {clip.viewCount.toLocaleString()}회
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      )}
    </View>
  );
}

// ─── Schedule Tab ────────────────────────────────────────

function ScheduleTab({matches}: {matches: CompetitionMatchItem[]}) {
  const grouped = groupMatchesByDate(matches);
  const dates = Object.keys(grouped).sort();

  if (dates.length === 0) {
    return <Text style={styles.emptyText}>일정이 없습니다</Text>;
  }

  return (
    <View style={styles.scheduleSection}>
      {dates.map(date => (
        <View key={date}>
          <View style={styles.scheduleDateHeader}>
            <Text style={styles.scheduleDateText}>{date}</Text>
          </View>
          {grouped[date].map(match => (
            <View key={match.id} style={styles.matchRow}>
              <View style={styles.matchTimeCol}>
                <Text style={styles.matchTime}>{match.time}</Text>
                <View
                  style={[
                    styles.matchStatusBadge,
                    {backgroundColor: statusColor(match.status) + '22'},
                  ]}>
                  <Text
                    style={[
                      styles.matchStatusText,
                      {color: statusColor(match.status)},
                    ]}>
                    {statusLabel(match.status)}
                  </Text>
                </View>
              </View>
              <View style={styles.matchInfoCol}>
                <Text style={styles.matchRound}>{match.round}</Text>
                <View style={styles.matchTeamsRow}>
                  <Text style={styles.matchTeamName}>{match.homeName}</Text>
                  {match.status === 'COMPLETED' && (
                    <Text style={styles.matchScore}>
                      {match.homeScore} : {match.awayScore}
                    </Text>
                  )}
                  {match.status !== 'COMPLETED' && (
                    <Text style={styles.matchVs}>vs</Text>
                  )}
                  <Text style={styles.matchTeamName}>{match.awayName}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

// ─── Posts Tab ───────────────────────────────────────────

function PostsTab() {
  return (
    <View>
      <Text style={styles.emptyText}>게시글이 없습니다</Text>
    </View>
  );
}

// ─── Info Tab ────────────────────────────────────────────

function InfoTab({competition}: {competition: CompetitionData}) {
  return (
    <View style={styles.infoTabSection}>
      <InfoRow label="대회명" value={competition.name} />
      <InfoRow label="종목" value={competition.sport} />
      <InfoRow label="기간" value={`${competition.startDate} ~ ${competition.endDate}`} />
      <InfoRow label="주최" value={competition.organizer} />
      <InfoRow label="장소" value={competition.venue} />
      <InfoRow label="참가 팀" value={`${competition.participantCount}개 팀`} />
      <InfoRow label="이용 요금" value={competition.isFree ? '무료' : '유료'} />
      <View style={styles.infoTagsRow}>
        <Text style={styles.infoLabel}>태그</Text>
        <View style={styles.infoTags}>
          {competition.tags.map(tag => (
            <View key={tag} style={styles.infoTag}>
              <Text style={styles.infoTagText}>#{tag}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

function InfoRow({label, value}: {label: string; value: string}) {
  return (
    <View style={styles.infoRowItem}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

// ─── Shared Sub-components ───────────────────────────────

function VideoCard({item}: {item: CompetitionVideoItem}) {
  return (
    <TouchableOpacity style={styles.videoCard} activeOpacity={0.8}>
      <View style={styles.videoThumbnailWrap}>
        <Image
          source={{uri: item.thumbnailUrl}}
          style={styles.videoThumbnail}
          resizeMode="cover"
        />
        <View style={styles.videoDuration}>
          <Text style={styles.videoDurationText}>{item.duration}</Text>
        </View>
      </View>
      <Text style={styles.videoTitle} numberOfLines={2}>
        {item.title}
      </Text>
      <Text style={styles.videoMeta}>
        {item.date} · 조회 {item.viewCount.toLocaleString()}
      </Text>
    </TouchableOpacity>
  );
}

function ClipCard({item}: {item: CompetitionVideoItem}) {
  return (
    <TouchableOpacity style={styles.clipCard} activeOpacity={0.8}>
      <View style={styles.clipThumbnailWrap}>
        <Image
          source={{uri: item.thumbnailUrl}}
          style={styles.clipThumbnail}
          resizeMode="cover"
        />
        <View style={styles.clipDuration}>
          <Text style={styles.clipDurationText}>{item.duration}</Text>
        </View>
      </View>
      <Text style={styles.clipTitle} numberOfLines={2}>
        {item.title}
      </Text>
      <Text style={styles.clipViews}>
        {item.viewCount.toLocaleString()}회
      </Text>
    </TouchableOpacity>
  );
}

function PostRow({post}: {post: PostItem}) {
  return (
    <TouchableOpacity style={styles.postRow} activeOpacity={0.7}>
      <Text style={styles.postTitle} numberOfLines={1}>
        {post.title}
      </Text>
      <View style={styles.postMeta}>
        <Text style={styles.postAuthor}>{post.authorName}</Text>
        <Text style={styles.postDot}>·</Text>
        <Text style={styles.postTime}>{post.createdAt}</Text>
        <View style={styles.postStats}>
          <Ionicons name="heart-outline" size={12} color={colors.gray} />
          <Text style={styles.postStatText}>{post.likeCount}</Text>
          <Ionicons name="chatbubble-outline" size={12} color={colors.gray} />
          <Text style={styles.postStatText}>{post.commentCount}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Styles ──────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollView: {
    flex: 1,
  },
  bottomSpacer: {
    height: 40,
  },

  // Header
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  errorText: {
    fontSize: 14,
    color: colors.gray,
    marginTop: 8,
  },
  emptyText: {
    fontSize: 13,
    color: colors.gray,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 52,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.white,
  },
  shareButton: {
    padding: 4,
  },

  // Banner
  bannerWrap: {
    height: 200,
    marginBottom: 40,
  },
  banner: {
    width: '100%',
    height: 180,
  },
  bannerOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    height: 80,
  },
  bannerLogoWrap: {
    position: 'absolute',
    bottom: 0,
    left: 16,
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: colors.bg,
    padding: 3,
  },
  bannerLogo: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    backgroundColor: colors.surface,
  },

  // Info
  infoSection: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.grayDark,
  },
  competitionName: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.white,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sportBadge: {
    backgroundColor: colors.green,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  sportBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000',
  },
  freeBadge: {
    backgroundColor: '#4A90D9' + '33',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  freeBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4A90D9',
  },
  paidBadge: {
    backgroundColor: '#FF8C00' + '33',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  paidBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF8C00',
  },
  dateRange: {
    fontSize: 13,
    color: colors.gray,
  },
  description: {
    fontSize: 14,
    color: colors.grayLight,
    lineHeight: 22,
    marginBottom: 18,
  },

  // Follow
  followRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  followerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  followerCountText: {
    fontSize: 13,
    color: colors.grayLight,
  },
  followButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.green,
  },
  followingBtn: {
    backgroundColor: colors.green + '1A',
  },
  followButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.green,
  },
  followingBtnText: {
    color: colors.green,
  },

  // Action buttons
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  purchaseButton: {
    flex: 1,
    backgroundColor: colors.green,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  purchaseButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Tabs
  tabRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: colors.grayDark,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  tabItemActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.green,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray,
  },
  tabTextActive: {
    color: colors.white,
    fontWeight: '700',
  },

  // Sections
  section: {
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.grayDark,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.white,
  },
  sectionMore: {
    fontSize: 13,
    color: colors.green,
    fontWeight: '600',
  },
  horizontalList: {
    paddingLeft: 16,
    paddingRight: 8,
  },

  // Live
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error,
  },
  liveEmpty: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  liveEmptyText: {
    fontSize: 13,
    color: colors.gray,
  },

  // Video Card
  videoCard: {
    width: 200,
    marginRight: 12,
  },
  videoThumbnailWrap: {
    width: '100%',
    height: 112,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
    backgroundColor: colors.surface,
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
  },
  videoDuration: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 3,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  videoDurationText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.white,
  },
  videoTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 3,
  },
  videoMeta: {
    fontSize: 11,
    color: colors.gray,
  },

  // Clip Card
  clipCard: {
    width: 120,
    marginRight: 12,
  },
  clipThumbnailWrap: {
    width: '100%',
    height: 160,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 6,
    backgroundColor: colors.surface,
  },
  clipThumbnail: {
    width: '100%',
    height: '100%',
  },
  clipDuration: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 3,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  clipDurationText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.white,
  },
  clipTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 2,
  },
  clipViews: {
    fontSize: 10,
    color: colors.gray,
  },

  // Video sub-tabs
  subTabRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 8,
  },
  subTabItem: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
  },
  subTabItemActive: {
    backgroundColor: colors.green,
  },
  subTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.gray,
  },
  subTabTextActive: {
    color: '#000',
    fontWeight: '700',
  },

  // Video list (vertical)
  videoListSection: {
    paddingTop: 16,
  },
  videoListItem: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
  },
  videoListThumbnailWrap: {
    width: 140,
    height: 80,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  videoListThumbnail: {
    width: '100%',
    height: '100%',
  },
  videoListInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  videoListTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 6,
    lineHeight: 20,
  },
  videoListMeta: {
    fontSize: 11,
    color: colors.gray,
  },

  // Clip grid
  clipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingTop: 16,
  },
  clipGridItem: {
    width: '33.33%',
    paddingHorizontal: 4,
    marginBottom: 16,
  },
  clipGridThumbnailWrap: {
    width: '100%',
    aspectRatio: 0.75,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 6,
    backgroundColor: colors.surface,
  },
  clipGridThumbnail: {
    width: '100%',
    height: '100%',
  },
  clipGridTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 2,
  },
  clipGridViews: {
    fontSize: 10,
    color: colors.gray,
  },

  // Schedule
  scheduleSection: {
    paddingTop: 8,
  },
  scheduleDateHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
  },
  scheduleDateText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
  },
  matchRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.grayDark,
  },
  matchTimeCol: {
    width: 60,
    alignItems: 'center',
    gap: 4,
  },
  matchTime: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  matchStatusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  matchStatusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  matchInfoCol: {
    flex: 1,
    paddingLeft: 16,
  },
  matchRound: {
    fontSize: 11,
    color: colors.gray,
    marginBottom: 4,
  },
  matchTeamsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  matchTeamName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  matchScore: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.green,
  },
  matchVs: {
    fontSize: 12,
    color: colors.gray,
  },

  // Posts
  postRow: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.grayDark,
  },
  postTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 6,
  },
  postMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  postAuthor: {
    fontSize: 12,
    color: colors.gray,
  },
  postDot: {
    fontSize: 12,
    color: colors.grayDark,
  },
  postTime: {
    fontSize: 12,
    color: colors.gray,
  },
  postStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 'auto',
  },
  postStatText: {
    fontSize: 11,
    color: colors.gray,
    marginRight: 6,
  },

  // Info tab
  infoTabSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  infoRowItem: {
    flexDirection: 'row',
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.grayDark,
  },
  infoLabel: {
    width: 80,
    fontSize: 13,
    fontWeight: '600',
    color: colors.gray,
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: colors.white,
  },
  infoTagsRow: {
    flexDirection: 'row',
    paddingVertical: 14,
    alignItems: 'flex-start',
  },
  infoTags: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  infoTag: {
    backgroundColor: colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  infoTagText: {
    fontSize: 12,
    color: colors.grayLight,
  },
});
