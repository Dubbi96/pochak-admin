import { useState, useMemo, useEffect, useCallback } from 'react';
import { Search, X, TrendingUp, Clock, ChevronRight } from 'lucide-react';
import ContentCardItem from '@/components/ContentCardItem';
import HScrollRow from '@/components/HScrollRow';
import HVideoCard from '@/components/HVideoCard';
import VClipCard from '@/components/VClipCard';
import {
  fetchSearchResults,
  fetchLiveContents,
  fetchVodContents,
  fetchPopularClubs,
  fetchCompetitions,
  fetchPopularClips,
  fetchTrendingSearches,
} from '@/services/webApi';
import type { ContentCard, PochakContent, PochakChannel, CompetitionCard, PopularClip } from '@/services/webApi';

type SearchTab = '전체' | '클럽' | '라이브' | '대회' | '영상' | '클립';
const tabs: SearchTab[] = ['전체', '클럽', '라이브', '대회', '영상', '클립'];

const clubLogos = [
  { id: 'club-1', name: '도곡 스포츠 아카데미', color: '#6A1B9A', initial: '도', type: 'club' as const },
  { id: 'club-2', name: '강남 FC 클럽', color: '#00838F', initial: '강', type: 'club' as const },
  { id: 'club-3', name: '서울 유소년 배구', color: '#EF6C00', initial: '서', type: 'club' as const },
  { id: 'club-4', name: '부산 농구 아카데미', color: '#AD1457', initial: '부', type: 'club' as const },
  { id: 'club-5', name: '대전 핸드볼 클럽', color: '#2E7D32', initial: '대', type: 'club' as const },
  { id: 'club-6', name: '인천 배드민턴 클럽', color: '#1565C0', initial: '인', type: 'club' as const },
  { id: 'club-7', name: '수원 테니스 클럽', color: '#F57F17', initial: '수', type: 'club' as const },
  { id: 'club-8', name: '용인 탁구 클럽', color: '#4E342E', initial: '용', type: 'club' as const },
  { id: 'club-9', name: '제주 수영 클럽', color: '#0097A7', initial: '제', type: 'club' as const },
];

