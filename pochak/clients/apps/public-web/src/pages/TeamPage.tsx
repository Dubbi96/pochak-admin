import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';
import TabBar from '@/components/TabBar';
import CompetitionBanner from '@/components/CompetitionBanner';
import type { BannerData } from '@/components/CompetitionBanner';
import HScrollRow from '@/components/HScrollRow';
import SectionHeader from '@/components/SectionHeader';
import HVideoCard from '@/components/HVideoCard';
import VClipCard from '@/components/VClipCard';
import MonthSelector from '@/components/MonthSelector';
import MatchListItem from '@/components/MatchListItem';
import type { MatchListItemData } from '@/components/MatchListItem';
import SocialLinks from '@/components/SocialLinks';
import {
  pochakChannels,
  pochakLiveContents,
  pochakVodContents,
  pochakClips,
  pochakMatches,
  pochakPosts,
  formatViewCount,
} from '@/services/webApi';

type TabKey = 'home' | 'videos' | 'schedule' | 'posts' | 'info';
const tabItems: { key: TabKey; label: string }[] = [
  { key: 'home', label: '홈' },
  { key: 'videos', label: '영상' },
  { key: 'schedule', label: '일정' },
  { key: 'posts', label: '게시글' },
  { key: 'info', label: '정보' },
];

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function toMatchListItem(m: typeof pochakMatches[number]): MatchListItemData {
  return {
    id: m.id,
    time: m.time,
    homeTeam: m.homeTeam,
    homeTeamShort: m.homeTeamShort,
    homeTeamColor: m.homeTeamColor,
    awayTeam: m.awayTeam,
    awayTeamShort: m.awayTeamShort,
    awayTeamColor: m.awayTeamColor,
    status: m.status,
    contentId: m.id,
  };
}

