import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Ionicons, MaterialIcons} from '@expo/vector-icons';
import {useNavigation} from '@react-navigation/native';
import {colors} from '../../theme';
import {mockProducts, formatPrice, Product} from '../../services/commerceApi';

const GREEN = colors.green;
const BG = colors.bg;
const SURFACE = colors.surface;
const WHITE = colors.white;
const GRAY = colors.gray;
const GRAY_LIGHT = colors.grayLight;
const GRAY_DARK = colors.grayDark;

const SCREEN_WIDTH = Dimensions.get('window').width;
const HCARD_WIDTH = SCREEN_WIDTH * 0.42;

// ---------------------------------------------------------------------------
// Tab definitions per PDF: 전체 | 제휴 | 구독 | 종목 | 대회
// ---------------------------------------------------------------------------

const TABS = ['전체', '제휴', '구독', '종목', '대회'] as const;
type TabName = typeof TABS[number];

const SPORT_FILTERS = ['전체', '축구', '야구', '배구', '핸드볼', '농구'] as const;

// ---------------------------------------------------------------------------
// Extended mock data for product types matching the PDF
// ---------------------------------------------------------------------------

interface ExtendedProduct extends Product {
  /** Thumbnail type hint for the mock card */
  thumbType?: 'pochak' | 'sport' | 'competition';
  /** Original price (before discount) */
  originalPrice?: number;
  /** Discount percentage (e.g. 17) */
  discountPercent?: number;
  /** Monthly price label */
  monthlyPriceLabel?: string;
  /** Sport tag for 종목/대회 filtering */
  sport?: string;
  /** Whether this belongs to 제휴 tab */
  isPartner?: boolean;
}

const extendedProducts: ExtendedProduct[] = [
  // 구독
  {
    id: 'sub-1', name: '대가족 무제한 시청권', description: '4인 동시 시청! 지금 구독하기',
    price: 29900, priceUnit: '원', category: '구독', duration: '30일',
    isSubscription: true, subscriptionLabel: '대가족 무제한 시청권',
    subscriptionSubLabel: '4인 동시 시청! 지금 구독하기',
    thumbType: 'pochak', monthlyPriceLabel: '월 29,900원',
    originalPrice: 358800, discountPercent: 17,
  },
  {
    id: 'sub-2', name: '개인 무제한 시청권', description: '1인 무제한 시청! 나만의 스포츠 생활',
    price: 9900, priceUnit: '원', category: '구독', duration: '30일',
    isSubscription: true, thumbType: 'pochak', monthlyPriceLabel: '월 9,900원',
    originalPrice: 118800, discountPercent: 10,
  },
  {
    id: 'sub-3', name: '커플 시청권', description: '2인 동시 시청 가능한 알뜰 구독',
    price: 15900, priceUnit: '원', category: '구독', duration: '30일',
    isSubscription: true, thumbType: 'pochak', monthlyPriceLabel: '월 15,900원',
    originalPrice: 190800, discountPercent: 15,
  },
  // 종목별 이용권
  {
    id: 'sport-1', name: '축구 종목 시청권', description: '전체 축구 경기 무제한 시청',
    price: 10010, priceUnit: '원', category: '대회권', duration: '30일',
    thumbType: 'sport', sport: '축구', monthlyPriceLabel: '월 10,010원',
    originalPrice: 101010, discountPercent: 17,
  },
  {
    id: 'sport-2', name: '야구 종목 시청권', description: '전체 야구 경기 무제한 시청',
    price: 10010, priceUnit: '원', category: '대회권', duration: '30일',
    thumbType: 'sport', sport: '야구', monthlyPriceLabel: '월 10,010원',
    originalPrice: 101010, discountPercent: 17,
  },
  {
    id: 'sport-3', name: '배구 종목 시청권', description: '전체 배구 경기 무제한 시청',
    price: 8800, priceUnit: '원', category: '대회권', duration: '30일',
    thumbType: 'sport', sport: '배구', monthlyPriceLabel: '월 8,800원',
  },
  {
    id: 'sport-4', name: '농구 종목 시청권', description: '전체 농구 경기 무제한 시청',
    price: 8800, priceUnit: '원', category: '대회권', duration: '30일',
    thumbType: 'sport', sport: '농구', monthlyPriceLabel: '월 8,800원',
  },
  // 대회 이용권
  {
    id: 'comp-1', name: "'6회 MLB컵 리틀야구 U10' 시청권", description: '리틀야구 U10 전 경기 시청',
    price: 10010, priceUnit: '원', category: '대회권', duration: '대회기간',
    thumbType: 'competition', sport: '야구', monthlyPriceLabel: '월 10,010원',
    originalPrice: 101010, discountPercent: 17,
  },
  {
    id: 'comp-2', name: '2026 전국 유소년 축구대회 시청권', description: '유소년 축구 전 경기 시청 가능',
    price: 15000, priceUnit: '원', category: '대회권', duration: '대회기간',
    thumbType: 'competition', sport: '축구', monthlyPriceLabel: '월 15,000원',
  },
  {
    id: 'comp-3', name: '제3회 포착컵 농구대회 시청권', description: '포착컵 농구 전 경기 시청',
    price: 12000, priceUnit: '원', category: '대회권', duration: '대회기간',
    thumbType: 'competition', sport: '농구',
  },
  // 제휴
  {
    id: 'partner-1', name: '스포츠 시설 제휴 이용권', description: '전국 제휴 시설 할인 이용',
    price: 20000, priceUnit: '원', category: '대회권',
    isPartner: true, thumbType: 'pochak',
  },
  {
    id: 'partner-2', name: '포착 X 스포츠 브랜드 할인', description: '제휴 브랜드 특별 할인',
    price: 15000, priceUnit: '원', category: '대회권',
    isPartner: true, thumbType: 'pochak',
  },
];

