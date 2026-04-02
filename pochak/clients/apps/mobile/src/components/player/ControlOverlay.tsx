import React, {useState, useRef, useCallback, useMemo, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  PanResponder,
  Dimensions,
  type GestureResponderEvent,
  type LayoutChangeEvent,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import {MaterialIcons, Ionicons} from '@expo/vector-icons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {colors} from '../../theme';

// ---------------------------------------------------------------------------
// Exported types
// ---------------------------------------------------------------------------

export interface TimelineEvent {
  id: string;
  time: number;
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

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ControlOverlayProps {
  currentTime: number;
  duration: number;
  buffered: number;
  isPlaying: boolean;
  isBuffering: boolean;
  isCompleted: boolean;
  hasError: boolean;
  errorMessage?: string;
  isLive: boolean;
  title: string;
  events: TimelineEvent[];
  chapters: Chapter[];
  currentSpeed: number;
  onPlayPause: () => void;
  onSeekTo: (seconds: number) => void;
  onSeekBy: (delta: number) => void;
  onReplay: () => void;
  onRetry: () => void;
  onBack: () => void;
  onFullscreenToggle: () => void;
  onSpeedPress: () => void;
  onMorePress: () => void;
  onTimelinePress: () => void;
  onResetAutoHide: () => void;
  onSeekingChange: (isSeeking: boolean) => void;
  onClipPress?: () => void;
  onPipPress?: () => void;
  isFullscreen: boolean;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const EVENT_TYPE_COLORS: Record<TimelineEvent['type'], string> = {
  GOAL: '#4CAF50',
  FOUL: '#FFD600',
  SUBSTITUTION: '#2196F3',
  HIGHLIGHT: '#FFFFFF',
  PERIOD: '#FF9800',
  CUSTOM: '#CE93D8',
};

const CENTER_BTN_SIZE = 52;
const CENTER_BTN_PLAY = 64;
const THUMB_SIZE = 12;
const BAR_HEIGHT = 3;
const HIT_SLOP_VERTICAL = 40;
const DOUBLE_TAP_WINDOW = 600;
const SEEK_STEP = 10;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function clamp(v: number, min: number, max: number): number {
  'worklet';
  return Math.min(Math.max(v, min), max);
}

function isValidDuration(d: number): boolean {
  return Number.isFinite(d) && d > 0;
}

function formatTime(t: number, forceH = false): string {
  const sign = t < 0 ? '-' : '';
  const abs = Math.abs(Math.floor(t));
  const h = Math.floor(abs / 3600);
  const m = Math.floor((abs % 3600) / 60);
  const s = abs % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return h > 0 || forceH
    ? `${sign}${h}:${pad(m)}:${pad(s)}`
    : `${sign}${pad(m)}:${pad(s)}`;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Circular center button (YouTube style) */
const CenterBtn: React.FC<{
  icon: string;
  size?: number;
  onPress: () => void;
  disabled?: boolean;
}> = ({icon, size = 32, onPress, disabled}) => (
  <TouchableOpacity
    style={[styles.centerBtn, disabled && {opacity: 0.4}]}
    onPress={onPress}
    disabled={disabled}
    activeOpacity={0.7}
    hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
    <MaterialIcons name={icon as any} size={size} color={colors.white} />
  </TouchableOpacity>
);

/** Seek indicator overlay ("+10초") */
const SeekIndicator: React.FC<{
  amount: number;
  side: 'left' | 'right';
  opacity: Animated.SharedValue<number>;
}> = ({amount, side, opacity}) => {
  const aStyle = useAnimatedStyle(() => ({opacity: opacity.value}));
  if (amount === 0) return null;
  return (
    <Animated.View
      style={[
        styles.seekIndicator,
        side === 'left' ? styles.seekIndicatorLeft : styles.seekIndicatorRight,
        aStyle,
      ]}
      pointerEvents="none">
      <MaterialIcons
        name={side === 'left' ? 'replay-10' : 'forward-10'}
        size={36}
        color={colors.white}
      />
      <Text style={styles.seekIndicatorText}>
        {amount > 0 ? `${amount}초` : `${Math.abs(amount)}초`}
      </Text>
    </Animated.View>
  );
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const ControlOverlay: React.FC<ControlOverlayProps> = (props) => {
  const {
    currentTime, duration, buffered,
    isPlaying, isBuffering, isCompleted, hasError, errorMessage, isLive,
    title, events, chapters, currentSpeed,
    onPlayPause, onSeekTo, onSeekBy, onReplay, onRetry,
    onBack, onFullscreenToggle, onSpeedPress, onMorePress, onTimelinePress,
    onResetAutoHide, onSeekingChange, onClipPress, onPipPress, isFullscreen,
  } = props;

  const insets = useSafeAreaInsets();

  // ---- State ----
  const [showRemaining, setShowRemaining] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekPreviewTime, setSeekPreviewTime] = useState(0);
  const [barWidth, setBarWidth] = useState(0);

  // Double-tap
  const [leftSeekAmt, setLeftSeekAmt] = useState(0);
  const [rightSeekAmt, setRightSeekAmt] = useState(0);
  const leftOpacity = useSharedValue(0);
  const rightOpacity = useSharedValue(0);
  const leftTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rightTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const leftAcc = useRef(0);
  const rightAcc = useRef(0);

  // ---- Derived ----
  const valid = isValidDuration(duration);
  const progress = valid ? clamp(currentTime / duration, 0, 1) : 0;
  const buffProg = valid ? clamp(buffered / duration, 0, 1) : 0;
  const seekProg = valid ? clamp(seekPreviewTime / duration, 0, 1) : 0;
  const displayProg = isSeeking ? seekProg : progress;

  const activeChapter = useMemo(() => {
    const t = isSeeking ? seekPreviewTime : currentTime;
    return chapters.find(ch => t >= ch.startTime && t < ch.endTime) ?? null;
  }, [chapters, currentTime, seekPreviewTime, isSeeking]);

  // ---- Seek bar layout ----
  const barRef = useRef<View>(null);
  const barPageX = useRef(0);

  const onBarLayout = useCallback((e: LayoutChangeEvent) => {
    setBarWidth(e.nativeEvent.layout.width);
  }, []);

  useEffect(() => {
    if (barRef.current && barWidth > 0) {
      barRef.current.measure((_x, _y, _w, _h, px) => {
        if (px != null) barPageX.current = px;
      });
    }
  }, [barWidth, isFullscreen]);

  // ---- PanResponder ----
  const panResponder = useMemo(() => {
    const toTime = (px: number) => {
      if (!valid || barWidth === 0) return 0;
      return clamp((px - barPageX.current) / barWidth, 0, 1) * duration;
    };
    return PanResponder.create({
      onStartShouldSetPanResponder: () => valid,
      onMoveShouldSetPanResponder: () => valid,
      onPanResponderGrant: (e) => {
        setIsSeeking(true);
        onSeekingChange(true);
        onResetAutoHide();
        setSeekPreviewTime(toTime(e.nativeEvent.pageX));
      },
      onPanResponderMove: (e) => {
        onResetAutoHide();
        setSeekPreviewTime(toTime(e.nativeEvent.pageX));
      },
      onPanResponderRelease: (e) => {
        onSeekTo(clamp(toTime(e.nativeEvent.pageX), 0, duration));
        setIsSeeking(false);
        onSeekingChange(false);
      },
      onPanResponderTerminate: () => {
        setIsSeeking(false);
        onSeekingChange(false);
      },
    });
  }, [valid, barWidth, duration, onSeekTo, onSeekingChange, onResetAutoHide]);

  // ---- Double-tap zones ----
  const handleZoneTap = useCallback(
    (evt: GestureResponderEvent) => {
      onResetAutoHide();
      const x = evt.nativeEvent.locationX;
      const w = Dimensions.get('window').width;
      if (x < w * 0.35) {
        leftAcc.current -= SEEK_STEP;
        setLeftSeekAmt(leftAcc.current);
        leftOpacity.value = 1;
        onSeekBy(-SEEK_STEP);
        if (leftTimer.current) clearTimeout(leftTimer.current);
        leftTimer.current = setTimeout(() => {
          leftOpacity.value = withTiming(0, {duration: 300});
          leftAcc.current = 0;
          setLeftSeekAmt(0);
        }, DOUBLE_TAP_WINDOW);
      } else if (x > w * 0.65) {
        rightAcc.current += SEEK_STEP;
        setRightSeekAmt(rightAcc.current);
        rightOpacity.value = 1;
        onSeekBy(SEEK_STEP);
        if (rightTimer.current) clearTimeout(rightTimer.current);
        rightTimer.current = setTimeout(() => {
          rightOpacity.value = withTiming(0, {duration: 300});
          rightAcc.current = 0;
          setRightSeekAmt(0);
        }, DOUBLE_TAP_WINDOW);
      }
    },
    [onSeekBy, onResetAutoHide, leftOpacity, rightOpacity],
  );

  useEffect(() => () => {
    if (leftTimer.current) clearTimeout(leftTimer.current);
    if (rightTimer.current) clearTimeout(rightTimer.current);
  }, []);

  // ---- Time strings ----
  const forceH = duration >= 3600;
  const timeStr = valid
    ? showRemaining
      ? `${formatTime(currentTime, forceH)} / ${formatTime(-(duration - currentTime), forceH)}`
      : `${formatTime(currentTime, forceH)} / ${formatTime(duration, forceH)}`
    : formatTime(currentTime);

  // ---- Render ----

  const renderCenter = () => {
    if (hasError) {
      return (
        <View style={styles.centerRow} pointerEvents="box-none">
          <View style={styles.errorContainer}>
            <MaterialIcons name="error-outline" size={44} color={colors.error} />
            <Text style={styles.errorText}>
              {errorMessage || '재생 중 오류가 발생했습니다'}
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={onRetry} activeOpacity={0.7}>
              <MaterialIcons name="refresh" size={20} color={colors.white} />
              <Text style={styles.retryBtnText}>다시 시도</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    if (isBuffering) {
      return (
        <View style={styles.centerRow} pointerEvents="box-none">
          <ActivityIndicator size={44} color={colors.white} />
        </View>
      );
    }
    if (isCompleted) {
      return (
        <View style={styles.centerRow} pointerEvents="box-none">
          <CenterBtn icon="replay" size={36} onPress={onReplay} />
        </View>
      );
    }
    // YouTube-style 3 buttons: skip-back, play/pause, skip-forward
    return (
      <View style={styles.centerRow} pointerEvents="box-none">
        <CenterBtn
          icon="replay-10"
          size={28}
          onPress={() => { onSeekBy(-10); onResetAutoHide(); }}
        />
        <TouchableOpacity
          style={styles.centerBtnPlay}
          onPress={() => { onPlayPause(); onResetAutoHide(); }}
          activeOpacity={0.7}>
          <MaterialIcons
            name={isPlaying ? 'pause' : 'play-arrow'}
            size={40}
            color={colors.white}
          />
        </TouchableOpacity>
        <CenterBtn
          icon="forward-10"
          size={28}
          onPress={() => { onSeekBy(10); onResetAutoHide(); }}
        />
      </View>
    );
  };

  const renderSeekBar = () => {
    const thumbLeft = displayProg * barWidth - THUMB_SIZE / 2;
    return (
      <View style={styles.seekBarWrap}>
        {/* Tooltip */}
        {isSeeking && valid && (
          <View style={[styles.seekTooltip, {left: clamp(seekProg * barWidth - 28, 0, barWidth - 56)}]}>
            <Text style={styles.seekTooltipText}>{formatTime(seekPreviewTime, forceH)}</Text>
          </View>
        )}
        <View
          ref={barRef}
          style={styles.seekBarHit}
          onLayout={onBarLayout}
          {...panResponder.panHandlers}>
          <View style={styles.barTrack} />
          <View style={[styles.barBuf, {width: `${buffProg * 100}%`}]} />
          <View style={[styles.barPlayed, {width: `${displayProg * 100}%`}]} />
          {/* Chapter dividers */}
          {valid && chapters.map(ch => {
            const pos = ch.startTime / duration;
            if (pos <= 0 || pos >= 1) return null;
            return <View key={`c-${ch.id}`} style={[styles.chDiv, {left: `${pos * 100}%`}]} />;
          })}
          {/* Event markers */}
          {valid && events.map(ev => {
            const pos = ev.time / duration;
            if (pos < 0 || pos > 1) return null;
            return (
              <TouchableOpacity
                key={`e-${ev.id}`}
                style={[styles.evMarker, {left: `${pos * 100}%`, backgroundColor: EVENT_TYPE_COLORS[ev.type] ?? colors.white}]}
                onPress={() => { onResetAutoHide(); onSeekTo(clamp(ev.time, 0, duration)); }}
                hitSlop={{top: 12, bottom: 12, left: 6, right: 6}}
                activeOpacity={0.7}
              />
            );
          })}
          {/* Thumb */}
          {valid && (
            <View style={[styles.thumb, {left: clamp(thumbLeft, -THUMB_SIZE / 2, barWidth - THUMB_SIZE / 2)}]} />
          )}
        </View>
      </View>
    );
  };

  const topPad = isFullscreen ? (insets.left || 16) : (insets.top || 8);
  const bottomPad = isFullscreen ? (insets.right || 16) : (insets.bottom || 8);
  const sidePad = isFullscreen ? 24 : 12;

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      {/* Double-tap zones */}
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        <View style={styles.dtRow} pointerEvents="box-none">
          <TouchableOpacity style={styles.dtLeft} activeOpacity={1} onPress={handleZoneTap} />
          <View style={styles.dtCenter} pointerEvents="none" />
          <TouchableOpacity style={styles.dtRight} activeOpacity={1} onPress={handleZoneTap} />
        </View>
      </View>

      {/* Seek indicators */}
      <SeekIndicator amount={leftSeekAmt} side="left" opacity={leftOpacity} />
      <SeekIndicator amount={rightSeekAmt} side="right" opacity={rightOpacity} />

      {/* ── Top bar ── */}
      <View style={[styles.topBar, {paddingTop: topPad, paddingHorizontal: sidePad}]}>
        {/* Left: minimize / back */}
        <TouchableOpacity style={styles.topIconBtn} onPress={onBack} activeOpacity={0.7} hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
          <Ionicons name="chevron-down" size={26} color={colors.white} />
        </TouchableOpacity>

        {/* Title (fullscreen only) */}
        {isFullscreen && (
          <View style={styles.topTitleWrap}>
            <Text style={styles.topTitle} numberOfLines={1}>{title}</Text>
          </View>
        )}

        {/* Spacer */}
        {!isFullscreen && <View style={{flex: 1}} />}

        {/* Right icons */}
        <View style={styles.topRight}>
          {isFullscreen && (
            <Text style={styles.topPageName}>페이지명</Text>
          )}
          {/* Settings / more */}
          <TouchableOpacity style={styles.topIconBtn} onPress={() => { onMorePress(); onResetAutoHide(); }} activeOpacity={0.7}>
            <Ionicons name="settings-outline" size={22} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Center controls ── */}
      {renderCenter()}

      {/* ── Bottom area ── */}
      <View style={[styles.bottomArea, {paddingBottom: bottomPad, paddingHorizontal: sidePad}]}>
        {/* LIVE badge OR time */}
        <View style={styles.timeRow}>
          {isLive ? (
            <View style={styles.liveRow}>
              <TouchableOpacity
                style={styles.liveBadge}
                onPress={() => { if (valid) onSeekTo(duration); }}
                activeOpacity={0.7}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => { if (!isLive && valid) setShowRemaining(p => !p); }}
              activeOpacity={0.7}
              hitSlop={{top: 6, bottom: 6, left: 4, right: 4}}>
              <Text style={styles.timeText}>{timeStr}</Text>
            </TouchableOpacity>
          )}
          {/* Active chapter */}
          {activeChapter && (
            <TouchableOpacity onPress={() => { onTimelinePress(); onResetAutoHide(); }} activeOpacity={0.7}>
              <Text style={styles.chapterText}> · {activeChapter.title}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Seek bar */}
        {renderSeekBar()}

        {/* Bottom icons row */}
        <View style={styles.bottomIcons}>
          <View style={styles.bottomIconsLeft}>
            {/* Timeline events */}
            {events.length > 0 && (
              <TouchableOpacity style={styles.btmIcon} onPress={() => { onTimelinePress(); onResetAutoHide(); }} activeOpacity={0.7}>
                <MaterialIcons name="list" size={22} color={colors.white} />
              </TouchableOpacity>
            )}
            {/* Speed */}
            <TouchableOpacity style={styles.btmIcon} onPress={() => { onSpeedPress(); onResetAutoHide(); }} activeOpacity={0.7}>
              <Text style={styles.speedLabel}>
                {currentSpeed === 1 ? '1x' : `${currentSpeed}x`}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Right: clip, PIP, rotate, settings, fullscreen */}
          <View style={styles.bottomIconsRight}>
            {/* Clip (scissors) */}
            <TouchableOpacity
              style={styles.btmIcon}
              onPress={() => { onClipPress?.(); onResetAutoHide(); }}
              activeOpacity={0.7}>
              <MaterialIcons name="content-cut" size={20} color={colors.white} />
            </TouchableOpacity>
            {/* PIP */}
            <TouchableOpacity
              style={styles.btmIcon}
              onPress={() => { onPipPress?.(); onResetAutoHide(); }}
              activeOpacity={0.7}>
              <MaterialIcons name="picture-in-picture-alt" size={20} color={colors.white} />
            </TouchableOpacity>
            {/* Rotate / fullscreen toggle */}
            <TouchableOpacity style={styles.btmIcon} onPress={onFullscreenToggle} activeOpacity={0.7}>
              <MaterialIcons name="screen-rotation" size={20} color={colors.white} />
            </TouchableOpacity>
            {/* Settings */}
            <TouchableOpacity style={styles.btmIcon} onPress={() => { onMorePress(); onResetAutoHide(); }} activeOpacity={0.7}>
              <Ionicons name="settings-outline" size={20} color={colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },

  // ── Top bar ──
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 20,
    paddingBottom: 8,
  },
  topIconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitleWrap: {
    flex: 1,
    marginHorizontal: 4,
  },
  topTitle: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 3,
  },
  topRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  topPageName: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    fontWeight: '500',
    marginRight: 4,
  },

  // ── Center controls ──
  centerRow: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 40,
    zIndex: 15,
  },
  centerBtn: {
    width: CENTER_BTN_SIZE,
    height: CENTER_BTN_SIZE,
    borderRadius: CENTER_BTN_SIZE / 2,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerBtnPlay: {
    width: CENTER_BTN_PLAY,
    height: CENTER_BTN_PLAY,
    borderRadius: CENTER_BTN_PLAY / 2,
    backgroundColor: 'rgba(0,0,0,0.40)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: colors.white,
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 14,
  },
  retryBtnText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },

  // ── Bottom area ──
  bottomArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 20,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  timeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
  chapterText: {
    color: colors.grayLight,
    fontSize: 12,
  },

  // ── LIVE ──
  liveRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,0,0,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 3,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#FF0000',
    marginRight: 4,
  },
  liveText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // ── Seek bar ──
  seekBarWrap: {
    width: '100%',
    position: 'relative',
  },
  seekBarHit: {
    height: HIT_SLOP_VERTICAL,
    justifyContent: 'center',
    position: 'relative',
  },
  barTrack: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: BAR_HEIGHT,
    borderRadius: BAR_HEIGHT / 2,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  barBuf: {
    position: 'absolute',
    left: 0,
    height: BAR_HEIGHT,
    borderRadius: BAR_HEIGHT / 2,
    backgroundColor: 'rgba(255,255,255,0.40)',
  },
  barPlayed: {
    position: 'absolute',
    left: 0,
    height: BAR_HEIGHT,
    borderRadius: BAR_HEIGHT / 2,
    backgroundColor: colors.green,
  },
  thumb: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: colors.green,
    top: (HIT_SLOP_VERTICAL - THUMB_SIZE) / 2,
    zIndex: 5,
  },
  chDiv: {
    position: 'absolute',
    width: 2,
    height: BAR_HEIGHT + 4,
    backgroundColor: 'rgba(255,255,255,0.7)',
    top: (HIT_SLOP_VERTICAL - (BAR_HEIGHT + 4)) / 2,
    zIndex: 3,
  },
  evMarker: {
    position: 'absolute',
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginLeft: -2.5,
    top: (HIT_SLOP_VERTICAL - 5) / 2,
    zIndex: 4,
  },

  // ── Seek tooltip ──
  seekTooltip: {
    position: 'absolute',
    top: -4,
    width: 56,
    alignItems: 'center',
    zIndex: 30,
  },
  seekTooltipText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    overflow: 'hidden',
    fontVariant: ['tabular-nums'],
  },

  // ── Bottom icons ──
  bottomIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 32,
  },
  bottomIconsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bottomIconsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  btmIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speedLabel: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
  },

  // ── Seek indicators (double-tap) ──
  seekIndicator: {
    position: 'absolute',
    top: '35%',
    zIndex: 25,
    alignItems: 'center',
    justifyContent: 'center',
    width: 90,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  seekIndicatorLeft: {
    left: '10%',
  },
  seekIndicatorRight: {
    right: '10%',
  },
  seekIndicatorText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },

  // ── Double-tap zones ──
  dtRow: {
    flex: 1,
    flexDirection: 'row',
  },
  dtLeft: {
    flex: 35,
  },
  dtCenter: {
    flex: 30,
  },
  dtRight: {
    flex: 35,
  },
});

export {ControlOverlay};
export default ControlOverlay;
