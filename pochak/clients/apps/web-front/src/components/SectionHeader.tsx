import { LuChevronRight } from 'react-icons/lu';
import { Link } from 'react-router-dom';

interface Props {
  title: string;
  linkTo?: string;
  linkLabel?: string;
  accent?: 'clip' | 'vod' | 'live';
  className?: string;
}

export default function SectionHeader({
  title,
  linkTo,
  linkLabel = '전체보기',
  className = '',
}: Props) {
  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      <h2 className="text-[18px] font-semibold text-white">
        {title}
      </h2>
      {linkTo && (
        <Link
          to={linkTo}
          className="flex items-center gap-0.5 text-[13px] font-medium text-pochak-text-tertiary hover:text-primary transition-colors duration-150"
        >
          {linkLabel}
          <LuChevronRight className="size-3.5" />
        </Link>
      )}
    </div>
  );
}
