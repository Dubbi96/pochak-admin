import React, {useEffect, useState, useRef, useCallback} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {MaterialIcons} from '@expo/vector-icons';
import {colors} from '../../theme';

export interface LiveCountdownProps {
  /** Target timestamp in milliseconds (Date.now()-style) */
  targetTimestamp: number;
  /** Called when countdown reaches zero */
  onCountdownEnd: () => void;
}

function formatCountdownUnit(value: number): string {
  return value.toString().padStart(2, '0');
}

const LiveCountdown: React.FC<LiveCountdownProps> = ({
  targetTimestamp,
  onCountdownEnd,
}) => {
  const [remainingMs, setRemainingMs] = useState(() =>
    Math.max(0, targetTimestamp - Date.now()),
  );
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasEnded = useRef(false);

  const handleEnd = useCallback(() => {
    if (!hasEnded.current) {
      hasEnded.current = true;
      onCountdownEnd();
    }
  }, [onCountdownEnd]);

  useEffect(() => {
    hasEnded.current = false;

    const tick = () => {
      const diff = Math.max(0, targetTimestamp - Date.now());
      setRemainingMs(diff);
      if (diff <= 0) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        handleEnd();
      }
    };

    tick(); // immediate first tick
    intervalRef.current = setInterval(tick, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [targetTimestamp, handleEnd]);

  const totalSeconds = Math.floor(remainingMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return (
    <View style={styles.container}>
      <View style={styles.iconRow}>
        <MaterialIcons name="live-tv" size={32} color={colors.green} />
      </View>
      <Text style={styles.label}>경기 시작까지</Text>
      <View style={styles.timerRow}>
        <View style={styles.timeBlock}>
          <Text style={styles.timeValue}>
            {formatCountdownUnit(hours)}
          </Text>
          <Text style={styles.timeUnit}>시간</Text>
        </View>
        <Text style={styles.separator}>:</Text>
        <View style={styles.timeBlock}>
          <Text style={styles.timeValue}>
            {formatCountdownUnit(minutes)}
          </Text>
          <Text style={styles.timeUnit}>분</Text>
        </View>
        <Text style={styles.separator}>:</Text>
        <View style={styles.timeBlock}>
          <Text style={styles.timeValue}>
            {formatCountdownUnit(seconds)}
          </Text>
          <Text style={styles.timeUnit}>초</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
    paddingVertical: 24,
  },
  iconRow: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: colors.grayLight,
    marginBottom: 12,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeBlock: {
    alignItems: 'center',
    minWidth: 56,
  },
  timeValue: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.green,
    fontVariant: ['tabular-nums'],
  },
  timeUnit: {
    fontSize: 11,
    color: colors.gray,
    marginTop: 2,
  },
  separator: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.green,
    marginHorizontal: 4,
    marginBottom: 14, // Align with timeValue baseline
  },
});

export default LiveCountdown;
