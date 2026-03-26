import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {Ionicons, MaterialIcons, MaterialCommunityIcons} from '@expo/vector-icons';
import {SafeAreaView} from 'react-native-safe-area-context';
import {colors} from '../../theme';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../navigation/types';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

const BG = colors.bg;
const SURFACE = colors.surface;
const GREEN = colors.green;
const WHITE = colors.white;
const GRAY = colors.gray;
const GRAY_LIGHT = colors.grayLight;
const GRAY_DARK = colors.grayDark;

// ── Menu data matching PDF p28 ──

interface MenuItemDef {
  label: string;
  iconFamily: 'Ionicons' | 'MaterialIcons' | 'MaterialCommunityIcons';
  iconName: string;
  route?: keyof RootStackParamList;
  params?: object;
}

interface MenuSection {
  section: string;
  items: MenuItemDef[];
}

const MENU_SECTIONS: MenuSection[] = [
  {
    section: '포착 TV',
    items: [
      {label: '구독/이용권 구매', iconFamily: 'MaterialIcons', iconName: 'subscriptions', route: 'ProductList'},
      {label: '시청내역', iconFamily: 'MaterialIcons', iconName: 'history', route: 'WatchHistory'},
      {label: '내 클립', iconFamily: 'MaterialIcons', iconName: 'movie', route: 'MyClips'},
      {label: '시청예약', iconFamily: 'MaterialIcons', iconName: 'event', route: 'WatchReservation'},
      {label: '즐겨찾기', iconFamily: 'MaterialIcons', iconName: 'bookmark-border', route: 'Favorites'},
    ],
  },
  {
    section: '포착 Club',
    items: [
      {label: '가입한 클럽', iconFamily: 'MaterialCommunityIcons', iconName: 'account-group', route: 'ClubHome'},
      {label: '관심클럽', iconFamily: 'MaterialIcons', iconName: 'favorite-border', route: 'ClubSearch'},
      {label: '커뮤니티', iconFamily: 'MaterialIcons', iconName: 'forum', route: 'Community'},
    ],
  },
  {
    section: '포착 City',
    items: [
      {label: '대회소식', iconFamily: 'MaterialIcons', iconName: 'emoji-events', route: 'CityHome'},
      {label: '시설예약', iconFamily: 'MaterialIcons', iconName: 'business', route: 'WatchReservation'},
      {label: '자주가는 시설', iconFamily: 'MaterialIcons', iconName: 'place', route: 'WatchReservation'},
    ],
  },
  {
    section: '서비스',
    items: [
      {label: '알림내역', iconFamily: 'Ionicons', iconName: 'notifications-outline', route: 'Notifications'},
      {label: '설정', iconFamily: 'Ionicons', iconName: 'settings-outline', route: 'Settings'},
      {label: '공지사항', iconFamily: 'MaterialIcons', iconName: 'campaign', route: 'Notices'},
      {label: '고객센터', iconFamily: 'MaterialIcons', iconName: 'headset-mic', route: 'Support'},
    ],
  },
];

function MenuIcon({item}: {item: MenuItemDef}) {
  const size = 20;
  const color = GRAY_LIGHT;
  if (item.iconFamily === 'Ionicons') {
    return <Ionicons name={item.iconName as any} size={size} color={color} />;
  }
  if (item.iconFamily === 'MaterialCommunityIcons') {
    return <MaterialCommunityIcons name={item.iconName as any} size={size} color={color} />;
  }
  return <MaterialIcons name={item.iconName as any} size={size} color={color} />;
}

