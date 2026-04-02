import { useState, useCallback, useEffect, useRef } from 'react';
import * as ScreenOrientation from 'expo-screen-orientation';
import { StatusBar } from 'react-native';

export interface FullscreenState {
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  enterFullscreen: () => void;
  exitFullscreen: () => void;
}

export function useFullscreen(): FullscreenState {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isLockingRef = useRef(false);

  const enterFullscreen = useCallback(async () => {
    if (isLockingRef.current) return;
    isLockingRef.current = true;
    try {
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.LANDSCAPE,
      );
      StatusBar.setHidden(true, 'fade');
      setIsFullscreen(true);
    } finally {
      isLockingRef.current = false;
    }
  }, []);

  const exitFullscreen = useCallback(async () => {
    if (isLockingRef.current) return;
    isLockingRef.current = true;
    try {
      // Unlock to allow all orientations, then lock portrait
      // This ensures physical rotation is detected again after exiting
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP,
      );
      StatusBar.setHidden(false, 'fade');
      setIsFullscreen(false);
      // After a short delay, unlock so physical rotation can trigger again
      setTimeout(async () => {
        try {
          await ScreenOrientation.unlockAsync();
        } catch {}
      }, 300);
    } finally {
      isLockingRef.current = false;
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (isFullscreen) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  }, [isFullscreen, enterFullscreen, exitFullscreen]);

  // On mount: unlock orientation so physical rotation is detected
  useEffect(() => {
    ScreenOrientation.unlockAsync().catch(() => {});

    return () => {
      // Cleanup: restore portrait lock on unmount
      ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP,
      ).catch(() => {});
      StatusBar.setHidden(false, 'fade');
    };
  }, []);

  // Listen to physical rotation
  useEffect(() => {
    const sub = ScreenOrientation.addOrientationChangeListener((event) => {
      if (isLockingRef.current) return;
      const o = event.orientationInfo.orientation;
      if (
        o === ScreenOrientation.Orientation.LANDSCAPE_LEFT ||
        o === ScreenOrientation.Orientation.LANDSCAPE_RIGHT
      ) {
        setIsFullscreen(true);
        StatusBar.setHidden(true, 'fade');
      } else if (
        o === ScreenOrientation.Orientation.PORTRAIT_UP ||
        o === ScreenOrientation.Orientation.PORTRAIT_DOWN
      ) {
        setIsFullscreen(false);
        StatusBar.setHidden(false, 'fade');
      }
    });

    return () => {
      ScreenOrientation.removeOrientationChangeListener(sub);
    };
  }, []);

  return { isFullscreen, toggleFullscreen, enterFullscreen, exitFullscreen };
}
