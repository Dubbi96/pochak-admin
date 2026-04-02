import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import {
  BannerSkeleton,
  CompetitionCardSkeleton,
  LiveCardSkeleton,
  ClipCardSkeleton,
  SectionSkeleton,
} from '@/components/Skeleton';
import HScrollRow from '@/components/HScrollRow';
import SectionHeader from '@/components/SectionHeader';
import HVideoCard from '@/components/HVideoCard';
import VClipCard from '@/components/VClipCard';
import {
  banners as defaultBanners,
  competitions as defaultCompetitions,
  popularClips as defaultPopularClips,
  pochakLiveContents,
  pochakVodContents,
  pochakChannels,
  fetchHomeBanners,
  fetchCompetitions,
  fetchPopularClips,
  type CompetitionCard as CompetitionCardType,
  type PopularClip as PopularClipType,
} from '@/services/webApi';
import type { PochakBanner } from '../../../../shared/types';

/* ── More Button ─────────────────────────────────────────── */
function MoreButton({ linkTo }: { linkTo?: string }) {
  return (
    <div className="flex justify-center mt-5">
      {linkTo ? (
        <Link to={linkTo} className="flex items-center gap-1 px-6 py-2 border border-[#4D4D4D] rounded-full text-[11px] text-[#A6A6A6] hover:text-white hover:border-[#606060] transition-colors">
          더보기 +
        </Link>
      ) : null}
    </div>
  );
}

