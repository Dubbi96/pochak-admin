import React, {useState} from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  View,
  StatusBar,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Ionicons, MaterialIcons} from '@expo/vector-icons';
import MediaImage from '../../components/common/MediaImage';
import {colors} from '../../theme';
import {
  mockFavoriteTeams,
  mockFavoriteTeamVideos,
  mockFavoriteCompetitions,
  FavoriteTeam,
  FavoriteCompetition,
  WatchHistoryItem,
} from '../../services/myApi';

const GREEN = colors.green;
const BG = colors.bg;
const SURFACE = colors.surface;
const WHITE = colors.white;
const GRAY = colors.gray;
const GRAY_LIGHT = colors.grayLight;
const GRAY_DARK = colors.grayDark;

type SubTab = '팀/클럽' | '대회';

// --- Team Logo Component ---
function TeamLogo({team}: {team: FavoriteTeam}) {
  return (
    <TouchableOpacity style={styles.teamLogoItem} activeOpacity={0.7}>
      <View style={styles.teamLogoCircle}>
        <MaterialIcons name="bookmark" size={14} color={GREEN} style={styles.teamBookmark} />
        <Text style={styles.teamLogoInitial}>{team.logoInitial}</Text>
      </View>
      <Text style={styles.teamLogoName} numberOfLines={1}>
        {team.name}
      </Text>
    </TouchableOpacity>
  );
}

// --- Video Item Component (same format as watch history) ---
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

// --- Competition Item Component ---
function CompetitionItem({item}: {item: FavoriteCompetition}) {
  const tags = [item.sport];
  if (item.isPaid) tags.push('유료');
  if (item.hasCommentary) tags.push('해설');

  return (
    <View style={styles.competitionCard}>
      <View style={styles.competitionLeft}>
        <View style={styles.competitionImageWrap}>
          <MediaImage
            uri={item.imageUrl}
            style={styles.competitionImage}
            resizeMode="cover"
          />
        </View>
        <View style={styles.competitionInfo}>
          <Text style={styles.competitionName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.competitionDates}>{item.dates}</Text>
          <View style={styles.competitionTags}>
            {tags.map(tag => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
      <View style={styles.competitionActions}>
        <TouchableOpacity activeOpacity={0.7} onPress={() => Alert.alert('즐겨찾기', '즐겨찾기에서 해제하시겠습니까?', [{ text: '해제', style: 'destructive' }, { text: '취소', style: 'cancel' }])}>
          <MaterialIcons name="bookmark" size={22} color={GREEN} />
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.7} style={styles.editButton} onPress={() => Alert.alert('알림', '편집 기능은 준비 중입니다.')}>
          <MaterialIcons name="edit" size={18} color={GRAY_LIGHT} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// --- Teams Tab Content ---
function TeamsTab() {
  return (
    <FlatList
      data={mockFavoriteTeamVideos}
      keyExtractor={item => item.id}
      ListHeaderComponent={
        <View>
          {/* Horizontal Team Logos */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.teamLogosContainer}>
            {mockFavoriteTeams.map(team => (
              <TeamLogo key={team.id} team={team} />
            ))}
          </ScrollView>
          {/* Divider */}
          <View style={styles.teamDivider} />
        </View>
      }
      renderItem={({item}) => <VideoItem item={item} />}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      ItemSeparatorComponent={() => <View style={{height: 16}} />}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <MaterialIcons name="video-library" size={48} color="#555" />
          <Text style={styles.emptyText}>아직 콘텐츠가 없습니다</Text>
        </View>
      }
    />
  );
}

// --- Competitions Tab Content ---
function CompetitionsTab() {
  return (
    <FlatList
      data={mockFavoriteCompetitions}
      keyExtractor={item => item.id}
      renderItem={({item}) => <CompetitionItem item={item} />}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      ItemSeparatorComponent={() => <View style={{height: 10}} />}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <MaterialIcons name="video-library" size={48} color="#555" />
          <Text style={styles.emptyText}>아직 콘텐츠가 없습니다</Text>
        </View>
      }
    />
  );
}

export default function FavoritesScreen() {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('팀/클럽');

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="arrow-back" size={24} color={WHITE} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>즐겨찾기</Text>
        <View style={{width: 24}} />
      </View>

      {/* Sub Tabs */}
      <View style={styles.subTabContainer}>
        {(['팀/클럽', '대회'] as SubTab[]).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.subTab,
              activeSubTab === tab && styles.subTabActive,
            ]}
            onPress={() => setActiveSubTab(tab)}
            activeOpacity={0.7}>
            <Text
              style={[
                styles.subTabText,
                activeSubTab === tab && styles.subTabTextActive,
              ]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      {activeSubTab === '팀/클럽' ? <TeamsTab /> : <CompetitionsTab />}
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
  // Sub Tabs
  subTabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: GRAY_DARK,
  },
  subTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  subTabActive: {
    borderBottomColor: GREEN,
  },
  subTabText: {
    fontSize: 15,
    fontWeight: '600',
    color: GRAY,
  },
  subTabTextActive: {
    color: GREEN,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  // Team Logos
  teamLogosContainer: {
    paddingVertical: 16,
    paddingRight: 16,
  },
  teamLogoItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 64,
  },
  teamLogoCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: SURFACE,
    borderWidth: 2,
    borderColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  teamBookmark: {
    position: 'absolute',
    top: -2,
    right: -2,
  },
  teamLogoInitial: {
    fontSize: 20,
    fontWeight: '800',
    color: WHITE,
  },
  teamLogoName: {
    fontSize: 11,
    color: GRAY_LIGHT,
    textAlign: 'center',
  },
  teamDivider: {
    height: 1,
    backgroundColor: GRAY_DARK,
    marginBottom: 12,
  },
  // Video Item (same as watch history)
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
  // Competition Item
  competitionCard: {
    backgroundColor: SURFACE,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  competitionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  competitionImageWrap: {
    width: 52,
    height: 52,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: GRAY_DARK,
    marginRight: 12,
  },
  competitionImage: {
    width: '100%',
    height: '100%',
  },
  competitionInfo: {
    flex: 1,
  },
  competitionName: {
    fontSize: 14,
    fontWeight: '700',
    color: WHITE,
    marginBottom: 3,
  },
  competitionDates: {
    fontSize: 12,
    color: GRAY_LIGHT,
    marginBottom: 6,
  },
  competitionTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: GRAY_DARK,
    borderRadius: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 4,
  },
  tagText: {
    fontSize: 10,
    color: GRAY_LIGHT,
  },
  competitionActions: {
    alignItems: 'center',
    marginLeft: 8,
  },
  editButton: {
    marginTop: 8,
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
