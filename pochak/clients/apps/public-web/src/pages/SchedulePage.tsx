import { useState, useMemo, useEffect } from 'react';
import { Play, Bell, MoreHorizontal } from 'lucide-react';
import MonthSelector from '@/components/MonthSelector';
import TeamLogo from '@/components/TeamLogo';
import HScrollRow from '@/components/HScrollRow';
import {
  fetchCompetitions,
  type CompetitionCard,
} from '@/services/webApi';

/* ── Types ──────────────────────────────────────────────────────────────────── */

type SportTab = '이달의대회' | '#축구' | '#야구' | '#배구' | '#핸드볼' | '#농구' | '#기타';

const sportTabs: { key: SportTab; label: string }[] = [
  { key: '이달의대회', label: '이달의대회' },
  { key: '#축구', label: '#축구' },
  { key: '#야구', label: '#야구' },
  { key: '#배구', label: '#배구' },
  { key: '#핸드볼', label: '#핸드볼' },
  { key: '#농구', label: '#농구' },
  { key: '#기타', label: '#기타' },
];

function sportFromTab(tab: SportTab): string | null {
  if (tab === '이달의대회') return null;
  return tab.replace('#', '');
}

/* ── Extended mock data ─────────────────────────────────────────────────────── */

const localExtraCompetitions = [
  {
    id: 'comp-6',
    name: '제6회 MLB컵 전국리틀야구대회 U10',
    subtitle: '리틀야구',
    sport: '야구',
    dateRange: '2026. 01/01 ~ 02/01',
    logoColor: '#1565C0',
    logoText: 'MLB',
    isAd: false,
  },
  {
    id: 'comp-7',
    name: '2026 전국유소년축구 챔피언십',
    subtitle: '유소년축구',
    sport: '축구',
    dateRange: '2026. 01/10 ~ 01/25',
    logoColor: '#E53935',
    logoText: 'KFA',
    isAd: false,
  },
  {
    id: 'comp-8',
    name: '제12회 교육감배 중등배구',
    subtitle: '중등배구',
    sport: '배구',
    dateRange: '2026. 01/05 ~ 01/20',
    logoColor: '#FF6D00',
    logoText: 'KVA',
    isAd: false,
  },
  {
    id: 'comp-9',
    name: '2026 핸드볼 주니어리그',
    subtitle: '주니어핸드볼',
    sport: '핸드볼',
    dateRange: '2026. 01/15 ~ 02/15',
    logoColor: '#7B1FA2',
    logoText: 'KHA',
    isAd: false,
  },
  {
    id: 'comp-10',
    name: '겨울 농구 페스티벌 2026',
    subtitle: '유소년농구',
    sport: '농구',
    dateRange: '2026. 01/08 ~ 01/22',
    logoColor: '#FF9800',
    logoText: 'KBL',
    isAd: false,
  },
  {
    id: 'comp-11',
    name: '2026 전국체전 예선',
    subtitle: '종합체육',
    sport: '전체',
    dateRange: '2026. 01/12 ~ 01/30',
    logoColor: '#00897B',
    logoText: 'KSA',
    isAd: false,
  },
  {
    id: 'comp-12',
    name: '나이키 에어맥스 윈터컵',
    subtitle: '풋살대회',
    sport: '풋살',
    dateRange: '2026. 01/18 ~ 01/20',
    logoColor: '#000000',
    logoText: 'NK',
    isAd: true,
  },
  {
    id: 'comp-13',
    name: '제3회 서울시장배 유소년축구',
    subtitle: '유소년축구',
    sport: '축구',
    dateRange: '2026. 01/03 ~ 01/15',
    logoColor: '#1976D2',
    logoText: 'SFA',
    isAd: false,
  },
  {
    id: 'comp-14',
    name: '2026 KBO 주니어 리틀야구',
    subtitle: '리틀야구',
    sport: '야구',
    dateRange: '2026. 02/01 ~ 02/15',
    logoColor: '#388E3C',
    logoText: 'KBO',
    isAd: false,
  },
  {
    id: 'comp-15',
    name: '전국 중등학교 농구대회',
    subtitle: '중등농구',
    sport: '농구',
    dateRange: '2026. 01/20 ~ 02/05',
    logoColor: '#E53935',
    logoText: 'KBF',
    isAd: false,
  },
  {
    id: 'comp-16',
    name: '2026 윈터 배구 챌린지',
    subtitle: '유소년배구',
    sport: '배구',
    dateRange: '2026. 01/25 ~ 02/10',
    logoColor: '#4CAF50',
    logoText: 'VBC',
    isAd: false,
  },
  {
    id: 'comp-17',
    name: '제8회 전국 핸드볼 꿈나무대회',
    subtitle: '유소년핸드볼',
    sport: '핸드볼',
    dateRange: '2026. 01/06 ~ 01/18',
    logoColor: '#0D47A1',
    logoText: 'HBA',
    isAd: false,
  },
];

