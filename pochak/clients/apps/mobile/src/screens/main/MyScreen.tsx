import React, {useState} from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
} from 'react-native';
import {Ionicons, MaterialIcons, MaterialCommunityIcons} from '@expo/vector-icons';
import {colors} from '../../theme';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../navigation/types';
import {
  mockWatchHistoryVideos,
  mockWatchHistoryClips,
  mockMyClips,
  mockReservations,
  mockFavoriteTeams,
  mockFavoriteTeamVideos,
  mockFavoriteCompetitions,
  formatViewCount,
} from '../../services/myApi';
import type {
  WatchHistoryItem,
  MyClipItem,
  WatchReservationItem,
  FavoriteTeam,
  FavoriteCompetition,
} from '../../services/myApi';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const GREEN = colors.green;
const BG = colors.bg;
const SURFACE = colors.surface;
const WHITE = colors.white;
const GRAY = colors.gray;
const GRAY_LIGHT = colors.grayLight;
const GRAY_DARK = colors.grayDark;

// Card size constants
const VIDEO_CARD_WIDTH = 220;
const VIDEO_CARD_HEIGHT = VIDEO_CARD_WIDTH * (9 / 16); // 16:9
const CLIP_CARD_WIDTH = 120;
const CLIP_CARD_HEIGHT = CLIP_CARD_WIDTH * (16 / 9); // 9:16
const CLIP_GRID_WIDTH = (SCREEN_WIDTH - 48) / 2;
const CLIP_GRID_HEIGHT = CLIP_GRID_WIDTH * (16 / 9);
const LIST_THUMB_WIDTH = 140;
const LIST_THUMB_HEIGHT = LIST_THUMB_WIDTH * (9 / 16);
const COMP_CARD_WIDTH = 200;
const COMP_CARD_HEIGHT = 120;

type MainTab = '홈' | '시청이력' | '내클립' | '시청예약' | '즐겨찾기';
type WatchSubTab = '영상' | '클립';
type FavSubTab = '팀/클럽' | '대회';

// ============================================================
// Shared Components
// ============================================================

function SectionHeader({title, onMore}: {title: string; onMore?: () => void}) {
  return (
    <TouchableOpacity
      style={s.sectionHeader}
      onPress={onMore}
      disabled={!onMore}
      activeOpacity={onMore ? 0.7 : 1}>
      <Text style={s.sectionTitle}>{title}</Text>
      {onMore && (
        <MaterialIcons name="chevron-right" size={20} color={GRAY_LIGHT} />
      )}
    </TouchableOpacity>
  );
}

/** 16:9 horizontal scroll video card (for 홈 tab) */
function HorizVideoCard({item}: {item: WatchHistoryItem}) {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return (
    <TouchableOpacity
      style={s.hVideoCard}
      activeOpacity={0.8}
      onPress={() => nav.navigate('Player', {contentType: 'vod', contentId: item.id})}>
      <View style={s.hVideoThumb}>
        <Image source={{uri: item.thumbnailUrl}} style={StyleSheet.absoluteFill} />
        {/* Date badge top-left */}
        <View style={s.hVideoDateBadge}>
          <Text style={s.hVideoDateText}>{item.watchedDate.slice(5).replace('.', '/')} 예정</Text>
        </View>
        {/* Duration badge bottom-right */}
        <View style={s.hVideoDuration}>
          <Text style={s.hVideoDurationText}>{item.duration}</Text>
        </View>
      </View>
      <View style={s.hVideoTitleRow}>
        <Text style={[s.hVideoTitle, {flex: 1}]} numberOfLines={2}>{item.title}</Text>
        <TouchableOpacity style={s.hVideoMenuBtn} onPress={() => Alert.alert('메뉴', '', [{ text: '공유', onPress: () => {} }, { text: '삭제', onPress: () => {}, style: 'destructive' }, { text: '취소', style: 'cancel' }])}>
          <MaterialCommunityIcons name="dots-vertical" size={18} color={GRAY_LIGHT} />
        </TouchableOpacity>
      </View>
      <Text style={s.hVideoSub} numberOfLines={1}>{item.subtitle}</Text>
      <Text style={s.hVideoMeta} numberOfLines={1}>{item.meta}</Text>
    </TouchableOpacity>
  );
}

