import React, {useState, useMemo, useCallback} from 'react';
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Dimensions,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../navigation/types';
import MediaImage from '../../components/common/MediaImage';
import {colors} from '../../theme';
import {
  SPORTS,
  mockVideos,
  mockClips,
  type Sport,
  type VideoItem,
} from '../../services/scheduleApi';

type VideoListNavProp = NativeStackNavigationProp<RootStackParamList>;

const SCREEN_WIDTH = Dimensions.get('window').width;
const CLIP_CARD_WIDTH = (SCREEN_WIDTH - 16 * 2 - 12) / 2;

type VideoTab = 'LIVE' | 'VOD' | 'CLIP';
type SortOrder = '최신순' | '인기순';

// ──────────────────── Sub-components ────────────────────

function TopTab({
  tab,
  isActive,
  onPress,
}: {
  tab: VideoTab;
  isActive: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.topTab, isActive && styles.topTabActive]}
      onPress={onPress}
      activeOpacity={0.7}>
      <Text style={[styles.topTabText, isActive && styles.topTabTextActive]}>
        {tab}
      </Text>
    </TouchableOpacity>
  );
}

function SportDropdown({
  selected,
  onSelect,
  isOpen,
  onToggle,
}: {
  selected: Sport;
  onSelect: (s: Sport) => void;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <View style={styles.dropdownWrapper}>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={onToggle}
        activeOpacity={0.7}>
        <Text style={styles.dropdownButtonText}>{selected}</Text>
        <MaterialIcons
          name={isOpen ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
          size={18}
          color={colors.gray}
        />
      </TouchableOpacity>
      {isOpen && (
        <View style={styles.dropdownMenu}>
          {SPORTS.map(sport => (
            <TouchableOpacity
              key={sport}
              style={[
                styles.dropdownItem,
                selected === sport && styles.dropdownItemActive,
              ]}
              onPress={() => {
                onSelect(sport);
                onToggle();
              }}>
              <Text
                style={[
                  styles.dropdownItemText,
                  selected === sport && styles.dropdownItemTextActive,
                ]}>
                {sport}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

function SortToggle({
  sort,
  onToggle,
}: {
  sort: SortOrder;
  onToggle: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.sortButton}
      onPress={onToggle}
      activeOpacity={0.7}>
      <MaterialIcons name="swap-vert" size={16} color={colors.white} style={{marginRight: 4}} />
      <Text style={styles.sortButtonText}>{sort}</Text>
    </TouchableOpacity>
  );
}

// ────── Badge for thumbnail ──────

function ThumbnailBadge({status}: {status: VideoItem['status']}) {
  const badgeStyle =
    status === 'LIVE'
      ? styles.badgeLive
      : status === 'SCHEDULED'
      ? styles.badgeScheduled
      : styles.badgeVod;
  const label =
    status === 'LIVE' ? 'LIVE' : status === 'SCHEDULED' ? '예정' : 'VOD';

  return (
    <View style={[styles.thumbnailBadge, badgeStyle]}>
      <Text style={styles.thumbnailBadgeText}>{label}</Text>
    </View>
  );
}

// ────── Video Card (LIVE / VOD) ──────

function VideoCard({video}: {video: VideoItem}) {
  const navigation = useNavigation<VideoListNavProp>();
  const contentType = video.status === 'LIVE' ? 'live' : 'vod';

  return (
    <TouchableOpacity
      style={styles.videoCard}
      activeOpacity={0.8}
      onPress={() => navigation.navigate('Player', {contentType, contentId: video.id})}>
      {/* Thumbnail (left ~40%) */}
      <View style={styles.videoThumbnailWrapper}>
        <MediaImage
          uri={video.thumbnailUrl}
          style={styles.videoThumbnail}
          resizeMode="cover"
        />
        <ThumbnailBadge status={video.status} />
        {video.duration && (
          <View style={styles.durationOverlay}>
            <Text style={styles.durationText}>{video.duration}</Text>
          </View>
        )}
      </View>

      {/* Right info */}
      <View style={styles.videoInfo}>
        {video.home && video.away && (
          <View style={styles.videoTeamRow}>
            <Text style={styles.videoTeamLabel}>홈</Text>
            <Text style={styles.videoTeamName} numberOfLines={1}>
              {video.home.name}
            </Text>
          </View>
        )}
        {video.home && video.away && (
          <View style={styles.videoTeamRow}>
            <Text style={styles.videoTeamLabel}>원정</Text>
            <Text style={styles.videoTeamName} numberOfLines={1}>
              {video.away.name}
            </Text>
          </View>
        )}
        <Text style={styles.videoMeta} numberOfLines={1}>
          {video.competitionName} &middot; {video.date}
        </Text>
        <View style={styles.tagsRow}>
          {video.tags.map((tag, idx) => (
            <View key={idx} style={styles.tagChip}>
              <Text style={styles.tagChipText}>{tag}</Text>
            </View>
          ))}
        </View>
        <View style={styles.videoActions}>
          <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
            <Ionicons name="notifications-outline" size={14} color={colors.grayLight} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
            <MaterialIcons name="share" size={14} color={colors.grayLight} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
            <MaterialIcons name="more-vert" size={14} color={colors.grayLight} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ────── Clip Card (vertical, grid) ──────

function ClipCard({clip}: {clip: VideoItem}) {
  const navigation = useNavigation<VideoListNavProp>();
  const viewCountText =
    clip.viewCount !== undefined
      ? clip.viewCount >= 10000
        ? `${(clip.viewCount / 10000).toFixed(1)}만`
        : clip.viewCount.toLocaleString()
      : '';

  return (
    <TouchableOpacity
      style={styles.clipCard}
      activeOpacity={0.8}
      onPress={() => navigation.navigate('ClipPlayer', {contentId: clip.id})}>
      <MediaImage
        uri={clip.thumbnailUrl}
        style={styles.clipThumbnail}
        resizeMode="cover"
      />
      <Text style={styles.clipTitle} numberOfLines={2}>
        {clip.title}
      </Text>
      {viewCountText !== '' && (
        <View style={styles.viewCountBadge}>
          <Text style={styles.viewCountText}>조회 {viewCountText}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ──────────────────── Main Screen ────────────────────

const PAGE_SIZE = 10;

export default function VideoListScreen() {
  const navigation = useNavigation<VideoListNavProp>();
  const [activeTab, setActiveTab] = useState<VideoTab>('LIVE');
  const [sportFilter, setSportFilter] = useState<Sport>('전체');
  const [sortOrder, setSortOrder] = useState<SortOrder>('최신순');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setDisplayCount(PAGE_SIZE);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  // Filter source by tab
  const sourceData = useMemo(() => {
    if (activeTab === 'CLIP') {
      return mockClips;
    }
    return mockVideos.filter(v => v.type === activeTab);
  }, [activeTab]);

  // Apply sport filter
  const filteredData = useMemo(() => {
    let data = sourceData;
    if (sportFilter !== '전체') {
      data = data.filter(v => v.sport === sportFilter);
    }
    // Sort
    if (sortOrder === '인기순') {
      data = [...data].sort(
        (a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0),
      );
    } else {
      data = [...data].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
    }
    return data;
  }, [sourceData, sportFilter, sortOrder]);

  // Paginated slice
  const paginatedData = useMemo(
    () => filteredData.slice(0, displayCount),
    [filteredData, displayCount],
  );

  const handleEndReached = useCallback(() => {
    if (displayCount < filteredData.length) {
      setDisplayCount(prev => Math.min(prev + PAGE_SIZE, filteredData.length));
    }
  }, [displayCount, filteredData.length]);

  const handleTabChange = useCallback((tab: VideoTab) => {
    setActiveTab(tab);
    setDisplayCount(PAGE_SIZE);
  }, []);

  // ────── Render ──────

  const renderVideoItem = useCallback(
    ({item}: {item: VideoItem}) => <VideoCard video={item} />,
    [],
  );

  const renderClipItem = useCallback(
    ({item}: {item: VideoItem}) => <ClipCard clip={item} />,
    [],
  );

  const isClipTab = activeTab === 'CLIP';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />

      {/* Header */}
      <View style={styles.screenHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.screenHeaderTitle}>영상</Text>
        <View style={styles.backButton} />
      </View>

      {/* Top tabs */}
      <View style={styles.topTabsRow}>
        {(['LIVE', 'VOD', 'CLIP'] as VideoTab[]).map(tab => (
          <TopTab
            key={tab}
            tab={tab}
            isActive={activeTab === tab}
            onPress={() => handleTabChange(tab)}
          />
        ))}
      </View>

      {/* Filter row */}
      <View style={styles.filterRow}>
        <SportDropdown
          selected={sportFilter}
          onSelect={setSportFilter}
          isOpen={dropdownOpen}
          onToggle={() => setDropdownOpen(o => !o)}
        />
        <SortToggle
          sort={sortOrder}
          onToggle={() =>
            setSortOrder(s => (s === '최신순' ? '인기순' : '최신순'))
          }
        />
      </View>

      {/* Video / Clip list */}
      {isClipTab ? (
        <FlatList
          key="clip-grid-2col"
          data={paginatedData}
          renderItem={renderClipItem}
          keyExtractor={item => item.id}
          numColumns={2}
          columnWrapperStyle={styles.clipRow}
          contentContainerStyle={styles.clipListContent}
          showsVerticalScrollIndicator={false}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.3}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#00CC33" />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="video-library" size={48} color="#555" />
              <Text style={styles.emptyText}>아직 콘텐츠가 없습니다</Text>
            </View>
          }
        />
      ) : (
        <FlatList
          key="video-list-1col"
          data={paginatedData}
          renderItem={renderVideoItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.videoListContent}
          showsVerticalScrollIndicator={false}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.3}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#00CC33" />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="video-library" size={48} color="#555" />
              <Text style={styles.emptyText}>아직 콘텐츠가 없습니다</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

// ──────────────────── Styles ────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },

  // Screen Header
  screenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 52,
    borderBottomWidth: 0.5,
    borderBottomColor: '#4D4D4D',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  screenHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Top tabs
  topTabsRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: colors.grayDark,
  },
  topTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  topTabActive: {
    borderBottomColor: colors.green,
  },
  topTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray,
  },
  topTabTextActive: {
    color: colors.green,
    fontWeight: '700',
  },

  // Filter row
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    zIndex: 10,
  },

  // Dropdown
  dropdownWrapper: {
    position: 'relative',
    zIndex: 20,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  dropdownButtonText: {
    fontSize: 13,
    color: colors.white,
    fontWeight: '600',
  },
  dropdownArrow: {
    fontSize: 10,
    color: colors.gray,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 40,
    left: 0,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.grayDark,
    minWidth: 120,
    paddingVertical: 4,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  dropdownItemActive: {
    backgroundColor: colors.grayDark,
  },
  dropdownItemText: {
    fontSize: 13,
    color: colors.grayLight,
  },
  dropdownItemTextActive: {
    color: colors.green,
    fontWeight: '700',
  },

  // Sort button
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sortButtonIcon: {
    marginRight: 4,
  },
  sortButtonText: {
    fontSize: 13,
    color: colors.white,
    fontWeight: '600',
  },

  // Video list
  videoListContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },

  // Video card
  videoCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 12,
  },
  videoThumbnailWrapper: {
    width: '40%',
    aspectRatio: 16 / 9,
    position: 'relative',
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.grayDark,
  },
  thumbnailBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  thumbnailBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.white,
  },
  badgeLive: {
    backgroundColor: '#D32F2F',
  },
  badgeScheduled: {
    backgroundColor: colors.gray,
  },
  badgeVod: {
    backgroundColor: '#1565C0',
  },
  durationOverlay: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 3,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  durationText: {
    fontSize: 10,
    color: colors.white,
    fontWeight: '600',
  },

  // Video info (right side)
  videoInfo: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
  },
  videoTeamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  videoTeamLabel: {
    fontSize: 10,
    color: colors.gray,
    width: 28,
    fontWeight: '600',
  },
  videoTeamName: {
    fontSize: 13,
    color: colors.white,
    fontWeight: '600',
    flex: 1,
  },
  videoMeta: {
    fontSize: 11,
    color: colors.grayLight,
    marginTop: 4,
    marginBottom: 6,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 6,
  },
  tagChip: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.green,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  tagChipText: {
    fontSize: 10,
    color: colors.green,
    fontWeight: '600',
  },
  videoActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    backgroundColor: colors.grayDark,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  iconButtonText: {
    fontSize: 11,
    color: colors.grayLight,
    fontWeight: '500',
  },

  // Clip list
  clipListContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  clipRow: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  clipCard: {
    width: CLIP_CARD_WIDTH,
    backgroundColor: colors.surface,
    borderRadius: 10,
    overflow: 'hidden',
  },
  clipThumbnail: {
    width: '100%',
    height: CLIP_CARD_WIDTH * (16 / 9),
    backgroundColor: colors.grayDark,
  },
  clipTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.white,
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 4,
  },
  viewCountBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.grayDark,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginHorizontal: 8,
    marginBottom: 8,
  },
  viewCountText: {
    fontSize: 10,
    color: colors.grayLight,
    fontWeight: '500',
  },

  // Empty
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 14,
    color: colors.gray,
    textAlign: 'center',
    marginTop: 12,
  },
});
