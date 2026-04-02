import React, {useState, useCallback, useMemo} from 'react';
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
  mockFriendGroups,
  paymentMethods,
  formatPrice,
  type Friend,
  type PaymentMethod,
} from '../../services/commerceApi';

const GREEN = colors.green;
const BG = colors.bg;
const SURFACE = colors.surface;
const WHITE = colors.white;
const GRAY = colors.gray;
const GRAY_LIGHT = colors.grayLight;
const GRAY_DARK = colors.grayDark;

// Mock gift product
const GIFT_PRODUCT = {
  name: '대가족 무제한 시청권',
  description: '4인 동시 시청! 모든 대회 무제한 시청',
  contentInfo: '전 대회 무제한 시청 / 4인 동시접속 / 클립 무제한 생성',
  price: 29900,
  priceUnit: '원' as const,
};

// --- Gift Purchase Modal (UX p112) ---
interface GiftModalProps {
  visible: boolean;
  selectedFriends: Friend[];
  onClose: () => void;
}

function GiftModal({visible, selectedFriends, onClose}: GiftModalProps) {
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(
    null,
  );
  const [agreeTerms, setAgreeTerms] = useState(false);

  const totalPrice = GIFT_PRODUCT.price * selectedFriends.length;

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
            <Text style={styles.modalTitle}>선물하기</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={WHITE} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalScroll}
            showsVerticalScrollIndicator={false}>
            {/* Recipients */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>받으시는 분</Text>
              <View style={styles.recipientArea}>
                {selectedFriends.map(f => (
                  <View key={f.id} style={styles.recipientChip}>
                    <Text style={styles.recipientChipText}>{f.name}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Product Info */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>상품명</Text>
              <Text style={styles.modalProductName}>
                {GIFT_PRODUCT.name}
              </Text>
              <View style={styles.modalInfoCard}>
                <Text style={styles.modalInfoLabel}>상품 및 콘텐츠 정보</Text>
                <Text style={styles.modalInfoText}>
                  {GIFT_PRODUCT.contentInfo}
                </Text>
              </View>
              <View style={styles.modalInfoCard}>
                <Text style={styles.modalInfoLabel}>가격정보</Text>
                <Text style={styles.modalPriceText}>
                  {formatPrice(GIFT_PRODUCT.price, GIFT_PRODUCT.priceUnit)} x{' '}
                  {selectedFriends.length}명
                </Text>
              </View>
            </View>

            {/* Payment Info */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>결제 정보</Text>
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
                      selectedPayment === pm.method &&
                        styles.paymentLabelActive,
                    ]}>
                    {pm.method}
                  </Text>
                  {pm.balance && (
                    <Text style={styles.paymentBalance}>{pm.balance}</Text>
                  )}
                </TouchableOpacity>
              ))}

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>총 결제 금액</Text>
                <Text style={styles.totalPrice}>
                  {formatPrice(totalPrice, GIFT_PRODUCT.priceUnit)}
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
                  선물 약관 및 개인정보 수집/이용에 동의합니다
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Buy Button */}
          <TouchableOpacity
            style={[
              styles.giftBuyButton,
              (!selectedPayment || !agreeTerms) &&
                styles.giftBuyButtonDisabled,
            ]}
            activeOpacity={0.7}
            disabled={!selectedPayment || !agreeTerms}>
            <Text
              style={[
                styles.giftBuyButtonText,
                (!selectedPayment || !agreeTerms) &&
                  styles.giftBuyButtonTextDisabled,
              ]}>
              구매하기
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// --- Friend Row ---
function FriendRow({
  friend,
  selected,
  onToggle,
}: {
  friend: Friend;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.friendRow}
      onPress={onToggle}
      activeOpacity={0.7}>
      <View style={styles.friendLeft}>
        <View style={styles.friendAvatar}>
          <Text style={styles.friendAvatarText}>
            {friend.name.charAt(0)}
          </Text>
        </View>
        <Text style={styles.friendName}>{friend.name}</Text>
      </View>
      <View style={styles.radioOuter}>
        {selected && <View style={styles.radioInner} />}
      </View>
    </TouchableOpacity>
  );
}

