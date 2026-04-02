import React, {useState, useCallback} from 'react';
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Ionicons, MaterialIcons} from '@expo/vector-icons';
import {colors} from '../../theme';
import {
  mockProductDetailCards,
  productTabCategories,
  paymentMethods,
  formatPrice,
  type ProductTabCategory,
  type ProductDetailCard,
  type PaymentMethod,
} from '../../services/commerceApi';

const GREEN = colors.green;
const BG = colors.bg;
const SURFACE = colors.surface;
const WHITE = colors.white;
const GRAY = colors.gray;
const GRAY_LIGHT = colors.grayLight;
const GRAY_DARK = colors.grayDark;

// --- Profile Header (UX p111) ---
function ProfileHeader() {
  return (
    <View style={styles.profileHeader}>
      <View style={styles.profileRow}>
        <TouchableOpacity>
          <Ionicons name="arrow-back" size={24} color={WHITE} />
        </TouchableOpacity>
        <Text style={styles.profileName}>홍길동</Text>
        <View style={{width: 24}} />
      </View>
      <Text style={styles.profileSub}>구독중인 상품이 없습니다</Text>
      <View style={styles.badgeRow}>
        <View style={styles.badge}>
          <MaterialIcons name="notifications" size={14} color={WHITE} />
          <Text style={styles.badgeText}>알림99</Text>
        </View>
        <View style={styles.badge}>
          <MaterialIcons name="card-giftcard" size={14} color={WHITE} />
          <Text style={styles.badgeText}>선물99</Text>
        </View>
        <View style={styles.badge}>
          <MaterialIcons name="monetization-on" size={14} color={GREEN} />
          <Text style={styles.badgeText}>뽈</Text>
        </View>
        <View style={styles.badge}>
          <MaterialIcons name="local-offer" size={14} color={GREEN} />
          <Text style={styles.badgeText}>쿠폰</Text>
        </View>
      </View>
    </View>
  );
}

// --- Purchase Bottom Sheet Modal (UX p111) ---
interface PurchaseModalProps {
  visible: boolean;
  product: ProductDetailCard | null;
  onClose: () => void;
}

