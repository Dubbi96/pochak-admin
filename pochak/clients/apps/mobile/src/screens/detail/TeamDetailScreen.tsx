import React, {useState, useEffect, useCallback} from 'react';
import {
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
import type {RootStackParamList} from '../../navigation/types';
import {colors} from '../../theme';
import {
  toggleFollow,
  getFollowerCount,
  isFollowing,
} from '../../services/followApi';

type TeamDetailRouteProp = RouteProp<RootStackParamList, 'TeamDetail'>;

// ─── Types ───────────────────────────────────────────────

type TabName = '홈' | '영상' | '일정' | '게시글' | '정보';
type VideoSubTab = '영상' | '클립';

interface TeamData {
  id: string;
  name: string;
  sport: string;
  logoUrl: string;
  bannerUrl: string;
  description: string;
  founded: string;
  homeGround: string;
  league: string;
  coach: string;
  playerCount: number;
  region: string;
}

interface VideoItem {
  id: string;
  thumbnailUrl: string;
  title: string;
  date: string;
  viewCount: number;
  duration: string;
}

interface ClipItem {
  id: string;
  thumbnailUrl: string;
  title: string;
  viewCount: number;
  duration: string;
}

interface MatchItem {
  id: string;
  date: string;
  time: string;
  round: string;
  status: 'COMPLETED' | 'LIVE' | 'SCHEDULED';
  homeName: string;
  awayName: string;
  homeScore?: number;
  awayScore?: number;
  competition: string;
}

interface PostItem {
  id: string;
  title: string;
  authorName: string;
  createdAt: string;
  likeCount: number;
  commentCount: number;
}

// ─── Mock Data ───────────────────────────────────────────

const MOCK_TEAMS: Record<string, TeamData> = {
  'team-1': {
    id: 'team-1',
    name: '전북 현대 모터스',
    sport: '축구',
    logoUrl: 'https://placehold.co/80x80/1E1E1E/00C853?text=JB',
    bannerUrl: 'https://placehold.co/400x200/0D3B0D/00C853?text=JEONBUK',
    description: '전북 현대 모터스 FC는 대한민국 전라북도 전주시를 연고지로 하는 프로축구 클럽입니다. K리그1 최다 우승 기록을 보유하고 있습니다.',
    founded: '1994년',
    homeGround: '전주월드컵경기장',
    league: 'K리그1',
    coach: '김상식',
    playerCount: 28,
    region: '전라북도 전주시',
  },
  'team-2': {
    id: 'team-2',
    name: 'LG 트윈스',
    sport: '야구',
    logoUrl: 'https://placehold.co/80x80/1E1E1E/C70125?text=LG',
    bannerUrl: 'https://placehold.co/400x200/3B0D0D/C70125?text=LG+TWINS',
    description: 'LG 트윈스는 서울특별시를 연고지로 하는 한국프로야구 구단입니다. 잠실야구장을 홈 구장으로 사용하고 있습니다.',
    founded: '1990년',
    homeGround: '잠실야구장',
    league: 'KBO 리그',
    coach: '염경엽',
    playerCount: 35,
    region: '서울특별시',
  },
};

const DEFAULT_TEAM: TeamData = {
  id: 'default',
  name: '팀명',
  sport: '스포츠',
  logoUrl: 'https://placehold.co/80x80/1E1E1E/00C853?text=T',
  bannerUrl: 'https://placehold.co/400x200/1E1E1E/00C853?text=TEAM',
  description: '팀 정보가 준비 중입니다.',
  founded: '-',
  homeGround: '-',
  league: '-',
  coach: '-',
  playerCount: 0,
  region: '-',
};

const MOCK_VIDEOS: VideoItem[] = [
  {id: 'tv1', thumbnailUrl: 'https://placehold.co/320x180/1E1E1E/4488FF?text=VOD', title: '시즌 하이라이트 베스트 골 모음', date: '2026.03.20', viewCount: 32100, duration: '18:45'},
  {id: 'tv2', thumbnailUrl: 'https://placehold.co/320x180/1E1E1E/4488FF?text=VOD', title: '6라운드 vs 울산 HD 풀경기', date: '2026.03.19', viewCount: 18700, duration: '1:55:22'},
  {id: 'tv3', thumbnailUrl: 'https://placehold.co/320x180/1E1E1E/4488FF?text=VOD', title: '5라운드 vs 수원 FC 하이라이트', date: '2026.03.15', viewCount: 14300, duration: '10:15'},
  {id: 'tv4', thumbnailUrl: 'https://placehold.co/320x180/1E1E1E/4488FF?text=VOD', title: '훈련 비하인드 영상', date: '2026.03.12', viewCount: 8900, duration: '22:10'},
  {id: 'tv5', thumbnailUrl: 'https://placehold.co/320x180/1E1E1E/4488FF?text=VOD', title: '신규 선수 인터뷰', date: '2026.03.08', viewCount: 6200, duration: '15:38'},
];

const MOCK_CLIPS: ClipItem[] = [
  {id: 'tc1', thumbnailUrl: 'https://placehold.co/120x160/1E1E1E/00C853?text=CLIP', title: '멀티골 장면 모음', viewCount: 45200, duration: '0:48'},
  {id: 'tc2', thumbnailUrl: 'https://placehold.co/120x160/1E1E1E/00C853?text=CLIP', title: '역전 결승골 세리머니', viewCount: 28700, duration: '0:35'},
  {id: 'tc3', thumbnailUrl: 'https://placehold.co/120x160/1E1E1E/00C853?text=CLIP', title: '골키퍼 슈퍼 세이브', viewCount: 19800, duration: '0:22'},
  {id: 'tc4', thumbnailUrl: 'https://placehold.co/120x160/1E1E1E/00C853?text=CLIP', title: '중거리 환상 슛', viewCount: 55300, duration: '0:18'},
  {id: 'tc5', thumbnailUrl: 'https://placehold.co/120x160/1E1E1E/00C853?text=CLIP', title: '패스 연결 팀플레이 골', viewCount: 12400, duration: '0:42'},
  {id: 'tc6', thumbnailUrl: 'https://placehold.co/120x160/1E1E1E/00C853?text=CLIP', title: '자책골 웃긴 장면', viewCount: 87600, duration: '0:15'},
];

const MOCK_MATCHES: MatchItem[] = [
  {id: 'tm1', date: '2026.03.23', time: '14:00', round: '7라운드', status: 'SCHEDULED', homeName: '전북 현대', awayName: '울산 HD', competition: 'K리그1'},
  {id: 'tm2', date: '2026.03.19', time: '14:00', round: '6라운드', status: 'COMPLETED', homeName: '전북 현대', awayName: '울산 HD', homeScore: 3, awayScore: 1, competition: 'K리그1'},
  {id: 'tm3', date: '2026.03.15', time: '16:00', round: '5라운드', status: 'COMPLETED', homeName: '수원 FC', awayName: '전북 현대', homeScore: 0, awayScore: 2, competition: 'K리그1'},
  {id: 'tm4', date: '2026.03.26', time: '19:00', round: '8라운드', status: 'SCHEDULED', homeName: 'FC 서울', awayName: '전북 현대', competition: 'K리그1'},
  {id: 'tm5', date: '2026.03.30', time: '14:00', round: '9라운드', status: 'SCHEDULED', homeName: '전북 현대', awayName: '인천 유나이티드', competition: 'K리그1'},
];

const MOCK_POSTS: PostItem[] = [
  {id: 'tp1', title: '오늘 경기 MVP는 누구라고 생각하시나요?', authorName: '열혈팬', createdAt: '1시간 전', likeCount: 42, commentCount: 28},
  {id: 'tp2', title: '이번 시즌 전력 분석', authorName: '전술가', createdAt: '3시간 전', likeCount: 67, commentCount: 31},
  {id: 'tp3', title: '원정 응원 같이 가실 분!', authorName: '원정마니아', createdAt: '5시간 전', likeCount: 18, commentCount: 9},
  {id: 'tp4', title: '새 유니폼 디자인 어떻게 생각하세요?', authorName: '디자인러버', createdAt: '1일 전', likeCount: 55, commentCount: 44},
  {id: 'tp5', title: '이적시장 루머 정리', authorName: '뉴스봇', createdAt: '2일 전', likeCount: 89, commentCount: 52},
];

const TABS: TabName[] = ['홈', '영상', '일정', '게시글', '정보'];

// ─── Helpers ─────────────────────────────────────────────

function groupMatchesByDate(matches: MatchItem[]): Record<string, MatchItem[]> {
  const grouped: Record<string, MatchItem[]> = {};
  for (const m of matches) {
    if (!grouped[m.date]) grouped[m.date] = [];
    grouped[m.date].push(m);
  }
  return grouped;
}

function statusLabel(status: MatchItem['status']): string {
  switch (status) {
    case 'LIVE': return 'LIVE';
    case 'COMPLETED': return '종료';
    case 'SCHEDULED': return '예정';
  }
}

function statusColor(status: MatchItem['status']): string {
  switch (status) {
    case 'LIVE': return colors.error;
    case 'COMPLETED': return colors.gray;
    case 'SCHEDULED': return colors.green;
  }
}

// ─── Component ───────────────────────────────────────────

export default function TeamDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<TeamDetailRouteProp>();
  const {teamId} = route.params;

  const team = MOCK_TEAMS[teamId] || DEFAULT_TEAM;

  const [activeTab, setActiveTab] = useState<TabName>('홈');
  const [videoSubTab, setVideoSubTab] = useState<VideoSubTab>('영상');
  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);

  useEffect(() => {
    isFollowing('team', teamId).then(setFollowing);
    getFollowerCount('team', teamId).then(setFollowerCount);
  }, [teamId]);

  const handleToggleFollow = useCallback(async () => {
    const prev = following;
    const prevCount = followerCount;
    setFollowing(!prev);
    setFollowerCount(prev ? prevCount - 1 : prevCount + 1);
    try {
      const result = await toggleFollow('team', teamId);
      setFollowing(result);
    } catch {
      setFollowing(prev);
      setFollowerCount(prevCount);
    }
  }, [following, followerCount, teamId]);

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
          팀 상세
        </Text>
        <TouchableOpacity activeOpacity={0.7} style={styles.shareButton}>
          <Ionicons name="share-outline" size={22} color={colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <View style={styles.bannerWrap}>
          <Image
            source={{uri: team.bannerUrl}}
            style={styles.banner}
            resizeMode="cover"
          />
          <View style={styles.logoWrap}>
            <Image
              source={{uri: team.logoUrl}}
              style={styles.logo}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* Team Info */}
        <View style={styles.infoSection}>
          <Text style={styles.teamName}>{team.name}</Text>
          <View style={styles.infoRow}>
            <View style={styles.sportBadge}>
              <Text style={styles.sportBadgeText}>{team.sport}</Text>
            </View>
            <Text style={styles.leagueText}>{team.league}</Text>
            <Text style={styles.regionText}>{team.region}</Text>
          </View>
          <Text style={styles.description}>{team.description}</Text>

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
                {following ? '팔로잉' : '즐겨보기'}
              </Text>
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
                  style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Tab Content */}
        {activeTab === '홈' && <HomeTab />}
        {activeTab === '영상' && (
          <VideoTab subTab={videoSubTab} onSubTabChange={setVideoSubTab} />
        )}
        {activeTab === '일정' && <ScheduleTab />}
        {activeTab === '게시글' && <PostsTab />}
        {activeTab === '정보' && <InfoTab team={team} />}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Home Tab ────────────────────────────────────────────