/** 9:16 horizontal scroll clip card */
function HorizClipCard({item, showViews}: {item: MyClipItem; showViews?: boolean}) {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return (
    <TouchableOpacity
      style={s.hClipCard}
      activeOpacity={0.8}
      onPress={() => nav.navigate('ClipPlayer', {contentId: item.id})}>
      <View style={s.hClipThumb}>
        <Image source={{uri: item.thumbnailUrl}} style={StyleSheet.absoluteFill} />
        <TouchableOpacity style={s.hClipMenuBtn} onPress={() => Alert.alert('메뉴', '', [{ text: '공유', onPress: () => {} }, { text: '삭제', onPress: () => {}, style: 'destructive' }, { text: '취소', style: 'cancel' }])}>
          <MaterialCommunityIcons name="dots-vertical" size={16} color={WHITE} />
        </TouchableOpacity>
        {showViews && (
          <View style={s.hClipViewsBadge}>
            <Ionicons name="eye-outline" size={10} color={WHITE} />
            <Text style={s.hClipViewsText}>{formatViewCount(item.viewCount)}</Text>
          </View>
        )}
      </View>
      <Text style={s.hClipTitle} numberOfLines={1}>{item.title}</Text>
      {showViews && (
        <Text style={s.hClipViewsLabel}>조회수 {formatViewCount(item.viewCount)}</Text>
      )}
    </TouchableOpacity>
  );
}

