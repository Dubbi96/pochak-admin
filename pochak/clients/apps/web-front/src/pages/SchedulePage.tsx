import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LuChevronDown, LuPlay, LuBell, LuMonitor, LuEllipsis } from 'react-icons/lu';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import HScrollRow from '@/components/HScrollRow';
import { useCompetitions, useTeams } from '@/hooks/useApi';

const sportTabs = ['이달의대회', '#축구', '#야구', '#배구', '#핸드볼', '#농구', '#기타'] as const;
const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
// Each month's competition count
const monthEventCount: Record<number, number> = { 1: 4, 2: 3, 3: 2, 4: 5, 7: 1, 10: 3 };

type MatchState = 'done' | 'live' | 'upcoming';
interface Match {
  id: string; time: string; homeTeam: string; awayTeam: string;
  homeScore: number | null; awayScore: number | null; status: string; venue: string; state: MatchState;
}

const mockMatchDays: { date: string; matches: Match[] }[] = [
  { date: '2026.01.01 (토)', matches: [
    { id: '1', time: '01:30', homeTeam: '동대문구 리틀야구', awayTeam: '군포시 리틀야구', homeScore: 5, awayScore: 2, status: '준결승 | 승부차기(3-2)', venue: '화성드림파크야구장 (1구장)', state: 'done' },
    { id: '2', time: '01:30', homeTeam: '동대문구 리틀야구', awayTeam: '군포시 리틀야구', homeScore: 5, awayScore: 2, status: '준결승 | 승부차기(3-2)', venue: '화성드림파크야구장 (1구장)', state: 'done' },
    { id: '3', time: '01:30', homeTeam: '동대문구 리틀야구', awayTeam: '군포시 리틀야구', homeScore: 5, awayScore: 2, status: '준결승 | 승부차기(3-2)', venue: '화성드림파크야구장 (1구장)', state: 'done' },
  ]},
  { date: '2026.01.01 (토)', matches: [
    { id: '4', time: '01:30', homeTeam: '동대문구 리틀야구', awayTeam: '군포시 리틀야구', homeScore: 5, awayScore: 2, status: '준결승 | 승부차기(3-2)', venue: '화성드림파크야구장 (1구장)', state: 'done' },
    { id: '5', time: '01:30', homeTeam: '동대문구 리틀야구', awayTeam: '군포시 리틀야구', homeScore: 5, awayScore: 2, status: '준결승 | 승부차기(3-2)', venue: '화성드림파크야구장 (1구장)', state: 'live' },
    { id: '6', time: '01:30', homeTeam: '동대문구 리틀야구', awayTeam: '군포시 리틀야구', homeScore: 5, awayScore: 2, status: '준결승 | 승부차기(3-2)', venue: '화성드림파크야구장 (1구장)', state: 'live' },
  ]},
  { date: '2026.01.01 (토)', matches: [
    { id: '7', time: '01:30', homeTeam: '동대문구 리틀야구', awayTeam: '군포시 리틀야구', homeScore: null, awayScore: null, status: '준결승', venue: '화성드림파크야구장 (1구장)', state: 'upcoming' },
    { id: '8', time: '01:30', homeTeam: '동대문구 리틀야구', awayTeam: '군포시 리틀야구', homeScore: null, awayScore: null, status: '준결승', venue: '화성드림파크야구장 (1구장)', state: 'upcoming' },
    { id: '9', time: '01:30', homeTeam: '동대문구 리틀야구', awayTeam: '군포시 리틀야구', homeScore: null, awayScore: null, status: '준결승', venue: '화성드림파크야구장 (1구장)', state: 'upcoming' },
  ]},
];

/* ── Competition Card matching design spec ───────────── */
function CompCard({ name, dateRange, imageUrl, id }: { name: string; dateRange: string; imageUrl?: string; id: string }) {
  return (
    <Link to={`/competition/${id}`} className="block rounded-xl overflow-hidden bg-bg-surface-1 border border-border-subtle hover:border-white/[0.16] transition-all group">
      {/* Banner - taller to match design */}
      <div className="aspect-[16/10] relative overflow-hidden">
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-300" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a2e4a] via-[#0d1b2a] to-[#091428]" />
        )}
      </div>
      {/* Info row */}
      <div className="px-4 py-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[15px] text-foreground font-semibold truncate">{name}</p>
          <p className="text-[14px] text-pochak-text-tertiary mt-0.5">{dateRange}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[13px] text-pochak-text-muted">야구 | 유료 | 해설</span>
          <button className="text-pochak-text-muted hover:text-foreground transition-colors">
            <LuEllipsis className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Link>
  );
}