function HomeTab() {
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
          data={MOCK_CLIPS.slice(0, 4)}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
          keyExtractor={item => item.id}
          renderItem={({item}) => <ClipCard item={item} />}
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
          data={MOCK_VIDEOS.slice(0, 3)}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
          keyExtractor={item => item.id}
          renderItem={({item}) => <VideoCard item={item} />}
        />
      </View>

      {/* Recent Posts */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>게시글</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.sectionMore}>전체보기</Text>
          </TouchableOpacity>
        </View>
        {MOCK_POSTS.slice(0, 3).map(post => (
          <PostRow key={post.id} post={post} />
        ))}
      </View>
    </View>
  );
}

// ─── Video Tab ───────────────────────────────────────────

function VideoTab({
  subTab,
  onSubTabChange,
}: {
  subTab: VideoSubTab;
  onSubTabChange: (t: VideoSubTab) => void;
}) {
  return (
    <View>
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
                style={[styles.subTabText, isActive && styles.subTabTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {subTab === '영상' && (
        <View style={styles.videoListSection}>
          {MOCK_VIDEOS.map(video => (
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
          ))}
        </View>
      )}

      {subTab === '클립' && (
        <View style={styles.clipGrid}>
          {MOCK_CLIPS.map(clip => (
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
          ))}
        </View>
      )}
    </View>
  );
}

// ─── Schedule Tab ────────────────────────────────────────

function ScheduleTab() {
  const grouped = groupMatchesByDate(MOCK_MATCHES);
  const dates = Object.keys(grouped).sort();

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
                <Text style={styles.matchCompetition}>{match.competition}</Text>
                <Text style={styles.matchRound}>{match.round}</Text>
                <View style={styles.matchTeamsRow}>
                  <Text style={styles.matchTeamName}>{match.homeName}</Text>
                  {match.status === 'COMPLETED' ? (
                    <Text style={styles.matchScore}>
                      {match.homeScore} : {match.awayScore}
                    </Text>
                  ) : (
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
      {MOCK_POSTS.map(post => (
        <PostRow key={post.id} post={post} />
      ))}
    </View>
  );
}

// ─── Info Tab ────────────────────────────────────────────

function InfoTab({team}: {team: TeamData}) {
  return (
    <View style={styles.infoTabSection}>
      <InfoRow label="팀명" value={team.name} />
      <InfoRow label="종목" value={team.sport} />
      <InfoRow label="리그" value={team.league} />
      <InfoRow label="창단" value={team.founded} />
      <InfoRow label="감독" value={team.coach} />
      <InfoRow label="선수단" value={`${team.playerCount}명`} />
      <InfoRow label="홈구장" value={team.homeGround} />
      <InfoRow label="연고지" value={team.region} />
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

function VideoCard({item}: {item: VideoItem}) {
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

function ClipCard({item}: {item: ClipItem}) {
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
  logoWrap: {
    position: 'absolute',
    bottom: 0,
    left: 16,
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.bg,
    padding: 3,
  },
  logo: {
    width: '100%',
    height: '100%',
    borderRadius: 33,
    backgroundColor: colors.grayDark,
  },

  // Info
  infoSection: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.grayDark,
  },
  teamName: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.white,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
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
  leagueText: {
    fontSize: 13,
    color: colors.grayLight,
    fontWeight: '600',
  },
  regionText: {
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
    marginBottom: 4,
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

  // Video Card (horizontal)
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

  // Clip Card (horizontal)
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
  matchCompetition: {
    fontSize: 11,
    color: colors.green,
    fontWeight: '600',
    marginBottom: 2,
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
});
