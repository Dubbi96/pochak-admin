import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Bell } from 'lucide-react';
import HScrollRow from '@/components/HScrollRow';
import {
  pochakVodContents,
  pochakCompetitions,
  pochakChannels,
} from '@/services/webApi';
import { SubTabChips } from './shared';

export default function FavoritesPage() {
  const [sub, setSub] = useState<'team' | 'competition'>('team');

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">즐겨찾기</h1>

      <SubTabChips
        tabs={[
          { key: 'team' as const, label: '팀/클럽' },
          { key: 'competition' as const, label: '대회' },
        ]}
        active={sub}
        onChange={setSub}
      />

      {sub === 'team' && (
        <div className="space-y-8">
          {/* Team logos horizontal row */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[18px] font-semibold text-white">팀/클럽</h3>
              <Link to="/my/favorites" className="text-[13px] text-[#A6A6A6] hover:text-white transition-colors">
                &gt;
              </Link>
            </div>
            <HScrollRow scrollAmount={200}>
              {pochakChannels.map((ch) => (
                <div key={ch.id} className="flex-shrink-0 flex flex-col items-center gap-1.5 w-[100px]">
                  <div
                    className="w-[80px] h-[80px] rounded-full flex items-center justify-center text-lg font-bold text-white border-2 border-[#4D4D4D]"
                    style={{ backgroundColor: ch.color }}
                  >
                    {ch.initial}
                  </div>
                  <p className="text-[13px] text-white text-center truncate w-full">{ch.name}</p>
                  <p className="text-[11px] text-[#A6A6A6] text-center truncate w-full">{ch.subtitle}</p>
                </div>
              ))}
            </HScrollRow>
          </section>

          {/* Favorite team content list */}
          <section>
            <div className="space-y-3">
              {pochakVodContents.slice(0, 6).map((v) => (
                <Link
                  key={v.id}
                  to={`/contents/vod/${v.id}`}
                  className="flex items-center gap-4 p-3 rounded-lg bg-[#262626] hover:bg-[#333] transition-colors group"
                >
                  <Bookmark className="h-5 w-5 text-[#00CC33] fill-[#00CC33] flex-shrink-0" />
                  <div className="w-[120px] flex-shrink-0">
                    {v.thumbnailUrl ? (
                      <img src={v.thumbnailUrl} alt="" className="aspect-video rounded object-cover w-full" />
                    ) : (
                      <div className="aspect-video rounded bg-[#404040] flex items-center justify-center">
                        <span className="text-[#00CC33] font-black text-[13px]">P</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] text-white font-medium line-clamp-1 group-hover:text-[#00CC33] transition-colors">
                      {v.title}
                    </p>
                    <p className="text-[12px] text-[#A6A6A6] mt-0.5">{v.competition}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {v.tags.slice(0, 4).map((t) => (
                        <span key={t} className="px-1.5 py-0.5 rounded text-[11px] bg-[#1A1A1A] text-[#A6A6A6]">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Bell className="h-5 w-5 text-[#A6A6A6] hover:text-[#00CC33] flex-shrink-0 transition-colors" />
                </Link>
              ))}
            </div>
          </section>
        </div>
      )}

      {sub === 'competition' && (
        <div className="space-y-3">
          {pochakCompetitions.map((comp) => (
            <Link
              key={comp.id}
              to={`/competition/${comp.id}`}
              className="flex items-center gap-4 p-3 rounded-lg bg-[#262626] hover:bg-[#333] transition-colors group"
            >
              <Bookmark className="h-5 w-5 text-[#00CC33] fill-[#00CC33] flex-shrink-0" />
              <div className="w-[120px] flex-shrink-0">
                <div
                  className="aspect-video rounded-lg flex items-center justify-center overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${comp.logoColor}CC, ${comp.logoColor}66)`,
                  }}
                >
                  <span className="text-white text-lg font-black drop-shadow-lg">{comp.logoText}</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] text-white font-medium line-clamp-1 group-hover:text-[#00CC33] transition-colors">
                  {comp.name}
                </p>
                <p className="text-[12px] text-[#A6A6A6] mt-0.5">{comp.dateRange}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  <span className="px-1.5 py-0.5 rounded text-[11px] bg-[#1A1A1A] text-[#A6A6A6]">
                    {comp.sport}
                  </span>
                </div>
              </div>
              <Bell className="h-5 w-5 text-[#A6A6A6] hover:text-[#00CC33] flex-shrink-0 transition-colors" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
