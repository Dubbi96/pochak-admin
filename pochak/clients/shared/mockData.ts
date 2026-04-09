/**
 * Pochak Shared Mock Data
 * ─────────────────────────────────────────────────────────────────────────────
 * Unified mock data that ALL platforms import.
 * Consistent IDs (live-1..6, vod-1..6, clip-1..8, comp-1..5, ch-1..7).
 * Themed around realistic 2025 Korean youth/amateur sports content.
 */

import type {
  PochakContent,
  PochakBanner,
  PochakCompetition,
  PochakChannel,
  PochakClipItem,
  PochakMatch,
  BannerItem,
  LiveContentItem,
  CompetitionItem,
  OfficialContentItem,
  RegularContentItem,
  ClipContentItem,
  ContentSection,
  SidebarMenu,
  ContentCard,
  MatchItem,
  CompetitionCard,
  PopularChannel,
  PopularClip,
  AdBanner,
  PlayerData,
  UserProfile,
  WatchHistoryItem,
  PochakPost,
  PochakProduct,
} from './types';

// ═══════════════════════════════════════════════════════════════════════════════
// UNIFIED CORE DATA (platform-agnostic)
// ═══════════════════════════════════════════════════════════════════════════════

// ── Banners ────────────────────────────────────────────────────────────────────

export const pochakBanners: PochakBanner[] = [
  {
    id: 'banner-1',
    title: '포착 TV 2025 화랑대기\n전경기 무료 LIVE 중계',
    subtitle: '유소년 축구 대회의 모든 경기를 포착하세요',
    imageUrl: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=1280&h=480&fit=crop&auto=format',
    linkUrl: '/contents/live/live-1',
  },
  {
    id: 'banner-2',
    title: '제5회 전국 리틀야구\n생중계 안내',
    subtitle: '미래의 야구 스타를 만나보세요',
    imageUrl: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=1280&h=480&fit=crop&auto=format',
    linkUrl: '/contents/live/live-4',
  },
  {
    id: 'banner-3',
    title: '제30회 서울시 협회장기\n테니스 대회',
    subtitle: '최고의 아마추어 테니스를 감상하세요',
    imageUrl: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1280&h=480&fit=crop&auto=format',
    linkUrl: '/contents/live/live-5',
  },
];

// ── Live Matches (6 total: 3 LIVE, 3 SCHEDULED) ───────────────────────────────

export const pochakLiveContents: PochakContent[] = [
  {
    id: 'live-1',
    title: '[축구] 경기용인YSFC vs 대구강북주니어',
    type: 'LIVE',
    status: 'LIVE',
    thumbnailUrl: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=640&h=360&fit=crop&auto=format',
    streamUrl: 'https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8',
    duration: null,
    sport: '축구',
    competition: '2025 화랑대기 유소년축구',
    homeTeam: { name: '경기용인YSFC', shortName: '용인', logoColor: '#1565C0' },
    awayTeam: { name: '대구강북주니어', shortName: '대구', logoColor: '#E53935' },
    tags: ['무료LIVE', '축구', '화랑대기', '유소년축구'],
    viewCount: 3420,
    likeCount: 215,
    date: '2025-10-20T12:00:00',
    createdAt: '2025-10-18T09:00:00',
  },
  {
    id: 'live-2',
    title: '[축구] 인천남동FC vs 수원삼성블루윙즈',
    type: 'LIVE',
    status: 'LIVE',
    thumbnailUrl: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=640&h=360&fit=crop&auto=format',
    streamUrl: 'https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8',
    duration: null,
    sport: '축구',
    competition: '2025 화랑대기 유소년축구',
    homeTeam: { name: '인천남동FC', shortName: '인천', logoColor: '#0D47A1' },
    awayTeam: { name: '수원삼성블루윙즈', shortName: '수원', logoColor: '#1976D2' },
    tags: ['무료LIVE', '축구', '화랑대기', '유소년축구'],
    viewCount: 2100,
    likeCount: 142,
    date: '2025-10-20T12:00:00',
    createdAt: '2025-10-18T09:00:00',
  },
  {
    id: 'live-3',
    title: '[축구] 서울강남FC vs 부산서면유소년',
    type: 'LIVE',
    status: 'LIVE',
    thumbnailUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=640&h=360&fit=crop&auto=format',
    streamUrl: 'https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8',
    duration: null,
    sport: '축구',
    competition: '2025 화랑대기 유소년축구',
    homeTeam: { name: '서울강남FC', shortName: '강남', logoColor: '#4CAF50' },
    awayTeam: { name: '부산서면유소년', shortName: '부산', logoColor: '#F44336' },
    tags: ['무료LIVE', '축구', '화랑대기'],
    viewCount: 1540,
    likeCount: 98,
    date: '2025-10-20T14:00:00',
    createdAt: '2025-10-18T09:00:00',
  },
  {
    id: 'live-4',
    title: '[야구] 인천리틀스타 vs 수원이글스Jr',
    type: 'LIVE',
    status: 'SCHEDULED',
    thumbnailUrl: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=640&h=360&fit=crop&auto=format',
    streamUrl: null,
    duration: null,
    sport: '야구',
    competition: '제5회 전국 리틀야구',
    homeTeam: { name: '인천리틀스타', shortName: '인천', logoColor: '#FF9800' },
    awayTeam: { name: '수원이글스Jr', shortName: '수원', logoColor: '#388E3C' },
    tags: ['야구', '리틀야구', '유소년야구'],
    viewCount: 0,
    likeCount: 0,
    date: '2025-11-01T10:00:00',
    createdAt: '2025-10-25T09:00:00',
  },
  {
    id: 'live-5',
    title: '[테니스] 서울시협회장기 남자단식 결승',
    type: 'LIVE',
    status: 'SCHEDULED',
    thumbnailUrl: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=640&h=360&fit=crop&auto=format',
    streamUrl: null,
    duration: null,
    sport: '테니스',
    competition: '제30회 서울시 협회장기',
    homeTeam: { name: '김재훈', shortName: '김재훈', logoColor: '#00897B' },
    awayTeam: { name: '박성호', shortName: '박성호', logoColor: '#7B1FA2' },
    tags: ['테니스', '서울시', '결승'],
    viewCount: 0,
    likeCount: 0,
    date: '2025-11-05T14:00:00',
    createdAt: '2025-10-28T09:00:00',
  },
  {
    id: 'live-6',
    title: '[풋살] 나이키 에어맥스 프리데이 결승',
    type: 'LIVE',
    status: 'SCHEDULED',
    thumbnailUrl: 'https://images.unsplash.com/photo-1609710228159-0fa9bd7e0be5?w=640&h=360&fit=crop&auto=format',
    streamUrl: null,
    duration: null,
    sport: '풋살',
    competition: '나이키 에어맥스 프리데이',
    homeTeam: { name: '서울시청FC', shortName: '서울', logoColor: '#FF6D00' },
    awayTeam: { name: '강남유나이티드', shortName: '강남', logoColor: '#000000' },
    tags: ['풋살', '나이키', '프리데이'],
    viewCount: 0,
    likeCount: 0,
    date: '2025-10-27T16:00:00',
    createdAt: '2025-10-20T09:00:00',
  },
];

