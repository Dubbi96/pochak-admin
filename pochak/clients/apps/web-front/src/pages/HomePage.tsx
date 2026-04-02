import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { LuChevronLeft, LuChevronRight, LuPlay } from 'react-icons/lu';
import { motion, AnimatePresence } from 'framer-motion';
import SectionHeader from '@/components/SectionHeader';
import HScrollRow from '@/components/HScrollRow';
import { VideoCard, ClipCard, TeamLogoCard, CompetitionBannerCard } from '@/components/Card';
import { cn } from '@/lib/utils';
import { useHome, useContents, useTeams, useCompetitions } from '@/hooks/useApi';
import type { Banner } from '@/types/content';

const BANNER_INTERVAL = 5500;

/* ── Hero Banner ──────────────────────────────────────── */
function HeroBanner({
  items,
  current,
  changeBanner,
  progress,
}: {
  items: Banner[];
  current: number;
  changeBanner: (i: number) => void;
  progress: number;
}) {
  if (items.length === 0) return null;
  const banner = items[current];

  return (
    <section className="relative mb-8 xl:mb-10" aria-label="메인 배너">
      <div
        className="relative w-full h-[400px] xl:h-[460px] overflow-hidden rounded-2xl cursor-pointer"
        onClick={() => {
          if (banner.linkTo?.startsWith('http')) {
            window.open(banner.linkTo, '_blank', 'noopener,noreferrer');
          } else if (banner.linkTo) {
            window.location.href = banner.linkTo;
          }
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0"
          >
            {banner.imageUrl ? (
              <img src={banner.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0" style={{ background: banner.gradient }} />
            )}
          </motion.div>
        </AnimatePresence>

        <div className="absolute inset-0 bg-gradient-to-t from-pochak-bg via-pochak-bg/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-pochak-bg/90 via-pochak-bg/20 to-transparent" />

        <div className="relative z-10 flex h-full items-end pb-14 px-6 lg:px-8 pointer-events-none">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-[520px]"
          >
            <span className="flex items-center gap-1.5 text-[13px] font-bold tracking-wider uppercase text-primary mb-3">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary animate-[pulse-live_2s_ease-in-out_infinite]" />
              LIVE NOW
            </span>
            <h2 className="text-[26px] xl:text-[32px] font-extrabold text-white leading-[1.15] tracking-[-0.03em] whitespace-pre-line">
              {banner.title}
            </h2>
            <p className="mt-2.5 text-[15px] text-white/65 leading-snug line-clamp-2">{banner.subtitle}</p>

            {/* CTA buttons */}
            <div className="flex items-center gap-3 mt-6 pointer-events-auto">
              <button className="relative overflow-hidden flex items-center gap-2.5 h-11 px-7 rounded-lg bg-gradient-to-r from-primary to-pochak-accent-bright text-primary-foreground font-bold text-[14px] tracking-[-0.02em] hover:shadow-glow-md hover:brightness-110 transition-all duration-200 active:scale-[0.97] active:duration-75 before:absolute before:inset-0 before:bg-white/0 hover:before:bg-white/[0.1] before:transition-colors before:duration-200">
                <LuPlay className="w-4 h-4 fill-current" />
                시청하기
              </button>
              <button className="relative overflow-hidden flex items-center gap-2 h-11 px-6 rounded-lg border border-white/[0.12] bg-white/[0.06] text-white font-semibold text-[14px] tracking-[-0.02em] hover:bg-white/[0.12] hover:border-white/[0.2] transition-all duration-200 backdrop-blur-md active:scale-[0.97] active:duration-75">
                상세정보
              </button>
            </div>
          </motion.div>
        </div>

        {/* Navigation */}
        {items.length > 1 && (
          <div className="absolute right-6 lg:right-8 bottom-9 z-20 flex items-center gap-1.5">
            <span className="text-[13px] text-white/40 font-mono tabular-nums mr-1">
              {String(current + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
            </span>
            <button
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-black/40 text-white/70 hover:bg-black/60 hover:text-white transition-all backdrop-blur-sm "
              onClick={(e) => { e.stopPropagation(); changeBanner((current - 1 + items.length) % items.length); }}
              aria-label="이전"
            >
              <LuChevronLeft className="size-4" />
            </button>
            <button
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-black/40 text-white/70 hover:bg-black/60 hover:text-white transition-all backdrop-blur-sm "
              onClick={(e) => { e.stopPropagation(); changeBanner((current + 1) % items.length); }}
              aria-label="다음"
            >
              <LuChevronRight className="size-4" />
            </button>
          </div>
        )}

        {/* Progress bar */}
        {items.length > 1 && (
          <div className="absolute bottom-0 left-0 right-0 z-20 h-[3px] bg-white/10 rounded-b-2xl overflow-hidden">
            <div
              className="h-full bg-primary/80 transition-none"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        )}
      </div>

      {/* Dot indicators */}
      {items.length > 1 && (
        <div className="absolute -bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5">
          {items.map((_, i) => (
            <button key={i} onClick={(e) => { e.stopPropagation(); changeBanner(i); }} aria-label={`배너 ${i + 1}`}>
              <span className={`block rounded-full transition-all duration-300 ${
                i === current ? 'w-5 h-1 bg-primary' : 'w-1.5 h-1.5 bg-white/30 hover:bg-white/50'
              }`} />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

/* ── Banner Card Strip ── */
function BannerCardStrip({
  items,
  current,
  changeBanner,
}: {
  items: Banner[];
  current: number;
  changeBanner: (i: number) => void;
}) {
  const stripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = stripRef.current;
    if (!container) return;
    const activeCard = container.children[current] as HTMLElement | undefined;
    if (!activeCard) return;
    const left = activeCard.offsetLeft - container.offsetWidth / 2 + activeCard.offsetWidth / 2;
    container.scrollTo({ left, behavior: 'smooth' });
  }, [current]);

  return (
    <div className="relative">

      <div
        ref={stripRef}
        className="flex justify-center gap-3 overflow-x-auto overscroll-x-none scrollbar-hide py-2 px-8 snap-x snap-mandatory"
        style={{ overscrollBehaviorX: 'none' }}
        onWheel={(e) => {
          if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
            const el = e.currentTarget;
            el.style.overflow = 'hidden';
            requestAnimationFrame(() => { el.style.overflow = 'auto'; });
          }
        }}
      >
        {items.map((banner, i) => {
          const isActive = i === current;
          return (
            <button
              key={i}
              onClick={() => changeBanner(i)}
              className={cn(
                'relative flex-shrink-0 w-[220px] xl:w-[240px] aspect-video rounded-lg overflow-hidden transition-all duration-300 group/card snap-start',
                isActive
                  ? 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-[1.02]'
                  : 'opacity-40 hover:opacity-70 border border-border-subtle',
              )}
              style={{ transitionTimingFunction: 'var(--ease-out-expo)' }}
            >
              {banner.imageUrl ? (
                <img src={banner.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0" style={{ background: banner.gradient }} />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {isActive && (
                <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 h-[18px] px-2 rounded-full bg-primary/90 text-[11px] font-bold text-primary-foreground tracking-wide">
                    <LuPlay className="size-2.5 fill-current" />
                    NOW
                  </span>
                </div>
              )}

              <span className="absolute top-2 right-2 text-[12px] font-mono text-white/40 tabular-nums">
                {String(i + 1).padStart(2, '0')}
              </span>

              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className={cn(
                  'text-[14px] font-semibold leading-snug line-clamp-2 transition-colors',
                  isActive ? 'text-white' : 'text-white/80',
                )}>
                  {banner.title}
                </p>
                <p className="text-[12px] text-white/40 mt-0.5 line-clamp-1">{banner.subtitle}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Live Section ─────────────────────────────────────── */
function LiveSection({ items }: { items: import('@/types/content').ContentItem[] }) {
  return (
    <>
      <div className="flex items-center justify-between pb-3.5 border-b border-border-subtle">
        <div className="flex items-center gap-3">
          <span className="inline-block w-[3px] h-5 rounded-full bg-pochak-live shadow-[0_0_8px_rgba(255,23,68,0.5)]" />
          <h2 className="text-[19px] font-bold tracking-[-0.03em] text-white/95">공식 라이브</h2>
          <span className="flex items-center gap-1.5 h-[22px] px-2.5 rounded-full bg-pochak-live/12 border border-pochak-live/20 text-pochak-live text-[13px] font-bold tracking-wide">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-pochak-live animate-[pulse-live_1.5s_ease-in-out_infinite]" />
            LIVE
          </span>
        </div>
        <Link
          to="/contents?type=LIVE"
          className="flex items-center gap-0.5 text-[14px] font-medium text-pochak-text-tertiary hover:text-primary transition-colors duration-200 group"
        >
          전체보기
          <LuChevronRight className="size-3.5 group-hover:translate-x-0.5 transition-transform duration-200" />
        </Link>
      </div>
      <div className="mt-4">
        <HScrollRow>
          {items.map((c) => (
            <VideoCard
              key={c.id}
              id={c.id}
              title={c.homeTeam && c.awayTeam ? `${c.homeTeam} vs ${c.awayTeam}` : c.title}
              competition={`${c.competition} | ${c.sport}`}
              type={c.type}
              tags={c.tags}
              date={c.date}
              isLive={c.isLive}
              isFree={c.isFree}
              viewCount={c.viewCount}
              thumbnailUrl={c.thumbnailUrl}
              homeTeam={c.homeTeam}
              awayTeam={c.awayTeam}
            />
          ))}
        </HScrollRow>
      </div>
    </>
  );
}

/* ── Content Section ──────────────────────────────────── */
function ContentSection({
  title, linkTo, children, accent,
}: {
  title: string;
  linkTo: string;
  children: React.ReactNode;
  accent?: 'clip' | 'vod';
}) {
  return (
    <>
      <SectionHeader title={title} linkTo={linkTo} accent={accent} />
      <div className="mt-4">
        <HScrollRow>{children}</HScrollRow>
      </div>
    </>
  );
}

/* ── Teams Section ───────────────────────────────────── */
function TeamsSection({ items }: { items: import('@/types/content').Channel[] }) {
  return (
    <>
      <SectionHeader title="인기 팀/클럽" linkTo="/teams" />
      <HScrollRow scrollAmount={320} className="mt-4">
        {items.map((ch) => (
          <TeamLogoCard key={ch.id} {...ch} followers={ch.followers} />
        ))}
      </HScrollRow>
    </>
  );
}

/* ── Home Page ─────────────────────────────────────────── */
export default function HomePage() {
  const { data: homeData } = useHome();
  const { data: clipData } = useContents('CLIP');
  const { data: teams } = useTeams();
  const { data: competitionList } = useCompetitions();

  const banners = homeData.banners;
  const liveContents = homeData.liveNow;
  const vodContents = homeData.recommended;
  const clipContents = clipData;
  const channels = teams;
  const competitions = competitionList;

  const [bannerIndex, setBannerIndex] = useState(0);
  const [bannerProgress, setBannerProgress] = useState(0);
  const progressRef = useRef<number>(0);
  const lastTickRef = useRef<number>(Date.now());

  const changeBanner = useCallback((newIndex: number) => {
    setBannerIndex(newIndex);
    setBannerProgress(0);
    progressRef.current = 0;
    lastTickRef.current = Date.now();
  }, []);

  /* Auto-rotate banner with progress tracking */
  useEffect(() => {
    if (banners.length <= 1) return;
    let rafId: number;

    const tick = () => {
      const now = Date.now();
      const delta = now - lastTickRef.current;
      lastTickRef.current = now;
      progressRef.current += delta / BANNER_INTERVAL;

      if (progressRef.current >= 1) {
        setBannerIndex((p) => (p + 1) % banners.length);
        progressRef.current = 0;
      }

      setBannerProgress(progressRef.current);
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div className="px-6 lg:px-8">
      <HeroBanner items={banners} current={bannerIndex} changeBanner={changeBanner} progress={bannerProgress} />

      {/* Banner Card Strip */}
      <div className="mb-16">
        <BannerCardStrip items={banners} current={bannerIndex} changeBanner={changeBanner} />
      </div>

      <div className="flex flex-col gap-5">
        {/* 진행중인 대회 */}
        <div className="py-4">
          <SectionHeader title="진행중인 대회" linkTo="/competition" />
          <div className="mt-4">
            <HScrollRow>
              {competitions.map((c) => (
                <CompetitionBannerCard key={c.id} {...c} imageUrl={c.imageUrl} className="w-[200px] xl:w-[220px]" />
              ))}
            </HScrollRow>
          </div>
        </div>

        <div className="py-4">
          <LiveSection items={liveContents} />
        </div>

        <div className="py-4">
          <ContentSection title="인기 클립" linkTo="/contents?type=CLIP" accent="clip">
            {clipContents.map((clip) => (
              <ClipCard key={clip.id} id={clip.id} title={clip.title} viewCount={clip.viewCount} thumbnailUrl={clip.thumbnailUrl} />
            ))}
          </ContentSection>
        </div>

        <div className="py-4">
          <ContentSection title="최근 영상" linkTo="/contents?type=VOD" accent="vod">
            {vodContents.map((v) => (
              <VideoCard key={v.id} id={v.id} title={v.title} competition={`${v.competition} | ${v.sport}`} type={v.type} duration={v.duration} date={v.date} viewCount={v.viewCount} thumbnailUrl={v.thumbnailUrl} />
            ))}
          </ContentSection>
        </div>

        <div className="py-4">
          <TeamsSection items={channels} />
        </div>

        <div className="py-4">
          <ContentSection title="팀/클럽 라이브" linkTo="/contents?type=LIVE">
            {liveContents.slice(0, 5).map((c) => (
              <VideoCard key={`tl-${c.id}`} id={c.id} title={c.title} competition={c.competition} type={c.type} duration={c.duration} isLive={c.isLive} viewCount={c.viewCount} />
            ))}
          </ContentSection>
        </div>

        <div className="py-4">
          <ContentSection title="팀/클럽 클립" linkTo="/contents?type=CLIP" accent="clip">
            {clipContents.slice(0, 7).map((clip) => (
              <ClipCard key={`tc-${clip.id}`} id={clip.id} title={clip.title} viewCount={clip.viewCount} />
            ))}
          </ContentSection>
        </div>
      </div>

      <div className="h-10" />
    </div>
  );
}
