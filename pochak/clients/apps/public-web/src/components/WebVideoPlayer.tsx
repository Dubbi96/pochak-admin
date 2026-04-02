import { useRef, useEffect, useState, useCallback } from 'react';
import Hls from 'hls.js';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  Loader2,
  AlertCircle,
  List,
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────

export interface TimelineEvent {
  id: string;
  time: number;  // seconds
  label: string;
  type: 'GOAL' | 'FOUL' | 'SUBSTITUTION' | 'HIGHLIGHT' | 'PERIOD' | 'CUSTOM';
  teamName?: string;
}

export interface Chapter {
  id: string;
  title: string;
  startTime: number;
  endTime: number;
  type: 'HALF' | 'BREAK' | 'HIGHLIGHT' | 'CUSTOM';
}

export interface WebVideoPlayerProps {
  src: string | null;
  poster?: string;
  isLive?: boolean;
  autoPlay?: boolean;
  onTimeUpdate?: (current: number, duration: number) => void;
  onEnded?: () => void;
  events?: TimelineEvent[];
  chapters?: Chapter[];
  onSeekTo?: (time: number) => void;
}

interface QualityLevel {
  index: number;
  label: string;
  height: number;
}

const SPEED_OPTIONS = [0.25, 0.5, 1, 1.25, 1.5, 2] as const;

const EVENT_COLORS: Record<TimelineEvent['type'], string> = {
  GOAL: '#4CAF50',
  FOUL: '#FFD600',
  SUBSTITUTION: '#2196F3',
  HIGHLIGHT: '#FFFFFF',
  PERIOD: '#FF9800',
  CUSTOM: '#CE93D8',
};

const CHAPTER_BADGE_COLORS: Record<Chapter['type'], string> = {
  HALF: '#4CAF50',
  BREAK: '#FF9800',
  HIGHLIGHT: '#2196F3',
  CUSTOM: '#CE93D8',
};

// ── Helpers ──────────────────────────────────────────────────────

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '00:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function formatDurationShort(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

// ── Component ────────────────────────────────────────────────────