// ---------------------------------------------------------------------------
// Thumbnail placeholder component
// ---------------------------------------------------------------------------

function ProductThumb({type}: {type?: 'pochak' | 'sport' | 'competition'}) {
  if (type === 'pochak') {
    return (
      <View style={[styles.thumb, {backgroundColor: '#0A3D1A'}]}>
        <Text style={styles.thumbLogo}>P</Text>
      </View>
    );
  }
  if (type === 'sport') {
    return (
      <View style={[styles.thumb, {backgroundColor: SURFACE}]}>
        <Ionicons name="basketball-outline" size={24} color={GREEN} />
      </View>
    );
  }
  // competition
  return (
    <View style={[styles.thumb, {backgroundColor: SURFACE}]}>
      <MaterialIcons name="emoji-events" size={24} color={GREEN} />
    </View>
  );
}

// ---------------------------------------------------------------------------
// ProductCard (redesigned per PDF)
// ---------------------------------------------------------------------------

function ProductCard({product}: {product: ExtendedProduct}) {
  return (
    <View style={styles.productCard}>
      <ProductThumb type={product.thumbType} />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.productDescription} numberOfLines={1}>
          {product.description}
        </Text>
        <View style={styles.productPriceRow}>
          <Text style={styles.productPrice}>
            {product.monthlyPriceLabel || formatPrice(product.price, product.priceUnit)}
          </Text>
        </View>
        {product.originalPrice && (
          <View style={styles.originalPriceRow}>
            <Text style={styles.originalPrice}>
              연 {product.originalPrice.toLocaleString()}원
            </Text>
            {product.discountPercent && (
              <Text style={styles.discountBadge}>-{product.discountPercent}%</Text>
            )}
          </View>
        )}
      </View>
      <TouchableOpacity style={styles.buyButton} activeOpacity={0.7}>
        <Text style={styles.buyButtonText}>구매/선물</Text>
      </TouchableOpacity>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Horizontal scroll section for 전체 tab
// ---------------------------------------------------------------------------

function HorizontalProductSection({
  title,
  products,
}: {
  title: string;
  products: ExtendedProduct[];
}) {
  return (
    <View style={styles.hSection}>
      <TouchableOpacity style={styles.hSectionHeader} activeOpacity={0.7}>
        <Text style={styles.hSectionTitle}>{title}</Text>
        <MaterialIcons name="chevron-right" size={22} color={GRAY_LIGHT} />
      </TouchableOpacity>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.hScrollContent}>
        {products.map(p => (
          <View key={p.id} style={styles.hCard}>
            <ProductThumb type={p.thumbType} />
            <Text style={styles.hCardTitle} numberOfLines={2}>{p.name}</Text>
            <Text style={styles.hCardPrice}>
              {p.monthlyPriceLabel || formatPrice(p.price, p.priceUnit)}
            </Text>
            {p.discountPercent && (
              <Text style={styles.hCardDiscount}>-{p.discountPercent}%</Text>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Full-width subscription card for 구독 tab
// ---------------------------------------------------------------------------

function SubscriptionFullCard({product}: {product: ExtendedProduct}) {
  return (
    <View style={styles.subFullCard}>
      <View style={styles.subFullLeft}>
        <ProductThumb type="pochak" />
      </View>
      <View style={styles.subFullInfo}>
        <Text style={styles.subFullName}>{product.name}</Text>
        <Text style={styles.subFullDesc} numberOfLines={1}>{product.description}</Text>
        <View style={styles.subFullPriceRow}>
          <Text style={styles.subFullPrice}>
            {product.monthlyPriceLabel || formatPrice(product.price, product.priceUnit)}
          </Text>
        </View>
        {product.originalPrice && (
          <View style={styles.originalPriceRow}>
            <Text style={styles.originalPrice}>
              연 {product.originalPrice.toLocaleString()}원
            </Text>
            {product.discountPercent && (
              <Text style={styles.discountBadge}>-{product.discountPercent}%</Text>
            )}
          </View>
        )}
      </View>
      <TouchableOpacity style={styles.buyButton} activeOpacity={0.7}>
        <Text style={styles.buyButtonText}>구매/선물</Text>
      </TouchableOpacity>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Tab content renderers
// ---------------------------------------------------------------------------

function AllTabContent() {
  const subscriptions = extendedProducts.filter(p => p.isSubscription);
  const sportTickets = extendedProducts.filter(p => p.thumbType === 'sport');
  const compTickets = extendedProducts.filter(p => p.thumbType === 'competition');

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.tabContent}>
      <HorizontalProductSection title="구독상품" products={subscriptions} />
      <HorizontalProductSection title="종목별 이용권" products={sportTickets} />
      <HorizontalProductSection title="대회 이용권" products={compTickets} />
    </ScrollView>
  );
}

function PartnerTabContent() {
  const partners = extendedProducts.filter(p => p.isPartner);
  return (
    <FlatList
      data={partners}
      keyExtractor={item => item.id}
      renderItem={({item}) => <ProductCard product={item} />}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
    />
  );
}

function SubscriptionTabContent() {
  const subs = extendedProducts.filter(p => p.isSubscription);
  return (
    <FlatList
      data={subs}
      keyExtractor={item => item.id}
      renderItem={({item}) => <SubscriptionFullCard product={item} />}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
    />
  );
}

function SportTabContent() {
  const [activeSport, setActiveSport] = useState('전체');
  const sportProducts = extendedProducts.filter(
    p => p.thumbType === 'sport' && (activeSport === '전체' || p.sport === activeSport),
  );

  return (
    <View style={{flex: 1}}>
      {/* Sport filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.sportFilterScroll}
        contentContainerStyle={styles.sportFilterContent}>
        {SPORT_FILTERS.map(s => (
          <TouchableOpacity
            key={s}
            style={[styles.sportChip, activeSport === s && styles.sportChipActive]}
            onPress={() => setActiveSport(s)}>
            <Text style={[styles.sportChipText, activeSport === s && styles.sportChipTextActive]}>
              {s}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <FlatList
        data={sportProducts}
        keyExtractor={item => item.id}
        renderItem={({item}) => <ProductCard product={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

function CompetitionTabContent() {
  const [activeSport, setActiveSport] = useState('전체');
  const compProducts = extendedProducts.filter(
    p => p.thumbType === 'competition' && (activeSport === '전체' || p.sport === activeSport),
  );

  return (
    <View style={{flex: 1}}>
      {/* Sport filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.sportFilterScroll}
        contentContainerStyle={styles.sportFilterContent}>
        {SPORT_FILTERS.map(s => (
          <TouchableOpacity
            key={s}
            style={[styles.sportChip, activeSport === s && styles.sportChipActive]}
            onPress={() => setActiveSport(s)}>
            <Text style={[styles.sportChipText, activeSport === s && styles.sportChipTextActive]}>
              {s}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <FlatList
        data={compProducts}
        keyExtractor={item => item.id}
        renderItem={({item}) => <ProductCard product={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

export default function ProductListScreen() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<TabName>('전체');

  const renderTabContent = () => {
    switch (activeTab) {
      case '전체': return <AllTabContent />;
      case '제휴': return <PartnerTabContent />;
      case '구독': return <SubscriptionTabContent />;
      case '종목': return <SportTabContent />;
      case '대회': return <CompetitionTabContent />;
      default: return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />

      {/* Header with back arrow */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
          <Ionicons name="arrow-back" size={24} color={WHITE} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>상품</Text>
        <View style={{width: 24}} />
      </View>

      {/* 5 Tabs: 전체 | 제휴 | 구독 | 종목 | 대회 */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {TABS.map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.7}>
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.tabTextActive,
                ]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Tab content */}
      <View style={{flex: 1}}>
        {renderTabContent()}
      </View>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

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

  // ── Tabs ──
  tabContainer: {
    borderBottomWidth: 1,
    borderBottomColor: GRAY_DARK,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
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

  // ── Tab content area ──
  tabContent: {
    paddingBottom: 40,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  separator: {
    height: 12,
  },

  // ── Product thumbnail ──
  thumb: {
    width: 60,
    height: 60,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbLogo: {
    fontSize: 24,
    fontWeight: '900',
    color: GREEN,
  },

  // ── Product Card (vertical list) ──
  productCard: {
    backgroundColor: SURFACE,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 10,
  },
  productName: {
    fontSize: 14,
    fontWeight: '700',
    color: WHITE,
    marginBottom: 2,
  },
  productDescription: {
    fontSize: 12,
    color: GRAY,
    lineHeight: 16,
    marginBottom: 6,
  },
  productPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: WHITE,
  },
  originalPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 6,
  },
  originalPrice: {
    fontSize: 12,
    color: GRAY,
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: GREEN,
  },
  buyButton: {
    backgroundColor: colors.bg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: WHITE,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  buyButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: WHITE,
  },

  // ── Subscription full card (구독 tab) ──
  subFullCard: {
    backgroundColor: SURFACE,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  subFullLeft: {
    marginRight: 12,
  },
  subFullInfo: {
    flex: 1,
    marginRight: 10,
  },
  subFullName: {
    fontSize: 15,
    fontWeight: '700',
    color: WHITE,
    marginBottom: 2,
  },
  subFullDesc: {
    fontSize: 12,
    color: GRAY,
    marginBottom: 6,
  },
  subFullPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subFullPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: WHITE,
  },

  // ── Horizontal section (전체 tab) ──
  hSection: {
    marginTop: 16,
  },
  hSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  hSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: WHITE,
  },
  hScrollContent: {
    paddingHorizontal: 16,
    gap: 12,
    paddingBottom: 4,
  },
  hCard: {
    width: HCARD_WIDTH,
  },
  hCardTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: WHITE,
    marginTop: 8,
    lineHeight: 18,
  },
  hCardPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: WHITE,
    marginTop: 4,
  },
  hCardDiscount: {
    fontSize: 12,
    fontWeight: '700',
    color: GREEN,
    marginTop: 2,
  },

  // ── Sport filter chips (종목/대회 tabs) ──
  sportFilterScroll: {
    paddingLeft: 16,
    marginTop: 12,
    marginBottom: 4,
  },
  sportFilterContent: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 16,
  },
  sportChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: GRAY_DARK,
  },
  sportChipActive: {
    borderColor: GREEN,
    backgroundColor: 'rgba(0,200,83,0.1)',
  },
  sportChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: GRAY_LIGHT,
  },
  sportChipTextActive: {
    color: GREEN,
    fontWeight: '700',
  },
});
