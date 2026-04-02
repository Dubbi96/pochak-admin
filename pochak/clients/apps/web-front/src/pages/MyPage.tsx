import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LuPencil } from 'react-icons/lu';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import HScrollRow from '@/components/HScrollRow';
import SectionHeader from '@/components/SectionHeader';
import { VideoCard, ClipCard, TeamLogoCard, CompetitionBannerCard } from '@/components/Card';
import FilterChip from '@/components/FilterChip';
import ProfileSidebar from '@/components/ProfileSidebar';

import { useContents, useTeams, useCompetitions } from '@/hooks/useApi';

/* ── Main Page ─────────────────────────────────────────── */
export default function MyPage() {
  const { data: vodContents } = useContents('VOD');
  const { data: clipContents } = useContents('CLIP');
  const { data: channels } = useTeams();
  const { data: competitions } = useCompetitions();
  return (
    <div className="flex gap-8">
      <ProfileSidebar />
      <div className="flex-1 min-w-0">
        {/* Profile Header */}
        <div className="flex items-center gap-5 mb-6">
          <div className="size-[80px] rounded-full bg-pochak-surface flex items-center justify-center flex-shrink-0 border border-border-subtle">
            <img src="/pochak-icon.svg" alt="프로필" className="w-10 h-10" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[22px] font-bold text-pochak-text">pochak2026</h1>
              <Link to="/settings" className="text-pochak-text-secondary hover:text-pochak-text transition-colors">
                <LuPencil className="w-4 h-4" />
              </Link>
            </div>
            <p className="text-[15px] text-pochak-text-secondary mt-0.5">email@address.com</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="home">
          <TabsList className="w-full justify-start mb-6">
            <TabsTrigger value="home">홈</TabsTrigger>
            <TabsTrigger value="history">시청이력</TabsTrigger>
            <TabsTrigger value="myclip">내클립</TabsTrigger>
            <TabsTrigger value="reservation">시청예약</TabsTrigger>
            <TabsTrigger value="favorites">즐겨찾기</TabsTrigger>
          </TabsList>

          <TabsContent value="home"><MyHomeTab /></TabsContent>
          <TabsContent value="history"><WatchHistoryTab /></TabsContent>
          <TabsContent value="myclip"><MyClipsTab /></TabsContent>
          <TabsContent value="reservation"><ReservationTab /></TabsContent>
          <TabsContent value="favorites"><FavoritesTab /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

/* ── Section wrapper ── */
function RevealSection({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

/* ── Tab Contents ──────────────────────────────────────── */

function MyHomeTab() {
  const { data: vodContents } = useContents('VOD');
  const { data: clipContents } = useContents('CLIP');
  const { data: channels } = useTeams();
  const { data: competitions } = useCompetitions();
  return (
    <div className="flex flex-col gap-8">
      <RevealSection>
        <section>
          <SectionHeader title="최근 본 영상" linkTo="#" linkLabel="정렬" />
          <HScrollRow>
            {vodContents.map((v) => (
              <VideoCard key={v.id} id={v.id} title={v.title} competition={v.competition} type={v.type} tags={v.tags} duration={v.duration} date={v.date} viewCount={v.viewCount} thumbnailUrl={v.thumbnailUrl} className="w-[260px]" />
            ))}
          </HScrollRow>
        </section>
      </RevealSection>

      <RevealSection>
        <section>
          <SectionHeader title="최근 본 클립" linkTo="#" linkLabel="정렬" />
          <HScrollRow scrollAmount={180}>
            {clipContents.map((c) => (
              <ClipCard key={c.id} id={c.id} title={c.title} viewCount={c.viewCount} thumbnailUrl={c.thumbnailUrl} className="w-[140px]" />
            ))}
          </HScrollRow>
        </section>
      </RevealSection>

      <RevealSection>
        <section>
          <SectionHeader title="내 클립" linkTo="#" linkLabel="정렬" />
          <HScrollRow scrollAmount={180}>
            {clipContents.slice(0, 5).map((c) => (
              <ClipCard key={c.id} id={c.id} title={c.title} viewCount={c.viewCount} thumbnailUrl={c.thumbnailUrl} className="w-[140px]" />
            ))}
          </HScrollRow>
        </section>
      </RevealSection>

      <RevealSection>
        <section>
          <SectionHeader title="즐겨찾는 대회" linkTo="#" linkLabel="정렬" />
          <HScrollRow>
            {competitions.map((c) => (
              <CompetitionBannerCard key={c.id} {...c} imageUrl={c.imageUrl} className="w-[220px]" />
            ))}
          </HScrollRow>
        </section>
      </RevealSection>

      <RevealSection>
        <section>
          <SectionHeader title="즐겨찾는 팀/클럽" linkTo="#" linkLabel="정렬" />
          <HScrollRow scrollAmount={220}>
            {channels.map((ch) => (
              <TeamLogoCard key={ch.id} {...ch} />
            ))}
          </HScrollRow>
        </section>
      </RevealSection>
    </div>
  );
}

function WatchHistoryTab() {
  const { data: vodContents } = useContents('VOD');
  const { data: clipContents } = useContents('CLIP');
  const [mode, setMode] = useState<'영상' | '클립'>('영상');
  return (
    <div>
      <div className="flex gap-0 mb-6 border-b border-white/[0.06]">
        {(['영상', '클립'] as const).map((m) => (
          <FilterChip
            key={m}
            label={m}
            selected={mode === m}
            onClick={() => setMode(m)}
          />
        ))}
      </div>
      {mode === '영상' ? (
        <div className="grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-7 gap-4">
          {vodContents.map((v) => (
            <VideoCard key={v.id} id={v.id} title={v.title} competition={v.competition} type={v.type} tags={v.tags} duration={v.duration} date={v.date} viewCount={v.viewCount} thumbnailUrl={v.thumbnailUrl} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3">
          {clipContents.map((c) => (
            <ClipCard key={c.id} id={c.id} title={c.title} viewCount={c.viewCount} thumbnailUrl={c.thumbnailUrl} />
          ))}
        </div>
      )}
    </div>
  );
}

function MyClipsTab() {
  const { data: clipContents } = useContents('CLIP');
  return (
    <div className="grid grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3">
      {clipContents.map((c) => (
        <ClipCard key={c.id} id={c.id} title={c.title} viewCount={c.viewCount} thumbnailUrl={c.thumbnailUrl} />
      ))}
    </div>
  );
}

function ReservationTab() {
  const { data: vodContents } = useContents('VOD');
  const dates = ['2026.01.01', '2026.01.02', '2026.01.03'];
  return (
    <div className="flex flex-col gap-8">
      {dates.map((d, di) => (
        <section key={d}>
          <h3 className="text-[16px] font-bold text-pochak-text mb-4">{d} | D{di === 0 ? '-Day' : `+${di}`}</h3>
          <HScrollRow>
            {vodContents.slice(0, 5).map((v) => (
              <VideoCard key={v.id} id={v.id} title={v.title} competition={v.competition} type="LIVE" tags={v.tags} date={d} thumbnailUrl={v.thumbnailUrl} className="w-[240px]" />
            ))}
          </HScrollRow>
        </section>
      ))}
    </div>
  );
}

function FavoritesTab() {
  const { data: vodContents } = useContents('VOD');
  const { data: channels } = useTeams();
  const { data: competitions } = useCompetitions();
  const [mode, setMode] = useState<'팀/클럽' | '대회'>('팀/클럽');
  return (
    <div>
      <div className="flex gap-0 mb-6 border-b border-white/[0.06]">
        {(['팀/클럽', '대회'] as const).map((m) => (
          <FilterChip
            key={m}
            label={m}
            selected={mode === m}
            onClick={() => setMode(m)}
          />
        ))}
      </div>
      {mode === '팀/클럽' ? (
        <div className="flex flex-col gap-8">
          <HScrollRow scrollAmount={220}>
            {channels.map((ch) => (
              <TeamLogoCard key={ch.id} {...ch} />
            ))}
          </HScrollRow>
          {channels.slice(0, 3).map((ch) => (
            <section key={ch.id}>
              <SectionHeader title={ch.name} linkTo="#" linkLabel="더보기" />
              <HScrollRow>
                {vodContents.slice(0, 6).map((v) => (
                  <VideoCard key={v.id} id={v.id} title={v.title} competition={v.competition} type={v.type} tags={v.tags} duration={v.duration} date={v.date} viewCount={v.viewCount} thumbnailUrl={v.thumbnailUrl} className="w-[240px]" />
                ))}
              </HScrollRow>
            </section>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
          {competitions.map((c) => (
            <CompetitionBannerCard key={c.id} {...c} imageUrl={c.imageUrl} />
          ))}
        </div>
      )}
    </div>
  );
}
