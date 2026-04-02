import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import {MaterialIcons} from '@expo/vector-icons';
import {colors} from '../../../theme';
import SignupFooter from '../../../components/common/SignupFooter';

const REASONS = [
  '내 경기영상을 보고 싶어요 !',
  '자녀와 함께 경기 영상을 시청하고 싶어요 !',
  '나만의 팀을 만들고 운영하고 싶어요 !',
];

interface AdditionalInfo3ScreenProps {
  onNext?: (data?: Record<string, any>) => void;
  onBack?: () => void;
  onSkip?: () => void;
  isSubmitting?: boolean;
}

const AdditionalInfo3Screen: React.FC<AdditionalInfo3ScreenProps> = ({
  onNext,
  onBack,
  onSkip,
  isSubmitting = false,
}) => {
  const [selectedReason, setSelectedReason] = useState<string | null>(null);

  const handleSelect = useCallback((reason: string) => {
    setSelectedReason(prev => (prev === reason ? null : reason));
  }, []);

  const handleComplete = useCallback(() => {
    onNext?.({reason: selectedReason});
  }, [onNext, selectedReason]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.headerButton}>
          <MaterialIcons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onSkip} style={styles.headerButton}>
          <Text style={styles.skipHeaderText}>건너뛰기</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>서비스 이용 계기</Text>

        <View style={styles.cardsContainer}>
          {REASONS.map(reason => {
            const isSelected = selectedReason === reason;
            return (
              <TouchableOpacity
                key={reason}
                style={[styles.card, isSelected && styles.cardSelected]}
                onPress={() => handleSelect(reason)}
                activeOpacity={0.7}>
                <Text
                  style={[
                    styles.cardText,
                    isSelected && styles.cardTextSelected,
                  ]}>
                  {reason}
                </Text>
                {isSelected && (
                  <MaterialIcons
                    name="check"
                    size={22}
                    color={colors.green}
                    style={styles.checkIcon}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Footer */}
      <SignupFooter
        step={3}
        totalSteps={3}
        nextLabel="가입완료"
        onNext={handleComplete}
        disabled={isSubmitting}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 52,
  },
  headerButton: {
    padding: 8,
  },
  skipHeaderText: {
    color: colors.gray,
    fontSize: 14,
    fontWeight: '400',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  title: {
    color: colors.white,
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 28,
  },
  cardsContainer: {
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.grayDark,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  cardSelected: {
    borderColor: colors.green,
    backgroundColor: 'rgba(0, 200, 83, 0.08)',
  },
  cardText: {
    color: colors.grayLight,
    fontSize: 15,
    flex: 1,
    lineHeight: 22,
  },
  cardTextSelected: {
    color: colors.green,
    fontWeight: '600',
  },
  checkIcon: {
    marginLeft: 12,
  },
});

export default AdditionalInfo3Screen;