// ── VOD Contents (6) ───────────────────────────────────────────────────────────

export const pochakVodContents: PochakContent[] = [
  {
    id: 'vod-1',
    title: '경기용인 vs 대구강북 풀 하이라이트',
    type: 'VOD',
    status: 'ENDED',
    thumbnailUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=640&h=360&fit=crop&auto=format',
    streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    duration: 332,
    sport: '축구',
    competition: '2025 화랑대기 유소년축구',
    homeTeam: { name: '경기용인YSFC', shortName: '용인', logoColor: '#1565C0' },
    awayTeam: { name: '대구강북주니어', shortName: '대구', logoColor: '#E53935' },
    tags: ['축구', '화랑대기', '베스트골', '하이라이트'],
    viewCount: 45200,
    likeCount: 3200,
    date: '2025-10-19T12:00:00',
    createdAt: '2025-10-19T18:00:00',
  },
  {
    id: 'vod-2',
    title: '인천남동 vs 수원삼성 풀매치',
    type: 'VOD',
    status: 'ENDED',
    thumbnailUrl: 'https://images.unsplash.com/photo-1520099988040-d10cd10c0f0a?w=640&h=360&fit=crop&auto=format',
    streamUrl: 'https://devstreaming-cdn.apple.com/videos/streaming/examples/bipbop_16x9/bipbop_16x9_variant.m3u8',
    duration: 6750,
    sport: '축구',
    competition: '2025 화랑대기 유소년축구',
    homeTeam: { name: '인천남동FC', shortName: '인천', logoColor: '#0D47A1' },
    awayTeam: { name: '수원삼성블루윙즈', shortName: '수원', logoColor: '#1976D2' },
    tags: ['축구', '화랑대기', '풀매치'],
    viewCount: 32100,
    likeCount: 2100,
    date: '2025-10-19T14:00:00',
    createdAt: '2025-10-19T20:00:00',
  },
  {
    id: 'vod-3',
    title: '서울강남 vs 부산서면 베스트 플레이',
    type: 'VOD',
    status: 'ENDED',
    thumbnailUrl: 'https://images.unsplash.com/photo-1540553016-d3686d85131f?w=640&h=360&fit=crop&auto=format',
    streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    duration: 6310,
    sport: '축구',
    competition: '2025 화랑대기 유소년축구',
    homeTeam: { name: '서울강남FC', shortName: '강남', logoColor: '#4CAF50' },
    awayTeam: { name: '부산서면유소년', shortName: '부산', logoColor: '#F44336' },
    tags: ['축구', '화랑대기', '하이라이트'],
    viewCount: 28700,
    likeCount: 1850,
    date: '2025-10-18T14:00:00',
    createdAt: '2025-10-18T20:00:00',
  },
  {
    id: 'vod-4',
    title: '대구 vs 포항 풀 하이라이트',
    type: 'VOD',
    status: 'ENDED',
    thumbnailUrl: 'https://images.unsplash.com/photo-1486286153849-69f845c9e04c?w=640&h=360&fit=crop&auto=format',
    streamUrl: 'https://devstreaming-cdn.apple.com/videos/streaming/examples/bipbop_16x9/bipbop_16x9_variant.m3u8',
    duration: 298,
    sport: '축구',
    competition: '2025 화랑대기 유소년축구',
    homeTeam: { name: '대구FC유소년', shortName: '대구', logoColor: '#1976D2' },
    awayTeam: { name: '포항스틸러스Jr', shortName: '포항', logoColor: '#D32F2F' },
    tags: ['축구', '화랑대기', '하이라이트'],
    viewCount: 21000,
    likeCount: 1400,
    date: '2025-10-18T12:00:00',
    createdAt: '2025-10-18T18:00:00',
  },
  {
    id: 'vod-5',
    title: '감독의 하루 - 화랑대기 편',
    type: 'VOD',
    status: 'ENDED',
    thumbnailUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=640&h=360&fit=crop&auto=format',
    streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    duration: 1820,
    sport: '축구',
    competition: '2025 화랑대기 유소년축구',
    homeTeam: { name: '포착 오리지널', shortName: '포착', logoColor: '#00C853' },
    awayTeam: { name: '-', shortName: '-', logoColor: '#999999' },
    tags: ['오리지널', '다큐', '화랑대기'],
    viewCount: 34500,
    likeCount: 4200,
    date: '2025-10-17T00:00:00',
    createdAt: '2025-10-17T09:00:00',
  },
  {
    id: 'vod-6',
    title: '루키 다이어리 시즌2 EP.1',
    type: 'VOD',
    status: 'ENDED',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=640&h=360&fit=crop&auto=format',
    streamUrl: 'https://devstreaming-cdn.apple.com/videos/streaming/examples/bipbop_16x9/bipbop_16x9_variant.m3u8',
    duration: 2400,
    sport: '축구',
    competition: '2025 화랑대기 유소년축구',
    homeTeam: { name: '포착 오리지널', shortName: '포착', logoColor: '#00C853' },
    awayTeam: { name: '-', shortName: '-', logoColor: '#999999' },
    tags: ['오리지널', '루키', '밀착취재'],
    viewCount: 28100,
    likeCount: 3100,
    date: '2025-10-16T00:00:00',
    createdAt: '2025-10-16T09:00:00',
  },
];

