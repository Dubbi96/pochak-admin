import React, {useState, useMemo, useCallback, useRef} from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../navigation/types';
import {colors} from '../../theme';
import {
  SPORTS,
  mockCompetitions,
  mockMatches,
  getMatchesByDate,
  formatDateHeader,
  formatMonthYear,
  type Sport,
  type Competition,
  type Match,
} from '../../services/scheduleApi';

type ScheduleNavProp = NativeStackNavigationProp<RootStackParamList>;

const TOP_BAR_HEIGHT = 52;

// ─── Common Top Bar (same as HomeScreen) ─────────────────

function TopBar() {
  const navigation = useNavigation<ScheduleNavProp>();

  return (
    <View style={styles.topBar}>
      <Image
        source={require('../../../assets/pochak_logo.png')}
        style={styles.logoImage}
        resizeMode="contain"
      />
      <View style={styles.topBarRight}>
        <TouchableOpacity
          style={styles.topBarIcon}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Search')}>
          <Ionicons name="search-outline" size={22} color={colors.white} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.topBarIcon} activeOpacity={0.7}>
          <Ionicons name="videocam-outline" size={22} color={colors.white} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.topBarIcon}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Notifications')}>
          <Ionicons name="notifications-outline" size={22} color={colors.white} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.topBarIcon} activeOpacity={0.7}>
          <Ionicons name="menu-outline" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Filter Buttons ──────────────────────────────────────

const FILTER_TAGS = ['#축구', '#야구', '#배구', '#핸드볼', '#농구', '#배드민턴'];

