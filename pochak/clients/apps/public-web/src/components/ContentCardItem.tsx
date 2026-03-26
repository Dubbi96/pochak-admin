import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';
import type { ContentCard } from '@/services/webApi';
import { formatViewCount, getStatusBadgeClass } from '@/services/webApi';

interface Props {
  content: ContentCard;
  /** horizontal card style (smaller, inline) vs vertical grid card */
  variant?: 'horizontal' | 'grid';
}

export default function ContentCardItem({ content, variant = 'horizontal' }: Props) {
  const linkPath =
    content.type === 'LIVE'
      ? `/contents/live/${content.id}`
      : content.type === 'VOD'
        ? `/contents/vod/${content.id}`
        : `/contents/clip/${content.id}`;

  const isHorizontal = variant === 'horizontal';

  return (
    <Link
      to={linkPath}
      className={`group flex-shrink-0 overflow-hidden rounded-xl border border-border bg-surface transition-colors hover:border-accent ${
        isHorizontal ? 'w-64' : 'w-full'
      }`}
    >
      {/* Thumbnail */}
      <div className="relative flex aspect-video items-center justify-center bg-surface-light">
        <p className="text-sm text-[#A6A6A6]">썸네일</p>

        {/* Type badge */}
        <span
          className={`absolute left-2 top-2 rounded px-2 py-0.5 text-xs font-bold ${getStatusBadgeClass(content.type)}`}
        >
          {content.type}
        </span>

        {/* Duration */}
        {content.duration && (
          <span className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-xs text-white">
            {content.duration}
          </span>
        )}

        {/* LIVE animated dot */}
        {content.type === 'LIVE' && (
          <span className="absolute right-2 top-2 flex items-center gap-1">
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="line-clamp-2 text-base font-medium group-hover:text-accent">
          {content.title}
        </p>
        <p className="mt-1 text-sm text-[#A6A6A6]">{content.competition}</p>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-1 text-sm text-[#A6A6A6]">
            <Eye className="h-3 w-3" />
            <span>{formatViewCount(content.viewCount)}</span>
          </div>
          <span className="text-xs text-[#A6A6A6]">{content.date}</span>
        </div>
        {/* Tags */}
        {content.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {content.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-surface-light px-2 py-0.5 text-xs text-[#A6A6A6]"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
