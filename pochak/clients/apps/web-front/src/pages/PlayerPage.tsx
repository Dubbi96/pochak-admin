import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  LuPlay, LuPause, LuSkipBack, LuSkipForward, LuVolume2, LuVolumeX,
  LuMaximize2, LuMinimize2, LuScissors, LuSettings, LuMonitor,
  LuThumbsUp, LuShare2, LuEllipsis, LuBookmark,
  LuRefreshCw, LuChevronUp, LuChevronDown, LuX,
} from 'react-icons/lu';
import HScrollRow from '@/components/HScrollRow';
import { VideoCard, ClipCard } from '@/components/Card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import SectionHeader from '@/components/SectionHeader';
import { useContents } from '@/hooks/useApi';
import { formatViewCount } from '@/lib/utils';

const SAMPLE_VIDEOS = [
  '/sample/video1.mp4',
  '/sample/video2.mp4',
];

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || isNaN(seconds)) return '00:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/* ── Video Player ──────────────────────────────────────── */
function VideoPlayer({ contentIndex = 0, contentType = 'VOD', vodContents = [] as import('@/types/content').ContentItem[] }: { contentIndex?: number; contentType?: string; vodContents?: import('@/types/content').ContentItem[] }) {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverX, setHoverX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showEndOverlay, setShowEndOverlay] = useState(false);
  const [countdown, setCountdown] = useState(10);

  const videoUrl = SAMPLE_VIDEOS[contentIndex % SAMPLE_VIDEOS.length];
  const nextIndex = vodContents.length > 0 ? (contentIndex + 1) % vodContents.length : 0;
  const nextContent = vodContents[nextIndex] ?? null;
  const isLive = contentType === 'LIVE';

  // Auto-hide controls
  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      if (playing && !isDragging) setShowControls(false);
    }, 3000);
  }, [playing, isDragging]);

  // Toggle play/pause
  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play().catch(() => {}); setPlaying(true); }
    else { v.pause(); setPlaying(false); }
    resetHideTimer();
  }, [resetHideTimer]);

  // Skip forward/backward
  const skip = useCallback((seconds: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.min(Math.max(v.currentTime + seconds, 0), v.duration || 0);
    resetHideTimer();
  }, [resetHideTimer]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
    resetHideTimer();
  }, [resetHideTimer]);

  // Handle volume change
  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current;
    if (!v) return;
    const val = parseFloat(e.target.value);
    v.volume = val;
    setVolume(val);
    if (val === 0) { v.muted = true; setMuted(true); }
    else if (v.muted) { v.muted = false; setMuted(false); }
    resetHideTimer();
  }, [resetHideTimer]);

  // Fullscreen
  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    resetHideTimer();
  }, [resetHideTimer]);

  // PIP
  const togglePIP = useCallback(async () => {
    const v = videoRef.current;
    if (!v) return;
    try {
      if (document.pictureInPictureElement) await document.exitPictureInPicture();
      else await v.requestPictureInPicture();
    } catch { /* PIP not supported */ }
    resetHideTimer();
  }, [resetHideTimer]);

  // Seek via progress bar click
  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current;
    const bar = progressRef.current;
    if (!v || !bar) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    v.currentTime = ratio * (v.duration || 0);
    resetHideTimer();
  }, [resetHideTimer]);

  // Progress bar hover tooltip
  const handleProgressHover = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const bar = progressRef.current;
    if (!bar) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverTime(ratio * (duration || 0));
    setHoverX(e.clientX - rect.left);
  }, [duration]);

  // Drag seeking
  useEffect(() => {
    if (!isDragging) return;
    const handleMouseMove = (e: MouseEvent) => {
      const v = videoRef.current;
      const bar = progressRef.current;
      if (!v || !bar) return;
      const rect = bar.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      v.currentTime = ratio * (v.duration || 0);
    };
    const handleMouseUp = () => setIsDragging(false);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Video event listeners
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onTimeUpdate = () => {
      setCurrentTime(v.currentTime);
      if (v.buffered.length > 0) {
        setBuffered(v.buffered.end(v.buffered.length - 1));
      }
    };
    const onLoadedMetadata = () => setDuration(v.duration);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => {
      setPlaying(false);
      setShowEndOverlay(true);
      setCountdown(10);
    };
    v.addEventListener('timeupdate', onTimeUpdate);
    v.addEventListener('loadedmetadata', onLoadedMetadata);
    v.addEventListener('play', onPlay);
    v.addEventListener('pause', onPause);
    v.addEventListener('ended', onEnded);
    return () => {
      v.removeEventListener('timeupdate', onTimeUpdate);
      v.removeEventListener('loadedmetadata', onLoadedMetadata);
      v.removeEventListener('play', onPlay);
      v.removeEventListener('pause', onPause);
      v.removeEventListener('ended', onEnded);
    };
  }, []);

  // Fullscreen change listener
  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return;
      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowRight':
          e.preventDefault();
          skip(10);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          skip(-10);
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          toggleMute();
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, skip, toggleFullscreen, toggleMute]);

  // Countdown timer for end overlay
  useEffect(() => {
    if (!showEndOverlay || isLive) return;
    if (countdown <= 0) {
      setShowEndOverlay(false);
      navigate(`/contents/vod/${nextContent.id}`);
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [showEndOverlay, countdown, navigate, nextContent.id, isLive]);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedPercent = duration > 0 ? (buffered / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className="relative aspect-video bg-black rounded-lg overflow-hidden select-none"
      role="region"
      aria-label="비디오 플레이어"
      onMouseMove={resetHideTimer}
      onMouseLeave={() => { if (playing) setShowControls(false); }}
      onClick={(e) => {
        // Only toggle play if clicking on the video area itself (not controls)
        if ((e.target as HTMLElement).closest('[data-controls]')) return;
        togglePlay();
      }}
    >
      {/* Video element */}
      <video
        ref={videoRef}
        src={videoUrl}
        className="absolute inset-0 w-full h-full object-contain bg-black"
        playsInline
        preload="metadata"
      />

      {/* Large center play button (when paused) */}
      {!playing && !showEndOverlay && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="w-16 h-16 rounded-full bg-black/50 border border-white/20 flex items-center justify-center animate-in fade-in duration-200">
            <LuPlay className="w-7 h-7 text-white ml-1" />
          </div>
        </div>
      )}

      {/* Controls overlay */}
      <div
        data-controls
        className={`absolute inset-x-0 bottom-0 z-20 transition-opacity duration-300 ${showControls || !playing ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

        <div className="relative px-3 pb-3 pt-10">
          {/* Progress bar */}
          <div
            ref={progressRef}
            className="group/progress w-full h-1.5 hover:h-2.5 bg-white/20 rounded-full mb-2.5 cursor-pointer relative transition-all duration-150"
            onClick={handleProgressClick}
            onMouseMove={handleProgressHover}
            onMouseLeave={() => setHoverTime(null)}
            onMouseDown={(e) => { e.preventDefault(); setIsDragging(true); handleProgressClick(e); }}
          >
            {/* Buffered */}
            <div
              className="absolute inset-y-0 left-0 bg-white/30 rounded-full pointer-events-none"
              style={{ width: `${bufferedPercent}%` }}
            />
            {/* Played */}
            <div
              className="absolute inset-y-0 left-0 bg-primary rounded-full pointer-events-none"
              style={{ width: `${progressPercent}%` }}
            />
            {/* Thumb */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-primary rounded-full border-2 border-white opacity-0 group-hover/progress:opacity-100 transition-opacity pointer-events-none"
              style={{ left: `${progressPercent}%`, transform: 'translate(-50%, -50%)' }}
            />
            {/* Hover tooltip */}
            {hoverTime !== null && (
              <div
                className="absolute -top-8 bg-black/90 text-white text-[13px] font-mono px-1.5 py-0.5 rounded pointer-events-none"
                style={{ left: `${hoverX}px`, transform: 'translateX(-50%)' }}
              >
                {formatTime(hoverTime)}
              </div>
            )}
          </div>

          {/* Controls row */}
          <div className="flex items-center justify-between">
            {/* Left controls */}
            <div className="flex items-center gap-1.5">
              <button
                className="text-white hover:text-primary transition-colors p-1"
                onClick={() => skip(-10)}
                title="10초 뒤로"
              >
                <span className="relative inline-flex items-center justify-center">
                  <LuSkipBack className="w-4 h-4" />
                  <span className="absolute -bottom-2 text-[10px] font-bold">10</span>
                </span>
              </button>

              <button
                onClick={togglePlay}
                className="text-white hover:text-primary transition-colors p-1"
                aria-label={playing ? '일시정지' : '재생'}
              >
                {playing ? <LuPause className="w-5 h-5" /> : <LuPlay className="w-5 h-5" />}
              </button>

              <button
                className="text-white hover:text-primary transition-colors p-1"
                onClick={() => skip(10)}
                title="10초 앞으로"
              >
                <span className="relative inline-flex items-center justify-center">
                  <LuSkipForward className="w-4 h-4" />
                  <span className="absolute -bottom-2 text-[10px] font-bold">10</span>
                </span>
              </button>

              {/* Volume */}
              <div className="flex items-center gap-1 group/vol ml-1">
                <button
                  onClick={toggleMute}
                  className="text-white hover:text-primary transition-colors p-1"
                  title={muted ? '음소거 해제' : '음소거'}
                >
                  {muted || volume === 0 ? <LuVolumeX className="w-4 h-4" /> : <LuVolume2 className="w-4 h-4" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={muted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-0 group-hover/vol:w-16 transition-all duration-200 accent-primary h-1 cursor-pointer overflow-hidden"
                />
              </div>

              {/* Time display */}
              <span className="text-[14px] text-white/70 font-mono ml-2 whitespace-nowrap">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-1.5">
              <button
                className="text-white hover:text-primary transition-colors p-1"
                title="클립 생성"
                onClick={() => navigate('/clip/editor')}
              >
                <LuScissors className="w-4 h-4" />
              </button>
              <button
                className="text-white hover:text-primary transition-colors p-1"
                title="PIP"
                onClick={togglePIP}
              >
                <LuMonitor className="w-4 h-4" />
              </button>
              <button
                className="text-white hover:text-primary transition-colors p-1"
                title="설정"
              >
                <LuSettings className="w-4 h-4" />
              </button>
              <button
                className="text-white hover:text-primary transition-colors p-1"
                title={isFullscreen ? '전체화면 해제' : '전체화면'}
                onClick={toggleFullscreen}
              >
                {isFullscreen ? <LuMinimize2 className="w-4 h-4" /> : <LuMaximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Video end overlay */}
      {showEndOverlay && (
        <div
          data-controls
          className="absolute inset-0 z-30 bg-black/80 flex items-center justify-center animate-in fade-in duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {isLive ? (
            /* LIVE ended */
            <div className="text-center flex flex-col gap-4">
              <p className="text-white text-xl font-bold">라이브 종료</p>
              <p className="text-white/60 text-sm">방송이 종료되었습니다.</p>
              <div className="grid grid-cols-2 gap-3 max-w-md mx-auto mt-4 px-4">
                {vodContents.slice(0, 4).map((v) => (
                  <a
                    key={v.id}
                    href={`/contents/vod/${v.id}`}
                    className="bg-white/10 rounded-lg p-2 hover:bg-white/20 transition-colors text-left"
                  >
                    <div className="aspect-video bg-white/5 rounded mb-1.5 flex items-center justify-center overflow-hidden">
                      {v.thumbnailUrl && <img src={v.thumbnailUrl} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <p className="text-white text-[13px] font-medium line-clamp-2">{v.title}</p>
                    <p className="text-white/40 text-[12px] mt-0.5">{v.competition}</p>
                  </a>
                ))}
              </div>
              <button
                onClick={() => setShowEndOverlay(false)}
                className="text-white/60 hover:text-white text-sm mt-2 transition-colors"
              >
                <LuX className="w-4 h-4 inline mr-1" /> 닫기
              </button>
            </div>
          ) : (
            /* VOD ended - next video countdown */
            <div className="text-center flex flex-col gap-4 max-w-sm px-4">
              <p className="text-white/60 text-sm">다음영상 재생</p>

              {/* Countdown ring */}
              <div className="relative w-20 h-20 mx-auto">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="36" fill="none" stroke="white" strokeOpacity="0.1" strokeWidth="3" />
                  <circle
                    cx="40" cy="40" r="36" fill="none" stroke="hsl(var(--primary))" strokeWidth="3"
                    strokeDasharray={`${2 * Math.PI * 36}`}
                    strokeDashoffset={`${2 * Math.PI * 36 * (1 - countdown / 10)}`}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-linear"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-white text-2xl font-bold">
                  {countdown}
                </span>
              </div>

              {/* Next video info */}
              <div className="bg-white/10 rounded-lg p-3 text-left">
                <div className="aspect-video bg-white/5 rounded mb-2 overflow-hidden flex items-center justify-center">
                  {nextContent.thumbnailUrl && (
                    <img src={nextContent.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <p className="text-white text-[14px] font-medium line-clamp-2">{nextContent.title}</p>
                <p className="text-white/50 text-[13px] mt-1">{nextContent.competition}</p>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => {
                    setShowEndOverlay(false);
                    navigate(`/contents/vod/${nextContent.id}`);
                  }}
                  className="bg-primary hover:bg-primary/80 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
                >
                  ▶ 재생
                </button>
                <button
                  onClick={() => setShowEndOverlay(false)}
                  className="bg-white/10 hover:bg-white/20 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
                >
                  ✕ 닫기
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Player Page ───────────────────────────────────────── */
export default function PlayerPage() {
  const params = useParams<{ type?: string; id?: string }>();
  const type = params.type ?? 'vod';
  const id = params.id ?? '1';
  const [likeCount, setLikeCount] = useState(100);
  const [liked, setLiked] = useState(false);

  const { data: liveContents } = useContents('LIVE');
  const { data: vodContents } = useContents('VOD');
  const { data: clipContents } = useContents('CLIP');

  const allContents = [...liveContents, ...vodContents, ...clipContents];
  const content = allContents.find((c) => c.id === id) ?? allContents[0] ?? { id: '', title: '', type: 'VOD' as const, competition: '', sport: '', date: '', viewCount: 0, tags: [] };
  const contentIndex = vodContents.findIndex((c) => c.id === id);
  const videoIndex = contentIndex >= 0 ? contentIndex : Math.abs(id.charCodeAt(id.length - 1)) % SAMPLE_VIDEOS.length;

  useEffect(() => { window.scrollTo(0, 0); }, [type, id]);

  return (
    <div>
      <div className="flex gap-5 flex-col xl:flex-row">
        {/* ── Left: Video + Info ── */}
        <div className="flex-1 min-w-0">
          <VideoPlayer contentIndex={videoIndex} contentType={content.type} vodContents={vodContents} />

          {/* Title & Tags card */}
          <div className="mt-4 py-3">
            <h1 className="text-[18px] font-bold text-foreground leading-tight">
              {content.title}
            </h1>
            <p className="text-[14px] text-muted-foreground mt-1.5">
              {content.competition} | {content.date.slice(0, 10)}
            </p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {content.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Description card */}
          <div className="mt-3 py-3">
            <h3 className="text-[14px] font-semibold text-foreground mb-2">설명</h3>
            <p className="text-[14px] text-muted-foreground leading-relaxed">
              스포츠는 정해진 규칙과 공정성을 바탕으로 신체 능력, 기술, 전략, 정신력을 겨루는 인간 활동이다.
            </p>
          </div>

          {/* YouTube-style action bar */}
          <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
                <span className="text-[12px] font-bold text-primary-foreground">P</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[14px] font-semibold text-pochak-text">{content.competition}</span>
                <span className="text-[12px] text-pochak-text-secondary">12.4만 팔로워</span>
              </div>
              <Button variant="default" size="sm" className="ml-3">
                즐겨찾기
              </Button>
            </div>
            {/* YouTube pill action buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="action"
                size="sm"
                data-active={liked || undefined}
                onClick={() => { setLiked(!liked); setLikeCount(c => liked ? c - 1 : c + 1); }}
              >
                <LuThumbsUp className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} /> {likeCount}
              </Button>
              <Button variant="secondary" size="sm">
                <LuShare2 className="w-4 h-4" /> 공유
              </Button>
              <Button variant="secondary" size="icon-sm">
                <LuEllipsis className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Related clips */}
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-3">
              <SectionHeader title={`${content.competition} 클립`} linkTo="#" linkLabel="정렬" />
              <button className="text-muted-foreground/50 hover:text-muted-foreground transition-colors"><LuRefreshCw className="w-3.5 h-3.5" /></button>
            </div>
            <HScrollRow scrollAmount={160}>
              {clipContents.slice(0, 7).map((clip) => (
                <ClipCard key={clip.id} id={clip.id} title={clip.title} viewCount={clip.viewCount} className="w-[120px]" />
              ))}
            </HScrollRow>
          </div>

          {/* Related VODs */}
          <div className="mt-8">
            <div className="flex items-center gap-2 mb-3">
              <SectionHeader title={`${content.competition} 영상`} linkTo="#" linkLabel="정렬" />
              <button className="text-muted-foreground/50 hover:text-muted-foreground transition-colors"><LuRefreshCw className="w-3.5 h-3.5" /></button>
            </div>
            <HScrollRow>
              {vodContents.map((v) => (
                <VideoCard
                  key={v.id} id={v.id} title={v.title} competition={v.competition}
                  type={v.type} tags={v.tags} duration={v.duration} date={v.date} viewCount={v.viewCount}
                  className="w-[200px]"
                />
              ))}
            </HScrollRow>
          </div>
        </div>

        {/* ── Right Sidebar ── */}
        <aside className="w-[320px] flex-shrink-0 hidden xl:block flex flex-col gap-8" aria-label="추천 콘텐츠">
          {/* 이 영상의 내 클립 */}
          <CollapsibleSection title="이 영상의 내 클립">
            <HScrollRow scrollAmount={120}>
              {clipContents.slice(0, 4).map((clip) => (
                <ClipCard key={clip.id} id={clip.id} title={clip.title} viewCount={clip.viewCount} className="w-[100px]" />
              ))}
            </HScrollRow>
          </CollapsibleSection>

          {/* 이 대회의 라이브 */}
          <CollapsibleSection title="이 대회의 라이브">
            <HScrollRow scrollAmount={140}>
              {liveContents.slice(0, 3).map((c) => (
                <VideoCard
                  key={c.id} id={c.id} title={c.title} competition={c.competition}
                  type={c.type} isLive={c.isLive} date={c.date} className="w-[160px]"
                />
              ))}
            </HScrollRow>
          </CollapsibleSection>

          {/* 추천영상 */}
          <CollapsibleSection title="추천영상">
            {/* Tag pills */}
            <div className="flex gap-1.5 mb-3 overflow-x-auto scrollbar-hide">
              {['#야구', '#유료', '#해설', '#MLB', '동대문구리'].map((tag, i) => (
                <Badge
                  key={tag}
                  variant={i === 0 ? 'default' : 'secondary'}
                  className="flex-shrink-0"
                >
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Clip row */}
            <HScrollRow scrollAmount={120}>
              {clipContents.slice(0, 4).map((clip) => (
                <ClipCard key={clip.id} id={clip.id} title={clip.title} viewCount={clip.viewCount} className="w-[100px]" />
              ))}
            </HScrollRow>

            {/* VOD list */}
            <div className="mt-4 flex flex-col gap-3">
              {vodContents.slice(0, 5).map((v) => (
                <a key={v.id} href={`/contents/vod/${v.id}`} className="flex gap-2.5 group">
                  <div className="w-[120px] flex-shrink-0 aspect-video rounded-md bg-card border border-border-subtle group-hover:border-border transition-colors overflow-hidden flex items-center justify-center relative">
                    <span className="text-muted-foreground/50/20 text-xs font-black">P</span>
                    {v.duration && (
                      <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[11px] font-mono px-1 py-0.5 rounded">
                        {v.duration}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] text-foreground font-medium line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                      {v.title}
                    </p>
                    <p className="text-[12px] text-muted-foreground/50 mt-1">{v.competition}</p>
                    <p className="text-[12px] text-muted-foreground/50">야구 | 유료 | 해설 | {v.date.slice(0, 10)}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="self-start flex-shrink-0 h-6 w-6">
                    <LuEllipsis className="w-3.5 h-3.5" />
                  </Button>
                </a>
              ))}
            </div>
          </CollapsibleSection>
        </aside>
      </div>
    </div>
  );
}

/* ── Collapsible Section ───────────────────────────────── */
function CollapsibleSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full mb-4"
      >
        <h3 className="text-[16px] font-bold text-foreground">{title}</h3>
        {open ? <LuChevronUp className="w-4 h-4 text-muted-foreground/50" /> : <LuChevronDown className="w-4 h-4 text-muted-foreground/50" />}
      </button>
      {open && children}
    </div>
  );
}
