import React, {useState, useCallback} from 'react';
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {MaterialIcons, Ionicons} from '@expo/vector-icons';
import {colors} from '../../theme';

// ─── Types ───────────────────────────────────────────────

type MainTab = 'FAQ' | '1:1 문의' | '문의내역';
type FaqCategory = '전체' | '계정' | '결제' | '영상' | '이용권' | '기타';

interface FaqItem {
  id: string;
  category: FaqCategory;
  question: string;
  answer: string;
}

interface InquiryItem {
  id: string;
  category: string;
  title: string;
  date: string;
  status: '답변완료' | '답변대기';
  answer?: string;
}

// ─── Mock Data ───────────────────────────────────────────

const MOCK_FAQ: FaqItem[] = [
  {id: 'f1', category: '계정', question: '회원가입은 어떻게 하나요?', answer: '포착 앱을 다운로드한 후, 앱 실행 시 나타나는 회원가입 화면에서 본인인증 후 가입하실 수 있습니다. 카카오, 네이버, 구글, 애플 소셜 로그인도 지원합니다.'},
  {id: 'f2', category: '계정', question: '비밀번호를 잊어버렸어요.', answer: '로그인 화면 하단의 "계정 찾기"를 통해 비밀번호를 재설정하실 수 있습니다. 가입 시 등록한 이메일 또는 전화번호로 인증 후 새 비밀번호를 설정해 주세요.'},
  {id: 'f3', category: '결제', question: '이용권은 어떤 종류가 있나요?', answer: '월간 이용권, 연간 이용권, 개별 경기 이용권이 있습니다. 월간 이용권은 9,900원, 연간 이용권은 99,000원이며, 개별 경기는 콘텐츠별 가격이 다릅니다.'},
  {id: 'f4', category: '결제', question: '결제 취소 및 환불은 어떻게 하나요?', answer: '설정 > 이용권 관리에서 결제 내역을 확인하시고, 해당 건을 선택하여 취소 요청이 가능합니다. 이미 시청한 콘텐츠의 경우 부분 환불이 적용될 수 있습니다.'},
  {id: 'f5', category: '영상', question: '영상이 재생되지 않아요.', answer: '네트워크 연결 상태를 확인해 주세요. Wi-Fi 환경에서 이용을 권장하며, 앱을 최신 버전으로 업데이트해 주세요. 문제가 지속되면 앱을 재시작하거나 캐시를 삭제해 보세요.'},
  {id: 'f6', category: '영상', question: '클립은 어떻게 만드나요?', answer: '영상 재생 중 하단의 가위 아이콘을 탭하면 클립 편집 화면으로 이동합니다. 원하는 구간을 선택한 후 저장하시면 나만의 클립이 생성됩니다.'},
  {id: 'f7', category: '이용권', question: '가족 계정은 무엇인가요?', answer: '가족 계정은 하나의 이용권으로 최대 4명의 가족 구성원이 함께 이용할 수 있는 서비스입니다. 각자 개별 프로필을 가지며 시청 기록이 분리됩니다.'},
  {id: 'f8', category: '이용권', question: '이용권 자동 갱신을 해지하고 싶어요.', answer: '설정 > 이용권 관리에서 자동 갱신을 해지하실 수 있습니다. 해지 후에도 결제 기간이 만료될 때까지 서비스를 이용하실 수 있습니다.'},
  {id: 'f9', category: '기타', question: '포착 시티와 포착 클럽의 차이가 뭔가요?', answer: '포착 시티는 누구나 자유롭게 가입하고 콘텐츠를 시청할 수 있는 개방형 단체입니다. 포착 클럽은 가입 승인이 필요한 폐쇄형 단체로, 멤버만 콘텐츠를 이용할 수 있습니다.'},
  {id: 'f10', category: '영상', question: '라이브 방송은 언제 볼 수 있나요?', answer: '라이브 방송 일정은 홈 > 일정 탭에서 확인하실 수 있습니다. 방송 시작 전 알림 설정을 해두시면 시작 시 푸시 알림을 받으실 수 있습니다.'},
  {id: 'f11', category: '계정', question: '회원 탈퇴를 하고 싶어요.', answer: '설정 > 계정 관리 > 회원 탈퇴에서 진행하실 수 있습니다. 탈퇴 시 모든 데이터가 삭제되며, 30일 이내에 재가입하시면 데이터를 복구할 수 있습니다.'},
  {id: 'f12', category: '기타', question: '앱 알림이 오지 않아요.', answer: '기기 설정 > 알림에서 포착 앱의 알림이 허용되어 있는지 확인해 주세요. 앱 내 설정 > 알림 설정에서도 원하는 알림 항목을 활성화해 주세요.'},
];

