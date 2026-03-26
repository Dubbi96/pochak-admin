import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import { Ionicons as Icon, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../navigation/types';
import MediaImage from '../../components/common/MediaImage';
import {colors} from '../../theme';
import {
  BannerItem,
  ClipContentItem,
  CompetitionItem,
  ContentSection,
  LiveContentItem,
  OfficialContentItem,
  PopularChannel,
  RegularContentItem,
  formatViewCount,
  mockBanners,
  mockCompetitions,
  mockContentSections,
  mockLiveContents,
  popularChannels,
  sidebarMenus,
} from '../../services/homeApi';
import {analyticsService} from '../../services/analyticsService';
import {useEntitlementGate} from '../../hooks/useEntitlementGate';

type HomeNavProp = NativeStackNavigationProp<RootStackParamList>;

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const TOP_BAR_HEIGHT = 52;
const BANNER_HEIGHT = 200;

const SIDEBAR_ICON_MAP: Record<string, {family: 'MaterialIcons' | 'MaterialCommunityIcons'; name: string}> = {
  '시청내역': {family: 'MaterialIcons', name: 'history'},
  '관심콘텐츠': {family: 'MaterialIcons', name: 'favorite-border'},
  '내클립': {family: 'MaterialIcons', name: 'content-cut'},
  '구독함': {family: 'MaterialIcons', name: 'subscriptions'},
  '대회권': {family: 'MaterialIcons', name: 'confirmation-number'},
  '경기패스': {family: 'MaterialIcons', name: 'sports'},
  '선물함': {family: 'MaterialIcons', name: 'card-giftcard'},
  '가족계정': {family: 'MaterialIcons', name: 'people'},
  '일정/예약': {family: 'MaterialIcons', name: 'event'},
  '즐겨찾기': {family: 'MaterialIcons', name: 'bookmark'},
  '내클럽': {family: 'MaterialCommunityIcons', name: 'account-group'},
  '관심클럽': {family: 'MaterialIcons', name: 'favorite-border'},
  '커뮤니티': {family: 'MaterialIcons', name: 'forum'},
  '대회소식': {family: 'MaterialIcons', name: 'campaign'},
  '시설예약': {family: 'MaterialIcons', name: 'business'},
  '자주가는시설': {family: 'MaterialIcons', name: 'place'},
};

// ─── Top Bar ───────────────────────────────────────────────

type ServiceType = 'TV' | '시티' | '클럽';

interface TopBarProps {
  onMenuPress: () => void;
  translateY: Animated.Value;
  selectedService: ServiceType;
  onServiceChange: (service: ServiceType) => void;
}

function TopBar({onMenuPress, translateY, selectedService, onServiceChange}: TopBarProps) {
  const navigation = useNavigation<HomeNavProp>();
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const services: {label: ServiceType; enabled: boolean}[] = [
    {label: 'TV', enabled: true},
    {label: '시티', enabled: false},
    {label: '클럽', enabled: false},
  ];

  return (
    <Animated.View
      style={[styles.topBar, {transform: [{translateY}]}]}>
      <View style={styles.topBarLeft}>
        <Image
          source={require('../../../assets/pochak_logo.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
        <TouchableOpacity
          style={styles.serviceDropdownBtn}
          activeOpacity={0.7}
          onPress={() => setDropdownVisible(!dropdownVisible)}>
          <Icon name="caret-down" size={14} color="#00CC33" style={{marginRight: 2}} />
          <Text style={styles.serviceDropdownText}>{selectedService}</Text>
        </TouchableOpacity>
      </View>
      {dropdownVisible && (
        <View style={styles.serviceDropdown}>
          {services.map(s => (
            <TouchableOpacity
              key={s.label}
              style={styles.serviceDropdownItem}
              activeOpacity={0.7}
              onPress={() => {
                if (s.enabled) {
                  onServiceChange(s.label);
                  setDropdownVisible(false);
                }
              }}>
              <View style={styles.serviceDropdownRow}>
                {selectedService === s.label && (
                  <Icon name="checkmark" size={14} color="#00CC33" style={{marginRight: 6}} />
                )}
                <Text
                  style={[
                    styles.serviceDropdownLabel,
                    selectedService === s.label && styles.serviceDropdownLabelActive,
                    !s.enabled && styles.serviceDropdownLabelDisabled,
                  ]}>
                  {s.label}
                </Text>
                {!s.enabled && (
                  <Text style={styles.serviceDropdownSoon}>준비 중</Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
      <View style={styles.topBarRight}>
        <TouchableOpacity
          style={styles.topBarIcon}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Search')}>
          <Icon name="search-outline" size={22} color={colors.white} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.topBarIcon} activeOpacity={0.7}>
          <Icon name="scan-outline" size={22} color={colors.white} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.topBarIcon}
          activeOpacity={0.7}
          onPress={onMenuPress}>
          <Icon name="menu-outline" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

// ─── Sidebar Overlay ───────────────────────────────────────

interface SidebarProps {
  visible: boolean;
  onClose: () => void;
}

// Map sidebar menu labels to navigation routes
const SIDEBAR_NAV_MAP: Record<string, {route: keyof RootStackParamList; params?: object} | {tab: string}> = {
  '시청내역': {route: 'WatchHistory'},
  '관심콘텐츠': {route: 'Favorites'},
  '내클립': {route: 'MyClips'},
  '구독함': {route: 'ProductList'},
  '대회권': {route: 'ProductList'},
  '경기패스': {route: 'ProductList'},
  '선물함': {route: 'Gift'},
  '가족계정': {route: 'FamilyAccount'},
  '일정/예약': {tab: 'Schedule'},
  '즐겨찾기': {route: 'Favorites'},
  '내클럽': {route: 'ClubHome'},
  '관심클럽': {route: 'ClubSearch'},
  '커뮤니티': {route: 'Community'},
  '대회소식': {route: 'CityHome'},
  '시설예약': {route: 'CityHome'},
  '자주가는시설': {route: 'Favorites'},
};

function Sidebar({visible, onClose}: SidebarProps) {
  const slideAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current;
  const navigation = useNavigation<HomeNavProp>();
  const currentRoute = navigation.getState()?.routes?.slice(-1)?.[0]?.name;

  // Helper to check if a sidebar menu item matches the current route
  const isMenuActive = useCallback((item: string): boolean => {
    const navTarget = SIDEBAR_NAV_MAP[item];
    if (!navTarget || !currentRoute) return false;
    if ('tab' in navTarget) return false;
    return navTarget.route === currentRoute;
  }, [currentRoute]);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: visible ? 0 : SCREEN_WIDTH,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [visible, slideAnim]);

  const handleMenuPress = useCallback((item: string) => {
    const navTarget = SIDEBAR_NAV_MAP[item];
    onClose();
    if (navTarget) {
      if ('tab' in navTarget) {
        // Switch to a tab within MainTab
        navigation.navigate('MainTab', {screen: navTarget.tab as any});
      } else {
        navigation.navigate(navTarget.route as any, navTarget.params as any);
      }
    }
  }, [navigation, onClose]);

  if (!visible) {
    return null;
  }

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent>
      <View style={styles.sidebarOverlay}>
        <Pressable style={styles.sidebarBackdrop} onPress={onClose} />
        <Animated.View
          style={[
            styles.sidebarContainer,
            {transform: [{translateX: slideAnim}]},
          ]}>
          <SafeAreaView style={styles.sidebarSafe} edges={['top', 'bottom']}>
            {/* Close button */}
            <TouchableOpacity
              style={styles.sidebarClose}
              onPress={onClose}
              activeOpacity={0.7}>
              <Icon name="close" size={24} color={colors.white} />
            </TouchableOpacity>

            <ScrollView
              style={styles.sidebarScroll}
              showsVerticalScrollIndicator={false}>
              {/* Profile area */}
              <View style={styles.sidebarProfile}>
                <View style={styles.sidebarAvatar}>
                  <Icon name="person" size={28} color={colors.gray} />
                </View>
                <View style={styles.sidebarProfileInfo}>
                  <Text style={styles.sidebarUsername}>pochak2026</Text>
                  <Text style={styles.sidebarSubscription}>
                    구독중인 상품이 없습니다
                  </Text>
                </View>
              </View>

              {/* Menu sections */}
              {sidebarMenus.map(menu => (
                <View key={menu.section} style={styles.sidebarSection}>
                  <Text style={styles.sidebarSectionTitle}>
                    {menu.section}
                  </Text>
                  {menu.items.map(item => {
                    const iconInfo = SIDEBAR_ICON_MAP[item];
                    return (
                      <TouchableOpacity
                        key={item}
                        style={styles.sidebarMenuItem}
                        activeOpacity={0.7}
                        onPress={() => handleMenuPress(item)}>
                        {iconInfo ? (
                          iconInfo.family === 'MaterialCommunityIcons' ? (
                            <MaterialCommunityIcons
                              name={iconInfo.name as keyof typeof MaterialCommunityIcons.glyphMap}
                              size={18}
                              color={colors.grayLight}
                              style={styles.sidebarMenuIcon}
                            />
                          ) : (
                            <MaterialIcons
                              name={iconInfo.name as keyof typeof MaterialIcons.glyphMap}
                              size={18}
                              color={colors.grayLight}
                              style={styles.sidebarMenuIcon}
                            />
                          )
                        ) : null}
                        <Text style={[styles.sidebarMenuText, isMenuActive(item) && {color: colors.green}]}>{item}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}

              {/* Bottom links */}
              <View style={styles.sidebarBottomLinks}>
                <TouchableOpacity
                  style={styles.sidebarMenuItem}
                  activeOpacity={0.7}
                  onPress={() => { onClose(); navigation.navigate('Notices'); }}>
                  <MaterialIcons
                    name="announcement"
                    size={18}
                    color={colors.grayLight}
                    style={styles.sidebarMenuIcon}
                  />
                  <Text style={styles.sidebarMenuText}>공지사항</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.sidebarMenuItem}
                  activeOpacity={0.7}
                  onPress={() => { onClose(); navigation.navigate('Support'); }}>
                  <MaterialIcons
                    name="headset-mic"
                    size={18}
                    color={colors.grayLight}
                    style={styles.sidebarMenuIcon}
                  />
                  <Text style={styles.sidebarMenuText}>고객센터</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

// ─── Banner Carousel ───────────────────────────────────────

function BannerCarousel({banners}: {banners: BannerItem[]}) {
  const scrollRef = useRef<FlatList<BannerItem>>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const navigation = useNavigation<HomeNavProp>();

  const handleBannerPress = useCallback(
    (_item: BannerItem) => {
      // Navigate to first competition or placeholder
      if (mockCompetitions.length > 0) {
        navigation.navigate('CompetitionDetail', {competitionId: mockCompetitions[0].id});
      }
    },
    [navigation],
  );

  const startAutoScroll = useCallback(() => {
    timerRef.current = setInterval(() => {
      setActiveIndex(prev => {
        const next = (prev + 1) % banners.length;
        scrollRef.current?.scrollToIndex({index: next, animated: true});
        return next;
      });
    }, 4000);
  }, [banners.length]);

  const stopAutoScroll = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    startAutoScroll();
    return stopAutoScroll;
  }, [startAutoScroll, stopAutoScroll]);

  const onScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
      setActiveIndex(idx);
    },
    [],
  );

  const renderBanner = useCallback(
    ({item}: {item: BannerItem}) => (
      <TouchableOpacity
        style={styles.bannerSlide}
        activeOpacity={0.9}
        onPress={() => handleBannerPress(item)}>
        <MediaImage
          uri={item.imageUrl}
          style={styles.bannerImage}
          resizeMode="cover"
        />
        <View style={styles.bannerTextOverlay}>
          <Text style={styles.bannerTitle} numberOfLines={1}>
            {item.title}
          </Text>
          {item.subtitle && (
            <Text style={styles.bannerSubtitle} numberOfLines={1}>
              {item.subtitle}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    ),
    [handleBannerPress],
  );

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: SCREEN_WIDTH,
      offset: SCREEN_WIDTH * index,
      index,
    }),
    [],
  );

  return (
    <View style={styles.bannerContainer}>
      <FlatList
        ref={scrollRef}
        data={banners}
        renderItem={renderBanner}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
        onScrollBeginDrag={stopAutoScroll}
        onScrollEndDrag={startAutoScroll}
        getItemLayout={getItemLayout}
        bounces={false}
      />
      {/* Page dots */}
      <View style={styles.dotsContainer}>
        {banners.map((b, i) => (
          <View
            key={b.id}
            style={[styles.dot, i === activeIndex && styles.dotActive]}
          />
        ))}
      </View>
    </View>
  );
}

// ─── Official Live Section ──────────────────────────────────────────

function OfficialLiveSection({items}: {items: LiveContentItem[]}) {
  const navigation = useNavigation<HomeNavProp>();
  const {checkAndNavigate} = useEntitlementGate();

  if (items.length === 0) {
    return null;
  }

  const renderLiveCard = useCallback(
    ({item}: {item: LiveContentItem}) => (
      <TouchableOpacity
        style={styles.liveCard}
        activeOpacity={0.8}
        onPress={() => checkAndNavigate(item.id, 'live')}>
        <MediaImage
          uri={item.thumbnailUrl}
          style={styles.liveThumbnail}
          resizeMode="cover"
        />
        <View style={styles.liveScheduleBadge}>
          <Text style={styles.liveScheduleBadgeText}>{item.time || '01/01 예정'}</Text>
        </View>
        <View style={styles.liveInfo}>
          <View style={styles.liveTitleRow}>
            <Text style={styles.liveTeams} numberOfLines={1}>
              {item.teamHome} vs {item.teamAway}
            </Text>
            <TouchableOpacity activeOpacity={0.7} style={styles.liveMoreBtn}>
              <Icon name="ellipsis-horizontal" size={16} color={colors.gray} />
            </TouchableOpacity>
          </View>
          <View style={styles.liveCompRow}>
            <Icon name="trophy-outline" size={12} color={colors.green} style={{marginRight: 4}} />
            <Text style={styles.liveLeague} numberOfLines={1}>{item.league}</Text>
          </View>
          <Text style={styles.liveTagsText} numberOfLines={1}>
            야구 | 무료 | 해설 | 2026.01.01
          </Text>
        </View>
      </TouchableOpacity>
    ),
    [checkAndNavigate],
  );

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={{flexDirection: 'row', alignItems: 'center'}}
          onPress={() => navigation.navigate('VideoList', {sectionType: 'LIVE', title: '공식 라이브'})}>
          <Text style={styles.sectionTitle}>공식 라이브</Text>
          <Text style={styles.sectionArrow}> {'>'}</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={items}
        renderItem={renderLiveCard}
        keyExtractor={item => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalList}
      />
    </View>
  );
}

// ─── Competition Banner Section ────────────────────────────

function CompetitionSection({items}: {items: CompetitionItem[]}) {
  const navigation = useNavigation<HomeNavProp>();

  const renderCard = useCallback(
    ({item}: {item: CompetitionItem}) => (
      <TouchableOpacity
        style={styles.competitionCard}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('CompetitionDetail', {competitionId: item.id})}>
        <MediaImage
          uri={item.thumbnailUrl}
          style={styles.competitionImage}
          resizeMode="cover"
        />
        <View style={styles.competitionOverlay}>
          <View style={styles.competitionStatusBadge}>
            <Text style={styles.competitionStatusText}>{item.status}</Text>
          </View>
          <Text style={styles.competitionTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.competitionDate}>{item.date}</Text>
        </View>
      </TouchableOpacity>
    ),
    [navigation],
  );

  return (
    <View style={styles.section}>
      <FlatList
        data={items}
        renderItem={renderCard}
        keyExtractor={item => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalList}
      />
    </View>
  );
}

// ─── Official Content Card ─────────────────────────────────

function OfficialContentCard({item}: {item: OfficialContentItem}) {
  const {checkAndNavigate} = useEntitlementGate();
  const badgeColor =
    item.badge === 'LIVE'
      ? '#FF0000'
      : item.badge === 'FREE'
        ? colors.green
        : item.badge === 'VOD'
          ? '#2196F3'
          : item.badge === 'NEW'
            ? '#FF6D00'
            : colors.gray;

  const contentType: 'live' | 'vod' = item.badge === 'LIVE' ? 'live' : 'vod';

  return (
    <TouchableOpacity
      style={styles.officialCard}
      activeOpacity={0.8}
      onPress={() => checkAndNavigate(item.id, contentType)}>
      <View style={styles.officialThumbnailWrap}>
        <MediaImage
          uri={item.thumbnailUrl}
          style={styles.officialThumbnail}
          resizeMode="cover"
        />
        <View style={[styles.contentBadge, {backgroundColor: badgeColor}]}>
          <Text style={styles.contentBadgeText}>{item.badge}</Text>
        </View>
      </View>
      <Text style={styles.officialTitle} numberOfLines={2}>
        {item.title}
      </Text>
      <Text style={styles.officialDesc} numberOfLines={1}>
        {item.description}
      </Text>
      {item.viewCount != null && (
        <Text style={styles.officialViews}>
          조회수 {formatViewCount(item.viewCount)}
        </Text>
      )}
    </TouchableOpacity>
  );
}

// ─── Regular Content Card ──────────────────────────────────

function RegularContentCard({item}: {item: RegularContentItem}) {
  const {checkAndNavigate} = useEntitlementGate();

  return (
    <TouchableOpacity
      style={styles.regularCard}
      activeOpacity={0.8}
      onPress={() => checkAndNavigate(item.id, 'vod')}>
      <MediaImage
        uri={item.thumbnailUrl}
        style={styles.regularThumbnail}
        resizeMode="cover"
      />
      <View style={styles.regularInfo}>
        <Text style={styles.regularTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.regularSubtitle} numberOfLines={1}>
          {item.subtitle}
        </Text>
        <View style={styles.tagsRow}>
          {item.tags.slice(0, 3).map(tag => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Clip Content Card ─────────────────────────────────────

function ClipContentCard({item}: {item: ClipContentItem}) {
  const {checkAndNavigate} = useEntitlementGate();

  return (
    <TouchableOpacity
      style={styles.clipCard}
      activeOpacity={0.8}
      onPress={() => checkAndNavigate(item.id, 'clip')}>
      <View style={styles.clipThumbnailWrap}>
        <MediaImage
          uri={item.thumbnailUrl}
          style={styles.clipThumbnail}
          resizeMode="cover"
        />
        <View style={styles.clipDuration}>
          <Text style={styles.clipDurationText}>{item.duration}</Text>
        </View>
      </View>
      <Text style={styles.clipTitle} numberOfLines={2}>
        {item.title}
      </Text>
      <Text style={styles.clipViews}>
        {formatViewCount(item.viewCount)}회
      </Text>
    </TouchableOpacity>
  );
}

// ─── Popular Team/Club Section ─────────────────────────────

function PopularTeamSection({items}: {items: PopularChannel[]}) {
  const navigation = useNavigation<HomeNavProp>();

  if (items.length === 0) {
    return null;
  }

  const renderTeam = useCallback(
    ({item}: {item: PopularChannel}) => (
      <TouchableOpacity
        style={styles.teamItem}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('ClubHome')}>
        <View style={[styles.teamLogo, {backgroundColor: item.color}]}>
          <Text style={styles.teamLogoText}>{item.initial}</Text>
        </View>
        <Text style={styles.teamName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.teamSub} numberOfLines={1}>{item.subtitle}</Text>
      </TouchableOpacity>
    ),
    [navigation],
  );

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={{flexDirection: 'row', alignItems: 'center'}}
          onPress={() => navigation.navigate('ClubSearch')}>
          <Text style={styles.sectionTitle}>인기 팀/클럽</Text>
          <Text style={styles.sectionArrow}> {'>'}</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={items}
        renderItem={renderTeam}
        keyExtractor={item => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalList}
      />
    </View>
  );
}

// ─── Generic Content Section ───────────────────────────────

function ContentSectionView({section}: {section: ContentSection}) {
  const navigation = useNavigation<HomeNavProp>();

  const renderItem = useCallback(
    ({item}: {item: OfficialContentItem | RegularContentItem | ClipContentItem}) => {
      switch (section.type) {
        case 'official':
          return <OfficialContentCard item={item as OfficialContentItem} />;
        case 'regular':
          return <RegularContentCard item={item as RegularContentItem} />;
        case 'clip':
          return <ClipContentCard item={item as ClipContentItem} />;
        default:
          return null;
      }
    },
    [section.type],
  );

  const handleMorePress = useCallback(() => {
    if (section.type === 'clip') {
      navigation.navigate('VideoList', {sectionType: 'CLIP', title: section.title});
    } else {
      navigation.navigate('VideoList', {sectionType: 'VOD', title: section.title});
    }
  }, [navigation, section.type, section.title]);

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <TouchableOpacity activeOpacity={0.7} onPress={handleMorePress} style={{flexDirection: 'row', alignItems: 'center'}}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <Text style={styles.sectionArrow}> {'>'}</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={section.items}
        renderItem={renderItem}
        keyExtractor={(item: {id: string}) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalList}
      />
    </View>
  );
}

// ─── Home Screen ───────────────────────────────────────────

export default function HomeScreen() {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceType>('TV');
  const scrollY = useRef(new Animated.Value(0)).current;

  // --- Analytics: track Home page view on mount ---
  useEffect(() => {
    analyticsService.trackPageView('Home');
  }, []);
  const lastScrollY = useRef(0);
  const topBarTranslateY = useRef(new Animated.Value(0)).current;
  const isBarHidden = useRef(false);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    // Re-trigger data load (for now just simulate, API integration later)
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const currentY = event.nativeEvent.contentOffset.y;
      const diff = currentY - lastScrollY.current;

      if (currentY <= TOP_BAR_HEIGHT) {
        // Near top, always show
        if (isBarHidden.current) {
          Animated.timing(topBarTranslateY, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }).start();
          isBarHidden.current = false;
        }
      } else if (diff > 8 && !isBarHidden.current) {
        // Scrolling down -> hide
        Animated.timing(topBarTranslateY, {
          toValue: -TOP_BAR_HEIGHT - 10,
          duration: 200,
          useNativeDriver: true,
        }).start();
        isBarHidden.current = true;
      } else if (diff < -8 && isBarHidden.current) {
        // Scrolling up -> show
        Animated.timing(topBarTranslateY, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
        isBarHidden.current = false;
      }

      lastScrollY.current = currentY;
    },
    [topBarTranslateY],
  );

  const openSidebar = useCallback(() => setSidebarVisible(true), []);
  const closeSidebar = useCallback(() => setSidebarVisible(false), []);

  return (
    <View style={styles.safeArea}>

      {/* Sticky Top Bar */}
      <TopBar onMenuPress={openSidebar} translateY={topBarTranslateY} selectedService={selectedService} onServiceChange={setSelectedService} />

      {/* Main scrollable content */}
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#00CC33" progressViewOffset={TOP_BAR_HEIGHT} />
        }>
        {/* Banner */}
        <BannerCarousel banners={mockBanners} />

        {/* Competition card strip (below banner) */}
        <CompetitionSection items={mockCompetitions} />

        {/* 공식 라이브 */}
        <OfficialLiveSection items={mockLiveContents} />

        {/* 인기 클립 */}
        {mockContentSections.filter(s => s.type === 'clip').slice(0, 1).map(section => (
          <ContentSectionView key={section.id} section={{...section, title: '인기 클립'}} />
        ))}

        {/* 최근 영상 */}
        {mockContentSections.filter(s => s.type === 'regular').slice(0, 1).map(section => (
          <ContentSectionView key={`recent-${section.id}`} section={{...section, title: '최근 영상'}} />
        ))}

        {/* 인기 팀/클럽 */}
        <PopularTeamSection items={popularChannels} />

        {/* 팀/클럽 라이브 */}
        {mockContentSections.filter(s => s.type === 'official').slice(0, 1).map(section => (
          <ContentSectionView key={`team-live-${section.id}`} section={{...section, title: '팀/클럽 라이브'}} />
        ))}

        {/* 팀/클럽 클립 */}
        {mockContentSections.filter(s => s.type === 'clip').slice(0, 1).map(section => (
          <ContentSectionView key={`team-clip-${section.id}`} section={{...section, title: '팀/클럽 클립'}} />
        ))}

        {/* Competition-specific sections */}
        {mockContentSections.filter(s => s.type === 'official').slice(1).map(section => (
          <ContentSectionView key={section.id} section={section} />
        ))}
        {mockContentSections.filter(s => s.type === 'regular').slice(1).map(section => (
          <ContentSectionView key={section.id} section={section} />
        ))}

        {/* Bottom spacer */}
        <View style={styles.bottomSpacer} />
      </Animated.ScrollView>

      {/* Sidebar */}
      <Sidebar visible={sidebarVisible} onClose={closeSidebar} />
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Layout
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollContent: {
    paddingTop: TOP_BAR_HEIGHT,
  },
  bottomSpacer: {
    height: 32,
  },

  // ── Top Bar ──
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: TOP_BAR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: colors.bg,
    zIndex: 100,
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
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImage: {
    height: 24,
    width: 100,
  },
  serviceDropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  serviceDropdownText: {
    color: '#00CC33',
    fontSize: 14,
    fontWeight: '700',
  },
  serviceDropdown: {
    position: 'absolute',
    top: TOP_BAR_HEIGHT - 4,
    left: 100,
    backgroundColor: '#262626',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4D4D4D',
    paddingVertical: 4,
    minWidth: 120,
    zIndex: 200,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  serviceDropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  serviceDropdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceDropdownLabel: {
    color: '#A6A6A6',
    fontSize: 14,
    fontWeight: '600',
  },
  serviceDropdownLabelActive: {
    color: '#00CC33',
  },
  serviceDropdownLabelDisabled: {
    color: '#666666',
  },
  serviceDropdownSoon: {
    color: '#666666',
    fontSize: 11,
    marginLeft: 8,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topBarIcon: {
    marginLeft: 16,
    padding: 4,
  },
  alertBadge: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: '#FF0000',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  alertBadgeText: {
    color: colors.white,
    fontSize: 9,
    fontWeight: '700',
  },

  // ── Sidebar ──
  sidebarOverlay: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebarBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sidebarContainer: {
    width: SCREEN_WIDTH * 0.78,
    backgroundColor: '#181818',
  },
  sidebarSafe: {
    flex: 1,
  },
  sidebarClose: {
    alignSelf: 'flex-end',
    padding: 16,
  },
  sidebarScroll: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sidebarProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.grayDark,
    marginBottom: 16,
  },
  sidebarAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.grayDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sidebarProfileInfo: {
    marginLeft: 12,
    flex: 1,
  },
  sidebarUsername: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 4,
  },
  sidebarSubscription: {
    fontSize: 12,
    color: colors.gray,
  },
  sidebarSection: {
    marginBottom: 20,
  },
  sidebarSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.green,
    marginBottom: 10,
  },
  sidebarMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  sidebarMenuIcon: {
    marginRight: 10,
  },
  sidebarMenuText: {
    fontSize: 14,
    color: colors.grayLight,
  },
  sidebarBottomLinks: {
    borderTopWidth: 0.5,
    borderTopColor: colors.grayDark,
    paddingTop: 12,
    marginBottom: 40,
  },

  // ── Banner ──
  bannerContainer: {
    height: BANNER_HEIGHT,
    marginBottom: 16,
  },
  bannerSlide: {
    width: SCREEN_WIDTH,
    height: BANNER_HEIGHT,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerTextOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 28,
    paddingTop: 40,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 13,
    color: colors.grayLight,
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.grayDark,
    marginHorizontal: 3,
  },
  dotActive: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.green,
  },

  // ── Section generic ──
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
  },
  sectionMore: {
    fontSize: 13,
    color: colors.green,
    fontWeight: '600',
  },
  sectionArrow: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
  horizontalList: {
    paddingLeft: 16,
    paddingRight: 8,
  },

  // ── Official Live ──
  liveTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  liveCard: {
    width: 220,
    marginRight: 12,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  liveThumbnail: {
    width: '100%',
    height: 124,
  },
  liveScheduleBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#00AA33',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  liveScheduleBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.white,
  },
  liveInfo: {
    padding: 10,
  },
  liveMoreBtn: {
    padding: 2,
  },
  liveCompRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  liveLeague: {
    fontSize: 11,
    color: colors.gray,
    flex: 1,
  },
  liveTeams: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.white,
    flex: 1,
    marginBottom: 4,
  },
  liveTagsText: {
    fontSize: 10,
    color: colors.gray,
  },

  // ── Popular Team/Club ──
  teamItem: {
    width: 80,
    alignItems: 'center',
    marginRight: 16,
  },
  teamLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  teamLogoText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.white,
  },
  teamName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
    textAlign: 'center',
    marginBottom: 2,
  },
  teamSub: {
    fontSize: 9,
    color: colors.gray,
    textAlign: 'center',
  },

  // ── Competition ──
  competitionCard: {
    width: 280,
    height: 140,
    marginRight: 12,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  competitionImage: {
    width: '100%',
    height: '100%',
  },
  competitionOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  competitionStatusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.green,
    borderRadius: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginBottom: 4,
  },
  competitionStatusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#000',
  },
  competitionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 2,
  },
  competitionDate: {
    fontSize: 11,
    color: colors.grayLight,
  },

  // ── Official Content Card ──
  officialCard: {
    width: 200,
    marginRight: 12,
  },
  officialThumbnailWrap: {
    width: '100%',
    height: 112,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
    backgroundColor: colors.surface,
  },
  officialThumbnail: {
    width: '100%',
    height: '100%',
  },
  contentBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    borderRadius: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  contentBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.white,
  },
  officialTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 3,
  },
  officialDesc: {
    fontSize: 11,
    color: colors.gray,
    marginBottom: 2,
  },
  officialViews: {
    fontSize: 10,
    color: colors.gray,
  },

  // ── Regular Content Card ──
  regularCard: {
    width: 280,
    flexDirection: 'row',
    marginRight: 12,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  regularThumbnail: {
    width: 120,
    height: 80,
  },
  regularInfo: {
    flex: 1,
    padding: 8,
    justifyContent: 'center',
  },
  regularTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 3,
  },
  regularSubtitle: {
    fontSize: 11,
    color: colors.gray,
    marginBottom: 4,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: colors.grayDark,
    borderRadius: 3,
    paddingHorizontal: 5,
    paddingVertical: 1,
    marginRight: 4,
    marginBottom: 2,
  },
  tagText: {
    fontSize: 9,
    color: colors.grayLight,
  },

  // ── Clip Content Card ──
  clipCard: {
    width: 130,
    marginRight: 12,
  },
  clipThumbnailWrap: {
    width: '100%',
    height: Math.round(130 * (16 / 9)),
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 6,
    backgroundColor: colors.surface,
  },
  clipThumbnail: {
    width: '100%',
    height: '100%',
  },
  clipDuration: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 3,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  clipDurationText: {
    fontSize: 10,
    color: colors.white,
    fontWeight: '600',
  },
  clipTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 2,
  },
  clipViews: {
    fontSize: 10,
    color: colors.gray,
  },
});
