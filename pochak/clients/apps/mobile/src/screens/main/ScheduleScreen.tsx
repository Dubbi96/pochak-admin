import React, {useState, useMemo, useCallback, useRef} from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
  Platform,
  Dimensions,
} from 'react-native';
import {Ionicons, MaterialIcons} from '@expo/vector-icons';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../navigation/types';
import {colors} from '../../theme';
import {
  mockCompetitions,
  mockMatches,
  getMatchesByDate,
  formatDateHeader,
  type Sport,
  type Competition,
  type Match,
} from '../../services/scheduleApi';

type ScheduleNavProp = NativeStackNavigationProp<RootStackParamList>;

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const TOP_BAR_HEIGHT = 52;

// Tab identifier: either '이달의대회' or a sport hashtag
type TabId = '이달의대회' | Sport;

const TAB_ITEMS: {id: TabId; label: string}[] = [
  {id: '이달의대회', label: '이달의대회'},
  {id: '축구', label: '#축구'},
  {id: '야구', label: '#야구'},
  {id: '배구', label: '#배구'},
  {id: '핸드볼', label: '#핸드볼'},
  {id: '농구', label: '#농구'},
];

// ─── Common Top Bar ─────────────────────────────────────

function TopBar() {
  const navigation = useNavigation<ScheduleNavProp>();

  return (
    <View style={styles.topBar}>
      <Text style={styles.topBarTitle}>경기일정</Text>
      <View style={styles.topBarRight}>
        <TouchableOpacity
          style={styles.topBarIcon}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Search')}>
          <Ionicons name="search-outline" size={22} color={colors.white} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.topBarIcon} activeOpacity={0.7}>
          <Ionicons name="qr-code-outline" size={20} color={colors.white} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.topBarIcon} activeOpacity={0.7}>
          <Ionicons name="menu-outline" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Sport Tabs ─────────────────────────────────────────

