import React, {useCallback, useState} from 'react';
import {
  Alert,
  FlatList,
  Image,
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
  Club,
  mockNearbyClubs,
  mockNewClubs,
  mockPopularClubs,
} from '../../services/clubApi';

// ---- CLOSED Organization type ---------------------------------------------

interface ClosedOrganization extends Club {
  accessType: 'CLOSED';
}

const MOCK_CLOSED_ORGS: ClosedOrganization[] = [
  {
    id: 'closed1',
    logoUrl: 'https://via.placeholder.com/80x80/1E1E1E/00C853?text=PRO',
    name: '프로축구동호회',
    sport: '축구',
    memberCount: 48,
    description: '경력자 중심의 프로급 축구 동호회입니다.',
    isFavorite: false,
    region: '서울 강남구',
    accessType: 'CLOSED',
  },
  {
    id: 'closed2',
    logoUrl: 'https://via.placeholder.com/80x80/1E1E1E/00C853?text=ELITE',
    name: '엘리트농구클럽',
    sport: '농구',
    memberCount: 24,
    description: '대학 선수 출신 농구 모임. 심사 후 가입 가능.',
    isFavorite: true,
    region: '서울 송파구',
    accessType: 'CLOSED',
  },
  {
    id: 'closed3',
    logoUrl: 'https://via.placeholder.com/80x80/1E1E1E/00C853?text=VIP',
    name: 'VIP테니스',
    sport: '테니스',
    memberCount: 16,
    description: '프리미엄 테니스 레슨 & 모임',
    isFavorite: false,
    region: '서울 서초구',
    accessType: 'CLOSED',
  },
  {
    id: 'closed4',
    logoUrl: 'https://via.placeholder.com/80x80/1E1E1E/00C853?text=PRV',
    name: '프라이빗 러닝',
    sport: '런닝',
    memberCount: 30,
    description: '소수정예 러닝 크루. 매니저 승인 필요.',
    isFavorite: false,
    region: '서울 용산구',
    accessType: 'CLOSED',
  },
];

type JoinStatus = 'none' | 'pending' | 'joined';

// ─── Club Card (original horizontal card) ─────────────────

function ClubCard({item}: {item: Club}) {
  return (
    <TouchableOpacity style={styles.clubCard} activeOpacity={0.8}>
      <Image
        source={{uri: item.logoUrl}}
        style={styles.clubLogo}
        resizeMode="cover"
      />
      <View style={styles.clubInfo}>
        <Text style={styles.clubName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.clubSport}>{item.sport}</Text>
        <View style={styles.clubMeta}>
          <MaterialIcons name="people" size={12} color={colors.gray} />
          <Text style={styles.clubMemberCount}>{item.memberCount}명</Text>
        </View>
        <Text style={styles.clubDesc} numberOfLines={2}>
          {item.description}
        </Text>
      </View>
      {item.isFavorite && (
        <MaterialIcons
          name="star"
          size={18}
          color="#FFD600"
          style={styles.clubFavIcon}
        />
      )}
    </TouchableOpacity>
  );
}

// ─── Club Section (horizontal) ────────────────────────────

function ClubSection({
  title,
  items,
}: {
  title: string;
  items: Club[];
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
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
        renderItem={({item}) => <ClubCard item={item} />}
      />
    </View>
  );
}

// ─── Closed Org Card ──────────────────────────────────────

