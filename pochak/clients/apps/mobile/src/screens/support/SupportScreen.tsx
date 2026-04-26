import React, {useState, useCallback, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {MaterialIcons, Ionicons} from '@expo/vector-icons';
import {colors} from '../../theme';
import {supportService} from '../../api/supportService';
import type {FaqItem, InquiryItem} from '../../api/supportService';

// ─── Types ───────────────────────────────────────────────

type MainTab = 'FAQ' | '1:1 문의' | '문의내역';
type FaqCategory = '전체' | '계정' | '결제' | '영상' | '이용권' | '기타';

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

  // FAQ state
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [faqLoading, setFaqLoading] = useState(false);

  // Inquiry history state
  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);
  const [inquiriesLoading, setInquiriesLoading] = useState(false);

  // Inquiry form state
  const [inquiryCategory, setInquiryCategory] = useState('');
  const [inquiryTitle, setInquiryTitle] = useState('');
  const [inquiryContent, setInquiryContent] = useState('');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const fetchFaqs = useCallback(async (category: FaqCategory) => {
    setFaqLoading(true);
    try {
      const result = await supportService.getFaqs(category !== '전체' ? category : undefined);
      setFaqs(result);
    } catch {
      // Keep empty list on error
    } finally {
      setFaqLoading(false);
    }
  }, []);

  const fetchInquiries = useCallback(async () => {
    setInquiriesLoading(true);
    try {
      const result = await supportService.getMyInquiries();
      setInquiries(result);
    } catch {
      // Keep empty list on error
    } finally {
      setInquiriesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'FAQ') fetchFaqs(faqCategory);
  }, [activeTab, faqCategory, fetchFaqs]);

  useEffect(() => {
    if (activeTab === '문의내역') fetchInquiries();
  }, [activeTab, fetchInquiries]);

  const filteredFaq = faqs;

  const handleSubmitInquiry = useCallback(async () => {
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
    try {
      await supportService.createInquiry({
        category: inquiryCategory,
        title: inquiryTitle.trim(),
        content: inquiryContent.trim(),
      });
      Alert.alert('문의 접수 완료', '빠른 시일 내에 답변드리겠습니다.');
      setInquiryCategory('');
      setInquiryTitle('');
      setInquiryContent('');
    } catch {
      Alert.alert('오류', '문의 등록에 실패하였습니다. 다시 시도해 주세요.');
    }
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
            {faqLoading ? (
              <ActivityIndicator color={colors.green} style={{marginTop: 32}} />
            ) : filteredFaq.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>FAQ가 없습니다</Text>
              </View>
            ) : null}
            {!faqLoading && filteredFaq.map(faq => {
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
            {inquiriesLoading && (
              <ActivityIndicator color={colors.green} style={{marginTop: 32}} />
            )}
            {!inquiriesLoading && inquiries.map(inquiry => {
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

            {!inquiriesLoading && inquiries.length === 0 && (
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
