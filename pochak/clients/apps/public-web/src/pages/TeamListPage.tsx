import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { pochakChannels } from '@/services/webApi';

type SubTab = 'team' | 'club';

export default function TeamListPage() {
  const [activeTab, setActiveTab] = useState<SubTab>('team');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = pochakChannels.filter((ch) =>
    ch.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="px-5 py-8 max-w-[1200px] mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">팀/클럽</h1>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A6A6A6]" />
        <input
          type="text"
          placeholder="팀/클럽 검색"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-[#262626] border border-[#4D4D4D] rounded-full text-sm text-white placeholder-[#A6A6A6] focus:outline-none focus:border-[#00CC33] transition-colors"
        />
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-2 mb-8">
        {([['team', '팀'], ['club', '클럽']] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
              activeTab === key
                ? 'bg-[#00CC33] text-[#1A1A1A]'
                : 'bg-[#262626] text-[#A6A6A6] hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Team tab */}
      {activeTab === 'team' && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-6">
          {filtered.map((ch) => (
            <Link
              key={ch.id}
              to={`/team/${ch.id}`}
              className="flex flex-col items-center gap-2 group"
            >
              <div
                className="w-[80px] h-[80px] rounded-full flex items-center justify-center text-lg font-bold text-white border-2 border-[#4D4D4D] group-hover:border-[#00CC33] transition-colors"
                style={{ backgroundColor: ch.color }}
              >
                {ch.initial}
              </div>
              <p className="text-sm font-medium text-white text-center truncate w-full">
                {ch.name}
              </p>
              <p className="text-[11px] text-[#A6A6A6] text-center truncate w-full">
                {ch.subtitle}
              </p>
            </Link>
          ))}
        </div>
      )}

      {/* Club tab */}
      {activeTab === 'club' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((ch) => (
            <Link
              key={ch.id}
              to={`/club/${ch.id}`}
              className="bg-[#262626] rounded-xl p-4 hover:bg-[#333333] transition-colors flex items-center gap-4"
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-base font-bold text-white flex-shrink-0 border-2 border-[#4D4D4D]"
                style={{ backgroundColor: ch.color }}
              >
                {ch.initial}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-bold text-white truncate">{ch.name}</p>
                <p className="text-sm text-[#A6A6A6] mt-0.5 truncate">{ch.subtitle}</p>
                <p className="text-xs text-[#00CC33] mt-1">
                  멤버 {ch.memberCount.toLocaleString()}명
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {filtered.length === 0 && (
        <p className="text-center text-[#A6A6A6] text-sm py-16">검색 결과가 없습니다.</p>
      )}
    </div>
  );
}