/* ── 1. Hero Banner Carousel ─────────────────────────────── */
function BannerCarousel({ items }: { items: PochakBanner[] }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (items.length === 0) return;
    const t = setInterval(() => setCurrent((p) => (p + 1) % items.length), 5000);
    return () => clearInterval(t);
  }, [items.length]);

  if (items.length === 0) return null;
  const banner = items[current];

  return (
    <section className="relative w-full">
      <div className="relative aspect-[21/8] w-full overflow-hidden rounded-lg">
        {banner.imageUrl ? (
          <img src={banner.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover transition-all duration-700" />
        ) : (
          <div
            className="absolute inset-0 transition-all duration-700"
            style={{ background: `linear-gradient(135deg, #1a1a2e ${current * 5}%, #16213e 40%, #0f3460 80%)` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-transparent to-transparent" />
        <div className="relative z-10 flex h-full items-end pb-8 px-8 justify-between">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-white leading-tight whitespace-pre-line">
              {banner.title}
            </h2>
            <p className="mt-2 text-sm text-[#A6A6A6]">{banner.subtitle}</p>
          </div>
        </div>
      </div>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex items-center gap-2">
        <button
          onClick={() => setCurrent((current - 1 + items.length) % items.length)}
          className="h-10 w-10 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={() => setCurrent((current + 1) % items.length)}
          className="h-10 w-10 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
      {/* Dot pagination + page indicator */}
      <div className="flex items-center justify-center gap-3 mt-3">
        <button
          onClick={() => setCurrent((current - 1 + items.length) % items.length)}
          className="text-[#A6A6A6] hover:text-white transition-colors"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <div className="flex items-center gap-1.5">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Banner ${i + 1}`}
            >
              <span
                className={`block w-2 h-2 rounded-full transition-colors ${
                  i === current ? 'bg-[#00CC33]' : 'bg-[#4D4D4D]'
                }`}
              />
            </button>
          ))}
        </div>
        <span className="text-xs text-[#A6A6A6]">{current + 1}/{items.length}</span>
        <button
          onClick={() => setCurrent((current + 1) % items.length)}
          className="text-[#A6A6A6] hover:text-white transition-colors"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </section>
  );
}

/* ── 2. Competition Info Cards (with thumbnails) ─────────── */
function CompetitionCards({ items }: { items: CompetitionCardType[] }) {
  const totalPages = Math.max(1, Math.ceil(items.length / 3));
  const [currentPage, setCurrentPage] = useState(0);

  const gradients = [
    'linear-gradient(135deg, #1a237e 0%, #283593 50%, #3949ab 100%)',
    'linear-gradient(135deg, #b71c1c 0%, #c62828 50%, #e53935 100%)',
    'linear-gradient(135deg, #004d40 0%, #00695c 50%, #00897b 100%)',
    'linear-gradient(135deg, #e65100 0%, #ef6c00 50%, #f57c00 100%)',
    'linear-gradient(135deg, #4a148c 0%, #6a1b9a 50%, #7b1fa2 100%)',
  ];

  return (
    <section className="py-4">
      <HScrollRow scrollAmount={340}>
        {items.map((c, idx) => (
          <div
            key={c.id}
            className="flex-shrink-0 w-[320px] bg-[#262626] rounded-xl overflow-hidden cursor-pointer hover:bg-[#404040] transition-colors relative"
          >
            {c.isAd && (
              <span className="absolute top-3 right-3 z-10 text-xs text-[#A6A6A6] bg-[#404040] px-1.5 py-0.5 rounded">AD</span>
            )}
            {/* Thumbnail banner */}
            <div
              className="w-full h-[100px] flex items-center justify-center"
              style={{ background: gradients[idx % gradients.length] }}
            >
              <div
                className="w-14 h-14 rounded-lg flex items-center justify-center text-sm font-bold text-white"
                style={{ backgroundColor: c.logoColor }}
              >
                {c.logoText}
              </div>
            </div>
            <div className="p-3">
              <p className="text-base font-bold text-white leading-tight">{c.name}</p>
              <p className="text-sm text-[#A6A6A6] mt-0.5">{c.subtitle}</p>
              <p className="text-sm text-[#00CC33] font-medium mt-1.5">{c.dateRange}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                <span className="px-1.5 py-0.5 rounded text-[11px] bg-[#404040] text-[#A6A6A6]">야구</span>
                <span className="px-1.5 py-0.5 rounded text-[11px] bg-[#404040] text-[#A6A6A6]">유료</span>
                <span className="px-1.5 py-0.5 rounded text-[11px] bg-[#404040] text-[#A6A6A6]">해설</span>
              </div>
            </div>
          </div>
        ))}
      </HScrollRow>
      <div className="flex items-center justify-center gap-1 mt-3">
        <button
          onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
          disabled={currentPage === 0}
          className="w-6 h-6 flex items-center justify-center text-[#A6A6A6] hover:text-white disabled:text-[#4D4D4D] transition-colors"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i)}
            className="p-1 transition-colors"
            aria-label={`Page ${i + 1}`}
          >
            <span
              className={`block w-2 h-2 rounded-full transition-colors ${
                i === currentPage ? 'bg-[#00CC33]' : 'bg-[#4D4D4D]'
              }`}
            />
          </button>
        ))}
        <button
          onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
          disabled={currentPage === totalPages - 1}
          className="w-6 h-6 flex items-center justify-center text-[#A6A6A6] hover:text-white disabled:text-[#4D4D4D] transition-colors"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </section>
  );
}

/* ── 3. 공식 라이브 (HVideoCard style) ─────────────────────── */
function OfficialLiveSection() {
  return (
    <section className="py-8">
      <SectionHeader prefix="공식" highlight="라이브" />
      <HScrollRow scrollAmount={300}>
        {pochakLiveContents.map((c) => {
          const isLive = c.status === 'LIVE';
          const d = new Date(c.date);
          const dateBadgeText = isLive
            ? undefined
            : `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')} 예정`;
          const durationText = isLive ? undefined : c.date.slice(11, 16);
          return (
            <HVideoCard
              key={c.id}
              title={`${c.homeTeam.name} vs ${c.awayTeam.name}`}
              sub={`${c.competition} | ${c.sport}`}
              tags={c.tags.slice(0, 4)}
              live={isLive}
              duration={durationText}
              dateBadge={dateBadgeText}
              showBookmark
              showMoreMenu
              thumbnailUrl={c.thumbnailUrl}
              linkTo={`/contents/${isLive ? 'live' : 'vod'}/${c.id}`}
            />
          );
        })}
      </HScrollRow>
      <MoreButton linkTo="/contents?type=LIVE" />
    </section>
  );
}

/* ── 4. 인기 클립 (세로형 클립 카드) ────────────────────── */
function PopularPochakSection({ items }: { items: PopularClipType[] }) {
  return (
    <section className="py-8">
      <SectionHeader prefix="인기" highlight="클립" />
      <HScrollRow scrollAmount={200}>
        {items.map((clip) => (
          <VClipCard key={clip.id} title={clip.title} views="1,320" linkTo={`/clip/${clip.id}`} thumbnailUrl={clip.thumbnail} />
        ))}
      </HScrollRow>
      <MoreButton linkTo="/contents?type=CLIP" />
    </section>
  );
}

/* ── 5. 최근 영상 (가로형) ────────────────────────────────── */
function LatestVideosSection() {
  return (
    <section className="py-8">
      <SectionHeader prefix="최근" highlight="영상" />
      <HScrollRow scrollAmount={300}>
        {pochakVodContents.map((v) => (
          <HVideoCard
            key={v.id}
            title={v.title}
            sub={`${v.competition} · ${v.date.slice(0, 10)}`}
            tags={v.tags.slice(0, 3)}
            duration={v.duration ? `${Math.floor(v.duration / 60)}:${String(v.duration % 60).padStart(2, '0')}` : undefined}
            thumbnailUrl={v.thumbnailUrl}
            linkTo={`/contents/vod/${v.id}`}
          />
        ))}
      </HScrollRow>
      <MoreButton linkTo="/contents?type=VOD" />
    </section>
  );
}

/* ── 6. 인기 팀/클럽 ────────────────────────────────────── */
function BestClubSection() {
  // id for scroll-to from sidebar "인기팀 +"
  const [followedClubs, setFollowedClubs] = useState<Set<string>>(new Set());

  const toggleFollow = (id: string) => {
    setFollowedClubs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <section className="py-8">
      <SectionHeader prefix="인기" highlight="팀/클럽" />
      <HScrollRow scrollAmount={280}>
        {pochakChannels.map((club) => {
          const isFollowed = followedClubs.has(club.id);
          return (
            <div
              key={club.id}
              className="flex-shrink-0 w-[130px] flex flex-col items-center gap-2.5 py-4 cursor-pointer"
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-[#4D4D4D]"
                style={{ backgroundColor: club.color }}
              >
                {club.initial}
              </div>
              <p className="text-sm font-bold text-white text-center truncate w-full">{club.name}</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFollow(club.id);
                }}
                className={`rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${
                  isFollowed
                    ? 'bg-[#00CC33] text-[#1A1A1A] hover:bg-[#00E676]'
                    : 'border border-[#00CC33] text-[#00CC33] bg-transparent hover:bg-[#00CC33]/10'
                }`}
              >
                즐겨보기
              </button>
            </div>
          );
        })}
      </HScrollRow>
      <MoreButton linkTo="/teams" />
    </section>
  );
}