// --- Main Screen ---
export default function GiftScreen() {
  const [searchText, setSearchText] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [giftModalVisible, setGiftModalVisible] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(mockFriendGroups.map(g => g.id)),
  );

  const toggleFriend = useCallback((friendId: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(friendId)) {
        next.delete(friendId);
      } else {
        next.add(friendId);
      }
      return next;
    });
  }, []);

  const toggleGroup = useCallback((groupId: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  }, []);

  const selectedFriends = useMemo(() => {
    const all: Friend[] = [];
    for (const group of mockFriendGroups) {
      for (const member of group.members) {
        if (selectedIds.has(member.id)) {
          all.push(member);
        }
      }
    }
    return all;
  }, [selectedIds]);

  const filteredGroups = useMemo(() => {
    if (!searchText.trim()) return mockFriendGroups;
    const query = searchText.trim().toLowerCase();
    return mockFriendGroups
      .map(g => ({
        ...g,
        members: g.members.filter(m =>
          m.name.toLowerCase().includes(query),
        ),
      }))
      .filter(g => g.members.length > 0);
  }, [searchText]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="arrow-back" size={24} color={WHITE} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>친구 리스트</Text>
        <View style={{width: 24}} />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrap}>
          <Ionicons name="search" size={18} color={GRAY} />
          <TextInput
            style={styles.searchInput}
            placeholder="친구 검색"
            placeholderTextColor={GRAY}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
        <TouchableOpacity style={styles.searchButton} activeOpacity={0.7}>
          <Text style={styles.searchButtonText}>검색</Text>
        </TouchableOpacity>
      </View>

      {/* Friend Groups */}
      <ScrollView
        style={styles.listArea}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}>
        {filteredGroups.map(group => (
          <View key={group.id} style={styles.groupSection}>
            <TouchableOpacity
              style={styles.groupHeader}
              onPress={() => toggleGroup(group.id)}
              activeOpacity={0.7}>
              <Text style={styles.groupLabel}>{group.label}</Text>
              <MaterialIcons
                name={
                  expandedGroups.has(group.id)
                    ? 'expand-less'
                    : 'expand-more'
                }
                size={22}
                color={GRAY_LIGHT}
              />
            </TouchableOpacity>
            {expandedGroups.has(group.id) && (
              <View style={styles.groupMembers}>
                {group.members.map(member => (
                  <FriendRow
                    key={member.id}
                    friend={member}
                    selected={selectedIds.has(member.id)}
                    onToggle={() => toggleFriend(member.id)}
                  />
                ))}
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      {/* Bottom Gift Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[
            styles.giftButton,
            selectedFriends.length === 0 && styles.giftButtonDisabled,
          ]}
          onPress={() => setGiftModalVisible(true)}
          disabled={selectedFriends.length === 0}
          activeOpacity={0.7}>
          <Text
            style={[
              styles.giftButtonText,
              selectedFriends.length === 0 && styles.giftButtonTextDisabled,
            ]}>
            선물하기 ({selectedFriends.length}명)
          </Text>
        </TouchableOpacity>
      </View>

      {/* Gift Modal */}
      <GiftModal
        visible={giftModalVisible}
        selectedFriends={selectedFriends}
        onClose={() => setGiftModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG,
  },
  // Header
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
  // Search
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  searchInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SURFACE,
    borderRadius: 8,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: WHITE,
    paddingVertical: 10,
  },
  searchButton: {
    backgroundColor: GREEN,
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  searchButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },
  // List
  listArea: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  // Group
  groupSection: {
    marginBottom: 8,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: GRAY_DARK,
  },
  groupLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: WHITE,
  },
  groupMembers: {
    paddingTop: 4,
  },
  // Friend row
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  friendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  friendAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: GRAY_DARK,
    alignItems: 'center',
    justifyContent: 'center',
  },
  friendAvatarText: {
    fontSize: 15,
    fontWeight: '700',
    color: WHITE,
  },
  friendName: {
    fontSize: 14,
    fontWeight: '600',
    color: WHITE,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: GRAY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: GREEN,
  },
  // Bottom
  bottomBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 0.5,
    borderTopColor: GRAY_DARK,
  },
  giftButton: {
    backgroundColor: GREEN,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  giftButtonDisabled: {
    backgroundColor: GRAY_DARK,
  },
  giftButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  giftButtonTextDisabled: {
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
  recipientArea: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  recipientChip: {
    backgroundColor: SURFACE,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: GREEN,
  },
  recipientChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: GREEN,
  },
  modalProductName: {
    fontSize: 16,
    fontWeight: '700',
    color: WHITE,
    marginBottom: 10,
  },
  modalInfoCard: {
    backgroundColor: SURFACE,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  modalInfoLabel: {
    fontSize: 12,
    color: GRAY,
    marginBottom: 4,
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
  // Payment
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
  paymentLabel: {
    fontSize: 14,
    color: WHITE,
    flex: 1,
    marginLeft: 10,
  },
  paymentLabelActive: {
    color: GREEN,
  },
  paymentBalance: {
    fontSize: 12,
    color: GRAY_LIGHT,
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
  // Gift Buy
  giftBuyButton: {
    backgroundColor: GREEN,
    borderRadius: 12,
    paddingVertical: 16,
    marginHorizontal: 20,
    alignItems: 'center',
    marginTop: 8,
  },
  giftBuyButtonDisabled: {
    backgroundColor: GRAY_DARK,
  },
  giftBuyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  giftBuyButtonTextDisabled: {
    color: GRAY,
  },
});