export default function WebVideoPlayer({
  src,
  poster,
  isLive = false,
  autoPlay = false,
  onTimeUpdate,
  onEnded,
  events = [],
  chapters = [],
  onSeekTo,
}: WebVideoPlayerProps) {
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seekBarRef = useRef<HTMLDivElement>(null);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);

  // Volume
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  // Speed
  const [speed, setSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  // Quality
  const [qualityLevels, setQualityLevels] = useState<QualityLevel[]>([]);
  const [currentQuality, setCurrentQuality] = useState(-1); // -1 = auto
  const [showQualityMenu, setShowQualityMenu] = useState(false);

  // UI
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSeeking, setIsSeeking] = useState(false);

  // Timeline panel
  const [showTimelinePanel, setShowTimelinePanel] = useState(false);

  // ── Active chapter ───────────────────────────────────────────────

  const activeChapter = chapters.find(
    (ch) => ch.startTime <= currentTime && currentTime < ch.endTime,
  );

  // ── Seek helper ──────────────────────────────────────────────────

  const seekTo = useCallback(
    (time: number) => {
      const video = videoRef.current;
      if (video) {
        video.currentTime = time;
        setCurrentTime(time);
      }
      onSeekTo?.(time);
    },
    [onSeekTo],
  );

  // ── Auto-hide controls ─────────────────────────────────────────

  const scheduleHide = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      if (!showSpeedMenu && !showQualityMenu && !showVolumeSlider) {
        setShowControls(false);
      }
    }, 3000);
  }, [showSpeedMenu, showQualityMenu, showVolumeSlider]);

  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    scheduleHide();
  }, [scheduleHide]);

  const handleMouseLeave = useCallback(() => {
    scheduleHide();
  }, [scheduleHide]);

  // ── HLS / Video Source ─────────────────────────────────────────

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    setError(null);
    setIsBuffering(true);

    if (src.endsWith('.m3u8') && Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true });
      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
        // Build quality levels
        const levels: QualityLevel[] = data.levels.map((level, index) => ({
          index,
          label: `${level.height}p`,
          height: level.height,
        }));
        // Sort descending by height
        levels.sort((a, b) => b.height - a.height);
        setQualityLevels(levels);
        setCurrentQuality(-1);

        if (autoPlay) {
          video.play().catch(() => {
            // autoplay blocked
          });
        }
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          setError('스트림 로드에 실패했습니다');
          setIsBuffering(false);
        }
      });

      return () => {
        hls.destroy();
        hlsRef.current = null;
      };
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari native HLS
      video.src = src;
      if (autoPlay) video.play().catch(() => {});
    } else {
      // Regular MP4/WebM
      video.src = src;
      setQualityLevels([]);
      if (autoPlay) video.play().catch(() => {});
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src, autoPlay]);

  // ── Video event listeners ──────────────────────────────────────

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTimeUpdateEvt = () => {
      setCurrentTime(video.currentTime);
      onTimeUpdate?.(video.currentTime, video.duration);

      // Update buffered
      if (video.buffered.length > 0) {
        setBuffered(video.buffered.end(video.buffered.length - 1));
      }
    };
    const onDurationChange = () => {
      if (isFinite(video.duration)) setDuration(video.duration);
    };
    const onWaiting = () => setIsBuffering(true);
    const onCanPlay = () => setIsBuffering(false);
    const onPlaying = () => setIsBuffering(false);
    const onEndedEvt = () => {
      setIsPlaying(false);
      onEnded?.();
    };
    const onVolumeChange = () => {
      setIsMuted(video.muted);
      setVolume(Math.round(video.volume * 100));
    };
    const onError = () => {
      setError('영상을 재생할 수 없습니다');
      setIsBuffering(false);
    };

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('timeupdate', onTimeUpdateEvt);
    video.addEventListener('durationchange', onDurationChange);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('canplay', onCanPlay);
    video.addEventListener('playing', onPlaying);
    video.addEventListener('ended', onEndedEvt);
    video.addEventListener('volumechange', onVolumeChange);
    video.addEventListener('error', onError);

    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('timeupdate', onTimeUpdateEvt);
      video.removeEventListener('durationchange', onDurationChange);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('ended', onEndedEvt);
      video.removeEventListener('volumechange', onVolumeChange);
      video.removeEventListener('error', onError);
    };
  }, [onTimeUpdate, onEnded]);

  // ── Fullscreen listener ────────────────────────────────────────

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // ── Keyboard shortcuts ─────────────────────────────────────────

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      const video = videoRef.current;
      if (!video) return;

      switch (e.key) {
        case ' ':
        case 'k':
        case 'K':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'ArrowLeft':
        case 'j':
        case 'J':
          e.preventDefault();
          video.currentTime = Math.max(0, video.currentTime - 10);
          break;
        case 'ArrowRight':
        case 'l':
        case 'L':
          e.preventDefault();
          video.currentTime = Math.min(video.duration || 0, video.currentTime + 10);
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          toggleMute();
          break;
        case 'ArrowUp':
          e.preventDefault();
          changeVolume(clamp(volume + 5, 0, 100));
          break;
        case 'ArrowDown':
          e.preventDefault();
          changeVolume(clamp(volume - 5, 0, 100));
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'Escape':
          if (isFullscreen) {
            e.preventDefault();
            document.exitFullscreen?.();
          }
          break;
        case '<':
          e.preventDefault();
          cycleSpeed(-1);
          break;
        case '>':
          e.preventDefault();
          cycleSpeed(1);
          break;
      }

      setShowControls(true);
      scheduleHide();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [volume, speed, isFullscreen, isPlaying, isMuted]);

  // ── Actions ────────────────────────────────────────────────────

  const togglePlayPause = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
  }, []);

  const changeVolume = useCallback((newVol: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = newVol / 100;
    setVolume(newVol);
    if (newVol > 0 && video.muted) {
      video.muted = false;
    }
  }, []);

  const changeSpeed = useCallback((newSpeed: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = newSpeed;
    setSpeed(newSpeed);
    setShowSpeedMenu(false);
  }, []);

  const cycleSpeed = useCallback(
    (direction: 1 | -1) => {
      const idx = SPEED_OPTIONS.indexOf(speed as (typeof SPEED_OPTIONS)[number]);
      const nextIdx = clamp(idx + direction, 0, SPEED_OPTIONS.length - 1);
      changeSpeed(SPEED_OPTIONS[nextIdx]);
    },
    [speed, changeSpeed],
  );

  const changeQuality = useCallback(
    (levelIndex: number) => {
      const hls = hlsRef.current;
      if (hls) {
        hls.currentLevel = levelIndex; // -1 = auto
        setCurrentQuality(levelIndex);
      }
      setShowQualityMenu(false);
    },
    [],
  );

  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    if (document.fullscreenElement) {
      document.exitFullscreen?.();
    } else {
      container.requestFullscreen?.();
    }
  }, []);

  // ── Seek bar interaction ───────────────────────────────────────

  const handleSeekBarClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const video = videoRef.current;
      const bar = seekBarRef.current;
      if (!video || !bar || !isFinite(duration) || duration === 0) return;

      const rect = bar.getBoundingClientRect();
      const ratio = clamp((e.clientX - rect.left) / rect.width, 0, 1);
      video.currentTime = ratio * duration;
    },
    [duration],
  );

  const handleSeekMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsSeeking(true);

      const video = videoRef.current;
      const bar = seekBarRef.current;
      if (!video || !bar || !isFinite(duration) || duration === 0) return;

      const onMove = (moveEvt: MouseEvent) => {
        const rect = bar.getBoundingClientRect();
        const ratio = clamp((moveEvt.clientX - rect.left) / rect.width, 0, 1);
        video.currentTime = ratio * duration;
        setCurrentTime(ratio * duration);
      };

      const onUp = () => {
        setIsSeeking(false);
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };

      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);

      // Initial seek
      const rect = bar.getBoundingClientRect();
      const ratio = clamp((e.clientX - rect.left) / rect.width, 0, 1);
      video.currentTime = ratio * duration;
      setCurrentTime(ratio * duration);
    },
    [duration],
  );

  // ── Click to play/pause, double-click fullscreen ───────────────

  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleVideoAreaClick = useCallback(() => {
    if (clickTimerRef.current) {
      // Double-click
      clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
      toggleFullscreen();
    } else {
      clickTimerRef.current = setTimeout(() => {
        clickTimerRef.current = null;
        togglePlayPause();
      }, 250);
    }
  }, [togglePlayPause, toggleFullscreen]);

  // Close menus when clicking elsewhere
  const closeMenus = useCallback(() => {
    setShowSpeedMenu(false);
    setShowQualityMenu(false);
  }, []);

  // ── Progress percentage ────────────────────────────────────────

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedPercent = duration > 0 ? (buffered / duration) * 100 : 0;

  // ── Effective duration for markers (use chapters/events max if video duration not loaded) ──

  const effectiveDuration = duration > 0
    ? duration
    : Math.max(
        ...chapters.map((ch) => ch.endTime),
        ...events.map((ev) => ev.time),
        1,
      );

  // ── No source state ────────────────────────────────────────────

  if (!src) {
    return (
      <div className="aspect-video bg-[#1A1A1A] rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#262626] flex items-center justify-center mb-3">
            <Play className="w-8 h-8 text-[#00CC33]" />
          </div>
          <p className="text-[#A6A6A6] text-sm">영상을 준비 중입니다</p>
        </div>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────

  return (
    <div>
      <div
        ref={containerRef}
        className="relative aspect-video bg-black rounded-lg overflow-hidden select-none group"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={closeMenus}
      >
        {/* Video Element */}
        <video
          ref={videoRef}
          className="w-full h-full cursor-pointer"
          poster={poster}
          playsInline
          onClick={handleVideoAreaClick}
        />

        {/* Loading Spinner */}
        {isBuffering && !error && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Loader2 className="w-12 h-12 text-white animate-spin" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-2" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Big center play button when paused & controls hidden */}
        {!isPlaying && !showControls && !error && (
          <div
            className="absolute inset-0 flex items-center justify-center cursor-pointer"
            onClick={togglePlayPause}
          >
            <div className="w-16 h-16 rounded-full bg-black/50 flex items-center justify-center">
              <Play className="w-8 h-8 text-white ml-1" />
            </div>
          </div>
        )}

        {/* LIVE Badge (always visible when isLive) */}
        {isLive && (
          <div className="absolute top-4 left-4 z-10">
            <span className="inline-flex items-center gap-1.5 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              LIVE
            </span>
          </div>
        )}

        {/* Bottom Controls */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-12 pb-3 px-4 transition-opacity duration-300 ${
            showControls || isSeeking ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* Seek Bar */}
          <div
            ref={seekBarRef}
            className="relative w-full h-1.5 bg-white/20 rounded-full cursor-pointer mb-3 group/seek hover:h-2.5 transition-all"
            onClick={handleSeekBarClick}
            onMouseDown={handleSeekMouseDown}
          >
            {/* Buffered */}
            <div
              className="absolute top-0 left-0 h-full bg-white/30 rounded-full"
              style={{ width: `${bufferedPercent}%` }}
            />
            {/* Progress */}
            <div
              className="absolute top-0 left-0 h-full bg-[#00CC33] rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
            {/* Thumb */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-[#00CC33] rounded-full shadow-md opacity-0 group-hover/seek:opacity-100 transition-opacity"
              style={{ left: `calc(${progressPercent}% - 7px)` }}
            />

            {/* Chapter dividers */}
            {chapters.map((ch) => {
              const pos = (ch.startTime / effectiveDuration) * 100;
              if (pos <= 0) return null;
              return (
                <div
                  key={ch.id}
                  className="absolute top-0 h-full w-0.5 bg-white/70 z-10 pointer-events-none"
                  style={{ left: `${pos}%` }}
                />
              );
            })}

            {/* Event markers */}
            {events.map((evt) => {
              const pos = (evt.time / effectiveDuration) * 100;
              return (
                <div
                  key={evt.id}
                  className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full z-10 pointer-events-none"
                  style={{
                    left: `calc(${pos}% - 4px)`,
                    backgroundColor: EVENT_COLORS[evt.type],
                  }}
                  title={evt.label}
                />
              );
            })}
          </div>

          {/* Controls Row */}
          <div className="flex items-center gap-2">
            {/* Play/Pause */}
            <button
              className="p-1.5 text-white hover:text-[#00CC33] transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                togglePlayPause();
              }}
              aria-label={isPlaying ? '일시정지' : '재생'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </button>

            {/* Time Display + Active Chapter */}
            <span className="text-white text-xs font-mono whitespace-nowrap">
              {isLive ? (
                'LIVE'
              ) : (
                <>
                  {formatTime(currentTime)}
                  <span className="text-white/50 mx-1">/</span>
                  {formatTime(duration)}
                </>
              )}
            </span>
            {activeChapter && (
              <span className="text-[#00CC33] text-xs font-medium ml-1 whitespace-nowrap">
                {activeChapter.title}
              </span>
            )}

            {/* Timeline Panel Toggle */}
            {(events.length > 0 || chapters.length > 0) && (
              <button
                className={`p-1.5 transition-colors ${showTimelinePanel ? 'text-[#00CC33]' : 'text-white hover:text-[#00CC33]'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTimelinePanel((prev) => !prev);
                }}
                aria-label="타임라인"
              >
                <List className="w-5 h-5" />
              </button>
            )}

            {/* Spacer */}
            <div className="flex-1" />

            {/* Volume */}
            <div
              className="relative flex items-center"
              onMouseEnter={() => setShowVolumeSlider(true)}
              onMouseLeave={() => setShowVolumeSlider(false)}
            >
              {/* Volume Slider (shows on hover) */}
              {showVolumeSlider && (
                <div
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[#1A1A1A] border border-[#4D4D4D] rounded-lg p-3 flex flex-col items-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={isMuted ? 0 : volume}
                    onChange={(e) => changeVolume(Number(e.target.value))}
                    className="w-1.5 h-24 appearance-none cursor-pointer"
                    // @ts-expect-error orient is non-standard but works in Firefox
                    orient="vertical"
                    style={{
                      writingMode: 'vertical-lr',
                      direction: 'rtl',
                      accentColor: '#00CC33',
                    }}
                  />
                </div>
              )}
              <button
                className="p-1.5 text-white hover:text-[#00CC33] transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMute();
                }}
                aria-label={isMuted ? '음소거 해제' : '음소거'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Speed Selector */}
            <div className="relative">
              <button
                className="px-2 py-1 text-white text-xs font-medium hover:text-[#00CC33] transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSpeedMenu((prev) => !prev);
                  setShowQualityMenu(false);
                }}
                aria-label="재생 속도"
              >
                {speed === 1 ? '1x' : `${speed}x`}
              </button>
              {showSpeedMenu && (
                <div
                  className="absolute bottom-full right-0 mb-2 bg-[#1A1A1A] border border-[#4D4D4D] rounded-lg py-1 min-w-[80px] z-20"
                  onClick={(e) => e.stopPropagation()}
                >
                  {SPEED_OPTIONS.map((s) => (
                    <button
                      key={s}
                      className={`block w-full text-left px-4 py-1.5 text-xs transition-colors ${
                        s === speed
                          ? 'text-[#00CC33] bg-[#00CC33]/10'
                          : 'text-white hover:bg-white/10'
                      }`}
                      onClick={() => changeSpeed(s)}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quality Selector */}
            {qualityLevels.length > 0 && (
              <div className="relative">
                <button
                  className="p-1.5 text-white hover:text-[#00CC33] transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowQualityMenu((prev) => !prev);
                    setShowSpeedMenu(false);
                  }}
                  aria-label="화질 설정"
                >
                  <Settings className="w-4.5 h-4.5" />
                </button>
                {showQualityMenu && (
                  <div
                    className="absolute bottom-full right-0 mb-2 bg-[#1A1A1A] border border-[#4D4D4D] rounded-lg py-1 min-w-[100px] z-20"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className={`block w-full text-left px-4 py-1.5 text-xs transition-colors ${
                        currentQuality === -1
                          ? 'text-[#00CC33] bg-[#00CC33]/10'
                          : 'text-white hover:bg-white/10'
                      }`}
                      onClick={() => changeQuality(-1)}
                    >
                      Auto
                    </button>
                    {qualityLevels.map((level) => (
                      <button
                        key={level.index}
                        className={`block w-full text-left px-4 py-1.5 text-xs transition-colors ${
                          currentQuality === level.index
                            ? 'text-[#00CC33] bg-[#00CC33]/10'
                            : 'text-white hover:bg-white/10'
                        }`}
                        onClick={() => changeQuality(level.index)}
                      >
                        {level.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Fullscreen Toggle */}
            <button
              className="p-1.5 text-white hover:text-[#00CC33] transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                toggleFullscreen();
              }}
              aria-label={isFullscreen ? '전체화면 종료' : '전체화면'}
            >
              {isFullscreen ? (
                <Minimize className="w-5 h-5" />
              ) : (
                <Maximize className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Timeline Panel (below video, not overlay) */}
      {showTimelinePanel && (events.length > 0 || chapters.length > 0) && (
        <div className="bg-[#262626] border border-[#4D4D4D] border-t-0 rounded-b-lg p-4 space-y-5">
          {/* Chapters */}
          {chapters.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-white mb-3">경기 구간</h4>
              <div className="space-y-2">
                {chapters.map((ch) => {
                  const isActive = activeChapter?.id === ch.id;
                  const chDuration = ch.endTime - ch.startTime;
                  return (
                    <button
                      key={ch.id}
                      className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        isActive ? 'bg-[#00CC33]/10' : 'hover:bg-[#262626]'
                      }`}
                      onClick={() => seekTo(ch.startTime)}
                    >
                      <span
                        className="inline-block px-2 py-0.5 rounded text-[10px] font-bold text-white flex-shrink-0"
                        style={{ backgroundColor: CHAPTER_BADGE_COLORS[ch.type] }}
                      >
                        {ch.type === 'HALF' ? '경기' : ch.type === 'BREAK' ? '휴식' : ch.type === 'HIGHLIGHT' ? '하이라이트' : '기타'}
                      </span>
                      <span className="text-xs text-[#A6A6A6] font-mono flex-shrink-0 w-12">
                        {formatTime(ch.startTime)}
                      </span>
                      <span className={`text-sm flex-1 ${isActive ? 'text-[#00CC33] font-medium' : 'text-[#A6A6A6]'}`}>
                        {ch.title}
                      </span>
                      <span className="text-xs text-[#606060] flex-shrink-0">
                        {formatDurationShort(chDuration)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Events */}
          {events.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-white mb-3">이벤트</h4>
              <div className="space-y-1">
                {events.map((evt) => (
                  <button
                    key={evt.id}
                    className="flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg hover:bg-[#262626] transition-colors"
                    onClick={() => seekTo(evt.time)}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: EVENT_COLORS[evt.type] }}
                    />
                    <span className="text-xs text-[#A6A6A6] font-mono flex-shrink-0 w-12">
                      {formatTime(evt.time)}
                    </span>
                    <span className="text-sm text-[#A6A6A6] flex-1">{evt.label}</span>
                    {evt.teamName && (
                      <span className="text-xs text-[#606060] flex-shrink-0">{evt.teamName}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