/** Hardcoded matches for schedule data */
const extendedMatches = [
  // 야구 matches
  {
    id: 'bb-1', date: '2026-01-01', time: '10:00',
    homeTeam: '동대문구 리틀야구', homeTeamShort: '동대문', homeTeamColor: '#1565C0',
    awayTeam: '군포시 리틀야구', awayTeamShort: '군포', awayTeamColor: '#E53935',
    competition: '제6회 MLB컵 전국리틀야구대회 U10', competitionBadge: 'MLB',
    sport: '야구' as const, status: '종료' as const, score: '5 : 2', tags: ['야구', '유료', '해설'],
  },
  {
    id: 'bb-2', date: '2026-01-01', time: '13:00',
    homeTeam: '인천리틀스타', homeTeamShort: '인천', homeTeamColor: '#FF9800',
    awayTeam: '수원이글스Jr', awayTeamShort: '수원', awayTeamColor: '#388E3C',
    competition: '제6회 MLB컵 전국리틀야구대회 U10', competitionBadge: 'MLB',
    sport: '야구' as const, status: '종료' as const, score: '3 : 4', tags: ['야구', '유료', '해설'],
  },
  {
    id: 'bb-3', date: '2026-01-01', time: '15:30',
    homeTeam: '부산사직주니어', homeTeamShort: '부산', homeTeamColor: '#F44336',
    awayTeam: '대전한밭리틀', awayTeamShort: '대전', awayTeamColor: '#00897B',
    competition: '제6회 MLB컵 전국리틀야구대회 U10', competitionBadge: 'MLB',
    sport: '야구' as const, status: 'LIVE' as const, tags: ['야구', '유료', '해설'],
  },
  {
    id: 'bb-4', date: '2026-01-02', time: '10:00',
    homeTeam: '서울강남리틀', homeTeamShort: '강남', homeTeamColor: '#4CAF50',
    awayTeam: '경기용인리틀', awayTeamShort: '용인', awayTeamColor: '#1976D2',
    competition: '제6회 MLB컵 전국리틀야구대회 U10', competitionBadge: 'MLB',
    sport: '야구' as const, status: '예정' as const, tags: ['야구', '유료'],
  },
  {
    id: 'bb-5', date: '2026-01-02', time: '13:00',
    homeTeam: '광주북구리틀', homeTeamShort: '광주', homeTeamColor: '#7B1FA2',
    awayTeam: '울산남구리틀', awayTeamShort: '울산', awayTeamColor: '#FF6D00',
    competition: '제6회 MLB컵 전국리틀야구대회 U10', competitionBadge: 'MLB',
    sport: '야구' as const, status: '예정' as const, tags: ['야구', '유료'],
  },
  {
    id: 'bb-6', date: '2026-01-02', time: '15:30',
    homeTeam: '창원마산리틀', homeTeamShort: '창원', homeTeamColor: '#0D47A1',
    awayTeam: '제주서귀포리틀', awayTeamShort: '제주', awayTeamColor: '#FF9800',
    competition: '제6회 MLB컵 전국리틀야구대회 U10', competitionBadge: 'MLB',
    sport: '야구' as const, status: '예정' as const, tags: ['야구', '유료'],
  },
  // 축구 matches
  {
    id: 'fc-1', date: '2026-01-10', time: '10:00',
    homeTeam: '경기용인YSFC', homeTeamShort: '용인', homeTeamColor: '#4CAF50',
    awayTeam: '대구강북주니어', awayTeamShort: '대구', awayTeamColor: '#E53935',
    competition: '2026 전국유소년축구 챔피언십', competitionBadge: 'KFA',
    sport: '축구' as const, status: '종료' as const, score: '3 : 1', tags: ['축구', '무료LIVE'],
  },
  {
    id: 'fc-2', date: '2026-01-10', time: '12:00',
    homeTeam: '인천남동FC', homeTeamShort: '인천', homeTeamColor: '#0D47A1',
    awayTeam: '서울강남FC', awayTeamShort: '강남', awayTeamColor: '#4CAF50',
    competition: '2026 전국유소년축구 챔피언십', competitionBadge: 'KFA',
    sport: '축구' as const, status: 'LIVE' as const, tags: ['축구', '무료LIVE'],
  },
  {
    id: 'fc-3', date: '2026-01-10', time: '14:00',
    homeTeam: '부산서면유소년', homeTeamShort: '부산', homeTeamColor: '#F44336',
    awayTeam: '울산울브스FC', awayTeamShort: '울산', awayTeamColor: '#FF9800',
    competition: '2026 전국유소년축구 챔피언십', competitionBadge: 'KFA',
    sport: '축구' as const, status: '예정' as const, tags: ['축구', '무료LIVE'],
  },
  // 배구 matches
  {
    id: 'vb-1', date: '2026-01-05', time: '10:00',
    homeTeam: '서울중학교', homeTeamShort: '서울', homeTeamColor: '#1565C0',
    awayTeam: '부산중학교', awayTeamShort: '부산', awayTeamColor: '#E53935',
    competition: '제12회 교육감배 중등배구', competitionBadge: 'KVA',
    sport: '배구' as const, status: '종료' as const, score: '3 : 1', tags: ['배구', '무료'],
  },
  {
    id: 'vb-2', date: '2026-01-05', time: '13:00',
    homeTeam: '대구중학교', homeTeamShort: '대구', homeTeamColor: '#FF6D00',
    awayTeam: '인천중학교', awayTeamShort: '인천', awayTeamColor: '#0D47A1',
    competition: '제12회 교육감배 중등배구', competitionBadge: 'KVA',
    sport: '배구' as const, status: 'LIVE' as const, tags: ['배구', '무료'],
  },
  {
    id: 'vb-3', date: '2026-01-05', time: '15:00',
    homeTeam: '광주중학교', homeTeamShort: '광주', homeTeamColor: '#7B1FA2',
    awayTeam: '대전중학교', awayTeamShort: '대전', awayTeamColor: '#00897B',
    competition: '제12회 교육감배 중등배구', competitionBadge: 'KVA',
    sport: '배구' as const, status: '예정' as const, tags: ['배구', '무료'],
  },
  // 핸드볼 matches
  {
    id: 'hb-1', date: '2026-01-15', time: '11:00',
    homeTeam: '서울한양주니어', homeTeamShort: '서울', homeTeamColor: '#1565C0',
    awayTeam: '경기수원주니어', awayTeamShort: '수원', awayTeamColor: '#388E3C',
    competition: '2026 핸드볼 주니어리그', competitionBadge: 'KHA',
    sport: '핸드볼' as const, status: '종료' as const, score: '28 : 25', tags: ['핸드볼', '무료'],
  },
  {
    id: 'hb-2', date: '2026-01-15', time: '14:00',
    homeTeam: '부산동래주니어', homeTeamShort: '부산', homeTeamColor: '#F44336',
    awayTeam: '대전충남주니어', awayTeamShort: '대전', awayTeamColor: '#00897B',
    competition: '2026 핸드볼 주니어리그', competitionBadge: 'KHA',
    sport: '핸드볼' as const, status: 'LIVE' as const, tags: ['핸드볼', '무료'],
  },
  {
    id: 'hb-3', date: '2026-01-15', time: '16:00',
    homeTeam: '인천남동주니어', homeTeamShort: '인천', homeTeamColor: '#0D47A1',
    awayTeam: '광주전남주니어', awayTeamShort: '광주', awayTeamColor: '#7B1FA2',
    competition: '2026 핸드볼 주니어리그', competitionBadge: 'KHA',
    sport: '핸드볼' as const, status: '예정' as const, tags: ['핸드볼', '무료'],
  },
  // 농구 matches
  {
    id: 'bk-1', date: '2026-01-08', time: '10:00',
    homeTeam: '서울강남중', homeTeamShort: '강남', homeTeamColor: '#4CAF50',
    awayTeam: '부산해운대중', awayTeamShort: '부산', awayTeamColor: '#E53935',
    competition: '겨울 농구 페스티벌 2026', competitionBadge: 'KBL',
    sport: '농구' as const, status: '종료' as const, score: '78 : 65', tags: ['농구', '무료'],
  },
  {
    id: 'bk-2', date: '2026-01-08', time: '13:00',
    homeTeam: '대구달서중', homeTeamShort: '대구', homeTeamColor: '#FF6D00',
    awayTeam: '인천연수중', awayTeamShort: '인천', awayTeamColor: '#0D47A1',
    competition: '겨울 농구 페스티벌 2026', competitionBadge: 'KBL',
    sport: '농구' as const, status: 'LIVE' as const, tags: ['농구', '무료'],
  },
  {
    id: 'bk-3', date: '2026-01-08', time: '15:00',
    homeTeam: '광주서구중', homeTeamShort: '광주', homeTeamColor: '#7B1FA2',
    awayTeam: '울산남구중', awayTeamShort: '울산', awayTeamColor: '#FF9800',
    competition: '겨울 농구 페스티벌 2026', competitionBadge: 'KBL',
    sport: '농구' as const, status: '예정' as const, tags: ['농구', '무료'],
  },
];

