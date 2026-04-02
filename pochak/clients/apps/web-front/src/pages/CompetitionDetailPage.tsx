import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { LuBookmark, LuGlobe, LuVideo, LuMessageSquare, LuShare2, LuShoppingCart, LuEllipsis } from 'react-icons/lu';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import HScrollRow from '@/components/HScrollRow';
import { VideoCard, ClipCard } from '@/components/Card';
import SectionHeader from '@/components/SectionHeader';
import { LuSend } from 'react-icons/lu';
import { Input } from '@/components/ui/input';
import { useCompetitionDetail } from '@/hooks/useApi';
import { useContents, useCompetitions } from '@/hooks/useApi';

const mockComments = [
  [
    { name: '김민수', initial: '김', text: '이번 경기 정말 치열했습니다! 결승전이 기대되네요.', time: '2시간 전' },
    { name: '박지훈', initial: '박', text: '선수들 컨디션이 좋아 보여요. 다음 경기도 기대됩니다.', time: '1시간 전' },
    { name: '이서연', initial: '이', text: '현장 분위기가 정말 뜨거웠어요! 다음에도 꼭 가고 싶네요.', time: '30분 전' },
  ],
  [
    { name: '최영호', initial: '최', text: '우리 팀 화이팅! 이번 시즌 꼭 우승하자!', time: '5시간 전' },
    { name: '정하은', initial: '정', text: '아이들이 정말 열심히 뛰더라고요. 감동이었습니다.', time: '3시간 전' },
    { name: '한도윤', initial: '한', text: '코치님 전략이 정말 좋았어요. 수비가 완벽했습니다.', time: '1시간 전' },
  ],
  [
    { name: '윤서현', initial: '윤', text: '경기 영상 올려주시면 감사하겠습니다!', time: '4시간 전' },
    { name: '강준혁', initial: '강', text: '하이라이트 클립 봤는데 역전 장면이 소름이었어요.', time: '2시간 전' },
    { name: '오지민', initial: '오', text: '다음 주 일정도 빨리 알려주세요!', time: '45분 전' },
  ],
  [
    { name: '임수빈', initial: '임', text: '처음 와봤는데 시설도 좋고 경기도 재밌었어요.', time: '6시간 전' },
    { name: '송태호', initial: '송', text: '매주 오고 싶은 경기장이네요.', time: '4시간 전' },
    { name: '배은지', initial: '배', text: '아이가 경기 보면서 너무 좋아했어요. 감사합니다!', time: '2시간 전' },
  ],
  [
    { name: '조현우', initial: '조', text: '이 대회 수준이 해마다 높아지는 게 느껴집니다.', time: '7시간 전' },
    { name: '신예린', initial: '신', text: '중계 화질도 좋고 해설도 재밌었어요!', time: '5시간 전' },
    { name: '유동현', initial: '유', text: '포착 앱으로 보니까 진짜 편하네요.', time: '3시간 전' },
  ],
];

const tabs = ['홈', '영상', '일정', '게시글', '정보'] as const;