// ── Section header with ">" link ────────────────────────────────────────────
function CategoryHeader({ title, linkTo }: { title: string; linkTo?: string }) {
  return (
    <div className="flex items-center gap-1 mb-3">
      <h3 className="text-[17px] font-semibold text-white">{title}</h3>
      <button
        onClick={() => linkTo && (window.location.href = linkTo)}
        className="text-[#A6A6A6] hover:text-white transition-colors"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

// ── Circular logo item ──────────────────────────────────────────────────────
function CircleLogo({ name, color, initial }: { name: string; color: string; initial: string }) {
  return (
    <div className="flex-shrink-0 flex flex-col items-center w-[72px] cursor-pointer group">
      <div
        className="w-[56px] h-[56px] rounded-full flex items-center justify-center text-[14px] font-bold text-white border-2 border-[#4D4D4D] group-hover:border-[#00CC33] transition-colors"
        style={{ backgroundColor: color }}
      >
        {initial}
      </div>
      <p className="text-[11px] text-[#A6A6A6] mt-1.5 text-center truncate w-full group-hover:text-white transition-colors">
        {name.length > 6 ? name.slice(0, 6) + '..' : name}
      </p>
    </div>
  );
}

// ── Competition banner card (blue gradient style) ───────────────────────────
function CompBannerCard({ name, posterColor }: { name: string; posterColor?: string }) {
  return (
    <div
      className="flex-shrink-0 w-[260px] h-[140px] rounded-xl flex items-end p-4 cursor-pointer group overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${posterColor ?? '#1565C0'} 0%, ${posterColor ?? '#1565C0'}88 50%, #262626 100%)`,
      }}
    >
      <p className="text-[14px] font-bold text-white leading-snug line-clamp-2 group-hover:underline">
        {name}
      </p>
    </div>
  );
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'K리그 하이라이트',
    '전국체전',
    '프로농구',
  ]);
  const [activeTab, setActiveTab] = useState<SearchTab>('전체');
  const [apiResults, setApiResults] = useState<ContentCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [teamItems, setTeamItems] = useState<PochakChannel[]>([]);
  const [liveItems, setLiveItems] = useState<PochakContent[]>([]);
  const [competitionItems, setCompetitionItems] = useState<CompetitionCard[]>([]);
  const [vodItems, setVodItems] = useState<PochakContent[]>([]);
  const [clipItems, setClipItems] = useState<PopularClip[]>([]);
  const [trendingTerms, setTrendingTerms] = useState<string[]>([]);

  useEffect(() => {
    fetchPopularClubs().then((data) => { if (data) setTeamItems(data); });
    fetchLiveContents().then((data) => { if (data) setLiveItems(data); });
    fetchCompetitions().then((data) => { if (data) setCompetitionItems(data); });
    fetchVodContents().then((data) => { if (data) setVodItems(data); });
    fetchPopularClips().then((data) => { if (data) setClipItems(data); });
    fetchTrendingSearches().then((data) => { if (data) setTrendingTerms(data); });
  }, []);

  const isSearching = query.trim().length > 0;

  // Fetch results from API when query changes (debounced)
  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setApiResults([]);
      return;
    }
    setIsLoading(true);
    try {
      const data = await fetchSearchResults(q);
      setApiResults(data ?? []);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isSearching) {
      setApiResults([]);
      return;
    }
    const timer = setTimeout(() => doSearch(query), 300);
    return () => clearTimeout(timer);
  }, [query, isSearching, doSearch]);

  // Filter results by active tab (applied locally on whatever the API returned)
  const results = useMemo(() => {
    if (!isSearching) return [];
    const q = query.toLowerCase();
    let filtered = apiResults.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.competition.toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q)) ||
        c.matchInfo.toLowerCase().includes(q)
    );

    if (activeTab === '영상') {
      filtered = filtered.filter((c) => c.type === 'VOD');
    } else if (activeTab === '클립') {
      filtered = filtered.filter((c) => c.type === 'CLIP');
    } else if (activeTab === '라이브') {
      filtered = filtered.filter((c) => c.type === 'LIVE');
    } else if (activeTab === '대회') {
      filtered = filtered.sort((a, b) => {
        const aMatch = a.competition.toLowerCase().includes(q) ? 0 : 1;
        const bMatch = b.competition.toLowerCase().includes(q) ? 0 : 1;
        return aMatch - bMatch;
      });
    }
    return filtered;
  }, [query, activeTab, apiResults, isSearching]);

  const handleSearch = (term: string) => {
    setQuery(term);
    if (term.trim() && !recentSearches.includes(term.trim())) {
      setRecentSearches((prev) => [term.trim(), ...prev].slice(0, 10));
    }
  };

  const removeRecent = (term: string) => {
    setRecentSearches((prev) => prev.filter((s) => s !== term));
  };

  const suggestions = useMemo(() => {
    if (!query.trim()) return [];
    return trendingTerms.filter((s) =>
      s.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, trendingTerms]);

  // ── "전체" tab categorized view (when not searching) ──────────────────────
  const renderAllCategories = () => (
    <div className="mt-6 space-y-8">
      {/* 팀 */}
      {teamItems.length > 0 && (
        <section>
          <CategoryHeader title="팀" linkTo="/search?tab=클럽" />
          <HScrollRow>
            {teamItems.slice(0, 9).map((t) => (
              <CircleLogo key={t.id} name={t.name} color={t.color} initial={t.initial} />
            ))}
          </HScrollRow>
        </section>
      )}

      {/* 클럽 */}
      <section>
        <CategoryHeader title="클럽" linkTo="/search?tab=클럽" />
        <HScrollRow>
          {clubLogos.map((c) => (
            <CircleLogo key={c.id} name={c.name} color={c.color} initial={c.initial} />
          ))}
        </HScrollRow>
      </section>

      {/* 라이브 */}
      {liveItems.length > 0 && (
        <section>
          <CategoryHeader title="라이브" linkTo="/search?tab=라이브" />
          <HScrollRow>
            {liveItems.slice(0, 6).map((item) => (
              <HVideoCard
                key={item.id}
                title={item.title}
                sub={item.competition}
                tags={item.tags.slice(0, 2)}
                live={item.status === 'LIVE'}
                thumbnailUrl={item.thumbnailUrl}
                linkTo={`/contents/live/${item.id}`}
              />
            ))}
          </HScrollRow>
        </section>
      )}

      {/* 대회 */}
      {competitionItems.length > 0 && (
        <section>
          <CategoryHeader title="대회" linkTo="/search?tab=대회" />
          <HScrollRow>
            {competitionItems.slice(0, 4).map((comp) => (
              <CompBannerCard key={comp.id} name={comp.name} posterColor={comp.logoColor} />
            ))}
          </HScrollRow>
        </section>
      )}

      {/* 영상 */}
      {vodItems.length > 0 && (
        <section>
          <CategoryHeader title="영상" linkTo="/search?tab=영상" />
          <HScrollRow>
            {vodItems.slice(0, 6).map((item) => (
              <HVideoCard
                key={item.id}
                title={item.title}
                sub={item.competition}
                tags={item.tags.slice(0, 2)}
                duration={item.duration ? `${Math.floor(item.duration / 3600)}:${String(Math.floor((item.duration % 3600) / 60)).padStart(2, '0')}:${String(item.duration % 60).padStart(2, '0')}` : undefined}
                thumbnailUrl={item.thumbnailUrl}
                linkTo={`/contents/vod/${item.id}`}
              />
            ))}
          </HScrollRow>
        </section>
      )}

      {/* 클립 */}
      {clipItems.length > 0 && (
        <section>
          <CategoryHeader title="클립" linkTo="/search?tab=클립" />
          <HScrollRow>
            {clipItems.slice(0, 8).map((clip) => (
              <VClipCard
                key={clip.id}
                title={clip.title}
                thumbnailUrl={clip.thumbnail}
                linkTo={`/clip/${clip.id}`}
              />
            ))}
          </HScrollRow>
        </section>
      )}
    </div>
  );

  return (
    <div className="px-6 py-8">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#A6A6A6]" />
        <input
          type="text"
          placeholder="경기, 대회, 팀, 선수 검색"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSearch(query);
          }}
          className="w-full rounded-xl border border-border bg-surface py-3 pl-12 pr-10 text-base text-foreground placeholder-[#999] outline-none focus:border-accent"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A6A6A6] hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* Auto-complete dropdown */}
        {suggestions.length > 0 && !isSearching && (
          <div className="absolute left-0 right-0 top-full z-20 mt-1 rounded-xl border border-border bg-surface py-2 shadow-lg">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => handleSearch(s)}
                className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-[#A6A6A6] hover:bg-surface-light hover:text-foreground"
              >
                <Search className="h-3.5 w-3.5 flex-shrink-0" />
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tabs — always visible */}
      <div className="mt-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-accent text-background'
                : 'border border-border text-[#A6A6A6] hover:border-accent hover:text-foreground'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {isSearching ? (
        <>
          {/* Results */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-[#A6A6A6]">
              <p className="text-base">검색 중...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-[#A6A6A6]">
              <Search className="mb-3 h-10 w-10" />
              <p className="text-base">'{query}'에 대한 검색 결과가 없습니다.</p>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {results.map((c: ContentCard) => (
                <ContentCardItem key={c.id} content={c} variant="grid" />
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          {/* When 전체 tab is active and not searching, show categorized sections */}
          {activeTab === '전체' && renderAllCategories()}

          {/* For other tabs when not searching, show recent + trending */}
          {activeTab !== '전체' && (
            <>
              {/* Recent searches */}
              {recentSearches.length > 0 && (
                <section className="mt-8">
                  <div className="mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#A6A6A6]" />
                    <h2 className="text-base font-semibold">최근 검색어</h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term) => (
                      <div
                        key={term}
                        className="flex items-center gap-1 rounded-full border border-border bg-surface px-3 py-1.5"
                      >
                        <button
                          onClick={() => handleSearch(term)}
                          className="text-sm text-[#A6A6A6] hover:text-foreground"
                        >
                          {term}
                        </button>
                        <button
                          onClick={() => removeRecent(term)}
                          className="text-[#A6A6A6] hover:text-foreground"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Trending searches */}
              {trendingTerms.length > 0 && (
              <section className="mt-8">
                <div className="mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-accent" />
                  <h2 className="text-base font-semibold">인기 검색어</h2>
                </div>
                <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                  {trendingTerms.map((term, i) => (
                    <button
                      key={term}
                      onClick={() => handleSearch(term)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-left text-base hover:bg-surface"
                    >
                      <span
                        className={`w-5 text-center text-sm font-bold ${
                          i < 3 ? 'text-accent' : 'text-[#A6A6A6]'
                        }`}
                      >
                        {i + 1}
                      </span>
                      <span className="text-[#A6A6A6] hover:text-foreground">{term}</span>
                    </button>
                  ))}
                </div>
              </section>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