const venues = [
  '화성드림파크야구장 (1구장)',
  '인천문학경기장',
  '수원월드컵경기장',
  '서울올림픽체조경기장',
  '부산사직실내체육관',
  '대전한밭종합운동장',
  '광주월드컵경기장',
  '대구스타디움',
];

const matchResults: Record<string, string> = {
  'bb-1': '준결승 | 승부치기(3-2)',
  'bb-2': '8강 | 정규이닝',
  'fc-1': '4강 | 연장전',
  'vb-1': '결승 | 3세트',
  'hb-1': '준결승 | 정규',
  'bk-1': '8강 | 정규',
};

/* ── Day of week helper ─────────────────────────────────────────────────────── */

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];
function formatDateHeader(dateStr: string): string {
  const d = new Date(dateStr);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const day = DAY_NAMES[d.getDay()];
  return `${yyyy}.${mm}.${dd} (${day})`;
}

/* ── Count events per month ─────────────────────────────────────────────────── */

function eventCountsByMonth(
  matches: typeof extendedMatches,
  year: number,
): Map<number, number> {
  const map = new Map<number, number>();
  const dateSeen = new Set<string>();
  for (const m of matches) {
    const d = new Date(m.date);
    if (d.getFullYear() !== year) continue;
    const key = `${d.getMonth() + 1}-${d.getDate()}`;
    if (dateSeen.has(key)) continue;
    dateSeen.add(key);
    const month = d.getMonth() + 1;
    map.set(month, (map.get(month) ?? 0) + 1);
  }
  return map;
}