function FilterSection({
  isContestFilter,
  onToggleContest,
  activeSport,
  onSportPress,
}: {
  isContestFilter: boolean;
  onToggleContest: () => void;
  activeSport: Sport;
  onSportPress: (sport: Sport) => void;
}) {
  return (
    <View style={styles.filterSection}>
      {/* "이달의 대회" pill button */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterPill, isContestFilter && styles.filterPillActive]}
          onPress={onToggleContest}>
          <Text style={[styles.filterPillText, isContestFilter && styles.filterPillTextActive]}>
            이달의 대회
          </Text>
        </TouchableOpacity>
        {FILTER_TAGS.map(tag => {
          const sportName = tag.replace('#', '') as Sport;
          const isActive = activeSport === sportName;
          return (
            <TouchableOpacity
              key={tag}
              style={[styles.hashtagChip, isActive && styles.hashtagChipActive]}
              onPress={() => onSportPress(isActive ? '전체' : sportName)}>
              <Text style={[styles.hashtagText, isActive && styles.hashtagTextActive]}>
                {tag}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

// ─── Year/Month Selector ─────────────────────────────────

const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

function YearMonthSelector({
  year,
  month,
  onYearChange,
  onMonthChange,
  matchMonths,
}: {
  year: number;
  month: number;
  onYearChange: (y: number) => void;
  onMonthChange: (m: number) => void;
  matchMonths: Set<number>;
}) {
  const monthScrollRef = useRef<ScrollView>(null);

  return (
    <View style={styles.yearMonthContainer}>
      {/* Year dropdown */}
      <View style={styles.yearRow}>
        <TouchableOpacity onPress={() => onYearChange(year - 1)} style={styles.yearArrow}>
          <Ionicons name="chevron-back" size={16} color={colors.grayLight} />
        </TouchableOpacity>
        <Text style={styles.yearText}>{year}년</Text>
        <TouchableOpacity onPress={() => onYearChange(year + 1)} style={styles.yearArrow}>
          <Ionicons name="chevron-forward" size={16} color={colors.grayLight} />
        </TouchableOpacity>
      </View>

      {/* Month tabs horizontal scroll */}
      <ScrollView
        ref={monthScrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.monthTabsContent}>
        {MONTHS.map(m => {
          const isActive = month === m;
          const hasMatches = matchMonths.has(m);
          return (
            <TouchableOpacity
              key={m}
              style={[styles.monthTab, isActive && styles.monthTabActive]}
              onPress={() => onMonthChange(m)}>
              <Text style={[styles.monthTabText, isActive && styles.monthTabTextActive]}>
                {m}월
              </Text>
              {hasMatches && <View style={styles.monthDot} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

// ──────────────────── Sub-components ────────────────────

function CompetitionCard({competition}: {competition: Competition}) {
  return (
    <View style={styles.competitionCard}>
      <Image
        source={{uri: competition.imageUrl}}
        style={styles.competitionImage}
        resizeMode="cover"
      />
      <View style={styles.competitionInfo}>
        <Text style={styles.competitionName} numberOfLines={1}>
          {competition.name}
        </Text>
        <Text style={styles.competitionDate}>
          {competition.startDate} ~ {competition.endDate}
        </Text>
        <View style={styles.competitionMeta}>
          <View style={styles.sportBadge}>
            <Text style={styles.sportBadgeText}>{competition.sport}</Text>
          </View>
          <View
            style={[
              styles.priceBadge,
              competition.isFree ? styles.freeBadge : styles.paidBadge,
            ]}>
            <Text style={styles.priceBadgeText}>
              {competition.isFree ? '무료' : '유료'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function CompletedMatchCard({match}: {match: Match}) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View style={[styles.matchCard, styles.matchCardCompleted]}>
      <View style={styles.matchHeader}>
        <Text style={styles.matchRound}>{match.round}</Text>
        <View style={styles.statusBadgeCompleted}>
          <Text style={styles.statusBadgeText}>종료</Text>
        </View>
      </View>
      <View style={styles.matchBody}>
        <View style={styles.matchTeams}>
          <Text style={styles.teamName}>{match.home.name}</Text>
          <Text style={styles.matchScore}>
            {match.home.score} : {match.away.score}
          </Text>
          <Text style={styles.teamName}>{match.away.name}</Text>
        </View>
      </View>
      <View style={styles.matchFooter}>
        <Image
          source={{uri: match.thumbnailUrl}}
          style={styles.matchThumbnail}
          resizeMode="cover"
        />
        <View style={styles.thumbnailBadgeContainer}>
          <View style={styles.typeBadgeVod}>
            <Text style={styles.typeBadgeText}>VOD</Text>
          </View>
        </View>
        {match.vodUrl && (
          <TouchableOpacity
            style={styles.vodButton}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Player', {contentType: 'vod', contentId: match.id})}>
            <MaterialIcons name="play-circle-outline" size={16} color={colors.white} style={styles.vodButtonIcon} />
            <Text style={styles.vodButtonText}>영상</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

function LiveMatchCard({match}: {match: Match}) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View style={[styles.matchCard, styles.matchCardLive]}>
      <View style={styles.matchHeader}>
        <Text style={styles.matchRound}>{match.round}</Text>
        <View style={styles.statusBadgeLive}>
          <Text style={styles.statusBadgeText}>진행</Text>
        </View>
      </View>
      <View style={styles.matchBody}>
        <View style={styles.matchTeams}>
          <Text style={styles.teamName}>{match.home.name}</Text>
          <Text style={styles.matchScore}>
            {match.home.score ?? '-'} : {match.away.score ?? '-'}
          </Text>
          <Text style={styles.teamName}>{match.away.name}</Text>
        </View>
      </View>
      <View style={styles.matchFooter}>
        <Image
          source={{uri: match.thumbnailUrl}}
          style={styles.matchThumbnail}
          resizeMode="cover"
        />
        <View style={styles.thumbnailBadgeContainer}>
          <View style={styles.typeBadgeLive}>
            <Text style={styles.typeBadgeText}>LIVE</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.vodButton}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Player', {contentType: 'live', contentId: match.id})}>
          <MaterialIcons name="play-circle-outline" size={16} color={colors.white} style={styles.vodButtonIcon} />
          <Text style={styles.vodButtonText}>영상</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function ScheduledMatchCard({match}: {match: Match}) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View style={[styles.matchCard, styles.matchCardScheduled]}>
      <View style={styles.matchHeader}>
        <Text style={styles.matchRound}>{match.round}</Text>
        <Text style={styles.matchTime}>{match.time}</Text>
      </View>
      <View style={styles.matchBody}>
        <View style={styles.matchTeams}>
          <Text style={styles.teamName}>{match.home.name}</Text>
          <Text style={styles.matchVs}>vs</Text>
          <Text style={styles.teamName}>{match.away.name}</Text>
        </View>
      </View>
      <View style={styles.matchActions}>
        <TouchableOpacity style={styles.actionLink} activeOpacity={0.7}>
          <Text style={styles.actionLinkText}>예약</Text>
        </TouchableOpacity>
        <Text style={styles.actionDivider}>|</Text>
        <TouchableOpacity
          style={styles.actionLink}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('CompetitionDetail', {competitionId: match.competitionId})}>
          <Text style={styles.actionLinkTextGray}>정보</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function MatchCard({match}: {match: Match}) {
  switch (match.status) {
    case 'COMPLETED':
      return <CompletedMatchCard match={match} />;
    case 'LIVE':
      return <LiveMatchCard match={match} />;
    case 'SCHEDULED':
      return <ScheduledMatchCard match={match} />;
    default:
      return null;
  }
}

// ──────────────────── Main Screen ────────────────────

export default function TVScheduleScreen() {
  const [activeSport, setActiveSport] = useState<Sport>('전체');
  const [isContestFilter, setIsContestFilter] = useState(false);
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(3);
  const flatListRef = useRef<FlatList>(null);

  // Filter competitions by sport
  const filteredCompetitions = useMemo(() => {
    if (activeSport === '전체') {
      return mockCompetitions;
    }
    return mockCompetitions.filter(c => c.sport === activeSport);
  }, [activeSport]);

  // Filter matches by sport and month
  const filteredMatches = useMemo(() => {
    let matches = mockMatches;
    if (activeSport !== '전체') {
      matches = matches.filter(m => m.sport === activeSport);
    }
    matches = matches.filter(m => {
      const d = new Date(m.date);
      return d.getFullYear() === currentYear && d.getMonth() + 1 === currentMonth;
    });
    return matches;
  }, [activeSport, currentYear, currentMonth]);

  // Which months have matches (for dot indicators)
  const matchMonths = useMemo(() => {
    const months = new Set<number>();
    let matches = mockMatches;
    if (activeSport !== '전체') {
      matches = matches.filter(m => m.sport === activeSport);
    }
    matches.filter(m => {
      const d = new Date(m.date);
      return d.getFullYear() === currentYear;
    }).forEach(m => {
      months.add(new Date(m.date).getMonth() + 1);
    });
    return months;
  }, [activeSport, currentYear]);

  const groupedMatches = useMemo(
    () => getMatchesByDate(filteredMatches),
    [filteredMatches],
  );
  const sortedDates = useMemo(
    () => Object.keys(groupedMatches).sort(),
    [groupedMatches],
  );

  // Build flat list data with section headers
  const listData = useMemo(() => {
    const items: Array<
      | {type: 'sectionHeader'; title: string; key: string}
      | {type: 'competitionsCarousel'; key: string}
      | {type: 'yearMonthSelector'; key: string}
      | {type: 'dateHeader'; date: string; key: string}
      | {type: 'match'; match: Match; key: string}
      | {type: 'emptyMatches'; key: string}
    > = [];

    // Section: 오늘의 대회
    items.push({type: 'sectionHeader', title: '오늘의 대회', key: 'sec-comp'});
    items.push({type: 'competitionsCarousel', key: 'carousel'});

    // Section: 종목별 경기일정
    items.push({
      type: 'sectionHeader',
      title: '종목별 경기일정',
      key: 'sec-schedule',
    });
    items.push({type: 'yearMonthSelector', key: 'year-month-sel'});

    if (sortedDates.length === 0) {
      items.push({type: 'emptyMatches', key: 'empty'});
    } else {
      for (const date of sortedDates) {
        items.push({type: 'dateHeader', date, key: `dh-${date}`});
        for (const match of groupedMatches[date]) {
          items.push({type: 'match', match, key: match.id});
        }
      }
    }

    return items;
  }, [filteredCompetitions, sortedDates, groupedMatches]);

  const renderItem = useCallback(
    ({item}: {item: (typeof listData)[number]}) => {
      switch (item.type) {
        case 'sectionHeader':
          return <Text style={styles.sectionTitle}>{item.title}</Text>;
        case 'competitionsCarousel':
          return (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.competitionsScroll}
              contentContainerStyle={styles.competitionsContent}>
              {filteredCompetitions.map(comp => (
                <CompetitionCard key={comp.id} competition={comp} />
              ))}
              {filteredCompetitions.length === 0 && (
                <Text style={styles.emptyText}>대회 정보가 없습니다</Text>
              )}
            </ScrollView>
          );
        case 'yearMonthSelector':
          return (
            <YearMonthSelector
              year={currentYear}
              month={currentMonth}
              onYearChange={setCurrentYear}
              onMonthChange={setCurrentMonth}
              matchMonths={matchMonths}
            />
          );
        case 'dateHeader':
          return (
            <Text style={styles.dateHeader}>
              {formatDateHeader(item.date)}
            </Text>
          );
        case 'match':
          return <MatchCard match={item.match} />;
        case 'emptyMatches':
          return (
            <Text style={styles.emptyText}>
              해당 월에 경기 일정이 없습니다
            </Text>
          );
        default:
          return null;
      }
    },
    [
      filteredCompetitions,
      currentYear,
      currentMonth,
      matchMonths,
    ],
  );

  return (
    <View style={styles.safeArea}>
      {/* Common Top Bar */}
      <TopBar />

      {/* Filter section: 이달의 대회 + 스포츠 해시태그 */}
      <FilterSection
        isContestFilter={isContestFilter}
        onToggleContest={() => setIsContestFilter(prev => !prev)}
        activeSport={activeSport}
        onSportPress={setActiveSport}
      />

      {/* Main content */}
      <FlatList
        ref={flatListRef}
        data={listData}
        renderItem={renderItem}
        keyExtractor={item => item.key}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

// ──────────────────── Styles ────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },

  // Top Bar
  topBar: {
    height: TOP_BAR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: colors.bg,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.15,
        shadowRadius: 3,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  logoImage: {
    height: 24,
    width: 100,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topBarIcon: {
    marginLeft: 16,
    padding: 4,
  },

  // Filter section
  filterSection: {
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.grayDark,
  },
  filterRow: {
    paddingHorizontal: 12,
    alignItems: 'center',
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.grayDark,
  },
  filterPillActive: {
    backgroundColor: colors.green,
    borderColor: colors.green,
  },
  filterPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.grayLight,
  },
  filterPillTextActive: {
    color: colors.white,
  },
  hashtagChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.grayDark,
  },
  hashtagChipActive: {
    borderColor: colors.green,
    backgroundColor: 'rgba(0, 200, 83, 0.1)',
  },
  hashtagText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.grayLight,
  },
  hashtagTextActive: {
    color: colors.green,
  },

  // Year/Month selector
  yearMonthContainer: {
    marginBottom: 8,
  },
  yearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  yearArrow: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  yearText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
    minWidth: 60,
    textAlign: 'center',
  },
  monthTabsContent: {
    paddingHorizontal: 12,
    gap: 4,
  },
  monthTab: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  monthTabActive: {
    borderBottomColor: colors.green,
  },
  monthTabText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.gray,
  },
  monthTabTextActive: {
    color: colors.green,
    fontWeight: '700',
  },
  monthDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.green,
    marginTop: 4,
  },

  // List
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },

  // Section title
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
    marginTop: 24,
    marginBottom: 12,
  },

  // Competitions carousel
  competitionsScroll: {
    marginBottom: 8,
  },
  competitionsContent: {
    paddingRight: 16,
  },
  competitionCard: {
    width: 220,
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginRight: 12,
    overflow: 'hidden',
  },
  competitionImage: {
    width: '100%',
    height: 80,
    backgroundColor: colors.grayDark,
  },
  competitionInfo: {
    padding: 12,
  },
  competitionName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 4,
  },
  competitionDate: {
    fontSize: 11,
    color: colors.grayLight,
    marginBottom: 8,
  },
  competitionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sportBadge: {
    backgroundColor: colors.grayDark,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  sportBadgeText: {
    fontSize: 10,
    color: colors.grayLight,
    fontWeight: '600',
  },
  priceBadge: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  freeBadge: {
    backgroundColor: '#1B5E20',
  },
  paidBadge: {
    backgroundColor: '#B71C1C',
  },
  priceBadgeText: {
    fontSize: 10,
    color: colors.white,
    fontWeight: '600',
  },

  // Date header
  dateHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.grayLight,
    marginTop: 16,
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.grayDark,
  },

  // Match cards (shared)
  matchCard: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  matchRound: {
    fontSize: 12,
    color: colors.grayLight,
  },
  matchBody: {
    marginBottom: 10,
  },
  matchTeams: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  teamName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
    flex: 1,
    textAlign: 'center',
  },
  matchScore: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.white,
    minWidth: 60,
    textAlign: 'center',
  },
  matchVs: {
    fontSize: 14,
    color: colors.gray,
    minWidth: 30,
    textAlign: 'center',
  },
  matchTime: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
  },

  // Match card variants
  matchCardCompleted: {
    backgroundColor: '#1A1A1A',
    opacity: 0.85,
  },
  matchCardLive: {
    backgroundColor: '#0D2818',
    borderWidth: 1,
    borderColor: colors.green,
  },
  matchCardScheduled: {
    backgroundColor: colors.surface,
  },

  // Status badges
  statusBadgeCompleted: {
    backgroundColor: colors.gray,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusBadgeLive: {
    backgroundColor: colors.green,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.white,
  },

  // Thumbnail & VOD
  matchFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  matchThumbnail: {
    width: 100,
    height: 56,
    borderRadius: 6,
    backgroundColor: colors.grayDark,
  },
  thumbnailBadgeContainer: {
    position: 'absolute',
    left: 4,
    bottom: 4,
  },
  typeBadgeVod: {
    backgroundColor: '#1565C0',
    borderRadius: 3,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  typeBadgeLive: {
    backgroundColor: '#D32F2F',
    borderRadius: 3,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  typeBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.white,
  },
  vodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.green,
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  vodButtonIcon: {
    marginRight: 4,
  },
  vodButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.white,
  },

  // Scheduled actions
  matchActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionLink: {
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  actionLinkText: {
    fontSize: 13,
    color: colors.green,
    fontWeight: '600',
  },
  actionLinkTextGray: {
    fontSize: 13,
    color: colors.gray,
    fontWeight: '600',
  },
  actionDivider: {
    fontSize: 13,
    color: colors.grayDark,
  },

  // Empty
  emptyText: {
    fontSize: 14,
    color: colors.gray,
    textAlign: 'center',
    paddingVertical: 40,
  },
});
