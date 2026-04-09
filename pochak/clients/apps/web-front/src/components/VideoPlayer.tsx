import { useRef, useEffect, useState, useCallback } from 'react';
import Hls from 'hls.js';
import {
  LuPlay,
  LuPause,
  LuVolume2,
  LuVolumeX,
  LuMaximize,
  LuMinimize,
  LuSettings,
  LuLoaderCircle,
  LuCircleAlert,
  LuList,
  LuWifiOff,
} from 'react-icons/lu';

// ── Types ────────────────────────────────────────────────────

export interface TimelineEvent {
  id: string;
  time: number;
  label: string;
  type: 'GOAL' | 'FOUL' | 'SUBSTITUTION' | 'HIGHLIGHT' | 'PERIOD' | 'CUSTOM';
  teamName?: string;
  confidence?: number; // 0–1
}

export interface Chapter {
  id: string;
  title: string;
  startTime: number;
  endTime: number;
  type: 'HALF' | 'BREAK' | 'HIGHLIGHT' | 'CUSTOM';
}

export interface VideoPlayerProps {
  src: string | null;
  poster?: string;
  isLive?: boolean;
  autoPlay?: boolean;
  onTimeUpdate?: (current: number, duration: number) => void;
  onEnded?: () => void;
  events?: TimelineEvent[];
  chapters?: Chapter[];
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

const EVENT_ICONS: Record<TimelineEvent['type'], string> = {
  GOAL: '⚽',
  FOUL: '🟨',
  SUBSTITUTION: '🔄',
  HIGHLIGHT: '⭐',
  PERIOD: '🔔',
  CUSTOM: '📌',
};

const CHAPTER_BADGE_COLORS: Record<Chapter['type'], string> = {
  HALF: '#4CAF50',
  BREAK: '#FF9800',
  HIGHLIGHT: '#2196F3',
  CUSTOM: '#CE93D8',
};

const CHAPTER_LABELS: Record<Chapter['type'], string> = {
  HALF: '경기',
  BREAK: '휴식',
  HIGHLIGHT: '하이라이트',
  CUSTOM: '기타',
};

// ── Helpers ──────────────────────────────────────────────────

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

// ── HLS Configuration for stability ─────────────────────────

const HLS_CONFIG: Partial<Hls['config']> = {
  enableWorker: true,
  // Network recovery
  fragLoadPolicy: {
    default: {
      maxTimeToFirstByteMs: 10000,
      maxLoadTimeMs: 120000,
      timeoutRetry: { maxNumRetry: 4, retryDelayMs: 1000, maxRetryDelayMs: 8000 },
      errorRetry: { maxNumRetry: 6, retryDelayMs: 1000, maxRetryDelayMs: 8000 },
    },
  },
  manifestLoadPolicy: {
    default: {
      maxTimeToFirstByteMs: 10000,
      maxLoadTimeMs: 20000,
      timeoutRetry: { maxNumRetry: 4, retryDelayMs: 1000, maxRetryDelayMs: 8000 },
      errorRetry: { maxNumRetry: 4, retryDelayMs: 1000, maxRetryDelayMs: 8000 },
    },
  },
  // Low-latency live
  lowLatencyMode: true,
  backBufferLength: 30,
};

// ── Component ────────────────────────────────────────────────

export default function VideoPlayer({
  src,
  poster,
  isLive = false,
  autoPlay = false,
  onTimeUpdate,
  onEnded,
  events = [],
  chapters = [],
}: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seekBarRef = useRef<HTMLDivElement>(null);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const networkRetryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
  const [currentQuality, setCurrentQuality] = useState(-1);
  const [showQualityMenu, setShowQualityMenu] = useState(false);

  // UI
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSeeking, setIsSeeking] = useState(false);
  const [showTimelinePanel, setShowTimelinePanel] = useState(false);
  const [isNetworkError, setIsNetworkError] = useState(false);

