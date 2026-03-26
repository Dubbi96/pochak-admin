import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import GreenButton from '../../components/common/GreenButton';

const BG = '#1A1A1A';
const SURFACE = '#262626';
const GREEN = '#00CC33';
const WHITE = '#FFFFFF';
const GRAY = '#A6A6A6';
const GRAY_LIGHT = '#A6A6A6';

interface LocationChip {
  id: string;
  label: string;
}

const IntroLocationScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [searchText, setSearchText] = useState('');
  const [selectedLocations, setSelectedLocations] = useState<LocationChip[]>([
    { id: '1', label: '대한민국 서울시' },
  ]);

  const removeLocation = (id: string) => {
    setSelectedLocations((prev) => prev.filter((loc) => loc.id !== id));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />
      <View style={styles.container}>
        <View style={styles.topSection}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color={WHITE} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerRight}>
              <Text style={styles.langText}>한국어</Text>
              <MaterialIcons name="language" size={20} color={GRAY_LIGHT} />
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>
            {'선택한 지역의\n콘텐츠를 추천드려요.'}
          </Text>

          {/* Search Input */}
          <View style={styles.searchWrapper}>
            <MaterialIcons name="search" size={20} color={GREEN} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="주소검색"
              placeholderTextColor={GRAY}
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>

          {/* Selected Locations */}
          <View style={styles.chipsContainer}>
            {selectedLocations.map((loc) => (
              <View key={loc.id} style={styles.locationChip}>
                <MaterialIcons name="location-on" size={16} color={GREEN} style={styles.chipIcon} />
                <Text style={styles.chipLabel}>{loc.label}</Text>
                <TouchableOpacity onPress={() => removeLocation(loc.id)}>
                  <MaterialIcons name="close" size={16} color={GRAY} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.bottomSection}>
          <GreenButton title="확인" onPress={() => navigation.navigate('Login')} />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG,
  },
  container: {
    flex: 1,
    backgroundColor: BG,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 8,
  },
  headerBtn: {
    padding: 4,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  langText: {
    color: GRAY_LIGHT,
    fontSize: 14,
  },
  topSection: {
    paddingTop: 0,
  },
  title: {
    color: WHITE,
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 36,
    marginTop: 32,
    marginBottom: 32,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SURFACE,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: GREEN,
    paddingHorizontal: 16,
    height: 50,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: WHITE,
    fontSize: 15,
    padding: 0,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  locationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SURFACE,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#4D4D4D',
  },
  chipIcon: {
    marginRight: 6,
  },
  chipLabel: {
    color: WHITE,
    fontSize: 14,
    marginRight: 8,
  },
  bottomSection: {
    paddingBottom: 32,
  },
});

export default IntroLocationScreen;
