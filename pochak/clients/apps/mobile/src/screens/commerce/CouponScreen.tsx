import React, {useState, useEffect, useCallback} from 'react';
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Ionicons} from '@expo/vector-icons';
import {useNavigation} from '@react-navigation/native';
import {colors} from '../../theme';
import {
  getMyCoupons,
  registerCouponCode,
  type Coupon,
  type CouponStatus,
} from '../../services/couponApi';

const GREEN = colors.green;
const BG = colors.bg;
const SURFACE = colors.surface;
const WHITE = colors.white;
const GRAY = colors.gray;
const GRAY_LIGHT = colors.grayLight;
const GRAY_DARK = colors.grayDark;

type TabKey = 'AVAILABLE' | 'USED' | 'EXPIRED';

const TABS: {key: TabKey; label: string}[] = [
  {key: 'AVAILABLE', label: '사용가능'},
  {key: 'USED', label: '사용완료'},
  {key: 'EXPIRED', label: '기간만료'},
];

function getAccentColor(status: CouponStatus): string {
  if (status === 'AVAILABLE') return GREEN;
  return GRAY;
}

// ── Coupon Card ────────────────────────────────────────────────────

function CouponCard({coupon}: {coupon: Coupon}) {
  const accentColor = getAccentColor(coupon.status);
  const isAvailable = coupon.status === 'AVAILABLE';

  return (
    <View style={styles.cardContainer}>
      {/* Left accent bar */}
      <View style={[styles.accentBar, {backgroundColor: accentColor}]} />

      <View style={styles.cardContent}>
        {/* Top row */}
        <View style={styles.cardTopRow}>
          <View style={styles.cardInfo}>
            <Text
              style={[
                styles.cardTitle,
                !isAvailable && styles.cardTitleInactive,
              ]}>
              {coupon.title}
            </Text>
            <Text
              style={[
                styles.cardDiscount,
                {color: isAvailable ? GREEN : GRAY},
              ]}>
              {coupon.discountLabel}
            </Text>
            {coupon.minPurchaseAmount > 0 && (
              <Text style={styles.cardCondition}>
                {coupon.minPurchaseAmount.toLocaleString()}뽈 이상 구매 시
              </Text>
            )}
            <Text style={styles.cardExpiry}>
              {coupon.status === 'USED' && coupon.usedAt
                ? `사용일: ${coupon.usedAt}`
                : `~${coupon.expiryDate}`}
            </Text>
          </View>

          {/* Right action */}
          <View style={styles.cardAction}>
            {isAvailable ? (
              <TouchableOpacity
                style={styles.useButton}
                activeOpacity={0.7}
                onPress={() => Alert.alert('쿠폰', '쿠폰이 적용되었습니다.')}>
                <Text style={styles.useButtonText}>사용하기</Text>
              </TouchableOpacity>
            ) : (
              <View
                style={[
                  styles.statusBadge,
                  {
                    borderColor: GRAY,
                  },
                ]}>
                <Text style={styles.statusBadgeText}>
                  {coupon.status === 'USED' ? '사용완료' : '기간만료'}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Description */}
        <Text style={styles.cardDescription}>{coupon.description}</Text>
      </View>
    </View>
  );
}

// ── Empty State ────────────────────────────────────────────────────

function EmptyState({tab}: {tab: TabKey}) {
  const messages: Record<TabKey, string> = {
    AVAILABLE: '사용 가능한 쿠폰이 없습니다.',
    USED: '사용 완료된 쿠폰이 없습니다.',
    EXPIRED: '기간 만료된 쿠폰이 없습니다.',
  };

  return (
    <View style={styles.emptyContainer}>
      <Ionicons name="ticket-outline" size={48} color={GRAY_DARK} />
      <Text style={styles.emptyText}>{messages[tab]}</Text>
    </View>
  );
}

// ── Main Screen ────────────────────────────────────────────────────

export default function CouponScreen() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<TabKey>('AVAILABLE');
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [registering, setRegistering] = useState(false);

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMyCoupons();
      setCoupons(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const filteredCoupons = coupons.filter(c => c.status === activeTab);

  const handleRegister = async () => {
    if (!couponCode.trim()) return;
    setRegistering(true);
    try {
      const result = await registerCouponCode(couponCode);
      if (result.success) {
        Alert.alert('등록 완료', '쿠폰이 등록되었습니다.');
        setCouponCode('');
        fetchCoupons();
      } else {
        Alert.alert('등록 실패', result.error || '쿠폰 등록에 실패했습니다.');
      }
    } finally {
      setRegistering(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={WHITE} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>쿠폰/프로모션</Text>
        <View style={{width: 24}} />
      </View>

      {/* Coupon Code Input */}
      <View style={styles.codeInputContainer}>
        <View style={styles.codeInputRow}>
          <TextInput
            style={styles.codeInput}
            placeholder="쿠폰 코드 입력"
            placeholderTextColor={GRAY}
            value={couponCode}
            onChangeText={setCouponCode}
            autoCapitalize="characters"
            returnKeyType="done"
            onSubmitEditing={handleRegister}
          />
          <TouchableOpacity
            style={[
              styles.registerButton,
              !couponCode.trim() && styles.registerButtonDisabled,
            ]}
            onPress={handleRegister}
            disabled={!couponCode.trim() || registering}
            activeOpacity={0.7}>
            {registering ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <Text style={styles.registerButtonText}>등록</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
            activeOpacity={0.7}>
            <Text
              style={[
                styles.tabText,
                activeTab === tab.key && styles.tabTextActive,
              ]}>
              {tab.label}
            </Text>
            {activeTab === tab.key && (
              <Text style={styles.tabCount}>
                {coupons.filter(c => c.status === tab.key).length}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Coupon List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={GREEN} />
        </View>
      ) : (
        <FlatList
          data={filteredCoupons}
          keyExtractor={item => item.id}
          renderItem={({item}) => <CouponCard coupon={item} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={<EmptyState tab={activeTab} />}
        />
      )}
    </SafeAreaView>
  );
}

// ── Styles ─────────────────────────────────────────────────────────

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

  // Code Input
  codeInputContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  codeInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  codeInput: {
    flex: 1,
    height: 44,
    backgroundColor: SURFACE,
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 15,
    color: WHITE,
    borderWidth: 1,
    borderColor: GRAY_DARK,
  },
  registerButton: {
    height: 44,
    paddingHorizontal: 20,
    backgroundColor: GREEN,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerButtonDisabled: {
    opacity: 0.5,
  },
  registerButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
  },

  // Tabs
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: GRAY_DARK,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    gap: 4,
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
  tabCount: {
    fontSize: 13,
    fontWeight: '700',
    color: GREEN,
  },

  // List
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  separator: {
    height: 10,
  },

  // Coupon Card
  cardContainer: {
    flexDirection: 'row',
    backgroundColor: SURFACE,
    borderRadius: 12,
    overflow: 'hidden',
  },
  accentBar: {
    width: 5,
  },
  cardContent: {
    flex: 1,
    padding: 14,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardInfo: {
    flex: 1,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: WHITE,
    marginBottom: 4,
  },
  cardTitleInactive: {
    color: GRAY,
  },
  cardDiscount: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  cardCondition: {
    fontSize: 12,
    color: GRAY_LIGHT,
    marginBottom: 2,
  },
  cardExpiry: {
    fontSize: 12,
    color: GRAY,
  },
  cardDescription: {
    fontSize: 13,
    color: GRAY,
    marginTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: GRAY_DARK,
    paddingTop: 8,
  },
  cardAction: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  useButton: {
    backgroundColor: GREEN,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  useButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000',
  },
  statusBadge: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: GRAY,
  },

  // Empty
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    color: GRAY,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