/* ── 7. 팀/클럽 라이브 (가로형) ────────────────────────────── */
function ClubLiveSection() {
  return (
    <section className="py-8">
      <SectionHeader prefix="팀/클럽" highlight="라이브" />
      <HScrollRow scrollAmount={300}>
        {pochakLiveContents.map((c) => (
          <HVideoCard
            key={c.id}
            title={c.title}
            sub={c.homeTeam.name}
            live={c.status === 'LIVE'}
            duration={c.status === 'LIVE' ? undefined : c.date.slice(5, 10).replace('-', '월 ') + '일'}
            thumbnailUrl={c.thumbnailUrl}
            linkTo={`/contents/${c.status === 'LIVE' ? 'live' : 'vod'}/${c.id}`}
          />
        ))}
      </HScrollRow>
      <MoreButton linkTo="/contents?type=LIVE" />
    </section>
  );
}

/* ── 8. 팀/클럽 클립 (가로형) ──────────────────────────── */
function ClubLatestSection() {
  return (
    <section className="py-8">
      <SectionHeader prefix="팀/클럽" highlight="클립" />
      <HScrollRow scrollAmount={300}>
        {pochakVodContents.map((v) => (
          <HVideoCard
            key={v.id}
            title={v.title}
            sub={`${v.homeTeam.name} · ${v.date.slice(5, 10).replace('-', '월 ')}일`}
            duration={v.duration ? `${Math.floor(v.duration / 3600)}:${String(Math.floor((v.duration % 3600) / 60)).padStart(2, '0')}:${String(v.duration % 60).padStart(2, '0')}` : undefined}
            thumbnailUrl={v.thumbnailUrl}
            linkTo={`/contents/vod/${v.id}`}
          />
        ))}
      </HScrollRow>
      <MoreButton linkTo="/contents?type=CLIP" />
    </section>
  );
}