// ── Clips (8) ──────────────────────────────────────────────────────────────────

export const pochakClips: PochakClipItem[] = [
  { id: 'clip-1', title: 'U12 유망주 김포착 환상 드리블', viewCount: 152000, duration: 32 },
  { id: 'clip-2', title: '경기용인 수비수 신들린 태클', viewCount: 98400, duration: 65 },
  { id: 'clip-3', title: '대구강북 에이스 프리킥 골', viewCount: 87600, duration: 48 },
  { id: 'clip-4', title: '결승골 세리머니 모음', viewCount: 76300, duration: 25 },
  { id: 'clip-5', title: '화랑대기 골키퍼 신들린 세이브', viewCount: 65100, duration: 18 },
  { id: 'clip-6', title: '리틀야구 9회말 역전 홈런', viewCount: 54200, duration: 40 },
  { id: 'clip-7', title: '테니스 매치포인트 에이스 모음', viewCount: 43100, duration: 55 },
  { id: 'clip-8', title: '화랑대기 베스트 프리킥 TOP5', viewCount: 38700, duration: 120 },
];

// ── Competitions (5) ───────────────────────────────────────────────────────────

export const pochakCompetitions: PochakCompetition[] = [
  {
    id: 'comp-1',
    name: '2025 화랑대기',
    subtitle: '유소년축구',
    sport: '축구',
    dateRange: '2025. 10/20 ~ 10/30',
    logoColor: '#E53935',
    logoText: 'KFA',
    isAd: false,
  },
  {
    id: 'comp-2',
    name: '제5회 전국 리틀야구',
    subtitle: '리틀야구',
    sport: '야구',
    dateRange: '2025. 11/01 ~ 11/10',
    logoColor: '#1565C0',
    logoText: 'KBA',
    isAd: false,
  },
  {
    id: 'comp-3',
    name: '나이키 에어맥스 프리데이',
    subtitle: '풋살대회',
    sport: '풋살',
    dateRange: '2025. 10/25 ~ 10/27',
    logoColor: '#FF6D00',
    logoText: 'NK',
    isAd: true,
  },
  {
    id: 'comp-4',
    name: '제30회 서울시 협회장기',
    subtitle: '테니스 대회',
    sport: '테니스',
    dateRange: '2025. 11/05 ~ 11/15',
    logoColor: '#00897B',
    logoText: 'STA',
    isAd: false,
  },
  {
    id: 'comp-5',
    name: '2025 전국체전',
    subtitle: '종합체육대회',
    sport: '전체',
    dateRange: '2025. 10/15 ~ 10/22',
    logoColor: '#7B1FA2',
    logoText: 'KSA',
    isAd: false,
  },
];

// ── Channels (7) ───────────────────────────────────────────────────────────────

export const pochakChannels: PochakChannel[] = [
  { id: 'ch-1', name: '송도고', subtitle: '2025 화랑대기 유소년축구', color: '#1565C0', initial: '송', memberCount: 1240 },
  { id: 'ch-2', name: '울산울브스FC', subtitle: '2024 포착 유소년축구', color: '#FF9800', initial: '울', memberCount: 980 },
  { id: 'ch-3', name: '경기용인YSFC', subtitle: '2025 화랑대기', color: '#4CAF50', initial: '경', memberCount: 2350 },
  { id: 'ch-4', name: '대구강북주니어', subtitle: '2025 화랑대기', color: '#E53935', initial: '대', memberCount: 870 },
  { id: 'ch-5', name: '인천남동FC', subtitle: '2025 화랑대기 유소년축구', color: '#0D47A1', initial: '인', memberCount: 1560 },
  { id: 'ch-6', name: '서울강남FC', subtitle: '2025 화랑대기', color: '#4CAF50', initial: '서', memberCount: 1120 },
  { id: 'ch-7', name: '부산서면유소년', subtitle: '2025 화랑대기', color: '#F44336', initial: '부', memberCount: 760 },
];

// ── Live Matches (PochakMatch format for schedule views) ───────────────────────