function ClosedOrgCard({
  org,
  status,
  onApply,
}: {
  org: ClosedOrganization;
  status: JoinStatus;
  onApply: (id: string) => void;
}) {
  return (
    <View style={styles.closedCard}>
      <Image
        source={{uri: org.logoUrl}}
        style={styles.closedLogo}
        resizeMode="cover"
      />
      <View style={styles.closedInfo}>
        <Text style={styles.closedName} numberOfLines={1}>
          {org.name}
        </Text>
        <Text style={styles.closedSport}>{org.sport}</Text>
        <View style={styles.closedMeta}>
          <MaterialIcons name="people" size={12} color={colors.gray} />
          <Text style={styles.closedMemberCount}>{org.memberCount}명</Text>
          <Text style={styles.closedRegion}>{org.region}</Text>
        </View>
        <Text style={styles.closedDesc} numberOfLines={2}>
          {org.description}
        </Text>
      </View>

      {status === 'joined' ? (
        <View style={styles.joinedBadge}>
          <MaterialIcons name="check-circle" size={14} color={colors.green} />
          <Text style={styles.joinedBadgeText}>가입됨</Text>
        </View>
      ) : status === 'pending' ? (
        <View style={styles.pendingBadge}>
          <Text style={styles.pendingBadgeText}>대기중</Text>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.applyButton}
          onPress={() => onApply(org.id)}
          activeOpacity={0.8}>
          <Text style={styles.applyButtonText}>가입 신청</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Club Home Screen ─────────────────────────────────────

export default function ClubHomeScreen() {
  const navigation = useNavigation();
  const [closedStatuses, setClosedStatuses] = useState<
    Record<string, JoinStatus>
  >({});

  const handleApply = useCallback((orgId: string) => {
    Alert.alert(
      '가입 신청',
      '가입 신청이 완료되었습니다. 매니저 승인을 기다려주세요.',
      [{text: '확인'}],
    );
    setClosedStatuses(prev => ({...prev, [orgId]: 'pending'}));
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>포착 클럽</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIcon} activeOpacity={0.7}>
            <Ionicons name="search-outline" size={22} color={colors.white} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon} activeOpacity={0.7}>
            <Ionicons
              name="notifications-outline"
              size={22}
              color={colors.white}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>

        {/* CLOSED Organizations */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>CLOSED 클럽</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.sectionMore}>더보기</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.closedSubtitle}>
            매니저 승인이 필요한 프리미엄 클럽
          </Text>
          {MOCK_CLOSED_ORGS.map(org => (
            <ClosedOrgCard
              key={org.id}
              org={org}
              status={closedStatuses[org.id] ?? 'none'}
              onApply={handleApply}
            />
          ))}
        </View>

        <ClubSection title="주변 클럽" items={mockNearbyClubs} />
        <ClubSection title="인기 클럽" items={mockPopularClubs} />
        <ClubSection title="신규 클럽" items={mockNewClubs} />
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
    paddingTop: 8,
  },
  bottomSpacer: {
    height: 32,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    height: 52,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.green,
    letterSpacing: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginLeft: 16,
    padding: 4,
  },

  // Section
  section: {
    marginBottom: 28,
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

  // CLOSED section
  closedSubtitle: {
    fontSize: 13,
    color: colors.grayLight,
    paddingHorizontal: 16,
    marginBottom: 14,
    marginTop: -4,
  },

  // Closed Org Card
  closedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
  },
  closedLogo: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.grayDark,
    marginRight: 12,
  },
  closedInfo: {
    flex: 1,
  },
  closedName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 2,
  },
  closedSport: {
    fontSize: 12,
    color: colors.green,
    fontWeight: '600',
    marginBottom: 4,
  },
  closedMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  closedMemberCount: {
    fontSize: 11,
    color: colors.gray,
    marginRight: 6,
  },
  closedRegion: {
    fontSize: 11,
    color: colors.gray,
  },
  closedDesc: {
    fontSize: 11,
    color: colors.grayLight,
    lineHeight: 16,
  },
  applyButton: {
    borderWidth: 1.5,
    borderColor: colors.green,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginLeft: 8,
  },
  applyButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.green,
  },
  pendingBadge: {
    backgroundColor: colors.grayDark,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginLeft: 8,
  },
  pendingBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.grayLight,
  },
  joinedBadge: {
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
  joinedBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.green,
  },

  // Club Card (horizontal)
  clubCard: {
    width: 200,
    marginRight: 12,
    borderRadius: 10,
    backgroundColor: colors.surface,
    padding: 14,
  },
  clubLogo: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.grayDark,
    marginBottom: 10,
  },
  clubInfo: {
    flex: 1,
  },
  clubName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 3,
  },
  clubSport: {
    fontSize: 12,
    color: colors.green,
    fontWeight: '600',
    marginBottom: 6,
  },
  clubMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  clubMemberCount: {
    fontSize: 11,
    color: colors.gray,
    marginLeft: 4,
  },
  clubDesc: {
    fontSize: 11,
    color: colors.grayLight,
    lineHeight: 16,
  },
  clubFavIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
});
