import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {colors} from '../../theme';

interface SignupFooterProps {
  step: number;
  totalSteps: number;
  nextLabel?: string;
  onNext: () => void;
  onSkip?: () => void;
  disabled?: boolean;
}

const SignupFooter: React.FC<SignupFooterProps> = ({
  step,
  totalSteps,
  nextLabel,
  onNext,
  onSkip,
  disabled = false,
}) => {
  const label = nextLabel || '다음';

  return (
    <View style={styles.footer}>
      <Text style={styles.progressText}>
        추가정보 {step} / {totalSteps}
      </Text>
      <TouchableOpacity
        onPress={onNext}
        style={[styles.nextButton, disabled && styles.nextButtonDisabled]}
        activeOpacity={0.8}
        disabled={disabled}>
        <Text style={[styles.nextText, disabled && styles.nextTextDisabled]}>
          {label}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 12,
    backgroundColor: colors.bg,
  },
  progressText: {
    color: colors.grayLight,
    fontSize: 13,
    fontWeight: '400',
  },
  nextButton: {
    backgroundColor: colors.green,
    borderRadius: 22,
    paddingHorizontal: 32,
    paddingVertical: 12,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextText: {
    color: colors.bg,
    fontSize: 15,
    fontWeight: '700',
  },
  nextTextDisabled: {
    color: colors.bg,
  },
});

export default SignupFooter;
