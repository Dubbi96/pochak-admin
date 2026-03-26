import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Ionicons, MaterialIcons} from '@expo/vector-icons';
import MediaImage from '../../components/common/MediaImage';
import {colors} from '../../theme';
import {
  mockWatchHistoryVideos,
  mockWatchHistoryClips,
  WatchHistoryItem,
  MyClipItem,
  formatViewCount,
} from '../../services/myApi';

const GREEN = colors.green;
const BG = colors.bg;
const SURFACE = colors.surface;
const WHITE = colors.white;
const GRAY = colors.gray;
const GRAY_LIGHT = colors.grayLight;
const GRAY_DARK = colors.grayDark;

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const CLIP_COLUMN_GAP = 10;
const CLIP_PADDING = 16;
const CLIP_CARD_WIDTH = (SCREEN_WIDTH - CLIP_PADDING * 2 - CLIP_COLUMN_GAP) / 2;

type TabType = '영상' | '클립';

function VideoItem({item}: {item: WatchHistoryItem}) {
  return (
    <View style={styles.videoItem}>
      <View style={styles.thumbnailContainer}>
        <MediaImage
          uri={item.thumbnailUrl}
          style={styles.thumbnail}
          resizeMode="cover"
        />
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{item.duration}</Text>
        </View>
      </View>
      <View style={styles.videoInfo}>
        <Text style={styles.videoTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={styles.subtitleRow}>
          {item.competitionIcon && (
            <MaterialIcons
              name={item.competitionIcon as keyof typeof MaterialIcons.glyphMap}
              size={14}
              color={GREEN}
              style={styles.competitionIcon}
            />
          )}
          <Text style={styles.videoSubtitle} numberOfLines={1}>
            {item.subtitle}
          </Text>
        </View>
        <Text style={styles.videoMeta} numberOfLines={1}>
          {item.meta}
        </Text>
      </View>
      <TouchableOpacity style={styles.moreButton} activeOpacity={0.7}>
        <MaterialIcons name="more-vert" size={20} color={GRAY} />
      </TouchableOpacity>
    </View>
  );
}

function ClipItem({item}: {item: MyClipItem}) {
  return (
    <View style={styles.clipCard}>
      <View style={styles.clipThumbnailWrap}>
        <MediaImage
          uri={item.thumbnailUrl}
          style={styles.clipThumbnail}
          resizeMode="cover"
        />
      </View>
      <Text style={styles.clipTitle} numberOfLines={2}>
        {item.title}
      </Text>
      <Text style={styles.clipViews}>
        {formatViewCount(item.viewCount)}회
      </Text>
      <Text style={styles.clipDate}>{item.date}</Text>
      <Text style={styles.clipCompetition} numberOfLines={1}>
        {item.competitionInfo}
      </Text>
    </View>
  );
}

export default function WatchHistoryScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('영상');

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="arrow-back" size={24} color={WHITE} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>시청이력</Text>
        <View style={{width: 24}} />
      </View>

      {/* Top Tabs */}
      <View style={styles.tabContainer}>
        {(['영상', '클립'] as TabType[]).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
            activeOpacity={0.7}>
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.tabTextActive,
              ]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      {activeTab === '영상' ? (
        <FlatList
          key="videos-list"
          data={mockWatchHistoryVideos}
          keyExtractor={item => item.id}
          renderItem={({item}) => <VideoItem item={item} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.videoSeparator} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="video-library" size={48} color="#555" />
              <Text style={styles.emptyText}>아직 콘텐츠가 없습니다</Text>
            </View>
          }
        />
      ) : (
        <FlatList
          key="clips-grid"
          data={mockWatchHistoryClips}
          keyExtractor={item => item.id}
          renderItem={({item}) => <ClipItem item={item} />}
          numColumns={2}
          columnWrapperStyle={styles.clipRow}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: WHITE,
  },
  // Tabs
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: GRAY_DARK,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: GREEN,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: GRAY,
  },
  tabTextActive: {
    color: GREEN,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  // Video Item
  videoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  thumbnailContainer: {
    width: 120,
    height: 68,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: SURFACE,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.75)',
    borderRadius: 3,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  durationText: {
    fontSize: 10,
    color: WHITE,
    fontWeight: '600',
  },
  videoInfo: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'flex-start',
  },
  videoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: WHITE,
    lineHeight: 18,
    marginBottom: 3,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  competitionIcon: {
    marginRight: 4,
  },
  videoSubtitle: {
    fontSize: 12,
    color: GRAY_LIGHT,
    flex: 1,
  },
  videoMeta: {
    fontSize: 11,
    color: GRAY,
  },
  moreButton: {
    padding: 4,
    marginLeft: 4,
  },
  videoSeparator: {
    height: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 14,
    color: GRAY,
    textAlign: 'center',
    marginTop: 12,
  },
  // Clip Grid
  clipRow: {
    justifyContent: 'space-between',
    marginBottom: CLIP_COLUMN_GAP,
  },
  clipCard: {
    width: CLIP_CARD_WIDTH,
  },
  clipThumbnailWrap: {
    width: '100%',
    height: CLIP_CARD_WIDTH * 1.3,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 6,
    backgroundColor: SURFACE,
  },
  clipThumbnail: {
    width: '100%',
    height: '100%',
  },
  clipTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: WHITE,
    marginBottom: 3,
  },
  clipViews: {
    fontSize: 11,
    color: GRAY,
    marginBottom: 1,
  },
  clipDate: {
    fontSize: 11,
    color: GRAY,
    marginBottom: 1,
  },
  clipCompetition: {
    fontSize: 10,
    color: GRAY_LIGHT,
  },
});
