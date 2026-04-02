import React, {useState, useCallback, useEffect} from 'react';
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
import {useNavigation} from '@react-navigation/native';
import {colors} from '../../theme';
import {mockLoginRecords, type LoginRecord} from '../../services/commerceApi';
import {commerceService} from '../../api/commerceService';

const GREEN = colors.green;
const BG = colors.bg;
const SURFACE = colors.surface;
const WHITE = colors.white;
const GRAY = colors.gray;
const GRAY_LIGHT = colors.grayLight;
const GRAY_DARK = colors.grayDark;

type SettingsTab = 'account' | 'notification' | 'community' | 'content' | 'environment';

// --- Profile Header (shared UX p116) ---
interface ProfileHeaderProps {
  subscriptionPlan: string | null;
  subscriptionExpiry: string | null;
  onSubscribePress: () => void;
}

function ProfileHeader({subscriptionPlan, subscriptionExpiry, onSubscribePress}: ProfileHeaderProps) {
  return (
    <View style={styles.profileHeader}>
      <View style={styles.profileRow}>
        <TouchableOpacity>
          <Ionicons name="arrow-back" size={24} color={WHITE} />
        </TouchableOpacity>
        <Text style={styles.profileName}>홍길동</Text>
        <View style={{width: 24}} />
      </View>
      {subscriptionPlan ? (
        <View style={styles.subscriptionInfo}>
          <Text style={styles.profileSubActive}>
            {subscriptionPlan}
          </Text>
          {subscriptionExpiry && (
            <Text style={styles.subscriptionExpiry}>
              만료일: {subscriptionExpiry}
            </Text>
          )}
          <TouchableOpacity style={styles.subscriptionManageButton} onPress={onSubscribePress}>
            <Text style={styles.subscriptionManageText}>구독 관리</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.subscriptionInfo}>
          <Text style={styles.profileSub}>구독 상품이 없습니다</Text>
          <TouchableOpacity style={styles.subscriptionGoButton} onPress={onSubscribePress}>
            <Text style={styles.subscriptionGoText}>상품 보러가기</Text>
          </TouchableOpacity>
        </View>
      )}
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

// --- Password Change Modal (UX p118) ---
interface PasswordChangeModalProps {
  visible: boolean;
  onClose: () => void;
}

function PasswordChangeModal({visible, onClose}: PasswordChangeModalProps) {
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>비밀번호 변경</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={WHITE} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <Text style={styles.inputLabel}>기존 비밀번호</Text>
            <TextInput
              style={styles.textInput}
              placeholder="기존 비밀번호 입력"
              placeholderTextColor={GRAY}
              secureTextEntry
              value={currentPw}
              onChangeText={setCurrentPw}
            />

            <Text style={styles.inputLabel}>신규 비밀번호</Text>
            <TextInput
              style={styles.textInput}
              placeholder="신규 비밀번호 입력"
              placeholderTextColor={GRAY}
              secureTextEntry
              value={newPw}
              onChangeText={setNewPw}
            />

            <Text style={styles.inputLabel}>신규 비밀번호 확인</Text>
            <TextInput
              style={styles.textInput}
              placeholder="신규 비밀번호 확인"
              placeholderTextColor={GRAY}
              secureTextEntry
              value={confirmPw}
              onChangeText={setConfirmPw}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.confirmButton,
              (!currentPw || !newPw || !confirmPw) &&
                styles.confirmButtonDisabled,
            ]}
            activeOpacity={0.7}
            disabled={!currentPw || !newPw || !confirmPw}>
            <Text
              style={[
                styles.confirmButtonText,
                (!currentPw || !newPw || !confirmPw) &&
                  styles.confirmButtonTextDisabled,
              ]}>
              확인
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// --- Account Verify Modal (UX p117) ---
interface AccountVerifyModalProps {
  visible: boolean;
  onClose: () => void;
  onVerified: () => void;
}

function AccountVerifyModal({visible, onClose, onVerified}: AccountVerifyModalProps) {
  const [password, setPassword] = useState('');

  const handleConfirm = useCallback(() => {
    if (password.length >= 8) {
      onVerified();
    }
  }, [password, onVerified]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>계정정보 확인</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={WHITE} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <Text style={styles.verifySubtitle}>계정 비밀번호 입력</Text>
            <Text style={styles.verifyDescription}>
              개인정보 보호를 위해 비밀번호를 입력해주세요
            </Text>

            <TextInput
              style={styles.textInput}
              placeholder="비밀번호 입력"
              placeholderTextColor={GRAY}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <Text style={styles.guideText}>
              영문, 숫자 조합 8-32자 이내 / 특수문자 포함 가능
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.confirmButton,
              password.length < 8 && styles.confirmButtonDisabled,
            ]}
            activeOpacity={0.7}
            disabled={password.length < 8}
            onPress={handleConfirm}>
            <Text
              style={[
                styles.confirmButtonText,
                password.length < 8 && styles.confirmButtonTextDisabled,
              ]}>
              확인
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// --- Account Detail View (UX p118) ---
interface AccountDetailViewProps {
  onBack: () => void;
  onPasswordChange: () => void;
}

