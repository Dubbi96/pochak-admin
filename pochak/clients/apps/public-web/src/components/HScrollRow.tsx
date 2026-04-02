import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function HScrollRow({
  children,
  scrollAmount = 300,
}: {
  children: React.ReactNode;
  scrollAmount?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: 'left' | 'right') => {
    ref.current?.scrollBy({
      left: dir === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };
  return (
    <div className="relative group/scroll">
      <div ref={ref} className="flex gap-5 overflow-x-auto scrollbar-hide">
        {children}
      </div>
      <button
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10 h-9 w-9 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover/scroll:opacity-100 transition-opacity"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10 h-9 w-9 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover/scroll:opacity-100 transition-opacity"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
