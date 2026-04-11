import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

function EventIndicator({ count, isActive }: { count: number; isActive: boolean }) {
  const dotColor = isActive ? 'bg-white' : 'bg-[#00CC33]';
  const textColor = isActive ? 'text-white' : 'text-[#00CC33]';

  if (count === 0) return null;

  if (count <= 3) {
    // 1~3: show dots
    return (
      <div className="flex gap-0.5 justify-center">
        {Array.from({ length: count }).map((_, i) => (
          <span key={i} className={`w-1 h-1 rounded-full ${dotColor}`} />
        ))}
      </div>
    );
  }

  // 4+: show "+N" text (e.g. "+3")
  return (
    <span className={`text-[9px] font-semibold ${textColor}`}>+{count}</span>
  );
}

export default function MonthSelector({
  year,
  month,
  onYearChange,
  onMonthChange,
  eventMonths,
  eventCounts,
}: {
  year: number;
  month: number;
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
  /** @deprecated Use eventCounts instead */
  eventMonths?: Set<number>;
  /** Map of month number (1-12) to event count (number of match days) */
  eventCounts?: Map<number, number>;
}) {
  const [yearOpen, setYearOpen] = useState(false);
  const yearRef = useRef<HTMLDivElement>(null);
  const years = [year - 1, year, year + 1];

  useEffect(() => {
    if (!yearOpen) return;
    const handler = (e: MouseEvent) => {
      if (yearRef.current && !yearRef.current.contains(e.target as Node)) {
        setYearOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [yearOpen]);

  const getEventCount = (m: number): number => {
    if (eventCounts) return eventCounts.get(m) ?? 0;
    if (eventMonths) return eventMonths.has(m) ? 1 : 0;
    return 0;
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative" ref={yearRef}>
        <button
          onClick={() => setYearOpen(!yearOpen)}
          className="flex items-center gap-1 text-[15px] font-bold text-white hover:text-[#00CC33] transition-colors whitespace-nowrap"
        >
          {year}년
          <ChevronDown className="h-4 w-4" />
        </button>
        {yearOpen && (
          <div className="absolute top-full mt-1 bg-[#262626] border border-[#4D4D4D] rounded-lg shadow-xl z-20 overflow-hidden min-w-[80px]">
            {years.map((y) => (
              <button
                key={y}
                onClick={() => { onYearChange(y); setYearOpen(false); }}
                className={`block w-full px-4 py-2 text-[13px] text-left whitespace-nowrap transition-colors ${
                  y === year ? 'text-[#00CC33] bg-[#404040]' : 'text-[#A6A6A6] hover:bg-[#404040]'
                }`}
              >
                {y}년
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
        {months.map((m) => {
          const count = getEventCount(m);
          const isActive = m === month;
          return (
            <button
              key={m}
              onClick={() => onMonthChange(m)}
              className={`flex-shrink-0 flex flex-col items-center justify-center gap-1 rounded-full w-[48px] py-3 text-[13px] font-medium transition-all ${
                isActive
                  ? 'border-2 border-white text-white'
                  : 'border-2 border-transparent text-[#A6A6A6] hover:text-white'
              }`}
            >
              <span className="text-center">{m}월</span>
              <EventIndicator count={count} isActive={isActive} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
