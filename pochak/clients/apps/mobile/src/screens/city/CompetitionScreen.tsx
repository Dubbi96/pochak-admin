import React, {useState} from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Ionicons, MaterialIcons} from '@expo/vector-icons';
import {colors} from '../../theme';
import {
  Competition,
  competitionMonths,
  competitionTabs,
  mockCompetitions,
} from '../../services/cityApi';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

// ─── Competition Screen ───────────────────────────────────

export default function CompetitionScreen() {
  const [selectedTab, setSelectedTab] = useState('오늘의 대회');
  const [selectedYear] = useState(2025);
  const [selectedMonth, setSelectedMonth] = useState(11);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  const toggleFavorite = (id: string) => {
    setFavorites(prev => ({...prev, [id]: !prev[id]}));
  };

  // Determine which sports to show based on selected tab
  const sportsToShow =
    selectedTab === '오늘의 대회'
      ? Object.keys(mockCompetitions).filter(
          k => mockCompetitions[k].length > 0,
        )
      : [selectedTab];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>대회</Text>
        <TouchableOpacity activeOpacity={0.7}>
          <Ionicons name="search-outline" size={22} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Top Tabs */}
      <View style={styles.tabsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContainer}>
          {competitionTabs.map(tab => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab,
                selectedTab === tab && styles.tabActive,
              ]}
              onPress={() => setSelectedTab(tab)}
              activeOpacity={0.7}>
              <Text
                style={[
                  styles.tabText,
                  selectedTab === tab && styles.tabTextActive,
                ]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Year + Month Scroll */}
      <View style={styles.dateRow}>
        <Text style={styles.yearText}>{selectedYear}년</Text>
        <View style={styles.monthDivider} />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.monthsContainer}>
          {competitionMonths.map(m => (
            <TouchableOpacity
              key={m.value}
              style={[
                styles.monthButton,
                selectedMonth === m.value && styles.monthButtonActive,
              ]}
              onPress={() => setSelectedMonth(m.value)}
              activeOpacity={0.7}>
              <Text
                style={[
                  styles.monthText,
                  selectedMonth === m.value && styles.monthTextActive,
                ]}>
                {m.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Competition List */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}>
        {sportsToShow.map(sport => {
          const items = mockCompetitions[sport] || [];
          if (items.length === 0) {
            return null;
          }
          return (
            <View key={sport} style={styles.sportSection}>
              <View style={styles.sportHeader}>
                <View style={styles.sportDivider} />
                <Text style={styles.sportTitle}>{sport}</Text>
              </View>
              <View style={styles.competitionGrid}>
                {items.map(comp => (
                  <CompetitionCard
                    key={comp.id}
                    item={comp}
                    isFavorite={favorites[comp.id] ?? comp.isFavorite}
                    onToggleFavorite={() => toggleFavorite(comp.id)}
                  />
                ))}
              </View>
            </View>
          );
        })}

        {sportsToShow.every(
          sport => (mockCompetitions[sport] || []).length === 0,
        ) && (
          <View style={styles.emptyState}>
            <MaterialIcons name="event-busy" size={48} color={colors.grayDark} />
            <Text style={styles.emptyText}>등록된 대회가 없습니다</Text>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Competition Card ─────────────────────────────────────

function CompetitionCard({
  item,
  isFavorite,
  onToggleFavorite,
}: {
  item: Competition;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}) {
  return (
    <View style={styles.compCard}>
      <Image
        source={{uri: item.logoUrl}}
        style={styles.compLogo}
        resizeMode="cover"
      />
      <Text style={styles.compName} numberOfLines={2}>
        {item.name}
      </Text>
      <Text style={styles.compDate}>{item.date}</Text>
      <TouchableOpacity
        style={styles.favoriteButton}
        onPress={onToggleFavorite}
        activeOpacity={0.7}>
        <MaterialIcons
          name={isFavorite ? 'star' : 'star-border'}
          size={20}
          color={isFavorite ? '#FFD600' : colors.gray}
        />
      </TouchableOpacity>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 52,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.white,
  },

  // Tabs
  tabsWrapper: {
    borderBottomWidth: 0.5,
    borderBottomColor: colors.grayDark,
  },
  tabsContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
    backgroundColor: colors.surface,
  },
  tabActive: {
    backgroundColor: colors.green,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.grayLight,
  },
  tabTextActive: {
    color: '#000',
  },

  // Date
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.grayDark,
  },
  yearText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
    marginRight: 8,
  },
  monthDivider: {
    width: 1,
    height: 16,
    backgroundColor: colors.grayDark,
    marginRight: 8,
  },
  monthsContainer: {
    paddingRight: 16,
  },
  monthButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    marginHorizontal: 2,
  },
  monthButtonActive: {
    backgroundColor: colors.green,
  },
  monthText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.grayLight,
  },
  monthTextActive: {
    color: '#000',
    fontWeight: '700',
  },

  // Content
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: 16,
  },
  bottomSpacer: {
    height: 40,
  },

  // Sport Section
  sportSection: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sportDivider: {
    width: 3,
    height: 18,
    backgroundColor: colors.green,
    borderRadius: 2,
    marginRight: 8,
  },
  sportTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },

  // Competition Grid
  competitionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  compCard: {
    width: (SCREEN_WIDTH - 32 - 24) / 2,
    marginHorizontal: 6,
    marginBottom: 16,
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  compLogo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.grayDark,
    marginBottom: 10,
  },
  compName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.white,
    textAlign: 'center',
    marginBottom: 4,
  },
  compDate: {
    fontSize: 11,
    color: colors.grayLight,
    marginBottom: 8,
  },
  favoriteButton: {
    padding: 4,
  },

  // Empty
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 14,
    color: colors.gray,
    marginTop: 12,
  },
});