/* ── Tab Bar ────────────────────────────────────────────────────────────────── */

function ScheduleTabBar({
  activeTab,
  onTabChange,
}: {
  activeTab: SportTab;
  onTabChange: (tab: SportTab) => void;
}) {
  return (
    <div className="flex items-center gap-0 border-b border-[#4D4D4D] overflow-x-auto scrollbar-hide">
      {sportTabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`flex-shrink-0 px-5 py-3 text-[15px] font-bold transition-colors relative ${
              isActive
                ? 'text-white'
                : 'text-[#A6A6A6] hover:text-white'
            }`}
          >
            {tab.label}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-white" />
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ── Competition Card (Grid) ────────────────────────────────────────────────── */

function CompetitionCard({ comp }: { comp: (typeof localExtraCompetitions)[number] }) {
  const yearMatch = comp.dateRange.match(/\d{4}/);
  const yearStr = yearMatch ? yearMatch[0] : '2026';
  const dateOnly = comp.dateRange
    .replace(/\d{4}\.\s*/, '')
    .replace(/\//g, '.');

  return (
    <div className="flex flex-col">
      {/* Card image area */}
      <div
        className="w-full aspect-[4/5] rounded-xl flex flex-col items-center justify-center relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${comp.logoColor}cc, ${comp.logoColor}88)`,
        }}
      >
        <span className="text-white text-2xl font-black tracking-wide opacity-90">
          {comp.logoText}
        </span>
        <p className="text-white/80 text-[11px] font-medium mt-2 text-center px-3 leading-snug">
          {comp.name}
        </p>
        <div className="absolute bottom-3 flex flex-col items-center">
          <span className="text-white/90 text-[10px] font-medium">{dateOnly}</span>
          <span className="text-white/60 text-[10px]">{yearStr}</span>
        </div>
      </div>

      {/* Card info below */}
      <div className="mt-2 flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="text-[13px] font-bold text-white leading-tight truncate">
            {comp.name}
          </h3>
          <p className="text-[11px] text-[#A6A6A6] mt-0.5">
            {yearStr} | {dateOnly}
          </p>
          <p className="text-[11px] text-[#A6A6A6] mt-0.5">
            {comp.sport} | {comp.isAd ? '유료' : '무료'} | 해설
          </p>
        </div>
        <button className="text-[#A6A6A6] hover:text-white mt-0.5 flex-shrink-0">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/* ── Competition Carousel (Sport tab) ───────────────────────────────────────── */

function CompetitionCarousel({
  competitions,
  selectedId,
  onSelect,
}: {
  competitions: typeof localExtraCompetitions;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  if (competitions.length === 0) return null;

  return (
    <div className="px-6 py-4">
      <HScrollRow scrollAmount={250}>
        {competitions.map((comp) => {
          const isSelected = selectedId === comp.id;
          const dateOnly = comp.dateRange
            .replace(/\d{4}\.\s*/, '')
            .replace(/\//g, '.');
          return (
            <button
              key={comp.id}
              onClick={() => onSelect(comp.id)}
              className={`flex-shrink-0 rounded-lg border px-4 py-3 text-left min-w-[220px] transition-colors ${
                isSelected
                  ? 'border-[#00CC33] bg-[#00CC33]/10'
                  : 'border-[#4D4D4D] bg-[#262626] hover:border-[#A6A6A6]'
              }`}
            >
              <p
                className={`text-[13px] font-bold leading-tight ${
                  isSelected ? 'text-[#00CC33]' : 'text-white'
                }`}
              >
                {comp.name}
              </p>
              <p className="text-[11px] text-[#A6A6A6] mt-1">{dateOnly}</p>
            </button>
          );
        })}
      </HScrollRow>
      {/* Dot indicators */}
      <div className="flex justify-center gap-1 mt-3">
        {competitions.map((comp) => (
          <span
            key={comp.id}
            className={`w-1.5 h-1.5 rounded-full transition-colors ${
              selectedId === comp.id ? 'bg-[#00CC33]' : 'bg-[#4D4D4D]'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

/* ── Match Row ──────────────────────────────────────────────────────────────── */

function MatchRow({ match }: { match: (typeof extendedMatches)[number] }) {
  const isLive = match.status === 'LIVE';
  const isDone = match.status === '종료';
  const hasScore = !!match.score;
  const [homeScore, awayScore] = hasScore
    ? match.score!.split(':').map((s) => s.trim())
    : ['-', '-'];

  const venueIdx = Math.abs(match.id.charCodeAt(match.id.length - 1)) % venues.length;
  const venue = venues[venueIdx];
  const result = matchResults[match.id];

  const timeColor = isLive ? 'text-[#00CC33]' : 'text-white';
  const scoreColor = isLive ? 'text-[#00CC33]' : 'text-white';
  const venueColor = isLive ? 'text-[#00CC33]' : 'text-[#A6A6A6]';

  return (
    <div className="flex items-center px-4 py-3 border-b border-[#333] last:border-b-0 hover:bg-[#2a2a2a] transition-colors">
      {/* Left: time + result (stacked) — fixed width to balance right side */}
      <div className="w-[170px] flex-shrink-0">
        <p className={`text-[14px] font-bold ${timeColor}`}>{match.time}</p>
        {result && (
          <p className="text-[11px] text-[#A6A6A6] mt-0.5 hidden lg:block">{result}</p>
        )}
      </div>

      {/* Center: home + score + away — symmetric between left/right */}
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center">
          <div className="flex items-center gap-2 w-[180px] justify-end">
            <span className="text-[13px] font-semibold text-white truncate">
              {match.homeTeam}
            </span>
            <TeamLogo color={match.homeTeamColor} short={match.homeTeamShort} size="sm" />
          </div>

          <div className="w-[90px] text-center">
            <span className={`text-[18px] font-bold ${scoreColor}`}>
              {homeScore} : {awayScore}
            </span>
          </div>

          <div className="flex items-center gap-2 w-[180px]">
            <TeamLogo color={match.awayTeamColor} short={match.awayTeamShort} size="sm" />
            <span className="text-[13px] font-semibold text-white truncate">
              {match.awayTeam}
            </span>
          </div>
        </div>
      </div>

      {/* Right: venue + button — fixed width to match left */}
      <div className="w-[170px] flex-shrink-0 flex items-center justify-end gap-3">
        <span className={`text-[11px] ${venueColor} hidden md:block truncate max-w-[80px] text-right`}>{venue}</span>
        <div className="flex-shrink-0">
          {isDone ? (
            <button className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-[#333] text-white text-[12px] font-semibold hover:bg-[#444] transition-colors">
              <Play className="h-3.5 w-3.5 fill-current" />
              다시보기
            </button>
          ) : isLive ? (
            <button className="flex items-center gap-1 px-3 py-1.5 rounded-md border border-[#00CC33] text-[#00CC33] text-[12px] font-semibold hover:bg-[#00CC33]/10 transition-colors">
              <Play className="h-3.5 w-3.5 fill-[#00CC33]" />
              시청하기
            </button>
          ) : (
            <button className="flex items-center gap-1 px-3 py-1.5 rounded-md border border-[#4D4D4D] text-[#A6A6A6] text-[12px] font-semibold hover:border-white hover:text-white transition-colors">
              <Bell className="h-3.5 w-3.5" />
              시청예약
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ──────────────────────────────────────────────────────────────── */

export default function SchedulePage() {
  const [activeTab, setActiveTab] = useState<SportTab>('이달의대회');
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(1);
  const [selectedCompetition, setSelectedCompetition] = useState<string | null>(null);
  const [apiCompetitions, setApiCompetitions] = useState<CompetitionCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompetitions()
      .then((data) => { if (data) setApiCompetitions(data); })
      .finally(() => setLoading(false));
  }, []);

  const extendedCompetitions = useMemo(
    () => [...(apiCompetitions as typeof localExtraCompetitions), ...localExtraCompetitions],
    [apiCompetitions],
  );

  const allMatches = useMemo(() => {
    const uniqueIds = new Set<string>();
    return extendedMatches.filter((m) => {
      if (uniqueIds.has(m.id)) return false;
      uniqueIds.add(m.id);
      return true;
    });
  }, []);

  const eventCounts = useMemo(
    () => eventCountsByMonth(allMatches, year),
    [allMatches, year],
  );

  const isCompetitionsTab = activeTab === '이달의대회';
  const sportFilter = sportFromTab(activeTab);

  /* Filtered competitions for the selected sport */
  const sportCompetitions = useMemo(() => {
    if (isCompetitionsTab) return [];
    return extendedCompetitions.filter(
      (c) => !sportFilter || c.sport === sportFilter,
    );
  }, [sportFilter, isCompetitionsTab]);

  /* Filtered matches */
  const filteredMatches = useMemo(() => {
    if (isCompetitionsTab) return [];
    return allMatches
      .filter((m) => {
        const d = new Date(m.date);
        const matchesMonth = d.getFullYear() === year && d.getMonth() + 1 === month;
        const matchesSport = !sportFilter || m.sport === sportFilter;
        const matchesComp =
          !selectedCompetition ||
          extendedCompetitions.find((c) => c.id === selectedCompetition)?.name === m.competition;
        return matchesMonth && matchesSport && matchesComp;
      })
      .sort(
        (a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time),
      );
  }, [allMatches, year, month, sportFilter, selectedCompetition, isCompetitionsTab]);

  /* Group matches by date */
  const matchesByDate = useMemo(() => {
    const groups: Record<string, typeof filteredMatches> = {};
    for (const m of filteredMatches) {
      if (!groups[m.date]) groups[m.date] = [];
      groups[m.date].push(m);
    }
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredMatches]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-[#A6A6A6]">
        <p className="text-base">불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="py-6">
      {/* Tab bar */}
      <div className="px-6">
        <ScheduleTabBar
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            setSelectedCompetition(null);
          }}
        />
      </div>

      {/* Year + Month selector */}
      <div className="flex justify-center mt-5 px-6">
        <MonthSelector
          year={year}
          month={month}
          onYearChange={setYear}
          onMonthChange={setMonth}
          eventCounts={eventCounts}
        />
      </div>

      {isCompetitionsTab ? (
        /* ── 이달의대회: 3-col grid ── */
        <div className="mt-6 px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {extendedCompetitions.map((comp) => (
              <CompetitionCard key={comp.id} comp={comp} />
            ))}
          </div>
        </div>
      ) : (
        /* ── Sport tab: carousel + match list ── */
        <div className="mt-4">
          {/* Competition carousel */}
          <CompetitionCarousel
            competitions={sportCompetitions}
            selectedId={selectedCompetition}
            onSelect={(id) =>
              setSelectedCompetition(selectedCompetition === id ? null : id)
            }
          />

          {/* Match list grouped by date */}
          {matchesByDate.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-[#A6A6A6]">
              <p className="text-[15px]">해당 기간에 일정이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-0 mt-2">
              {matchesByDate.map(([date, matches]) => (
                <div key={date}>
                  {/* Date header bar */}
                  <div className="bg-[#262626] py-2.5 px-6 border-y border-[#333]">
                    <span className="text-[13px] font-bold text-white">
                      {formatDateHeader(date)}
                    </span>
                  </div>
                  {/* Match rows */}
                  <div className="bg-[#1A1A1A]">
                    {matches.map((match) => (
                      <MatchRow key={match.id} match={match} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
