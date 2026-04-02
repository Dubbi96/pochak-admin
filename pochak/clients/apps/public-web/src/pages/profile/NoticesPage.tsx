import { useState } from 'react';
import { ChevronDown, ChevronUp, Pin } from 'lucide-react';
import { SubTabChips } from './shared';

/* ── Types ────────────────────────────────────────────────────── */
type NoticeCategory = '서비스' | '이벤트' | '점검';
type FilterKey = '전체' | NoticeCategory;

interface Notice {
  id: string;
  category: NoticeCategory;
  title: string;
  date: string;
  isPinned?: boolean;
  isNew?: boolean;
  body: string;
}

/* ── Mock data ────────────────────────────────────────────────── */
const notices: Notice[] = [
  { id: '1', category: '서비스', title: '포착 3.0 업데이트 안내', date: '2026.01.20', isPinned: true, isNew: true, body: '포착 서비스가 3.0으로 업데이트 되었습니다. 새로운 기능으로는 AI 하이라이트 자동 생성, 다중 카메라 앵글 전환, 실시간 채팅 기능이 추가되었습니다. 업데이트 후 앱을 재실행 해주세요.' },
  { id: '2', category: '이벤트', title: '신규가입 이벤트 - 무료 시청권 증정', date: '2026.01.18', isNew: true, body: '지금 가입하시면 7일 무료 시청권을 드립니다. 이벤트 기간: 2026.01.15 ~ 2026.02.15. 가입 후 마이페이지에서 시청권을 확인하세요.' },
  { id: '3', category: '점검', title: '1/25(토) 서버 정기 점검 안내', date: '2026.01.15', body: '서비스 안정화를 위한 정기 점검이 진행됩니다. 점검 시간: 2026.01.25 04:00 ~ 08:00 (4시간). 점검 중에는 서비스 이용이 불가합니다.' },
  { id: '4', category: '서비스', title: '클립 공유 기능 개선 안내', date: '2026.01.12', body: '클립 공유 기능이 개선되었습니다. 이제 SNS 공유 시 미리보기 이미지가 자동으로 생성됩니다. 카카오톡, 인스타그램 스토리 공유도 지원합니다.' },
  { id: '5', category: '이벤트', title: '겨울 시즌 구독 할인 프로모션', date: '2026.01.10', body: '겨울 시즌을 맞아 연간 구독 30% 할인 프로모션을 진행합니다. 이벤트 기간: 2026.01.10 ~ 2026.01.31. 마이페이지 > 구독관리에서 신청하세요.' },
  { id: '6', category: '서비스', title: '개인정보 처리방침 변경 안내', date: '2026.01.08', body: '개인정보 처리방침이 일부 변경되었습니다. 주요 변경 사항: 제3자 제공 항목 추가, 보유 기간 변경. 변경일: 2026.02.01부터 적용됩니다.' },
  { id: '7', category: '점검', title: '결제 시스템 긴급 점검 완료', date: '2026.01.05', body: '1월 5일 진행된 결제 시스템 긴급 점검이 완료되었습니다. 이용에 불편을 드려 죄송합니다. 현재 모든 결제 기능이 정상 운영 중입니다.' },
  { id: '8', category: '이벤트', title: '포착 시티 오픈 기념 이벤트', date: '2026.01.03', body: '포착 시티 서비스가 오픈되었습니다! 오픈 기념으로 시티 콘텐츠 1개월 무료 시청권을 증정합니다. 이벤트 참여는 앱 내 배너를 통해 가능합니다.' },
  { id: '9', category: '서비스', title: '모바일 앱 v2.8 업데이트 안내', date: '2025.12.28', body: 'iOS/Android 앱이 v2.8로 업데이트 되었습니다. 주요 개선사항: 영상 로딩 속도 30% 개선, PIP 모드 지원, 다크 모드 최적화.' },
  { id: '10', category: '점검', title: '12/30(월) CDN 서버 점검 안내', date: '2025.12.25', body: '영상 스트리밍 품질 향상을 위해 CDN 서버 점검을 진행합니다. 점검 시간: 2025.12.30 02:00 ~ 06:00. 점검 중 영상 재생이 불안정할 수 있습니다.' },
];

/* ── Badge color map ──────────────────────────────────────────── */
const categoryColor: Record<NoticeCategory, string> = {
  '서비스': 'bg-[#1565C0]',
  '이벤트': 'bg-[#00CC33]',
  '점검': 'bg-[#FF6D00]',
};

/* ── Filter tabs ──────────────────────────────────────────────── */
const filterTabs: { key: FilterKey; label: string }[] = [
  { key: '전체', label: '전체' },
  { key: '서비스', label: '서비스' },
  { key: '이벤트', label: '이벤트' },
  { key: '점검', label: '점검' },
];

/* ── Component ────────────────────────────────────────────────── */
export default function NoticesPage() {
  const [activeCategory, setActiveCategory] = useState<FilterKey>('전체');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered =
    activeCategory === '전체'
      ? notices
      : notices.filter((n) => n.category === activeCategory);

  // Pinned notices first, then by date (already sorted in mock data)
  const sorted = [...filtered].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0;
  });

  const toggle = (id: string) =>
    setExpandedId((prev) => (prev === id ? null : id));

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">공지사항</h1>

      <SubTabChips tabs={filterTabs} active={activeCategory} onChange={setActiveCategory} />

      {/* Notice list */}
      <div className="flex flex-col divide-y divide-[#4D4D4D]">
        {sorted.map((notice) => {
          const isExpanded = expandedId === notice.id;
          return (
            <div key={notice.id} className="py-4">
              <button
                onClick={() => toggle(notice.id)}
                className="w-full flex items-center gap-3 text-left group"
              >
                {/* Pinned icon */}
                {notice.isPinned && (
                  <Pin className="h-4 w-4 text-[#00CC33] shrink-0 rotate-45" />
                )}

                {/* Category badge */}
                <span
                  className={`shrink-0 px-2 py-0.5 rounded text-[11px] font-semibold text-white ${categoryColor[notice.category]}`}
                >
                  {notice.category}
                </span>

                {/* Title */}
                <span className="flex-1 text-[15px] text-white group-hover:text-[#00CC33] transition-colors truncate">
                  {notice.title}
                </span>

                {/* NEW badge */}
                {notice.isNew && (
                  <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#FF3333] text-white">
                    NEW
                  </span>
                )}

                {/* Date */}
                <span className="shrink-0 text-[13px] text-[#A6A6A6] min-w-[80px] text-right">
                  {notice.date}
                </span>

                {/* Chevron */}
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-[#A6A6A6] shrink-0" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-[#A6A6A6] shrink-0" />
                )}
              </button>

              {/* Expanded body */}
              {isExpanded && (
                <div className="mt-3 ml-[68px] mr-8 p-4 bg-[#262626] rounded-lg text-[14px] text-[#A6A6A6] leading-relaxed">
                  {notice.body}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {sorted.length === 0 && (
        <p className="text-center text-[#A6A6A6] py-12">해당 카테고리의 공지사항이 없습니다.</p>
      )}
    </div>
  );
}
