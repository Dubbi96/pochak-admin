import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * React Error Boundary for the Pochak mobile app.
 * Catches render errors in the component tree and shows a fallback UI.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // TODO: Send to error reporting service (e.g. Sentry) in production
    console.error('[ErrorBoundary] Uncaught error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <Text style={styles.icon}>!</Text>
          <Text style={styles.title}>오류가 발생했습니다</Text>
          <Text style={styles.message}>
            예상치 못한 문제가 발생했습니다.{'\n'}잠시 후 다시 시도해주세요.
          </Text>
          {__DEV__ && this.state.error && (
            <Text style={styles.debugText} numberOfLines={4}>
              {this.state.error.message}
            </Text>
          )}
          <TouchableOpacity style={styles.retryButton} onPress={this.handleReset}>
            <Text style={styles.retryText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  icon: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.error,
    marginBottom: 16,
    width: 72,
    height: 72,
    lineHeight: 72,
    textAlign: 'center',
    borderRadius: 36,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: colors.grayLight,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  debugText: {
    fontSize: 11,
    color: colors.gray,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
    fontFamily: 'monospace',
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
