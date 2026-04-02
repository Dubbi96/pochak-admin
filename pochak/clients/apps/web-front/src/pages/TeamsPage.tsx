import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { LuSearch, LuSparkles, LuUsers } from 'react-icons/lu';
import FilterChip from '@/components/FilterChip';
import { useTeams } from '@/hooks/useApi';
import { useDebounce } from '@/hooks/useDebounce';
import type { Channel } from '@/types/content';
import { Input } from '@/components/ui/input';

const sportFilters = ['전체', '축구', '농구', '야구', '배구', '풋살', '핸드볼'];

export default function TeamsPage() {
  const { data: teams } = useTeams();
  const [selectedSport, setSelectedSport] = useState('전체');
  const [searchQuery, setSearchQuery] = useState('');

  const debouncedQuery = useDebounce(searchQuery, 300);
  const displayTeams = teams;
  const filtered = useMemo(() => {
    return displayTeams.filter((team) => {
      const matchQuery =
        !debouncedQuery ||
        team.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        team.subtitle.toLowerCase().includes(debouncedQuery.toLowerCase());
      const matchSport = selectedSport === '전체' || team.subtitle.includes(selectedSport);
      return matchQuery && matchSport;
    });
  }, [displayTeams, debouncedQuery, selectedSport]);

  return (
    <div className="px-4 py-6 md:px-6 lg:px-8">
      <section className="py-4">
        <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[13px] font-medium uppercase tracking-[0.16em] text-primary">
              <LuSparkles className="h-3.5 w-3.5" />
              Teams & Clubs
            </div>
            <h1 className="mt-5 text-[32px] font-semibold tracking-[-0.04em] text-white">팀/클럽 탐색</h1>
            <p className="mt-3 max-w-[540px] text-[15px] leading-6 text-white/62">
              기획서의 리스트 화면은 단순 썸네일 그리드보다 더 촘촘한 정보 밀도와 명확한 탐색 흐름을 가진다. 검색과 필터,
              팀 카드 위계, 팔로워 정보의 톤을 통일했다.
            </p>
          </div>

          <div>
            <div className="relative">
              <LuSearch className="absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="팀/클럽 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12"
                style={{ paddingLeft: 48 }}
              />
            </div>
            <div className="mt-4 flex flex-wrap gap-0 border-b border-white/[0.06]">
              {sportFilters.map((sport) => (
                <FilterChip
                  key={sport}
                  label={sport}
                  selected={selectedSport === sport}
                  onClick={() => setSelectedSport(sport)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {filtered.map((team) => (
          <Link
            key={team.id}
            to={`/team/${team.id}`}
            className="py-3 transition-colors hover:border-border-subtle"
          >
            <div className="flex items-start justify-between">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 text-lg font-semibold text-white"
                style={{ backgroundColor: team.color }}
              >
                {team.initial}
              </div>
              <span className="inline-flex items-center gap-1 rounded-full border border-white/10 px-2.5 py-0.5 text-[14px] text-white/[0.58]">
                <LuUsers className="h-3.5 w-3.5 text-white/50" />
                {team.followers.toLocaleString()}
              </span>
            </div>
            <div className="mt-8">
              <h2 className="text-[18px] font-semibold tracking-[-0.03em] text-white">{team.name}</h2>
              <p className="mt-2 text-[14px] text-white/46">{team.subtitle}</p>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="px-0 py-16 text-center text-white/55">
          검색 결과가 없습니다.
        </div>
      )}
    </div>
  );
}
