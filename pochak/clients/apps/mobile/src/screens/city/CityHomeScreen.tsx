import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
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
  CityBanner,
  CityCompetitionNews,
  CityFacility,
  CitySportsCenter,
  mockCityBanners,
  mockCompetitionNews,
  mockFacilities,
  mockSportsCenters,
  regions,
} from '../../services/cityApi';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const BANNER_HEIGHT = 180;

// ---- OPEN Organization type -----------------------------------------------

interface OpenOrganization {
  id: string;
  logoUrl: string;
  name: string;
  sport: string;
  memberCount: number;
  description: string;
  region: string;
  accessType: 'OPEN';
}

const MOCK_OPEN_ORGS: OpenOrganization[] = [
  {
    id: 'open1',
    logoUrl: 'https://via.placeholder.com/80x80/1E1E1E/00C853?text=FC',
    name: '시민축구단',
    sport: '축구',
    memberCount: 245,
    description: '누구나 참여 가능한 시민 축구단입니다.',
    region: '서울 송파구',
    accessType: 'OPEN',
  },
  {
    id: 'open2',
    logoUrl: 'https://via.placeholder.com/80x80/1E1E1E/00C853?text=BB',
    name: '동네농구회',
    sport: '농구',
    memberCount: 128,
    description: '동네에서 함께하는 농구 모임. 실력 무관!',
    region: '서울 강남구',
    accessType: 'OPEN',
  },
  {
    id: 'open3',
    logoUrl: 'https://via.placeholder.com/80x80/1E1E1E/00C853?text=RN',
    name: '한강러닝크루',
    sport: '런닝',
    memberCount: 380,
    description: '매주 수요일, 토요일 한강에서 달려요.',
    region: '서울 용산구',
    accessType: 'OPEN',
  },
  {
    id: 'open4',
    logoUrl: 'https://via.placeholder.com/80x80/1E1E1E/00C853?text=BD',
    name: '배드민턴오픈',
    sport: '배드민턴',
    memberCount: 95,
    description: '초보부터 고수까지 모두 환영하는 배드민턴 모임',
    region: '서울 마포구',
    accessType: 'OPEN',
  },
  {
    id: 'open5',
    logoUrl: 'https://via.placeholder.com/80x80/1E1E1E/00C853?text=YG',
    name: '아침요가모임',
    sport: '요가',
    memberCount: 67,
    description: '매일 아침 7시 요가로 하루를 시작해요',
    region: '서울 서초구',
    accessType: 'OPEN',
  },
];

// Track joined orgs locally
const joinedOrgIds = new Set<string>();

// ─── Region Dropdown ──────────────────────────────────────

