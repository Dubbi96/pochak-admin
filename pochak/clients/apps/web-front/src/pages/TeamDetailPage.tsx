import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { LuBell, LuBellRing, LuBellOff, LuChevronDown, LuChevronRight, LuThumbsUp, LuMessageSquare, LuShare2, LuX, LuGlobe, LuMail, LuCalendar, LuUsers, LuUserMinus, LuVideo, LuMapPin, LuCheck } from 'react-icons/lu';

/* YouTube-style subscriber count: 1.2만명, 8.3K, etc */
function formatSubscribers(n: number): string {
  if (n >= 10000) return `${(n / 10000).toFixed(1).replace(/\.0$/, '')}만명`;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}K명`;
  return `${n}명`;
}
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import HScrollRow from '@/components/HScrollRow';
import SectionHeader from '@/components/SectionHeader';
import FilterChip from '@/components/FilterChip';
import { VideoCard, ClipCard, TeamLogoCard } from '@/components/Card';
import { useTeamDetail } from '@/hooks/useApi';
import { useContents, useTeams, useCompetitions } from '@/hooks/useApi';

const tabs = ['홈', '영상', '클립', '라이브', '일정', '커뮤니티', '정보'] as const;

export default function TeamDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const { data: team } = useTeamDetail(id);
  const { data: liveContents } = useContents('LIVE');
  const { data: vodContents } = useContents('VOD');
  const { data: clipContents } = useContents('CLIP');
  const { data: channels } = useTeams();
  const { data: competitions } = useCompetitions();
  const [isJoined, setIsJoined] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [notifSetting, setNotifSetting] = useState<'all' | 'custom' | 'none'>('custom');

  const teamData = team ?? { id: '', name: '', color: '#888', initial: '', subtitle: '', followers: 0 };

  return (
    <div>
      {/* ── YouTube-style Channel Banner ── */}
      <div className="-mx-6 lg:-mx-8">
        <div className="h-[160px] lg:h-[200px] w-full overflow-hidden" style={{ background: `linear-gradient(135deg, ${teamData.color}40, ${teamData.color}10, #0f0f0f)` }}>
          {teamData.imageUrl && (
            <img src={teamData.imageUrl} alt="" className="w-full h-full object-cover opacity-40" />
          )}
        </div>
      </div>

      {/* ── YouTube-style Channel Info ── */}
      <div className="flex items-start gap-6 mt-6 mb-8">
        {/* Avatar - large like YouTube */}
        <div
          className="w-[120px] h-[120px] rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: teamData.color }}
        >
          {teamData.imageUrl ? (
            <img src={teamData.imageUrl} alt="" className="w-full h-full rounded-full object-cover" />
          ) : (
            <span className="text-[42px] font-bold text-white">{teamData.initial}</span>
          )}
        </div>

        {/* Channel info - stacked vertically like YouTube */}
        <div className="flex-1 min-w-0 pt-1">
          <h1 className="text-[28px] lg:text-[36px] font-bold text-pochak-text">{teamData.name}</h1>

          <div className="flex items-center gap-1 mt-2 text-[14px] text-pochak-text-secondary">
            <span>@{teamData.name.replace(/\s/g, '').toLowerCase()}</span>
            <span className="mx-1">·</span>
            <span>구독자 {formatSubscribers(teamData.followers ?? 12400)}</span>
            <span className="mx-1">·</span>
            <span>영상 {vodContents.length}개</span>
          </div>

          <p className="text-[14px] text-pochak-text-secondary mt-2 line-clamp-1">
            스포츠는 정해진 규칙과 공정성을 바탕으로 신체 능력, 기술, 전략, 정신력을 겨루는 인간 활동이다.
            <button onClick={() => setShowAbout(true)} className="text-pochak-text ml-1 cursor-pointer hover:text-white">...더보기</button>
          </p>

          {/* Join / Notification button */}
          <div className="mt-5 relative">
            {!isJoined ? (
              <button
                onClick={() => { setIsJoined(true); setShowNotifMenu(false); }}
                style={{ paddingLeft: 24, paddingRight: 24, paddingTop: 10, paddingBottom: 10 }}
                className="rounded-full bg-white text-primary-foreground hover:bg-white/85 text-[14px] font-medium transition-all"
              >
                가입
              </button>
            ) : (
              <>
                <button
                  onClick={() => setShowNotifMenu(!showNotifMenu)}
                  style={{ paddingLeft: 20, paddingRight: 16, paddingTop: 10, paddingBottom: 10 }}
                  className="rounded-full bg-pochak-surface text-pochak-text hover:bg-pochak-surface-hover text-[14px] font-medium transition-all flex items-center gap-2.5"
                >
                  <LuBell className="w-[18px] h-[18px]" />
                  <span>가입됨</span>
                  <LuChevronDown className="w-4 h-4 text-pochak-text-secondary" />
                </button>

                {/* Notification dropdown */}
                {showNotifMenu && (
                  <>
                    <div className="fixed inset-0 z-[99]" onClick={() => setShowNotifMenu(false)} />
                    <div className="absolute top-full left-0 mt-2 w-[240px] bg-pochak-surface rounded-2xl py-3 z-[100]" style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.6)' }}>
                      {[
                        { key: 'all' as const, label: '전체', Icon: LuBellRing },
                        { key: 'custom' as const, label: '맞춤설정', Icon: LuBell },
                        { key: 'none' as const, label: '없음', Icon: LuBellOff },
                      ].map((opt) => (
                        <button
                          key={opt.key}
                          onClick={() => { setNotifSetting(opt.key); setShowNotifMenu(false); }}
                          className="flex items-center gap-4 w-full px-5 py-3.5 text-[14px] text-pochak-text hover:bg-pochak-surface-hover transition-colors"
                        >
                          <opt.Icon className="w-5 h-5 text-pochak-text-secondary" />
                          <span className="flex-1 text-left">{opt.label}</span>
                          {notifSetting === opt.key && <LuCheck className="w-5 h-5 text-pochak-text" />}
                        </button>
                      ))}
                      <div className="mx-4 my-1.5 border-t border-pochak-border" />
                      <button
                        onClick={() => { setIsJoined(false); setShowNotifMenu(false); }}
                        className="flex items-center gap-4 w-full px-5 py-3.5 text-[14px] text-pochak-text hover:bg-pochak-surface-hover transition-colors"
                      >
                        <LuUserMinus className="w-5 h-5 text-pochak-text-secondary" />
                        <span>가입 취소</span>
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── YouTube "더보기" About Modal ── */}
      {showAbout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setShowAbout(false)}>
          <div className="absolute inset-0 bg-black/70" />
          <div
            className="relative bg-pochak-surface rounded-2xl w-full max-w-[550px] max-h-[85vh] overflow-y-auto scrollbar-hide"
            style={{ padding: '32px 32px 40px' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-8">
              <h2 className="text-[24px] font-bold text-pochak-text">{teamData.name}</h2>
              <button onClick={() => setShowAbout(false)} className="w-10 h-10 rounded-full hover:bg-pochak-surface-hover flex items-center justify-center transition-colors flex-shrink-0 -mr-2 -mt-1">
                <LuX className="w-6 h-6 text-pochak-text" />
              </button>
            </div>

            {/* 설명 */}
            <div className="mb-8">
              <h3 className="text-[18px] font-bold text-pochak-text mb-4">설명</h3>
              <p className="text-[15px] text-pochak-text-secondary leading-7">
                스포츠는 정해진 규칙과 공정성을 바탕으로 신체 능력, 기술, 전략, 정신력을 겨루는 인간 활동이다. 개인과 팀은 반복된 훈련과 경쟁을 통해 한계를 극복하고 성장하며, 그 과정에서 협력과 존중, 책임을 배운다.
              </p>
              <p className="text-[15px] text-pochak-text-secondary leading-7 mt-4">
                꾸준히 하는게 목표!
              </p>
              <p className="text-[15px] text-pochak-text-secondary mt-4">club@pochak.com</p>
            </div>

            {/* 링크 */}
            <div className="mb-8">
              <h3 className="text-[18px] font-bold text-pochak-text mb-5">링크</h3>
              <div className="flex items-center gap-4 py-3">
                <div className="w-10 h-10 rounded-full bg-pochak-surface flex items-center justify-center flex-shrink-0">
                  <LuGlobe className="w-5 h-5 text-pochak-text-secondary" />
                </div>
                <div>
                  <p className="text-[15px] text-pochak-text">포착 공식</p>
                  <p className="text-[15px] text-[#3ea6ff]">pochak.com</p>
                </div>
              </div>
            </div>

            {/* 추가 정보 */}
            <div>
              <h3 className="text-[18px] font-bold text-pochak-text mb-5">추가 정보</h3>
              <div className="flex flex-col gap-5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-pochak-surface flex items-center justify-center flex-shrink-0">
                    <LuMail className="w-5 h-5 text-pochak-text-secondary" />
                  </div>
                  <span className="text-[15px] text-pochak-text-secondary">이메일 주소를 보려면 <span className="text-[#3ea6ff] cursor-pointer">로그인</span>하세요.</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-pochak-surface flex items-center justify-center flex-shrink-0">
                    <LuMapPin className="w-5 h-5 text-pochak-text-secondary" />
                  </div>
                  <span className="text-[15px] text-pochak-text">대한민국</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-pochak-surface flex items-center justify-center flex-shrink-0">
                    <LuCalendar className="w-5 h-5 text-pochak-text-secondary" />
                  </div>
                  <span className="text-[15px] text-pochak-text">가입일: 2025. 1. 1.</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-pochak-surface flex items-center justify-center flex-shrink-0">
                    <LuUsers className="w-5 h-5 text-pochak-text-secondary" />
                  </div>
                  <span className="text-[15px] text-pochak-text">구독자 {formatSubscribers(teamData.followers ?? 12400)}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-pochak-surface flex items-center justify-center flex-shrink-0">
                    <LuVideo className="w-5 h-5 text-pochak-text-secondary" />
                  </div>
                  <span className="text-[15px] text-pochak-text">영상 {vodContents.length}개</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── YouTube-style Tabs ── */}
      <Tabs defaultValue="홈">
        <TabsList className="w-full justify-start mb-6">
          {tabs.map((tab) => (
            <TabsTrigger key={tab} value={tab}>{tab}</TabsTrigger>
          ))}
        </TabsList>

        {/* 홈 탭 */}
        <TabsContent value="홈">
          <div className="flex flex-col gap-8">
            {/* Featured / Live */}
            <section>
              <SectionHeader title="라이브" />
              <HScrollRow>
                {liveContents.slice(0, 5).map((c) => (
                  <VideoCard key={c.id} id={c.id} title={c.title} competition={c.competition} type={c.type} tags={c.tags} isLive={c.isLive} date={c.date} viewCount={c.viewCount} thumbnailUrl={c.thumbnailUrl} className="w-[280px]" />
                ))}
              </HScrollRow>
            </section>

            <section>
              <SectionHeader title="최근 영상" linkTo="#" />
              <HScrollRow>
                {vodContents.map((v) => (
                  <VideoCard key={v.id} id={v.id} title={v.title} competition={v.competition} type={v.type} tags={v.tags} duration={v.duration} date={v.date} viewCount={v.viewCount} thumbnailUrl={v.thumbnailUrl} className="w-[280px]" />
                ))}
              </HScrollRow>
            </section>

            <section>
              <SectionHeader title="인기 클립" linkTo="#" />
              <HScrollRow scrollAmount={180}>
                {clipContents.map((c) => (
                  <ClipCard key={c.id} id={c.id} title={c.title} viewCount={c.viewCount} thumbnailUrl={c.thumbnailUrl} className="w-[155px]" />
                ))}
              </HScrollRow>
            </section>
          </div>
        </TabsContent>

        {/* 영상 탭 */}
        <TabsContent value="영상">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {vodContents.map((v) => (
              <VideoCard key={v.id} id={v.id} title={v.title} competition={v.competition} type={v.type} tags={v.tags} duration={v.duration} date={v.date} viewCount={v.viewCount} thumbnailUrl={v.thumbnailUrl} />
            ))}
          </div>
        </TabsContent>

        {/* 클립 탭 */}
        <TabsContent value="클립">
          <div className="grid grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {clipContents.map((c) => (
              <ClipCard key={c.id} id={c.id} title={c.title} viewCount={c.viewCount} thumbnailUrl={c.thumbnailUrl} />
            ))}
          </div>
        </TabsContent>

        {/* 라이브 탭 */}
        <TabsContent value="라이브">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {liveContents.map((c) => (
              <VideoCard key={c.id} id={c.id} title={c.title} competition={c.competition} type={c.type} tags={c.tags} isLive={c.isLive} date={c.date} viewCount={c.viewCount} thumbnailUrl={c.thumbnailUrl} />
            ))}
          </div>
        </TabsContent>

        {/* 일정 탭 - SchedulePage 상세 일정과 동일 */}
        <TabsContent value="일정">
          <div className="flex flex-col gap-8">
            {[
              { date: '2026.01.01 (토)', matches: [
                { time: '01:30', home: '동대문구 리틀야구', away: '군포시 리틀야구', score: '5 : 2', venue: '화성드림파크야구장 (1구장)', state: 'done' as const },
                { time: '01:30', home: '동대문구 리틀야구', away: '군포시 리틀야구', score: '5 : 2', venue: '화성드림파크야구장 (1구장)', state: 'done' as const },
              ]},
              { date: '2026.01.02 (일)', matches: [
                { time: '01:30', home: '동대문구 리틀야구', away: '군포시 리틀야구', score: '- : -', venue: '화성드림파크야구장 (1구장)', state: 'live' as const },
                { time: '01:30', home: '동대문구 리틀야구', away: '군포시 리틀야구', score: '- : -', venue: '화성드림파크야구장 (1구장)', state: 'upcoming' as const },
              ]},
            ].map((day, di) => (
              <div key={di}>
                <h3 className="text-[15px] font-semibold text-pochak-text mb-4 pb-2 border-b border-pochak-border">{day.date}</h3>
                <div className="flex flex-col">
                  {day.matches.map((m, mi) => (
                    <div key={mi} className="flex items-center gap-4 py-4 border-b border-pochak-border/50">
                      <span className={`text-[14px] font-mono w-12 ${m.state === 'live' ? 'text-pochak-live font-bold' : 'text-pochak-text-secondary'}`}>{m.time}</span>
                      <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                        <span className="text-[14px] text-pochak-text truncate">{m.home}</span>
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0" style={{ backgroundColor: channels[0]?.color || '#3b82f6' }}>{channels[0]?.initial}</div>
                      </div>
                      <span className={`text-[16px] font-bold font-mono w-16 text-center ${m.state === 'live' ? 'text-pochak-live' : m.state === 'done' ? 'text-pochak-text' : 'text-pochak-text-tertiary'}`}>{m.score}</span>
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0" style={{ backgroundColor: channels[1]?.color || '#ef4444' }}>{channels[1]?.initial}</div>
                        <span className="text-[14px] text-pochak-text truncate">{m.away}</span>
                      </div>
                      <span className="text-[13px] text-pochak-text-tertiary truncate w-[140px] text-right hidden lg:block">{m.venue}</span>
                      <button className={`text-[13px] font-medium px-3 py-1.5 rounded-full transition-colors duration-200 ${
                        m.state === 'done' ? 'bg-pochak-surface text-pochak-text hover:bg-pochak-surface-hover'
                        : m.state === 'live' ? 'bg-pochak-live text-white hover:bg-pochak-live/80'
                        : 'bg-pochak-surface text-pochak-text-secondary hover:bg-pochak-surface-hover'
                      }`}>
                        {m.state === 'done' ? '다시보기' : m.state === 'live' ? '시청하기' : '시청예약'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* 커뮤니티 탭 - YouTube Posts style with comments */}
        <TabsContent value="커뮤니티">
          <CommunityTab teamData={teamData} />
        </TabsContent>

        {/* 정보 탭 */}
        <TabsContent value="정보">
          <div className="max-w-[600px] flex flex-col gap-6">
            <div>
              <h3 className="text-[15px] font-semibold text-pochak-text mb-2">설명</h3>
              <p className="text-[14px] text-pochak-text-secondary leading-relaxed">
                스포츠는 정해진 규칙과 공정성을 바탕으로 신체 능력, 기술, 전략, 정신력을 겨루는 인간 활동이다.
                개인과 팀은 반복된 훈련과 경쟁을 통해 한계를 극복하고 성장하며, 그 과정에서 협력과 존중, 책임을 배운다.
              </p>
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-pochak-text mb-2">세부정보</h3>
              <div className="flex flex-col gap-2">
                {[
                  { label: '종목', value: teamData.subtitle.split(' | ')[0] || '야구' },
                  { label: '위치', value: '서울특별시' },
                  { label: '가입일', value: '2025.01.01' },
                  { label: '멤버', value: `${teamData.followers ?? 150}명` },
                ].map((row) => (
                  <div key={row.label} className="flex items-center py-2 border-b border-pochak-border">
                    <span className="text-[14px] text-pochak-text-tertiary w-20">{row.label}</span>
                    <span className="text-[14px] text-pochak-text">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ── YouTube-style Community Tab ─────────────────────── */
const mockPosts = [
  { id: 1, text: '이번 주말 경기 기대되시나요? 동대문구 리틀야구 vs 군포시 리틀야구 준결승전! 응원 많이 해주세요 🔥', time: '2일 전', likes: 42, dislikes: 2, comments: [
    { name: '김포착', initial: '김', time: '1일 전', text: '화이팅!! 이번에는 꼭 우승하자 💪', likes: 8 },
    { name: '박야구', initial: '박', time: '1일 전', text: '저도 현장에서 응원할 예정입니다!', likes: 3 },
    { name: '이스포츠', initial: '이', time: '12시간 전', text: '라이브로 볼 수 있나요?', likes: 1, reply: { name: '동대문 리틀야구', initial: '동', time: '10시간 전', text: '네! POCHAK에서 라이브 중계합니다 😊', likes: 5 } },
  ]},
  { id: 2, text: '지난 경기 하이라이트 클립이 업로드되었습니다. 마이페이지에서 확인해보세요!', time: '5일 전', likes: 28, dislikes: 0, comments: [
    { name: '최팬', initial: '최', time: '4일 전', text: '클립 퀄리티 좋네요!', likes: 5 },
  ]},
  { id: 3, text: '새 시즌 유니폼이 도착했습니다! 어떤가요?', time: '1주 전', likes: 67, dislikes: 1, hasImage: true, comments: [
    { name: '정디자인', initial: '정', time: '6일 전', text: '디자인 예쁘다!', likes: 12 },
    { name: '한선수', initial: '한', time: '5일 전', text: '빨리 입어보고 싶어요~', likes: 8 },
  ]},
  { id: 4, text: '연습 경기 일정 공지합니다.\n- 1월 10일 (토) 오전 10시\n- 1월 11일 (일) 오후 2시\n장소: 화성드림파크야구장', time: '2주 전', likes: 15, dislikes: 0, comments: [] },
];

function CommunityTab({ teamData }: { teamData: { name: string; initial: string; color: string; imageUrl?: string } }) {
  const [expandedPost, setExpandedPost] = useState<number | null>(null);

  return (
    <div className="max-w-[680px] flex flex-col">
      {mockPosts.map((post) => (
        <div key={post.id} className="py-4 border-b border-pochak-border">
          {/* Author row */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: teamData.color }}>
              <span className="text-[14px] font-bold text-white">{teamData.initial}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-medium text-pochak-text">{teamData.name}</span>
                <span className="text-[12px] text-pochak-text-tertiary">{post.time}</span>
              </div>

              {/* Post content */}
              <p className="text-[14px] text-pochak-text leading-relaxed whitespace-pre-wrap mt-2">{post.text}</p>

              {/* Optional image */}
              {post.hasImage && (
                <div className="mt-3 rounded-xl overflow-hidden bg-pochak-surface aspect-video max-w-[500px]">
                  <img src={teamData.imageUrl || '/pochak-icon.svg'} alt="" className="w-full h-full object-cover" />
                </div>
              )}

              {/* Actions row - YouTube style */}
              <div className="flex items-center gap-1 mt-3">
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] text-pochak-text-secondary hover:bg-pochak-surface transition-colors">
                  <LuThumbsUp className="w-4 h-4" /> {post.likes}
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] text-pochak-text-secondary hover:bg-pochak-surface transition-colors">
                  <LuThumbsUp className="w-4 h-4 rotate-180" /> {post.dislikes > 0 ? post.dislikes : ''}
                </button>
                <button
                  onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] text-pochak-text-secondary hover:bg-pochak-surface transition-colors"
                >
                  <LuMessageSquare className="w-4 h-4" /> {post.comments.length > 0 ? post.comments.length : ''}
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] text-pochak-text-secondary hover:bg-pochak-surface transition-colors">
                  <LuShare2 className="w-4 h-4" />
                </button>
              </div>

              {/* Comments section - expandable */}
              {expandedPost === post.id && (
                <div className="mt-4 flex flex-col gap-4">
                  {/* Comment count header */}
                  <p className="text-[14px] font-medium text-pochak-text">댓글 {post.comments.length}개</p>

                  {/* Comment input */}
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-pochak-surface flex items-center justify-center flex-shrink-0">
                      <span className="text-[10px] font-bold text-primary">P</span>
                    </div>
                    <input
                      placeholder="댓글 추가..."
                      className="flex-1 bg-transparent border-b border-pochak-border focus:border-white/80 outline-none text-[14px] text-pochak-text pb-1 placeholder:text-pochak-text-tertiary transition-colors"
                    />
                  </div>

                  {/* Comment list */}
                  {post.comments.map((comment, ci) => (
                    <div key={ci} className="flex flex-col gap-3">
                      {/* Comment */}
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-pochak-surface flex items-center justify-center flex-shrink-0">
                          <span className="text-[11px] font-bold text-pochak-text-secondary">{comment.initial}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-medium text-pochak-text">{comment.name}</span>
                            <span className="text-[12px] text-pochak-text-tertiary">{comment.time}</span>
                          </div>
                          <p className="text-[14px] text-pochak-text mt-0.5">{comment.text}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <button className="flex items-center gap-1 px-2 py-1 rounded-full text-[12px] text-pochak-text-secondary hover:bg-pochak-surface transition-colors duration-200">
                              <LuThumbsUp className="w-3.5 h-3.5" /> {comment.likes}
                            </button>
                            <button className="flex items-center gap-1 px-2 py-1 rounded-full text-[12px] text-pochak-text-secondary hover:bg-pochak-surface transition-colors duration-200">
                              <LuThumbsUp className="w-3.5 h-3.5 rotate-180" />
                            </button>
                            <button className="px-2 py-1 rounded-full text-[12px] text-pochak-text-secondary hover:bg-pochak-surface transition-colors duration-200">답글</button>
                          </div>
                        </div>
                      </div>

                      {/* Reply (indented) */}
                      {'reply' in comment && comment.reply && (
                        <div className="flex gap-3 ml-11">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: teamData.color }}>
                            <span className="text-[9px] font-bold text-white">{(comment.reply as {initial:string}).initial}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[13px] font-medium text-[#3ea6ff]">{(comment.reply as {name:string}).name}</span>
                              <span className="text-[12px] text-pochak-text-tertiary">{(comment.reply as {time:string}).time}</span>
                            </div>
                            <p className="text-[14px] text-pochak-text mt-0.5">{(comment.reply as {text:string}).text}</p>
                            <div className="flex items-center gap-1 mt-1">
                              <button className="flex items-center gap-1 px-2 py-1 rounded-full text-[12px] text-pochak-text-secondary hover:bg-pochak-surface transition-colors duration-200">
                                <LuThumbsUp className="w-3.5 h-3.5" /> {(comment.reply as {likes:number}).likes}
                              </button>
                              <button className="flex items-center gap-1 px-2 py-1 rounded-full text-[12px] text-pochak-text-secondary hover:bg-pochak-surface transition-colors duration-200">
                                <LuThumbsUp className="w-3.5 h-3.5 rotate-180" />
                              </button>
                              <button className="px-2 py-1 rounded-full text-[12px] text-pochak-text-secondary hover:bg-pochak-surface transition-colors duration-200">답글</button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {post.comments.length === 0 && (
                    <p className="text-[14px] text-pochak-text-tertiary">아직 댓글이 없습니다. 첫 번째 댓글을 남겨보세요!</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
