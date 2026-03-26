/**
 * Pochak Shared Types
 * ─────────────────────────────────────────────────────────────────────────────
 * SINGLE source of truth for content-related types across all platforms:
 *   - mobile   (React Native / Expo)
 *   - public-web (React + Vite)
 *   - bo-web   (Next.js back-office)
 *
 * Import path from each app:
 *   import { PochakContent, ... } from '../../shared/types';
 */

// ── Enums / Literal Unions ─────────────────────────────────────────────────────

export type ContentType = 'LIVE' | 'VOD' | 'CLIP';
export type ContentStatus = 'SCHEDULED' | 'LIVE' | 'ENDED';
export type SportType = '전체' | '축구' | '농구' | '배구' | '야구' | '풋살' | '테니스' | '배드민턴';
export type MatchStatus = 'LIVE' | '예정' | '종료';
export type ContentBadge = 'LIVE' | 'FREE' | 'VOD' | 'NEW';
export type CommunityPostType = 'NEWS' | 'RECRUITING' | 'RECRUITMENT' | 'FREE';
export type DisplayArea = 'CITY' | 'CLUB';

// ── Core Content ───────────────────────────────────────────────────────────────

export interface PochakContent {
  id: string;
  title: string;
  type: ContentType;
  status: ContentStatus;
  thumbnailUrl: string;
  streamUrl: string | null;
  duration: number | null; // seconds, null for LIVE
  sport: string;
  competition: string;
  homeTeam: { name: string; shortName: string; logoColor: string };
  awayTeam: { name: string; shortName: string; logoColor: string };
  tags: string[];
  viewCount: number;
  likeCount: number;
  date: string; // ISO 8601
  createdAt: string;
}

// ── Banner ─────────────────────────────────────────────────────────────────────

export interface PochakBanner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  linkUrl: string;
}

// ── Competition ────────────────────────────────────────────────────────────────

export interface PochakCompetition {
  id: string;
  name: string;
  subtitle: string;
  sport: string;
  dateRange: string;
  logoColor: string;
  logoText: string;
  isAd: boolean;
}

// ── Channel ────────────────────────────────────────────────────────────────────

export interface PochakChannel {
  id: string;
  name: string;
  subtitle: string;
  color: string;
  initial: string;
  memberCount: number;
  displayArea?: DisplayArea;
}

// ── Clip ───────────────────────────────────────────────────────────────────────

export interface PochakClipItem {
  id: string;
  title: string;
  viewCount: number;
  duration: number; // seconds
}

// ── Match (schedule / live listing) ────────────────────────────────────────────

export interface PochakMatch {
  id: string;
  date: string;
  time: string;
  homeTeam: string;
  homeTeamShort: string;
  homeTeamColor: string;
  awayTeam: string;
  awayTeamShort: string;
  awayTeamColor: string;
  competition: string;
  competitionBadge: string;
  sport: SportType;
  status: MatchStatus;
  score?: string;
  tags: string[];
}

// ── Platform-specific aliases (backward compat) ────────────────────────────────

/** Mobile: BannerItem */
export interface BannerItem {
  id: string;
  imageUrl: string;
  title: string;
  subtitle?: string;
}

/** Mobile: LiveContentItem */
export interface LiveContentItem {
  id: string;
  thumbnailUrl: string;
  teamHome: string;
  teamAway: string;
  league: string;
  time: string;
  viewerCount?: number;
}

/** Mobile: CompetitionItem */
export interface CompetitionItem {
  id: string;
  thumbnailUrl: string;
  title: string;
  date: string;
  status: string;
}

/** Mobile: OfficialContentItem */
export interface OfficialContentItem {
  id: string;
  thumbnailUrl: string;
  title: string;
  badge: ContentBadge;
  description: string;
  viewCount?: number;
}

/** Mobile: RegularContentItem */
export interface RegularContentItem {
  id: string;
  thumbnailUrl: string;
  title: string;
  subtitle: string;
  tags: string[];
  teamHome?: string;
  teamAway?: string;
}

/** Mobile: ClipContentItem */
export interface ClipContentItem {
  id: string;
  thumbnailUrl: string;
  title: string;
  viewCount: number;
  duration: string;
}

/** Mobile: ContentSection */
export interface ContentSection {
  id: string;
  title: string;
  type: 'official' | 'regular' | 'clip';
  moreLabel: string;
  items: OfficialContentItem[] | RegularContentItem[] | ClipContentItem[];
}

/** Mobile: SidebarMenu */
export interface SidebarMenu {
  section: string;
  items: string[];
}

/** Web: ContentCard */
export interface ContentCard {
  id: string;
  title: string;
  type: ContentType | '예정';
  thumbnail: string;
  matchInfo: string;
  competition: string;
  sport: SportType;
  tags: string[];
  viewCount: number;
  date: string;
  duration?: string;
}

/** Web: MatchItem – alias for PochakMatch */
export type MatchItem = PochakMatch;

/** Web: CompetitionCard – alias for PochakCompetition */
export type CompetitionCard = PochakCompetition;

/** Web: PopularChannel */
export interface PopularChannel {
  id: string;
  name: string;
  subtitle: string;
  color: string;
  initial: string;
}

/** Web: AdBanner */
export interface AdBanner {
  id: string;
  title: string;
  thumbnail: string;
}

/** Web: PopularClip */
export interface PopularClip {
  id: string;
  title: string;
  thumbnail: string;
}

/** Web: PlayerData */
export interface PlayerData {
  id: string;
  title: string;
  type: string;
  competition: string;
  date: string;
  homeTeam?: string;
  awayTeam?: string;
  tags: string[];
  streamUrl: string | null;
  isLive?: boolean;
  likeCount?: number;
  relatedVideos: { id: string; title: string; thumbnail: string; duration?: string }[];
}

/** Web: UserProfile */
export interface UserProfile {
  nickname: string;
  name?: string;
  email: string;
  plan: string;
  nextPaymentDate: string;
  role?: 'USER' | 'MANAGER' | 'ADMIN';
  profileImageUrl?: string | null;
}

/** Web: WatchHistoryItem */
export interface WatchHistoryItem {
  id: string;
  title: string;
  date: string;
}

/** Web: PochakPost (community board post / card feed) */
export interface PochakPost {
  id: string;
  title: string;
  author: string;
  date: string;
  views: number;
  likes: number;
  comments: number;
  isPinned?: boolean;
  /** Card-feed fields */
  body?: string;
  images?: string[];
  competitionName?: string;
}

/** Web: PochakProduct (store product) */
export interface PochakProduct {
  id: string;
  type: 'subscription' | 'sport' | 'competition';
  name: string;
  description: string;
  price: string;
  originalPrice?: string;
  discount?: string;
  badge: string;
  badgeColor: string;
  sport?: string;
  posterColor?: string;
  period?: string;
}
