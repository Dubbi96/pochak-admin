import React, {useState, useCallback} from 'react';
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {MaterialIcons} from '@expo/vector-icons';
import {colors} from '../../theme';

// ─── Types ───────────────────────────────────────────────

type NoticeCategory = '서비스' | '이벤트' | '점검';
type FilterTab = '전체' | NoticeCategory;

interface Notice {
  id: string;
  category: NoticeCategory;
  title: string;
  date: string;
  isNew: boolean;
  body: string;
}

// ─── Mock Data ───────────────────────────────────────────

const MOCK_NOTICES: Notice[] = [
  {
    id: '1',
    category: '서비스',
    title: '포착 앱 v2.0 업데이트 안내',
    date: '2026.03.20',
    isNew: true,
    body: '안녕하세요, 포착입니다.\n\n포착 앱 v2.0이 출시되었습니다. 주요 변경 사항은 다음과 같습니다.\n\n1. 홈 화면 UI 개선\n2. 영상 플레이어 성능 향상\n3. 클립 편집 기능 추가\n4. 검색 기능 강화\n\n업데이트 후에도 불편한 점이 있으시면 고객센터로 문의해 주세요.\n감사합니다.',
  },
  {
    id: '2',
    category: '이벤트',
    title: '봄맞이 신규 가입 이벤트 - 1개월 무료 이용권 증정',
    date: '2026.03.18',
    isNew: true,
    body: '안녕하세요, 포착입니다.\n\n봄을 맞아 신규 가입 고객을 대상으로 1개월 무료 이용권을 증정합니다.\n\n- 이벤트 기간: 2026.03.18 ~ 2026.04.30\n- 대상: 신규 가입 고객\n- 혜택: 프리미엄 이용권 1개월 무료\n\n많은 참여 부탁드립니다!',
  },
  {
    id: '3',
    category: '점검',
    title: '서버 정기 점검 안내 (3/25 02:00~06:00)',
    date: '2026.03.15',
    isNew: true,
    body: '안녕하세요, 포착입니다.\n\n아래 일정으로 서버 정기 점검이 진행됩니다.\n\n- 점검 일시: 2026년 3월 25일 (수) 02:00 ~ 06:00\n- 점검 내용: 서버 안정화 및 성능 개선\n\n점검 시간 동안 서비스 이용이 제한될 수 있습니다.\n불편을 드려 죄송합니다.',
  },
  {
    id: '4',
    category: '서비스',
    title: '개인정보 처리방침 변경 안내',
    date: '2026.03.10',
    isNew: false,
    body: '안녕하세요, 포착입니다.\n\n개인정보 처리방침이 일부 변경되어 안내드립니다.\n\n변경 시행일: 2026년 4월 1일\n\n주요 변경 사항:\n- 개인정보 수집 항목 변경\n- 제3자 제공 범위 조정\n\n자세한 내용은 설정 > 개인정보 처리방침에서 확인하실 수 있습니다.',
  },
  {
    id: '5',
    category: '이벤트',
    title: '친구 초대 이벤트 - 함께 보면 더 즐거운 포착!',
    date: '2026.03.08',
    isNew: false,
    body: '안녕하세요, 포착입니다.\n\n친구를 초대하고 특별한 혜택을 받아보세요!\n\n- 초대한 친구가 가입하면: 이용권 7일 증정\n- 초대받은 친구: 이용권 3일 증정\n- 초대 횟수 제한 없음\n\n이벤트 기간: 2026.03.08 ~ 2026.05.31',
  },
  {
    id: '6',
    category: '서비스',
    title: '라이브 스트리밍 기능 오픈 안내',
    date: '2026.03.05',
    isNew: false,
    body: '안녕하세요, 포착입니다.\n\n많은 분들이 기다려주신 라이브 스트리밍 기능이 정식 오픈되었습니다.\n\n주요 기능:\n- 실시간 경기 중계 시청\n- 채팅 참여\n- 라이브 클립 생성\n\n지금 바로 이용해 보세요!',
  },
  {
    id: '7',
    category: '점검',
    title: '결제 시스템 긴급 점검 완료 안내',
    date: '2026.03.01',
    isNew: false,
    body: '안녕하세요, 포착입니다.\n\n2026년 3월 1일 진행되었던 결제 시스템 긴급 점검이 완료되었습니다.\n현재 모든 결제 기능이 정상 운영되고 있습니다.\n\n이용에 불편을 드려 죄송합니다.',
  },
  {
    id: '8',
    category: '이벤트',
    title: '프로축구 개막전 라이브 무료 시청 이벤트',
    date: '2026.02.25',
    isNew: false,
    body: '안녕하세요, 포착입니다.\n\n2026 프로축구 개막전을 무료로 시청하세요!\n\n- 일시: 2026년 3월 1일 (토) 14:00\n- 대상: 포착 가입 고객 전원\n- 방법: 앱 내 라이브 탭에서 시청\n\n개막전의 열기를 함께 즐겨보세요!',
  },
  {
    id: '9',
    category: '서비스',
    title: '클립 공유 기능 업데이트 안내',
    date: '2026.02.20',
    isNew: false,
    body: '안녕하세요, 포착입니다.\n\n클립 공유 기능이 업데이트되었습니다.\n\n변경 사항:\n- SNS 공유 기능 추가 (카카오톡, 인스타그램)\n- 링크 복사 기능 개선\n- 공유 시 썸네일 미리보기 지원\n\n업데이트 후 이용해 주세요.',
  },
  {
    id: '10',
    category: '점검',
    title: '네트워크 인프라 개선 작업 안내',
    date: '2026.02.15',
    isNew: false,
    body: '안녕하세요, 포착입니다.\n\n보다 안정적인 서비스 제공을 위해 네트워크 인프라 개선 작업이 진행됩니다.\n\n- 작업 일시: 2026년 2월 20일 (금) 03:00 ~ 05:00\n- 영향 범위: 일부 영상 로딩 지연 가능\n\n이용에 참고 부탁드립니다.',
  },
];

