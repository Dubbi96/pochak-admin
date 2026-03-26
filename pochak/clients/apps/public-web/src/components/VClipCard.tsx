import { Link } from 'react-router-dom';
import { MoreHorizontal } from 'lucide-react';
import { formatViewCount } from '@/services/webApi';
import ContextMenu from '@/components/ContextMenu';

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

export default function VClipCard({
  title,
  views,
  viewCount,
  linkTo,
  thumbnailUrl,
  className = 'w-[180px]',
  showMoreMenu,
}: {
  title: string;
  views?: string;
  viewCount?: number;
  linkTo?: string;
  thumbnailUrl?: string;
  className?: string;
  showMoreMenu?: boolean;
}) {
  const displayViews = views ?? (viewCount !== undefined ? `${formatViewCount(viewCount)}` : undefined);

  const content = (
    <div className={`flex-shrink-0 ${className} cursor-pointer group`}>
      <div className="relative">
        <ThumbPlaceholder thumbnailUrl={thumbnailUrl} className="aspect-[9/16] rounded-lg overflow-hidden group-hover:ring-1 group-hover:ring-[#00CC33] transition-all" />
        {displayViews && (
          <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[11px] px-2 py-0.5 rounded-full">
            조회수 {displayViews}
          </span>
        )}
        {showMoreMenu && (
          <div className="absolute top-2 right-2 z-10" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
            <ContextMenu items={[
              { label: '공유', onClick: () => {} },
              { label: '즐겨찾기 추가', onClick: () => {} },
              { label: '신고', onClick: () => {}, danger: true },
            ]}>
              <span className="text-white/80 hover:text-white transition-colors bg-black/40 rounded-full p-1 inline-flex">
                <MoreHorizontal className="h-4 w-4" />
              </span>
            </ContextMenu>
          </div>
        )}
      </div>
      <p className="mt-2 text-[13px] text-[#A6A6A6] leading-tight line-clamp-2 group-hover:text-white transition-colors">{title}</p>
    </div>
  );

  if (linkTo) {
    return <Link to={linkTo}>{content}</Link>;
  }
  return content;
}
