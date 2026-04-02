import React, {useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import {colors} from '../../../theme';

interface SignUpCompleteScreenProps {
  onSubscribe?: () => void;
  onSkipToHome?: () => void;
}

const SignUpCompleteScreen: React.FC<SignUpCompleteScreenProps> = ({
  onSubscribe,
  onSkipToHome,
}) => {
  const handleSubscribe = useCallback(() => {
    onSubscribe?.();
  }, [onSubscribe]);

  const handleSkip = useCallback(() => {
    onSkipToHome?.();
  }, [onSkipToHome]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      <View style={styles.container}>
        {/* Center title */}
        <View style={styles.centerSection}>
          <Text style={styles.title}>회원가입 완료</Text>
        </View>

        {/* Bottom actions */}
        <View style={styles.bottomSection}>
          <TouchableOpacity
            onPress={handleSubscribe}
            activeOpacity={0.85}
            style={styles.subscribeButton}>
            <Text style={styles.subscribeButtonText}>
              대가족 무제한 시청권! 지금 구독하기
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleSkip} style={styles.skipLink}>
            <Text style={styles.skipText}>다음에 할게요.</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: colors.white,
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
  },
  bottomSection: {
    paddingBottom: 32,
    alignItems: 'center',
  },
  subscribeButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subscribeButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  skipLink: {
    marginTop: 20,
    paddingVertical: 8,
  },
  skipText: {
    color: colors.gray,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});

export default SignUpCompleteScreen;
