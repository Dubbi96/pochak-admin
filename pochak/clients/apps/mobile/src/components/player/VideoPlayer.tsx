import React, {useState, useRef, useCallback, useEffect, useImperativeHandle, forwardRef} from 'react';
import {View, Pressable, StyleSheet} from 'react-native';
import Animated, {useAnimatedStyle} from 'react-native-reanimated';
import {useVideoPlayer, VideoView} from 'expo-video';

import {useOverlayVisibility} from '../../hooks/useOverlayVisibility';
import type {PlayerPhase} from '../../hooks/useOverlayVisibility';
import ControlOverlay from './ControlOverlay';
import type {TimelineEvent, Chapter} from './ControlOverlay';
import SpeedSheet from './SpeedSheet';
import MoreOptionsSheet from './MoreOptionsSheet';
import TimelineEventsSheet from './TimelineEventsSheet';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface VideoPlayerProps {
  /** HLS/MP4 stream URL */
  source: string;
  /** Content title */
  title: string;
  /** Whether this is a live stream */
  isLive: boolean;
  /** Timeline events for markers */
  events?: TimelineEvent[];
  /** Chapters for dividers */
  chapters?: Chapter[];
  /** Whether fullscreen */
  isFullscreen: boolean;
  /** Callbacks */
  onBack: () => void;
  onFullscreenToggle: () => void;
  /** Fired on time update (~250ms interval) */
  onTimeUpdate?: (seconds: number) => void;
  /** Fired when duration becomes known */
  onDurationChange?: (seconds: number) => void;
  /** Fired when playback completes */
  onComplete?: () => void;
  /** Fired when clip (scissors) button pressed */
  onClipPress?: () => void;
  /** Fired when PIP button pressed */
  onPipPress?: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function clamp(value: number, min: number, max: number): number {
  'worklet';
  return Math.min(Math.max(value, min), max);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export interface VideoPlayerHandle {
  seekTo: (seconds: number) => void;
}

const VideoPlayer = forwardRef<VideoPlayerHandle, VideoPlayerProps>(({
  source,
  title,
  isLive,
  events = [],
  chapters = [],
  isFullscreen,
  onBack,
  onFullscreenToggle,
  onTimeUpdate,
  onDurationChange,
  onComplete,
  onClipPress,
  onPipPress,
}, ref) => {
  // ---- Overlay visibility ----
  const overlay = useOverlayVisibility();

  const overlayAnimatedStyle = useAnimatedStyle(() => ({
    opacity: overlay.opacity.value,
  }));

  // ---- Player state ----
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [buffered, setBuffered] = useState(0); // TODO: expo-video does not expose buffered position — use 0 fallback
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [currentSpeed, setCurrentSpeed] = useState(1);
  const [isSeeking, setIsSeeking] = useState(false);

  // Track whether playback has started at least once (to detect completion).
  const hasStartedRef = useRef(false);

  // ---- Sheet visibility ----
  const [showSpeedSheet, setShowSpeedSheet] = useState(false);
  const [showMoreSheet, setShowMoreSheet] = useState(false);
  const [showTimelineSheet, setShowTimelineSheet] = useState(false);

  // Store previous phase before opening a sheet so we can restore it.
  const phaseBeforeSheetRef = useRef<PlayerPhase>('paused');

  // ---- expo-video player ----
  const player = useVideoPlayer(source, (p) => {
    p.loop = false;
    p.play();
  });

  // ---- Event subscriptions ----
  useEffect(() => {
    if (!player) return;

    const statusSub = player.addListener('statusChange', (payload: any) => {
      const status = payload?.status ?? payload;

      switch (status) {
        case 'readyToPlay': {
          const d = player.duration;
          if (d != null && d > 0) {
            setDuration((prev) => {
              if (prev === 0) onDurationChange?.(d);
              return d;
            });
          }
          setIsBuffering(false);
          setHasError(false);
          setErrorMessage(undefined);
          break;
        }
        case 'loading': {
          setIsBuffering(true);
          break;
        }
        case 'idle': {
          // idle after playback started means completed
          if (hasStartedRef.current) {
            setIsCompleted(true);
            setIsPlaying(false);
            onComplete?.();
          }
          setIsBuffering(false);
          break;
        }
        case 'error': {
          setHasError(true);
          setErrorMessage(
            typeof payload?.error === 'string'
              ? payload.error
              : '재생 중 오류가 발생했습니다',
          );
          setIsBuffering(false);
          setIsPlaying(false);
          break;
        }
        default:
          break;
      }
    });

    const playingChangeSub = player.addListener(
      'playingChange',
      (payload: any) => {
        const playing =
          typeof payload === 'boolean' ? payload : payload?.isPlaying ?? false;
        setIsPlaying(playing);
        if (playing) {
          hasStartedRef.current = true;
          setIsCompleted(false);
        }
      },
    );

    const timeUpdateSub = player.addListener(
      'timeUpdate',
      (payload: any) => {
        const time =
          typeof payload === 'number'
            ? payload
            : payload?.currentTime ?? payload?.time ?? 0;
        setCurrentTime(time);
        onTimeUpdate?.(time);

        // Opportunistically update duration if the player now knows it.
        const d = player.duration;
        if (d != null && d > 0) {
          setDuration((prev) => (prev === 0 ? d : prev));
        }

        // TODO: expo-video ~2.0 does not expose bufferedPosition.
        // If a future version adds it, update `setBuffered` here.
      },
    );

    return () => {
      statusSub.remove();
      playingChangeSub.remove();
      timeUpdateSub.remove();
    };
  }, [player]);

  // ---- Phase synchronisation with overlay ----
  useEffect(() => {
    if (isSeeking) {
      overlay.setPhase('seeking');
      return;
    }
    if (hasError) {
      overlay.setPhase('error');
      return;
    }
    if (isCompleted) {
      overlay.setPhase('completed');
      return;
    }
    if (isBuffering) {
      overlay.setPhase('buffering');
      return;
    }
    if (isPlaying) {
      overlay.setPhase('playing');
    } else {
      overlay.setPhase('paused');
    }
  }, [isSeeking, hasError, isCompleted, isBuffering, isPlaying, overlay]);

  // ---- Callbacks ----

  const handlePlayPause = useCallback(() => {
    if (!player) return;
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
    overlay.resetAutoHide();
  }, [player, isPlaying, overlay]);

  const handleSeekTo = useCallback(
    (seconds: number) => {
      if (!player) return;
      const clamped = clamp(seconds, 0, duration);
      player.currentTime = clamped;
      setCurrentTime(clamped);
    },
    [player, duration],
  );

  // Expose seekTo to parent via ref
  useImperativeHandle(ref, () => ({
    seekTo: (seconds: number) => {
      handleSeekTo(seconds);
    },
  }), [handleSeekTo]);

  const handleSeekBy = useCallback(
    (delta: number) => {
      if (!player) return;
      const target = clamp(currentTime + delta, 0, duration);
      player.currentTime = target;
      setCurrentTime(target);
    },
    [player, currentTime, duration],
  );

  const handleReplay = useCallback(() => {
    if (!player) return;
    player.currentTime = 0;
    setCurrentTime(0);
    setIsCompleted(false);
    player.play();
  }, [player]);

  const handleRetry = useCallback(() => {
    if (!player) return;
    setHasError(false);
    setErrorMessage(undefined);
    setIsCompleted(false);
    hasStartedRef.current = false;
    // Replace the source to force a reload.
    player.replace(source);
  }, [player, source]);

  const handleSeekingChange = useCallback(
    (seeking: boolean) => {
      setIsSeeking(seeking);
      if (seeking) {
        overlay.show();
      } else {
        overlay.resetAutoHide();
      }
    },
    [overlay],
  );

  // ---- Speed ----

  const handleSpeedSelect = useCallback(
    (speed: number) => {
      setCurrentSpeed(speed);
      if (player) {
        player.playbackRate = speed;
      }
    },
    [player],
  );

  // ---- Sheet open / close helpers ----

  const currentPhaseRef = useRef<PlayerPhase>('paused');
  useEffect(() => {
    // Keep a ref of the current "real" phase for sheet restore.
    if (isSeeking) {
      currentPhaseRef.current = 'seeking';
    } else if (hasError) {
      currentPhaseRef.current = 'error';
    } else if (isCompleted) {
      currentPhaseRef.current = 'completed';
    } else if (isBuffering) {
      currentPhaseRef.current = 'buffering';
    } else if (isPlaying) {
      currentPhaseRef.current = 'playing';
    } else {
      currentPhaseRef.current = 'paused';
    }
  }, [isSeeking, hasError, isCompleted, isBuffering, isPlaying]);

  const openSheet = useCallback(
    (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
      phaseBeforeSheetRef.current = currentPhaseRef.current;
      overlay.setPhase('sheet');
      setter(true);
    },
    [overlay],
  );

  const closeSheet = useCallback(
    (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
      setter(false);
      // Restore the phase that was active before the sheet opened.
      overlay.setPhase(phaseBeforeSheetRef.current);
    },
    [overlay],
  );

  const handleSpeedPress = useCallback(() => {
    openSheet(setShowSpeedSheet);
  }, [openSheet]);

  const handleMorePress = useCallback(() => {
    openSheet(setShowMoreSheet);
  }, [openSheet]);

  const handleTimelinePress = useCallback(() => {
    openSheet(setShowTimelineSheet);
  }, [openSheet]);

  // ---- Overlay toggle (tap on video area) ----

  const handleOverlayTap = useCallback(() => {
    overlay.toggle();
  }, [overlay]);

  // ---- Render ----

  return (
    <View style={styles.container}>
      {/* Video surface */}
      <VideoView
        player={player}
        style={styles.video}
        contentFit="contain"
        nativeControls={false}
      />

      {/* Background tap catcher — always active, toggles overlay */}
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={handleOverlayTap}
      />

      {/* Overlay layer — box-none so children (buttons) receive taps but
          empty space falls through to the Pressable above */}
      <Animated.View
        style={[StyleSheet.absoluteFill, overlayAnimatedStyle]}
        pointerEvents={overlay.visible ? 'box-none' : 'none'}>
        <ControlOverlay
          currentTime={currentTime}
          duration={duration}
          buffered={buffered}
          isPlaying={isPlaying}
          isBuffering={isBuffering}
          isCompleted={isCompleted}
          hasError={hasError}
          errorMessage={errorMessage}
          isLive={isLive}
          title={title}
          events={events}
          chapters={chapters}
          currentSpeed={currentSpeed}
          onPlayPause={handlePlayPause}
          onSeekTo={handleSeekTo}
          onSeekBy={handleSeekBy}
          onReplay={handleReplay}
          onRetry={handleRetry}
          onBack={onBack}
          onFullscreenToggle={onFullscreenToggle}
          onSpeedPress={handleSpeedPress}
          onMorePress={handleMorePress}
          onTimelinePress={handleTimelinePress}
          onResetAutoHide={overlay.resetAutoHide}
          onSeekingChange={handleSeekingChange}
          onClipPress={onClipPress}
          onPipPress={onPipPress}
          isFullscreen={isFullscreen}
        />
      </Animated.View>

      {/* Bottom sheets */}
      <SpeedSheet
        visible={showSpeedSheet}
        currentSpeed={currentSpeed}
        onSelect={handleSpeedSelect}
        onClose={() => closeSheet(setShowSpeedSheet)}
      />

      <MoreOptionsSheet
        visible={showMoreSheet}
        currentSpeed={currentSpeed}
        currentCameraViewId=""
        onSpeedChange={handleSpeedSelect}
        onCameraViewChange={() => {
          // TODO: Camera view switching not yet implemented
        }}
        onClipCreate={() => {
          // TODO: Clip creation not yet implemented
          closeSheet(setShowMoreSheet);
        }}
        onTimeline={() => {
          closeSheet(setShowMoreSheet);
          // Small delay so the closing modal animation completes first.
          setTimeout(() => openSheet(setShowTimelineSheet), 300);
        }}
        onClose={() => closeSheet(setShowMoreSheet)}
      />

      <TimelineEventsSheet
        visible={showTimelineSheet}
        events={events}
        chapters={chapters}
        onSeekTo={(ts) => {
          handleSeekTo(ts);
          closeSheet(setShowTimelineSheet);
        }}
        onClose={() => closeSheet(setShowTimelineSheet)}
      />

      {/* Mini progress bar — always visible when overlay is hidden */}
      {!overlay.visible && duration > 0 && (
        <View style={styles.miniProgressTrack} pointerEvents="none">
          <View
            style={[
              styles.miniProgressFill,
              {width: `${(currentTime / duration) * 100}%`},
            ]}
          />
        </View>
      )}
    </View>
  );
});

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  video: {
    flex: 1,
  },
  miniProgressTrack: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  miniProgressFill: {
    height: 3,
    backgroundColor: '#00CC33',
  },
});

export default VideoPlayer;