const MOCK_INQUIRIES: InquiryItem[] = [
  {id: 'i1', category: '결제', title: '이용권 결제가 중복으로 진행되었습니다', date: '2026.03.15', status: '답변완료', answer: '안녕하세요, 포착입니다. 확인 결과 중복 결제가 확인되어 1건에 대해 환불 처리를 완료하였습니다. 3~5영업일 이내에 환불이 반영됩니다.'},
  {id: 'i2', category: '영상', title: '특정 경기 영상에서 소리가 나오지 않습니다', date: '2026.03.10', status: '답변완료', answer: '안녕하세요, 포착입니다. 해당 경기 영상의 오디오 문제를 확인하여 수정 완료하였습니다. 현재 정상적으로 재생되오니 다시 확인해 주세요.'},
  {id: 'i3', category: '계정', title: '소셜 로그인 연동 해제 요청', date: '2026.03.20', status: '답변대기'},
];

const FAQ_CATEGORIES: FaqCategory[] = ['전체', '계정', '결제', '영상', '이용권', '기타'];
const MAIN_TABS: MainTab[] = ['FAQ', '1:1 문의', '문의내역'];
const INQUIRY_CATEGORIES = ['계정', '결제', '영상', '이용권', '기타'];

// ─── Component ───────────────────────────────────────────

