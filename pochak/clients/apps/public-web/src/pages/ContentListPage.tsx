import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ContentCardItem from '@/components/ContentCardItem';
import { getAllContents, fetchContentList } from '@/services/webApi';
import type { ContentType, SportType, ContentCard } from '@/services/webApi';

type SortType = '최신순' | '인기순';

const typeFilters: (ContentType | '전체')[] = ['전체', 'LIVE', 'VOD', 'CLIP'];
const sportFilters: SportType[] = ['전체', '축구', '농구', '배구', '야구', '풋살'];
const sortOptions: SortType[] = ['최신순', '인기순'];

const ITEMS_PER_PAGE = 12;

export default function ContentListPage() {
  const [searchParams] = useSearchParams();
  const initialType = (searchParams.get('type') as ContentType | null) || '전체';

  const [selectedType, setSelectedType] = useState<ContentType | '전체'>(
    typeFilters.includes(initialType as ContentType) ? (initialType as ContentType) : '전체'
  );
  const [selectedSport, setSelectedSport] = useState<SportType>('전체');
  const [sortBy, setSortBy] = useState<SortType>('최신순');
  const [page, setPage] = useState(1);
  const [contents, setContents] = useState<ContentCard[]>(() => getAllContents());

  // Fetch from API when filters change
  useEffect(() => {
    const type = selectedType === '전체' ? undefined : selectedType;
    const sport = selectedSport === '전체' ? undefined : selectedSport;
    const sort = sortBy === '최신순' ? 'latest' : 'popular';
    fetchContentList(type, sport, sort, page).then(setContents).catch(() => {});
  }, [selectedType, selectedSport, sortBy, page]);

  const filtered = useMemo(() => {
    let list = contents;
    if (selectedType !== '전체') {
      list = list.filter((c) => c.type === selectedType);
    }
    if (selectedSport !== '전체') {
      list = list.filter((c) => c.sport === selectedSport);
    }
    if (sortBy === '최신순') {
      list = [...list].sort((a, b) => b.date.localeCompare(a.date));
    } else {
      list = [...list].sort((a, b) => b.viewCount - a.viewCount);
    }
    return list;
  }, [contents, selectedType, selectedSport, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paged = filtered.slice(0, page * ITEMS_PER_PAGE);

  return (
    <div className="px-6 py-8">
      <h1 className="mb-6 text-2xl font-bold">콘텐츠</h1>

      {/* Filters */}
      <div className="mb-6 space-y-3">
        {/* Type chips */}
        <div className="flex flex-wrap gap-2">
          <span className="mr-2 self-center text-sm text-[#A6A6A6]">유형</span>
          {typeFilters.map((t) => (
            <button
              key={t}
              onClick={() => { setSelectedType(t); setPage(1); }}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                selectedType === t
                  ? 'bg-accent text-background'
                  : 'border border-border text-[#A6A6A6] hover:border-accent hover:text-foreground'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Sport chips */}
        <div className="flex flex-wrap gap-2">
          <span className="mr-2 self-center text-sm text-[#A6A6A6]">종목</span>
          {sportFilters.map((s) => (
            <button
              key={s}
              onClick={() => { setSelectedSport(s); setPage(1); }}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                selectedSport === s
                  ? 'bg-accent text-background'
                  : 'border border-border text-[#A6A6A6] hover:border-accent hover:text-foreground'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <span className="mr-2 text-sm text-[#A6A6A6]">정렬</span>
          {sortOptions.map((s) => (
            <button
              key={s}
              onClick={() => { setSortBy(s); setPage(1); }}
              className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                sortBy === s
                  ? 'bg-accent text-background'
                  : 'border border-border text-[#A6A6A6] hover:border-accent hover:text-foreground'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Result count */}
      <p className="mb-4 text-sm text-[#A6A6A6]">
        총 {filtered.length}개의 콘텐츠
      </p>

      {/* Grid — left-aligned, no mx-auto or max-w centering */}
      {paged.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#A6A6A6]">
          <p className="text-sm">조건에 맞는 콘텐츠가 없습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {paged.map((c) => (
            <ContentCardItem key={c.id} content={c} variant="grid" />
          ))}
        </div>
      )}

      {/* Load more */}
      {page < totalPages && (
        <div className="mt-8 text-center">
          <button
            onClick={() => setPage((p) => p + 1)}
            className="rounded-xl border border-border px-8 py-3 text-sm font-medium text-[#A6A6A6] transition-colors hover:border-accent hover:text-foreground"
          >
            더보기
          </button>
        </div>
      )}
    </div>
  );
}
