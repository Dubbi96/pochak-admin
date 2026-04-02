import React from 'react';
import {Animated, Pressable, StyleSheet, View} from 'react-native';
import {Ionicons} from '@expo/vector-icons';

interface ClipInteractionOverlayProps {
  onPress: () => void;
  pauseIcon: 'pause' | 'play';
  pauseOpacity: Animated.Value;
  heartScale: Animated.Value;
  heartOpacity: Animated.Value;
  progress: number;
  children: React.ReactNode;
}

/**
 * Shared overlay that wraps a clip's video area and adds:
 * - Tap target for pause/like detection
 * - Pause/play indicator (centered, fading)
 * - Heart animation (centered, scaling + fading)
 * - Progress bar at the bottom
 */
export default function ClipInteractionOverlay({
  onPress,
  pauseIcon,
  pauseOpacity,
  heartScale,
  heartOpacity,
  progress,
  children,
}: ClipInteractionOverlayProps) {
  return (
    <View style={styles.wrapper}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onPress}>
        {children}
      </Pressable>

      {/* Pause / Play indicator */}
      <Animated.View
        style={[styles.pauseIndicator, {opacity: pauseOpacity}]}
        pointerEvents="none">
        <View style={styles.pauseCircle}>
          <Ionicons
            name={pauseIcon === 'pause' ? 'pause' : 'play'}
            size={32}
            color="#FFFFFF"
          />
        </View>
      </Animated.View>

      {/* Heart animation */}
      <Animated.View
        style={[
          styles.heartOverlay,
          {
            opacity: heartOpacity,
            transform: [{scale: heartScale}],
          },
        ]}
        pointerEvents="none">
        <Ionicons name="heart" size={80} color="#FF2D55" />
      </Animated.View>

      {/* Progress bar */}
      <View style={styles.progressBarContainer} pointerEvents="none">
        <View
          style={[styles.progressBarFill, {width: `${progress * 100}%`}]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    ...StyleSheet.absoluteFillObject,
  },
  pauseIndicator: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },
  pauseCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 4,
  },
  progressBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
    zIndex: 5,
  },
  progressBarFill: {
    height: 3,
    backgroundColor: '#00CC33',
  },
});
