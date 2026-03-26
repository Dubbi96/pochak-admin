import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {Ionicons, MaterialIcons} from '@expo/vector-icons';
import {colors} from '../../theme';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.42;
const CARD_HEIGHT = CARD_WIDTH * (9 / 16);
const CLIP_CARD_HEIGHT = CARD_WIDTH * (16 / 9);

interface ContentItem {
  id: string;
  title: string;
  subtitle?: string;
  tags?: string[];
  viewCount?: number;
  likeCount?: number;
}

interface RelatedContentListProps {
  title: string;
  items: ContentItem[];
  horizontal?: boolean;
  maxItems?: number;
  /** When true, renders 9:16 vertical clip cards instead of 16:9 landscape cards */
  clipMode?: boolean;
  filterTags?: string[];
  selectedTag?: string;
  onTagSelect?: (tag: string) => void;
  onItemPress?: (id: string) => void;
}

const formatCount = (n?: number): string => {
  if (n == null) return '0';
  if (n >= 10000) return `${(n / 10000).toFixed(1)}만`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
};

const RelatedContentList: React.FC<RelatedContentListProps> = ({
  title,
  items,
  horizontal = true,
  maxItems = 10,
  clipMode = false,
  filterTags,
  selectedTag,
  onTagSelect,
  onItemPress,
}) => {
  const displayItems = items.slice(0, maxItems);

  const renderHorizontalCard = (item: ContentItem) => (
    <TouchableOpacity
      key={item.id}
      style={styles.hCard}
      activeOpacity={0.7}
      onPress={() => onItemPress?.(item.id)}>
      <View style={styles.hCardThumb}>
        <Ionicons name="play" size={20} color={colors.white} style={styles.thumbIconStyle} />
      </View>
      <Text style={styles.hCardTitle} numberOfLines={2}>
        {item.title}
      </Text>
      {item.subtitle ? (
        <Text style={styles.hCardSubtitle} numberOfLines={1}>
          {item.subtitle}
        </Text>
      ) : null}
    </TouchableOpacity>
  );

  const renderClipCard = (item: ContentItem) => (
    <TouchableOpacity
      key={item.id}
      style={styles.clipCard}
      activeOpacity={0.7}
      onPress={() => onItemPress?.(item.id)}>
      <View style={styles.clipCardThumb}>
        <Ionicons name="play" size={24} color={colors.white} style={styles.thumbIconStyle} />
        {/* Gradient overlay at bottom for title */}
        <View style={styles.clipGradientOverlay}>
          <Text style={styles.clipCardTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.clipStatsRow}>
            <View style={styles.clipStat}>
              <Ionicons name="eye-outline" size={12} color="rgba(255,255,255,0.8)" />
              <Text style={styles.clipStatText}>{formatCount(item.viewCount)}</Text>
            </View>
            <View style={styles.clipStat}>
              <Ionicons name="heart-outline" size={12} color="rgba(255,255,255,0.8)" />
              <Text style={styles.clipStatText}>{formatCount(item.likeCount)}</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderVerticalCard = (item: ContentItem) => (
    <TouchableOpacity
      key={item.id}
      style={styles.vCard}
      activeOpacity={0.7}
      onPress={() => onItemPress?.(item.id)}>
      <View style={styles.vCardThumb}>
        <Ionicons name="play" size={20} color={colors.white} style={styles.thumbIconStyle} />
      </View>
      <View style={styles.vCardInfo}>
        <Text style={styles.vCardTitle} numberOfLines={2}>
          {item.title}
        </Text>
        {item.subtitle ? (
          <Text style={styles.vCardSubtitle} numberOfLines={1}>
            {item.subtitle}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {title ? (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <MaterialIcons name="expand-more" size={24} color={colors.grayLight} />
        </View>
      ) : null}

      {/* Tag filter chips */}
      {filterTags && filterTags.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tagScroll}
          contentContainerStyle={styles.tagContainer}>
          {filterTags.map(tag => (
            <TouchableOpacity
              key={tag}
              style={[
                styles.tagChip,
                selectedTag === tag && styles.tagChipSelected,
              ]}
              onPress={() => onTagSelect?.(tag)}>
              <Text
                style={[
                  styles.tagText,
                  selectedTag === tag && styles.tagTextSelected,
                ]}>
                {tag}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {horizontal ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hScrollContent}>
          {displayItems.map(clipMode ? renderClipCard : renderHorizontalCard)}
        </ScrollView>
      ) : clipMode ? (
        <View style={styles.clipGrid}>
          {displayItems.map(renderClipCard)}
        </View>
      ) : (
        <View style={styles.vList}>
          {displayItems.map(renderVerticalCard)}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
  tagScroll: {
    marginBottom: 12,
    paddingLeft: 16,
  },
  tagContainer: {
    flexDirection: 'row',
    paddingRight: 16,
  },
  tagChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.grayDark,
    backgroundColor: colors.surface,
    marginRight: 8,
  },
  tagChipSelected: {
    borderColor: '#00CC33',
    backgroundColor: 'rgba(0, 200, 83, 0.1)',
  },
  tagText: {
    fontSize: 13,
    color: colors.grayLight,
  },
  tagTextSelected: {
    color: '#00CC33',
  },
  hScrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  hCard: {
    width: CARD_WIDTH,
  },
  hCardThumb: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: colors.grayDark,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  thumbIconStyle: {
    opacity: 0.6,
  },
  hCardTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.white,
    lineHeight: 18,
  },
  hCardSubtitle: {
    fontSize: 11,
    color: colors.gray,
    marginTop: 2,
  },
  // Clip mode (9:16 vertical) cards
  clipCard: {
    width: CARD_WIDTH,
  },
  clipCardThumb: {
    width: CARD_WIDTH,
    height: CLIP_CARD_HEIGHT,
    backgroundColor: colors.grayDark,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  clipGradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 8,
    paddingBottom: 8,
    paddingTop: 24,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  clipCardTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
    lineHeight: 16,
    marginBottom: 4,
  },
  clipStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  clipStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  clipStatText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
  },
  clipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 10,
  },
  vList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  vCard: {
    flexDirection: 'row',
    gap: 12,
  },
  vCardThumb: {
    width: 140,
    height: 80,
    backgroundColor: colors.grayDark,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vCardInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  vCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
    lineHeight: 20,
  },
  vCardSubtitle: {
    fontSize: 12,
    color: colors.gray,
    marginTop: 4,
  },
});

export default RelatedContentList;
