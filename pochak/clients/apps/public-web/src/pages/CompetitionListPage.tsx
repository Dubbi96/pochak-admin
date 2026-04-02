import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MoreHorizontal } from 'lucide-react';
import { pochakCompetitions } from '@/services/webApi';

const SPORT_FILTERS = ['전체', '축구', '야구', '배구', '핸드볼', '농구', '기타'] as const;

const gradients = [
  'linear-gradient(135deg, #1a237e 0%, #283593 50%, #3949ab 100%)',
  'linear-gradient(135deg, #b71c1c 0%, #c62828 50%, #e53935 100%)',
  'linear-gradient(135deg, #004d40 0%, #00695c 50%, #00897b 100%)',
  'linear-gradient(135deg, #e65100 0%, #ef6c00 50%, #f57c00 100%)',
  'linear-gradient(135deg, #4a148c 0%, #6a1b9a 50%, #7b1fa2 100%)',
];

export default function CompetitionListPage() {
  const [activeFilter, setActiveFilter] = useState<string>('전체');

  const filtered =
    activeFilter === '전체'
      ? pochakCompetitions
      : pochakCompetitions.filter(
          (c) => c.sport === activeFilter || (activeFilter === '기타' && !SPORT_FILTERS.slice(1, -1).includes(c.sport as typeof SPORT_FILTERS[number])),
        );

  return (
    <div className="px-5 py-8 max-w-[1200px] mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">대회</h1>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2 mb-8">
        {SPORT_FILTERS.map((sport) => (
          <button
            key={sport}
            onClick={() => setActiveFilter(sport)}
            className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
              activeFilter === sport
                ? 'bg-[#00CC33] text-[#1A1A1A] font-semibold'
                : 'bg-[#262626] text-[#A6A6A6] hover:text-white'
            }`}
          >
            {sport}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((c, idx) => (
          <Link
            key={c.id}
            to={`/tv/competition/${c.id}`}
            className="bg-[#262626] rounded-xl overflow-hidden hover:bg-[#333333] transition-colors group relative"
          >
            {c.isAd && (
              <span className="absolute top-3 right-3 z-10 text-xs text-[#A6A6A6] bg-[#404040] px-1.5 py-0.5 rounded">
                AD
              </span>
            )}
            {/* Gradient banner + logo */}
            <div
              className="w-full h-[120px] flex items-center justify-center"
              style={{ background: gradients[idx % gradients.length] }}
            >
              <div
                className="w-14 h-14 rounded-lg flex items-center justify-center text-sm font-bold text-white"
                style={{ backgroundColor: c.logoColor }}
              >
                {c.logoText}
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-base font-bold text-white leading-tight">{c.name}</p>
                  <p className="text-sm text-[#A6A6A6] mt-0.5">{c.subtitle}</p>
                </div>
                <button
                  onClick={(e) => e.preventDefault()}
                  className="text-[#A6A6A6] hover:text-white transition-colors flex-shrink-0"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-[#00CC33] font-medium mt-2">{c.dateRange}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                <span className="px-1.5 py-0.5 rounded text-[11px] bg-[#404040] text-[#A6A6A6]">
                  {c.sport}
                </span>
                {c.isAd && (
                  <span className="px-1.5 py-0.5 rounded text-[11px] bg-[#404040] text-[#A6A6A6]">
                    광고
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-[#A6A6A6] text-sm py-16">해당 종목의 대회가 없습니다.</p>
      )}
    </div>
  );
}