/* ── 9. 대회별 영상 섹션 (가로형, 반복) ──────────────────── */
function CompetitionVideosSection({ title }: { title: string }) {
  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">{title}</h2>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1 text-[13px] text-[#A6A6A6] hover:text-white transition-colors">
            <ArrowUpDown className="h-3.5 w-3.5" />
            정렬
          </button>
          <button className="text-sm text-[#A6A6A6] hover:text-white transition-colors">전체보기 &gt;</button>
        </div>
      </div>
      <HScrollRow scrollAmount={300}>
        {pochakLiveContents.slice(0, 6).map((c, i) => (
          <HVideoCard
            key={c.id}
            title={c.title}
            sub={`${c.competition} · ${c.date.slice(11, 16)} ~`}
            tags={c.tags.slice(0, 3)}
            duration={i >= 2 ? '3:48:35' : undefined}
            live={i < 2}
            thumbnailUrl={c.thumbnailUrl}
            linkTo={`/contents/${i < 2 ? 'live' : 'vod'}/${c.id}`}
          />
        ))}
      </HScrollRow>
      <MoreButton linkTo="/competitions" />
    </section>
  );
}

/* ── Home Page ───────────────────────────────────────────── */
export default function HomePage() {
  const [bannerItems, setBannerItems] = useState<PochakBanner[]>(defaultBanners);
  const [competitionItems, setCompetitionItems] = useState<CompetitionCardType[]>(defaultCompetitions);
  const [clipItems, setClipItems] = useState<PopularClipType[]>(defaultPopularClips);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchHomeBanners().then(setBannerItems).catch(() => {}),
      fetchCompetitions().then(setCompetitionItems).catch(() => {}),
      fetchPopularClips().then(setClipItems).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="px-5 py-4 space-y-8">
        <BannerSkeleton />
        <div className="flex gap-5 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <CompetitionCardSkeleton key={i} />
          ))}
        </div>
        <div>
          <div className="h-6 w-32 bg-[#262626] rounded mb-4 animate-pulse" />
          <div className="flex gap-5 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <LiveCardSkeleton key={i} />
            ))}
          </div>
        </div>
        <div>
          <div className="h-6 w-32 bg-[#262626] rounded mb-4 animate-pulse" />
          <div className="flex gap-5 overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <ClipCardSkeleton key={i} />
            ))}
          </div>
        </div>
        <div>
          <div className="h-6 w-32 bg-[#262626] rounded mb-4 animate-pulse" />
          <SectionSkeleton count={4} variant="horizontal" />
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 py-4">
      <BannerCarousel items={bannerItems} />
      <CompetitionCards items={competitionItems} />
      <OfficialLiveSection />
      <PopularPochakSection items={clipItems} />
      <LatestVideosSection />
      <div id="best-club-section"><BestClubSection /></div>
      <ClubLiveSection />
      <ClubLatestSection />
      <CompetitionVideosSection title="2025화랑대기 유소년축구" />
      <CompetitionVideosSection title="제5회 전국 리틀야구" />
      <CompetitionVideosSection title="2025 전국 대학핸드볼 선수권" />
      <CompetitionVideosSection title="제4회 춘계 꿈나무 야구 대회" />
      <div className="h-16" />
    </div>
  );
}
