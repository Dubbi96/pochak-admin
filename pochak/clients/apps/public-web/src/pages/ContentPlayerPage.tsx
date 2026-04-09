import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  fetchPlayerData,
  pochakLiveContents,
  pochakVodContents,
  pochakClips,
  formatViewCount,
  mockChapters,
} from '@/services/webApi';
import type { PlayerData } from '@/services/webApi';
import WebVideoPlayer from '@/components/WebVideoPlayer';
import type { TimelineEvent } from '@/components/WebVideoPlayer';
import CommentSection from '@/components/CommentSection';
import CollapsibleSection from '@/components/CollapsibleSection';
import HScrollRow from '@/components/HScrollRow';
import HVideoCard from '@/components/HVideoCard';
import VClipCard from '@/components/VClipCard';
import RecommendedVideoItem from '@/components/RecommendedVideoItem';
import { setOgMeta } from '@/utils/ogMeta';
import { fetchApi, postApi } from '@/services/apiClient';
import { useToast } from '@/hooks/useToast';
import { Heart, Share2, MoreHorizontal, Sparkles, PanelRight, Goal, AlertTriangle, ArrowLeftRight, Star, Clock, Zap } from 'lucide-react';

// ── Highlight API ─────────────────────────────────────────────────

interface HighlightItem {
  id: number;
  startTimeSeconds: number;
  endTimeSeconds: number;
  highlightType: string;
  confidenceScore: number;
  description: string;
}

const HIGHLIGHT_TYPE_MAP: Record<string, TimelineEvent['type']> = {
  GOAL: 'GOAL',
  FOUL: 'FOUL',
  SUBSTITUTION: 'SUBSTITUTION',
  HIGHLIGHT: 'HIGHLIGHT',
  PERIOD: 'PERIOD',
  CUSTOM: 'CUSTOM',
};

const HIGHLIGHT_TYPE_COLORS: Record<string, string> = {
  GOAL: '#4CAF50',
  FOUL: '#FFD600',
  SUBSTITUTION: '#2196F3',
  HIGHLIGHT: '#FFFFFF',
  PERIOD: '#FF9800',
  CUSTOM: '#CE93D8',
};