function RegionDropdown({
  selected,
  onSelect,
  open,
  onToggle,
}: {
  selected: string;
  onSelect: (r: string) => void;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <View style={styles.dropdownWrapper}>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={onToggle}
        activeOpacity={0.7}>
        <MaterialIcons name="location-on" size={18} color={colors.green} />
        <Text style={styles.dropdownText}>{selected}</Text>
        <Ionicons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={colors.grayLight}
        />
      </TouchableOpacity>
      {open && (
        <View style={styles.dropdownList}>
          <ScrollView
            nestedScrollEnabled
            showsVerticalScrollIndicator={false}
            style={styles.dropdownScroll}>
            {regions.map(r => (
              <TouchableOpacity
                key={r}
                style={[
                  styles.dropdownItem,
                  r === selected && styles.dropdownItemActive,
                ]}
                onPress={() => {
                  onSelect(r);
                  onToggle();
                }}
                activeOpacity={0.7}>
                <Text
                  style={[
                    styles.dropdownItemText,
                    r === selected && styles.dropdownItemTextActive,
                  ]}>
                  {r}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

// ─── Banner Carousel ──────────────────────────────────────

function BannerCarousel({banners}: {banners: CityBanner[]}) {
  const scrollRef = useRef<FlatList<CityBanner>>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  return (
    <View style={styles.bannerContainer}>
      <FlatList
        ref={scrollRef}
        data={banners}
        renderItem={({item}) => (
          <View style={styles.bannerSlide}>
            <Image
              source={{uri: item.imageUrl}}
              style={styles.bannerImage}
              resizeMode="cover"
            />
            <View style={styles.bannerOverlay}>
              <Text style={styles.bannerTitle}>{item.title}</Text>
              {item.subtitle && (
                <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
              )}
            </View>
          </View>
        )}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
        onScrollBeginDrag={stopAutoScroll}
        onScrollEndDrag={startAutoScroll}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
        bounces={false}
      />
      <View style={styles.dotsRow}>
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

// ─── OPEN Organization Card ───────────────────────────────

function OpenOrgCard({
  org,
  isJoined,
  onJoin,
  onPress,
}: {
  org: OpenOrganization;
  isJoined: boolean;
  onJoin: (id: string) => void;
  onPress: (id: string) => void;
}) {
  return (
    <TouchableOpacity
      style={styles.orgCard}
      activeOpacity={0.8}
      onPress={() => onPress(org.id)}>
      <Image
        source={{uri: org.logoUrl}}
        style={styles.orgLogo}
        resizeMode="cover"
      />
      <View style={styles.orgInfo}>
        <Text style={styles.orgName} numberOfLines={1}>
          {org.name}
        </Text>
        <Text style={styles.orgSport}>{org.sport}</Text>
        <View style={styles.orgMeta}>
          <MaterialIcons name="people" size={12} color={colors.gray} />
          <Text style={styles.orgMemberCount}>{org.memberCount}명</Text>
          <Text style={styles.orgRegion}>{org.region}</Text>
        </View>
        <Text style={styles.orgDesc} numberOfLines={2}>
          {org.description}
        </Text>
      </View>
      {isJoined ? (
        <View style={styles.orgJoinedBadge}>
          <MaterialIcons name="check-circle" size={14} color={colors.green} />
          <Text style={styles.orgJoinedText}>가입됨</Text>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.orgJoinButton}
          onPress={() => onJoin(org.id)}
          activeOpacity={0.8}>
          <Text style={styles.orgJoinButtonText}>가입하기</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

// ─── Competition News Section ─────────────────────────────

function CompetitionNewsSection({items}: {items: CityCompetitionNews[]}) {
  const statusColor = (status: string) => {
    switch (status) {
      case '진행중':
        return '#FF6D00';
      case '접수중':
        return colors.green;
      case '예정':
        return '#2196F3';
      case '종료':
        return colors.gray;
      default:
        return colors.gray;
    }
  };

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>대회 소식</Text>
        <TouchableOpacity activeOpacity={0.7}>
          <Text style={styles.sectionMore}>더보기</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={items}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalList}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <TouchableOpacity style={styles.newsCard} activeOpacity={0.8}>
            <Image
              source={{uri: item.imageUrl}}
              style={styles.newsImage}
              resizeMode="cover"
            />
            <View style={styles.newsInfo}>
              <View
                style={[
                  styles.statusBadge,
                  {backgroundColor: statusColor(item.status)},
                ]}>
                <Text style={styles.statusBadgeText}>{item.status}</Text>
              </View>
              <Text style={styles.newsTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={styles.newsDate}>{item.date}</Text>
              <Text style={styles.newsSport}>{item.sport}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

// ─── Facility Section ─────────────────────────────────────

function FacilitySection({items}: {items: CityFacility[]}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>시설</Text>
        <TouchableOpacity activeOpacity={0.7}>
          <Text style={styles.sectionMore}>더보기</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={items}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalList}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <TouchableOpacity style={styles.facilityCard} activeOpacity={0.8}>
            <Image
              source={{uri: item.imageUrl}}
              style={styles.facilityImage}
              resizeMode="cover"
            />
            {item.isVerified && (
              <View style={styles.verifiedBadge}>
                <MaterialIcons name="verified" size={12} color="#FFF" />
                <Text style={styles.verifiedBadgeText}>인증</Text>
              </View>
            )}
            <View style={styles.facilityInfo}>
              <View style={styles.facilityNameRow}>
                <Text style={styles.facilityName} numberOfLines={1}>
                  {item.name}
                </Text>
                {item.isVerified && (
                  <MaterialIcons name="verified" size={14} color={colors.green} style={{marginLeft: 4}} />
                )}
              </View>
              <Text style={styles.facilityAddress} numberOfLines={1}>
                {item.address}
              </Text>
              <View style={styles.facilityMeta}>
                <MaterialIcons
                  name="near-me"
                  size={12}
                  color={colors.green}
                />
                <Text style={styles.facilityDistance}>{item.distance}</Text>
                <Text style={styles.facilitySport}>{item.sportType}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

// ─── Sports Center Section ────────────────────────────────

function SportsCenterSection({items}: {items: CitySportsCenter[]}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>센터</Text>
        <TouchableOpacity activeOpacity={0.7}>
          <Text style={styles.sectionMore}>더보기</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={items}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalList}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <TouchableOpacity style={styles.centerCard} activeOpacity={0.8}>
            <Image
              source={{uri: item.imageUrl}}
              style={styles.centerImage}
              resizeMode="cover"
            />
            <View style={styles.centerInfo}>
              <Text style={styles.centerName} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.centerAddress} numberOfLines={1}>
                {item.address}
              </Text>
              <View style={styles.centerSportsRow}>
                {item.sports.map(s => (
                  <View key={s} style={styles.centerSportTag}>
                    <Text style={styles.centerSportText}>{s}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.ratingRow}>
                <MaterialIcons name="star" size={14} color="#FFD600" />
                <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

// ─── City Home Screen ─────────────────────────────────────

export default function CityHomeScreen() {
  const navigation = useNavigation();
  const [selectedRegion, setSelectedRegion] = useState('서울');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set(joinedOrgIds));

  const handleJoinOrg = useCallback((orgId: string) => {
    joinedOrgIds.add(orgId);
    setJoinedIds(new Set(joinedOrgIds));
    Alert.alert('가입 완료', '조직에 가입되었습니다.');
  }, []);

  const handleOrgPress = useCallback((_orgId: string) => {
    // Navigate to org detail page (to be implemented)
  }, []);

  const filteredFacilities = useMemo(
    () => mockFacilities.filter(f => f.region === selectedRegion),
    [selectedRegion],
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>포착 시티</Text>
          <RegionDropdown
            selected={selectedRegion}
            onSelect={setSelectedRegion}
            open={dropdownOpen}
            onToggle={() => setDropdownOpen(prev => !prev)}
          />
        </View>
        <TouchableOpacity style={styles.notifIcon} activeOpacity={0.7}>
          <Ionicons
            name="notifications-outline"
            size={22}
            color={colors.white}
          />
          <View style={styles.notifBadge}>
            <Text style={styles.notifBadgeText}>2</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <BannerCarousel banners={mockCityBanners} />

        {/* OPEN Organizations */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>OPEN 조직</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.sectionMore}>더보기</Text>
            </TouchableOpacity>
          </View>
          {MOCK_OPEN_ORGS.map(org => (
            <OpenOrgCard
              key={org.id}
              org={org}
              isJoined={joinedIds.has(org.id)}
              onJoin={handleJoinOrg}
              onPress={handleOrgPress}
            />
          ))}
        </View>

        <CompetitionNewsSection items={mockCompetitionNews} />
        <FacilitySection items={filteredFacilities} />
        <SportsCenterSection items={mockSportsCenters} />
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  bottomSpacer: {
    height: 32,
  },

  // Top Bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 52,
    backgroundColor: colors.bg,
    zIndex: 200,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.green,
    letterSpacing: 1,
  },
  notifIcon: {
    padding: 4,
  },
  notifBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FF0000',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  notifBadgeText: {
    color: colors.white,
    fontSize: 9,
    fontWeight: '700',
  },

  // Dropdown
  dropdownWrapper: {
    zIndex: 300,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  dropdownText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.white,
    marginHorizontal: 6,
  },
  dropdownList: {
    position: 'absolute',
    top: 40,
    left: 0,
    width: 140,
    backgroundColor: colors.surface,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  dropdownScroll: {
    maxHeight: 220,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  dropdownItemActive: {
    backgroundColor: colors.grayDark,
  },
  dropdownItemText: {
    fontSize: 14,
    color: colors.grayLight,
  },
  dropdownItemTextActive: {
    color: colors.green,
    fontWeight: '600',
  },

  // Banner
  bannerContainer: {
    height: BANNER_HEIGHT,
    marginBottom: 20,
  },
  bannerSlide: {
    width: SCREEN_WIDTH,
    height: BANNER_HEIGHT,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 28,
    paddingTop: 32,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  bannerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 13,
    color: colors.grayLight,
  },
  dotsRow: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
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

  // Section
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  horizontalList: {
    paddingLeft: 16,
    paddingRight: 8,
  },

  // OPEN Organization Card
  orgCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
  },
  orgLogo: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.grayDark,
    marginRight: 12,
  },
  orgInfo: {
    flex: 1,
  },
  orgName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 2,
  },
  orgSport: {
    fontSize: 12,
    color: colors.green,
    fontWeight: '600',
    marginBottom: 4,
  },
  orgMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  orgMemberCount: {
    fontSize: 11,
    color: colors.gray,
    marginRight: 6,
  },
  orgRegion: {
    fontSize: 11,
    color: colors.gray,
  },
  orgDesc: {
    fontSize: 11,
    color: colors.grayLight,
    lineHeight: 16,
  },
  orgJoinButton: {
    backgroundColor: colors.green,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginLeft: 8,
  },
  orgJoinButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000',
  },
  orgJoinedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.green,
  },
  orgJoinedText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.green,
  },

  // Competition News
  newsCard: {
    width: 180,
    marginRight: 12,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  newsImage: {
    width: '100%',
    height: 100,
  },
  newsInfo: {
    padding: 10,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    borderRadius: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginBottom: 6,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.white,
  },
  newsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 4,
  },
  newsDate: {
    fontSize: 11,
    color: colors.grayLight,
    marginBottom: 2,
  },
  newsSport: {
    fontSize: 11,
    color: colors.green,
    fontWeight: '600',
  },

  // Facility
  facilityCard: {
    width: 180,
    marginRight: 12,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  facilityImage: {
    width: '100%',
    height: 100,
  },
  verifiedBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.green,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
    gap: 2,
  },
  verifiedBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFF',
  },
  facilityInfo: {
    padding: 10,
  },
  facilityNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  facilityName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.white,
    flex: 1,
  },
  facilityAddress: {
    fontSize: 11,
    color: colors.grayLight,
    marginBottom: 6,
  },
  facilityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  facilityDistance: {
    fontSize: 11,
    color: colors.green,
    fontWeight: '600',
    marginLeft: 3,
    marginRight: 8,
  },
  facilitySport: {
    fontSize: 11,
    color: colors.gray,
  },

  // Sports Center
  centerCard: {
    width: 220,
    marginRight: 12,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  centerImage: {
    width: '100%',
    height: 120,
  },
  centerInfo: {
    padding: 10,
  },
  centerName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 3,
  },
  centerAddress: {
    fontSize: 11,
    color: colors.grayLight,
    marginBottom: 8,
  },
  centerSportsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 6,
  },
  centerSportTag: {
    backgroundColor: colors.grayDark,
    borderRadius: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 4,
    marginBottom: 2,
  },
  centerSportText: {
    fontSize: 10,
    color: colors.grayLight,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: colors.white,
    fontWeight: '600',
    marginLeft: 3,
  },
});
