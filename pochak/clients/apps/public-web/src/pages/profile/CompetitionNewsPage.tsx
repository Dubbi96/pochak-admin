import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy } from 'lucide-react';
import { SubTabChips } from './shared';

/* ── Mock data ─────────────────────────────────────────────────── */
const newsItems = [
  { id: 'n1', title: '제6회 MLB컵 전국리틀야구대회 참가팀 확정', competition: '제6회 MLB컵', sport: '야구', date: '2026.01.15', isNew: true },
  { id: 'n2', title: '2026 화랑대기 유소년축구 일정 공개', competition: '화랑대기', sport: '축구', date: '2026.01.12', isNew: true },
  { id: 'n3', title: '제12회 KBO 꿈나무 야구대회 접수 시작', competition: 'KBO 꿈나무', sport: '야구', date: '2026.01.10', isNew: true },
  { id: 'n4', title: '전국 유소년 풋살대회 대진표 발표', competition: '유소년 풋살컵', sport: '풋살', date: '2026.01.08', isNew: false },
  { id: 'n5', title: '2026 춘계 전국중학야구대회 개최 확정', competition: '춘계 전국중학야구', sport: '야구', date: '2026.01.05', isNew: false },
  { id: 'n6', title: '제3회 포착컵 유소년 축구 페스티벌 참가 모집', competition: '포착컵', sport: '축구', date: '2026.01.03', isNew: false },
  { id: 'n7', title: '동계 전국초등학교 야구대회 우승팀 인터뷰', competition: '동계 전국초등야구', sport: '야구', date: '2025.12.28', isNew: false },
  { id: 'n8', title: '2025 윈터리그 유소년 축구 결과 요약', competition: '윈터리그', sport: '축구', date: '2025.12.22', isNew: false },
  { id: 'n9', title: '제5회 드림파크배 전국 리틀야구 챔피언십 후기', competition: '드림파크배', sport: '야구', date: '2025.12.18', isNew: false },
  { id: 'n10', title: '2025 송년 풋살 페스티벌 하이라이트 공개', competition: '송년 풋살 페스티벌', sport: '풋살', date: '2025.12.15', isNew: false },
];

/* ── Sport tag color helper ────────────────────────────────────── */
function sportColor(sport: string) {
  switch (sport) {
    case '야구': return 'bg-blue-600/20 text-blue-400';
    case '축구': return 'bg-green-600/20 text-green-400';
    case '풋살': return 'bg-orange-600/20 text-orange-400';
    default: return 'bg-[#4D4D4D] text-[#A6A6A6]';
  }
}

/* ── Banner gradient helper ────────────────────────────────────── */
function bannerGradient(sport: string) {
  switch (sport) {
    case '야구': return 'from-blue-900 to-blue-700';
    case '축구': return 'from-green-900 to-green-700';
    case '풋살': return 'from-orange-900 to-orange-700';
    default: return 'from-[#333] to-[#555]';
  }
}

type TabKey = 'all' | 'participating' | 'bookmarked';

export default function CompetitionNewsPage() {
  const [tab, setTab] = useState<TabKey>('all');
  const navigate = useNavigate();

  const filtered = (() => {
    if (tab === 'participating') return newsItems.filter((_, i) => i % 3 === 0);
    if (tab === 'bookmarked') return newsItems.filter((_, i) => i % 2 === 0);
    return newsItems;
  })();

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">대회소식</h1>

      <SubTabChips
        tabs={[
          { key: 'all' as const, label: '전체' },
          { key: 'participating' as const, label: '참가대회' },
          { key: 'bookmarked' as const, label: '즐겨찾기 대회' },
        ]}
        active={tab}
        onChange={setTab}
      />

      <div className="flex flex-col gap-3">
        {filtered.map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(`/tv/competition/${item.id}`)}
            className="flex items-stretch bg-[#262626] rounded-xl hover:bg-[#333] transition-colors text-left overflow-hidden"
          >
            {/* Banner thumbnail */}
            <div
              className={`w-[120px] min-h-[90px] flex-shrink-0 bg-gradient-to-br ${bannerGradient(item.sport)} flex items-center justify-center`}
            >
              <Trophy className="h-8 w-8 text-white/60" />
            </div>

            {/* Content */}
            <div className="flex-1 px-4 py-3 min-w-0 flex flex-col justify-center gap-1">
              <div className="flex items-center gap-2">
                <span className="text-[15px] font-semibold text-white truncate">{item.title}</span>
                {item.isNew && (
                  <span className="flex-shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#00CC33] text-[#1A1A1A]">
                    NEW
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-[13px] text-[#A6A6A6]">
                <span>{item.competition}</span>
                <span>·</span>
                <span>{item.date}</span>
              </div>
              <div className="mt-0.5">
                <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-medium ${sportColor(item.sport)}`}>
                  {item.sport}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