/** Video list item (thumbnail left + info right) for 시청이력 & 시청예약 */
function VideoListItem({item, dateBadge}: {item: WatchHistoryItem; dateBadge?: string}) {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return (
    <TouchableOpacity
      style={s.vListItem}
      activeOpacity={0.8}
      onPress={() => nav.navigate('Player', {contentType: 'vod', contentId: item.id})}>
      <View style={s.vListThumb}>
        <Image source={{uri: item.thumbnailUrl}} style={StyleSheet.absoluteFill} />
        <View style={s.vListDuration}>
          <Text style={s.vListDurationText}>{item.duration}</Text>
        </View>
        {dateBadge && (
          <View style={s.vListDateBadge}>
            <Text style={s.vListDateBadgeText}>{dateBadge}</Text>
          </View>
        )}
      </View>
      <View style={s.vListInfo}>
        <Text style={s.vListTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={s.vListSub} numberOfLines={1}>{item.subtitle}</Text>
        <Text style={s.vListMeta} numberOfLines={1}>{item.meta}</Text>
      </View>
      <TouchableOpacity style={s.vListMenuBtn} onPress={() => Alert.alert('메뉴', '', [{ text: '공유', onPress: () => {} }, { text: '삭제', onPress: () => {}, style: 'destructive' }, { text: '취소', style: 'cancel' }])}>
        <MaterialCommunityIcons name="dots-vertical" size={18} color={GRAY_LIGHT} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

/** 9:16 clip grid item (for 시청이력-클립, 내클립) */
function ClipGridItem({item, showMenu}: {item: MyClipItem; showMenu?: boolean}) {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return (
    <TouchableOpacity
      style={s.cGridCard}
      activeOpacity={0.8}
      onPress={() => nav.navigate('ClipPlayer', {contentId: item.id})}>
      <View style={s.cGridThumb}>
        <Image source={{uri: item.thumbnailUrl}} style={StyleSheet.absoluteFill} />
        {showMenu && (
          <TouchableOpacity style={s.cGridMenu} onPress={() => Alert.alert('메뉴', '', [{ text: '공유', onPress: () => {} }, { text: '삭제', onPress: () => {}, style: 'destructive' }, { text: '취소', style: 'cancel' }])}>
            <MaterialCommunityIcons name="dots-vertical" size={18} color={WHITE} />
          </TouchableOpacity>
        )}
        <View style={s.cGridViewsBadge}>
          <Ionicons name="eye-outline" size={10} color={WHITE} />
          <Text style={s.cGridViewsText}>{formatViewCount(item.viewCount)}</Text>
        </View>
      </View>
      <Text style={s.cGridTitle} numberOfLines={1}>{item.title}</Text>
      {showMenu && (
        <>
          <Text style={s.cGridDate} numberOfLines={1}>
            {item.date} | {item.competitionInfo}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

/** Large competition card for 즐겨찾기 */
function CompetitionCard({comp}: {comp: FavoriteCompetition}) {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return (
    <TouchableOpacity
      style={s.compCard}
      activeOpacity={0.8}
      onPress={() => nav.navigate('CompetitionDetail', {competitionId: comp.id})}>
      <View style={s.compCardInner}>
        <View style={s.compLogo}>
          <Text style={s.compLogoText}>{comp.name.charAt(0)}</Text>
        </View>
        <View style={s.compInfo}>
          <Text style={s.compName} numberOfLines={2}>{comp.name}</Text>
          <Text style={s.compDates}>{comp.dates}</Text>
          <View style={s.compTags}>
            <View style={s.compTag}>
              <Text style={s.compTagText}>{comp.sport}</Text>
            </View>
            {comp.isPaid && (
              <View style={[s.compTag, {backgroundColor: GREEN}]}>
                <Text style={s.compTagText}>유료</Text>
              </View>
            )}
            {comp.hasCommentary && (
              <View style={s.compTag}>
                <Text style={s.compTagText}>해설</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

/** Circular team logo for 즐겨찾기 */
function TeamCircle({team}: {team: FavoriteTeam}) {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return (
    <TouchableOpacity
      style={s.teamCircle}
      activeOpacity={0.8}
      onPress={() => nav.navigate('TeamDetail', {teamId: team.id})}>
      <View style={s.teamLogo}>
        <Text style={s.teamLogoText}>{team.logoInitial}</Text>
      </View>
      <Text style={s.teamName} numberOfLines={1}>{team.name}</Text>
      {team.sportCategory && (
        <Text style={s.teamSportCategory} numberOfLines={1}>{team.sportCategory}</Text>
      )}
    </TouchableOpacity>
  );
}

// ============================================================
// Tab Contents
// ============================================================

function HomeTab() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabPad}>
      {/* 최근 본 영상 */}
      <SectionHeader title="최근 본 영상" onMore={() => nav.navigate('WatchHistory')} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.hScroll}>
        {mockWatchHistoryVideos.slice(0, 5).map(v => (
          <HorizVideoCard key={v.id} item={v} />
        ))}
      </ScrollView>

      {/* 최근 본 클립 */}
      <SectionHeader title="최근 본 클립" onMore={() => nav.navigate('WatchHistory')} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.hScroll}>
        {mockWatchHistoryClips.map(c => (
          <HorizClipCard key={c.id} item={c} showViews />
        ))}
      </ScrollView>

      {/* 내 클립 */}
      <SectionHeader title="내 클립" onMore={() => nav.navigate('MyClips')} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.hScroll}>
        {mockMyClips.slice(0, 5).map(c => (
          <HorizClipCard key={c.id} item={c} showViews />
        ))}
      </ScrollView>

      {/* 즐겨찾는 대회 */}
      <SectionHeader title="즐겨찾는 대회" onMore={() => nav.navigate('Favorites')} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.hScroll}>
        {mockFavoriteCompetitions.map(comp => (
          <CompetitionCard key={comp.id} comp={comp} />
        ))}
      </ScrollView>

      {/* 즐겨찾는 팀/클럽 */}
      <SectionHeader title="즐겨찾는 팀/클럽" onMore={() => nav.navigate('Favorites')} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.hScroll}>
        {mockFavoriteTeams.map(t => (
          <TeamCircle key={t.id} team={t} />
        ))}
      </ScrollView>

      <View style={{height: 40}} />
    </ScrollView>
  );
}

function WatchHistoryTab() {
  const [subTab, setSubTab] = useState<WatchSubTab>('영상');

  return (
    <View style={s.flex1}>
      {/* Sub-tab chips */}
      <View style={s.chipRow}>
        {(['영상', '클립'] as const).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[s.chip, subTab === tab && s.chipActive]}
            onPress={() => setSubTab(tab)}>
            <Text style={[s.chipText, subTab === tab && s.chipTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {subTab === '영상' ? (
        <FlatList
          data={mockWatchHistoryVideos}
          keyExtractor={i => i.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.listPad}
          renderItem={({item}) => <VideoListItem item={item} />}
        />
      ) : (
        <FlatList
          data={mockWatchHistoryClips}
          keyExtractor={i => i.id}
          numColumns={2}
          columnWrapperStyle={s.gridRow}
          contentContainerStyle={s.listPad}
          showsVerticalScrollIndicator={false}
          renderItem={({item}) => <ClipGridItem item={item} />}
        />
      )}
    </View>
  );
}

function MyClipsTab() {
  return (
    <FlatList
      data={mockMyClips}
      keyExtractor={i => i.id}
      numColumns={2}
      columnWrapperStyle={s.gridRow}
      contentContainerStyle={s.listPad}
      showsVerticalScrollIndicator={false}
      renderItem={({item}) => <ClipGridItem item={item} showMenu />}
    />
  );
}

function WatchReservationTab() {
  // Group by date
  const grouped: Record<string, WatchReservationItem[]> = {};
  for (const r of mockReservations) {
    if (!grouped[r.date]) grouped[r.date] = [];
    grouped[r.date].push(r);
  }

  // Build matching WatchHistoryItem for VideoListItem rendering
  const toVideoItem = (r: WatchReservationItem): WatchHistoryItem => ({
    id: r.id,
    thumbnailUrl: `https://via.placeholder.com/140x79/1E1E1E/FFFFFF?text=${encodeURIComponent(r.sport)}`,
    duration: r.time,
    title: r.matchName,
    subtitle: `${r.sport} | ${r.stadium}`,
    meta: `${r.date} ${r.time}`,
    watchedDate: r.date,
  });

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabPad}>
      {Object.entries(grouped).map(([date, items]) => {
        const dDay = items[0].dDay;
        return (
          <View key={date} style={s.resGroup}>
            <View style={s.resGroupHeader}>
              <Text style={s.resGroupDate}>{date.replace(/\./g, '.')}</Text>
              <View style={[s.resGroupDDay, dDay === 'D-Day' && s.resGroupDDayLive]}>
                <Text style={s.resGroupDDayText}>{dDay}</Text>
              </View>
            </View>
            {items.map(r => {
              const dateShort = r.date.slice(5).replace('.', '/');
              return (
                <VideoListItem
                  key={r.id}
                  item={toVideoItem(r)}
                  dateBadge={`${dateShort} 예정`}
                />
              );
            })}
          </View>
        );
      })}
      <View style={{height: 40}} />
    </ScrollView>
  );
}

function FavoritesTab() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [favSubTab, setFavSubTab] = useState<FavSubTab>('팀/클럽');

  return (
    <View style={s.flex1}>
      {/* Sub-tab chips */}
      <View style={s.chipRow}>
        {(['팀/클럽', '대회'] as const).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[s.chip, favSubTab === tab && s.chipActive]}
            onPress={() => setFavSubTab(tab)}>
            <Text style={[s.chipText, favSubTab === tab && s.chipTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {favSubTab === '팀/클럽' ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabPad}>
          {/* Horizontal team logos row */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.hScroll}>
            {mockFavoriteTeams.map(t => (
              <TeamCircle key={t.id} team={t} />
            ))}
          </ScrollView>

          {/* Vertical video list below */}
          <SectionHeader title="즐겨찾기 팀 영상" />
          {mockFavoriteTeamVideos.map(v => (
            <VideoListItem key={v.id} item={v} />
          ))}
          <View style={{height: 40}} />
        </ScrollView>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabPad}>
          {mockFavoriteCompetitions.map(comp => (
            <FavCompetitionRow key={comp.id} comp={comp} />
          ))}
          <View style={{height: 40}} />
        </ScrollView>
      )}
    </View>
  );
}

/** Competition row for 즐겨찾기-대회 tab: bookmark + banner + notification toggle */
function FavCompetitionRow({comp}: {comp: FavoriteCompetition}) {
  const [notifyOn, setNotifyOn] = useState(false);
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return (
    <TouchableOpacity
      style={s.favCompRow}
      activeOpacity={0.8}
      onPress={() => nav.navigate('CompetitionDetail', {competitionId: comp.id})}>
      <Ionicons name="bookmark" size={20} color={GREEN} style={s.favCompBookmark} />
      <View style={s.favCompBanner}>
        <View style={s.favCompBannerInner}>
          <View style={s.compLogo}>
            <Text style={s.compLogoText}>{comp.name.charAt(0)}</Text>
          </View>
          <View style={s.favCompBannerInfo}>
            <Text style={s.compName} numberOfLines={2}>{comp.name}</Text>
            <Text style={s.compDates}>{comp.dates}</Text>
            <View style={s.compTags}>
              <View style={s.compTag}>
                <Text style={s.compTagText}>{comp.sport}</Text>
              </View>
              {comp.isPaid && (
                <View style={[s.compTag, {backgroundColor: GREEN}]}>
                  <Text style={s.compTagText}>유료</Text>
                </View>
              )}
              {comp.hasCommentary && (
                <View style={s.compTag}>
                  <Text style={s.compTagText}>해설</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
      <TouchableOpacity
        style={s.favCompNotify}
        onPress={() => setNotifyOn(!notifyOn)}>
        <Ionicons
          name={notifyOn ? 'notifications' : 'notifications-outline'}
          size={20}
          color={notifyOn ? GREEN : GRAY_LIGHT}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

// ============================================================
// Main Component
// ============================================================

const TABS: MainTab[] = ['홈', '시청이력', '내클립', '시청예약', '즐겨찾기'];

export default function MyScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [activeTab, setActiveTab] = useState<MainTab>('홈');

  const renderTab = () => {
    switch (activeTab) {
      case '홈':
        return <HomeTab />;
      case '시청이력':
        return <WatchHistoryTab />;
      case '내클립':
        return <MyClipsTab />;
      case '시청예약':
        return <WatchReservationTab />;
      case '즐겨찾기':
        return <FavoritesTab />;
      default:
        return null;
    }
  };

  return (
    <View style={s.safe}>
      <View style={s.container}>
        {/* ── Compact Header ── */}
        <View style={s.header}>
          <View />
          <View style={s.headerRight}>
            <TouchableOpacity style={s.headerBtn} onPress={() => nav.navigate('Search')}>
              <Ionicons name="search-outline" size={22} color={WHITE} />
            </TouchableOpacity>
            <TouchableOpacity style={s.headerBtn}>
              <Ionicons name="qr-code-outline" size={20} color={WHITE} />
            </TouchableOpacity>
            <TouchableOpacity
              style={s.headerBtn}
              onPress={() => nav.navigate('MyMenuHub')}>
              <Ionicons name="menu-outline" size={24} color={WHITE} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Profile Section ── */}
        <TouchableOpacity
          style={s.profile}
          activeOpacity={0.8}
          onPress={() => nav.navigate('ProfileEdit')}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>P</Text>
          </View>
          <View style={s.profileInfo}>
            <View style={s.profileNameRow}>
              <Text style={s.profileName}>pochak2026</Text>
              <MaterialIcons name="edit" size={14} color={GRAY_LIGHT} style={{marginLeft: 6}} />
            </View>
            <Text style={s.profileEmail}>kimpochak@hogak.co.kr</Text>
          </View>
        </TouchableOpacity>

        {/* ── Tab Bar (horizontal scroll, green underline) ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={s.tabBarScroll}
          contentContainerStyle={s.tabBarContent}>
          {TABS.map(tab => {
            const active = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[s.tabItem, active && s.tabItemActive]}
                onPress={() => setActiveTab(tab)}>
                <Text style={[s.tabText, active && s.tabTextActive]}>{tab}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ── Tab Content ── */}
        <View style={s.flex1}>{renderTab()}</View>
      </View>
    </View>
  );
}

// ============================================================
// Styles
// ============================================================

const s = StyleSheet.create({
  safe: {flex: 1, backgroundColor: BG},
  container: {flex: 1, backgroundColor: BG},
  flex1: {flex: 1},

  // ── Header ──
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 44,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  headerBtn: {padding: 4},

  // ── Profile ──
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {color: WHITE, fontSize: 24, fontWeight: '900'},
  profileInfo: {marginLeft: 12, flex: 1},
  profileNameRow: {flexDirection: 'row', alignItems: 'center'},
  profileName: {color: WHITE, fontSize: 17, fontWeight: '700'},
  profileEmail: {color: GRAY_LIGHT, fontSize: 12, marginTop: 2},

  // ── Tab Bar ──
  tabBarScroll: {
    maxHeight: 44,
    borderBottomWidth: 0.5,
    borderBottomColor: GRAY_DARK,
  },
  tabBarContent: {paddingHorizontal: 16, gap: 4},
  tabItem: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {borderBottomColor: GREEN},
  tabText: {fontSize: 14, fontWeight: '500', color: GRAY},
  tabTextActive: {color: WHITE, fontWeight: '700'},

  // ── Tab content padding ──
  tabPad: {paddingHorizontal: 16, paddingBottom: 40},
  listPad: {paddingHorizontal: 16, paddingBottom: 40},
  hScroll: {marginBottom: 4},

  // ── Section Header ──
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 12,
  },
  sectionTitle: {fontSize: 16, fontWeight: '700', color: WHITE},

  // ── Horizontal Video Card (16:9) ──
  hVideoCard: {width: VIDEO_CARD_WIDTH, marginRight: 12},
  hVideoThumb: {
    width: VIDEO_CARD_WIDTH,
    height: VIDEO_CARD_HEIGHT,
    borderRadius: 8,
    backgroundColor: SURFACE,
    overflow: 'hidden',
  },
  hVideoDateBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: GREEN,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  hVideoDateText: {fontSize: 10, color: WHITE, fontWeight: '600'},
  hVideoDuration: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  hVideoDurationText: {fontSize: 10, color: WHITE},
  hVideoTitle: {fontSize: 12, fontWeight: '600', color: WHITE},
  hVideoSub: {fontSize: 11, color: GRAY_LIGHT, marginTop: 2},
  hVideoMeta: {fontSize: 10, color: GRAY, marginTop: 2},

  // ── Horizontal Clip Card (9:16) ──
  hClipCard: {width: CLIP_CARD_WIDTH, marginRight: 10},
  hClipThumb: {
    width: CLIP_CARD_WIDTH,
    height: CLIP_CARD_HEIGHT,
    borderRadius: 8,
    backgroundColor: SURFACE,
    overflow: 'hidden',
  },
  hClipViewsBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
    gap: 3,
  },
  hClipViewsText: {fontSize: 10, color: WHITE},
  hClipTitle: {fontSize: 11, fontWeight: '600', color: WHITE, marginTop: 4},

  // ── Video List Item (시청이력/시청예약) ──
  vListItem: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: GRAY_DARK,
  },
  vListThumb: {
    width: LIST_THUMB_WIDTH,
    height: LIST_THUMB_HEIGHT,
    borderRadius: 6,
    backgroundColor: SURFACE,
    overflow: 'hidden',
  },
  vListDuration: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 3,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  vListDurationText: {fontSize: 10, color: WHITE},
  vListDateBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: GREEN,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  vListDateBadgeText: {fontSize: 9, fontWeight: '700', color: WHITE},
  vListInfo: {flex: 1, marginLeft: 10, justifyContent: 'center'},
  vListTitle: {fontSize: 13, fontWeight: '600', color: WHITE},
  vListSub: {fontSize: 11, color: GRAY_LIGHT, marginTop: 3},
  vListMeta: {fontSize: 10, color: GRAY, marginTop: 3},

  // ── Clip Grid (2 columns, 9:16) ──
  gridRow: {justifyContent: 'space-between', marginBottom: 14},
  cGridCard: {width: CLIP_GRID_WIDTH},
  cGridThumb: {
    width: '100%',
    height: CLIP_GRID_HEIGHT,
    borderRadius: 8,
    backgroundColor: SURFACE,
    overflow: 'hidden',
  },
  cGridMenu: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cGridViewsBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
    gap: 3,
  },
  cGridViewsText: {fontSize: 10, color: WHITE},
  cGridTitle: {fontSize: 12, fontWeight: '600', color: WHITE, marginTop: 6},
  cGridDate: {fontSize: 10, color: GRAY, marginTop: 2},

  // ── Chip toggle (시청이력 sub-tab) ──
  chipRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: GRAY_DARK,
  },
  chipActive: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },
  chipText: {fontSize: 13, fontWeight: '500', color: GRAY},
  chipTextActive: {color: WHITE, fontWeight: '700'},

  // ── 시청예약 date group ──
  resGroup: {marginTop: 16},
  resGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 10,
  },
  resGroupDate: {fontSize: 14, fontWeight: '700', color: WHITE},
  resGroupDDay: {
    backgroundColor: GRAY_DARK,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  resGroupDDayLive: {backgroundColor: '#FF0000'},
  resGroupDDayText: {fontSize: 11, fontWeight: '700', color: WHITE},

  // ── Competition Card (즐겨찾기) ──
  compCard: {
    width: COMP_CARD_WIDTH,
    marginRight: 12,
    borderRadius: 10,
    overflow: 'hidden',
  },
  compCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    height: COMP_CARD_HEIGHT,
    backgroundColor: '#1A3A6B',
  },
  compLogo: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: BG,
    borderWidth: 1,
    borderColor: GRAY_DARK,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compLogoText: {fontSize: 22, fontWeight: '700', color: GREEN},
  compInfo: {flex: 1, marginLeft: 10},
  compName: {fontSize: 13, fontWeight: '700', color: WHITE},
  compDates: {fontSize: 10, color: GRAY, marginTop: 4},
  compTags: {flexDirection: 'row', gap: 4, marginTop: 6, flexWrap: 'wrap'},
  compTag: {
    backgroundColor: GRAY_DARK,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  compTagText: {fontSize: 9, fontWeight: '600', color: WHITE},

  // ── Team Circle (즐겨찾기) ──
  teamCircle: {width: 76, alignItems: 'center', marginRight: 12},
  teamLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: GRAY_DARK,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamLogoText: {fontSize: 20, fontWeight: '700', color: GREEN},
  teamName: {fontSize: 10, color: GRAY_LIGHT, marginTop: 4, textAlign: 'center'},
  teamSportCategory: {fontSize: 9, color: GRAY, marginTop: 1, textAlign: 'center'},

  // ── Favorite Competition Row (즐겨찾기-대회) ──
  favCompRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: GRAY_DARK,
  },
  favCompBookmark: {marginRight: 10},
  favCompBanner: {
    flex: 1,
    backgroundColor: SURFACE,
    borderRadius: 10,
    overflow: 'hidden',
  },
  favCompBannerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  favCompBannerInfo: {flex: 1, marginLeft: 10},
  favCompNotify: {marginLeft: 10, padding: 4},

  // ── Menu buttons ──
  hVideoTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 6,
  },
  hVideoMenuBtn: {padding: 2, marginLeft: 2},
  hClipMenuBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hClipViewsLabel: {fontSize: 10, color: GRAY, marginTop: 2},
  vListMenuBtn: {paddingLeft: 4, justifyContent: 'center'},
});