/* ── Card Feed Item (게시글 탭) ───────────────────────────────────────────── */
function TeamCardFeedItem({ post }: { post: typeof pochakPosts[number] }) {
  const [bodyExpanded, setBodyExpanded] = useState(false);
  const [liked, setLiked] = useState(false);

  const bodyText = post.body ?? '';
  const bodyLines = bodyText.split('\n');
  const isTruncatable = bodyLines.length > 3 || bodyText.length > 150;
  const displayBody = bodyExpanded
    ? bodyText
    : bodyLines.length > 3
      ? bodyLines.slice(0, 3).join('\n') + '...'
      : bodyText.length > 150
        ? bodyText.slice(0, 150) + '...'
        : bodyText;

  return (
    <article className="rounded-lg border border-[#4D4D4D] bg-[#262626] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-4 pb-3">
        <span className="flex-shrink-0 text-base">🏆</span>
        <div className="flex-1 min-w-0 flex items-center gap-1.5">
          <p className="text-sm font-medium text-white truncate">
            {post.competitionName ?? post.author}
          </p>
          <span className="text-[#A6A6A6] text-xs">|</span>
          <p className="text-xs text-[#A6A6A6] flex-shrink-0">{post.date}</p>
        </div>
        <button className="flex-shrink-0 text-[#A6A6A6] hover:text-white transition-colors p-1">
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>

      {/* Notice badge */}
      {post.isPinned && (
        <div className="px-5 pb-1">
          <span className="text-[11px] font-bold text-[#00CC33] bg-[#00CC33]/10 px-2 py-0.5 rounded">
            공지
          </span>
        </div>
      )}

      {/* Body text */}
      <div className="px-5 pb-3">
        <h3 className="text-[15px] font-semibold text-white mb-1">{post.title}</h3>
        {bodyText && (
          <p className="text-sm text-[#D4D4D4] whitespace-pre-line leading-relaxed">
            {displayBody}
          </p>
        )}
        {isTruncatable && !bodyExpanded && (
          <button
            onClick={() => setBodyExpanded(true)}
            className="text-sm text-[#A6A6A6] hover:text-white mt-1 transition-colors"
          >
            더보기
          </button>
        )}
        {isTruncatable && bodyExpanded && (
          <button
            onClick={() => setBodyExpanded(false)}
            className="text-sm text-[#A6A6A6] hover:text-white mt-1 transition-colors"
          >
            접기
          </button>
        )}
      </div>

      {/* Image gallery */}
      {post.images && post.images.length > 0 && (
        <div className="px-5 pb-3">
          <div className="grid grid-cols-3 gap-2">
            {post.images.slice(0, 3).map((url, idx) => (
              <div
                key={idx}
                className="aspect-square rounded-lg overflow-hidden bg-[#1A1A1A]"
              >
                <img
                  src={url}
                  alt=""
                  className="w-full h-full object-cover hover:scale-105 transition-transform"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center gap-5 px-5 py-3 border-t border-[#4D4D4D] text-[#A6A6A6] text-sm">
        <button
          onClick={() => setLiked((p) => !p)}
          className={`flex items-center gap-1.5 transition-colors ${liked ? 'text-[#E51728]' : 'hover:text-white'}`}
        >
          <Heart className={`h-4 w-4 ${liked ? 'fill-[#E51728]' : ''}`} />
          {post.likes + (liked ? 1 : 0)}
        </button>
        <span className="flex items-center gap-1.5">
          <MessageCircle className="h-4 w-4" />
          {post.comments}
        </span>
        <span className="ml-auto cursor-pointer hover:text-white transition-colors">
          <Share2 className="h-4 w-4" />
        </span>
      </div>
    </article>
  );
}

export default function TeamPage() {
  const { teamId: _teamId } = useParams<{ teamId: string }>();
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [year, setYear] = useState(2025);
  const [month, setMonth] = useState(10);

  const team = pochakChannels[2]; // 경기용인YSFC

  const bannerData: BannerData = {
    name: team.name,
    sport: '축구',
    organizer: team.subtitle,
    dateRange: '활동중',
    description: `${team.name}은 경기도 용인시를 기반으로 한 유소년 축구클럽입니다. 체계적인 훈련 시스템과 열정 있는 지도자들이 미래의 축구 스타를 키우고 있습니다. 멤버 ${team.memberCount}명이 함께하고 있습니다.`,
    posterColor: team.color,
    posterText: team.initial,
    socialLinks: { naver: '#', instagram: '#' },
    isTeam: true,
  };

  const scheduleMatches = useMemo(() => {
    return pochakMatches.filter((m) => {
      const d = new Date(m.date);
      return d.getFullYear() === year && d.getMonth() + 1 === month;
    });
  }, [year, month]);

  return (
    <div className="px-6 py-6 lg:px-8 max-w-[1200px] mx-auto">
      {/* Banner */}
      <CompetitionBanner data={bannerData} />

      {/* Tabs */}
      <div className="mt-6">
        <TabBar tabs={tabItems} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      <div className="mt-6">
        {/* ── 홈 탭 ──────────────────────── */}
        {activeTab === 'home' && (
          <div className="space-y-8">
            <section>
              <SectionHeader prefix="팀" highlight="LIVE" />
              <HScrollRow scrollAmount={300}>
                {pochakLiveContents.filter((c) => c.status === 'LIVE').map((c) => (
                  <HVideoCard
                    key={c.id}
                    title={c.title}
                    sub={`${c.homeTeam.name} · LIVE`}
                    live
                    thumbnailUrl={c.thumbnailUrl}
                    tags={c.tags.slice(0, 3)}
                    linkTo={`/contents/live/${c.id}`}
                  />
                ))}
              </HScrollRow>
            </section>

            <section>
              <SectionHeader prefix="최신" highlight="영상" />
              <HScrollRow scrollAmount={300}>
                {pochakVodContents.map((v) => (
                  <HVideoCard
                    key={v.id}
                    title={v.title}
                    sub={`${v.competition} · ${v.date.slice(0, 10)}`}
                    duration={v.duration ? formatDuration(v.duration) : undefined}
                    thumbnailUrl={v.thumbnailUrl}
                    linkTo={`/contents/vod/${v.id}`}
                  />
                ))}
              </HScrollRow>
            </section>

            <section>
              <SectionHeader prefix="팀" highlight="클립" />
              <HScrollRow scrollAmount={200}>
                {pochakClips.map((clip) => (
                  <VClipCard
                    key={clip.id}
                    title={clip.title}
                    viewCount={clip.viewCount}
                    linkTo={`/clip/${clip.id}`}
                  />
                ))}
              </HScrollRow>
            </section>
          </div>
        )}

        {/* ── 영상 탭 ─────────────────────── */}
        {activeTab === 'videos' && (
          <div className="space-y-8">
            <section>
              <SectionHeader prefix="LIVE" highlight="중계" />
              <HScrollRow scrollAmount={300}>
                {pochakLiveContents.map((c) => (
                  <HVideoCard
                    key={c.id}
                    title={c.title}
                    sub={c.competition}
                    live={c.status === 'LIVE'}
                    thumbnailUrl={c.thumbnailUrl}
                    linkTo={`/contents/${c.status === 'LIVE' ? 'live' : 'vod'}/${c.id}`}
                  />
                ))}
              </HScrollRow>
            </section>

            <section>
              <SectionHeader prefix="다시보기" highlight="VOD" />
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {pochakVodContents.map((v) => (
                  <HVideoCard
                    key={v.id}
                    title={v.title}
                    sub={`조회수 ${formatViewCount(v.viewCount)} · ${v.date.slice(0, 10)}`}
                    duration={v.duration ? formatDuration(v.duration) : undefined}
                    thumbnailUrl={v.thumbnailUrl}
                    className="w-full"
                    linkTo={`/contents/vod/${v.id}`}
                  />
                ))}
              </div>
            </section>

            <section>
              <SectionHeader prefix="팀" highlight="클립" />
              <HScrollRow scrollAmount={200}>
                {pochakClips.map((clip) => (
                  <VClipCard
                    key={clip.id}
                    title={clip.title}
                    viewCount={clip.viewCount}
                    linkTo={`/clip/${clip.id}`}
                  />
                ))}
              </HScrollRow>
            </section>
          </div>
        )}

        {/* ── 일정 탭 ─────────────────────── */}
        {activeTab === 'schedule' && (
          <div className="space-y-6">
            <MonthSelector year={year} month={month} onYearChange={setYear} onMonthChange={setMonth} />
            {scheduleMatches.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-[#A6A6A6]">
                <p className="text-base">해당 기간에 일정이 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {scheduleMatches.map((match) => (
                  <MatchListItem key={match.id} match={toMatchListItem(match)} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── 게시글 탭 (Card Feed) ────────────────────── */}
        {activeTab === 'posts' && (
          <div className="space-y-4">
            {pochakPosts.map((post) => (
              <TeamCardFeedItem key={post.id} post={post} />
            ))}
          </div>
        )}

        {/* ── 정보 탭 ─────────────────────── */}
        {activeTab === 'info' && (
          <div className="space-y-6">
            <div className="rounded-xl border border-[#4D4D4D] bg-[#262626] p-6">
              <h3 className="text-lg font-bold text-white mb-4">팀 정보</h3>
              <dl className="space-y-3 text-sm">
                <div className="flex gap-4">
                  <dt className="w-20 text-[#A6A6A6] flex-shrink-0">팀명</dt>
                  <dd className="text-white">{team.name}</dd>
                </div>
                <div className="flex gap-4">
                  <dt className="w-20 text-[#A6A6A6] flex-shrink-0">종목</dt>
                  <dd className="text-white">축구</dd>
                </div>
                <div className="flex gap-4">
                  <dt className="w-20 text-[#A6A6A6] flex-shrink-0">소속</dt>
                  <dd className="text-white">{team.subtitle}</dd>
                </div>
                <div className="flex gap-4">
                  <dt className="w-20 text-[#A6A6A6] flex-shrink-0">멤버수</dt>
                  <dd className="text-white">{team.memberCount}명</dd>
                </div>
                <div className="flex gap-4">
                  <dt className="w-20 text-[#A6A6A6] flex-shrink-0">지역</dt>
                  <dd className="text-white">경기도 용인시</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-xl border border-[#4D4D4D] bg-[#262626] p-6">
              <h3 className="text-lg font-bold text-white mb-4">소셜 링크</h3>
              <SocialLinks links={{ naver: '#', instagram: '#' }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
