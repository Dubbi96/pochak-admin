import React, {useCallback, useRef, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
  PanResponder,
  GestureResponderEvent,
} from 'react-native';
import {MaterialIcons, Ionicons} from '@expo/vector-icons';
import {colors} from '../../theme';

const MAX_CLIP_DURATION = 180; // 3 minutes in seconds
const {width: SCREEN_WIDTH} = Dimensions.get('window');
const TIMELINE_PADDING = 24;
const TIMELINE_WIDTH = SCREEN_WIDTH - TIMELINE_PADDING * 2;
const HANDLE_WIDTH = 20;
const TRACK_HEIGHT = 40;

export interface ClipCreationOverlayProps {
  visible: boolean;
  isLive: boolean;
  currentTime: number;
  duration: number;
  onClose: () => void;
  onNext: (startTime: number, endTime: number) => void;
  onPreview: (startTime: number, endTime: number) => void;
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h.toString().padStart(2, '0')}:${m
      .toString()
      .padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m.toString().padStart(2, '0')}:${s
    .toString()
    .padStart(2, '0')}`;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const ClipCreationOverlay: React.FC<ClipCreationOverlayProps> = ({
  visible,
  isLive,
  currentTime,
  duration,
  onClose,
  onNext,
  onPreview,
}) => {
  // For LIVE: the selectable range is the last 3 minutes from current time
  // For VOD: the selectable range is based on current playback position, max 3 min
  const effectiveDuration = duration > 0 ? duration : 7200;

  const getInitialStart = useCallback(() => {
    if (isLive) {
      return Math.max(0, currentTime - MAX_CLIP_DURATION);
    }
    // VOD: center around current time, max 3 min
    const halfClip = Math.floor(MAX_CLIP_DURATION / 2);
    const start = Math.max(0, currentTime - halfClip);
    return start;
  }, [isLive, currentTime]);

  const getInitialEnd = useCallback(() => {
    if (isLive) {
      return currentTime;
    }
    const halfClip = Math.floor(MAX_CLIP_DURATION / 2);
    const start = Math.max(0, currentTime - halfClip);
    const end = Math.min(effectiveDuration, start + MAX_CLIP_DURATION);
    return end;
  }, [isLive, currentTime, effectiveDuration]);

  const [startTime, setStartTime] = useState(getInitialStart);
  const [endTime, setEndTime] = useState(getInitialEnd);

  // Reset times when overlay becomes visible
  React.useEffect(() => {
    if (visible) {
      setStartTime(getInitialStart());
      setEndTime(getInitialEnd());
    }
  }, [visible, getInitialStart, getInitialEnd]);

  const trackRef = useRef<View>(null);
  const trackXRef = useRef(0);
  const trackWidthRef = useRef(TIMELINE_WIDTH);

  const onTrackLayout = useCallback(() => {
    trackRef.current?.measureInWindow((x, _y, width) => {
      trackXRef.current = x;
      trackWidthRef.current = width;
    });
  }, []);

  const positionToTime = useCallback(
    (pageX: number): number => {
      const relX = pageX - trackXRef.current;
      const fraction = Math.max(0, Math.min(1, relX / trackWidthRef.current));
      return fraction * effectiveDuration;
    },
    [effectiveDuration],
  );

  const timeToPosition = useCallback(
    (time: number): number => {
      if (effectiveDuration <= 0) return 0;
      return (time / effectiveDuration) * trackWidthRef.current;
    },
    [effectiveDuration],
  );

  // Start handle PanResponder
  const startPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {},
      onPanResponderMove: (evt: GestureResponderEvent) => {
        const time = positionToTime(evt.nativeEvent.pageX);
        const clamped = Math.max(0, Math.min(time, endTime - 1));
        // Enforce max duration
        if (endTime - clamped > MAX_CLIP_DURATION) {
          return;
        }
        setStartTime(Math.floor(clamped));
      },
      onPanResponderRelease: () => {},
    }),
  ).current;

  // End handle PanResponder
  const endPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {},
      onPanResponderMove: (evt: GestureResponderEvent) => {
        const time = positionToTime(evt.nativeEvent.pageX);
        const maxTime = isLive ? currentTime : effectiveDuration;
        const clamped = Math.min(maxTime, Math.max(time, startTime + 1));
        // Enforce max duration
        if (clamped - startTime > MAX_CLIP_DURATION) {
          return;
        }
        setEndTime(Math.floor(clamped));
      },
      onPanResponderRelease: () => {},
    }),
  ).current;

  const selectedDuration = endTime - startTime;
  const startFraction =
    effectiveDuration > 0 ? startTime / effectiveDuration : 0;
  const endFraction =
    effectiveDuration > 0 ? endTime / effectiveDuration : 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>클립 만들기</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Mode indicator */}
          <View style={styles.modeRow}>
            {isLive && (
              <View style={styles.liveBadge}>
                <Text style={styles.liveBadgeText}>LIVE</Text>
              </View>
            )}
            <Text style={styles.modeHint}>
              {isLive
                ? '최근 3분 구간을 선택하세요'
                : '재생 구간 기준 최대 3분까지 선택 가능'}
            </Text>
          </View>

          {/* Timeline */}
          <View style={styles.timelineContainer}>
            <View
              ref={trackRef}
              style={styles.timelineTrack}
              onLayout={onTrackLayout}>
              {/* Background track */}
              <View style={styles.trackBackground} />

              {/* Selected range highlight */}
              <View
                style={[
                  styles.selectedRange,
                  {
                    left: `${startFraction * 100}%`,
                    width: `${(endFraction - startFraction) * 100}%`,
                  },
                ]}
              />

              {/* Start handle */}
              <View
                style={[
                  styles.handle,
                  styles.startHandle,
                  {left: `${startFraction * 100}%`},
                ]}
                {...startPanResponder.panHandlers}>
                <View style={styles.handleBar} />
              </View>

              {/* End handle */}
              <View
                style={[
                  styles.handle,
                  styles.endHandle,
                  {left: `${endFraction * 100}%`},
                ]}
                {...endPanResponder.panHandlers}>
                <View style={styles.handleBar} />
              </View>
            </View>
          </View>

          {/* Time labels */}
          <View style={styles.timeLabelsRow}>
            <View style={styles.timeLabel}>
              <Text style={styles.timeLabelTitle}>시작</Text>
              <Text style={styles.timeLabelValue}>
                {formatTime(startTime)}
              </Text>
            </View>
            <View style={styles.timeLabel}>
              <Text style={styles.timeLabelTitle}>끝</Text>
              <Text style={styles.timeLabelValue}>
                {formatTime(endTime)}
              </Text>
            </View>
          </View>

          {/* Selected duration */}
          <View style={styles.durationRow}>
            <Text style={styles.durationLabel}>선택 구간:</Text>
            <Text
              style={[
                styles.durationValue,
                selectedDuration > MAX_CLIP_DURATION && styles.durationOver,
              ]}>
              {formatDuration(selectedDuration)}
            </Text>
            <Text style={styles.durationMax}> / 최대 3:00</Text>
          </View>
        </View>

        {/* Bottom buttons */}
        <View style={styles.bottomButtons}>
          <TouchableOpacity
            style={styles.previewButton}
            onPress={() => onPreview(startTime, endTime)}>
            <MaterialIcons
              name="play-circle-outline"
              size={20}
              color={colors.green}
            />
            <Text style={styles.previewButtonText}>미리보기</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.nextButton,
              selectedDuration <= 0 && styles.nextButtonDisabled,
            ]}
            onPress={() => onNext(startTime, endTime)}
            disabled={selectedDuration <= 0}>
            <Text style={styles.nextButtonText}>다음</Text>
            <MaterialIcons name="arrow-forward" size={18} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.white,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: TIMELINE_PADDING,
  },
  modeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    gap: 8,
  },
  liveBadge: {
    backgroundColor: '#FF0000',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  liveBadgeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  modeHint: {
    fontSize: 14,
    color: colors.grayLight,
  },
  // Timeline
  timelineContainer: {
    marginBottom: 20,
  },
  timelineTrack: {
    height: TRACK_HEIGHT,
    position: 'relative',
    justifyContent: 'center',
  },
  trackBackground: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    width: '100%',
  },
  selectedRange: {
    position: 'absolute',
    height: 4,
    backgroundColor: colors.green,
    borderRadius: 2,
    top: (TRACK_HEIGHT - 4) / 2,
  },
  handle: {
    position: 'absolute',
    width: HANDLE_WIDTH,
    height: TRACK_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -(HANDLE_WIDTH / 2),
  },
  startHandle: {},
  endHandle: {},
  handleBar: {
    width: 12,
    height: 28,
    borderRadius: 6,
    backgroundColor: colors.green,
    borderWidth: 2,
    borderColor: colors.white,
  },
  // Time labels
  timeLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  timeLabel: {
    alignItems: 'center',
  },
  timeLabelTitle: {
    fontSize: 12,
    color: colors.gray,
    marginBottom: 4,
  },
  timeLabelValue: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.white,
    fontVariant: ['tabular-nums'],
  },
  // Duration
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationLabel: {
    fontSize: 14,
    color: colors.grayLight,
  },
  durationValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.green,
    marginLeft: 6,
  },
  durationOver: {
    color: colors.error,
  },
  durationMax: {
    fontSize: 13,
    color: colors.gray,
  },
  // Buttons
  bottomButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 12,
  },
  previewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.green,
    gap: 6,
  },
  previewButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.green,
  },
  nextButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.green,
    gap: 6,
  },
  nextButtonDisabled: {
    backgroundColor: colors.grayDark,
  },
  nextButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.white,
  },
});

export default ClipCreationOverlay;
