import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Users, ChevronRight, Flame } from 'lucide-react';
import HScrollRow from '@/components/HScrollRow';
import { pochakChannels } from '@/services/webApi';

const SPORTS = ['전체', '축구', '야구', '농구', '배구', '풋살'];

const TONE_COLORS = [
  'rgba(19,69,201,0.35)',
  'rgba(16,185,92,0.24)',
  'rgba(255,139,0,0.24)',
  'rgba(201,19,19,0.3)',
  'rgba(139,19,201,0.3)',
  'rgba(19,181,201,0.25)',
];

function ClubFeatureCard({ club, tone }: { club: typeof pochakChannels[number]; tone: string }) {
  return (
    <Link
      to={`/club/${club.id}`}
      className="block rounded-xl overflow-hidden border border-white/[0.08] hover:border-white/[0.2] transition-all duration-200 hover:shadow-[0_14px_36px_rgba(0,0,0,0.55)] group"
    >
      <div className="relative h-[120px] overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(160deg, ${tone}, #101010 72%)` }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

        <div className="absolute bottom-3 left-3">
          <div
            className="h-10 w-10 rounded-full flex items-center justify-center border-2 border-white/20 text-[14px] font-bold text-white"
            style={{ backgroundColor: club.color }}
          >
            {club.initial}
          </div>
        </div>

        <span className="absolute top-2.5 right-2.5 inline-flex h-6 items-center gap-1 rounded-full border border-white/10 bg-black/50 px-2.5 text-[13px] text-white/70">
          <Users className="h-3.5 w-3.5 text-white/50" />
          {club.memberCount.toLocaleString()}
        </span>
      </div>

      <div className="bg-[#262626] p-4">
        <h3 className="text-[15px] font-semibold text-white/90 group-hover:text-[#00CC33] transition-colors">
          {club.name}
        </h3>
        <p className="mt-1 text-[13px] text-white/45 line-clamp-2">{club.subtitle}</p>
      </div>
    </Link>
  );
}

function ClubListCard({ club }: { club: typeof pochakChannels[number] }) {
  return (
    <Link
      to={`/club/${club.id}`}
      className="flex items-center gap-4 rounded-xl bg-[#262626] px-4 py-4 hover:bg-[#2e2e2e] transition-colors group"
    >
      <div
        className="h-12 w-12 rounded-lg flex-shrink-0 flex items-center justify-center text-[14px] font-bold text-white"
        style={{ backgroundColor: club.color }}
      >
        {club.initial}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-medium text-white/85 group-hover:text-white transition-colors truncate">
          {club.name}
        </p>
        <p className="mt-0.5 text-[13px] text-white/40 truncate">{club.subtitle}</p>
      </div>

      <div className="text-right flex-shrink-0">
        <p className="text-[14px] font-medium text-white/65">{club.memberCount.toLocaleString()}</p>
        <p className="mt-0.5 text-[12px] text-white/30">members</p>
      </div>

      <ChevronRight className="h-4 w-4 text-white/20 flex-shrink-0" />
    </Link>
  );
}

export default function ClubListPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState('전체');

  const filtered = useMemo(() => {
    return pochakChannels.filter((club) => {
      const matchQuery =
        !searchQuery ||
        club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        club.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
      return matchQuery;
    });
  }, [searchQuery]);

  const popular = filtered.slice().sort((a, b) => b.memberCount - a.memberCount);
  const recent = filtered.slice().reverse();
  const featured = popular.slice(0, 3);

  return (
    <div className="px-5 py-8 max-w-[1200px] mx-auto flex flex-col gap-8">
      {/* ── Header ── */}
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-[28px] font-bold tracking-[-0.03em] text-white">클럽 탐색</h1>
          <p className="mt-1.5 text-[14px] text-white/50">
            인기 클럽부터 신규 개설 클럽까지 — 바로 이어지는 채널 허브
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/35" />
          <input
            type="text"
            placeholder="클럽 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#262626] border border-[#4D4D4D] rounded-full text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#00CC33] transition-colors"
          />
        </div>
      </div>

      {/* ── Sport Filter ── */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {SPORTS.map((sport) => (
          <button
            key={sport}
            onClick={() => setSelectedSport(sport)}
            className={`flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              selectedSport === sport
                ? 'bg-[#00CC33] text-[#1A1A1A]'
                : 'bg-[#262626] text-white/55 hover:text-white hover:bg-[#333]'
            }`}
          >
            {sport === '전체' ? sport : `#${sport}`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-white/[0.06] bg-[#262626] py-20 text-center text-white/40">
          검색 결과가 없습니다.
        </div>
      ) : (
        <>
          {/* ── 주목할 클럽 ── */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-[#00CC33]" />
                <h2 className="text-[17px] font-bold text-white">주목할 클럽</h2>
              </div>
              <span className="text-[13px] text-white/30">총 {popular.length}개</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((club, i) => (
                <ClubFeatureCard key={club.id} club={club} tone={TONE_COLORS[i % TONE_COLORS.length]} />
              ))}
            </div>
          </section>

          {/* ── 활동 많은 클럽 ── */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[17px] font-bold text-white">활동 많은 클럽</h2>
              <button className="text-[13px] text-white/35 hover:text-white transition-colors">전체보기</button>
            </div>
            <div className="grid gap-3 lg:grid-cols-2">
              {popular.slice(0, 6).map((club) => (
                <ClubListCard key={club.id} club={club} />
              ))}
            </div>
          </section>

          {/* ── 신규 개설 클럽 (가로 스크롤) ── */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[17px] font-bold text-white">신규 개설 클럽</h2>
              <ChevronRight className="h-4 w-4 text-white/25" />
            </div>
            <HScrollRow scrollAmount={280}>
              {recent.map((club, i) => (
                <div key={club.id} className="w-[240px] flex-shrink-0">
                  <ClubFeatureCard club={club} tone={TONE_COLORS[(i + 2) % TONE_COLORS.length]} />
                </div>
              ))}
            </HScrollRow>
          </section>
        </>
      )}
    </div>
  );
}