function SportTabs({
  activeTab,
  onTabPress,
}: {
  activeTab: TabId;
  onTabPress: (tab: TabId) => void;
}) {
  return (
    <View style={styles.tabSection}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabRow}>
        {TAB_ITEMS.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tabPill, isActive && styles.tabPillActive]}
              onPress={() => onTabPress(tab.id)}>
              <Text
                style={[
                  styles.tabPillText,
                  isActive && styles.tabPillTextActive,
                ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

// ─── Year/Month Dropdown Selectors ──────────────────────

function YearMonthDropdowns({
  year,
  month,
  onYearChange,
  onMonthChange,
}: {
  year: number;
  month: number;
  onYearChange: (y: number) => void;
  onMonthChange: (m: number) => void;
}) {
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  const years = [2024, 2025, 2026, 2027, 2028];
  const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  return (
    <View style={styles.yearMonthRow}>
      {/* Year dropdown */}
      <View style={styles.dropdownWrapper}>
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => {
            setShowYearPicker(!showYearPicker);
            setShowMonthPicker(false);
          }}>
          <Text style={styles.dropdownText}>{year}년</Text>
          <Ionicons
            name="chevron-down"
            size={14}
            color={colors.grayLight}
            style={styles.dropdownArrow}
          />
        </TouchableOpacity>
        {showYearPicker && (
          <View style={styles.dropdownMenu}>
            {years.map(y => (
              <TouchableOpacity
                key={y}
                style={[
                  styles.dropdownItem,
                  y === year && styles.dropdownItemActive,
                ]}
                onPress={() => {
                  onYearChange(y);
                  setShowYearPicker(false);
                }}>
                <Text
                  style={[
                    styles.dropdownItemText,
                    y === year && styles.dropdownItemTextActive,
                  ]}>
                  {y}년
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Month dropdown */}
      <View style={styles.dropdownWrapper}>
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => {
            setShowMonthPicker(!showMonthPicker);
            setShowYearPicker(false);
          }}>
          <Text style={styles.dropdownText}>
            {String(month).padStart(2, '0')}월
          </Text>
          <Ionicons
            name="chevron-down"
            size={14}
            color={colors.grayLight}
            style={styles.dropdownArrow}
          />
        </TouchableOpacity>
        {showMonthPicker && (
          <View style={styles.dropdownMenu}>
            {months.map(m => (
              <TouchableOpacity
                key={m}
                style={[
                  styles.dropdownItem,
                  m === month && styles.dropdownItemActive,
                ]}
                onPress={() => {
                  onMonthChange(m);
                  setShowMonthPicker(false);
                }}>
                <Text
                  style={[
                    styles.dropdownItemText,
                    m === month && styles.dropdownItemTextActive,
                  ]}>
                  {String(m).padStart(2, '0')}월
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

// ─── Competition Card (이달의대회 full-width) ───────────

function CompetitionFullCard({competition}: {competition: Competition}) {
  const navigation = useNavigation<ScheduleNavProp>();

  return (
    <View style={styles.compFullCard}>
      {/* Blue gradient banner with logo */}
      <View style={styles.compFullBanner}>
        <Image
          source={{uri: competition.imageUrl}}
          style={styles.compFullBannerImage}
          resizeMode="cover"
        />
        <View style={styles.compFullBannerOverlay} />
        <Image
          source={{uri: competition.imageUrl}}
          style={styles.compFullLogo}
          resizeMode="contain"
        />
      </View>

      {/* Info below banner */}
      <View style={styles.compFullInfo}>
        <View style={styles.compFullInfoTop}>
          <View style={{flex: 1}}>
            <Text style={styles.compFullName} numberOfLines={1}>
              {competition.name}
            </Text>
            <Text style={styles.compFullDate}>
              {competition.startDate} ~ {competition.endDate}
            </Text>
          </View>
          <TouchableOpacity style={styles.compFullMenu} activeOpacity={0.7}>
            <Ionicons
              name="ellipsis-horizontal"
              size={20}
              color={colors.grayLight}
            />
          </TouchableOpacity>
        </View>

        {/* Tags row */}
        <View style={styles.compFullTags}>
          {(competition.tags || [competition.sport]).map((tag, idx) => (
            <React.Fragment key={tag}>
              {idx > 0 && <Text style={styles.compTagDivider}>|</Text>}
              <Text style={styles.compTagText}>{tag}</Text>
            </React.Fragment>
          ))}
        </View>
      </View>
    </View>
  );
}

// ─── Competition Carousel (sport tab top) ───────────────

function CompetitionCarousel({
  competitions,
}: {
  competitions: Competition[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (competitions.length === 0) return null;

  return (
    <View style={styles.carouselContainer}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={e => {
          const idx = Math.round(
            e.nativeEvent.contentOffset.x / (SCREEN_WIDTH - 32),
          );
          setActiveIndex(idx);
        }}
        contentContainerStyle={styles.carouselContent}>
        {competitions.map(comp => (
          <View key={comp.id} style={styles.carouselCard}>
            <Image
              source={{uri: comp.imageUrl}}
              style={styles.carouselImage}
              resizeMode="cover"
            />
            <View style={styles.carouselOverlay}>
              <Text style={styles.carouselName} numberOfLines={1}>
                {comp.name}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
      {/* Dot indicators */}
      {competitions.length > 1 && (
        <View style={styles.dotsRow}>
          {competitions.map((_, idx) => (
            <View
              key={idx}
              style={[styles.dot, idx === activeIndex && styles.dotActive]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

// ─── Match Row: TEAM_VS_TEAM ────────────────────────────

function TeamVsTeamRow({match}: {match: Match}) {
  const navigation = useNavigation<ScheduleNavProp>();
  const isLive = match.status === 'LIVE';
  const isCompleted = match.status === 'COMPLETED';
  const isScheduled = match.status === 'SCHEDULED';

  return (
    <View style={[styles.matchRow, isLive && styles.matchRowLive]}>
      {/* Left: Teams + time */}
      <View style={styles.matchLeft}>
        <View style={styles.matchTeamRow}>
          <View style={styles.teamLogoSmall}>
            {match.home.logo ? (
              <Image
                source={{uri: match.home.logo}}
                style={styles.teamLogoImg}
              />
            ) : (
              <View style={styles.teamLogoPlaceholder} />
            )}
          </View>
          <Text
            style={[styles.matchTeamName, isLive && styles.matchTextLive]}
            numberOfLines={1}>
            {match.home.name}
          </Text>
        </View>
        <View style={styles.matchTeamRow}>
          <View style={styles.teamLogoSmall}>
            {match.away.logo ? (
              <Image
                source={{uri: match.away.logo}}
                style={styles.teamLogoImg}
              />
            ) : (
              <View style={styles.teamLogoPlaceholder} />
            )}
          </View>
          <Text
            style={[styles.matchTeamName, isLive && styles.matchTextLive]}
            numberOfLines={1}>
            {match.away.name}
          </Text>
        </View>
        <Text style={[styles.matchTimeText, isLive && styles.matchTimeLive]}>
          {match.time}{' '}
          {isLive && (
            <Text style={styles.liveIndicator}>LIVE</Text>
          )}
          {isCompleted && <Text style={styles.completedIndicator}>종료</Text>}
        </Text>
      </View>

      {/* Center: Score */}
      <View style={styles.matchCenter}>
        {isScheduled ? (
          <Text style={styles.matchScoreText}>- : -</Text>
        ) : (
          <Text
            style={[styles.matchScoreText, isLive && styles.matchScoreLive]}>
            {match.home.score ?? '-'} : {match.away.score ?? '-'}
          </Text>
        )}
      </View>

      {/* Right: Thumbnail with play/bell */}
      <TouchableOpacity
        style={styles.matchRight}
        activeOpacity={0.7}
        onPress={() => {
          if (isCompleted && match.vodUrl) {
            navigation.navigate('Player', {
              contentType: 'vod',
              contentId: match.id,
            });
          } else if (isLive) {
            navigation.navigate('Player', {
              contentType: 'live',
              contentId: match.id,
            });
          }
        }}>
        <Image
          source={{uri: match.thumbnailUrl}}
          style={[
            styles.matchThumbnail,
            isLive && styles.matchThumbnailLive,
          ]}
          resizeMode="cover"
        />
        {/* Overlay icon */}
        {(isCompleted || isLive) && (
          <View style={styles.thumbnailPlayOverlay}>
            <MaterialIcons name="play-arrow" size={24} color={colors.white} />
          </View>
        )}
        {isScheduled && (
          <View style={styles.thumbnailBellOverlay}>
            <Ionicons
              name="notifications-outline"
              size={18}
              color={colors.white}
            />
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

// ─── Match Row: PLAYER_VS_PLAYER ────────────────────────

function PlayerVsPlayerRow({match}: {match: Match}) {
  const navigation = useNavigation<ScheduleNavProp>();
  const isLive = match.status === 'LIVE';
  const isCompleted = match.status === 'COMPLETED';

  return (
    <View style={[styles.matchRow, isLive && styles.matchRowLive]}>
      {/* Left: Player avatars + names with colored dots */}
      <View style={styles.matchLeft}>
        <View style={styles.matchTeamRow}>
          <View style={[styles.playerDot, {backgroundColor: '#4488FF'}]} />
          <View style={styles.playerAvatarSmall}>
            {match.home.logo ? (
              <Image
                source={{uri: match.home.logo}}
                style={styles.teamLogoImg}
              />
            ) : (
              <View style={styles.playerAvatarPlaceholder} />
            )}
          </View>
          <Text style={styles.matchTeamName} numberOfLines={1}>
            {match.home.name}
          </Text>
        </View>
        <View style={styles.matchTeamRow}>
          <View style={[styles.playerDot, {backgroundColor: '#FF4444'}]} />
          <View style={styles.playerAvatarSmall}>
            {match.away.logo ? (
              <Image
                source={{uri: match.away.logo}}
                style={styles.teamLogoImg}
              />
            ) : (
              <View style={styles.playerAvatarPlaceholder} />
            )}
          </View>
          <Text style={styles.matchTeamName} numberOfLines={1}>
            {match.away.name}
          </Text>
        </View>
      </View>

      {/* Center: 승/패 text */}
      <View style={styles.matchCenter}>
        {isCompleted && match.result ? (
          <Text
            style={[
              styles.matchResultText,
              match.result === '승'
                ? styles.resultWin
                : styles.resultLose,
            ]}>
            {match.result}
          </Text>
        ) : (
          <Text style={styles.matchScoreText}>- : -</Text>
        )}
      </View>

      {/* Right: Thumbnail */}
      <TouchableOpacity
        style={styles.matchRight}
        activeOpacity={0.7}
        onPress={() => {
          if (isCompleted && match.vodUrl) {
            navigation.navigate('Player', {
              contentType: 'vod',
              contentId: match.id,
            });
          } else if (isLive) {
            navigation.navigate('Player', {
              contentType: 'live',
              contentId: match.id,
            });
          }
        }}>
        <Image
          source={{uri: match.thumbnailUrl}}
          style={[
            styles.matchThumbnail,
            isLive && styles.matchThumbnailLive,
          ]}
          resizeMode="cover"
        />
        {(isCompleted || isLive) && (
          <View style={styles.thumbnailPlayOverlay}>
            <MaterialIcons name="play-arrow" size={24} color={colors.white} />
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

// ─── Match Row: RANKING ─────────────────────────────────

function RankingRow({match}: {match: Match}) {
  const navigation = useNavigation<ScheduleNavProp>();

  return (
    <View style={styles.matchRow}>
      {/* Left: Ranking entries */}
      <View style={styles.matchLeftRanking}>
        {(match.rankings || []).map(entry => (
          <Text key={entry.rank} style={styles.rankingEntry}>
            <Text style={styles.rankingRank}>{entry.rank}위</Text>
            <Text style={styles.rankingDivider}>|</Text>
            <Text style={styles.rankingCountry}>{entry.country}</Text>{' '}
            <Text style={styles.rankingRecord}>{entry.record}</Text>
          </Text>
        ))}
      </View>

      {/* Right: Thumbnail */}
      <TouchableOpacity
        style={styles.matchRight}
        activeOpacity={0.7}
        onPress={() => {
          if (match.vodUrl) {
            navigation.navigate('Player', {
              contentType: 'vod',
              contentId: match.id,
            });
          }
        }}>
        <Image
          source={{uri: match.thumbnailUrl}}
          style={styles.matchThumbnail}
          resizeMode="cover"
        />
        {match.vodUrl && (
          <View style={styles.thumbnailPlayOverlay}>
            <MaterialIcons name="play-arrow" size={24} color={colors.white} />
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

// ─── Match Row dispatcher ───────────────────────────────

function MatchRow({match}: {match: Match}) {
  switch (match.matchType) {
    case 'PLAYER_VS_PLAYER':
      return <PlayerVsPlayerRow match={match} />;
    case 'RANKING':
      return <RankingRow match={match} />;
    case 'TEAM_VS_TEAM':
    default:
      return <TeamVsTeamRow match={match} />;
  }
}

// ──────────────────── Main Screen ────────────────────────

export default function ScheduleScreen() {
  const [activeTab, setActiveTab] = useState<TabId>('이달의대회');
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(1);
  const flatListRef = useRef<FlatList>(null);

  const isContestTab = activeTab === '이달의대회';

  // For contest tab: filter competitions by month/year
  const filteredCompetitions = useMemo(() => {
    return mockCompetitions.filter(c => {
      const start = new Date(c.startDate);
      const end = new Date(c.endDate);
      const monthStart = new Date(currentYear, currentMonth - 1, 1);
      const monthEnd = new Date(currentYear, currentMonth, 0);
      return start <= monthEnd && end >= monthStart;
    });
  }, [currentYear, currentMonth]);

  // For sport tabs: filter competitions by sport
  const sportCompetitions = useMemo(() => {
    if (isContestTab) return [];
    const sport = activeTab as Sport;
    return mockCompetitions.filter(c => c.sport === sport);
  }, [activeTab, isContestTab]);

  // Filter matches by sport and month
  const filteredMatches = useMemo(() => {
    if (isContestTab) return [];
    const sport = activeTab as Sport;
    return mockMatches
      .filter(m => m.sport === sport)
      .filter(m => {
        const d = new Date(m.date);
        return (
          d.getFullYear() === currentYear && d.getMonth() + 1 === currentMonth
        );
      });
  }, [activeTab, isContestTab, currentYear, currentMonth]);

  const groupedMatches = useMemo(
    () => getMatchesByDate(filteredMatches),
    [filteredMatches],
  );
  const sortedDates = useMemo(
    () => Object.keys(groupedMatches).sort(),
    [groupedMatches],
  );

  // Build flat list data
  const listData = useMemo(() => {
    const items: Array<
      | {type: 'yearMonthSelector'; key: string}
      | {type: 'competitionFull'; competition: Competition; key: string}
      | {type: 'competitionCarousel'; key: string}
      | {type: 'dateHeader'; date: string; key: string}
      | {type: 'match'; match: Match; key: string}
      | {type: 'empty'; message: string; key: string}
    > = [];

    // Year/Month selector always shown
    items.push({type: 'yearMonthSelector', key: 'ym-sel'});

    if (isContestTab) {
      // 이달의대회: full-width competition cards
      if (filteredCompetitions.length === 0) {
        items.push({
          type: 'empty',
          message: '이번 달 대회 정보가 없습니다',
          key: 'empty-comp',
        });
      } else {
        for (const comp of filteredCompetitions) {
          items.push({
            type: 'competitionFull',
            competition: comp,
            key: `comp-${comp.id}`,
          });
        }
      }
    } else {
      // Sport tab: carousel at top, then date-grouped matches
      if (sportCompetitions.length > 0) {
        items.push({type: 'competitionCarousel', key: 'carousel'});
      }

      if (sortedDates.length === 0) {
        items.push({
          type: 'empty',
          message: '해당 월에 경기 일정이 없습니다',
          key: 'empty-matches',
        });
      } else {
        for (const date of sortedDates) {
          items.push({type: 'dateHeader', date, key: `dh-${date}`});
          for (const match of groupedMatches[date]) {
            items.push({type: 'match', match, key: match.id});
          }
        }
      }
    }

    return items;
  }, [
    isContestTab,
    filteredCompetitions,
    sportCompetitions,
    sortedDates,
    groupedMatches,
  ]);

  const renderItem = useCallback(
    ({item}: {item: (typeof listData)[number]}) => {
      switch (item.type) {
        case 'yearMonthSelector':
          return (
            <YearMonthDropdowns
              year={currentYear}
              month={currentMonth}
              onYearChange={setCurrentYear}
              onMonthChange={setCurrentMonth}
            />
          );
        case 'competitionFull':
          return <CompetitionFullCard competition={item.competition} />;
        case 'competitionCarousel':
          return <CompetitionCarousel competitions={sportCompetitions} />;
        case 'dateHeader':
          return (
            <Text style={styles.dateHeader}>
              {formatDateHeader(item.date)}
            </Text>
          );
        case 'match':
          return <MatchRow match={item.match} />;
        case 'empty':
          return <Text style={styles.emptyText}>{item.message}</Text>;
        default:
          return null;
      }
    },
    [currentYear, currentMonth, sportCompetitions],
  );

  return (
    <View style={styles.safeArea}>
      <TopBar />
      <SportTabs activeTab={activeTab} onTabPress={setActiveTab} />
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

// ──────────────────── Styles ────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },

  // ── Top Bar ──
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
      android: {elevation: 4},
    }),
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topBarIcon: {
    marginLeft: 16,
    padding: 4,
  },

  // ── Sport Tabs ──
  tabSection: {
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.grayDark,
  },
  tabRow: {
    paddingHorizontal: 12,
    alignItems: 'center',
    gap: 8,
  },
  tabPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.grayDark,
  },
  tabPillActive: {
    backgroundColor: colors.green,
    borderColor: colors.green,
  },
  tabPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.grayLight,
  },
  tabPillTextActive: {
    color: colors.white,
  },

  // ── Year/Month Dropdowns ──
  yearMonthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  dropdownWrapper: {
    position: 'relative',
    zIndex: 10,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.grayDark,
  },
  dropdownText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  dropdownArrow: {
    marginLeft: 6,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 44,
    left: 0,
    minWidth: 100,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.grayDark,
    zIndex: 100,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {elevation: 8},
    }),
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  dropdownItemActive: {
    backgroundColor: 'rgba(0, 200, 83, 0.15)',
  },
  dropdownItemText: {
    fontSize: 13,
    color: colors.grayLight,
  },
  dropdownItemTextActive: {
    color: colors.green,
    fontWeight: '700',
  },

  // ── Competition Full Card (이달의대회) ──
  compFullCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  compFullBanner: {
    width: '100%',
    height: 140,
    position: 'relative',
  },
  compFullBannerImage: {
    width: '100%',
    height: '100%',
  },
  compFullBannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(13, 71, 161, 0.6)',
  },
  compFullLogo: {
    position: 'absolute',
    right: 16,
    top: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  compFullInfo: {
    padding: 14,
  },
  compFullInfoTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  compFullName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 4,
  },
  compFullDate: {
    fontSize: 12,
    color: colors.grayLight,
  },
  compFullMenu: {
    padding: 4,
    marginLeft: 8,
  },
  compFullTags: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 4,
  },
  compTagText: {
    fontSize: 12,
    color: colors.grayLight,
    fontWeight: '500',
  },
  compTagDivider: {
    fontSize: 12,
    color: colors.grayDark,
    marginHorizontal: 2,
  },

  // ── Competition Carousel (sport tab) ──
  carouselContainer: {
    marginBottom: 12,
  },
  carouselContent: {},
  carouselCard: {
    width: SCREEN_WIDTH - 32,
    height: 100,
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: 8,
    position: 'relative',
  },
  carouselImage: {
    width: '100%',
    height: '100%',
  },
  carouselOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
    padding: 12,
  },
  carouselName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.grayDark,
  },
  dotActive: {
    backgroundColor: colors.green,
  },

  // ── Match Row (horizontal layout per PDF) ──
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  matchRowLive: {
    backgroundColor: '#0D2818',
    borderWidth: 1,
    borderColor: colors.green,
  },
  matchLeft: {
    flex: 1,
    marginRight: 8,
  },
  matchLeftRanking: {
    flex: 1,
    marginRight: 8,
  },
  matchTeamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  teamLogoSmall: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  teamLogoImg: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  teamLogoPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.grayDark,
  },
  matchTeamName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.white,
    flex: 1,
  },
  matchTimeText: {
    fontSize: 11,
    color: colors.grayLight,
    marginTop: 4,
  },
  matchTimeLive: {
    color: colors.green,
  },
  liveIndicator: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D32F2F',
  },
  completedIndicator: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.gray,
  },
  matchTextLive: {
    color: colors.green,
  },

  // Center: score
  matchCenter: {
    width: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  matchScoreText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
  },
  matchScoreLive: {
    color: colors.green,
  },
  matchResultText: {
    fontSize: 16,
    fontWeight: '700',
  },
  resultWin: {
    color: '#4488FF',
  },
  resultLose: {
    color: '#FF4444',
  },

  // Right: thumbnail
  matchRight: {
    width: 96,
    height: 56,
    borderRadius: 6,
    overflow: 'hidden',
    position: 'relative',
  },
  matchThumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
    backgroundColor: colors.grayDark,
  },
  matchThumbnailLive: {
    borderWidth: 2,
    borderColor: '#D32F2F',
    borderRadius: 6,
  },
  thumbnailPlayOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailBellOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Player vs Player extras
  playerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  playerAvatarSmall: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  playerAvatarPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.grayDark,
  },

  // Ranking
  rankingEntry: {
    fontSize: 12,
    color: colors.white,
    marginBottom: 3,
  },
  rankingRank: {
    fontWeight: '700',
    color: colors.grayLight,
  },
  rankingDivider: {
    color: colors.grayDark,
    marginHorizontal: 2,
  },
  rankingCountry: {
    fontWeight: '600',
    color: colors.white,
  },
  rankingRecord: {
    color: colors.grayLight,
    fontWeight: '500',
  },

  // ── Date header ──
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

  // ── List ──
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },

  // ── Empty ──
  emptyText: {
    fontSize: 14,
    color: colors.gray,
    textAlign: 'center',
    paddingVertical: 40,
  },
});
