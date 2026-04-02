import { Link } from 'react-router-dom';
import { LuEye, LuEllipsis, LuPlus } from 'react-icons/lu';
import { formatViewCount } from '@/lib/utils';
import { cn } from '@/lib/utils';

/* ══════════════════════════════════════════════════════════
   Video Card (16:9)
   ══════════════════════════════════════════════════════════ */
export function VideoCard({
  id, title, competition, type, tags, duration, date,
  isLive, isFree, viewCount, thumbnailUrl, homeTeam, awayTeam,
  competitionLogo, className,
}: {
  id: string; title: string; competition: string; type: 'LIVE' | 'VOD' | 'CLIP';
  tags?: string[]; duration?: string; date?: string; isLive?: boolean; isFree?: boolean;
  viewCount?: number; thumbnailUrl?: string; homeTeam?: string; awayTeam?: string;
  competitionLogo?: string; className?: string;
}) {
  const linkPath = type === 'CLIP' ? `/clip/${id}` : `/contents/${type.toLowerCase()}/${id}`;

  return (
    <Link
      to={linkPath}
      className={cn('flex-shrink-0 group block w-[220px] xl:w-[240px] 2xl:w-[260px]', className)}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video rounded-xl overflow-hidden bg-[#272727]">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 bg-[#272727] flex items-center justify-center">
            <img src="/pochak-icon.svg" alt="" className="w-8 h-8 opacity-15" />
          </div>
        )}

        {/* Duration badge */}
        {duration && !isLive && (
          <span className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-[12px] font-medium px-1.5 py-0.5 rounded-md">
            {duration}
          </span>
        )}

        {/* LIVE badge */}
        {isLive && (
          <span className="absolute bottom-1.5 left-1.5 bg-pochak-live text-white text-[11px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full z-10 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-[pulse-live_1.5s_ease-in-out_infinite]" />
            LIVE
          </span>
        )}

        {/* Free badge */}
        {isFree && (
          <span className="absolute top-1.5 left-1.5 bg-pochak-info text-white text-[11px] font-medium px-1.5 py-0.5 rounded z-10">
            무료
          </span>
        )}

        {/* Scheduled date */}
        {!isLive && date && type === 'LIVE' && (
          <span className="absolute top-1.5 right-1.5 bg-black/80 text-white text-[11px] font-medium px-1.5 py-0.5 rounded z-10">
            {date.slice(5, 10).replace('-', '/')} 예정
          </span>
        )}
      </div>

      {/* Meta: club badge left, 3 lines right */}
      <div className="mt-3 flex gap-3">
        {/* Club badge */}
        <div
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.location.href = '/team/1'; }}
          className={cn(
            'w-9 h-9 rounded-full flex-shrink-0 mt-0.5 cursor-pointer',
            isLive && 'ring-2 ring-pochak-live',
          )}
        >
          <div className="w-9 h-9 rounded-full bg-pochak-surface flex items-center justify-center hover:bg-pochak-surface-hover transition-colors duration-200">
            <span className="text-[11px] font-bold text-primary">P</span>
          </div>
        </div>

        {/* 3 lines: title / subtitle / views+date */}
        <div className="flex-1 min-w-0">
          <p className="text-[14px] leading-5 font-medium text-[#f1f1f1] line-clamp-1">
            {title}
          </p>
          <p className="text-[12px] text-[#aaa] mt-0.5 line-clamp-1">
            {competition}
          </p>
          <p className="text-[12px] text-[#717171] mt-0.5">
            {isLive ? (
              <>{viewCount !== undefined ? `${formatViewCount(viewCount)}명 시청 중` : '시청 중'}{date ? ` · ${date.slice(0, 10)}` : ''}</>
            ) : (
              <>{viewCount !== undefined ? `조회수 ${formatViewCount(viewCount)}회` : ''}{viewCount !== undefined && date ? ' · ' : ''}{date ? date.slice(0, 10) : ''}</>
            )}
          </p>
        </div>

        {/* More menu */}
        <button
          onClick={(e) => e.preventDefault()}
          className="self-start mt-1 w-6 h-6 flex items-center justify-center text-[#717171] hover:text-white opacity-0 group-hover:opacity-100 transition-all duration-200"
        >
          <LuEllipsis className="w-4 h-4" />
        </button>
      </div>
    </Link>
  );
}

/* ══════════════════════════════════════════════════════════
   Clip Card (9:16 vertical)
   ══════════════════════════════════════════════════════════ */
