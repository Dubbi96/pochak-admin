import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

interface NetworkErrorViewProps {
  /** Callback when the user presses the retry button */
  onRetry: () => void;
  /** Optional custom message (defaults to network check prompt) */
  message?: string;
}

/**
 * Reusable component for network/API error states.
 * Shows a wifi-off icon, message, and retry button in Pochak's dark theme.
 */
export function NetworkErrorView({ onRetry, message }: NetworkErrorViewProps) {
  return (
    <View style={styles.container}>
      {/* WiFi-off icon using Unicode (avoids external icon dependency) */}
      <View style={styles.iconContainer}>
        <Text style={styles.iconText}>WiFi</Text>
        <View style={styles.strikethrough} />
      </View>
      <Text style={styles.message}>
        {message ?? '네트워크 연결을 확인해주세요'}
      </Text>
      <Text style={styles.subMessage}>
        인터넷 연결 상태를 확인한 후 다시 시도해주세요.
      </Text>
      <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
        <Text style={styles.retryText}>다시 시도</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  iconText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray,
  },
  strikethrough: {
    position: 'absolute',
    width: 72,
    height: 2,
    backgroundColor: colors.error,
    transform: [{ rotate: '-45deg' }],
  },
  message: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 8,
    textAlign: 'center',
  },
  subMessage: {
    fontSize: 13,
    color: colors.grayLight,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: colors.green,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});