function AccountDetailView({onBack, onPasswordChange}: AccountDetailViewProps) {
  const preferredSports = ['축구', '배구'];
  const regions = ['삼정동', '기장읍'];

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.detailScrollContent}>
      {/* Back header */}
      <TouchableOpacity
        style={styles.detailBackRow}
        onPress={onBack}
        activeOpacity={0.7}>
        <Ionicons name="arrow-back" size={20} color={WHITE} />
        <Text style={styles.detailBackText}>계정설정으로 돌아가기</Text>
      </TouchableOpacity>

      {/* Account Info Section */}
      <View style={styles.detailSection}>
        <Text style={styles.detailSectionTitle}>계정정보</Text>
        <View style={styles.detailCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>아이디</Text>
            <View style={styles.detailRight}>
              <View style={styles.accountTypeBadge}>
                <Text style={styles.accountTypeBadgeText}>계정유형</Text>
              </View>
              <Text style={styles.detailValue}>ID/SNS 정보</Text>
            </View>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>비밀번호</Text>
            <TouchableOpacity
              style={styles.modifyButton}
              onPress={onPasswordChange}
              activeOpacity={0.7}>
              <Text style={styles.modifyButtonText}>수정</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Profile Info Section */}
      <View style={styles.detailSection}>
        <Text style={styles.detailSectionTitle}>프로필 정보</Text>
        <View style={styles.detailCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>이름</Text>
            <Text style={styles.detailValue}>홍길동</Text>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>생년월일</Text>
            <Text style={styles.detailValue}>YYYY.MM.DD</Text>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>휴대폰번호</Text>
            <Text style={styles.detailValue}>010-0000-0000</Text>
          </View>
        </View>
      </View>

      {/* Additional Info Section */}
      <View style={styles.detailSection}>
        <Text style={styles.detailSectionTitle}>부가 정보</Text>
        <View style={styles.detailCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>이메일</Text>
            <Text style={styles.detailValue}>abcd@abcd.net</Text>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>선호종목</Text>
            <View style={styles.tagArea}>
              {preferredSports.map(s => (
                <View key={s} style={styles.tagChip}>
                  <Text style={styles.tagChipText}>{s}</Text>
                  <TouchableOpacity>
                    <Ionicons name="close" size={14} color={GRAY_LIGHT} />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity style={styles.addTagButton}>
                <Ionicons name="add" size={18} color={GREEN} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>지역</Text>
            <View style={styles.tagArea}>
              {regions.map(r => (
                <View key={r} style={styles.tagChip}>
                  <Text style={styles.tagChipText}>{r}</Text>
                  <TouchableOpacity>
                    <Ionicons name="close" size={14} color={GRAY_LIGHT} />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity style={styles.addTagButton}>
                <Ionicons name="add" size={18} color={GREEN} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>목적</Text>
            <TouchableOpacity style={styles.addTagButton}>
              <Ionicons name="add" size={18} color={GREEN} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

// --- Account Settings Tab (UX p117) ---
interface AccountSettingsTabProps {
  onAccountInfoPress: () => void;
}

function AccountSettingsTab({onAccountInfoPress}: AccountSettingsTabProps) {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.tabScrollContent}>
      {/* Account Info Row */}
      <TouchableOpacity
        style={styles.settingRow}
        onPress={onAccountInfoPress}
        activeOpacity={0.7}>
        <View>
          <Text style={styles.settingRowLabel}>계정정보</Text>
          <Text style={styles.settingRowSub}>(EMAIL) abcd@Pochak.live</Text>
        </View>
        <MaterialIcons name="chevron-right" size={22} color={GRAY} />
      </TouchableOpacity>

      {/* Subscription */}
      <TouchableOpacity style={styles.settingRow} activeOpacity={0.7}>
        <View>
          <Text style={styles.settingRowLabel}>구독상품</Text>
          <Text style={styles.settingRowSub}>
            이용중인 구독상품이 없습니다
          </Text>
        </View>
        <MaterialIcons name="chevron-right" size={22} color={GRAY} />
      </TouchableOpacity>

      {/* 3 quick-access cards */}
      <View style={styles.quickCards}>
        <View style={styles.quickCard}>
          <MaterialIcons name="emoji-events" size={28} color={GREEN} />
          <Text style={styles.quickCardLabel}>대회권</Text>
          <Text style={styles.quickCardCount}>0</Text>
        </View>
        <View style={styles.quickCard}>
          <MaterialIcons name="confirmation-number" size={28} color={GREEN} />
          <Text style={styles.quickCardLabel}>경기패스</Text>
          <Text style={styles.quickCardCount}>0</Text>
        </View>
        <View style={styles.quickCard}>
          <MaterialIcons name="card-giftcard" size={28} color={GREEN} />
          <Text style={styles.quickCardLabel}>선물함</Text>
          <Text style={styles.quickCardCount}>0</Text>
        </View>
      </View>

      {/* Login History */}
      <View style={styles.sectionBlock}>
        <Text style={styles.sectionBlockTitle}>로그인 기록</Text>
        {mockLoginRecords.map(record => (
          <View key={record.id} style={styles.loginRow}>
            <View style={styles.loginLeft}>
              <MaterialIcons
                name={
                  record.platform === 'iOS'
                    ? 'phone-iphone'
                    : record.platform === 'Android'
                    ? 'phone-android'
                    : 'computer'
                }
                size={20}
                color={GRAY_LIGHT}
              />
              <View style={styles.loginInfo}>
                <Text style={styles.loginDate}>
                  {record.date} {record.time}
                </Text>
                <Text style={styles.loginDevice}>
                  {record.platform} | {record.device}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Support History */}
      <View style={styles.sectionBlock}>
        <Text style={styles.sectionBlockTitle}>문의내역</Text>
        <View style={styles.emptyArea}>
          <Text style={styles.emptyText}>최근 문의내역이 없습니다</Text>
        </View>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

// --- Placeholder for other tabs ---
function PlaceholderTab({label}: {label: string}) {
  return (
    <View style={styles.placeholderContainer}>
      <Text style={styles.placeholderText}>{label} - 준비 중입니다.</Text>
    </View>
  );
}

// --- Main Screen ---
export default function PersonalChannelScreen() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('account');
  const [showAccountDetail, setShowAccountDetail] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [subscriptionPlan, setSubscriptionPlan] = useState<string | null>(null);
  const [subscriptionExpiry, setSubscriptionExpiry] = useState<string | null>(null);
  const nav = useNavigation<any>();

  useEffect(() => {
    (async () => {
      try {
        const sub = await commerceService.getSubscription();
        if (sub.isActive && sub.planName) {
          setSubscriptionPlan(sub.planName);
          setSubscriptionExpiry(sub.expiresAt);
        }
      } catch {
        // Ignore -- will show "no subscription" state
      }
    })();
  }, []);

  const handleSubscribePress = useCallback(() => {
    nav.navigate('ProductList');
  }, [nav]);

  const tabs: {key: SettingsTab; label: string}[] = [
    {key: 'account', label: '계정설정'},
    {key: 'notification', label: '알림설정'},
    {key: 'community', label: '커뮤니티설정'},
    {key: 'content', label: '콘텐츠설정'},
    {key: 'environment', label: '환경설정'},
  ];

  const handleAccountInfoPress = useCallback(() => {
    setShowVerifyModal(true);
  }, []);

  const handleVerified = useCallback(() => {
    setShowVerifyModal(false);
    setShowAccountDetail(true);
  }, []);

  const handlePasswordChange = useCallback(() => {
    setShowPasswordModal(true);
  }, []);

  const renderContent = () => {
    if (activeTab === 'account') {
      if (showAccountDetail) {
        return (
          <AccountDetailView
            onBack={() => setShowAccountDetail(false)}
            onPasswordChange={handlePasswordChange}
          />
        );
      }
      return (
        <AccountSettingsTab onAccountInfoPress={handleAccountInfoPress} />
      );
    }
    if (activeTab === 'notification') {
      return <PlaceholderTab label="알림설정" />;
    }
    if (activeTab === 'community') {
      return <PlaceholderTab label="커뮤니티설정" />;
    }
    if (activeTab === 'content') {
      return <PlaceholderTab label="콘텐츠설정" />;
    }
    return <PlaceholderTab label="환경설정" />;
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />

      {/* Profile Header */}
      <ProfileHeader
        subscriptionPlan={subscriptionPlan}
        subscriptionExpiry={subscriptionExpiry}
        onSubscribePress={handleSubscribePress}
      />

      {/* Settings Tabs */}
      <View style={styles.tabBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}
              onPress={() => {
                setActiveTab(tab.key);
                setShowAccountDetail(false);
              }}
              activeOpacity={0.7}>
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.key && styles.tabTextActive,
                ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      <View style={styles.contentArea}>{renderContent()}</View>

      {/* Password Change Modal */}
      <PasswordChangeModal
        visible={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />

      {/* Account Verify Modal */}
      <AccountVerifyModal
        visible={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
        onVerified={handleVerified}
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
    marginBottom: 6,
  },
  profileSubActive: {
    fontSize: 14,
    fontWeight: '700',
    color: GREEN,
    textAlign: 'center',
    marginBottom: 2,
  },
  subscriptionInfo: {
    alignItems: 'center',
    marginBottom: 10,
  },
  subscriptionExpiry: {
    fontSize: 11,
    color: GRAY_LIGHT,
    marginBottom: 6,
  },
  subscriptionManageButton: {
    borderWidth: 1,
    borderColor: GREEN,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  subscriptionManageText: {
    fontSize: 12,
    fontWeight: '600',
    color: GREEN,
  },
  subscriptionGoButton: {
    backgroundColor: GREEN,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  subscriptionGoText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000',
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
  // Tab Bar
  tabBar: {
    borderBottomWidth: 1,
    borderBottomColor: GRAY_DARK,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: GREEN,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: GRAY,
  },
  tabTextActive: {
    color: GREEN,
  },
  // Content
  contentArea: {
    flex: 1,
  },
  tabScrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
  },
  // Account Settings Tab
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: SURFACE,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  settingRowLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: WHITE,
    marginBottom: 3,
  },
  settingRowSub: {
    fontSize: 12,
    color: GRAY_LIGHT,
  },
  // Quick Cards
  quickCards: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 12,
  },
  quickCard: {
    flex: 1,
    backgroundColor: SURFACE,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    gap: 6,
  },
  quickCardLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: GRAY_LIGHT,
  },
  quickCardCount: {
    fontSize: 18,
    fontWeight: '800',
    color: WHITE,
  },
  // Login History
  sectionBlock: {
    marginTop: 16,
  },
  sectionBlockTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: WHITE,
    marginBottom: 10,
  },
  loginRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SURFACE,
    borderRadius: 10,
    padding: 12,
    marginBottom: 6,
  },
  loginLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  loginInfo: {
    gap: 2,
  },
  loginDate: {
    fontSize: 13,
    fontWeight: '600',
    color: WHITE,
  },
  loginDevice: {
    fontSize: 11,
    color: GRAY_LIGHT,
  },
  // Empty state
  emptyArea: {
    backgroundColor: SURFACE,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: GRAY,
  },
  // Bottom spacer
  bottomSpacer: {
    height: 40,
  },
  // Account Detail View
  detailScrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
  },
  detailBackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  detailBackText: {
    fontSize: 14,
    color: GRAY_LIGHT,
  },
  detailSection: {
    marginBottom: 20,
  },
  detailSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: GRAY_LIGHT,
    marginBottom: 8,
  },
  detailCard: {
    backgroundColor: SURFACE,
    borderRadius: 12,
    overflow: 'hidden',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 50,
  },
  detailLabel: {
    fontSize: 14,
    color: GRAY,
    minWidth: 70,
  },
  detailRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    justifyContent: 'flex-end',
  },
  detailValue: {
    fontSize: 14,
    color: WHITE,
    textAlign: 'right',
  },
  detailDivider: {
    height: 0.5,
    backgroundColor: GRAY_DARK,
    marginHorizontal: 16,
  },
  accountTypeBadge: {
    backgroundColor: GRAY_DARK,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  accountTypeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: GRAY_LIGHT,
  },
  modifyButton: {
    backgroundColor: GREEN,
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  modifyButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000',
  },
  // Tags area
  tagArea: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    flex: 1,
    justifyContent: 'flex-end',
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GRAY_DARK,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 4,
  },
  tagChipText: {
    fontSize: 12,
    color: WHITE,
  },
  addTagButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    backgroundColor: BG,
    borderRadius: 16,
    overflow: 'hidden',
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
  modalBody: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: GRAY_LIGHT,
    marginBottom: 6,
    marginTop: 12,
  },
  textInput: {
    backgroundColor: SURFACE,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: WHITE,
    borderWidth: 1,
    borderColor: GRAY_DARK,
  },
  verifySubtitle: {
    fontSize: 16,
    fontWeight: '700',
    color: WHITE,
    marginBottom: 6,
  },
  verifyDescription: {
    fontSize: 13,
    color: GRAY_LIGHT,
    marginBottom: 16,
    lineHeight: 18,
  },
  guideText: {
    fontSize: 11,
    color: GRAY,
    marginTop: 8,
    lineHeight: 16,
  },
  confirmButton: {
    backgroundColor: GREEN,
    borderRadius: 10,
    paddingVertical: 14,
    marginHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: GRAY_DARK,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  confirmButtonTextDisabled: {
    color: GRAY,
  },
  // Placeholder
  placeholderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 14,
    color: GRAY,
  },
});
