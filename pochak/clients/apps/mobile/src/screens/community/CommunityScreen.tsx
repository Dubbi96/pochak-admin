import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  FlatList,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Ionicons, MaterialIcons} from '@expo/vector-icons';
import {useNavigation} from '@react-navigation/native';
import {colors} from '../../theme';
import {
  type CommunityCategory,
  type PostItem,
  type PostType,
  COMMUNITY_CATEGORIES,
  POST_TYPES,
  COMMUNITY_REGIONS,
  getCommunityPosts,
  formatRelativeTime,
} from '../../services/communityApi';

// ─── Category Badge Colors ──────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  자유게시판: '#4488FF',
  경기후기: '#FF6D00',
  '질문/답변': '#AB47BC',
  '팁/공략': '#FFC107',
};

const POST_TYPE_COLORS: Record<PostType, string> = {
  소식: '#2196F3',
  구인: '#FF6D00',
  모집: '#AB47BC',
  자유: '#4488FF',
};

// ─── Post Card ──────────────────────────────────────────

function PostCard({item}: {item: PostItem}) {
  const badgeColor = CATEGORY_COLORS[item.category] ?? colors.green;
  const postTypeColor = POST_TYPE_COLORS[item.postType] ?? colors.green;

  return (
    <View style={styles.postCard}>
      {/* Top row: avatar + author + time */}
      <View style={styles.postTopRow}>
        <View style={[styles.avatar, {backgroundColor: colors.green}]}>
          <Text style={styles.avatarText}>{item.authorInitials}</Text>
        </View>
        <View style={styles.authorInfo}>
          <Text style={styles.authorName}>{item.authorName}</Text>
          <View style={styles.authorMeta}>
            <Text style={styles.postTime}>{formatRelativeTime(item.createdAt)}</Text>
            <Text style={styles.postRegion}>{item.region}</Text>
          </View>
        </View>
      </View>

      {/* Category badge + PostType badge */}
      <View style={styles.titleRow}>
        <View style={[styles.categoryBadge, {backgroundColor: badgeColor + '22'}]}>
          <Text style={[styles.categoryBadgeText, {color: badgeColor}]}>
            {item.category}
          </Text>
        </View>
        <View style={[styles.postTypeBadge, {backgroundColor: postTypeColor + '22'}]}>
          <Text style={[styles.postTypeBadgeText, {color: postTypeColor}]}>
            {item.postType}
          </Text>
        </View>
      </View>

      <Text style={styles.postTitle} numberOfLines={1}>
        {item.title}
      </Text>

      {/* Content preview */}
      <Text style={styles.postContent} numberOfLines={2}>
        {item.content}
      </Text>

      {/* Bottom row: likes + comments */}
      <View style={styles.postBottomRow}>
        <View style={styles.statItem}>
          <MaterialIcons
            name={item.isLiked ? 'favorite' : 'favorite-border'}
            size={16}
            color={item.isLiked ? colors.green : colors.gray}
          />
          <Text style={[styles.statText, item.isLiked && {color: colors.green}]}>
            {item.likeCount}
          </Text>
        </View>
        <View style={styles.statItem}>
          <MaterialIcons name="chat-bubble-outline" size={15} color={colors.gray} />
          <Text style={styles.statText}>{item.commentCount}</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Main Screen ────────────────────────────────────────

export default function CommunityScreen() {
  const navigation = useNavigation();
  const [activeCategory, setActiveCategory] = useState<CommunityCategory>('전체');
  const [activePostType, setActivePostType] = useState<PostType | null>(null);
  const [activeRegion, setActiveRegion] = useState('전체');
  const [regionDropdownOpen, setRegionDropdownOpen] = useState(false);
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async (
    category: CommunityCategory,
    postType?: PostType | null,
    region?: string,
  ) => {
    setLoading(true);
    try {
      const data = await getCommunityPosts(
        category,
        postType ?? undefined,
        region,
      );
      setPosts(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts(activeCategory, activePostType, activeRegion);
  }, [activeCategory, activePostType, activeRegion, fetchPosts]);

  const handleCategoryChange = useCallback((category: CommunityCategory) => {
    setActiveCategory(category);
  }, []);

  const handlePostTypeChange = useCallback((type: PostType) => {
    setActivePostType(prev => (prev === type ? null : type));
  }, []);

  const renderPost = useCallback(
    ({item}: {item: PostItem}) => <PostCard item={item} />,
    [],
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>커뮤니티</Text>
        <View style={styles.backButton} />
      </View>

      {/* PostType Tabs: 소식 / 구인 / 모집 / 자유 */}
      <View style={styles.postTypeTabContainer}>
        {POST_TYPES.map(type => {
          const isActive = type === activePostType;
          const typeColor = POST_TYPE_COLORS[type];
          return (
            <TouchableOpacity
              key={type}
              style={[
                styles.postTypeTab,
                isActive && {borderBottomColor: typeColor, borderBottomWidth: 2},
              ]}
              onPress={() => handlePostTypeChange(type)}
              activeOpacity={0.7}>
              <Text
                style={[
                  styles.postTypeTabText,
                  isActive && {color: typeColor, fontWeight: '700'},
                ]}>
                {type}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Region Filter + Category Chips */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={styles.regionFilterBtn}
          onPress={() => setRegionDropdownOpen(prev => !prev)}
          activeOpacity={0.7}>
          <MaterialIcons name="location-on" size={14} color={colors.green} />
          <Text style={styles.regionFilterText}>{activeRegion}</Text>
          <Ionicons
            name={regionDropdownOpen ? 'chevron-up' : 'chevron-down'}
            size={12}
            color={colors.grayLight}
          />
        </TouchableOpacity>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScroll}>
          {COMMUNITY_CATEGORIES.map(category => {
            const isActive = category === activeCategory;
            return (
              <TouchableOpacity
                key={category}
                style={[styles.tabChip, isActive && styles.tabChipActive]}
                onPress={() => handleCategoryChange(category)}
                activeOpacity={0.7}>
                <Text
                  style={[
                    styles.tabChipText,
                    isActive && styles.tabChipTextActive,
                  ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Region Dropdown */}
      {regionDropdownOpen && (
        <View style={styles.regionDropdown}>
          <ScrollView
            nestedScrollEnabled
            showsVerticalScrollIndicator={false}
            style={styles.regionDropdownScroll}>
            {COMMUNITY_REGIONS.map(region => (
              <TouchableOpacity
                key={region}
                style={[
                  styles.regionDropdownItem,
                  region === activeRegion && styles.regionDropdownItemActive,
                ]}
                onPress={() => {
                  setActiveRegion(region);
                  setRegionDropdownOpen(false);
                }}
                activeOpacity={0.7}>
                <Text
                  style={[
                    styles.regionDropdownText,
                    region === activeRegion && styles.regionDropdownTextActive,
                  ]}>
                  {region}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Post List */}
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          loading ? null : (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="forum" size={48} color={colors.gray} />
              <Text style={styles.emptyText}>아직 게시글이 없습니다</Text>
              <Text style={styles.emptySubText}>첫 번째 게시글을 작성해보세요!</Text>
            </View>
          )
        }
      />

      {/* FAB - Write New Post */}
      <TouchableOpacity style={styles.fab} activeOpacity={0.8}>
        <MaterialIcons name="add" size={28} color="#000" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// ─── Styles ─────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },

  // Header
  header: {
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
  },

  // PostType tabs
  postTypeTabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: colors.grayDark,
  },
  postTypeTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  postTypeTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray,
  },

  // Filter row
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.grayDark,
  },
  regionFilterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 16,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: colors.surface,
    gap: 3,
  },
  regionFilterText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
  },
  regionDropdown: {
    position: 'absolute',
    top: 158,
    left: 16,
    width: 160,
    backgroundColor: colors.surface,
    borderRadius: 8,
    zIndex: 999,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  regionDropdownScroll: {
    maxHeight: 200,
  },
  regionDropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  regionDropdownItemActive: {
    backgroundColor: colors.grayDark,
  },
  regionDropdownText: {
    fontSize: 13,
    color: colors.grayLight,
  },
  regionDropdownTextActive: {
    color: colors.green,
    fontWeight: '600',
  },

  // Tabs
  tabScroll: {
    paddingHorizontal: 4,
    gap: 8,
  },
  tabChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.grayDark,
  },
  tabChipActive: {
    backgroundColor: colors.green,
    borderColor: colors.green,
  },
  tabChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.grayLight,
  },
  tabChipTextActive: {
    color: '#000',
  },

  // List
  listContent: {
    paddingTop: 4,
    paddingBottom: 80,
  },

  // Post Card
  postCard: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.grayDark,
  },
  postTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000',
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.white,
  },
  authorMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 1,
  },
  postTime: {
    fontSize: 11,
    color: colors.gray,
  },
  postRegion: {
    fontSize: 11,
    color: colors.gray,
  },

  // Category badge
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  postTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginLeft: 6,
  },
  postTypeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // Title + Content
  postTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 4,
  },
  postContent: {
    fontSize: 13,
    color: colors.gray,
    lineHeight: 18,
    marginBottom: 10,
  },

  // Bottom stats
  postBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: colors.gray,
  },

  // Empty
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.gray,
    marginTop: 12,
  },
  emptySubText: {
    fontSize: 13,
    color: colors.gray,
    marginTop: 4,
  },

  // FAB
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
