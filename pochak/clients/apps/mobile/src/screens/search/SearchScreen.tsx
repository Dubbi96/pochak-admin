import React, {useState, useCallback, useEffect, useRef} from 'react';
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  TextInput,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Ionicons, MaterialIcons} from '@expo/vector-icons';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../navigation/types';
import MediaImage from '../../components/common/MediaImage';
import {colors} from '../../theme';
import {
  mockSearchTeams,
  mockSearchClubs,
  mockSearchLives,
  mockSearchCompetitions,
  mockSearchVideos,
  mockSearchClips,
  mockRecommendedClips,
  formatViewCount,
  getSearchSuggestions,
  getTrendingSearches,
} from '../../services/searchApi';
import type {
  SearchTeamItem,
  SearchClubItem,
  SearchLiveItem,
  SearchCompetitionItem,
  SearchVideoItem,
  SearchClipItem,
  SearchSuggestionItem,
  TrendingSearchTerm,
} from '../../services/searchApi';
import {analyticsService} from '../../services/analyticsService';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const GREEN = colors.green;
const BG = colors.bg;
const SURFACE = colors.surface;
const WHITE = colors.white;
const GRAY = colors.gray;
const GRAY_LIGHT = colors.grayLight;
const GRAY_DARK = colors.grayDark;

type SearchNavProp = NativeStackNavigationProp<RootStackParamList>;

type TabKey = '전체' | '팀' | '클럽' | '라이브' | '대회' | '영상' | '클립';
const TABS: TabKey[] = ['전체', '팀', '클럽', '라이브', '대회', '영상', '클립'];

// --- Section Components ---

