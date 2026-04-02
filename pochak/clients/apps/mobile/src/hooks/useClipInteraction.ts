import {useRef, useState, useCallback, useEffect} from 'react';
import {Animated} from 'react-native';
import type {VideoPlayer} from 'expo-video';

/**
 * Shared hook for clip interaction features:
 * - Single tap to pause/resume with indicator overlay
 * - Double tap to like with heart animation
 * - Progress bar tracking
 */
export function useClipInteraction({
  player,
  isActive,
  isLiked,
  onLike,
}: {
  player: VideoPlayer;
  isActive: boolean;
  isLiked: boolean;
  onLike: () => void;
}) {
  // --- Pause / Play indicator ---
  const [pauseIcon, setPauseIcon] = useState<'pause' | 'play'>('pause');
  const pauseOpacity = useRef(new Animated.Value(0)).current;
  const [isManuallyPaused, setIsManuallyPaused] = useState(false);

  // --- Heart animation ---
  const heartScale = useRef(new Animated.Value(0)).current;
  const heartOpacity = useRef(new Animated.Value(0)).current;

  // --- Progress bar ---
  const [progress, setProgress] = useState(0);
  const durationRef = useRef(0);

  // --- Tap detection ---
  const lastTapRef = useRef(0);
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Track duration from status changes
  useEffect(() => {
    const sub = player.addListener(
      'statusChange' as never,
      ((e: {status: string; duration?: number}) => {
        if (e.duration != null && e.duration > 0) {
          durationRef.current = e.duration;
        }
      }) as never,
    );
    return () => sub.remove();
  }, [player]);

  // Track time updates for progress bar
  useEffect(() => {
    const sub = player.addListener(
      'timeUpdate' as never,
      ((e: {currentTime: number}) => {
        const current = e.currentTime ?? 0;
        if (durationRef.current > 0) {
          setProgress(current / durationRef.current);
        }
      }) as never,
    );
    return () => sub.remove();
  }, [player]);

  // Reset manual pause when clip becomes inactive
  useEffect(() => {
    if (!isActive) {
      setIsManuallyPaused(false);
    }
  }, [isActive]);

  const showPauseIndicator = useCallback(
    (icon: 'pause' | 'play') => {
      setPauseIcon(icon);
      pauseOpacity.setValue(1);
      Animated.sequence([
        Animated.delay(icon === 'pause' ? 300 : 100),
        Animated.timing(pauseOpacity, {
          toValue: 0,
          duration: icon === 'pause' ? 300 : 300,
          useNativeDriver: true,
        }),
      ]).start();
    },
    [pauseOpacity],
  );

  const showHeartAnimation = useCallback(() => {
    heartScale.setValue(0);
    heartOpacity.setValue(1);
    Animated.parallel([
      Animated.sequence([
        Animated.spring(heartScale, {
          toValue: 1.2,
          useNativeDriver: true,
          speed: 20,
        }),
        Animated.spring(heartScale, {
          toValue: 1,
          useNativeDriver: true,
          speed: 20,
        }),
      ]),
      Animated.sequence([
        Animated.delay(600),
        Animated.timing(heartOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [heartScale, heartOpacity]);

  const handleSingleTap = useCallback(() => {
    if (isManuallyPaused) {
      player.play();
      setIsManuallyPaused(false);
      showPauseIndicator('play');
    } else {
      player.pause();
      setIsManuallyPaused(true);
      showPauseIndicator('pause');
    }
  }, [isManuallyPaused, player, showPauseIndicator]);

  const handleDoubleTap = useCallback(() => {
    // Only like, never unlike (Instagram behavior)
    if (!isLiked) {
      onLike();
    }
    showHeartAnimation();
  }, [isLiked, onLike, showHeartAnimation]);

  const handleVideoPress = useCallback(() => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      // Double tap — cancel single tap timer
      if (tapTimerRef.current) {
        clearTimeout(tapTimerRef.current);
        tapTimerRef.current = null;
      }
      handleDoubleTap();
    } else {
      // Potential single tap — wait 300ms to confirm
      tapTimerRef.current = setTimeout(() => {
        handleSingleTap();
        tapTimerRef.current = null;
      }, 300);
    }
    lastTapRef.current = now;
  }, [handleSingleTap, handleDoubleTap]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (tapTimerRef.current) {
        clearTimeout(tapTimerRef.current);
      }
    };
  }, []);

  return {
    // Tap handler
    handleVideoPress,
    // Pause indicator
    pauseIcon,
    pauseOpacity,
    // Heart animation
    heartScale,
    heartOpacity,
    // Progress
    progress,
    // Manual pause state (for auto-play logic)
    isManuallyPaused,
  };
}