export default function CompetitionDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const { data: competition } = useCompetitionDetail(id);
  const { data: liveContents } = useContents('LIVE');
  const { data: vodContents } = useContents('VOD');
  const { data: clipContents } = useContents('CLIP');
  const [isFavorited, setIsFavorited] = useState(false);
  const [expandedPost, setExpandedPost] = useState<number | null>(null);

  const comp = competition ?? { id: '', name: '', dateRange: '', logoColor: '#888', logoText: '', subtitle: '', isAd: false };

  return (
    <div className="py-6">
      {/* Banner */}
      <div
        className="relative rounded-xl overflow-hidden p-6 flex items-center justify-between"
        style={{ background: `linear-gradient(135deg, ${comp.logoColor}30, #121212)`, minHeight: 160 }}
      >
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">{comp.name}</h1>
          <p className="text-[14px] text-muted-foreground mt-1">{comp.dateRange}</p>
          <p className="text-[14px] text-pochak-text-tertiary mt-2 max-w-lg">
            스포츠는 정해진 규칙과 공정성을 바탕으로 신체 능력, 기술, 전략, 정신력을 겨루는 인간 활동이다.
          </p>
          <div className="flex items-center gap-2 mt-3">
            <LuGlobe className="w-4 h-4 text-pochak-text-tertiary" />
            <LuVideo className="w-4 h-4 text-pochak-text-tertiary" />
            <LuMessageSquare className="w-4 h-4 text-pochak-text-tertiary" />
            <LuShare2 className="w-4 h-4 text-pochak-text-tertiary" />
          </div>
          <div className="flex items-center gap-3 mt-4">
            <Button variant="outline" className="gap-1.5 border-primary/30 text-primary hover:bg-primary/10">
              <LuShoppingCart className="w-4 h-4" /> 구매하기
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFavorited(!isFavorited)}
              className={isFavorited ? 'text-primary border border-primary' : 'border border-border-subtle hover:border-white/[0.2]'}
            >
              <LuBookmark className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="border border-border-subtle hover:border-white/[0.2]">
              <LuEllipsis className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div
          className="w-24 h-24 rounded-lg flex items-center justify-center text-xl font-black text-white flex-shrink-0"
          style={{ backgroundColor: comp.logoColor }}
        >
          {comp.logoText}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="홈" className="mt-6">
        <TabsList className="w-full justify-start mb-6">
          {tabs.map((tab) => (
            <TabsTrigger key={tab} value={tab}>
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="홈">
          <div className="flex flex-col gap-8">
            <section>
              <SectionHeader title="라이브" linkTo="#" />
              <HScrollRow>
                {liveContents.map((c) => (
                  <VideoCard key={c.id} id={c.id} title={c.title} competition={c.competition} type={c.type} tags={c.tags} isLive={c.isLive} date={c.date} viewCount={c.viewCount} className="w-[220px]" />
                ))}
              </HScrollRow>
            </section>
            <section>
              <SectionHeader title="최근 클립" linkTo="#" />
              <HScrollRow scrollAmount={160}>
                {clipContents.map((c) => (
                  <ClipCard key={c.id} id={c.id} title={c.title} viewCount={c.viewCount} className="w-[140px]" />
                ))}
              </HScrollRow>
            </section>
            <section>
              <SectionHeader title="최근 영상" linkTo="#" />
              <HScrollRow>
                {vodContents.map((v) => (
                  <VideoCard key={v.id} id={v.id} title={v.title} competition={v.competition} type={v.type} tags={v.tags} duration={v.duration} date={v.date} viewCount={v.viewCount} className="w-[220px]" />
                ))}
              </HScrollRow>
            </section>
          </div>
        </TabsContent>

        <TabsContent value="영상">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {vodContents.map((v) => (
              <VideoCard key={v.id} id={v.id} title={v.title} competition={v.competition} type={v.type} tags={v.tags} duration={v.duration} date={v.date} viewCount={v.viewCount} />
            ))}
          </div>
        </TabsContent>

        {/* 일정 탭 */}
        <TabsContent value="일정">
          <div className="flex flex-col gap-8">
            {['2026.01.01 (토)', '2026.01.01 (토)', '2026.01.01 (토)'].map((date, di) => (
              <div key={di}>
                <div className="bg-white/[0.03] px-5 py-3 rounded-t-lg border-b border-border-subtle">
                  <h3 className="text-[15px] font-bold text-foreground">{date}</h3>
                </div>
                <div className="divide-y divide-white/[0.04]">
                  {[0, 1, 2].map((mi) => {
                    const isLive = di === 1 && mi > 0;
                    const isUpcoming = di === 2;
                    return (
                      <div key={mi} className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors">
                        <span className={`text-[14px] font-mono w-12 ${isLive ? 'text-primary font-bold' : 'text-muted-foreground'}`}>01:30</span>
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0">동</div>
                          <span className="text-[14px] text-foreground truncate">동대문구 리틀야구</span>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          {isUpcoming ? (
                            <span className="text-[16px] font-mono text-pochak-text-tertiary">-  :  -</span>
                          ) : (
                            <span className="text-[16px] font-bold font-mono text-foreground">5  :  2</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0">군</div>
                          <span className="text-[14px] text-foreground truncate">군포시 리틀야구</span>
                        </div>
                        <span className="text-[13px] text-pochak-text-tertiary truncate w-[120px] text-right flex-shrink-0">화성드림파크야구장 (1구장)</span>
                        <button className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[14px] font-medium flex-shrink-0 border transition-colors ${
                          isUpcoming
                            ? 'border-border-default text-muted-foreground hover:bg-white/[0.06]'
                            : isLive
                            ? 'border-primary/30 text-primary hover:bg-primary/10'
                            : 'border-border-default text-foreground hover:bg-white/[0.06]'
                        }`}>
                          {isUpcoming ? '▷ 시청예약' : isLive ? '▶ 시청하기' : '▶ 다시보기'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* 게시글 탭 */}
        <TabsContent value="게시글">
          <div className="flex flex-col gap-3 mt-2">
            {Array.from({ length: 5 }).map((_, i) => {
              const isExpanded = expandedPost === i;
              const comments = mockComments[i] ?? mockComments[0];
              return (
                <div key={i} className="rounded-xl border border-border-subtle overflow-hidden transition-colors">
                  <div
                    className="bg-white/[0.02] p-5 hover:bg-white/[0.04] transition-colors cursor-pointer"
                    onClick={() => setExpandedPost(isExpanded ? null : i)}
                  >
                    <p className={`text-[15px] text-foreground leading-relaxed ${isExpanded ? '' : 'line-clamp-3'}`}>
                      스포츠는 정해진 규칙과 공정성을 바탕으로 신체 능력, 기술, 전략, 정신력을 겨루는 인간 활동이다.
                      개인과 팀은 반복된 훈련과 경쟁을 통해 한계를 극복하고 성장하며, 그 과정에서 협력과 존중, 책임을 배운다.
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <p className="text-[13px] text-muted-foreground">6회 MLB컵 리틀야구 U10 | 2026.01.01</p>
                      <span className="flex items-center gap-1 text-[13px] text-white/30">
                        <LuMessageSquare className="h-3.5 w-3.5" />
                        {comments.length}
                      </span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="bg-white/[0.02] border-t border-border-subtle px-5 pl-8 py-4">
                      <div className="flex flex-col gap-4">
                        {comments.map((comment, ci) => (
                          <div key={ci} className="flex items-start gap-3">
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/[0.08] text-[13px] font-bold text-white/60">
                              {comment.initial}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[14px] font-medium text-white/75">{comment.name}</span>
                                <span className="text-[13px] text-white/30">{comment.time}</span>
                              </div>
                              <p className="mt-0.5 text-[14px] leading-relaxed text-white/55">{comment.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 flex items-center gap-2 pt-3 border-t border-border-subtle">
                        <Input
                          type="text"
                          placeholder="댓글을 입력하세요..."
                          className="h-10 flex-1 text-[14px]"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <Button variant="outline" size="icon" className="h-10 w-10 flex-shrink-0 border-white/[0.15] hover:border-primary/40 hover:text-primary">
                          <LuSend className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* 정보 탭 */}
        <TabsContent value="정보">
          <div className="flex flex-col gap-6 mt-2">
            <div>
              <h3 className="text-[15px] font-bold text-foreground mb-3">섹션</h3>
              <p className="text-[14px] text-muted-foreground leading-relaxed">
                스포츠는 정해진 규칙과 공정성을 바탕으로 신체 능력, 기술, 전략, 정신력을 겨루는 인간 활동이다.
              </p>
            </div>
            <div className="bg-white/[0.03] rounded-xl border border-border-subtle overflow-hidden">
              {[
                { label: '종목', value: '야구' },
                { label: '지역', value: '서울 강남구' },
                { label: '시설', value: '도곡 스포츠 아카데미' },
              ].map((row) => (
                <div key={row.label} className="flex items-center px-5 py-3 border-b border-white/[0.04] last:border-b-0">
                  <span className="text-[14px] text-muted-foreground w-16">{row.label}</span>
                  <span className="text-[14px] text-foreground font-medium">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