  // Highlight reel
  const [isHighlightReel, setIsHighlightReel] = useState(false);
  const [reelIdx, setReelIdx] = useState(0);
  const reelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeChapter = chapters.find(
    (ch) => ch.startTime <= currentTime && currentTime < ch.endTime,
  );

  // ── Seek helper ──────────────────────────────────────────────

  const seekTo = useCallback((time: number) => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  // Highlight reel: seek through events with 5-second preview each
  useEffect(() => {
    const sortedEvents = [...events].sort((a, b) => a.time - b.time);
    if (!isHighlightReel || sortedEvents.length === 0) return;
    if (reelIdx >= sortedEvents.length) {
      setIsHighlightReel(false);
      setReelIdx(0);
      return;
    }
    seekTo(sortedEvents[reelIdx].time);
    const video = videoRef.current;
    if (video && video.paused) video.play().catch(() => {});
    reelTimerRef.current = setTimeout(() => {
      setReelIdx((i) => i + 1);
    }, 5000);
    return () => {
      if (reelTimerRef.current) clearTimeout(reelTimerRef.current);
    };
  }, [isHighlightReel, reelIdx, events, seekTo]);

  // ── Auto-hide controls ─────────────────────────────────────

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

  // ── Network recovery ──────────────────────────────────────

  const attemptRecovery = useCallback(() => {
    const hls = hlsRef.current;
    if (!hls) return;

    setIsNetworkError(true);
    setError('네트워크 연결이 불안정합니다. 재연결 중...');

    if (networkRetryTimerRef.current) clearTimeout(networkRetryTimerRef.current);
    networkRetryTimerRef.current = setTimeout(() => {
      if (hlsRef.current) {
        hlsRef.current.startLoad();
        setIsNetworkError(false);
        setError(null);
      }
    }, 3000);
  }, []);

  // ── HLS / Video Source ─────────────────────────────────────

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    setError(null);
    setIsBuffering(true);
    setIsNetworkError(false);

    if (src.endsWith('.m3u8') && Hls.isSupported()) {
      const hls = new Hls(HLS_CONFIG);
      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
        const levels: QualityLevel[] = data.levels.map((level, index) => ({
          index,
          label: `${level.height}p`,
          height: level.height,
        }));
        levels.sort((a, b) => b.height - a.height);
        setQualityLevels(levels);
        setCurrentQuality(-1);

        if (autoPlay) {
          video.play().catch(() => {});
        }
      });