export const pochakMatches: PochakMatch[] = [
  {
    id: 'live-1',
    date: '2025-10-20',
    time: '12:00',
    homeTeam: '경기용인YSFC',
    homeTeamShort: '용인',
    homeTeamColor: '#1565C0',
    awayTeam: '대구강북주니어',
    awayTeamShort: '대구',
    awayTeamColor: '#E53935',
    competition: '2025 화랑대기 유소년축구',
    competitionBadge: 'KFA',
    sport: '축구',
    status: 'LIVE',
    tags: ['무료LIVE', '축구', '화랑대기', '유소년축구'],
  },
  {
    id: 'live-2',
    date: '2025-10-20',
    time: '12:00',
    homeTeam: '인천남동FC',
    homeTeamShort: '인천',
    homeTeamColor: '#0D47A1',
    awayTeam: '수원삼성블루윙즈',
    awayTeamShort: '수원',
    awayTeamColor: '#1976D2',
    competition: '2025 화랑대기 유소년축구',
    competitionBadge: 'KFA',
    sport: '축구',
    status: 'LIVE',
    tags: ['무료LIVE', '축구', '화랑대기', '유소년축구'],
  },
  {
    id: 'live-3',
    date: '2025-10-20',
    time: '14:00',
    homeTeam: '서울강남FC',
    homeTeamShort: '강남',
    homeTeamColor: '#4CAF50',
    awayTeam: '부산서면유소년',
    awayTeamShort: '부산',
    awayTeamColor: '#F44336',
    competition: '2025 화랑대기 유소년축구',
    competitionBadge: 'KFA',
    sport: '축구',
    status: 'LIVE',
    tags: ['무료LIVE', '축구', '화랑대기'],
  },
  {
    id: 'live-4',
    date: '2025-11-01',
    time: '10:00',
    homeTeam: '인천리틀스타',
    homeTeamShort: '인천',
    homeTeamColor: '#FF9800',
    awayTeam: '수원이글스Jr',
    awayTeamShort: '수원',
    awayTeamColor: '#388E3C',
    competition: '제5회 전국 리틀야구',
    competitionBadge: 'KBA',
    sport: '야구',
    status: '예정',
    tags: ['야구', '리틀야구', '유소년야구'],
  },
  {
    id: 'live-5',
    date: '2025-11-05',
    time: '14:00',
    homeTeam: '김재훈',
    homeTeamShort: '김재훈',
    homeTeamColor: '#00897B',
    awayTeam: '박성호',
    awayTeamShort: '박성호',
    awayTeamColor: '#7B1FA2',
    competition: '제30회 서울시 협회장기',
    competitionBadge: 'STA',
    sport: '테니스',
    status: '예정',
    tags: ['테니스', '서울시', '결승'],
  },
  {
    id: 'live-6',
    date: '2025-10-27',
    time: '16:00',
    homeTeam: '서울시청FC',
    homeTeamShort: '서울',
    homeTeamColor: '#FF6D00',
    awayTeam: '강남유나이티드',
    awayTeamShort: '강남',
    awayTeamColor: '#000000',
    competition: '나이키 에어맥스 프리데이',
    competitionBadge: 'NK',
    sport: '풋살',
    status: '예정',
    tags: ['풋살', '나이키', '프리데이'],
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// MOBILE-FORMAT MOCK DATA (backward compatible with homeApi.ts exports)
// ═══════════════════════════════════════════════════════════════════════════════

export const mockBanners: BannerItem[] = [
  {
    id: 'banner-1',
    imageUrl: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=1280&h=480&fit=crop&auto=format',
    title: '2025 화랑대기 전경기 무료 LIVE',
    subtitle: '유소년 축구 대회의 모든 경기를 포착하세요',
  },
  {
    id: 'banner-2',
    imageUrl: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=1280&h=480&fit=crop&auto=format',
    title: '제5회 전국 리틀야구 생중계',
    subtitle: '미래의 야구 스타를 만나보세요',
  },
  {
    id: 'banner-3',
    imageUrl: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1280&h=480&fit=crop&auto=format',
    title: '제30회 서울시 협회장기 테니스',
    subtitle: '최고의 아마추어 테니스를 감상하세요',
  },
];

export const mockLiveContents: LiveContentItem[] = [
  {
    id: 'live-1',
    thumbnailUrl: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=400&h=240&fit=crop&auto=format',
    teamHome: '경기용인YSFC',
    teamAway: '대구강북주니어',
    league: '2025 화랑대기',
    time: '전반 32분',
    viewerCount: 3420,
  },
  {
    id: 'live-2',
    thumbnailUrl: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400&h=240&fit=crop&auto=format',
    teamHome: '인천남동FC',
    teamAway: '수원삼성블루윙즈',
    league: '2025 화랑대기',
    time: '후반 15분',
    viewerCount: 2100,
  },
  {
    id: 'live-3',
    thumbnailUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=240&fit=crop&auto=format',
    teamHome: '서울강남FC',
    teamAway: '부산서면유소년',
    league: '2025 화랑대기',
    time: '전반 5분',
    viewerCount: 1540,
  },
];

export const mockCompetitions: CompetitionItem[] = [
  {
    id: 'comp-1',
    thumbnailUrl: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=560&h=280&fit=crop&auto=format',
    title: '2025 화랑대기 유소년축구',
    date: '10.20 (월) ~ 10.30 (목)',
    status: '진행중',
  },
  {
    id: 'comp-2',
    thumbnailUrl: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=560&h=280&fit=crop&auto=format',
    title: '제5회 전국 리틀야구',
    date: '11.01 (토) ~ 11.10 (월)',
    status: '예정',
  },
  {
    id: 'comp-3',
    thumbnailUrl: 'https://images.unsplash.com/photo-1609710228159-0fa9bd7e0be5?w=560&h=280&fit=crop&auto=format',
    title: '나이키 에어맥스 프리데이',
    date: '10.25 (토) ~ 10.27 (월)',
    status: '접수중',
  },
];

export const mockContentSections: ContentSection[] = [
  {
    id: 's1',
    title: '오늘의 하이라이트',
    type: 'official',
    moreLabel: '전체보기',
    items: [
      {
        id: 'vod-1',
        thumbnailUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=480&h=270&fit=crop&auto=format',
        title: '경기용인 vs 대구강북 풀 하이라이트',
        badge: 'FREE' as const,
        description: '화랑대기 유소년축구 | 10.19',
        viewCount: 45200,
      },
      {
        id: 'vod-2',
        thumbnailUrl: 'https://images.unsplash.com/photo-1520099988040-d10cd10c0f0a?w=480&h=270&fit=crop&auto=format',
        title: '인천남동 vs 수원삼성 골 모음',
        badge: 'VOD' as const,
        description: '화랑대기 유소년축구 | 10.19',
        viewCount: 32100,
      },
      {
        id: 'vod-3',
        thumbnailUrl: 'https://images.unsplash.com/photo-1540553016-d3686d85131f?w=480&h=270&fit=crop&auto=format',
        title: '서울강남 vs 부산서면 베스트 플레이',
        badge: 'NEW' as const,
        description: '화랑대기 유소년축구 | 10.18',
        viewCount: 28700,
      },
      {
        id: 'vod-4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1486286153849-69f845c9e04c?w=480&h=270&fit=crop&auto=format',
        title: '대구 vs 포항 풀 하이라이트',
        badge: 'FREE' as const,
        description: '화랑대기 유소년축구 | 10.18',
        viewCount: 21000,
      },
    ] as OfficialContentItem[],
  },
  {
    id: 's2',
    title: '이번 주 경기',
    type: 'regular',
    moreLabel: '더보기',
    items: [
      {
        id: 'live-1',
        thumbnailUrl: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=320&h=180&fit=crop&auto=format',
        title: '경기용인YSFC vs 대구강북주니어',
        subtitle: '화랑대기 | 10.20 (월) 12:00',
        tags: ['축구', '화랑대기'],
        teamHome: '용인',
        teamAway: '대구',
      },
      {
        id: 'live-2',
        thumbnailUrl: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=320&h=180&fit=crop&auto=format',
        title: '인천남동FC vs 수원삼성블루윙즈',
        subtitle: '화랑대기 | 10.20 (월) 12:00',
        tags: ['축구', '화랑대기'],
        teamHome: '인천',
        teamAway: '수원',
      },
      {
        id: 'live-4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=320&h=180&fit=crop&auto=format',
        title: '인천리틀스타 vs 수원이글스Jr',
        subtitle: '리틀야구 | 11.01 (토) 10:00',
        tags: ['야구', '리틀야구'],
        teamHome: '인천',
        teamAway: '수원',
      },
      {
        id: 'live-5',
        thumbnailUrl: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=320&h=180&fit=crop&auto=format',
        title: '서울시협회장기 남자단식 결승',
        subtitle: '테니스 | 11.05 (수) 14:00',
        tags: ['테니스', '결승'],
        teamHome: '김재훈',
        teamAway: '박성호',
      },
    ] as RegularContentItem[],
  },
  {
    id: 's3',
    title: '인기 클립',
    type: 'clip',
    moreLabel: '전체보기',
    items: [
      {
        id: 'clip-1',
        thumbnailUrl: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=320&h=400&fit=crop&auto=format',
        title: 'U12 유망주 김포착 환상 드리블',
        viewCount: 152000,
        duration: '0:32',
      },
      {
        id: 'clip-2',
        thumbnailUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=320&h=400&fit=crop&auto=format',
        title: '경기용인 수비수 신들린 태클',
        viewCount: 98400,
        duration: '1:05',
      },
      {
        id: 'clip-3',
        thumbnailUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=320&h=400&fit=crop&auto=format',
        title: '대구강북 에이스 프리킥 골',
        viewCount: 87600,
        duration: '0:48',
      },
      {
        id: 'clip-4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1540553016-d3686d85131f?w=320&h=400&fit=crop&auto=format',
        title: '결승골 세리머니 모음',
        viewCount: 76300,
        duration: '0:25',
      },
      {
        id: 'clip-5',
        thumbnailUrl: 'https://images.unsplash.com/photo-1486286153849-69f845c9e04c?w=320&h=400&fit=crop&auto=format',
        title: '화랑대기 골키퍼 신들린 세이브',
        viewCount: 65100,
        duration: '0:18',
      },
    ] as ClipContentItem[],
  },
  {
    id: 's4',
    title: '포착 오리지널',
    type: 'official',
    moreLabel: '전체보기',
    items: [
      {
        id: 'vod-5',
        thumbnailUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=480&h=270&fit=crop&auto=format',
        title: '감독의 하루 - 화랑대기 편',
        badge: 'NEW' as const,
        description: '포착 오리지널 다큐멘터리',
        viewCount: 34500,
      },
      {
        id: 'vod-6',
        thumbnailUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=480&h=270&fit=crop&auto=format',
        title: '루키 다이어리 시즌2',
        badge: 'FREE' as const,
        description: 'K리그 신인 선수 밀착 취재',
        viewCount: 28100,
      },
      {
        id: 'vod-3',
        thumbnailUrl: 'https://images.unsplash.com/photo-1540553016-d3686d85131f?w=480&h=270&fit=crop&auto=format',
        title: '서울강남 vs 부산서면 베스트 플레이',
        badge: 'VOD' as const,
        description: '화랑대기 유소년축구',
        viewCount: 28700,
      },
    ] as OfficialContentItem[],
  },
  {
    id: 's5',
    title: '추천 콘텐츠',
    type: 'regular',
    moreLabel: '더보기',
    items: [
      {
        id: 'vod-5',
        thumbnailUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=320&h=180&fit=crop&auto=format',
        title: '감독의 하루 - 화랑대기 편',
        subtitle: '포착 오리지널 | 10.17',
        tags: ['오리지널', '다큐'],
      },
      {
        id: 'vod-6',
        thumbnailUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=320&h=180&fit=crop&auto=format',
        title: '루키 다이어리 시즌2 EP.1',
        subtitle: '포착 오리지널 | 10.16',
        tags: ['오리지널', '루키'],
      },
      {
        id: 'clip-8',
        thumbnailUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=320&h=180&fit=crop&auto=format',
        title: '화랑대기 베스트 프리킥 TOP5',
        subtitle: '포착 클립 | 10.19',
        tags: ['클립', 'TOP5'],
      },
    ] as RegularContentItem[],
  },
];

export const sidebarMenus: SidebarMenu[] = [
  {
    section: '포착TV',
    items: [
      '시청내역',
      '관심콘텐츠',
      '내클립',
      '구독함',
      '대회권',
      '경기패스',
      '선물함',
      '가족계정',
      '일정/예약',
      '즐겨찾기',
    ],
  },
  {
    section: '포착클럽',
    items: ['내클럽', '관심클럽', '커뮤니티'],
  },
  {
    section: '포착시티',
    items: ['대회소식', '시설예약', '자주가는시설'],
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// WEB-FORMAT MOCK DATA (backward compatible with webApi.ts exports)
// ═══════════════════════════════════════════════════════════════════════════════

export const banners: PochakBanner[] = pochakBanners;

export const competitions: CompetitionCard[] = pochakCompetitions;

export const liveMatches: MatchItem[] = pochakMatches;

export const popularClips: PopularClip[] = [
  { id: 'clip-1', title: '2025화랑대기 // U12 유망주 김포착 선수 드리블', thumbnail: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=320&h=400&fit=crop&auto=format' },
  { id: 'clip-2', title: '2025화랑대기 // 경기용인 수비수 신들린 태클', thumbnail: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=320&h=400&fit=crop&auto=format' },
  { id: 'clip-3', title: '2025화랑대기 // 대구강북 에이스 프리킥 골', thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=320&h=400&fit=crop&auto=format' },
  { id: 'clip-4', title: '리틀야구 // 9회말 역전 홈런 명장면', thumbnail: 'https://images.unsplash.com/photo-1540553016-d3686d85131f?w=320&h=400&fit=crop&auto=format' },
  { id: 'clip-5', title: '테니스대회 // 매치포인트 에이스 모음', thumbnail: 'https://images.unsplash.com/photo-1486286153849-69f845c9e04c?w=320&h=400&fit=crop&auto=format' },
  { id: 'clip-6', title: '2025화랑대기 // 베스트 프리킥 TOP5', thumbnail: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=320&h=400&fit=crop&auto=format' },
];

export const popularChannels: PopularChannel[] = [
  { id: 'ch-1', name: '송도고', subtitle: '2025 화랑대기 유소년축구', color: '#1565C0', initial: '송' },
  { id: 'ch-2', name: '울산울브스FC', subtitle: '2024 포착 유소년축구', color: '#FF9800', initial: '울' },
  { id: 'ch-3', name: '경기용인YSFC', subtitle: '2025 화랑대기', color: '#4CAF50', initial: '경' },
  { id: 'ch-4', name: '대구강북주니어', subtitle: '2025 화랑대기', color: '#E53935', initial: '대' },
  { id: 'ch-5', name: '인천남동FC', subtitle: '2025 화랑대기 유소년축구', color: '#0D47A1', initial: '인' },
];

export const adBanners: AdBanner[] = [
  { id: 'ad1', title: '나이키 에어맥스 프리데이', thumbnail: '' },
  { id: 'ad2', title: '땀 흘리는 순간엔 게토레이', thumbnail: '' },
];

export const liveContents: ContentCard[] = [
  {
    id: 'live-1',
    title: '[축구] 경기용인YSFC vs 대구강북주니어',
    type: 'LIVE',
    thumbnail: '',
    matchInfo: '경기용인 vs 대구강북',
    competition: '2025 화랑대기 유소년축구',
    sport: '축구',
    tags: ['축구', '화랑대기', '유소년축구'],
    viewCount: 3420,
    date: '2025-10-20',
  },
  {
    id: 'live-2',
    title: '[축구] 인천남동FC vs 수원삼성블루윙즈',
    type: 'LIVE',
    thumbnail: '',
    matchInfo: '인천남동 vs 수원삼성',
    competition: '2025 화랑대기 유소년축구',
    sport: '축구',
    tags: ['축구', '화랑대기', '유소년축구'],
    viewCount: 2100,
    date: '2025-10-20',
  },
  {
    id: 'live-3',
    title: '[축구] 서울강남FC vs 부산서면유소년',
    type: 'LIVE',
    thumbnail: '',
    matchInfo: '서울강남 vs 부산서면',
    competition: '2025 화랑대기 유소년축구',
    sport: '축구',
    tags: ['축구', '화랑대기', '유소년축구'],
    viewCount: 1540,
    date: '2025-10-20',
  },
];

export const highlightContents: ContentCard[] = [
  {
    id: 'vod-1',
    title: '경기용인 vs 대구강북 풀 하이라이트',
    type: 'CLIP',
    thumbnail: '',
    matchInfo: '화랑대기',
    competition: '2025 화랑대기 유소년축구',
    sport: '축구',
    tags: ['축구', '화랑대기', '베스트골'],
    viewCount: 45200,
    date: '2025-10-19',
    duration: '5:32',
  },
];

export const vodContents: ContentCard[] = [
  {
    id: 'vod-2',
    title: '인천남동 vs 수원삼성 풀매치',
    type: 'VOD',
    thumbnail: '',
    matchInfo: '경기용인 2:1 대구강북',
    competition: '2025 화랑대기 유소년축구',
    sport: '축구',
    tags: ['축구', '화랑대기', '풀매치'],
    viewCount: 32100,
    date: '2025-10-19',
    duration: '1:52:30',
  },
  {
    id: 'vod-3',
    title: '서울강남 vs 부산서면 베스트 플레이',
    type: 'VOD',
    thumbnail: '',
    matchInfo: '서울강남 vs 부산서면',
    competition: '2025 화랑대기 유소년축구',
    sport: '축구',
    tags: ['축구', '화랑대기', '하이라이트'],
    viewCount: 28700,
    date: '2025-10-18',
    duration: '1:45:10',
  },
];

export const clipContents: ContentCard[] = [
  {
    id: 'clip-1',
    title: 'U12 유망주 김포착 환상 드리블',
    type: 'CLIP',
    thumbnail: '',
    matchInfo: '경기용인 vs 대구강북',
    competition: '2025 화랑대기 유소년축구',
    sport: '축구',
    tags: ['축구', '화랑대기', '골'],
    viewCount: 152000,
    date: '2025-10-19',
    duration: '0:32',
  },
  {
    id: 'clip-2',
    title: '경기용인 수비수 신들린 태클',
    type: 'CLIP',
    thumbnail: '',
    matchInfo: '인천남동 vs 수원삼성',
    competition: '2025 화랑대기 유소년축구',
    sport: '축구',
    tags: ['축구', '화랑대기', '수비'],
    viewCount: 98400,
    date: '2025-10-19',
    duration: '1:05',
  },
  {
    id: 'clip-3',
    title: '대구강북 에이스 프리킥 골',
    type: 'CLIP',
    thumbnail: '',
    matchInfo: '서울강남 vs 부산서면',
    competition: '2025 화랑대기 유소년축구',
    sport: '축구',
    tags: ['축구', '화랑대기', '프리킥'],
    viewCount: 87600,
    date: '2025-10-19',
    duration: '0:48',
  },
  {
    id: 'clip-4',
    title: '결승골 세리머니 모음',
    type: 'CLIP',
    thumbnail: '',
    matchInfo: '인천리틀스타 vs 수원이글스Jr',
    competition: '2025 화랑대기 유소년축구',
    sport: '축구',
    tags: ['축구', '화랑대기', '골'],
    viewCount: 76300,
    date: '2025-10-19',
    duration: '0:25',
  },
];

export const scheduleData: MatchItem[] = [
  pochakMatches[0],
  pochakMatches[1],
];

export const trendingSearches = [
  '화랑대기',
  '유소년축구',
  '리틀야구',
  '테니스 대회',
  '김포착 드리블',
  '나이키 프리데이',
];

export const defaultPlayerData: PlayerData = {
  id: 'vod-1',
  title: '경기용인 vs 대구강북 풀 하이라이트',
  type: 'vod',
  competition: '2025 화랑대기 유소년축구',
  date: '2025.10.19',
  homeTeam: '경기용인YSFC',
  awayTeam: '대구강북주니어',
  tags: ['축구', '화랑대기', '하이라이트', '베스트골'],
  streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
  isLive: false,
  likeCount: 3200,
  relatedVideos: [
    { id: 'vod-1', title: '경기용인 vs 대구강북 풀 하이라이트', thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=480&h=270&fit=crop&auto=format', duration: '5:32' },
    { id: 'vod-2', title: '인천남동 vs 수원삼성 풀매치', thumbnail: 'https://images.unsplash.com/photo-1520099988040-d10cd10c0f0a?w=480&h=270&fit=crop&auto=format', duration: '1:52:30' },
    { id: 'vod-3', title: '서울강남 vs 부산서면 베스트 플레이', thumbnail: 'https://images.unsplash.com/photo-1540553016-d3686d85131f?w=480&h=270&fit=crop&auto=format', duration: '1:45:10' },
    { id: 'clip-1', title: 'U12 유망주 김포착 환상 드리블', thumbnail: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=480&h=270&fit=crop&auto=format', duration: '0:32' },
  ],
};

export const defaultProfile: UserProfile = {
  nickname: '사용자 닉네임',
  email: 'user@email.com',
  plan: '프리미엄',
  nextPaymentDate: '2025.11.15',
};

export const defaultWatchHistory: WatchHistoryItem[] = [
  { id: 'vod-1', title: '경기용인 vs 대구강북 풀 하이라이트', date: '2025.10.19' },
  { id: 'vod-2', title: '인천남동 vs 수원삼성 풀매치', date: '2025.10.19' },
  { id: 'vod-3', title: '서울강남 vs 부산서면 베스트 플레이', date: '2025.10.18' },
  { id: 'clip-1', title: 'U12 유망주 김포착 환상 드리블', date: '2025.10.19' },
  { id: 'clip-2', title: '경기용인 수비수 신들린 태클', date: '2025.10.19' },
];

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED POSTS / PRODUCTS / ACTIVITY (used by Web pages)
// ═══════════════════════════════════════════════════════════════════════════════

export const pochakPosts: PochakPost[] = [
  {
    id: 'post-1',
    title: '[공지] 2025 화랑대기 유소년축구 대회 일정 안내',
    author: '대한축구협회',
    date: '2025.10.15',
    views: 1520,
    likes: 45,
    comments: 12,
    isPinned: true,
    competitionName: '2025 화랑대기 유소년축구',
    body: '2025 화랑대기 유소년축구 대회의 전체 일정을 안내드립니다. 올해는 10월 20일부터 30일까지 파주 NFC에서 개최되며, U-12, U-15 두 부문으로 나뉘어 진행됩니다. 많은 관심과 응원 부탁드립니다.',
    images: [
      'https://picsum.photos/seed/post1a/400/300',
      'https://picsum.photos/seed/post1b/400/300',
      'https://picsum.photos/seed/post1c/400/300',
    ],
  },
  {
    id: 'post-2',
    title: '[공지] 대회 관람 안내 및 주의사항',
    author: '대한축구협회',
    date: '2025.10.15',
    views: 980,
    likes: 32,
    comments: 5,
    isPinned: true,
    competitionName: '2025 화랑대기 유소년축구',
    body: '대회 관람 시 안전을 위해 다음 사항을 준수해 주시기 바랍니다. 경기장 내 음식물 반입은 제한되며, 지정된 관람석에서만 관람이 가능합니다. 주차장이 협소하오니 대중교통을 이용해 주세요.',
  },
  {
    id: 'post-3',
    title: '화랑대기 U-12 조별 리그 결과 정리',
    author: '축구팬123',
    date: '2025.10.20',
    views: 456,
    likes: 18,
    comments: 8,
    competitionName: '2025 화랑대기 유소년축구',
    body: 'U-12 조별리그 1라운드 결과를 정리해봤습니다.\n\nA조: 경기용인 2-1 대구강북, 송도고 3-0 부산서면\nB조: 울산울브스 1-1 인천남동, 서울강남 2-0 수원삼성\n\n경기용인과 송도고가 좋은 출발을 보여주고 있네요.',
    images: [
      'https://picsum.photos/seed/post3a/400/300',
      'https://picsum.photos/seed/post3b/400/300',
      'https://picsum.photos/seed/post3c/400/300',
    ],
  },
  {
    id: 'post-4',
    title: '경기용인YSFC vs 대구강북주니어 경기 사진 모음',
    author: 'YSFC맘',
    date: '2025.10.20',
    views: 324,
    likes: 25,
    comments: 15,
    competitionName: '2025 화랑대기 유소년축구',
    body: '어제 경기 직접 보고 왔는데 정말 대단했어요! 아이들이 너무 열심히 뛰는 모습에 감동받았습니다. 사진 몇 장 공유합니다.',
    images: [
      'https://picsum.photos/seed/post4a/400/300',
      'https://picsum.photos/seed/post4b/400/300',
      'https://picsum.photos/seed/post4c/400/300',
    ],
  },
  {
    id: 'post-5',
    title: '오늘 경기 후기 (10/19)',
    author: '사진사김',
    date: '2025.10.19',
    views: 567,
    likes: 42,
    comments: 7,
    competitionName: '2025 화랑대기 유소년축구',
    body: '오늘 경기장에서 사진 촬영하면서 느낀 점 공유합니다. 선수들의 열정이 정말 대단했고, 특히 경기용인 10번 선수의 드리블이 인상적이었습니다. 내일 경기도 기대됩니다!',
    images: [
      'https://picsum.photos/seed/post5a/400/300',
      'https://picsum.photos/seed/post5b/400/300',
    ],
  },
  {
    id: 'post-6',
    title: 'U-15 8강 예상 및 분석',
    author: '축구분석가',
    date: '2025.10.18',
    views: 234,
    likes: 11,
    comments: 20,
    competitionName: '2025 화랑대기 유소년축구',
    body: 'U-15 부문 8강 대진이 확정되었습니다. 전력 분석과 예상 결과를 공유합니다.\n\n1경기: 경기용인 vs 인천남동 → 경기용인 우세\n2경기: 송도고 vs 울산울브스 → 접전 예상\n3경기: 서울강남 vs 부산서면 → 서울강남 우세\n4경기: 대구강북 vs 수원삼성 → 대구강북 우세',
  },
];

export const pochakSubscriptionProducts: PochakProduct[] = [
  {
    id: 'sub-1', type: 'subscription', name: '포착 프리미엄', badge: '정기구독', badgeColor: '#00C853',
    description: '모든 종목, 모든 대회를 무제한으로 시청할 수 있는 올인원 구독 상품입니다.',
    price: '월 9,900원', period: '월 단위 자동 결제',
  },
  {
    id: 'sub-2', type: 'subscription', name: '포착 프리미엄 연간', badge: '정기구독', badgeColor: '#00C853',
    description: '연간 결제 시 2개월 무료! 모든 콘텐츠를 합리적인 가격으로 즐기세요.',
    price: '연 99,000원', originalPrice: '118,800원', discount: '17% 할인', period: '연 단위 자동 결제',
  },
];

export const pochakSportProducts: PochakProduct[] = [
  { id: 'sp-1', type: 'sport', name: '축구 구독권', badge: '종목권', badgeColor: '#1565C0', sport: '축구', posterColor: '#1565C0', description: '축구 종목의 모든 대회 영상을 시청할 수 있습니다.', price: '월 4,900원', originalPrice: '9,900원', discount: '50% 할인' },
  { id: 'sp-2', type: 'sport', name: '야구 구독권', badge: '종목권', badgeColor: '#C62828', sport: '야구', posterColor: '#C62828', description: '야구 종목의 모든 대회 영상을 시청할 수 있습니다.', price: '월 4,900원', originalPrice: '9,900원', discount: '50% 할인' },
  { id: 'sp-3', type: 'sport', name: '배구 구독권', badge: '종목권', badgeColor: '#E65100', sport: '배구', posterColor: '#E65100', description: '배구 종목의 모든 대회 영상을 시청할 수 있습니다.', price: '월 4,900원', originalPrice: '9,900원', discount: '50% 할인' },
  { id: 'sp-4', type: 'sport', name: '핸드볼 구독권', badge: '종목권', badgeColor: '#2E7D32', sport: '핸드볼', posterColor: '#2E7D32', description: '핸드볼 종목의 모든 대회 영상을 시청할 수 있습니다.', price: '월 3,900원' },
];

export const pochakCompetitionProducts: PochakProduct[] = [
  { id: 'cp-1', type: 'competition', name: '2025 화랑대기 시청권', badge: '대회권', badgeColor: '#6A1B9A', sport: '축구', posterColor: '#E53935', description: '화랑대기 유소년축구대회 전 경기를 시청할 수 있습니다.', price: '19,900원' },
  { id: 'cp-2', type: 'competition', name: '제5회 전국 리틀야구 시청권', badge: '대회권', badgeColor: '#6A1B9A', sport: '야구', posterColor: '#1565C0', description: '전국 리틀야구대회 전 경기를 시청할 수 있습니다.', price: '14,900원' },
  { id: 'cp-3', type: 'competition', name: '제30회 서울시 협회장기 시청권', badge: '대회권', badgeColor: '#6A1B9A', sport: '테니스', posterColor: '#00897B', description: '서울시 협회장기 테니스 대회 전 경기를 시청할 수 있습니다.', price: '9,900원' },
  { id: 'cp-4', type: 'competition', name: '나이키 에어맥스 프리데이 시청권', badge: '대회권', badgeColor: '#6A1B9A', sport: '풋살', posterColor: '#FF6D00', description: '나이키 에어맥스 프리데이 풋살대회 전 경기를 시청할 수 있습니다.', price: '12,900원' },
];

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER – get all content cards (web compat)
// ═══════════════════════════════════════════════════════════════════════════════

export function getAllContents(): ContentCard[] {
  return [...liveContents, ...highlightContents, ...vodContents, ...clipContents];
}

// ═══════════════════════════════════════════════════════════════════════════════
// BO-WEB aligned content IDs
// The BO uses numeric IDs. This mapping lets the BO cross-reference shared data.
// ═══════════════════════════════════════════════════════════════════════════════

export const boContentIdMap = {
  'live-1': 1,
  'live-2': 2,
  'live-3': 3,
  'live-4': 4,
  'live-5': 5,
  'live-6': 6,
  'vod-1': 1,
  'vod-2': 2,
  'vod-3': 3,
  'vod-4': 4,
  'vod-5': 5,
  'vod-6': 6,
  'clip-1': 1,
  'clip-2': 2,
  'clip-3': 3,
  'clip-4': 4,
  'clip-5': 5,
  'clip-6': 6,
  'clip-7': 7,
  'clip-8': 8,
} as const;
