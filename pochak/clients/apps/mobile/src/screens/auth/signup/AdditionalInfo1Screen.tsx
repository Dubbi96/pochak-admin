import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  FlatList,
} from 'react-native';
import {MaterialIcons} from '@expo/vector-icons';
import {colors} from '../../../theme';
import SignupFooter from '../../../components/common/SignupFooter';

const MAX_LOCATIONS = 3;

interface LocationItem {
  id: string;
  label: string;
}

interface AdditionalInfo1ScreenProps {
  onNext?: (data?: Record<string, any>) => void;
  onBack?: () => void;
  onSkip?: () => void;
}

const AdditionalInfo1Screen: React.FC<AdditionalInfo1ScreenProps> = ({
  onNext,
  onBack,
  onSkip,
}) => {
  const [searchText, setSearchText] = useState('');
  const [locations, setLocations] = useState<LocationItem[]>([]);

  const removeLocation = useCallback((id: string) => {
    setLocations(prev => prev.filter(loc => loc.id !== id));
  }, []);

  const addLocation = useCallback(() => {
    const trimmed = searchText.trim();
    if (!trimmed) return;

    if (locations.length >= MAX_LOCATIONS) {
      Alert.alert('알림', `관심지역은 최대 ${MAX_LOCATIONS}개까지 선택 가능합니다.`);
      return;
    }

    // Prevent duplicates
    if (locations.some(loc => loc.label === trimmed)) {
      Alert.alert('알림', '이미 추가된 지역입니다.');
      return;
    }

    setLocations(prev => [
      ...prev,
      {id: Date.now().toString(), label: trimmed},
    ]);
    setSearchText('');
  }, [searchText, locations]);

  const handleNext = useCallback(() => {
    onNext?.({
      regions: locations.map(l => l.label),
    });
  }, [onNext, locations]);

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
        <Text style={styles.title}>관심지역 선택</Text>
        <Text style={styles.subtitle}>
          설정한 지역의 대회, 팀 정보를 제공드려요.
        </Text>

        {/* Search input */}
        <View style={styles.searchWrapper}>
          <MaterialIcons
            name="search"
            size={20}
            color={colors.green}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="주소검색"
            placeholderTextColor={colors.gray}
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={addLocation}
            returnKeyType="done"
          />
        </View>

        {/* Selected locations list */}
        <FlatList
          data={locations}
          keyExtractor={item => item.id}
          style={styles.locationList}
          renderItem={({item}) => (
            <View style={styles.locationChip}>
              <MaterialIcons
                name="location-on"
                size={18}
                color={colors.green}
                style={styles.chipIcon}
              />
              <Text style={styles.chipLabel}>{item.label}</Text>
              <TouchableOpacity
                onPress={() => removeLocation(item.id)}
                hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                <MaterialIcons name="close" size={18} color={colors.gray} />
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={null}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* Footer */}
      <SignupFooter step={1} totalSteps={3} onNext={handleNext} />
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
    marginBottom: 8,
  },
  subtitle: {
    color: colors.gray,
    fontSize: 14,
    marginBottom: 28,
    lineHeight: 20,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.green,
    paddingHorizontal: 16,
    height: 50,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: colors.white,
    fontSize: 15,
    padding: 0,
  },
  locationList: {
    flex: 1,
  },
  locationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: colors.grayDark,
    marginBottom: 10,
  },
  chipIcon: {
    marginRight: 8,
  },
  chipLabel: {
    flex: 1,
    color: colors.white,
    fontSize: 14,
  },
});

export default AdditionalInfo1Screen;
