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
import {mockMyClips, MyClipItem, formatViewCount} from '../../services/myApi';

const GREEN = colors.green;
const BG = colors.bg;
const SURFACE = colors.surface;
const WHITE = colors.white;
const GRAY = colors.gray;
const GRAY_LIGHT = colors.grayLight;

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const COLUMN_GAP = 10;
const PADDING = 16;
const CARD_WIDTH = (SCREEN_WIDTH - PADDING * 2 - COLUMN_GAP) / 2;

function ClipCard({item, bookmarked, onToggleBookmark}: {item: MyClipItem; bookmarked: boolean; onToggleBookmark: (id: string) => void}) {
  return (
    <View style={styles.clipCard}>
      <View style={styles.thumbnailWrap}>
        <MediaImage
          uri={item.thumbnailUrl}
          style={styles.thumbnail}
          resizeMode="cover"
        />
        <TouchableOpacity style={styles.bookmarkButton} activeOpacity={0.7} onPress={() => onToggleBookmark(item.id)}>
          <MaterialIcons name={bookmarked ? 'bookmark' : 'bookmark-border'} size={22} color={GREEN} />
        </TouchableOpacity>
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

export default function MyClipsScreen() {
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  const toggleBookmark = (id: string) => {
    setBookmarkedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="arrow-back" size={24} color={WHITE} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>내 클립</Text>
        <View style={{width: 24}} />
      </View>

      {/* Clip Count */}
      <View style={styles.countContainer}>
        <Text style={styles.countText}>
          총 <Text style={styles.countNumber}>{mockMyClips.length}</Text>개
        </Text>
      </View>

      {/* Clip Grid */}
      <FlatList
        data={mockMyClips}
        keyExtractor={item => item.id}
        renderItem={({item}) => <ClipCard item={item} bookmarked={bookmarkedIds.has(item.id)} onToggleBookmark={toggleBookmark} />}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="video-library" size={48} color="#555" />
            <Text style={styles.emptyText}>아직 콘텐츠가 없습니다</Text>
          </View>
        }
      />
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
  countContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  countText: {
    fontSize: 13,
    color: GRAY_LIGHT,
  },
  countNumber: {
    color: GREEN,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: PADDING,
    paddingBottom: 40,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: COLUMN_GAP,
  },
  // Clip Card
  clipCard: {
    width: CARD_WIDTH,
  },
  thumbnailWrap: {
    width: '100%',
    height: CARD_WIDTH * 1.3,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 6,
    backgroundColor: SURFACE,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  bookmarkButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 4,
    padding: 2,
  },
  clipTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: WHITE,
    marginBottom: 3,
    lineHeight: 17,
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
});
