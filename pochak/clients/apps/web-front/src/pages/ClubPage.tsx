import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LuChevronRight,
  LuFlame,
  LuSearch,
  LuUsers,
} from 'react-icons/lu';
import FilterChip from '@/components/FilterChip';
import { useDebounce } from '@/hooks/useDebounce';
import { useClubs } from '@/hooks/useApi';
import { useTeams } from '@/hooks/useApi';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import HScrollRow from '@/components/HScrollRow';

const categoryFilters = ['전체', '야구', '축구', '농구', '배구', '풋살'];

const clubSpotlights = [
  { title: '활동 많은 클럽', desc: '최근 업로드와 경기 수 기준으로 정렬합니다.' },
  { title: '신규 개설 클럽', desc: '방금 생성된 채널도 첫 화면에서 발견되게 합니다.' },
  { title: '지역 추천', desc: '시설 정보와 연동된 지역 클럽을 같이 묶습니다.' },
];

/* ── Featured Club Card (이미지 배경 + 뱃지) ─────────── */
function ClubFeatureCard({
  club,
  tone,
}: {
  club: import('@/types/content').Channel;
  tone: string;
}) {
  return (
    <Link
      to={`/team/${club.id}`}
      className="block rounded-xl overflow-hidden border border-white/[0.13] transition-all duration-200 hover:border-white/[0.26] hover:shadow-[0_14px_36px_rgba(0,0,0,0.55)] group"
    >
      {/* Image header */}
      <div className="relative h-[120px] overflow-hidden">
        {club.imageUrl ? (
          <img src={club.imageUrl} alt={club.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-300" loading="lazy" />
        ) : (
          <div className="absolute inset-0" style={{ background: `linear-gradient(160deg, ${tone}, #101010 72%)` }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

        {/* Badge — bottom-left */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2.5">
          <div
            className="h-10 w-10 rounded-full flex items-center justify-center border-2 border-white/20 text-[14px] font-bold text-white"
            style={{ backgroundColor: club.color }}
          >
            {club.initial}
          </div>
        </div>

        {/* Followers — top-right */}
        <span className="absolute top-2.5 right-2.5 inline-flex h-6 items-center gap-1 rounded-full border border-white/10 bg-black/50 px-2.5 text-[13px] text-white/70">
          <LuUsers className="h-3.5 w-3.5 text-white/50" />
          {club.followers.toLocaleString()}
        </span>
      </div>

      {/* Content */}
      <div className="bg-pochak-surface p-4">
        <p className="text-[13px] font-medium text-white/45">{club.subtitle}</p>
        <h3 className="mt-1.5 text-[16px] font-semibold tracking-[-0.02em] text-white group-hover:text-primary transition-colors">
          {club.name}
        </h3>
        <p className="mt-2 text-[14px] leading-5 text-white/45 line-clamp-2">
          경기, 클립, 공지, 일정이 같은 톤 안에서 이어지는 채널 카드 구조로 정리합니다.
        </p>
      </div>
    </Link>
  );
}

/* ── Club List Card (이미지 + 정보 리스트형) ─────────── */
function ClubListCard({ club }: { club: import('@/types/content').Channel }) {
  return (
    <Link
      to={`/team/${club.id}`}
      className="flex items-center gap-4 rounded-xl bg-pochak-surface px-4 py-4 shadow-[0_2px_8px_rgba(0,0,0,0.3)] transition-all duration-200 hover:border-white/[0.26] hover:shadow-[0_10px_28px_rgba(0,0,0,0.45)] group"
    >
      {/* Thumbnail */}
      <div className="relative h-12 w-12 rounded-lg overflow-hidden flex-shrink-0">
        {club.imageUrl ? (
          <img src={club.imageUrl} alt={club.name} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="absolute inset-0" style={{ backgroundColor: `${club.color}30` }} />
        )}
        {/* Badge overlay */}
        <div
          className="absolute inset-0 flex items-center justify-center bg-black/30 text-[13px] font-bold text-white"
          style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}
        >
          {club.initial}
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-medium text-white/85 group-hover:text-white transition-colors">{club.name}</p>
        <p className="mt-0.5 text-[14px] text-white/40">{club.subtitle}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-[14px] font-medium text-white/65">{club.followers.toLocaleString()}</p>
        <p className="mt-0.5 text-[12px] text-white/30">followers</p>
      </div>
      <LuChevronRight className="h-4 w-4 text-white/20 flex-shrink-0" />
    </Link>
  );
}

export default function ClubPage() {
  const { data: clubs, loading } = useClubs();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('전체');

  const debouncedQuery = useDebounce(searchQuery, 300);
  const { data: teams } = useTeams();
  const displayClubs = Array.isArray(clubs) && clubs.length > 0 ? clubs : teams;

  const filtered = useMemo(() => {
    return displayClubs.filter((club) => {
      const matchQuery =
        !debouncedQuery ||
        club.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        club.subtitle.toLowerCase().includes(debouncedQuery.toLowerCase());
      const matchCategory = selectedCategory === '전체' || club.subtitle.includes(selectedCategory);
      return matchQuery && matchCategory;
    });
  }, [displayClubs, debouncedQuery, selectedCategory]);

  const featuredClubs = filtered.slice(0, 3);

  return (
    <div className="md:px-6 lg:px-8 flex flex-col gap-8">
      {/* ── Hero ── */}
      <section className="overflow-hidden">
        <div className="grid gap-0 lg:grid-cols-[1.18fr_0.82fr]">
          <div className="border-b border-border-subtle p-6 lg:border-b-0 lg:border-r lg:p-8">
            <h1 className="text-[34px] font-semibold tracking-[-0.04em] text-white">
              클럽을 발견하고,
              <br />
              활동 흐름까지
              <br />
              바로 이어지게
            </h1>
            <p className="mt-4 max-w-[520px] text-[15px] leading-6 text-white/62">
              기획서의 Club은 단순 리스트보다 채널 허브에 가깝다. 인기 클럽, 신규 개설, 지역 연동 추천, 최근 업로드가
              같은 리듬으로 보여야 한다.
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {clubSpotlights.map((item) => (
                <div key={item.title} className="py-2">
                  <p className="text-[14px] font-medium text-white/78">{item.title}</p>
                  <p className="mt-2 text-[14px] leading-5 text-white/42">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 lg:p-8">
            <div className="relative">
              <LuSearch className="absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="클럽 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12"
                style={{ paddingLeft: 48 }}
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-0 border-b border-white/[0.06]">
              {categoryFilters.map((category) => (
                <FilterChip
                  key={category}
                  label={category}
                  selected={selectedCategory === category}
                  onClick={() => setSelectedCategory(category)}
                />
              ))}
            </div>

            <div className="mt-6 py-3">
              <div className="flex items-center justify-between">
                <p className="text-[14px] font-medium text-white">이번 주 Club 포인트</p>
                <LuFlame className="h-4 w-4 text-white/28" />
              </div>
              <div className="mt-4 flex flex-col gap-3">
                {[
                  '클럽 카드가 단순 로고 리스트로 끝나지 않게 정보량을 늘립니다.',
                  '가로 섹션과 세로 리스트를 혼합해 탐색 리듬을 만듭니다.',
                  '카드 액션은 줄이고 텍스트 위계로만 차이를 만듭니다.',
                ].map((item) => (
                  <div key={item} className="rounded-2xl bg-black/20 text-[14px] leading-5 text-white/52">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 주목할 클럽 ── */}
      <section className="py-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-[19px] font-bold tracking-[-0.03em] text-white">주목할 클럽</h2>
            <p className="mt-1 text-[14px] text-white/46">첫 화면에서 바로 개성이 보이도록 카드 밀도를 높였습니다.</p>
          </div>
          <span className="text-[14px] text-white/32">총 {filtered.length}개</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-lg border border-border-subtle bg-bg-surface-1 px-6 py-20 text-center text-white/55">
            검색 결과가 없습니다.
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-3">
            {featuredClubs.map((club, index) => (
              <ClubFeatureCard
                key={club.id}
                club={club}
                tone={['rgba(19,69,201,0.35)', 'rgba(16,185,92,0.24)', 'rgba(255,139,0,0.24)'][index % 3]}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── 활동 많은 클럽 ── */}
      <section className="py-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-[19px] font-bold tracking-[-0.03em] text-white">활동 많은 클럽</h2>
            <p className="mt-1 text-[14px] text-white/46">세로형 리스트로 빠르게 비교할 수 있게 구성합니다.</p>
          </div>
          <Button variant="text" className="px-0 text-white/48 hover:text-white">전체보기</Button>
        </div>

        <div className="grid gap-3 xl:grid-cols-2">
          {filtered.slice(0, 8).map((club) => (
            <ClubListCard key={club.id} club={club} />
          ))}
        </div>
      </section>

      {/* ── 신규 개설 클럽 (가로 스크롤) ── */}
      <section className="py-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-[19px] font-bold tracking-[-0.03em] text-white">신규 개설 클럽</h2>
            <p className="mt-1 text-[14px] text-white/46">가로 스크롤 카드로 다른 서비스 화면과 패턴을 맞춥니다.</p>
          </div>
          <LuChevronRight className="h-4 w-4 text-white/28" />
        </div>

        <HScrollRow scrollAmount={320}>
          {filtered.map((club) => (
            <div key={club.id} className="w-[260px] flex-shrink-0">
              <ClubFeatureCard club={club} tone="rgba(255,255,255,0.04)" />
            </div>
          ))}
        </HScrollRow>
      </section>
    </div>
  );
}