export default function SupportScreen() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<MainTab>('FAQ');
  const [faqCategory, setFaqCategory] = useState<FaqCategory>('전체');
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);
  const [expandedInquiryId, setExpandedInquiryId] = useState<string | null>(null);

  // Inquiry form state
  const [inquiryCategory, setInquiryCategory] = useState('');
  const [inquiryTitle, setInquiryTitle] = useState('');
  const [inquiryContent, setInquiryContent] = useState('');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const filteredFaq =
    faqCategory === '전체'
      ? MOCK_FAQ
      : MOCK_FAQ.filter(f => f.category === faqCategory);

  const handleSubmitInquiry = useCallback(() => {
    if (!inquiryCategory) {
      Alert.alert('알림', '카테고리를 선택해 주세요.');
      return;
    }
    if (!inquiryTitle.trim()) {
      Alert.alert('알림', '제목을 입력해 주세요.');
      return;
    }
    if (!inquiryContent.trim()) {
      Alert.alert('알림', '내용을 입력해 주세요.');
      return;
    }
    Alert.alert('문의 접수 완료', '빠른 시일 내에 답변드리겠습니다.');
    setInquiryCategory('');
    setInquiryTitle('');
    setInquiryContent('');
  }, [inquiryCategory, inquiryTitle, inquiryContent]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}>
          <MaterialIcons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>고객센터</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">

        {/* Contact Info */}
        <View style={styles.contactSection}>
          <View style={styles.contactRow}>
            <MaterialIcons name="phone" size={18} color={colors.green} />
            <Text style={styles.contactLabel}>전화</Text>
            <Text style={styles.contactValue}>031-778-8668</Text>
          </View>
          <View style={styles.contactRow}>
            <MaterialIcons name="email" size={18} color={colors.green} />
            <Text style={styles.contactLabel}>이메일</Text>
            <Text style={styles.contactValue}>help@hogak.co.kr</Text>
          </View>
          <View style={styles.contactRow}>
            <MaterialIcons name="access-time" size={18} color={colors.green} />
            <Text style={styles.contactLabel}>운영시간</Text>
            <Text style={styles.contactValue}>평일 09:00-18:00</Text>
          </View>
        </View>

        {/* Main Tabs */}
        <View style={styles.tabRow}>
          {MAIN_TABS.map(tab => {
            const isActive = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.tabChip, isActive && styles.tabChipActive]}
                onPress={() => setActiveTab(tab)}
                activeOpacity={0.7}>
                <Text
                  style={[
                    styles.tabChipText,
                    isActive && styles.tabChipTextActive,
                  ]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* FAQ Tab */}
        {activeTab === 'FAQ' && (
          <View>
            {/* FAQ Category Filters */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.faqCategoryRow}>
              {FAQ_CATEGORIES.map(cat => {
                const isActive = faqCategory === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.faqCategoryChip,
                      isActive && styles.faqCategoryChipActive,
                    ]}
                    onPress={() => setFaqCategory(cat)}
                    activeOpacity={0.7}>
                    <Text
                      style={[
                        styles.faqCategoryText,
                        isActive && styles.faqCategoryTextActive,
                      ]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* FAQ List */}
            {filteredFaq.map(faq => {
              const isExpanded = expandedFaqId === faq.id;
              return (
                <TouchableOpacity
                  key={faq.id}
                  style={styles.faqItem}
                  onPress={() =>
                    setExpandedFaqId(prev => (prev === faq.id ? null : faq.id))
                  }
                  activeOpacity={0.7}>
                  <View style={styles.faqHeader}>
                    <Text style={styles.faqQ}>Q</Text>
                    <Text
                      style={styles.faqQuestion}
                      numberOfLines={isExpanded ? undefined : 2}>
                      {faq.question}
                    </Text>
                    <MaterialIcons
                      name={
                        isExpanded
                          ? 'keyboard-arrow-up'
                          : 'keyboard-arrow-down'
                      }
                      size={22}
                      color={colors.gray}
                    />
                  </View>
                  {isExpanded && (
                    <View style={styles.faqAnswer}>
                      <Text style={styles.faqA}>A</Text>
                      <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* 1:1 문의 Tab */}
        {activeTab === '1:1 문의' && (
          <View style={styles.inquiryForm}>
            {/* Category Picker */}
            <Text style={styles.formLabel}>카테고리</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowCategoryPicker(!showCategoryPicker)}
              activeOpacity={0.7}>
              <Text
                style={[
                  styles.pickerButtonText,
                  !inquiryCategory && styles.pickerPlaceholder,
                ]}>
                {inquiryCategory || '카테고리를 선택해 주세요'}
              </Text>
              <MaterialIcons
                name={showCategoryPicker ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                size={22}
                color={colors.gray}
              />
            </TouchableOpacity>
            {showCategoryPicker && (
              <View style={styles.pickerDropdown}>
                {INQUIRY_CATEGORIES.map(cat => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.pickerOption,
                      inquiryCategory === cat && styles.pickerOptionActive,
                    ]}
                    onPress={() => {
                      setInquiryCategory(cat);
                      setShowCategoryPicker(false);
                    }}
                    activeOpacity={0.7}>
                    <Text
                      style={[
                        styles.pickerOptionText,
                        inquiryCategory === cat && styles.pickerOptionTextActive,
                      ]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Title */}
            <Text style={styles.formLabel}>제목</Text>
            <TextInput
              style={styles.textInput}
              placeholder="문의 제목을 입력해 주세요"
              placeholderTextColor={colors.grayDark}
              value={inquiryTitle}
              onChangeText={setInquiryTitle}
            />

            {/* Content */}
            <Text style={styles.formLabel}>문의 내용</Text>
            <TextInput
              style={styles.textArea}
              placeholder="문의 내용을 상세히 입력해 주세요"
              placeholderTextColor={colors.grayDark}
              value={inquiryContent}
              onChangeText={setInquiryContent}
              multiline
              textAlignVertical="top"
            />

            {/* Submit */}
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmitInquiry}
              activeOpacity={0.8}>
              <Text style={styles.submitButtonText}>문의 등록</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 문의내역 Tab */}
        {activeTab === '문의내역' && (
          <View>
            {MOCK_INQUIRIES.map(inquiry => {
              const isExpanded = expandedInquiryId === inquiry.id;
              const isCompleted = inquiry.status === '답변완료';
              return (
                <TouchableOpacity
                  key={inquiry.id}
                  style={styles.inquiryItem}
                  onPress={() =>
                    setExpandedInquiryId(prev =>
                      prev === inquiry.id ? null : inquiry.id,
                    )
                  }
                  activeOpacity={0.7}>
                  <View style={styles.inquiryHeader}>
                    <View style={styles.inquiryTopRow}>
                      <View
                        style={[
                          styles.statusBadge,
                          isCompleted
                            ? styles.statusCompleted
                            : styles.statusPending,
                        ]}>
                        <Text
                          style={[
                            styles.statusBadgeText,
                            isCompleted
                              ? styles.statusCompletedText
                              : styles.statusPendingText,
                          ]}>
                          {inquiry.status}
                        </Text>
                      </View>
                      <Text style={styles.inquiryCategoryText}>
                        {inquiry.category}
                      </Text>
                    </View>
                    <View style={styles.inquiryTitleRow}>
                      <Text
                        style={styles.inquiryTitle}
                        numberOfLines={isExpanded ? undefined : 1}>
                        {inquiry.title}
                      </Text>
                      <MaterialIcons
                        name={
                          isExpanded
                            ? 'keyboard-arrow-up'
                            : 'keyboard-arrow-down'
                        }
                        size={22}
                        color={colors.gray}
                      />
                    </View>
                    <Text style={styles.inquiryDate}>{inquiry.date}</Text>
                  </View>
                  {isExpanded && inquiry.answer && (
                    <View style={styles.inquiryAnswer}>
                      <Ionicons
                        name="chatbubble-ellipses"
                        size={16}
                        color={colors.green}
                      />
                      <Text style={styles.inquiryAnswerText}>
                        {inquiry.answer}
                      </Text>
                    </View>
                  )}
                  {isExpanded && !inquiry.answer && (
                    <View style={styles.inquiryAnswer}>
                      <Ionicons
                        name="time-outline"
                        size={16}
                        color={colors.gray}
                      />
                      <Text style={styles.inquiryPendingText}>
                        답변 대기 중입니다. 빠른 시일 내에 답변드리겠습니다.
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}

            {MOCK_INQUIRIES.length === 0 && (
              <View style={styles.emptyContainer}>
                <MaterialIcons name="inbox" size={48} color={colors.grayDark} />
                <Text style={styles.emptyText}>문의 내역이 없습니다</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 52,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.grayDark,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
  },
  scrollView: {
    flex: 1,
  },

  // Contact
  contactSection: {
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  contactLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.gray,
    width: 60,
  },
  contactValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },

  // Main Tabs
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
  },
  tabChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  tabChipActive: {
    backgroundColor: colors.green,
  },
  tabChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray,
  },
  tabChipTextActive: {
    color: '#000',
    fontWeight: '700',
  },

  // FAQ Category
  faqCategoryRow: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  faqCategoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.grayDark,
  },
  faqCategoryChipActive: {
    borderColor: colors.green,
    backgroundColor: colors.green + '1A',
  },
  faqCategoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.gray,
  },
  faqCategoryTextActive: {
    color: colors.green,
  },

  // FAQ Items
  faqItem: {
    borderBottomWidth: 0.5,
    borderBottomColor: colors.grayDark,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 10,
  },
  faqQ: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.green,
    marginTop: 1,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
    lineHeight: 22,
  },
  faqAnswer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 4,
    gap: 10,
    backgroundColor: colors.surface,
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: 8,
    paddingLeft: 16,
    paddingRight: 16,
    paddingVertical: 14,
  },
  faqA: {
    fontSize: 16,
    fontWeight: '800',
    color: '#4A90D9',
    marginTop: 1,
  },
  faqAnswerText: {
    flex: 1,
    fontSize: 13,
    color: colors.grayLight,
    lineHeight: 21,
  },

  // Inquiry Form
  inquiryForm: {
    paddingHorizontal: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 8,
    marginTop: 16,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: colors.grayDark,
  },
  pickerButtonText: {
    fontSize: 14,
    color: colors.white,
  },
  pickerPlaceholder: {
    color: colors.grayDark,
  },
  pickerDropdown: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    marginTop: 4,
    borderWidth: 1,
    borderColor: colors.grayDark,
    overflow: 'hidden',
  },
  pickerOption: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.grayDark,
  },
  pickerOptionActive: {
    backgroundColor: colors.green + '1A',
  },
  pickerOptionText: {
    fontSize: 14,
    color: colors.grayLight,
  },
  pickerOptionTextActive: {
    color: colors.green,
    fontWeight: '600',
  },
  textInput: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 14,
    color: colors.white,
    borderWidth: 1,
    borderColor: colors.grayDark,
  },
  textArea: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 14,
    color: colors.white,
    borderWidth: 1,
    borderColor: colors.grayDark,
    minHeight: 160,
  },
  submitButton: {
    backgroundColor: colors.green,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },

  // Inquiry History
  inquiryItem: {
    borderBottomWidth: 0.5,
    borderBottomColor: colors.grayDark,
  },
  inquiryHeader: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  inquiryTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  statusCompleted: {
    backgroundColor: colors.green + '22',
  },
  statusPending: {
    backgroundColor: '#FF8C00' + '22',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusCompletedText: {
    color: colors.green,
  },
  statusPendingText: {
    color: '#FF8C00',
  },
  inquiryCategoryText: {
    fontSize: 12,
    color: colors.gray,
  },
  inquiryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  inquiryTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.white,
  },
  inquiryDate: {
    fontSize: 12,
    color: colors.gray,
    marginTop: 6,
  },
  inquiryAnswer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: colors.surface,
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  inquiryAnswerText: {
    flex: 1,
    fontSize: 13,
    color: colors.grayLight,
    lineHeight: 21,
  },
  inquiryPendingText: {
    flex: 1,
    fontSize: 13,
    color: colors.gray,
    lineHeight: 21,
    fontStyle: 'italic',
  },

  // Empty
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: colors.gray,
  },

  bottomSpacer: {
    height: 40,
  },
});
