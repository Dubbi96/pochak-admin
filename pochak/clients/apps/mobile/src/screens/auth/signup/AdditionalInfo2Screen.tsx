import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
} from 'react-native';
import {MaterialIcons} from '@expo/vector-icons';
import {colors} from '../../../theme';
import SignupFooter from '../../../components/common/SignupFooter';

const MAX_SPORTS = 3;
const DEFAULT_SPORTS = ['축구', '야구', '배구', '핸드볼', '농구', '기타'];

interface CustomSport {
  id: string;
  name: string;
}

interface AdditionalInfo2ScreenProps {
  onNext?: (data?: Record<string, any>) => void;
  onBack?: () => void;
  onSkip?: () => void;
}

const AdditionalInfo2Screen: React.FC<AdditionalInfo2ScreenProps> = ({
  onNext,
  onBack,
  onSkip,
}) => {
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState('');
  const [customSports, setCustomSports] = useState<CustomSport[]>([]);

  const totalSelected = selectedSports.length + customSports.length;

  const toggleSport = useCallback(
    (sport: string) => {
      setSelectedSports(prev => {
        if (prev.includes(sport)) {
          return prev.filter(s => s !== sport);
        }
        if (prev.length + customSports.length >= MAX_SPORTS) {
          Alert.alert('알림', `관심종목은 최대 ${MAX_SPORTS}개까지 선택 가능합니다.`);
          return prev;
        }
        return [...prev, sport];
      });
    },
    [customSports.length],
  );

  const addCustomSport = useCallback(() => {
    const trimmed = customInput.trim();
    if (!trimmed) return;

    if (selectedSports.length + customSports.length >= MAX_SPORTS) {
      Alert.alert('알림', `관심종목은 최대 ${MAX_SPORTS}개까지 선택 가능합니다.`);
      return;
    }

    // Prevent duplicates
    if (
      DEFAULT_SPORTS.includes(trimmed) ||
      customSports.some(s => s.name === trimmed)
    ) {
      Alert.alert('알림', '이미 추가된 종목입니다.');
      return;
    }

    setCustomSports(prev => [
      ...prev,
      {id: Date.now().toString(), name: trimmed},
    ]);
    setCustomInput('');
  }, [customInput, selectedSports.length, customSports]);

  const removeCustomSport = useCallback((id: string) => {
    setCustomSports(prev => prev.filter(s => s.id !== id));
  }, []);

  const handleNext = useCallback(() => {
    const allSports = [
      ...selectedSports,
      ...customSports.map(s => s.name),
    ];
    onNext?.({sports: allSports});
  }, [onNext, selectedSports, customSports]);

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
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>관심종목 선택</Text>
        <Text style={styles.subtitle}>최대 3개 선택 가능</Text>

        {/* Preset sport chips - flow layout */}
        <View style={styles.tagsContainer}>
          {DEFAULT_SPORTS.map(sport => {
            const isSelected = selectedSports.includes(sport);
            return (
              <TouchableOpacity
                key={sport}
                style={[styles.sportChip, isSelected && styles.sportChipSelected]}
                onPress={() => toggleSport(sport)}
                activeOpacity={0.7}>
                <Text
                  style={[
                    styles.sportChipText,
                    isSelected && styles.sportChipTextSelected,
                  ]}>
                  #{sport}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Custom input row */}
        <View style={styles.customInputRow}>
          <View style={styles.customInputWrapper}>
            <TextInput
              style={styles.customInput}
              placeholder="종목 직접입력"
              placeholderTextColor={colors.gray}
              value={customInput}
              onChangeText={setCustomInput}
              onSubmitEditing={addCustomSport}
              returnKeyType="done"
            />
          </View>
          <TouchableOpacity onPress={addCustomSport} style={styles.addButton}>
            <Text style={styles.addText}>추가</Text>
          </TouchableOpacity>
        </View>

        {/* Custom sports list */}
        {customSports.length > 0 && (
          <View style={styles.customSportsList}>
            {customSports.map(sport => (
              <View key={sport.id} style={styles.customSportItem}>
                <Text style={styles.customSportLabel}># {sport.name}</Text>
                <TouchableOpacity
                  onPress={() => removeCustomSport(sport.id)}
                  hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                  <MaterialIcons name="close" size={16} color={colors.gray} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <SignupFooter step={2} totalSteps={3} onNext={handleNext} />
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
  },
  title: {
    color: colors.white,
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    color: colors.gray,
    fontSize: 14,
    marginBottom: 28,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
    gap: 8,
  },
  sportChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.gray,
    backgroundColor: colors.surface,
  },
  sportChipSelected: {
    borderColor: colors.green,
    backgroundColor: 'rgba(0, 200, 83, 0.1)',
  },
  sportChipText: {
    color: colors.gray,
    fontSize: 14,
    fontWeight: '500',
  },
  sportChipTextSelected: {
    color: colors.green,
  },
  customInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  customInputWrapper: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.grayDark,
    paddingHorizontal: 16,
    height: 46,
    justifyContent: 'center',
  },
  customInput: {
    color: colors.white,
    fontSize: 14,
    padding: 0,
  },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  addText: {
    color: colors.green,
    fontSize: 14,
    fontWeight: '600',
  },
  customSportsList: {
    gap: 10,
  },
  customSportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: colors.grayDark,
  },
  customSportLabel: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default AdditionalInfo2Screen;
