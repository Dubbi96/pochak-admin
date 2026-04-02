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
import {colors} from '../../theme';
import type {RootStackParamList} from '../../navigation/types';
import {
  toggleFollow,
  getFollowerCount,
  isFollowing,
} from '../../services/followApi';

type CompetitionDetailRouteProp = RouteProp<RootStackParamList, 'CompetitionDetail'>;

// ─── Types ───────────────────────────────────────────────

type TabName = '홈' | '영상' | '일정' | '게시글' | '정보';
type VideoSubTab = '영상' | '클립';

interface CompetitionData {
  id: string;
  name: string;
  sport: string;
  imageUrl: string;
  bannerUrl: string;
  startDate: string;
  endDate: string;
  description: string;
  isFree: boolean;
  organizer: string;
  venue: string;
  participantCount: number;
  tags: string[];
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

const MOCK_COMPETITIONS: Record<string, CompetitionData> = {
  'comp-1': {
    id: 'comp-1',
    name: '2026 K리그1',
    sport: '축구',
    imageUrl: 'https://placehold.co/80x80/1E1E1E/00C853?text=K1',
    bannerUrl: 'https://placehold.co/400x200/0D3B0D/00C853?text=K+LEAGUE+1',
    startDate: '2026.03.01',
    endDate: '2026.11.30',
    description: '2026 시즌 K리그1 정규리그. 대한민국 최고의 프로축구 리그로, 12개 팀이 참가하여 치열한 경쟁을 펼칩니다.',
    isFree: false,
    organizer: '한국프로축구연맹',
    venue: '전국 12개 구장',
    participantCount: 12,
    tags: ['축구', '유료', '해설'],
  },
  'comp-2': {
    id: 'comp-2',
    name: '2026 KBO 리그',
    sport: '야구',
    imageUrl: 'https://placehold.co/80x80/1E1E1E/00C853?text=KBO',
    bannerUrl: 'https://placehold.co/400x200/1A0D3B/4488FF?text=KBO+LEAGUE',
    startDate: '2026.03.15',
    endDate: '2026.10.31',
    description: '2026 시즌 KBO 프로야구. 10개 구단이 참가하는 대한민국 대표 프로야구 리그입니다.',
    isFree: true,
    organizer: '한국야구위원회',
    venue: '전국 10개 구장',
    participantCount: 10,
    tags: ['야구', '무료', '해설'],
  },
};

const DEFAULT_COMPETITION: CompetitionData = {
  id: 'default',
  name: '대회명',
  sport: '스포츠',
  imageUrl: 'https://placehold.co/80x80/1E1E1E/00C853?text=?',
  bannerUrl: 'https://placehold.co/400x200/1E1E1E/00C853?text=COMPETITION',
  startDate: '2026.01.01',
  endDate: '2026.12.31',
  description: '대회 설명이 준비 중입니다.',
  isFree: false,
  organizer: '-',
  venue: '-',
  participantCount: 0,
  tags: [],
};

const MOCK_VIDEOS: VideoItem[] = [
  {id: 'cv1', thumbnailUrl: 'https://placehold.co/320x180/1E1E1E/4488FF?text=VOD', title: '전북 vs 울산 하이라이트', date: '2026.03.19', viewCount: 24500, duration: '12:34'},
  {id: 'cv2', thumbnailUrl: 'https://placehold.co/320x180/1E1E1E/4488FF?text=VOD', title: '수원 FC vs FC 서울 풀경기', date: '2026.03.19', viewCount: 18200, duration: '1:52:10'},
  {id: 'cv3', thumbnailUrl: 'https://placehold.co/320x180/1E1E1E/4488FF?text=VOD', title: '인천 vs 대전 경기 리뷰', date: '2026.03.18', viewCount: 9800, duration: '15:22'},
  {id: 'cv4', thumbnailUrl: 'https://placehold.co/320x180/1E1E1E/4488FF?text=VOD', title: '제주 vs 강원 베스트 플레이', date: '2026.03.17', viewCount: 7300, duration: '8:45'},
  {id: 'cv5', thumbnailUrl: 'https://placehold.co/320x180/1E1E1E/4488FF?text=VOD', title: '포항 vs 김천 전반전 하이라이트', date: '2026.03.16', viewCount: 5600, duration: '6:30'},
];

const MOCK_CLIPS: ClipItem[] = [
  {id: 'cc1', thumbnailUrl: 'https://placehold.co/120x160/1E1E1E/00C853?text=CLIP', title: '환상적인 프리킥 골!', viewCount: 34200, duration: '0:32'},
  {id: 'cc2', thumbnailUrl: 'https://placehold.co/120x160/1E1E1E/00C853?text=CLIP', title: '수비수의 슬라이딩 태클', viewCount: 15800, duration: '0:18'},
  {id: 'cc3', thumbnailUrl: 'https://placehold.co/120x160/1E1E1E/00C853?text=CLIP', title: '역전골 세리머니', viewCount: 28900, duration: '0:45'},
  {id: 'cc4', thumbnailUrl: 'https://placehold.co/120x160/1E1E1E/00C853?text=CLIP', title: '골키퍼 신들린 세이브', viewCount: 42100, duration: '0:22'},
  {id: 'cc5', thumbnailUrl: 'https://placehold.co/120x160/1E1E1E/00C853?text=CLIP', title: '논란의 VAR 판정', viewCount: 67300, duration: '1:05'},
  {id: 'cc6', thumbnailUrl: 'https://placehold.co/120x160/1E1E1E/00C853?text=CLIP', title: '헤딩 연결 추가골', viewCount: 11200, duration: '0:28'},
];

const MOCK_MATCHES: MatchItem[] = [
  {id: 'cm1', date: '2026.03.23', time: '14:00', round: '7라운드', status: 'SCHEDULED', homeName: '전북 현대', awayName: '울산 HD'},
  {id: 'cm2', date: '2026.03.23', time: '16:00', round: '7라운드', status: 'SCHEDULED', homeName: '수원 FC', awayName: 'FC 서울'},
  {id: 'cm3', date: '2026.03.23', time: '19:00', round: '7라운드', status: 'SCHEDULED', homeName: '인천 유나이티드', awayName: '대전 하나시티즌'},
  {id: 'cm4', date: '2026.03.19', time: '14:00', round: '6라운드', status: 'COMPLETED', homeName: '전북 현대', awayName: '울산 HD', homeScore: 3, awayScore: 1},
  {id: 'cm5', date: '2026.03.19', time: '19:30', round: '6라운드', status: 'COMPLETED', homeName: '수원 FC', awayName: 'FC 서울', homeScore: 1, awayScore: 2},
  {id: 'cm6', date: '2026.03.26', time: '14:00', round: '8라운드', status: 'SCHEDULED', homeName: 'FC 서울', awayName: '전북 현대'},
  {id: 'cm7', date: '2026.03.26', time: '16:00', round: '8라운드', status: 'SCHEDULED', homeName: '울산 HD', awayName: '수원 FC'},
];

const MOCK_POSTS: PostItem[] = [
  {id: 'cp1', title: '오늘 경기 어떻게 보셨나요?', authorName: '축구팬123', createdAt: '2시간 전', likeCount: 24, commentCount: 12},
  {id: 'cp2', title: '전북 이번 시즌 전력 분석', authorName: '분석왕', createdAt: '5시간 전', likeCount: 48, commentCount: 23},
  {id: 'cp3', title: '다음 라운드 예측합니다', authorName: '예측러', createdAt: '1일 전', likeCount: 15, commentCount: 8},
  {id: 'cp4', title: '심판 판정 논란에 대해', authorName: '공정심판', createdAt: '1일 전', likeCount: 92, commentCount: 67},
  {id: 'cp5', title: '이번 시즌 MVP 후보는?', authorName: '축구매니아', createdAt: '2일 전', likeCount: 33, commentCount: 19},
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

export default function CompetitionDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<CompetitionDetailRouteProp>();
  const {competitionId} = route.params;

  const competition = MOCK_COMPETITIONS[competitionId] || DEFAULT_COMPETITION;

  const [activeTab, setActiveTab] = useState<TabName>('홈');
  const [videoSubTab, setVideoSubTab] = useState<VideoSubTab>('영상');
  const [bookmarked, setBookmarked] = useState(false);
  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);

  useEffect(() => {
    isFollowing('competition', competitionId).then(setFollowing);
    getFollowerCount('competition', competitionId).then(setFollowerCount);
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
        {activeTab === '홈' && <HomeTab />}
        {activeTab === '영상' && (
          <VideoTab subTab={videoSubTab} onSubTabChange={setVideoSubTab} />
        )}
        {activeTab === '일정' && <ScheduleTab />}
        {activeTab === '게시글' && <PostsTab />}
        {activeTab === '정보' && <InfoTab competition={competition} />}

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
      {MOCK_POSTS.map(post => (
        <PostRow key={post.id} post={post} />
      ))}
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