const FILTER_TABS: FilterTab[] = ['전체', '서비스', '이벤트', '점검'];

const CATEGORY_COLORS: Record<NoticeCategory, string> = {
  서비스: '#4A90D9',
  이벤트: colors.green,
  점검: '#FF8C00',
};

// ─── Component ───────────────────────────────────────────

export default function NoticesScreen() {
  const navigation = useNavigation();
  const [activeFilter, setActiveFilter] = useState<FilterTab>('전체');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredNotices =
    activeFilter === '전체'
      ? MOCK_NOTICES
      : MOCK_NOTICES.filter(n => n.category === activeFilter);

  const toggleExpand = useCallback(
    (id: string) => {
      setExpandedId(prev => (prev === id ? null : id));
    },
    [],
  );

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
        <Text style={styles.headerTitle}>공지사항</Text>
        <View style={styles.backButton} />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {FILTER_TABS.map(tab => {
          const isActive = activeFilter === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              onPress={() => setActiveFilter(tab)}
              activeOpacity={0.7}>
              <Text
                style={[
                  styles.filterChipText,
                  isActive && styles.filterChipTextActive,
                ]}>
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Notice List */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}>
        {filteredNotices.map(notice => {
          const isExpanded = expandedId === notice.id;
          const catColor = CATEGORY_COLORS[notice.category];

          return (
            <TouchableOpacity
              key={notice.id}
              style={styles.noticeItem}
              onPress={() => toggleExpand(notice.id)}
              activeOpacity={0.7}>
              {/* Notice Header */}
              <View style={styles.noticeHeader}>
                <View style={styles.noticeTopRow}>
                  <View
                    style={[
                      styles.categoryBadge,
                      {backgroundColor: catColor + '22'},
                    ]}>
                    <Text style={[styles.categoryBadgeText, {color: catColor}]}>
                      {notice.category}
                    </Text>
                  </View>
                  {notice.isNew && (
                    <View style={styles.newBadge}>
                      <Text style={styles.newBadgeText}>NEW</Text>
                    </View>
                  )}
                </View>
                <View style={styles.noticeTitleRow}>
                  <Text
                    style={styles.noticeTitle}
                    numberOfLines={isExpanded ? undefined : 2}>
                    {notice.title}
                  </Text>
                  <MaterialIcons
                    name={isExpanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                    size={22}
                    color={colors.gray}
                  />
                </View>
                <Text style={styles.noticeDate}>{notice.date}</Text>
              </View>

              {/* Expanded Body */}
              {isExpanded && (
                <View style={styles.noticeBody}>
                  <Text style={styles.noticeBodyText}>{notice.body}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        {filteredNotices.length === 0 && (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="inbox" size={48} color={colors.grayDark} />
            <Text style={styles.emptyText}>공지사항이 없습니다</Text>
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

  // Filter
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
  },
  filterChipActive: {
    backgroundColor: colors.green,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.gray,
  },
  filterChipTextActive: {
    color: '#000',
    fontWeight: '700',
  },

  // List
  scrollView: {
    flex: 1,
  },
  noticeItem: {
    borderBottomWidth: 0.5,
    borderBottomColor: colors.grayDark,
  },
  noticeHeader: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  noticeTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  newBadge: {
    backgroundColor: colors.error,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.white,
  },
  noticeTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  noticeTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.white,
    lineHeight: 22,
  },
  noticeDate: {
    fontSize: 12,
    color: colors.gray,
    marginTop: 6,
  },

  // Body
  noticeBody: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 4,
    backgroundColor: colors.surface,
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: 8,
  },
  noticeBodyText: {
    fontSize: 14,
    color: colors.grayLight,
    lineHeight: 22,
    paddingTop: 12,
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
