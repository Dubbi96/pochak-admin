import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Heart, MessageCircle, Share2, MoreHorizontal, Lock } from 'lucide-react';
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
import { postApi } from '@/services/apiClient';

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
function ClubCardFeedItem({ post }: { post: typeof pochakPosts[number] }) {
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

/* ── Video sub-tab chip selector ─────────────────────────────────────────── */
type VideoSubTab = 'vod' | 'clip';

function VideoSubTabs({
  active,
  onChange,
}: {
  active: VideoSubTab;
  onChange: (t: VideoSubTab) => void;
}) {
  const items: { key: VideoSubTab; label: string }[] = [
    { key: 'vod', label: '영상' },
    { key: 'clip', label: '클립' },
  ];
  return (
    <div className="flex items-center gap-2 mb-5">
      {items.map((item) => (
        <button
          key={item.key}
          onClick={() => onChange(item.key)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            active === item.key
              ? 'bg-white text-[#1A1A1A]'
              : 'bg-[#333] text-[#A6A6A6] hover:text-white'
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

/* ── CUG Lock Overlay ──────────────────────────────────────────────────────── */
function MembersOnlyOverlay({ onJoin }: { onJoin: () => void }) {
  return (
    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center rounded-lg z-10">
      <Lock className="h-6 w-6 text-[#A6A6A6] mb-2" />
      <p className="text-sm font-semibold text-white mb-1">회원 전용</p>
      <p className="text-xs text-[#A6A6A6] mb-3">가입 후 시청 가능합니다</p>
      <button
        onClick={(e) => { e.stopPropagation(); onJoin(); }}
        className="px-4 py-1.5 text-xs font-medium text-[#1A1A1A] bg-[#00CC33] rounded-full hover:bg-[#00B82E] transition-colors"
      >
        가입하기
      </button>
    </div>
  );
}

// Content visibility: PUBLIC = visible to all, MEMBERS_ONLY = locked for non-members
type ContentVisibility = 'PUBLIC' | 'MEMBERS_ONLY';

// Mock: odd-indexed VODs are MEMBERS_ONLY (CUG), even-indexed are PUBLIC (홍보용)
function getContentVisibility(index: number): ContentVisibility {
  return index % 2 === 0 ? 'PUBLIC' : 'MEMBERS_ONLY';
}

type JoinStatus = 'none' | 'pending' | 'joined';

export default function ClubPage() {
  const { clubId } = useParams<{ clubId: string }>();
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [year, setYear] = useState(2025);
  const [month, setMonth] = useState(10);
  const [videoSubTab, setVideoSubTab] = useState<VideoSubTab>('vod');
  const [joinStatus, setJoinStatus] = useState<JoinStatus>('none');
  const [joinLoading, setJoinLoading] = useState(false);

  const isMember = joinStatus === 'joined';

  // Use a club-oriented channel from mock data (index 4 = 인천남동FC)
  const club = pochakChannels[4];

  const bannerData: BannerData = {
    name: club.name,
    sport: '축구',
    organizer: '유소년 · U-15',
    dateRange: '활동중',
    description: `${club.name}은 인천광역시 남동구를 기반으로 한 유소년 축구클럽입니다. 체계적인 훈련 프로그램과 전문 코칭스태프가 미래의 축구 스타를 양성하고 있습니다. 현재 ${club.memberCount}명의 회원이 함께하고 있으며, 다양한 대회에 참가하고 있습니다.`,
    posterColor: club.color,
    posterText: club.initial,
    socialLinks: { instagram: '#', youtube: '#' },
    isTeam: true,
  };

  const scheduleMatches = useMemo(() => {
    return pochakMatches.filter((m) => {
      const d = new Date(m.date);
      return d.getFullYear() === year && d.getMonth() + 1 === month;
    });
  }, [year, month]);

  const handleJoin = async () => {
    if (!clubId || joinLoading || joinStatus !== 'none') return;
    setJoinLoading(true);
    try {
      await postApi(`/api/v1/clubs/${clubId}/join`, { role: 'PLAYER' });
      setJoinStatus('pending');
    } catch {
      // join request submitted — show pending state
      setJoinStatus('pending');
    } finally {
      setJoinLoading(false);
    }
  };

  return (
    <div className="px-6 py-6 lg:px-8 max-w-[1200px] mx-auto">
      {/* Banner */}
      <CompetitionBanner
        data={bannerData}
        onPurchase={joinStatus === 'none' && !joinLoading ? handleJoin : () => {}}
        ctaLabel={
          joinLoading ? '처리 중...' :
          joinStatus === 'joined' ? '가입됨' :
          joinStatus === 'pending' ? '가입 대기 중' :
          '가입하기'
        }
      />

      {/* Tabs */}
      <div className="mt-6">
        <TabBar tabs={tabItems} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      <div className="mt-6">
        {/* ── 홈 탭 ──────────────────────── */}
        {activeTab === 'home' && (
          <div className="space-y-8">
            <section>
              <SectionHeader prefix="라이브" highlight="LIVE" />
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
              <SectionHeader prefix="최근" highlight="클립" />
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

            <section>
              <SectionHeader prefix="최근" highlight="영상" />
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
              <SectionHeader prefix="클럽" highlight="게시글" />
              <HScrollRow scrollAmount={340}>
                {pochakPosts.slice(0, 5).map((post) => (
                  <div
                    key={post.id}
                    className="flex-shrink-0 w-[300px] rounded-lg border border-[#4D4D4D] bg-[#262626] p-4 hover:border-[#666] transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {post.isPinned && (
                        <span className="text-[10px] font-bold text-[#00CC33] bg-[#00CC33]/10 px-1.5 py-0.5 rounded">
                          공지
                        </span>
                      )}
                      <span className="text-xs text-[#A6A6A6]">{post.date}</span>
                    </div>
                    <h4 className="text-sm font-semibold text-white truncate">{post.title}</h4>
                    {post.body && (
                      <p className="text-xs text-[#A6A6A6] mt-1 line-clamp-2 leading-relaxed">
                        {post.body}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-3 text-[#A6A6A6] text-xs">
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" /> {post.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" /> {post.comments}
                      </span>
                    </div>
                  </div>
                ))}
              </HScrollRow>
            </section>
          </div>
        )}

        {/* ── 영상 탭 ─────────────────────── */}
        {activeTab === 'videos' && (
          <div>
            <VideoSubTabs active={videoSubTab} onChange={setVideoSubTab} />

            {videoSubTab === 'vod' && (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {pochakVodContents.map((v, idx) => {
                  const visibility = getContentVisibility(idx);
                  const isLocked = visibility === 'MEMBERS_ONLY' && !isMember;
                  return (
                    <div key={v.id} className="relative">
                      {isLocked && <MembersOnlyOverlay onJoin={joinStatus === 'none' ? handleJoin : () => {}} />}
                      <HVideoCard
                        title={v.title}
                        sub={`조회수 ${formatViewCount(v.viewCount)} · ${v.date.slice(0, 10)}`}
                        duration={v.duration ? formatDuration(v.duration) : undefined}
                        thumbnailUrl={v.thumbnailUrl}
                        className="w-full"
                        linkTo={isLocked ? '#' : `/contents/vod/${v.id}`}
                      />
                      {visibility === 'PUBLIC' && (
                        <span className="absolute top-2 left-2 z-10 text-[10px] font-bold text-white bg-[#00CC33]/80 px-1.5 py-0.5 rounded">
                          홍보용
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {videoSubTab === 'clip' && (
              <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                {pochakClips.map((clip) => (
                  <VClipCard
                    key={clip.id}
                    title={clip.title}
                    viewCount={clip.viewCount}
                    linkTo={`/clip/${clip.id}`}
                  />
                ))}
              </div>
            )}
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
              <ClubCardFeedItem key={post.id} post={post} />
            ))}
          </div>
        )}

        {/* ── 정보 탭 ─────────────────────── */}
        {activeTab === 'info' && (
          <div className="space-y-6">
            <div className="rounded-xl border border-[#4D4D4D] bg-[#262626] p-6">
              <h3 className="text-lg font-bold text-white mb-4">클럽 정보</h3>
              <dl className="space-y-3 text-sm">
                <div className="flex gap-4">
                  <dt className="w-24 text-[#A6A6A6] flex-shrink-0">클럽명</dt>
                  <dd className="text-white">{club.name}</dd>
                </div>
                <div className="flex gap-4">
                  <dt className="w-24 text-[#A6A6A6] flex-shrink-0">종목</dt>
                  <dd className="text-white">축구</dd>
                </div>
                <div className="flex gap-4">
                  <dt className="w-24 text-[#A6A6A6] flex-shrink-0">부문</dt>
                  <dd className="text-white">유소년 · U-15</dd>
                </div>
                <div className="flex gap-4">
                  <dt className="w-24 text-[#A6A6A6] flex-shrink-0">소개</dt>
                  <dd className="text-white leading-relaxed">
                    {club.name}은 인천광역시 남동구를 기반으로 한 유소년 축구클럽입니다.
                    체계적인 훈련 프로그램과 전문 코칭스태프가 미래의 축구 스타를 양성하고 있습니다.
                  </dd>
                </div>
                <div className="flex gap-4">
                  <dt className="w-24 text-[#A6A6A6] flex-shrink-0">운영기간</dt>
                  <dd className="text-white">2019년 3월 ~ 현재</dd>
                </div>
                <div className="flex gap-4">
                  <dt className="w-24 text-[#A6A6A6] flex-shrink-0">회원수</dt>
                  <dd className="text-white">{club.memberCount}명</dd>
                </div>
                <div className="flex gap-4">
                  <dt className="w-24 text-[#A6A6A6] flex-shrink-0">지역</dt>
                  <dd className="text-white">인천광역시 남동구</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-xl border border-[#4D4D4D] bg-[#262626] p-6">
              <h3 className="text-lg font-bold text-white mb-4">외부 채널</h3>
              <SocialLinks links={{ instagram: '#', youtube: '#' }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
