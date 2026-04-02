import { Link } from 'react-router-dom';
import { ArrowUpDown } from 'lucide-react';

export default function SectionHeader({
  prefix,
  highlight,
  linkTo,
  showSort,
  onMore,
}: {
  prefix: string;
  highlight: string;
  linkTo?: string;
  showSort?: boolean;
  onMore?: () => void;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <h2 className="text-[20px] font-semibold">
          <span className="text-white">{prefix} </span>
          <span className="text-[#00CC33]">{highlight}</span>
        </h2>
        {linkTo ? (
          <Link to={linkTo} className="text-[13px] text-[#A6A6A6] hover:text-white transition-colors">
            더보기
          </Link>
        ) : onMore ? (
          <button className="text-[13px] text-[#A6A6A6] hover:text-white transition-colors" onClick={onMore}>
            더보기
          </button>
        ) : null}
      </div>
      {showSort && (
        <button className="flex items-center gap-1 text-[13px] text-[#A6A6A6] hover:text-white transition-colors ml-auto">
          <ArrowUpDown className="h-3.5 w-3.5" />
          정렬
        </button>
      )}
    </div>
  );
}