function PurchaseModal({visible, product, onClose}: PurchaseModalProps) {
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null);
  const [usePoints, setUsePoints] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  if (!product) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>구매하기</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={WHITE} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalScroll}
            showsVerticalScrollIndicator={false}>
            {/* Product Name */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>상품명</Text>
              <Text style={styles.modalProductName}>{product.name}</Text>
            </View>

            {/* Product & Content Info / Price */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>상품 및 콘텐츠 정보</Text>
              <View style={styles.modalInfoCard}>
                <Text style={styles.modalInfoText}>{product.contentInfo}</Text>
              </View>
              <Text style={styles.modalSectionTitle}>가격정보</Text>
              <View style={styles.modalInfoCard}>
                <Text style={styles.modalPriceText}>
                  {formatPrice(product.price, product.priceUnit)}
                </Text>
              </View>
            </View>

            {/* Payment Info */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>결제 정보</Text>
              <Text style={styles.modalSubLabel}>결제수단</Text>
              {paymentMethods.map(pm => (
                <TouchableOpacity
                  key={pm.method}
                  style={[
                    styles.paymentRow,
                    selectedPayment === pm.method && styles.paymentRowActive,
                  ]}
                  onPress={() => setSelectedPayment(pm.method)}
                  activeOpacity={0.7}>
                  <View style={styles.radioOuter}>
                    {selectedPayment === pm.method && (
                      <View style={styles.radioInner} />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.paymentLabel,
                      selectedPayment === pm.method && styles.paymentLabelActive,
                    ]}>
                    {pm.method}
                  </Text>
                  {pm.balance && (
                    <Text style={styles.paymentBalance}>{pm.balance}</Text>
                  )}
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                style={styles.pointToggle}
                onPress={() => setUsePoints(!usePoints)}
                activeOpacity={0.7}>
                <MaterialIcons
                  name={usePoints ? 'check-box' : 'check-box-outline-blank'}
                  size={22}
                  color={usePoints ? GREEN : GRAY}
                />
                <Text style={styles.pointToggleText}>포인트 사용</Text>
              </TouchableOpacity>

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>실제 결제 금액</Text>
                <Text style={styles.totalPrice}>
                  {formatPrice(product.price, product.priceUnit)}
                </Text>
              </View>
            </View>

            {/* Terms */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>약관 동의</Text>
              <TouchableOpacity
                style={styles.termsRow}
                onPress={() => setAgreeTerms(!agreeTerms)}
                activeOpacity={0.7}>
                <MaterialIcons
                  name={agreeTerms ? 'check-box' : 'check-box-outline-blank'}
                  size={22}
                  color={agreeTerms ? GREEN : GRAY}
                />
                <Text style={styles.termsText}>
                  구매 약관 및 개인정보 수집/이용에 동의합니다
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Purchase Button */}
          <TouchableOpacity
            style={[
              styles.purchaseButton,
              (!selectedPayment || !agreeTerms) && styles.purchaseButtonDisabled,
            ]}
            activeOpacity={0.7}
            disabled={!selectedPayment || !agreeTerms}>
            <Text
              style={[
                styles.purchaseButtonText,
                (!selectedPayment || !agreeTerms) &&
                  styles.purchaseButtonTextDisabled,
              ]}>
              구매하기
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// --- Product Card ---
function ProductCard({
  product,
  onPress,
}: {
  product: ProductDetailCard;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.productCard}
      onPress={onPress}
      activeOpacity={0.7}>
      <View style={styles.productCardLeft}>
        <View style={styles.productThumb}>
          <MaterialIcons name="shopping-bag" size={28} color={GRAY} />
        </View>
      </View>
      <View style={styles.productCardInfo}>
        <Text style={styles.productCardName}>{product.name}</Text>
        <Text style={styles.productCardDesc} numberOfLines={2}>
          {product.description}
        </Text>
        <Text style={styles.productCardPrice}>
          {formatPrice(product.price, product.priceUnit)}
        </Text>
      </View>
      <MaterialIcons name="chevron-right" size={22} color={GRAY} />
    </TouchableOpacity>
  );
}

// --- Main Screen ---
export default function ProductDetailScreen() {
  const [activeTab, setActiveTab] = useState<ProductTabCategory>('전체');
  const [selectedProduct, setSelectedProduct] =
    useState<ProductDetailCard | null>(null);
  const [purchaseVisible, setPurchaseVisible] = useState(false);

  const filteredProducts =
    activeTab === '전체'
      ? mockProductDetailCards
      : mockProductDetailCards.filter(p => p.tab === activeTab);

  const handleProductTap = useCallback((product: ProductDetailCard) => {
    setSelectedProduct(product);
    setPurchaseVisible(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setPurchaseVisible(false);
    setSelectedProduct(null);
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />

      {/* Profile Header */}
      <ProfileHeader />

      {/* Tab: 전체 | 유형 | 유형 | 유형 | 제휴 */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {productTabCategories.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[styles.tab, activeTab === cat && styles.tabActive]}
              onPress={() => setActiveTab(cat)}
              activeOpacity={0.7}>
              <Text
                style={[
                  styles.tabText,
                  activeTab === cat && styles.tabTextActive,
                ]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Product Cards (scrollable) */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {filteredProducts.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onPress={() => handleProductTap(product)}
          />
        ))}
        {filteredProducts.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>표시할 상품이 없습니다</Text>
          </View>
        )}
      </ScrollView>

      {/* Purchase Modal */}
      <PurchaseModal
        visible={purchaseVisible}
        product={selectedProduct}
        onClose={handleCloseModal}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG,
  },
  // Profile Header
  profileHeader: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: GRAY_DARK,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: WHITE,
  },
  profileSub: {
    fontSize: 13,
    color: GRAY_LIGHT,
    textAlign: 'center',
    marginBottom: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SURFACE,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: WHITE,
  },
  // Tabs
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
  // Scroll
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  // Product Card
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SURFACE,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  productCardLeft: {
    marginRight: 12,
  },
  productThumb: {
    width: 52,
    height: 52,
    borderRadius: 8,
    backgroundColor: GRAY_DARK,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productCardInfo: {
    flex: 1,
  },
  productCardName: {
    fontSize: 15,
    fontWeight: '700',
    color: WHITE,
    marginBottom: 3,
  },
  productCardDesc: {
    fontSize: 12,
    color: GRAY_LIGHT,
    marginBottom: 4,
    lineHeight: 16,
  },
  productCardPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: GREEN,
  },
  // Empty state
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 14,
    color: GRAY,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: BG,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: GRAY_DARK,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: WHITE,
  },
  modalScroll: {
    paddingHorizontal: 20,
  },
  modalSection: {
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: GRAY_DARK,
  },
  modalSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: GRAY_LIGHT,
    marginBottom: 8,
  },
  modalProductName: {
    fontSize: 16,
    fontWeight: '700',
    color: WHITE,
  },
  modalInfoCard: {
    backgroundColor: SURFACE,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  modalInfoText: {
    fontSize: 13,
    color: GRAY_LIGHT,
    lineHeight: 20,
  },
  modalPriceText: {
    fontSize: 18,
    fontWeight: '800',
    color: GREEN,
  },
  modalSubLabel: {
    fontSize: 13,
    color: GRAY_LIGHT,
    marginBottom: 8,
  },
  // Payment options
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  paymentRowActive: {
    backgroundColor: SURFACE,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: GRAY,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: GREEN,
  },
  paymentLabel: {
    fontSize: 14,
    color: WHITE,
    flex: 1,
  },
  paymentLabelActive: {
    color: GREEN,
  },
  paymentBalance: {
    fontSize: 12,
    color: GRAY_LIGHT,
  },
  pointToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 8,
  },
  pointToggleText: {
    fontSize: 14,
    color: WHITE,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 0.5,
    borderTopColor: GRAY_DARK,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: WHITE,
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: '800',
    color: GREEN,
  },
  // Terms
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  termsText: {
    fontSize: 13,
    color: GRAY_LIGHT,
    flex: 1,
  },
  // Purchase button
  purchaseButton: {
    backgroundColor: GREEN,
    borderRadius: 12,
    paddingVertical: 16,
    marginHorizontal: 20,
    alignItems: 'center',
    marginTop: 8,
  },
  purchaseButtonDisabled: {
    backgroundColor: GRAY_DARK,
  },
  purchaseButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  purchaseButtonTextDisabled: {
    color: GRAY,
  },
});
