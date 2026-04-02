import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  LuMapPin, LuClock, LuPhone, LuCalendarDays,
  LuChevronRight, LuBookmark, LuShare2, LuNavigation,
} from 'react-icons/lu';
import FilterChip from '@/components/FilterChip';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import HScrollRow from '@/components/HScrollRow';
import { VideoCard } from '@/components/Card';
import { useContents, useTeams } from '@/hooks/useApi';
import ReservationFlow from '@/components/ReservationFlow';

const mockVenues: Record<string, {
  id: string; name: string; district: string; sport: string;
  address: string; phone: string; hours: string; note: string;
  color: string; imageUrl: string; facilities: string[];
  description: string;
}> = {
  v1: { id: 'v1', name: '잠실 유소년 야구장', district: '서울 송파구', sport: '야구', address: '서울특별시 송파구 잠실동 10-2', phone: '02-1234-5678', hours: '09:00 ~ 21:00', note: '오늘 18:00까지 예약 가능', color: '#165DFF', imageUrl: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=1200&h=500&fit=crop', facilities: ['야간조명', '주차장', '샤워실', '관람석 200석'], description: '서울 송파구에 위치한 유소년 전용 야구장입니다. 국제 규격에 맞춘 시설을 갖추고 있으며, 주말 리그와 대회가 활발히 진행됩니다.' },
  v2: { id: 'v2', name: '화성 드림파크 풋살 센터', district: '경기 화성시', sport: '풋살', address: '경기도 화성시 우정읍 체육로 17', phone: '031-9876-5432', hours: '06:00 ~ 23:00', note: '야간 조명 운영', color: '#00A76F', imageUrl: 'https://images.unsplash.com/photo-1552667466-07770ae110d0?w=1200&h=500&fit=crop', facilities: ['인조잔디', '야간조명', '주차장', '탈의실'], description: '경기 화성에 위치한 최신 풋살 센터입니다. 3개의 풋살 코트를 보유하고 있으며, 야간 조명 시설이 완비되어 있습니다.' },
};

const defaultVenue = mockVenues.v1;

const tabs = ['소개', '예약하기', '일정', '경기영상', '시설정보'] as const;

export default function VenueDetailPage() {
  const { id = 'v1' } = useParams<{ id: string }>();
  const [isSaved, setIsSaved] = useState(false);
  const { data: liveContents } = useContents('LIVE');
  const { data: vodContents } = useContents('VOD');
  const { data: channels } = useTeams();

  const venue = mockVenues[id] ?? defaultVenue;

  return (
    <div className="md:px-6 lg:px-8 flex flex-col gap-8">
      {/* ── Banner ── */}
      <section className="relative rounded-2xl overflow-hidden border border-border-subtle">
        <div className="absolute inset-0">
          <img src={venue.imageUrl} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-[#0f0f0f]/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f0f0f]/70 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 p-6 lg:p-8 pt-20 lg:pt-28">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <FilterChip
                label={venue.sport}
                selected
              />
              <h1 className="text-[32px] font-bold tracking-[-0.04em] text-white">{venue.name}</h1>
              <p className="mt-2 flex items-center gap-2 text-[15px] text-white/55">
                <LuMapPin className="h-4 w-4 flex-shrink-0" />
                {venue.address}
              </p>
              <p className="mt-1 flex items-center gap-2 text-[14px] text-white/40">
                <LuClock className="h-3.5 w-3.5 flex-shrink-0" />
                {venue.hours}
              </p>
            </div>

            <div className="flex gap-2 flex-shrink-0">
              <Button
                variant="outline"
                className="gap-1.5 border-white/[0.15] hover:border-white/[0.3] hover:bg-white/[0.06]"
                onClick={() => window.open(`https://map.naver.com/v5/search/${encodeURIComponent(venue.address)}`, '_blank')}
              >
                <LuNavigation className="h-4 w-4" />
                길찾기
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setIsSaved(!isSaved)} className={`border ${isSaved ? 'text-primary border-primary' : 'border-white/[0.15] hover:border-white/[0.3]'}`}>
                <LuBookmark className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="border border-white/[0.15] hover:border-white/[0.3]">
                <LuShare2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Info Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: LuMapPin, label: '위치', value: venue.district },
          { icon: LuClock, label: '운영시간', value: venue.hours },
          { icon: LuPhone, label: '연락처', value: venue.phone },
          { icon: LuCalendarDays, label: '비고', value: venue.note },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="rounded-xl bg-pochak-surface p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon className="h-4 w-4 text-primary" />
                <span className="text-[13px] text-white/40 uppercase tracking-wider">{item.label}</span>
              </div>
              <p className="text-[14px] font-medium text-white/80">{item.value}</p>
            </div>
          );
        })}
      </div>

      {/* ── Tabs ── */}
      <section className="py-4">
        <Tabs defaultValue="소개">
          <TabsList className="w-full justify-start mb-6">
            {tabs.map((tab) => (
              <TabsTrigger key={tab} value={tab}>{tab}</TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="소개">
            <div className="flex flex-col gap-8">
              <div>
                <h3 className="text-[17px] font-bold text-white mb-3">시설 소개</h3>
                <p className="text-[15px] leading-7 text-white/60">{venue.description}</p>
              </div>

              <div>
                <h3 className="text-[17px] font-bold text-white mb-3">시설 안내</h3>
                <div className="flex flex-wrap gap-2">
                  {venue.facilities.map((f) => (
                    <FilterChip key={f} label={f} selected={false} />
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-[17px] font-bold text-white mb-3">연결된 팀/클럽</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {channels.slice(0, 4).map((club) => (
                    <Link
                      key={club.id}
                      to={`/team/${club.id}`}
                      className="flex items-center gap-3 rounded-lg bg-pochak-surface p-3 hover:border-white/[0.22] transition-all group"
                    >
                      <div
                        className="h-9 w-9 rounded-full flex items-center justify-center text-[13px] font-bold text-white border border-white/15 flex-shrink-0"
                        style={{ backgroundColor: club.color }}
                      >
                        {club.initial}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[14px] font-medium text-white/80 truncate group-hover:text-primary transition-colors">{club.name}</p>
                        <p className="text-[12px] text-white/35 truncate">{club.subtitle}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="예약하기">
            <ReservationFlow venueId={venue.id} venueName={venue.name} />
          </TabsContent>

          <TabsContent value="일정">
            <div className="flex flex-col gap-4">
              {['2026.01.15 (토)', '2026.01.16 (일)', '2026.01.22 (토)'].map((date) => (
                <div key={date} className="rounded-xl border border-border-subtle bg-pochak-surface p-4">
                  <p className="text-[15px] font-bold text-white mb-3">{date}</p>
                  <div className="flex flex-col gap-2">
                    {[
                      { time: '10:00', match: '동대문 리틀야구 vs 군포시 리틀야구', status: '예정' },
                      { time: '14:00', match: '서초 FC vs 강남 FC', status: '예정' },
                    ].map((m, i) => (
                      <div key={i} className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-3">
                          <span className="text-[14px] font-mono text-primary w-12">{m.time}</span>
                          <span className="text-[14px] text-white/75">{m.match}</span>
                        </div>
                        <FilterChip label={m.status} selected={false} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="경기영상">
            <HScrollRow>
              {[...liveContents.slice(0, 3), ...vodContents.slice(0, 3)].map((c) => (
                <VideoCard
                  key={c.id}
                  id={c.id}
                  title={c.title}
                  competition={c.competition}
                  type={c.type}
                  duration={c.duration}
                  date={c.date}
                  viewCount={c.viewCount}
                  thumbnailUrl={c.thumbnailUrl}
                  isLive={c.isLive}
                  className="w-[240px]"
                />
              ))}
            </HScrollRow>
          </TabsContent>

          <TabsContent value="시설정보">
            <div className="flex flex-col gap-6">
              <div className="rounded-xl border border-border-subtle bg-pochak-surface p-5">
                <h3 className="text-[15px] font-bold text-white mb-4">편의시설</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {venue.facilities.map((f) => (
                    <div key={f} className="rounded-lg bg-white/[0.04] border border-border-subtle py-3 text-center text-[14px] text-white/65">
                      {f}
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-border-subtle bg-pochak-surface p-5">
                <h3 className="text-[15px] font-bold text-white mb-3">이용 안내</h3>
                <ul className="flex flex-col gap-2 text-[14px] text-white/55 leading-6">
                  <li>- 예약은 최소 1일 전까지 가능합니다.</li>
                  <li>- 우천 시 실외 시설은 이용이 제한될 수 있습니다.</li>
                  <li>- 주차장은 선착순 운영됩니다.</li>
                  <li>- 개인 장비를 지참해 주세요.</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