function TeamSection({teams}: {teams: SearchTeamItem[]}) {
  const navigation = useNavigation<SearchNavProp>();

  return (
    <View style={styles.section}>
      <TouchableOpacity style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>팀</Text>
        <Ionicons name="chevron-forward" size={18} color={WHITE} />
      </TouchableOpacity>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.teamGrid}>
          {teams.map(team => (
            <TouchableOpacity
              key={team.id}
              style={styles.teamCard}
              onPress={() => navigation.navigate('TeamDetail', {teamId: team.id})}>
              <View style={styles.teamLogo}>
                <Text style={styles.teamLogoText}>{team.logoInitial}</Text>
              </View>
              <Text style={styles.teamName} numberOfLines={1}>
                {team.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function ClubSection({clubs}: {clubs: SearchClubItem[]}) {
  const navigation = useNavigation<SearchNavProp>();

  return (
    <View style={styles.section}>
      <TouchableOpacity style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>클럽</Text>
        <Ionicons name="chevron-forward" size={18} color={WHITE} />
      </TouchableOpacity>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.clubGrid}>
          {clubs.map(club => (
            <TouchableOpacity
              key={club.id}
              style={styles.clubCard}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('ClubDetail', {clubId: club.id})}>
              <View style={styles.clubLogo}>
                <Text style={styles.clubLogoText}>{club.logoInitial}</Text>
              </View>
              <Text style={styles.clubName} numberOfLines={1}>
                {club.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function LiveSection({lives}: {lives: SearchLiveItem[]}) {
  const navigation = useNavigation<SearchNavProp>();

  return (
    <View style={styles.section}>
      <TouchableOpacity style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>라이브</Text>
        <Ionicons name="chevron-forward" size={18} color={WHITE} />
      </TouchableOpacity>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {lives.map(live => (
          <TouchableOpacity
            key={live.id}
            style={styles.liveCard}
            onPress={() => navigation.navigate('Player', {contentType: 'live', contentId: live.id})}>
            <View style={styles.liveThumbnail}>
              <MediaImage
                uri={live.thumbnailUrl}
                style={styles.liveThumbnailImage}
              />
              <View style={styles.liveDateBadge}>
                <Text style={styles.liveDateBadgeText}>{live.time} 예정</Text>
              </View>
            </View>
            <Text style={styles.liveMatchText} numberOfLines={1}>
              {live.teamHome} vs {live.teamAway}
            </Text>
            <Text style={styles.liveMetaText}>
              {live.league}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

function CompetitionSection({
  competitions,
}: {
  competitions: SearchCompetitionItem[];
}) {
  const navigation = useNavigation<SearchNavProp>();

  return (
    <View style={styles.section}>
      <TouchableOpacity style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>대회</Text>
        <Ionicons name="chevron-forward" size={18} color={WHITE} />
      </TouchableOpacity>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {competitions.map(comp => (
          <TouchableOpacity
            key={comp.id}
            style={styles.competitionCard}
            onPress={() => navigation.navigate('CompetitionDetail', {competitionId: comp.id})}>
            <View style={styles.competitionThumbnail}>
              <MediaImage
                uri={comp.thumbnailUrl}
                style={styles.competitionThumbnailImage}
              />
              <View style={styles.competitionStatusBadge}>
                <Text style={styles.competitionStatusText}>{comp.status}</Text>
              </View>
            </View>
            <Text style={styles.competitionTitle} numberOfLines={1}>{comp.title}</Text>
            <Text style={styles.competitionMeta}>
              {comp.sport} | {comp.date}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

function VideoSection({videos}: {videos: SearchVideoItem[]}) {
  const navigation = useNavigation<SearchNavProp>();

  return (
    <View style={styles.section}>
      <TouchableOpacity style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>영상</Text>
        <Ionicons name="chevron-forward" size={18} color={WHITE} />
      </TouchableOpacity>
      {videos.map(video => (
        <TouchableOpacity
          key={video.id}
          style={styles.videoCard}
          onPress={() => navigation.navigate('Player', {contentType: 'vod', contentId: video.id})}>
          <View style={styles.videoThumbnail}>
            <MediaImage
              uri={video.thumbnailUrl}
              style={styles.videoThumbnailImage}
            />
            <View style={styles.videoDuration}>
              <Text style={styles.videoDurationText}>{video.duration}</Text>
            </View>
          </View>
          <View style={styles.videoInfo}>
            <Text style={styles.videoTitle} numberOfLines={2}>
              {video.title}
            </Text>
            <Text style={styles.videoDesc} numberOfLines={1}>
              {video.description}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function ClipSection({clips}: {clips: SearchClipItem[]}) {
  const navigation = useNavigation<SearchNavProp>();

  return (
    <View style={styles.section}>
      <TouchableOpacity style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>클립</Text>
        <Ionicons name="chevron-forward" size={18} color={WHITE} />
      </TouchableOpacity>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {clips.map(clip => (
          <TouchableOpacity
            key={clip.id}
            style={styles.clipCard}
            onPress={() => navigation.navigate('ClipPlayer', {contentId: clip.id})}>
            <View style={styles.clipThumbnail}>
              <MediaImage
                uri={clip.thumbnailUrl}
                style={styles.clipThumbnailImage}
              />
              <View style={styles.clipDuration}>
                <Text style={styles.clipDurationText}>{clip.duration}</Text>
              </View>
            </View>
            <Text style={styles.clipTitle} numberOfLines={1}>
              {clip.title}
            </Text>
            <Text style={styles.clipViews}>
              조회수 {formatViewCount(clip.viewCount)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

function EmptyState() {
  const navigation = useNavigation<SearchNavProp>();

  return (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="search-off" size={48} color={GRAY} />
      <Text style={styles.emptyText}>검색 결과가 없습니다</Text>
      <Text style={styles.emptySubText}>추천 CLIP/VOD</Text>
      <FlatList
        data={mockRecommendedClips}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.recommendedList}
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.recommendedCard}
            onPress={() => navigation.navigate('ClipPlayer', {contentId: item.id})}>
            <View style={styles.recommendedThumbnail}>
              <MediaImage
                uri={item.thumbnailUrl}
                style={styles.recommendedThumbnailImage}
              />
            </View>
            <Text style={styles.recommendedTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.recommendedViews}>
              조회수 {formatViewCount(item.viewCount)}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

function TrendingSection() {
  const trending = getTrendingSearches();

  const getDirectionIcon = (dir: TrendingSearchTerm['changeDirection']) => {
    switch (dir) {
      case 'UP':
        return {icon: 'arrow-up' as const, color: '#E51728'};
      case 'DOWN':
        return {icon: 'arrow-down' as const, color: '#4488FF'};
      case 'NEW':
        return {icon: 'sparkles' as const, color: GREEN};
      default:
        return {icon: 'remove' as const, color: GRAY};
    }
  };

  return (
    <View style={styles.trendingContainer}>
      <Text style={styles.trendingSectionTitle}>인기 검색어</Text>
      {trending.map(term => {
        const {icon, color} = getDirectionIcon(term.changeDirection);
        return (
          <TouchableOpacity key={term.rank} style={styles.trendingItem}>
            <Text style={styles.trendingRank}>{term.rank}</Text>
            <Text style={styles.trendingKeyword}>{term.keyword}</Text>
            <Ionicons name={icon} size={14} color={color} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function RecentSearchSection({
  recentSearches,
  onDelete,
  onClear,
  onSelect,
}: {
  recentSearches: string[];
  onDelete: (term: string) => void;
  onClear: () => void;
  onSelect: (term: string) => void;
}) {
  if (recentSearches.length === 0) return null;

  return (
    <View style={styles.recentContainer}>
      <View style={styles.recentHeader}>
        <Text style={styles.recentSectionTitle}>최근 검색어</Text>
        <TouchableOpacity onPress={onClear}>
          <Text style={styles.recentClearAll}>전체 삭제</Text>
        </TouchableOpacity>
      </View>
      {recentSearches.map(term => (
        <TouchableOpacity
          key={term}
          style={styles.recentItem}
          onPress={() => onSelect(term)}>
          <Ionicons name="time-outline" size={16} color={GRAY} />
          <Text style={styles.recentKeyword}>{term}</Text>
          <TouchableOpacity
            onPress={() => onDelete(term)}
            hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
            <Ionicons name="close" size={16} color={GRAY} />
          </TouchableOpacity>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const SEARCH_PAGE_SIZE = 10;

export default function SearchScreen() {
  const navigation = useNavigation<SearchNavProp>();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabKey>('전체');
  const [hasSearched, setHasSearched] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestionItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<TextInput>(null);

  // Load recent searches from AsyncStorage on mount
  useEffect(() => {
    AsyncStorage.getItem('pochak_recent_searches').then(data => {
      if (data) {
        try {
          setRecentSearches(JSON.parse(data));
        } catch {
          // ignore parse errors
        }
      }
    });
  }, []);

  // Pagination state for search results (Phase 8)
  const [searchPage, setSearchPage] = useState(0);
  const [hasMoreResults, setHasMoreResults] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    if (query.trim().length > 0 && !hasSearched) {
      const results = getSearchSuggestions(query);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query, hasSearched]);

  const handleSearch = useCallback(() => {
    if (query.trim().length > 0) {
      setHasSearched(true);
      setShowSuggestions(false);
      setSearchPage(0);
      setHasMoreResults(true);
      // Add to recent searches (deduplicate and keep max 10)
      setRecentSearches(prev => {
        const updated = [query.trim(), ...prev.filter(s => s !== query.trim())].slice(0, 10);
        AsyncStorage.setItem('pochak_recent_searches', JSON.stringify(updated));
        return updated;
      });
      // Analytics: track search with mock result count
      const totalResults =
        mockSearchTeams.length +
        mockSearchClubs.length +
        mockSearchLives.length +
        mockSearchCompetitions.length +
        mockSearchVideos.length +
        mockSearchClips.length;
      analyticsService.trackSearch(query.trim(), totalResults);
    }
  }, [query]);

  const handleLoadMore = useCallback(() => {
    if (!hasMoreResults || loadingMore || !hasSearched) return;
    setLoadingMore(true);
    // Phase 8: simulate loading delay for future API pagination
    // When real API is wired, replace with actual fetch(query, searchPage + 1)
    setTimeout(() => {
      setSearchPage(prev => prev + 1);
      // Mock: no more results after first page for now
      setHasMoreResults(false);
      setLoadingMore(false);
    }, 500);
  }, [hasMoreResults, loadingMore, hasSearched]);

  const handleSuggestionSelect = useCallback((text: string) => {
    setQuery(text);
    setShowSuggestions(false);
    setHasSearched(true);
    setRecentSearches(prev => {
      const updated = [text, ...prev.filter(s => s !== text)].slice(0, 10);
      AsyncStorage.setItem('pochak_recent_searches', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const handleRecentSelect = useCallback((term: string) => {
    setQuery(term);
    setHasSearched(true);
    setShowSuggestions(false);
  }, []);

  const handleDeleteRecent = useCallback((term: string) => {
    setRecentSearches(prev => {
      const updated = prev.filter(s => s !== term);
      AsyncStorage.setItem('pochak_recent_searches', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const handleClearRecent = useCallback(() => {
    setRecentSearches([]);
    AsyncStorage.removeItem('pochak_recent_searches');
  }, []);

  const hasResults =
    hasSearched &&
    (mockSearchTeams.length > 0 ||
      mockSearchClubs.length > 0 ||
      mockSearchLives.length > 0 ||
      mockSearchCompetitions.length > 0 ||
      mockSearchVideos.length > 0 ||
      mockSearchClips.length > 0);

  const renderResults = () => {
    if (!hasSearched) {
      return (
        <>
          <RecentSearchSection
            recentSearches={recentSearches}
            onDelete={handleDeleteRecent}
            onClear={handleClearRecent}
            onSelect={handleRecentSelect}
          />
          <TrendingSection />
        </>
      );
    }

    if (!hasResults) {
      return <EmptyState />;
    }

    const showTeams = activeTab === '전체' || activeTab === '팀';
    const showClubs = activeTab === '전체' || activeTab === '클럽';
    const showLives = activeTab === '전체' || activeTab === '라이브';
    const showCompetitions = activeTab === '전체' || activeTab === '대회';
    const showVideos = activeTab === '전체' || activeTab === '영상';
    const showClips = activeTab === '전체' || activeTab === '클립';

    return (
      <>
        {showTeams && mockSearchTeams.length > 0 && (
          <TeamSection teams={mockSearchTeams} />
        )}
        {showClubs && mockSearchClubs.length > 0 && (
          <ClubSection clubs={mockSearchClubs} />
        )}
        {showLives && mockSearchLives.length > 0 && (
          <LiveSection lives={mockSearchLives} />
        )}
        {showCompetitions && mockSearchCompetitions.length > 0 && (
          <CompetitionSection competitions={mockSearchCompetitions} />
        )}
        {showVideos && mockSearchVideos.length > 0 && (
          <VideoSection videos={mockSearchVideos} />
        )}
        {showClips && mockSearchClips.length > 0 && (
          <ClipSection clips={mockSearchClips} />
        )}
      </>
    );
  };

  const getSuggestionTypeLabel = (type: SearchSuggestionItem['type']) => {
    switch (type) {
      case 'TEAM':
        return '팀';
      case 'VIDEO':
        return '영상';
      case 'CLIP':
        return '클립';
      case 'COMPETITION':
        return '대회';
      default:
        return '';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />
      <View style={styles.container}>
        {/* Search Input */}
        <View style={styles.searchInputWrapper}>
          <View style={styles.searchBarRow}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={WHITE} />
            </TouchableOpacity>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color={GRAY} style={styles.searchIcon} />
            <TextInput
              ref={inputRef}
              style={styles.searchInput}
              placeholder="검색"
              placeholderTextColor={GRAY}
              value={query}
              onChangeText={text => {
                setQuery(text.slice(0, 25));
                if (hasSearched) {
                  setHasSearched(false);
                }
              }}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
              maxLength={25}
            />
            {query.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setQuery('');
                  setHasSearched(false);
                  setShowSuggestions(false);
                }}>
                <Ionicons name="close-circle" size={18} color={GRAY} />
              </TouchableOpacity>
            )}
          </View>
          </View>

          {/* Auto-complete Dropdown */}
          {showSuggestions && (
            <View style={styles.suggestionsDropdown}>
              {suggestions.map((item, index) => (
                <TouchableOpacity
                  key={`${item.id}-${index}`}
                  style={styles.suggestionItem}
                  onPress={() => handleSuggestionSelect(item.text)}>
                  <Ionicons name="search" size={16} color={GRAY} />
                  <Text style={styles.suggestionText} numberOfLines={1}>
                    {item.text}
                  </Text>
                  <View style={styles.suggestionTypeBadge}>
                    <Text style={styles.suggestionTypeText}>
                      {getSuggestionTypeLabel(item.type)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Tab Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabScrollView}
          contentContainerStyle={styles.tabContainer}>
          {TABS.map(tab => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tabChip,
                activeTab === tab && styles.tabChipActive,
              ]}
              onPress={() => setActiveTab(tab)}>
              <Text
                style={[
                  styles.tabChipText,
                  activeTab === tab && styles.tabChipTextActive,
                ]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Results */}
        <ScrollView
          style={styles.resultsScroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.resultsContent}
          keyboardShouldPersistTaps="handled"
          onScroll={({nativeEvent}) => {
            const {layoutMeasurement, contentOffset, contentSize} = nativeEvent;
            const isNearEnd =
              layoutMeasurement.height + contentOffset.y >=
              contentSize.height - 200;
            if (isNearEnd && hasSearched) {
              handleLoadMore();
            }
          }}
          scrollEventThrottle={400}>
          {renderResults()}
          {loadingMore && (
            <View style={styles.loadingMoreContainer}>
              <ActivityIndicator size="small" color={GREEN} />
              <Text style={styles.loadingMoreText}>불러오는 중...</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG,
  },
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  // Search Input
  searchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingLeft: 8,
    paddingRight: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: GREEN,
    backgroundColor: SURFACE,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: WHITE,
    paddingVertical: 0,
  },
  // Tab Chips
  tabScrollView: {
    maxHeight: 48,
    marginTop: 12,
  },
  tabContainer: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: 'center',
  },
  tabChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: GRAY_DARK,
  },
  tabChipActive: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },
  tabChipText: {
    fontSize: 13,
    color: GRAY_LIGHT,
    fontWeight: '500',
  },
  tabChipTextActive: {
    color: WHITE,
    fontWeight: '700',
  },
  // Results
  resultsScroll: {
    flex: 1,
    marginTop: 8,
  },
  resultsContent: {
    paddingBottom: 40,
  },
  // Sections
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: WHITE,
    marginRight: 4,
  },
  // Team Section
  teamGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  teamCard: {
    width: 72,
    alignItems: 'center',
  },
  teamLogo: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: GRAY_DARK,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamLogoText: {
    fontSize: 20,
    fontWeight: '700',
    color: GREEN,
  },
  teamName: {
    fontSize: 11,
    color: GRAY_LIGHT,
    marginTop: 4,
    textAlign: 'center',
  },
  // Club Section
  clubGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  clubCard: {
    width: 72,
    alignItems: 'center',
  },
  clubLogo: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: GRAY_DARK,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clubLogoText: {
    fontSize: 16,
    fontWeight: '700',
    color: GREEN,
  },
  clubName: {
    fontSize: 11,
    color: GRAY_LIGHT,
    marginTop: 4,
    textAlign: 'center',
  },
  // Live Section
  liveCard: {
    width: 180,
    marginRight: 12,
  },
  liveThumbnail: {
    width: 180,
    height: 100,
    borderRadius: 8,
    backgroundColor: SURFACE,
    overflow: 'hidden',
  },
  liveThumbnailImage: {
    width: '100%',
    height: '100%',
  },
  liveDateBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: GREEN,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  liveDateBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: WHITE,
  },
  liveMatchText: {
    fontSize: 13,
    fontWeight: '600',
    color: WHITE,
    marginTop: 6,
  },
  liveMetaText: {
    fontSize: 11,
    color: GRAY,
    marginTop: 2,
  },
  // Competition Section
  competitionCard: {
    width: 200,
    marginRight: 12,
  },
  competitionThumbnail: {
    width: 200,
    height: 112,
    borderRadius: 8,
    backgroundColor: SURFACE,
    overflow: 'hidden',
  },
  competitionThumbnailImage: {
    width: '100%',
    height: '100%',
  },
  competitionStatusBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: GREEN,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  competitionStatusText: {
    fontSize: 10,
    fontWeight: '700',
    color: WHITE,
  },
  competitionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: WHITE,
    marginTop: 6,
  },
  competitionMeta: {
    fontSize: 11,
    color: GRAY,
    marginTop: 2,
  },
  // Video Section
  videoCard: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  videoThumbnail: {
    width: 140,
    height: 80,
    borderRadius: 8,
    backgroundColor: SURFACE,
    overflow: 'hidden',
  },
  videoThumbnailImage: {
    width: '100%',
    height: '100%',
  },
  videoDuration: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  videoDurationText: {
    fontSize: 10,
    color: WHITE,
    fontWeight: '600',
  },
  videoInfo: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'center',
  },
  videoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: WHITE,
  },
  videoDesc: {
    fontSize: 12,
    color: GRAY,
    marginTop: 4,
  },
  // Clip Section
  clipCard: {
    width: 120,
    marginRight: 12,
  },
  clipThumbnail: {
    width: 120,
    height: Math.round(120 * (16 / 9)),
    borderRadius: 8,
    backgroundColor: SURFACE,
    overflow: 'hidden',
  },
  clipThumbnailImage: {
    width: '100%',
    height: '100%',
  },
  clipDuration: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  clipDurationText: {
    fontSize: 10,
    color: WHITE,
  },
  clipTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: WHITE,
    marginTop: 6,
  },
  clipViews: {
    fontSize: 11,
    color: GRAY_LIGHT,
    marginTop: 2,
  },
  // Empty State
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: GRAY_LIGHT,
    marginTop: 12,
  },
  emptySubText: {
    fontSize: 14,
    fontWeight: '600',
    color: WHITE,
    marginTop: 32,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  recommendedList: {
    paddingRight: 16,
  },
  recommendedCard: {
    width: 140,
    marginRight: 12,
  },
  recommendedThumbnail: {
    width: 140,
    height: 180,
    borderRadius: 8,
    backgroundColor: SURFACE,
    overflow: 'hidden',
  },
  recommendedThumbnailImage: {
    width: '100%',
    height: '100%',
  },
  recommendedTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: WHITE,
    marginTop: 6,
  },
  recommendedViews: {
    fontSize: 11,
    color: GRAY,
    marginTop: 2,
  },
  // Initial State
  initialState: {
    alignItems: 'center',
    paddingTop: 80,
  },
  initialText: {
    fontSize: 14,
    color: GRAY,
    marginTop: 12,
  },
  // Search Input Wrapper (for suggestions dropdown positioning)
  searchInputWrapper: {
    zIndex: 10,
  },
  // Auto-complete Suggestions Dropdown
  suggestionsDropdown: {
    marginHorizontal: 16,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: GRAY_DARK,
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    overflow: 'hidden',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: GRAY_DARK,
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
    color: WHITE,
    marginLeft: 10,
  },
  suggestionTypeBadge: {
    backgroundColor: GRAY_DARK,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  suggestionTypeText: {
    fontSize: 10,
    color: GRAY_LIGHT,
    fontWeight: '600',
  },
  // Trending Section
  trendingContainer: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  trendingSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: WHITE,
    marginBottom: 12,
  },
  trendingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: GRAY_DARK,
  },
  trendingRank: {
    width: 24,
    fontSize: 15,
    fontWeight: '700',
    color: GREEN,
    textAlign: 'center',
  },
  trendingKeyword: {
    flex: 1,
    fontSize: 14,
    color: WHITE,
    marginLeft: 12,
  },
  // Recent Searches Section
  recentContainer: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recentSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: WHITE,
  },
  recentClearAll: {
    fontSize: 12,
    color: GRAY,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: GRAY_DARK,
  },
  recentKeyword: {
    flex: 1,
    fontSize: 14,
    color: GRAY_LIGHT,
    marginLeft: 10,
  },
  // Loading more indicator
  loadingMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  loadingMoreText: {
    fontSize: 13,
    color: GRAY,
  },
});