export default function MyMenuHubScreen() {
  const nav = useNavigation<NavProp>();

  const handleMenuPress = (item: MenuItemDef) => {
    if (item.route) {
      nav.navigate(item.route as any, item.params as any);
    }
  };

  const handleLogout = () => {
    // TODO: implement logout
  };

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      {/* ── Header ── */}
      <View style={s.header}>
        <TouchableOpacity style={s.headerBtn} onPress={() => nav.goBack()}>
          <Ionicons name="arrow-back" size={24} color={WHITE} />
        </TouchableOpacity>
        <View style={s.headerRight}>
          <TouchableOpacity style={s.headerBtn} onPress={() => nav.navigate('Notifications')}>
            <Ionicons name="notifications-outline" size={22} color={WHITE} />
          </TouchableOpacity>
          <TouchableOpacity style={s.headerBtn} onPress={() => nav.navigate('Settings')}>
            <Ionicons name="settings-outline" size={22} color={WHITE} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
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
              <MaterialIcons name="chevron-right" size={20} color={GRAY_LIGHT} />
            </View>
            <Text style={s.profileEmail}>kimpochak@hogak.co.kr</Text>
          </View>
        </TouchableOpacity>

        {/* ── Subscription Info Cards ── */}
        <View style={s.subsSection}>
          {/* Subscription management card */}
          <TouchableOpacity style={s.subsCard} activeOpacity={0.8} onPress={() => nav.navigate('ProductList')}>
            <View style={s.subsCardHeader}>
              <Text style={s.subsCardLabel}>구독 관리</Text>
              <MaterialIcons name="chevron-right" size={18} color={GRAY_LIGHT} />
            </View>
            <Text style={s.subsPlanName}>대가족 무제한 시청권</Text>
            <Text style={s.subsNextPayment}>다음결제일: 2026.01.01</Text>
          </TouchableOpacity>

          {/* Points / Passes / Gifts row */}
          <View style={s.subsRow}>
            <TouchableOpacity style={s.subsRowItem} activeOpacity={0.8}>
              <View style={s.subsRowItemHeader}>
                <Text style={s.subsRowLabel}>볼/기프트볼 관리</Text>
                <MaterialIcons name="chevron-right" size={14} color={GRAY_LIGHT} />
              </View>
              <Text style={s.subsRowValue}>10,000P / 1,000P</Text>
            </TouchableOpacity>
            <View style={s.subsRowDivider} />
            <TouchableOpacity style={s.subsRowItem} activeOpacity={0.8}>
              <View style={s.subsRowItemHeader}>
                <Text style={s.subsRowLabel}>이용권 관리</Text>
                <MaterialIcons name="chevron-right" size={14} color={GRAY_LIGHT} />
              </View>
              <Text style={s.subsRowValue}>10개</Text>
            </TouchableOpacity>
            <View style={s.subsRowDivider} />
            <TouchableOpacity style={s.subsRowItem} activeOpacity={0.8} onPress={() => nav.navigate('Gift')}>
              <View style={s.subsRowItemHeader}>
                <Text style={s.subsRowLabel}>선물함</Text>
                <MaterialIcons name="chevron-right" size={14} color={GRAY_LIGHT} />
              </View>
              <Text style={s.subsRowValue}>10개</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Menu Sections ── */}
        {MENU_SECTIONS.map(section => (
          <View key={section.section} style={s.menuSection}>
            <Text style={s.menuSectionTitle}>{section.section}</Text>
            {section.items.map(item => (
              <TouchableOpacity
                key={item.label}
                style={s.menuItem}
                activeOpacity={0.7}
                onPress={() => handleMenuPress(item)}>
                <MenuIcon item={item} />
                <Text style={s.menuItemText}>{item.label}</Text>
                <MaterialIcons name="chevron-right" size={20} color={GRAY_DARK} />
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* ── Logout ── */}
        <TouchableOpacity style={s.logoutBtn} activeOpacity={0.7} onPress={handleLogout}>
          <Text style={s.logoutText}>로그아웃</Text>
        </TouchableOpacity>

        <View style={{height: 40}} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: {flex: 1, backgroundColor: BG},

  // ── Header ──
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 48,
  },
  headerBtn: {padding: 4},
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },

  scrollContent: {paddingBottom: 40},

  // ── Profile ──
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {color: WHITE, fontSize: 26, fontWeight: '900'},
  profileInfo: {marginLeft: 14, flex: 1},
  profileNameRow: {flexDirection: 'row', alignItems: 'center', gap: 4},
  profileName: {color: WHITE, fontSize: 18, fontWeight: '700'},
  profileEmail: {color: GRAY_LIGHT, fontSize: 13, marginTop: 3},

  // ── Subscription ──
  subsSection: {paddingHorizontal: 16, marginBottom: 8},
  subsCard: {
    backgroundColor: SURFACE,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  subsCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  subsCardLabel: {color: GRAY_LIGHT, fontSize: 13, fontWeight: '600', marginRight: 4},
  subsPlanName: {color: WHITE, fontSize: 15, fontWeight: '700', marginBottom: 4},
  subsNextPayment: {color: GRAY, fontSize: 12},

  subsRow: {
    flexDirection: 'row',
    backgroundColor: SURFACE,
    borderRadius: 12,
    paddingVertical: 14,
  },
  subsRowItem: {flex: 1, alignItems: 'center', paddingHorizontal: 8},
  subsRowItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 2,
  },
  subsRowLabel: {color: GRAY_LIGHT, fontSize: 11, fontWeight: '600'},
  subsRowValue: {color: WHITE, fontSize: 13, fontWeight: '700'},
  subsRowDivider: {width: 1, backgroundColor: GRAY_DARK, marginVertical: 4},

  // ── Menu Sections ──
  menuSection: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  menuSectionTitle: {
    color: GRAY, fontSize: 13, fontWeight: '700',
    marginBottom: 4,
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: GRAY_DARK,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: GRAY_DARK,
  },
  menuItemText: {
    flex: 1,
    color: WHITE,
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 14,
  },

  // ── Logout ──
  logoutBtn: {
    marginTop: 32,
    marginHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: GRAY_DARK,
    alignItems: 'center',
  },
  logoutText: {color: GRAY_LIGHT, fontSize: 15, fontWeight: '600'},
});
