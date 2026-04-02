import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  fetchPlayerData,
  pochakLiveContents,
  pochakVodContents,
  pochakClips,
  formatViewCount,
  mockTimelineEvents,
  mockChapters,
} from '@/services/webApi';
import type { PlayerData } from '@/services/webApi';
import WebVideoPlayer from '@/components/WebVideoPlayer';
import CommentSection from '@/components/CommentSection';
import CollapsibleSection from '@/components/CollapsibleSection';
import HScrollRow from '@/components/HScrollRow';
import HVideoCard from '@/components/HVideoCard';
import VClipCard from '@/components/VClipCard';
import RecommendedVideoItem from '@/components/RecommendedVideoItem';
import { setOgMeta } from '@/utils/ogMeta';
import { Heart, Share2, MoreHorizontal } from 'lucide-react';

/* ── Sidebar tag filter pills ── */
const SIDEBAR_TAGS = ['#야구', '#유료', '#해설', '#MLB', '#동대문구리'] as const;

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/* ── Sidebar tag filter with horizontal scroll ── */
function SidebarTagFilter() {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide">
      {SIDEBAR_TAGS.map((tag) => (
        <button
          key={tag}
          onClick={() => setActiveTag(activeTag === tag ? null : tag)}
          className={`flex-shrink-0 px-3 py-1 rounded-full text-xs transition-colors ${
            activeTag === tag
              ? 'bg-white text-[#1A1A1A] font-medium'
              : 'bg-[#262626] text-[#A6A6A6] hover:text-white'
          }`}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}

export default function ContentPlayerPage() {
  const params = useParams<{ type?: string; id?: string; contentType?: string; contentId?: string }>();
  const type = params.type ?? params.contentType ?? 'vod';
  const id = params.id ?? params.contentId ?? '1';
  const [player, setPlayer] = useState<PlayerData | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showMore, setShowMore] = useState(false);

  const isClipView = type === 'clip';

  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    fetchPlayerData(type, id)
      .then((data) => {
        setPlayer(data);
        setLikeCount(data.likeCount ?? 0);
        setOgMeta(
          data.title,
          `${data.competition ?? ''} | ${data.date ?? ''}`,
          data.streamUrl ?? undefined,
        );
      })
      .catch(() => {});
  }, [type, id]);

  const handleLike = useCallback(() => {
    setIsLiked((prev) => {
      setLikeCount((c) => (prev ? c - 1 : c + 1));
      return !prev;
    });
  }, []);

  const handleShare = useCallback(async () => {
    const url = `${window.location.origin}/contents/${type}/${id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: player?.title ?? '', url });
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
    }
  }, [type, id, player]);

  if (!player) {
    return (
      <div className="px-6 py-8 lg:px-8">
        <div className="flex aspect-video items-center justify-center rounded-lg bg-[#262626]">
          <p className="text-sm text-[#A6A6A6]">로딩 중...</p>
        </div>
      </div>
    );
  }

  const isLive = player.isLive ?? type === 'live';

  /* ── Action buttons (inline with title) ─────────── */
  const actionButtons = (
    <div className="flex items-center gap-4">
      <button
        className={`flex items-center gap-1.5 text-sm transition-colors ${
          isLiked ? 'text-red-500' : 'text-[#A6A6A6] hover:text-white'
        }`}
        onClick={handleLike}
      >
        <Heart className={`w-4.5 h-4.5 ${isLiked ? 'fill-red-500' : ''}`} />
        <span>{likeCount > 0 ? likeCount : ''}</span>
      </button>
      <button
        className="flex items-center gap-1.5 text-sm text-[#A6A6A6] hover:text-white transition-colors"
        onClick={handleShare}
      >
        <Share2 className="w-4.5 h-4.5" />
      </button>
      <button
        className="flex items-center gap-1.5 text-sm text-[#A6A6A6] hover:text-white transition-colors"
        onClick={() => setShowMore((prev) => !prev)}
      >
        <MoreHorizontal className="w-4.5 h-4.5" />
      </button>
    </div>
  );

  /* ── Clip layout: left vertical video, right info + recommended ── */
  if (isClipView) {
    return (
      <div className="px-6 py-8 lg:px-8 max-w-[1200px] mx-auto">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: vertical video */}
          <div className="lg:w-[400px] flex-shrink-0">
            <div className="aspect-[9/16] bg-[#1A1A1A] rounded-lg overflow-hidden flex items-center justify-center">
              <WebVideoPlayer src={player.streamUrl} isLive={false} autoPlay events={mockTimelineEvents} chapters={mockChapters} />
            </div>
          </div>

          {/* Right: info + recommended clips */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-4">
              <h1 className="text-xl font-bold">{player.title}</h1>
              {actionButtons}
            </div>
            <p className="text-sm text-[#A6A6A6] mt-2">
              {player.competition} <span className="mx-2">|</span> {player.date}
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              {player.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-[#262626] px-3 py-1 text-xs text-[#A6A6A6]">#{tag}</span>
              ))}
            </div>

            {showMore && (
              <div className="mt-3 bg-[#1A1A1A] rounded-lg p-4 text-sm text-[#A6A6A6] space-y-2">
                <p>클립 상세 정보</p>
                <p>{player.title} 클립입니다.</p>
              </div>
            )}

            {/* Recommended clips */}
            <div className="mt-8">
              <h2 className="text-lg font-bold text-white mb-4">추천 클립</h2>
              <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
                {pochakClips.slice(0, 6).map((clip) => (
                  <VClipCard
                    key={clip.id}
                    title={clip.title}
                    viewCount={clip.viewCount}
                    className="w-full"
                    linkTo={`/clip/${clip.id}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── VOD/LIVE 2-column layout ──────────────────────────── */
  return (
    <div className="px-6 py-8 lg:px-8 max-w-[1400px] mx-auto">
      <div className="flex gap-6">
        {/* ── Left column: player + info (~65%) ────────── */}
        <div className="flex-1 min-w-0">
          {/* Video Player */}
          <WebVideoPlayer src={player.streamUrl} isLive={isLive} autoPlay events={mockTimelineEvents} chapters={mockChapters} />

          {/* Match Info */}
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between gap-4">
              <h1 className="text-xl font-bold sm:text-2xl">{player.title}</h1>
              {actionButtons}
            </div>
            <p className="text-sm text-[#A6A6A6]">
              {player.competition} <span className="mx-2">|</span> {player.date}
            </p>
            {player.homeTeam && player.awayTeam && (
              <div className="flex items-center gap-3">
                <span className="text-base font-semibold text-white">{player.homeTeam}</span>
                <span className="text-sm text-[#606060] font-medium">vs</span>
                <span className="text-base font-semibold text-white">{player.awayTeam}</span>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {player.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-[#262626] px-3 py-1 text-xs text-[#A6A6A6]">#{tag}</span>
              ))}
            </div>
            {showMore && (
              <div className="bg-[#1A1A1A] rounded-lg p-4 text-sm text-[#A6A6A6] space-y-2">
                <p>경기 상세 정보 및 안내</p>
                <p>{player.title} 경기입니다. 대회 일정, 참가 선수, 코스 정보 등 상세 내용을 확인하세요.</p>
              </div>
            )}
          </div>

          {/* Clips carousel */}
          <div className="mt-8">
            <h2 className="text-lg font-bold text-white mb-4">클립</h2>
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
          </div>

          {/* VOD carousel */}
          <div className="mt-8">
            <h2 className="text-lg font-bold text-white mb-4">관련 VOD</h2>
            <HScrollRow scrollAmount={300}>
              {pochakVodContents.map((v) => (
                <HVideoCard
                  key={v.id}
                  title={v.title}
                  sub={`조회수 ${formatViewCount(v.viewCount)}`}
                  duration={v.duration ? formatDuration(v.duration) : undefined}
                  thumbnailUrl={v.thumbnailUrl}
                  linkTo={`/contents/vod/${v.id}`}
                />
              ))}
            </HScrollRow>
          </div>

          {/* Comment Section */}
          <CommentSection />
        </div>

        {/* ── Right column: structured sidebar (hidden below xl) ──── */}
        <aside className="w-[380px] flex-shrink-0 hidden xl:flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-80px)] pr-1 scrollbar-hide">

          {/* ── Section 1: 이 영상의 내 클립 ──────────── */}
          <CollapsibleSection title="이 영상의 내 클립">
            <HScrollRow scrollAmount={160}>
              {pochakClips.slice(0, 4).map((clip) => (
                <VClipCard
                  key={clip.id}
                  title={clip.title}
                  viewCount={clip.viewCount}
                  linkTo={`/clip/${clip.id}`}
                  className="w-[110px]"
                  showMoreMenu
                />
              ))}
            </HScrollRow>
          </CollapsibleSection>

          {/* ── Section 2: 이 대회의 라이브 ──────────── */}
          <CollapsibleSection title="이 대회의 라이브">
            <HScrollRow scrollAmount={200}>
              {pochakLiveContents.slice(0, 5).map((c) => (
                <HVideoCard
                  key={c.id}
                  title={c.title}
                  sub={c.competition}
                  thumbnailUrl={c.thumbnailUrl}
                  live={c.status === 'LIVE'}
                  dateBadge={c.status !== 'LIVE' ? new Date(c.date).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' }) + ' 예정' : undefined}
                  linkTo={`/contents/live/${c.id}`}
                  className="w-[180px]"
                />
              ))}
            </HScrollRow>
          </CollapsibleSection>

          {/* ── Section 3: 추천영상 ──────────────────── */}
          <CollapsibleSection title="추천영상">
            {/* Tag filter pills (horizontal scroll) */}
            <div className="mb-3">
              <SidebarTagFilter />
            </div>

            {/* Recommended clips (9:16 horizontal scroll) */}
            <div className="mb-4">
              <HScrollRow scrollAmount={140}>
                {pochakClips.slice(0, 6).map((clip) => (
                  <VClipCard
                    key={clip.id}
                    title={clip.title}
                    viewCount={clip.viewCount}
                    linkTo={`/clip/${clip.id}`}
                    className="w-[100px]"
                  />
                ))}
              </HScrollRow>
            </div>

            {/* Recommended video vertical list */}
            <div className="space-y-3">
              {pochakVodContents.slice(0, 6).map((v) => (
                <RecommendedVideoItem
                  key={v.id}
                  title={v.title}
                  competition={v.competition}
                  tags={v.tags.slice(0, 3)}
                  date={new Date(v.date).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                  duration={v.duration ? formatDuration(v.duration) : undefined}
                  thumbnailUrl={v.thumbnailUrl}
                  linkTo={`/contents/vod/${v.id}`}
                />
              ))}
            </div>
          </CollapsibleSection>
        </aside>
      </div>
    </div>
  );
}
