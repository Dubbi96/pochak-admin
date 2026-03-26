import { useState } from 'react';
import { Star, MoreHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import SocialLinks from './SocialLinks';
import TeamLogo from './TeamLogo';

export interface BannerData {
  name: string;
  sport: string;
  organizer: string;
  dateRange: string;
  description: string;
  posterColor: string;
  posterText?: string;
  socialLinks?: Record<string, string>;
  joinedTeams?: { id: string; color: string; short: string; name: string }[];
  isTeam?: boolean;
}

export default function CompetitionBanner({
  data,
  onPurchase,
  ctaLabel,
}: {
  data: BannerData;
  onPurchase?: () => void;
  ctaLabel?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <div className="rounded-2xl overflow-hidden">
      <div
        className="relative p-6 lg:p-8"
        style={{
          background: `linear-gradient(135deg, ${data.posterColor}33 0%, #262626 60%)`,
        }}
      >
        <div className="flex flex-col md:flex-row gap-6">
          <div
            className="w-32 h-44 md:w-40 md:h-56 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: data.posterColor }}
          >
            <span className="text-white text-lg font-bold text-center px-3">
              {data.posterText ?? data.sport}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-2xl lg:text-3xl font-bold text-white">{data.name}</h1>
            <p className="text-sm text-[#A6A6A6] mt-2">
              {data.sport} · {data.organizer}
            </p>
            <p className="text-sm text-[#00CC33] mt-1">{data.dateRange}</p>

            <div className="mt-3">
              <p className={`text-sm text-[#A6A6A6] leading-relaxed ${expanded ? '' : 'line-clamp-2'}`}>
                {data.description}
              </p>
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-1 text-xs text-[#A6A6A6] hover:text-white mt-1 transition-colors"
              >
                {expanded ? '접기' : '자세히보기'}
                {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>
            </div>

            <div className="flex items-center gap-3 mt-4">
              {onPurchase && (
                <button
                  onClick={onPurchase}
                  className="px-5 py-2 rounded-lg bg-[#00CC33] text-[#1A1A1A] text-sm font-bold hover:bg-[#00E676] transition-colors"
                >
                  {ctaLabel ?? '대회권 구매'}
                </button>
              )}
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`p-2 rounded-lg border transition-colors ${
                  isFavorite
                    ? 'border-yellow-400 text-yellow-400'
                    : 'border-[#4D4D4D] text-[#A6A6A6] hover:text-white'
                }`}
              >
                <Star className={`h-5 w-5 ${isFavorite ? 'fill-yellow-400' : ''}`} />
              </button>
              <button className="p-2 rounded-lg border border-[#4D4D4D] text-[#A6A6A6] hover:text-white transition-colors" onClick={() => alert('공유/신고 메뉴는 준비 중입니다.')}>
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4">
              <SocialLinks links={data.socialLinks} />
            </div>

            {data.joinedTeams && data.joinedTeams.length > 0 && (
              <div className="mt-4">
                <p className="text-xs text-[#A6A6A6] mb-2">가입한팀</p>
                <div className="flex items-center gap-2">
                  {data.joinedTeams.map((team) => (
                    <TeamLogo key={team.id} color={team.color} short={team.short} size="sm" />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