export default function SchedulePage() {
  const { data: competitions } = useCompetitions();
  const { data: channels } = useTeams();
  const [selectedMonth, setSelectedMonth] = useState(0);

  return (
    <div className="py-6">
      <Tabs defaultValue="이달의대회">
        {/* Tab bar - centered like design */}
        <div className="flex justify-center mb-6">
          <TabsList>
            {sportTabs.map((tab) => (
              <TabsTrigger key={tab} value={tab}>{tab}</TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Year / Month selector - centered like design */}
        <div className="flex items-center justify-center gap-5 pb-6">
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-card border border-border-subtle text-[14px] text-foreground hover:bg-white/[0.06] transition-colors flex-shrink-0">
            2026년 <LuChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          <div className="flex items-center gap-1">
            {months.map((m, i) => {
              const isSelected = selectedMonth === i;
              const count = monthEventCount[m] ?? 0;
              return (
                <button
                  key={m}
                  onClick={() => setSelectedMonth(i)}
                  className="flex flex-col items-center w-10"
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[14px] font-medium transition-colors ${
                    isSelected
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.06]'
                  }`}>
                    {m}월
                  </div>
                  {/* Fixed height - show count or invisible placeholder */}
                  <span className={`text-[13px] font-semibold leading-none h-4 flex items-center mt-1 ${count > 0 ? 'text-primary' : 'text-transparent'}`}>
                    +{count || 0}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Spacer between calendar and content */}
        <div className="h-10 border-b border-border-subtle" />

        {/* ── 이달의대회 탭 - 대회 카드 3열 그리드 ─────── */}
        <TabsContent value="이달의대회" className="mt-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...competitions, ...competitions, ...competitions, ...competitions].map((c, i) => (
              <CompCard key={`${c.id}-${i}`} id={c.id} name={c.name} dateRange={c.dateRange} imageUrl={c.imageUrl} />
            ))}
          </div>
        </TabsContent>

        {/* ── 스포츠별 탭 - 대회 캐러셀 + 날짜별 경기 ──── */}
        {sportTabs.filter((t) => t !== '이달의대회').map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-8">
            {/* Competition carousel */}
            <HScrollRow className="mb-8">
              {[...competitions, ...competitions].map((c, i) => (
                <div
                  key={`${c.id}-${i}`}
                  className={`flex-shrink-0 w-[200px] rounded-xl border p-3 cursor-pointer text-center transition-colors ${
                    i === 2
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border-subtle hover:border-white/[0.16] text-foreground'
                  }`}
                >
                  <p className="text-[14px] font-medium">{c.name}</p>
                  <p className="text-[13px] text-pochak-text-tertiary mt-1">{c.dateRange}</p>
                </div>
              ))}
            </HScrollRow>

            {/* Match days */}
            <div className="flex flex-col gap-16">
              {mockMatchDays.map((day, di) => (
                <div key={di} className="rounded-xl overflow-hidden border border-border-subtle">
                  <div className="bg-white/[0.04] px-6 py-4">
                    <h3 className="text-[15px] font-bold text-foreground">{day.date}</h3>
                  </div>
                  <div className="divide-y divide-white/[0.04]">
                    {day.matches.map((match) => (
                      <div key={match.id} className="flex items-center gap-4 px-6 py-8 hover:bg-white/[0.02] transition-colors">
                        <span className={`text-[14px] font-mono w-12 flex-shrink-0 ${match.state === 'live' ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                          {match.time}
                        </span>
                        <div className="flex items-center gap-2.5 flex-1 min-w-0 justify-end">
                          <span className="text-[14px] text-foreground truncate">{match.homeTeam}</span>
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold text-white flex-shrink-0 border border-border-subtle" style={{ backgroundColor: channels[0]?.color || '#3b82f6' }}>
                            {channels[0]?.initial}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 w-[90px] justify-center">
                          {match.homeScore !== null ? (
                            <>
                              <span className={`text-[20px] font-bold ${match.state === 'live' ? 'text-primary' : 'text-foreground'}`}>{match.homeScore}</span>
                              <span className="text-pochak-text-muted text-[16px]">:</span>
                              <span className={`text-[20px] font-bold ${match.state === 'live' ? 'text-primary' : 'text-foreground'}`}>{match.awayScore}</span>
                            </>
                          ) : (
                            <><span className="text-[20px] text-pochak-text-muted">-</span><span className="text-pochak-text-muted text-[16px]">:</span><span className="text-[20px] text-pochak-text-muted">-</span></>
                          )}
                        </div>
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold text-white flex-shrink-0 border border-border-subtle" style={{ backgroundColor: channels[1]?.color || '#ef4444' }}>
                            {channels[1]?.initial}
                          </div>
                          <span className="text-[14px] text-foreground truncate">{match.awayTeam}</span>
                        </div>
                        <div className="flex-shrink-0 text-center w-[80px] hidden xl:block">
                          <p className="text-[13px] text-pochak-text-tertiary">{match.status}</p>
                        </div>
                        <span className={`text-[13px] truncate flex-shrink-0 w-[140px] text-right hidden lg:block ${match.state === 'live' ? 'text-primary' : 'text-pochak-text-muted'}`}>
                          {match.venue}
                        </span>
                        <div className="flex-shrink-0">
                          {match.state === 'done' ? (
                            <Link to="/contents/vod/v1" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] border border-border-subtle text-[14px] font-medium text-foreground transition-colors">
                              <LuPlay className="w-3 h-3" /> 다시보기
                            </Link>
                          ) : match.state === 'live' ? (
                            <Link to="/contents/live/l1" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-primary/30 text-[14px] font-medium text-primary hover:bg-primary/10 transition-colors">
                              <LuMonitor className="w-3 h-3" /> 시청하기
                            </Link>
                          ) : (
                            <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] border border-border-subtle text-[14px] font-medium text-muted-foreground transition-colors">
                              <LuBell className="w-3 h-3" /> 시청예약
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
