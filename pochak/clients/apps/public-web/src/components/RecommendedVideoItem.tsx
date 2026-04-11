import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MoreHorizontal, Play } from 'lucide-react';

export default function RecommendedVideoItem({
  title,
  competition,
  tags,
  date,
  duration,
  thumbnailUrl,
  linkTo,
}: {
  title: string;
  competition?: string;
  tags?: string[];
  date?: string;
  duration?: string;
  thumbnailUrl?: string;
  linkTo: string;
}) {
  const [imgError, setImgError] = useState(false);

  const content = (
    <div className="flex gap-3 group cursor-pointer">
      {/* Thumbnail */}
      <div className="w-[120px] flex-shrink-0 relative">
        {thumbnailUrl && !imgError ? (
          <img
            src={thumbnailUrl}
            alt=""
            className="w-full aspect-video rounded object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full aspect-video rounded bg-[#262626] flex items-center justify-center">
            <Play className="w-4 h-4 text-[#606060]" />
          </div>
        )}
        {duration && (
          <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1 py-0.5 rounded">
            {duration}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div>
          <div className="flex items-start justify-between gap-1">
            <p className="text-[13px] text-white font-medium leading-tight line-clamp-2 group-hover:text-[#00CC33] transition-colors">
              {title}
            </p>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
              className="flex-shrink-0 text-[#606060] hover:text-white transition-colors p-0.5"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </button>
          </div>
          {competition && (
            <p className="text-[11px] text-[#A6A6A6] mt-1 line-clamp-1">{competition}</p>
          )}
        </div>
        {/* Tags + date row */}
        <div className="flex items-center gap-1 mt-1 flex-wrap">
          {tags?.map((tag) => (
            <span key={tag} className="text-[10px] text-[#808080]">
              {tag}
            </span>
          ))}
          {tags && tags.length > 0 && date && (
            <span className="text-[10px] text-[#606060]">|</span>
          )}
          {date && (
            <span className="text-[10px] text-[#606060]">{date}</span>
          )}
        </div>
      </div>
    </div>
  );

  return <Link to={linkTo}>{content}</Link>;
}