export function ClipCard({
  id, title, viewCount, thumbnailUrl, className,
}: {
  id: string; title: string; viewCount?: number; thumbnailUrl?: string; className?: string;
}) {
  return (
    <Link to={`/clip/${id}`} className={cn('flex-shrink-0 group block w-[155px] xl:w-[165px] 2xl:w-[175px]', className)}>
      <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-[#272727]">
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt={title} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="absolute inset-0 bg-[#272727] flex items-center justify-center">
            <img src="/pochak-icon.svg" alt="" className="w-6 h-6 opacity-15" />
          </div>
        )}

        {/* Bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Title + views overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-2.5 z-10">
          <p className="text-[13px] text-white font-medium line-clamp-2 leading-tight">{title}</p>
          {viewCount !== undefined && (
            <p className="text-[11px] text-white/70 mt-1 flex items-center gap-1">
              <LuEye className="w-3 h-3" /> {formatViewCount(viewCount)}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

/* ══════════════════════════════════════════════════════════
   Team/Club Logo Card
   ══════════════════════════════════════════════════════════ */
export function TeamLogoCard({
  id, name, subtitle, color, initial,
  isActive, followers, imageUrl, className,
}: {
  id: string; name: string; subtitle: string; color: string; initial: string;
  isActive?: boolean; followers?: number; imageUrl?: string; className?: string;
}) {
  return (
    <Link
      to={`/team/${id}`}
      className={cn('flex-shrink-0 flex flex-col items-center w-[140px] group cursor-pointer py-3 px-2 rounded-lg transition-colors duration-200 hover:bg-white/[0.05]', className)}
    >
      {/* Avatar */}
      <div className="relative">
        <div
          className={cn(
            'h-[88px] w-[88px] rounded-full flex items-center justify-center',
            isActive && 'ring-[3px] ring-pochak-live ring-offset-2 ring-offset-background',
          )}
          style={{ backgroundColor: color }}
        >
          {imageUrl ? (
            <img src={imageUrl} alt={name} className="w-full h-full rounded-full object-cover" />
          ) : (
            <span className="text-[28px] font-bold text-white select-none">{initial}</span>
          )}
        </div>

        {/* LIVE badge */}
        {isActive && (
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-pochak-live text-white text-[10px] font-bold px-2 py-0.5 rounded-sm">
            LIVE
          </span>
        )}
      </div>

      <p className="text-[13px] font-medium text-[#f1f1f1] text-center mt-3 truncate w-full">
        {name}
      </p>
      <p className="text-[12px] text-[#aaa] text-center truncate w-full">
        {subtitle}
      </p>
      {followers !== undefined && (
        <p className="text-[11px] text-[#717171] text-center mt-0.5">
          {formatViewCount(followers)}명
        </p>
      )}
    </Link>
  );
}

/* ══════════════════════════════════════════════════════════
   Team Card (with background image)
   ══════════════════════════════════════════════════════════ */
export function TeamCard({
  id, name, subtitle, color, initial, imageUrl, followers, className,
}: {
  id: string; name: string; subtitle: string; color: string; initial: string;
  imageUrl?: string; followers?: number; className?: string;
}) {
  return (
    <Link to={`/team/${id}`} className={cn('flex-shrink-0 group block w-[200px]', className)}>
      <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-[#272727]">
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: `${color}30` }}>
            <span className="text-[40px] font-bold text-white/20">{initial}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-3 right-3">
          <p className="text-[14px] font-semibold text-white truncate">{name}</p>
          <p className="text-[12px] text-white/60">{subtitle}</p>
        </div>
      </div>
    </Link>
  );
}

/* ══════════════════════════════════════════════════════════
   Competition Banner Card
   ══════════════════════════════════════════════════════════ */
export function CompetitionBannerCard({
  id, name, dateRange, logoColor, imageUrl, isAd, className,
}: {
  id: string; name: string; dateRange: string; logoColor: string;
  logoText?: string; isAd?: boolean; imageUrl?: string; className?: string;
}) {
  return (
    <Link to={`/competition/${id}`} className={cn('flex-shrink-0 w-full rounded-xl overflow-hidden bg-[#272727] group', className)}>
      <div className="aspect-video relative overflow-hidden">
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${logoColor}40, var(--color-bg-surface-3))` }}>
            <img src="/competition-logo.svg" alt="" className="w-20 h-20 opacity-20" />
          </div>
        )}
        {isAd && (
          <span className="absolute top-2 right-2 bg-black/60 text-white/50 text-[10px] font-medium px-1.5 py-0.5 rounded">
            AD
          </span>
        )}
      </div>
      <div className="px-3 py-2.5">
        <p className="text-[14px] text-[#f1f1f1] font-medium truncate">{name}</p>
        <p className="text-[12px] text-[#aaa] mt-0.5">{dateRange}</p>
      </div>
    </Link>
  );
}
