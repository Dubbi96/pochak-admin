import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LuSearch, LuChevronRight } from 'react-icons/lu';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import HScrollRow from '@/components/HScrollRow';
import SectionHeader from '@/components/SectionHeader';
import { VideoCard, ClipCard, TeamLogoCard, CompetitionBannerCard } from '@/components/Card';

import { useSearch, useTeams, useContents, useCompetitions } from '@/hooks/useApi';

const tabs = ['전체', '팀/클럽', '라이브', '대회', '영상', '클립'] as const;

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const activeTab = searchParams.get('tab') || '전체';

  const setActiveTab = (tab: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('tab', tab);
    setSearchParams(params);
  };

  const isSearching = query.trim().length > 0;

  // API-driven search results by category
  const { data: searchResults } = useSearch(query);
  const { data: teams } = useTeams();
  const { data: liveData } = useContents('LIVE');
  const { data: vodData } = useContents('VOD');
  const { data: clipData } = useContents('CLIP');
  const { data: comps } = useCompetitions();

  // Browse mode data (when not searching)
  const channels = teams;
  const liveContents = liveData;
  const vodContents = vodData;
  const clipContents = clipData;
  const competitions = comps;

  // Search results: filter from search API data
  const matchedTeams = useMemo(() =>
    isSearching ? teams : []
  , [teams, isSearching]);

  const matchedLive = useMemo(() =>
    isSearching ? searchResults.filter(c => c.type === 'LIVE') : []
  , [searchResults, isSearching]);

  const matchedComps = useMemo(() =>
    isSearching ? competitions : []
  , [competitions, isSearching]);

  const matchedVods = useMemo(() =>
    isSearching ? searchResults.filter(c => c.type === 'VOD') : []
  , [searchResults, isSearching]);

  const matchedClips = useMemo(() =>
    isSearching ? searchResults.filter(c => c.type === 'CLIP') : []
  , [searchResults, isSearching]);

  const hasAnyResults = matchedTeams.length + matchedLive.length + matchedComps.length + matchedVods.length + matchedClips.length > 0;

  return (
    <div className="py-6">
      {isSearching && (
        <div className="mb-6">
          <h1 className="text-[20px] font-bold text-pochak-text">'{query}' 검색 결과</h1>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          {tabs.map((tab) => (
            <TabsTrigger key={tab} value={tab}>{tab}</TabsTrigger>
          ))}
        </TabsList>

        {isSearching ? (
          <>
            {/* 전체 탭 - 카테고리별 섹션 */}
            <TabsContent value="전체">
              {!hasAnyResults ? (
                <NoResults query={query} />
              ) : (
                <div className="mt-6 flex flex-col gap-8">
                  {matchedTeams.length > 0 && (
                    <ResultSection title="팀/클럽" count={matchedTeams.length}>
                      <HScrollRow scrollAmount={280}>
                        {matchedTeams.map((ch) => (<TeamLogoCard key={ch.id} {...ch} followers={ch.followers} />))}
                      </HScrollRow>
                    </ResultSection>
                  )}
                  {matchedLive.length > 0 && (
                    <ResultSection title="라이브" count={matchedLive.length}>
                      <HScrollRow>
                        {matchedLive.map((c) => (
                          <VideoCard key={c.id} id={c.id} title={c.title} competition={c.competition} type={c.type} tags={c.tags} isLive={c.isLive} date={c.date} viewCount={c.viewCount} className="w-[220px]" />
                        ))}
                      </HScrollRow>
                    </ResultSection>
                  )}
                  {matchedComps.length > 0 && (
                    <ResultSection title="대회" count={matchedComps.length}>
                      <HScrollRow>
                        {matchedComps.map((c) => (
                          <CompetitionBannerCard key={c.id} {...c} className="w-[220px]" />
                        ))}
                      </HScrollRow>
                    </ResultSection>
                  )}
                  {matchedVods.length > 0 && (
                    <ResultSection title="영상" count={matchedVods.length}>
                      <HScrollRow>
                        {matchedVods.map((v) => (
                          <VideoCard key={v.id} id={v.id} title={v.title} competition={v.competition} type={v.type} tags={v.tags} duration={v.duration} date={v.date} viewCount={v.viewCount} className="w-[220px]" />
                        ))}
                      </HScrollRow>
                    </ResultSection>
                  )}
                  {matchedClips.length > 0 && (
                    <ResultSection title="클립" count={matchedClips.length}>
                      <HScrollRow scrollAmount={180}>
                        {matchedClips.map((c) => (
                          <ClipCard key={c.id} id={c.id} title={c.title} viewCount={c.viewCount} className="w-[140px]" />
                        ))}
                      </HScrollRow>
                    </ResultSection>
                  )}
                </div>
              )}
            </TabsContent>

            {/* 팀/클럽 탭 */}
            <TabsContent value="팀/클럽">
              {matchedTeams.length === 0 ? <NoResults query={query} /> : (
                <div className="mt-6 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {matchedTeams.map((ch) => (<TeamLogoCard key={ch.id} {...ch} followers={ch.followers} />))}
                </div>
              )}
            </TabsContent>

            {/* 라이브 탭 */}
            <TabsContent value="라이브">
              {matchedLive.length === 0 ? <NoResults query={query} /> : (
                <div className="mt-6 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                  {matchedLive.map((c) => (
                    <VideoCard key={c.id} id={c.id} title={c.title} competition={c.competition} type={c.type} tags={c.tags} isLive={c.isLive} date={c.date} viewCount={c.viewCount} />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* 대회 탭 */}
            <TabsContent value="대회">
              {matchedComps.length === 0 ? <NoResults query={query} /> : (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {matchedComps.map((c) => (
                    <CompetitionBannerCard key={c.id} {...c} />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* 영상 탭 */}
            <TabsContent value="영상">
              {matchedVods.length === 0 ? <NoResults query={query} /> : (
                <div className="mt-6 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                  {matchedVods.map((v) => (
                    <VideoCard key={v.id} id={v.id} title={v.title} competition={v.competition} type={v.type} tags={v.tags} duration={v.duration} date={v.date} viewCount={v.viewCount} />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* 클립 탭 */}
            <TabsContent value="클립">
              {matchedClips.length === 0 ? <NoResults query={query} /> : (
                <div className="mt-6 grid grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3">
                  {matchedClips.map((c) => (
                    <ClipCard key={c.id} id={c.id} title={c.title} viewCount={c.viewCount} />
                  ))}
                </div>
              )}
            </TabsContent>
          </>
        ) : (
          /* Browse mode */
          <TabsContent value="전체">
            <div className="mt-6 flex flex-col gap-8">
              <BrowseSection title="팀">
                <HScrollRow scrollAmount={280}>
                  {channels.map((ch) => (<TeamLogoCard key={ch.id} {...ch} followers={ch.followers} />))}
                </HScrollRow>
              </BrowseSection>
              <BrowseSection title="클럽">
                <HScrollRow scrollAmount={280}>
                  {channels.map((ch) => (<TeamLogoCard key={`club-${ch.id}`} {...ch} followers={ch.followers} />))}
                </HScrollRow>
              </BrowseSection>
              <BrowseSection title="라이브">
                <HScrollRow>
                  {liveContents.map((c) => (
                    <VideoCard key={c.id} id={c.id} title={c.title} competition={c.competition} type={c.type} tags={c.tags} isLive={c.isLive} date={c.date} viewCount={c.viewCount} className="w-[220px]" />
                  ))}
                </HScrollRow>
              </BrowseSection>
              <BrowseSection title="대회">
                <HScrollRow>
                  {competitions.map((c) => (
                    <CompetitionBannerCard key={c.id} {...c} className="w-[220px]" />
                  ))}
                </HScrollRow>
              </BrowseSection>
              <BrowseSection title="영상">
                <HScrollRow>
                  {vodContents.map((v) => (
                    <VideoCard key={v.id} id={v.id} title={v.title} competition={v.competition} type={v.type} tags={v.tags} duration={v.duration} date={v.date} viewCount={v.viewCount} className="w-[220px]" />
                  ))}
                </HScrollRow>
              </BrowseSection>
              <BrowseSection title="클립">
                <HScrollRow scrollAmount={180}>
                  {clipContents.map((c) => (
                    <ClipCard key={c.id} id={c.id} title={c.title} viewCount={c.viewCount} className="w-[140px]" />
                  ))}
                </HScrollRow>
              </BrowseSection>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

function ResultSection({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-[15px] font-bold text-pochak-text">{title}</h3>
        <span className="text-[14px] text-primary font-semibold">{count}</span>
        <LuChevronRight className="w-4 h-4 text-pochak-text-muted" />
      </div>
      {children}
    </section>
  );
}

function BrowseSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-center gap-1 mb-4">
        <h3 className="text-base font-bold text-pochak-text">{title}</h3>
        <LuChevronRight className="w-4 h-4 text-pochak-text-secondary" />
      </div>
      {children}
    </section>
  );
}

function NoResults({ query }: { query: string }) {
  const { data: channels } = useTeams();
  const { data: vodContents } = useContents('VOD');
  const { data: clipContents } = useContents('CLIP');
  const { data: competitions } = useCompetitions();
  return (
    <div className="mt-8">
      <div className="flex flex-col items-center py-16">
        <LuSearch className="h-12 w-12 text-pochak-text-muted mb-4" />
        <p className="text-[16px] font-semibold text-pochak-text">검색 결과가 없습니다</p>
        <p className="text-[14px] text-pochak-text-secondary mt-1">'{query}'에 대한 결과를 찾을 수 없습니다. 다른 키워드로 검색해보세요.</p>
      </div>
      <div className="flex flex-col gap-8 mt-4">
        <BrowseSection title="추천 팀/클럽">
          <HScrollRow scrollAmount={280}>
            {channels.map((ch) => (<TeamLogoCard key={ch.id} {...ch} followers={ch.followers} />))}
          </HScrollRow>
        </BrowseSection>
        <BrowseSection title="추천 영상">
          <HScrollRow>
            {vodContents.map((v) => (
              <VideoCard key={v.id} id={v.id} title={v.title} competition={v.competition} type={v.type} tags={v.tags} duration={v.duration} date={v.date} viewCount={v.viewCount} className="w-[220px]" />
            ))}
          </HScrollRow>
        </BrowseSection>
        <BrowseSection title="추천 대회">
          <HScrollRow>
            {competitions.map((c) => (
              <CompetitionBannerCard key={c.id} {...c} className="w-[220px]" />
            ))}
          </HScrollRow>
        </BrowseSection>
        <BrowseSection title="인기 클립">
          <HScrollRow scrollAmount={180}>
            {clipContents.map((c) => (
              <ClipCard key={c.id} id={c.id} title={c.title} viewCount={c.viewCount} className="w-[140px]" />
            ))}
          </HScrollRow>
        </BrowseSection>
      </div>
    </div>
  );
}
