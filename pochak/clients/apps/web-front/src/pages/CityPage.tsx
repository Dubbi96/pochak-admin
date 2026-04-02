import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDebounce } from '@/hooks/useDebounce';
import {
  LuBuilding2,
  LuCalendarDays,
  LuChevronRight,
  LuMapPin,
  LuSearch,
  LuTimerReset,
  LuSlidersHorizontal,
  LuX,
  LuArrowUpDown,
  LuCamera,
  LuVideo,
} from 'react-icons/lu';
import FilterChip from '@/components/FilterChip';
import { useVenues } from '@/hooks/useApi';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import HScrollRow from '@/components/HScrollRow';
import { useTeams } from '@/hooks/useApi';

const sportFilters = ['전체', '축구', '농구', '야구', '배구', '풋살', '핸드볼'];

type PriceRange = '전체' | '무료' | '~1만' | '~3만' | '~5만' | '5만+';
type ProductType = '전체' | 'SPACE_ONLY' | 'SPACE_CAMERA' | 'CAMERA_ONLY';
type SortOption = 'popular' | 'price_asc' | 'price_desc' | 'newest' | 'distance';

const priceRangeFilters: { label: string; value: PriceRange }[] = [
  { label: '전체', value: '전체' },
  { label: '무료', value: '무료' },
  { label: '~1만원', value: '~1만' },
  { label: '~3만원', value: '~3만' },
  { label: '~5만원', value: '~5만' },
  { label: '5만원+', value: '5만+' },
];

const productTypeFilters: { label: string; value: ProductType; icon: typeof LuBuilding2 }[] = [
  { label: '전체', value: '전체', icon: LuBuilding2 },
  { label: '공간만', value: 'SPACE_ONLY', icon: LuBuilding2 },
  { label: '공간+카메라', value: 'SPACE_CAMERA', icon: LuVideo },
  { label: '카메라만', value: 'CAMERA_ONLY', icon: LuCamera },
];

const sortOptions: { label: string; value: SortOption }[] = [
  { label: '인기순', value: 'popular' },
  { label: '가격 낮은순', value: 'price_asc' },
  { label: '가격 높은순', value: 'price_desc' },
  { label: '최신순', value: 'newest' },
  { label: '거리순', value: 'distance' },
];