      // Network recovery handling
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              attemptRecovery();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              setError('스트림 로드에 실패했습니다');
              setIsBuffering(false);
              hls.destroy();
              hlsRef.current = null;
              break;
          }
        }
      });

      // Track level switching for quality display
      hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
        if (currentQuality === -1) {
          // Auto mode — just update display, don't change selection
          void data;
        }
      });

      return () => {
        if (networkRetryTimerRef.current) clearTimeout(networkRetryTimerRef.current);
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
      if (networkRetryTimerRef.current) clearTimeout(networkRetryTimerRef.current);
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, autoPlay]);

  // ── Video event listeners ──────────────────────────────────

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTimeUpdateEvt = () => {
      setCurrentTime(video.currentTime);
      onTimeUpdate?.(video.currentTime, video.duration);
      if (video.buffered.length > 0) {
        setBuffered(video.buffered.end(video.buffered.length - 1));
      }
    };
    const onDurationChange = () => {
      if (isFinite(video.duration)) setDuration(video.duration);
    };
    const onWaiting = () => setIsBuffering(true);
    const onCanPlay = () => {
      setIsBuffering(false);
      setIsNetworkError(false);
      setError(null);
    };
    const onPlaying = () => {
      setIsBuffering(false);
      setIsNetworkError(false);
      setError(null);
    };
    const onEndedEvt = () => {
      setIsPlaying(false);
      onEnded?.();
    };
    const onVolumeChange = () => {
      setIsMuted(video.muted);
      setVolume(Math.round(video.volume * 100));
    };
    const onError = () => {
      // For native video errors (non-HLS), set error state
      if (!hlsRef.current) {
        setError('영상을 재생할 수 없습니다');
        setIsBuffering(false);
      }
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

  // ── Online/offline detection for network recovery ──────────

  useEffect(() => {
    const handleOnline = () => {
      if (hlsRef.current && isNetworkError) {
        hlsRef.current.startLoad();
        setIsNetworkError(false);
        setError(null);
      }
    };
    const handleOffline = () => {
      setIsNetworkError(true);
      setError('네트워크 연결이 끊어졌습니다');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isNetworkError]);

  // ── Fullscreen listener ────────────────────────────────────

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    // webkit fallback for mobile Safari
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
    };
  }, []);

  // ── Keyboard shortcuts ─────────────────────────────────────

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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

  // ── Actions ────────────────────────────────────────────────

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
    if (newVol > 0 && video.muted) video.muted = false;
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

  const changeQuality = useCallback((levelIndex: number) => {
    const hls = hlsRef.current;
    if (hls) {
      hls.currentLevel = levelIndex;
      setCurrentQuality(levelIndex);
    }
    setShowQualityMenu(false);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    if (document.fullscreenElement) {
      document.exitFullscreen?.();
    } else {
      // Mobile Safari fallback
      const el = container as HTMLDivElement & { webkitRequestFullscreen?: () => void };
      if (el.requestFullscreen) {
        el.requestFullscreen();
      } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen();
      }
    }
  }, []);

  const handleRetry = useCallback(() => {
    if (!src) return;
    setError(null);
    setIsNetworkError(false);
    setIsBuffering(true);

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const video = videoRef.current;
    if (!video) return;

    if (src.endsWith('.m3u8') && Hls.isSupported()) {
      const hls = new Hls(HLS_CONFIG);
      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            attemptRecovery();
          } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            setError('스트림 로드에 실패했습니다');
            setIsBuffering(false);
          }
        }
      });
    } else {
      video.src = src;
      video.load();
      video.play().catch(() => {});
    }
  }, [src, attemptRecovery]);

  // ── Seek bar interaction ───────────────────────────────────

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

      const onMove = (moveEvt: MouseEvent | TouchEvent) => {
        const clientX = 'touches' in moveEvt ? moveEvt.touches[0].clientX : moveEvt.clientX;
        const rect = bar.getBoundingClientRect();
        const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
        video.currentTime = ratio * duration;
        setCurrentTime(ratio * duration);
      };

      const onUp = () => {
        setIsSeeking(false);
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
        window.removeEventListener('touchmove', onMove);
        window.removeEventListener('touchend', onUp);
      };

      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
      window.addEventListener('touchmove', onMove, { passive: false });
      window.addEventListener('touchend', onUp);

      const rect = bar.getBoundingClientRect();
      const ratio = clamp((e.clientX - rect.left) / rect.width, 0, 1);
      video.currentTime = ratio * duration;
      setCurrentTime(ratio * duration);
    },
    [duration],
  );

  // ── Touch seek for mobile ─────────────────────────────────

  const handleSeekTouchStart = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsSeeking(true);

      const video = videoRef.current;
      const bar = seekBarRef.current;
      if (!video || !bar || !isFinite(duration) || duration === 0) return;

      const clientX = e.touches[0].clientX;
      const rect = bar.getBoundingClientRect();
      const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
      video.currentTime = ratio * duration;
      setCurrentTime(ratio * duration);
    },
    [duration],
  );

  // ── Click to play/pause, double-click fullscreen ───────────

  const handleVideoAreaClick = useCallback(() => {
    if (clickTimerRef.current) {
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

  const closeMenus = useCallback(() => {
    setShowSpeedMenu(false);
    setShowQualityMenu(false);
  }, []);

  // ── Progress percentage ────────────────────────────────────

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedPercent = duration > 0 ? (buffered / duration) * 100 : 0;
  const effectiveDuration = duration > 0
    ? duration
    : Math.max(...chapters.map((ch) => ch.endTime), ...events.map((ev) => ev.time), 1);

  // ── No source state ────────────────────────────────────────

  if (!src) {
    return (
      <div
        style={{
          aspectRatio: '16/9',
          backgroundColor: '#1A1A1A',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              margin: '0 auto 12px',
              borderRadius: '50%',
              backgroundColor: '#262626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LuPlay style={{ width: '32px', height: '32px', color: '#00CC33' }} />
          </div>
          <p style={{ color: '#A6A6A6', fontSize: '14px' }}>영상을 준비 중입니다</p>
        </div>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────

  const sortedEvents = [...events].sort((a, b) => a.time - b.time);

  return (
    <div style={{ display: 'flex', gap: showTimelinePanel && events.length > 0 ? '12px' : 0, alignItems: 'flex-start' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          aspectRatio: '16/9',
          backgroundColor: '#000',
          borderRadius: '8px',
          overflow: 'hidden',
          userSelect: 'none',
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={closeMenus}
      >
        {/* Video Element */}
        <video
          ref={videoRef}
          style={{ width: '100%', height: '100%', cursor: 'pointer' }}
          poster={poster}
          playsInline
          // Mobile: webkit-playsinline for older iOS
          {...({ 'webkit-playsinline': '' } as Record<string, string>)}
          onClick={handleVideoAreaClick}
          onTouchEnd={(e) => {
            // On mobile, show controls on tap
            e.stopPropagation();
            setShowControls(true);
            scheduleHide();
          }}
        />

        {/* Loading Spinner */}
        {isBuffering && !error && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            <LuLoaderCircle
              style={{
                width: '48px',
                height: '48px',
                color: 'white',
                animation: 'spin 1s linear infinite',
              }}
            />
          </div>
        )}

        {/* Error State with Retry */}
        {error && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0,0,0,0.8)',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              {isNetworkError ? (
                <LuWifiOff
                  style={{ width: '48px', height: '48px', color: '#FFD600', margin: '0 auto 8px' }}
                />
              ) : (
                <LuCircleAlert
                  style={{ width: '48px', height: '48px', color: '#f87171', margin: '0 auto 8px' }}
                />
              )}
              <p style={{ color: isNetworkError ? '#FFD600' : '#f87171', fontSize: '14px', marginBottom: '12px' }}>
                {error}
              </p>
              <button
                onClick={handleRetry}
                style={{
                  padding: '8px 20px',
                  backgroundColor: '#00CC33',
                  color: '#000',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                다시 시도
              </button>
            </div>
          </div>
        )}

        {/* Big center play button when paused */}
        {!isPlaying && !showControls && !error && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            onClick={togglePlayPause}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <LuPlay style={{ width: '32px', height: '32px', color: 'white', marginLeft: '4px' }} />
            </div>
          </div>
        )}

        {/* LIVE Badge */}
        {isLive && (
          <div style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 10 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#DC2626',
                color: 'white',
                fontSize: '12px',
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: '4px',
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  animation: 'pulse 2s ease-in-out infinite',
                }}
              />
              LIVE
            </span>
          </div>
        )}

        {/* Bottom Controls */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.5) 60%, transparent)',
            paddingTop: '48px',
            paddingBottom: '12px',
            paddingLeft: '16px',
            paddingRight: '16px',
            transition: 'opacity 300ms',
            opacity: showControls || isSeeking ? 1 : 0,
            pointerEvents: showControls || isSeeking ? 'auto' : 'none',
          }}
        >
          {/* Seek Bar */}
          <div
            ref={seekBarRef}
            style={{
              position: 'relative',
              width: '100%',
              height: '6px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: '9999px',
              cursor: 'pointer',
              marginBottom: '12px',
            }}
            onClick={handleSeekBarClick}
            onMouseDown={handleSeekMouseDown}
            onTouchStart={handleSeekTouchStart}
          >
            {/* Buffered */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                height: '100%',
                backgroundColor: 'rgba(255,255,255,0.3)',
                borderRadius: '9999px',
                width: `${bufferedPercent}%`,
              }}
            />
            {/* Progress */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                height: '100%',
                backgroundColor: '#00CC33',
                borderRadius: '9999px',
                width: `${progressPercent}%`,
              }}
            />
            {/* Thumb */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '14px',
                height: '14px',
                backgroundColor: '#00CC33',
                borderRadius: '50%',
                boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
                left: `calc(${progressPercent}% - 7px)`,
              }}
            />

            {/* Chapter dividers */}
            {chapters.map((ch) => {
              const pos = (ch.startTime / effectiveDuration) * 100;
              if (pos <= 0) return null;
              return (
                <div
                  key={ch.id}
                  style={{
                    position: 'absolute',
                    top: 0,
                    height: '100%',
                    width: '2px',
                    backgroundColor: 'rgba(255,255,255,0.7)',
                    zIndex: 10,
                    pointerEvents: 'none',
                    left: `${pos}%`,
                  }}
                />
              );
            })}

            {/* Event markers */}
            {events.map((evt) => {
              const pos = (evt.time / effectiveDuration) * 100;
              return (
                <div
                  key={evt.id}
                  title={evt.label}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    zIndex: 10,
                    pointerEvents: 'none',
                    left: `calc(${pos}% - 4px)`,
                    backgroundColor: EVENT_COLORS[evt.type],
                  }}
                />
              );
            })}
          </div>

          {/* Controls Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Play/Pause */}
            <button
              style={{
                padding: '6px',
                color: 'white',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
              }}
              onClick={(e) => { e.stopPropagation(); togglePlayPause(); }}
              aria-label={isPlaying ? '일시정지' : '재생'}
            >
              {isPlaying ? (
                <LuPause style={{ width: '20px', height: '20px' }} />
              ) : (
                <LuPlay style={{ width: '20px', height: '20px', marginLeft: '2px' }} />
              )}
            </button>

            {/* Time Display */}
            <span style={{ color: 'white', fontSize: '12px', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
              {isLive ? 'LIVE' : (
                <>
                  {formatTime(currentTime)}
                  <span style={{ color: 'rgba(255,255,255,0.5)', margin: '0 4px' }}>/</span>
                  {formatTime(duration)}
                </>
              )}
            </span>

            {/* Active Chapter */}
            {activeChapter && (
              <span style={{ color: '#00CC33', fontSize: '12px', fontWeight: 500, marginLeft: '4px', whiteSpace: 'nowrap' }}>
                {activeChapter.title}
              </span>
            )}

            {/* Timeline Panel Toggle */}
            {(events.length > 0 || chapters.length > 0) && (
              <button
                style={{
                  padding: '6px',
                  color: showTimelinePanel ? '#00CC33' : 'white',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                }}
                onClick={(e) => { e.stopPropagation(); setShowTimelinePanel((prev) => !prev); }}
                aria-label="타임라인"
              >
                <LuList style={{ width: '20px', height: '20px' }} />
              </button>
            )}

            {/* Spacer */}
            <div style={{ flex: 1 }} />

            {/* Volume */}
            <div
              style={{ position: 'relative', display: 'flex', alignItems: 'center' }}
              onMouseEnter={() => setShowVolumeSlider(true)}
              onMouseLeave={() => setShowVolumeSlider(false)}
            >
              {showVolumeSlider && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    marginBottom: '8px',
                    backgroundColor: '#1A1A1A',
                    border: '1px solid #4D4D4D',
                    borderRadius: '8px',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={isMuted ? 0 : volume}
                    onChange={(e) => changeVolume(Number(e.target.value))}
                    style={{
                      width: '6px',
                      height: '96px',
                      cursor: 'pointer',
                      writingMode: 'vertical-lr',
                      direction: 'rtl',
                      accentColor: '#00CC33',
                    }}
                  />
                </div>
              )}
              <button
                style={{
                  padding: '6px',
                  color: 'white',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                }}
                onClick={(e) => { e.stopPropagation(); toggleMute(); }}
                aria-label={isMuted ? '음소거 해제' : '음소거'}
              >
                {isMuted || volume === 0 ? (
                  <LuVolumeX style={{ width: '20px', height: '20px' }} />
                ) : (
                  <LuVolume2 style={{ width: '20px', height: '20px' }} />
                )}
              </button>
            </div>

            {/* Speed */}
            <div style={{ position: 'relative' }}>
              <button
                style={{
                  padding: '4px 8px',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: 500,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
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
                  style={{
                    position: 'absolute',
                    bottom: '100%',
                    right: 0,
                    marginBottom: '8px',
                    backgroundColor: '#1A1A1A',
                    border: '1px solid #4D4D4D',
                    borderRadius: '8px',
                    padding: '4px 0',
                    minWidth: '80px',
                    zIndex: 20,
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {SPEED_OPTIONS.map((s) => (
                    <button
                      key={s}
                      style={{
                        display: 'block',
                        width: '100%',
                        textAlign: 'left',
                        padding: '6px 16px',
                        fontSize: '12px',
                        color: s === speed ? '#00CC33' : 'white',
                        backgroundColor: s === speed ? 'rgba(0,204,51,0.1)' : 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                      onClick={() => changeSpeed(s)}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quality */}
            {qualityLevels.length > 0 && (
              <div style={{ position: 'relative' }}>
                <button
                  style={{
                    padding: '6px',
                    color: 'white',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowQualityMenu((prev) => !prev);
                    setShowSpeedMenu(false);
                  }}
                  aria-label="화질 설정"
                >
                  <LuSettings style={{ width: '18px', height: '18px' }} />
                </button>
                {showQualityMenu && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '100%',
                      right: 0,
                      marginBottom: '8px',
                      backgroundColor: '#1A1A1A',
                      border: '1px solid #4D4D4D',
                      borderRadius: '8px',
                      padding: '4px 0',
                      minWidth: '100px',
                      zIndex: 20,
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      style={{
                        display: 'block',
                        width: '100%',
                        textAlign: 'left',
                        padding: '6px 16px',
                        fontSize: '12px',
                        color: currentQuality === -1 ? '#00CC33' : 'white',
                        backgroundColor: currentQuality === -1 ? 'rgba(0,204,51,0.1)' : 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                      onClick={() => changeQuality(-1)}
                    >
                      Auto
                    </button>
                    {qualityLevels.map((level) => (
                      <button
                        key={level.index}
                        style={{
                          display: 'block',
                          width: '100%',
                          textAlign: 'left',
                          padding: '6px 16px',
                          fontSize: '12px',
                          color: currentQuality === level.index ? '#00CC33' : 'white',
                          backgroundColor: currentQuality === level.index ? 'rgba(0,204,51,0.1)' : 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                        onClick={() => changeQuality(level.index)}
                      >
                        {level.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Fullscreen */}
            <button
              style={{
                padding: '6px',
                color: 'white',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
              }}
              onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
              aria-label={isFullscreen ? '전체화면 종료' : '전체화면'}
            >
              {isFullscreen ? (
                <LuMinimize style={{ width: '20px', height: '20px' }} />
              ) : (
                <LuMaximize style={{ width: '20px', height: '20px' }} />
              )}
            </button>
          </div>
        </div>
      </div>

      </div>{/* end flex:1 video column */}

      {/* Side Panel */}
      {showTimelinePanel && (events.length > 0 || chapters.length > 0) && (
        <div
          style={{
            width: '280px',
            flexShrink: 0,
            backgroundColor: '#1A1A1A',
            border: '1px solid #333',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '500px',
            overflow: 'hidden',
          }}
        >
          {/* Panel header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderBottom: '1px solid #333', flexShrink: 0 }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'white' }}>하이라이트</span>
            {events.length > 0 && (
              <button
                onClick={() => {
                  if (isHighlightReel) {
                    setIsHighlightReel(false);
                    setReelIdx(0);
                  } else {
                    setReelIdx(0);
                    setIsHighlightReel(true);
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: isHighlightReel ? '#000' : '#00CC33',
                  backgroundColor: isHighlightReel ? '#00CC33' : 'rgba(0,204,51,0.15)',
                }}
              >
                {isHighlightReel ? '■ 중지' : '▶ 릴 재생'}
              </button>
            )}
          </div>

          {/* Panel body: scrollable */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {/* Chapters */}
            {chapters.length > 0 && (
              <div style={{ padding: '10px 0', borderBottom: events.length > 0 ? '1px solid #2A2A2A' : 'none' }}>
                <p style={{ fontSize: '10px', fontWeight: 700, color: '#606060', padding: '0 14px 6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>경기 구간</p>
                {chapters.map((ch) => {
                  const isActive = activeChapter?.id === ch.id;
                  return (
                    <button
                      key={ch.id}
                      onClick={() => seekTo(ch.startTime)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        width: '100%', textAlign: 'left', padding: '6px 14px',
                        border: 'none', cursor: 'pointer',
                        backgroundColor: isActive ? 'rgba(0,204,51,0.08)' : 'transparent',
                      }}
                    >
                      <span style={{ display: 'inline-block', padding: '1px 6px', borderRadius: '3px', fontSize: '9px', fontWeight: 700, color: 'white', flexShrink: 0, backgroundColor: CHAPTER_BADGE_COLORS[ch.type] }}>
                        {CHAPTER_LABELS[ch.type]}
                      </span>
                      <span style={{ fontSize: '11px', color: '#808080', fontFamily: 'monospace', flexShrink: 0 }}>{formatTime(ch.startTime)}</span>
                      <span style={{ fontSize: '13px', flex: 1, color: isActive ? '#00CC33' : '#A0A0A0', fontWeight: isActive ? 600 : 400, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{ch.title}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Events */}
            {events.length > 0 && (
              <div style={{ padding: '10px 0' }}>
                <p style={{ fontSize: '10px', fontWeight: 700, color: '#606060', padding: '0 14px 6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>이벤트</p>
                {sortedEvents.map((evt, i) => {
                  const isActive = isHighlightReel && reelIdx === i;
                  return (
                    <button
                      key={evt.id}
                      onClick={() => {
                        if (isHighlightReel) { setIsHighlightReel(false); setReelIdx(0); }
                        seekTo(evt.time);
                      }}
                      style={{
                        display: 'flex', alignItems: 'flex-start', gap: '8px',
                        width: '100%', textAlign: 'left', padding: '8px 14px',
                        border: 'none', cursor: 'pointer',
                        backgroundColor: isActive ? 'rgba(0,204,51,0.08)' : 'transparent',
                      }}
                    >
                      <span style={{ fontSize: '16px', flexShrink: 0, lineHeight: 1.2 }}>{EVENT_ICONS[evt.type]}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                          <span style={{ fontSize: '11px', color: '#808080', fontFamily: 'monospace', flexShrink: 0 }}>{formatTime(evt.time)}</span>
                          {evt.teamName && (
                            <span style={{ fontSize: '10px', color: '#606060', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{evt.teamName}</span>
                          )}
                        </div>
                        <p style={{ fontSize: '12px', color: isActive ? '#00CC33' : '#C0C0C0', fontWeight: isActive ? 600 : 400, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', margin: 0 }}>{evt.label}</p>
                        {evt.confidence != null && (
                          <div style={{ marginTop: '5px' }}>
                            <div style={{ height: '3px', borderRadius: '2px', backgroundColor: '#333', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${Math.round(evt.confidence * 100)}%`, backgroundColor: EVENT_COLORS[evt.type], borderRadius: '2px', transition: 'width 0.3s' }} />
                            </div>
                            <span style={{ fontSize: '9px', color: '#606060', marginTop: '2px', display: 'block' }}>{Math.round(evt.confidence * 100)}%</span>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* CSS animations */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
