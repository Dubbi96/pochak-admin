import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import FilterChip from '@/components/FilterChip';
import { VideoCard, ClipCard } from '@/components/Card';
import { useContents } from '@/hooks/useApi';


type FilterType = '전체' | 'LIVE' | 'VOD' | 'CLIP';
const typeFilters: FilterType[] = ['전체', 'LIVE', 'VOD', 'CLIP'];
const sportFilters = ['전체', '축구', '농구', '배구', '야구', '풋살', '핸드볼'];

export default function ContentListPage() {
  const [searchParams] = useSearchParams();
  const initialType = (searchParams.get('type') as FilterType | null) ?? '전체';

  const [selectedType, setSelectedType] = useState<FilterType>(
    typeFilters.includes(initialType) ? initialType : '전체'
  );
  const [selectedSport, setSelectedSport] = useState('전체');
  const [sortBy, setSortBy] = useState<'최신순' | '인기순'>('최신순');
  const [page, setPage] = useState(1);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const apiType = selectedType === '전체' ? undefined : selectedType;
  const apiSport = selectedSport === '전체' ? undefined : selectedSport;
  const apiSort = sortBy === '최신순' ? 'latest' : 'popular';
  const { data: allContents } = useContents(apiType, apiSport, apiSort);

  const filtered = useMemo(() => {
    return allContents;
  }, [allContents]);

  const paged = filtered.slice(0, page * 12);
  const hasMore = paged.length < filtered.length;
  const isClipView = selectedType === 'CLIP';

  /* Infinite scroll */
  const loadMore = useCallback(() => {
    if (hasMore) setPage((p) => p + 1);
  }, [hasMore]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore(); },
      { rootMargin: '200px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <div className="py-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-5">콘텐츠</h1>
      </div>

      {/* Sticky filter bar */}
      <div className="sticky top-14 z-30 -mx-6 px-6 lg:-mx-8 lg:px-8 pt-2 bg-pochak-bg/80 backdrop-blur-xl mb-4">
        <div className="flex flex-col gap-0">
          <div className="flex items-center gap-0 overflow-x-auto scrollbar-hide border-b border-white/[0.06]">
            <span className="text-[14px] text-pochak-text-tertiary font-semibold flex-shrink-0 mr-2">유형</span>
            {typeFilters.map((t) => (
              <FilterChip
                key={t}
                label={t}
                selected={selectedType === t}
                onClick={() => { setSelectedType(t); setPage(1); }}
              />
            ))}
          </div>
          <div className="flex items-center gap-0 overflow-x-auto scrollbar-hide border-b border-white/[0.06]">
            <span className="text-[14px] text-pochak-text-tertiary font-semibold flex-shrink-0 mr-2">종목</span>
            {sportFilters.map((s) => (
              <FilterChip
                key={s}
                label={s}
                selected={selectedSport === s}
                onClick={() => { setSelectedSport(s); setPage(1); }}
              />
            ))}
          </div>
          <div className="flex items-center gap-0 border-b border-white/[0.06]">
            <span className="text-[14px] text-pochak-text-tertiary font-semibold flex-shrink-0 mr-2">정렬</span>
            {(['최신순', '인기순'] as const).map((s) => (
              <FilterChip
                key={s}
                label={s}
                selected={sortBy === s}
                onClick={() => { setSortBy(s); setPage(1); }}
              />
            ))}
          </div>
        </div>
      </div>

      <p className="text-[14px] text-pochak-text-tertiary mb-4">
        총 <span className="text-foreground font-semibold">{filtered.length}</span>개
      </p>

      {paged.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
          <p className="text-[15px]">조건에 맞는 콘텐츠가 없습니다.</p>
        </div>
      ) : isClipView ? (
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {paged.map((c) => (
            <ClipCard key={c.id} id={c.id} title={c.title} viewCount={c.viewCount} className="w-auto" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-4 gap-y-6" style={{ gridTemplateColumns: isClipView ? undefined : 'repeat(auto-fill, minmax(240px, 1fr))' }}>
          {paged.map((c) => (
            <VideoCard
              key={c.id} id={c.id} title={c.title} competition={c.competition}
              type={c.type} tags={c.tags} duration={c.duration} date={c.date}
              viewCount={c.viewCount} isLive={c.isLive} isFree={c.isFree}
              className="w-auto"
            />
          ))}
        </div>
      )}

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="h-px" />

      {hasMore && (
        <div className="mt-4 text-center">
          <div className="inline-flex items-center gap-2 text-[14px] text-pochak-text-tertiary">
            <div className="w-5 h-5 border-2 border-pochak-text-muted border-t-primary rounded-full animate-spin" />
            불러오는 중...
          </div>
        </div>
      )}
    </div>
  );
}
