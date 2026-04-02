import { useRef, type ReactNode } from 'react';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';

interface Props {
  children: ReactNode;
  scrollAmount?: number;
  className?: string;
}

export default function HScrollRow({ children, scrollAmount = 320, className = '' }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    ref.current?.scrollBy({
      left: dir === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <div className={`relative group ${className}`}>
      {/* Left arrow */}
      <button
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        aria-label="왼쪽 스크롤"
      >
        <LuChevronLeft className="w-4 h-4" />
      </button>

      {/* Scrollable row */}
      <div
        ref={ref}
        className="flex flex-nowrap overflow-x-auto scrollbar-hide pb-2 scroll-smooth"
        style={{ gap: 12 }}
      >
        {children}
      </div>

      {/* Right arrow */}
      <button
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        aria-label="오른쪽 스크롤"
      >
        <LuChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
