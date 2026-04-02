import { useState, useMemo } from 'react';
import FilterChip from '@/components/FilterChip';
import { CompetitionBannerCard } from '@/components/Card';
import { useCompetitions } from '@/hooks/useApi';

type StatusFilter = '전체' | '진행중' | '예정' | '종료';
const statusFilters: StatusFilter[] = ['전체', '진행중', '예정', '종료'];
const sportFilters = ['전체', '축구', '농구', '야구', '배구', '풋살', '핸드볼'];

export default function CompetitionListPage() {
  const { data: competitions } = useCompetitions();
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('전체');
  const [selectedSport, setSelectedSport] = useState('전체');

  const filtered = useMemo(() => {
    let list = competitions;
    if (selectedStatus !== '전체') {
      // Mock data doesn't have status/sport fields yet; show all for now
      list = list.filter((c) => (c as any).status === selectedStatus);
    }
    if (selectedSport !== '전체') {
      list = list.filter((c) => (c as any).sport === selectedSport);
    }
    return list;
  }, [selectedStatus, selectedSport]);

  return (
    <div className="py-6">
      <h1 className="text-[28px] font-bold text-foreground mb-5">대회</h1>

      {/* Filters */}
      <div className="flex flex-col gap-0 mb-6">
        <div className="flex items-center gap-0 flex-wrap border-b border-white/[0.06]">
          <span className="text-[14px] text-pochak-text-tertiary font-semibold mr-2 flex-shrink-0">상태</span>
          {statusFilters.map((s) => (
            <FilterChip
              key={s}
              label={s}
              selected={selectedStatus === s}
              onClick={() => setSelectedStatus(s)}
            />
          ))}
        </div>
        <div className="flex items-center gap-0 flex-wrap border-b border-white/[0.06]">
          <span className="text-[14px] text-pochak-text-tertiary font-semibold mr-2 flex-shrink-0">종목</span>
          {sportFilters.map((s) => (
            <FilterChip
              key={s}
              label={s}
              selected={selectedSport === s}
              onClick={() => setSelectedSport(s)}
            />
          ))}
        </div>
      </div>

      {/* Result count */}
      <p className="text-sm text-muted-foreground mb-4">총 {filtered.length}개</p>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((comp) => (
            <CompetitionBannerCard key={comp.id} {...comp} />
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          조건에 맞는 대회가 없습니다.
        </div>
      )}
    </div>
  );
}