const HIGHLIGHT_TYPE_ICON: Record<string, React.ElementType> = {
  GOAL: Goal,
  FOUL: AlertTriangle,
  SUBSTITUTION: ArrowLeftRight,
  HIGHLIGHT: Star,
  PERIOD: Clock,
  CUSTOM: Zap,
};

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
  const [highlightItems, setHighlightItems] = useState<HighlightItem[]>([]);
  const [detectingHighlights, setDetectingHighlights] = useState(false);
  const [highlightPanelOpen, setHighlightPanelOpen] = useState(false);
  const [seekToTime, setSeekToTime] = useState<number | undefined>(undefined);
  const [reelIndex, setReelIndex] = useState<number | null>(null);
  const reelRef = useRef<number | null>(null);
  const toast = useToast();

  const highlights: TimelineEvent[] = highlightItems.map((h) => ({
    id: String(h.id),
    time: h.startTimeSeconds,
    label: h.description || h.highlightType,
    type: HIGHLIGHT_TYPE_MAP[h.highlightType] ?? 'HIGHLIGHT',
  }));

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

  useEffect(() => {
    if (!id || type === 'clip') return;
    fetchApi<HighlightItem[]>(`/contents/${type}/${id}/highlights`, []).then((items) => {
      if (items.length > 0) {
        const sorted = [...items].sort((a, b) => a.startTimeSeconds - b.startTimeSeconds);
        setHighlightItems(sorted);
        setHighlightPanelOpen(true);
      }
    });
  }, [type, id]);

  const handleDetectHighlights = useCallback(async () => {
    if (detectingHighlights) return;
    setDetectingHighlights(true);
    try {
      const result = await postApi<{ highlights: HighlightItem[] }>(
        `/contents/${type}/${id}/highlights/detect`,
        {},
        { highlights: [] }
      );
      if (result?.highlights?.length > 0) {
        const sorted = [...result.highlights].sort((a, b) => a.startTimeSeconds - b.startTimeSeconds);
        setHighlightItems(sorted);
        setHighlightPanelOpen(true);
      } else {
        toast.show('감지된 하이라이트가 없습니다');
      }
    } catch {
      toast.show('하이라이트 감지에 실패했습니다');
    } finally {
      setDetectingHighlights(false);
    }
  }, [type, id, detectingHighlights, toast]);

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

  const handleSeekToHighlight = useCallback((startTime: number) => {
    setSeekToTime(startTime);
    setReelIndex(null);
    reelRef.current = null;
  }, []);

  const handleStartReel = useCallback(() => {
    if (highlightItems.length === 0) return;
    const idx = 0;
    reelRef.current = idx;
    setReelIndex(idx);
    setSeekToTime(highlightItems[idx].startTimeSeconds);
  }, [highlightItems]);

  const handleTimeUpdate = useCallback((current: number) => {
    if (reelRef.current === null) return;
    const item = highlightItems[reelRef.current];
    if (!item) return;
    if (current >= item.endTimeSeconds) {
      const next = reelRef.current + 1;
      if (next < highlightItems.length) {
        reelRef.current = next;
        setReelIndex(next);
        setSeekToTime(highlightItems[next].startTimeSeconds);
      } else {
        reelRef.current = null;
        setReelIndex(null);
      }
    }
  }, [highlightItems]);

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
      {!isClipView && (
        <button
          title="하이라이트 자동 감지"
          disabled={detectingHighlights}
          onClick={handleDetectHighlights}
          className={`flex items-center gap-1.5 text-sm transition-colors ${
            detectingHighlights ? 'text-[#606060] cursor-not-allowed' : 'text-[#A6A6A6] hover:text-[#00CC33]'
          }`}
        >
          <Sparkles className={`w-4.5 h-4.5 ${detectingHighlights ? 'animate-spin' : ''}`} />
          {detectingHighlights && <span className="text-xs">감지 중...</span>}
        </button>
      )}
      {!isClipView && highlightItems.length > 0 && (
        <button
          title={highlightPanelOpen ? '하이라이트 패널 닫기' : '하이라이트 패널 열기'}
          onClick={() => setHighlightPanelOpen((p) => !p)}
          className={`flex items-center gap-1.5 text-sm transition-colors ${
            highlightPanelOpen ? 'text-[#00CC33]' : 'text-[#A6A6A6] hover:text-white'
          }`}
        >
          <PanelRight className="w-4.5 h-4.5" />
        </button>
      )}
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
              <WebVideoPlayer src={player.streamUrl} isLive={false} autoPlay events={highlights} chapters={mockChapters} />
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
          {/* Video Player + Highlight Panel */}
          <div className={`flex gap-3 ${highlightPanelOpen && highlightItems.length > 0 ? 'items-start' : ''}`}>
            <div className="flex-1 min-w-0">
              <WebVideoPlayer
                src={player.streamUrl}
                isLive={isLive}
                autoPlay
                events={highlights}
                chapters={mockChapters}
                seekToTime={seekToTime}
                onTimeUpdate={handleTimeUpdate}
              />
            </div>
            {highlightPanelOpen && highlightItems.length > 0 && (
              <div className="w-[260px] flex-shrink-0 bg-[#1A1A1A] rounded-xl overflow-hidden flex flex-col" style={{ maxHeight: 400 }}>
                {/* Panel header */}
                <div className="flex items-center justify-between px-3 py-2.5 border-b border-[#2A2A2A]">
                  <span className="text-[13px] font-semibold text-white">하이라이트 ({highlightItems.length})</span>
                  <button
                    onClick={handleStartReel}
                    className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-[#00CC33] text-black hover:bg-[#00AA29] transition-colors"
                    title="하이라이트 릴 재생"
                  >
                    <Sparkles className="w-3 h-3" />
                    릴 재생
                  </button>
                </div>
                {/* Panel item list */}
                <div className="overflow-y-auto flex-1 scrollbar-hide">
                  {highlightItems.map((item, idx) => {
                    const TypeIcon = HIGHLIGHT_TYPE_ICON[item.highlightType] ?? Zap;
                    const color = HIGHLIGHT_TYPE_COLORS[item.highlightType] ?? '#FFFFFF';
                    const isActive = reelIndex === idx;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSeekToHighlight(item.startTimeSeconds)}
                        className={`w-full text-left px-3 py-2.5 border-b border-[#2A2A2A] last:border-0 transition-colors ${
                          isActive ? 'bg-[#00CC33]/10' : 'hover:bg-[#262626]'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <TypeIcon className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color }} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1 mb-0.5">
                              <span className="text-[11px] font-mono text-[#A6A6A6]">
                                {formatDuration(item.startTimeSeconds)}
                              </span>
                              <span className="text-[10px]" style={{ color }}>{item.highlightType}</span>
                            </div>
                            <p className="text-[12px] text-white truncate leading-tight">{item.description || item.highlightType}</p>
                            {/* Confidence bar */}
                            <div className="mt-1.5 flex items-center gap-1.5">
                              <div className="flex-1 h-1 bg-[#333] rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{ width: `${Math.round(item.confidenceScore * 100)}%`, backgroundColor: color }}
                                />
                              </div>
                              <span className="text-[10px] text-[#606060] flex-shrink-0">
                                {Math.round(item.confidenceScore * 100)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

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
