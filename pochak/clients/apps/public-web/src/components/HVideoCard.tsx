import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, MoreHorizontal } from 'lucide-react';

function ThumbPlaceholder({ className = '', thumbnailUrl }: { className?: string; thumbnailUrl?: string }) {
  if (thumbnailUrl) {
    return <img src={thumbnailUrl} alt="" className={`object-cover ${className}`} />;
  }
  return (
    <div className={`bg-[#262626] flex items-center justify-center ${className}`}>
      <div className="text-center">
        <div className="w-8 h-8 mx-auto rounded bg-[#404040] flex items-center justify-center">
          <span className="text-[#00CC33] font-black text-[13px]">P</span>
        </div>
      </div>
    </div>
  );
}

export default function HVideoCard({
  title,
  sub,
  tags,
  duration,
  live,
  linkTo,
  thumbnailUrl,
  className = 'w-[280px]',
  freeBadge,
  commentaryBadge,
  dateBadge,
  showBookmark,
  showMoreMenu,
}: {
  title: string;
  sub: string;
  tags?: string[];
  duration?: string;
  live?: boolean;
  linkTo?: string;
  thumbnailUrl?: string;
  className?: string;
  freeBadge?: boolean;
  commentaryBadge?: boolean;
  dateBadge?: string;
  showBookmark?: boolean;
  showMoreMenu?: boolean;
}) {
  const [bookmarked, setBookmarked] = useState(false);

  const content = (
    <div className={`flex-shrink-0 ${className} cursor-pointer group`}>
      <div className="relative">
        <ThumbPlaceholder thumbnailUrl={thumbnailUrl} className="aspect-video rounded-lg overflow-hidden group-hover:ring-1 group-hover:ring-[#00CC33] transition-all" />
        {live && (
          <span className="absolute top-2 left-2 flex items-center gap-1 bg-[#E51728] text-white text-[11px] font-bold px-2 py-0.5 rounded">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />LIVE
          </span>
        )}
        {dateBadge && !live && (
          <span className="absolute top-2 left-2 bg-[#00CC33] text-white text-[11px] font-bold px-2 py-0.5 rounded">
            {dateBadge}
          </span>
        )}
        {showBookmark && (
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setBookmarked((v) => !v); }}
            className="absolute top-2 right-2 text-white/80 hover:text-white transition-colors z-10"
          >
            <Bookmark className={`h-4 w-4 ${bookmarked ? 'fill-[#00CC33] text-[#00CC33]' : ''}`} />
          </button>
        )}
        {(freeBadge || commentaryBadge) && !showBookmark && (
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            {freeBadge && (
              <span className="bg-[#00CC33] text-white text-[11px] font-bold px-2 py-0.5 rounded-full">무료</span>
            )}
            {commentaryBadge && (
              <span className="bg-[#404040] text-white text-[11px] font-bold px-2 py-0.5 rounded-full">해설</span>
            )}
          </div>
        )}
        {duration && (
          <span className="absolute bottom-1.5 right-1.5 bg-black/70 text-white text-[11px] px-1.5 py-0.5 rounded">{duration}</span>
        )}
      </div>
      <div className="flex items-start gap-1 mt-2">
        <div className="flex-1 min-w-0">
          <p className="text-[15px] text-white font-semibold leading-tight line-clamp-2 group-hover:text-white transition-colors">{title}</p>
          <p className="text-[13px] text-[#A6A6A6] mt-0.5 line-clamp-1">{sub}</p>
        </div>
        {showMoreMenu && (
          <button
            onClick={(e) => e.preventDefault()}
            className="flex-shrink-0 text-[#A6A6A6] hover:text-white transition-colors p-0.5 mt-0.5"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        )}
      </div>
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1.5">
          {tags.map((t) => (
            <span key={t} className="px-1.5 py-0.5 rounded text-[11px] bg-[#262626] text-[#A6A6A6]">{t}</span>
          ))}
        </div>
      )}
    </div>
  );

  if (linkTo) {
    return <Link to={linkTo}>{content}</Link>;
  }
  return content;
}