const cityVenues = [
  { id: 'v1', name: '잠실 유소년 야구장', district: '서울 송파구', sport: '야구', address: '잠실동 10-2', note: '오늘 18:00까지 예약 가능', badge: '인기', schedule: '주말 리그 12경기', color: '#165DFF', imageUrl: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=640&h=360&fit=crop', minPrice: 50000, productTypes: ['SPACE_ONLY', 'SPACE_CAMERA'] as ProductType[] },
  { id: 'v2', name: '화성 드림파크 풋살 센터', district: '경기 화성시', sport: '풋살', address: '우정읍 체육로 17', note: '야간 조명 운영', badge: '추천', schedule: '야간 경기 다수', color: '#00A76F', imageUrl: 'https://images.unsplash.com/photo-1552667466-07770ae110d0?w=640&h=360&fit=crop', minPrice: 30000, productTypes: ['SPACE_ONLY'] as ProductType[] },
  { id: 'v3', name: '춘천 체육관 A코트', district: '강원 춘천시', sport: '농구', address: '중앙로 88', note: '이번 주 대회 진행 중', badge: 'LIVE', schedule: '주간 이벤트 4건', color: '#FF8B00', imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=640&h=360&fit=crop', minPrice: 0, productTypes: ['SPACE_ONLY'] as ProductType[] },
  { id: 'v4', name: '부산 해운대 배구 센터', district: '부산 해운대구', sport: '배구', address: '우동 411-3', note: '실내 코트 3면', badge: '신규', schedule: '체험 수업 모집', color: '#7A5AF8', imageUrl: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=640&h=360&fit=crop', minPrice: 25000, productTypes: ['SPACE_ONLY', 'SPACE_CAMERA', 'CAMERA_ONLY'] as ProductType[] },
  { id: 'v5', name: '고양 시민 축구장', district: '경기 고양시', sport: '축구', address: '주엽동 231', note: '주말 경기장 대관 가능', badge: '예약', schedule: '유소년 매치 9건', color: '#EF4444', imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=640&h=360&fit=crop', minPrice: 80000, productTypes: ['SPACE_CAMERA'] as ProductType[] },
  { id: 'v6', name: '대전 한밭 핸드볼관', district: '대전 서구', sport: '핸드볼', address: '둔산로 77', note: '평일 저녁 리그 운영', badge: '클럽', schedule: '지역 리그 운영', color: '#14B8A6', imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=640&h=360&fit=crop', minPrice: 45000, productTypes: ['SPACE_ONLY', 'CAMERA_ONLY'] as ProductType[] },
];

function matchesPriceRange(price: number, range: PriceRange): boolean {
  if (range === '전체') return true;
  if (range === '무료') return price === 0;
  if (range === '~1만') return price > 0 && price <= 10000;
  if (range === '~3만') return price > 0 && price <= 30000;
  if (range === '~5만') return price > 0 && price <= 50000;
  if (range === '5만+') return price > 50000;
  return true;
}

function formatPrice(n: number): string {
  if (n === 0) return '무료';
  return n.toLocaleString('ko-KR') + '원~';
}

const cityPrograms = [
  { title: '이번 주 인기 시설', desc: '조회수와 예약률이 높은 시설을 우선 배치합니다.' },
  { title: '주변 경기 일정', desc: '시설 정보만이 아니라 해당 지역 경기 일정도 같이 노출합니다.' },
  { title: '추천 클럽 연동', desc: '시설과 연결된 클럽/팀을 같이 보여줘 탐색이 이어지게 합니다.' },
];

/* ── Venue Card (이미지 + 정보 카드) ─────────────────── */
function CityVenueCard({
  venue,
}: {
  venue: (typeof cityVenues)[number];
}) {
  return (
    <Link
      to={`/city/venue/${venue.id}`}
      className="block rounded-xl overflow-hidden border border-white/[0.13] transition-all duration-200 hover:border-white/[0.26] hover:shadow-[0_14px_36px_rgba(0,0,0,0.55)] group"
    >
      {/* Image header */}
      <div className="relative overflow-hidden h-[130px]">
        <img
          src={venue.imageUrl}
          alt={venue.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Badge — top-left */}
        <span
          className={`absolute top-2.5 left-2.5 inline-flex h-[22px] items-center rounded-full px-2 text-[12px] font-semibold tracking-[0.06em] ${
            venue.badge === 'LIVE'
              ? 'bg-red-500 text-white'
              : 'bg-white/[0.12] text-white/70 border border-border-subtle'
          }`}
        >
          {venue.badge}
        </span>

        {/* Sport icon — top-right */}
        <div
          className="absolute top-2.5 right-2.5 flex h-8 w-8 items-center justify-center rounded-lg border border-white/10"
          style={{ backgroundColor: `${venue.color}30` }}
        >
          <LuBuilding2 className="h-4 w-4" style={{ color: venue.color }} />
        </div>

        {/* District — bottom-left */}
        <span className="absolute bottom-2.5 left-3 text-[13px] font-medium text-primary">
          {venue.district}
        </span>
      </div>

      {/* Content */}
      <div className="bg-pochak-surface p-4">
        <h3 className="text-[15px] font-semibold tracking-[-0.02em] text-white group-hover:text-primary transition-colors">
          {venue.name}
        </h3>
        <p
          className="mt-1.5 flex items-center gap-1.5 text-[14px] text-white/45 hover:text-primary transition-colors cursor-pointer"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            window.open(`https://map.naver.com/v5/search/${encodeURIComponent(venue.address)}`, '_blank');
          }}
          role="link"
          tabIndex={0}
        >
          <LuMapPin className="h-3.5 w-3.5 flex-shrink-0" />
          {venue.address}
        </p>

        <div className="flex items-center justify-between" style={{ marginTop: 8 }}>
          <div className="flex gap-2 text-[13px]">
            <span className="inline-flex h-6 items-center rounded-md bg-white/[0.06] border border-border-subtle px-2 text-white/55">
              {venue.sport}
            </span>
            <span className="inline-flex h-6 items-center rounded-md bg-white/[0.06] border border-border-subtle px-2 text-white/55 truncate">
              {venue.note}
            </span>
          </div>
          {'minPrice' in venue && (
            <span className="text-[14px] font-bold text-primary">
              {formatPrice((venue as typeof cityVenues[number]).minPrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

/* ── Club Link Card (연결된 클럽) ────────────────────── */
function ClubLinkCard({ club }: { club: import('@/types/content').Channel }) {
  return (
    <Link
      to={`/team/${club.id}`}
      className="block rounded-xl overflow-hidden border border-white/[0.13] shadow-[0_2px_8px_rgba(0,0,0,0.35)] transition-all duration-200 hover:border-white/[0.26] hover:shadow-[0_10px_28px_rgba(0,0,0,0.5)] group"
    >
      {/* Image */}
      <div className="relative h-[80px] overflow-hidden">
        {club.imageUrl ? (
          <img src={club.imageUrl} alt={club.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-300" loading="lazy" />
        ) : (
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${club.color}50, #111)` }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        {/* Badge */}
        <div
          className="absolute bottom-2 left-2 h-7 w-7 rounded-full flex items-center justify-center border border-white/15 text-[12px] font-bold text-white"
          style={{ backgroundColor: club.color }}
        >
          {club.initial}
        </div>
      </div>
      {/* Info */}
      <div className="bg-pochak-surface px-3 py-2.5">
        <p className="text-[14px] font-semibold text-white/85 truncate group-hover:text-primary transition-colors">{club.name}</p>
        <p className="text-[12px] text-white/40 mt-0.5 truncate">{club.subtitle}</p>
      </div>
    </Link>
  );
}

/* ── Schedule Link Card (지역 경기 일정) ─────────────── */
function ScheduleLinkCard({
  venue,
  dayLabel,
}: {
  venue: (typeof cityVenues)[number];
  dayLabel: string;
}) {
  return (
    <Link
      to={`/city/venue/${venue.id}`}
      className="flex items-center gap-4 rounded-xl bg-pochak-surface px-4 py-3.5 transition-all duration-200 hover:border-white/[0.22] hover:bg-pochak-surface group"
    >
      {/* Thumbnail */}
      <div className="relative h-12 w-12 rounded-lg overflow-hidden flex-shrink-0">
        <img src={venue.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-medium text-white/82 group-hover:text-white transition-colors truncate">{venue.name}</p>
        <p className="mt-0.5 text-[13px] text-white/40">{venue.schedule}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-[13px] uppercase tracking-[0.1em] text-primary font-medium">{dayLabel}</p>
        <p className="mt-0.5 text-[13px] text-white/35">{venue.district}</p>
      </div>
      <LuChevronRight className="h-4 w-4 text-white/20 flex-shrink-0" />
    </Link>
  );
}

export default function CityPage() {
  const [keyword, setKeyword] = useState('');
  const [selectedSport, setSelectedSport] = useState('전체');
  const [priceRange, setPriceRange] = useState<PriceRange>('전체');
  const [productType, setProductType] = useState<ProductType>('전체');
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [availableDate, setAvailableDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const debouncedKeyword = useDebounce(keyword, 300);
  const { data: venues, loading } = useVenues(debouncedKeyword || undefined, selectedSport !== '전체' ? selectedSport : undefined);
  const { data: channels } = useTeams();

  const venueList = Array.isArray(venues) && venues.length > 0 ? venues : cityVenues;

  const activeFilterCount = [
    priceRange !== '전체',
    productType !== '전체',
    !!availableDate,
  ].filter(Boolean).length;

  const resetFilters = () => {
    setPriceRange('전체');
    setProductType('전체');
    setAvailableDate('');
    setSortBy('popular');
  };

  const filteredVenues = useMemo(() => {
    let result = venueList.filter((venue) => {
      const name = 'name' in venue && typeof venue.name === 'string' ? venue.name : '';
      const address = 'address' in venue && typeof venue.address === 'string' ? venue.address : '';
      const sport = 'sport' in venue && typeof venue.sport === 'string' ? venue.sport : '';
      const matchQuery = !debouncedKeyword || `${name} ${address}`.toLowerCase().includes(debouncedKeyword.toLowerCase());
      const matchSport = selectedSport === '전체' || sport === selectedSport;
      const matchPrice = priceRange === '전체' || ('minPrice' in venue && matchesPriceRange((venue as typeof cityVenues[number]).minPrice, priceRange));
      const matchProduct = productType === '전체' || ('productTypes' in venue && (venue as typeof cityVenues[number]).productTypes.includes(productType));
      return matchQuery && matchSport && matchPrice && matchProduct;
    }) as Array<(typeof cityVenues)[number]>;

    if (sortBy === 'price_asc') result = [...result].sort((a, b) => a.minPrice - b.minPrice);
    else if (sortBy === 'price_desc') result = [...result].sort((a, b) => b.minPrice - a.minPrice);

    return result;
  }, [debouncedKeyword, selectedSport, priceRange, productType, sortBy, venueList]);

  const highlightedVenues = filteredVenues.slice(0, 2);
  const nearbyVenues = filteredVenues.slice(0, 6);

  return (
    <div className="md:px-6 lg:px-8 flex flex-col gap-8">
      {/* ── Hero ── */}
      <section className="overflow-hidden">
        <div className="grid gap-0 lg:grid-cols-[1.25fr_0.75fr] items-stretch">
          {/* 좌측: 소개 */}
          <div className="flex flex-col justify-between border-b border-border-subtle p-6 lg:border-b-0 lg:border-r lg:p-8">
            <div>
              <h1 className="text-[34px] font-semibold tracking-[-0.04em] text-white">
                지역, 시설, 일정이
                <br />
                한 화면에서 이어지게
              </h1>
              <p className="mt-4 max-w-[540px] text-[15px] leading-6 text-white/62">
                기획서 기준의 City는 단순 시설 검색이 아니라 지역 기반 스포츠 탐색 허브에 가깝다. 검색, 추천 시설,
                지역 경기 일정, 연결된 클럽 흐름을 한 화면에 묶어서 보여준다.
              </p>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                { label: '지역 제안', value: '12개 권역 큐레이션' },
                { label: '인기 시설', value: '실시간 예약/조회 반영' },
                { label: '연계 정보', value: '시설 + 경기 + 클럽 연결' },
              ].map((item) => (
                <div key={item.label} className="py-2">
                  <p className="text-[13px] uppercase tracking-[0.14em] text-white/38">{item.label}</p>
                  <p className="mt-2 text-[14px] font-medium text-white/80">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 우측: 검색 + 필터 + 포인트 */}
          <div className="flex flex-col p-6 lg:p-8">
            <div className="relative">
              <LuSearch className="absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="시설명, 지역으로 검색"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="h-12"
                style={{ paddingLeft: 48 }}
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-0 border-b border-white/[0.06]">
              {sportFilters.map((sport) => (
                <FilterChip
                  key={sport}
                  label={sport}
                  selected={selectedSport === sport}
                  onClick={() => setSelectedSport(sport)}
                />
              ))}
            </div>

            {/* ── Advanced filters toggle ── */}
            <div className="mt-4 flex items-center gap-2">
              <Button
                variant={showFilters ? 'primary' : 'outline'}
                size="sm"
                className="gap-1.5"
                onClick={() => setShowFilters(!showFilters)}
              >
                <LuSlidersHorizontal className="h-3.5 w-3.5" />
                상세 필터
                {activeFilterCount > 0 && (
                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-white/20 text-[10px] font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
              <Button
                variant={showSort ? 'primary' : 'outline'}
                size="sm"
                className="gap-1.5"
                onClick={() => setShowSort(!showSort)}
              >
                <LuArrowUpDown className="h-3.5 w-3.5" />
                {sortOptions.find(s => s.value === sortBy)?.label}
              </Button>
              {activeFilterCount > 0 && (
                <button onClick={resetFilters} className="text-[12px] text-white/40 hover:text-white flex items-center gap-1 transition-colors">
                  <LuX className="h-3 w-3" />
                  초기화
                </button>
              )}
            </div>

            {/* ── Sort dropdown ── */}
            {showSort && (
              <div className="mt-2 rounded-lg bg-pochak-surface border border-border-subtle p-2 flex flex-wrap gap-1">
                {sortOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => { setSortBy(opt.value); setShowSort(false); }}
                    className={`px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors ${
                      sortBy === opt.value ? 'bg-primary/15 text-primary' : 'text-white/55 hover:text-white hover:bg-white/[0.06]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}

            {/* ── Filter panel ── */}
            {showFilters && (
              <div className="mt-2 rounded-xl bg-pochak-surface border border-border-subtle p-4 flex flex-col gap-4">
                <div>
                  <p className="text-[13px] text-white/50 font-medium" style={{ marginBottom: 6 }}>가격대</p>
                  <div className="flex flex-wrap gap-1.5">
                    {priceRangeFilters.map(f => (
                      <button
                        key={f.value}
                        onClick={() => setPriceRange(f.value)}
                        className={`px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-colors ${
                          priceRange === f.value
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border-subtle text-white/55 hover:border-white/[0.15]'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[13px] text-white/50 font-medium" style={{ marginBottom: 6 }}>상품 유형</p>
                  <div className="flex flex-wrap gap-1.5">
                    {productTypeFilters.map(f => {
                      const Icon = f.icon;
                      return (
                        <button
                          key={f.value}
                          onClick={() => setProductType(f.value)}
                          className={`px-3 py-1.5 rounded-lg text-[12px] font-medium border flex items-center gap-1.5 transition-colors ${
                            productType === f.value
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-border-subtle text-white/55 hover:border-white/[0.15]'
                          }`}
                        >
                          <Icon className="h-3 w-3" />
                          {f.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="text-[13px] text-white/50 font-medium" style={{ marginBottom: 6 }}>예약 가능 날짜</p>
                  <input
                    type="date"
                    value={availableDate}
                    onChange={e => setAvailableDate(e.target.value)}
                    className="rounded-lg bg-white/[0.04] border border-border-subtle px-3 py-2 text-[13px] text-white focus:border-primary/50 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            )}

            <div className="mt-auto pt-4 py-3">
              <div className="flex items-center justify-between">
                <p className="text-[14px] font-medium text-white">이번 주 City 포인트</p>
                <LuTimerReset className="h-4 w-4 text-white/28" />
              </div>
              <div className="mt-3 flex flex-col gap-2">
                {cityPrograms.map((item) => (
                  <div key={item.title} className="rounded-lg bg-black/20 py-2.5">
                    <p className="text-[14px] font-medium text-white/82">{item.title}</p>
                    <p className="mt-0.5 text-[14px] leading-5 text-white/48">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 인기 시설 ── */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-[19px] font-semibold tracking-[-0.03em] text-white">지금 많이 찾는 시설</h2>
            <p className="mt-1 text-[14px] text-white/46">핵심 시설 카드를 상단에서 바로 노출합니다.</p>
          </div>
          <span className="text-[14px] text-white/32">총 {filteredVenues.length}곳</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : filteredVenues.length === 0 ? (
          <div className="px-0 py-16 text-center text-white/55">
            등록된 시설이 없습니다. 다른 검색어나 종목으로 시도해보세요.
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {highlightedVenues.map((venue) => (
              <CityVenueCard key={venue.id} venue={venue} />
            ))}
          </div>
        )}
      </section>

      {/* ── 주변 추천 시설 (가로 스크롤) ── */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-[19px] font-semibold tracking-[-0.03em] text-white">주변 추천 시설</h2>
            <p className="mt-1 text-[14px] text-white/46">가로 스크롤로 주변 탐색 흐름을 유지합니다.</p>
          </div>
          <Button variant="text" className="px-0 text-white/48 hover:text-white">전체보기</Button>
        </div>
        <HScrollRow scrollAmount={320}>
          {nearbyVenues.map((venue) => (
            <div key={venue.id} className="w-[260px] flex-shrink-0">
              <CityVenueCard venue={venue} />
            </div>
          ))}
        </HScrollRow>
      </section>

      {/* ── 지역 경기 일정 + 연결된 클럽 ── */}
      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="py-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[19px] font-semibold tracking-[-0.03em] text-white">지역 경기 일정</h2>
            <LuCalendarDays className="h-4 w-4 text-white/28" />
          </div>
          <div className="flex flex-col gap-3">
            {filteredVenues.slice(0, 4).map((venue, index) => (
              <ScheduleLinkCard key={venue.id} venue={venue} dayLabel={`Day ${index + 1}`} />
            ))}
          </div>
        </div>

        <div className="py-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[19px] font-semibold tracking-[-0.03em] text-white">연결된 클럽</h2>
            <Link to="/teams" className="text-[14px] text-white/40 hover:text-primary transition-colors">팀 보러가기</Link>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {channels.slice(0, 6).map((club) => (
              <ClubLinkCard key={club.id} club={club} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
