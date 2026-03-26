import { useState, useRef, useCallback, useEffect } from 'react';
import {
  useSharedValue,
  withTiming,
  Easing,
  type SharedValue,
} from 'react-native-reanimated';
import { ANIMATION } from '../theme/animation';

/**
 * Player state that determines overlay auto-hide behaviour.
 * - playing: auto-hide after 3s
 * - paused: auto-hide after 5s
 * - seeking / buffering / error / completed / sheet: never auto-hide
 */
export type PlayerPhase =
  | 'playing'
  | 'paused'
  | 'seeking'
  | 'buffering'
  | 'error'
  | 'completed'
  | 'sheet';

export interface OverlayVisibility {
  /** Animated opacity 0..1 — drive `Animated.View` style */
  opacity: SharedValue<number>;
  /** Whether overlay is logically visible (for pointerEvents) — triggers re-render */
  visible: boolean;
  /** Toggle overlay (tap handler) */
  toggle: () => void;
  /** Force show (e.g. on seek start) */
  show: () => void;
  /** Force hide */
  hide: () => void;
  /** Reset auto-hide timer (e.g. after interaction) */
  resetAutoHide: () => void;
  /** Update player phase — controls auto-hide policy */
  setPhase: (phase: PlayerPhase) => void;
}

export function useOverlayVisibility(): OverlayVisibility {
  const opacity = useSharedValue(1); // start visible
  // Use STATE (not ref) so pointerEvents re-renders when visibility changes
  const [visible, setVisible] = useState(true);
  const visibleRef = useRef(true); // ref mirror for sync reads inside callbacks
  const phase = useRef<PlayerPhase>('paused');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  const setVisibleBoth = useCallback((v: boolean) => {
    visibleRef.current = v;
    setVisible(v);
  }, []);

  const scheduleHide = useCallback(() => {
    clearTimer();
    const p = phase.current;
    // These phases keep overlay pinned
    if (p === 'seeking' || p === 'buffering' || p === 'error' || p === 'completed' || p === 'sheet') {
      return;
    }
    const delay = p === 'playing' ? ANIMATION.AUTO_HIDE_PLAYING : ANIMATION.AUTO_HIDE_PAUSED;
    timer.current = setTimeout(() => {
      opacity.value = withTiming(0, {
        duration: ANIMATION.FADE_OUT,
        easing: Easing.out(Easing.ease),
      });
      setVisibleBoth(false);
    }, delay);
  }, [clearTimer, opacity, setVisibleBoth]);

  const show = useCallback(() => {
    clearTimer();
    opacity.value = withTiming(1, {
      duration: ANIMATION.FADE_IN,
      easing: Easing.out(Easing.ease),
    });
    setVisibleBoth(true);
    scheduleHide();
  }, [clearTimer, opacity, setVisibleBoth, scheduleHide]);

  const hide = useCallback(() => {
    clearTimer();
    opacity.value = withTiming(0, {
      duration: ANIMATION.FADE_OUT,
      easing: Easing.out(Easing.ease),
    });
    setVisibleBoth(false);
  }, [clearTimer, opacity, setVisibleBoth]);

  const toggle = useCallback(() => {
    if (visibleRef.current) {
      // Quick-hide on re-tap
      clearTimer();
      opacity.value = withTiming(0, {
        duration: ANIMATION.QUICK_HIDE,
        easing: Easing.out(Easing.ease),
      });
      setVisibleBoth(false);
    } else {
      show();
    }
  }, [clearTimer, opacity, setVisibleBoth, show]);

  const resetAutoHide = useCallback(() => {
    if (visibleRef.current) {
      scheduleHide();
    }
  }, [scheduleHide]);

  const setPhase = useCallback(
    (p: PlayerPhase) => {
      phase.current = p;
      if (visibleRef.current) {
        scheduleHide();
      }
      // Auto-show on certain state changes
      if (p === 'buffering' || p === 'error' || p === 'completed') {
        show();
      }
    },
    [scheduleHide, show],
  );

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  return {
    opacity,
    visible,
    toggle,
    show,
    hide,
    resetAutoHide,
    setPhase,
  };
}
