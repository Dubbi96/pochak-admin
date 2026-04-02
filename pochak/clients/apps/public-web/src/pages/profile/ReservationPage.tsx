import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark } from 'lucide-react';
import HScrollRow from '@/components/HScrollRow';
import HVideoCard from '@/components/HVideoCard';
import { pochakVodContents } from '@/services/webApi';
import { getReservations, type ReservedMatch } from '@/stores/reservationStore';
import { formatDuration } from './shared';

export default function ReservationPage() {
  const [reservations, setReservations] = useState<ReservedMatch[]>([]);

  const refresh = useCallback(() => {
    setReservations(getReservations());
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener('pochak_reservation_change', refresh);
    return () => window.removeEventListener('pochak_reservation_change', refresh);
  }, [refresh]);

  // Group reservations by date and compute D-Day
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Build date groups from reservations + mock VOD data for demo
  const dateGroups: { date: string; label: string; dDay: string; items: typeof pochakVodContents }[] = [];

  // Use mock data grouped by date for demo display
  const mockDates = ['2026-01-01', '2026-01-02', '2026-01-03'];
  mockDates.forEach((dateStr) => {
    const d = new Date(dateStr);
    const diff = Math.round((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    let dDay = 'D-Day';
    if (diff > 0) dDay = `D+${diff}`;
    else if (diff < 0) dDay = `D${diff}`;
    const formatted = dateStr.replace(/-/g, '.');

    dateGroups.push({
      date: dateStr,
      label: formatted,
      dDay,
      items: pochakVodContents.slice(0, 4),
    });
  });

  // Also include actual reservations mapped to vod mock items
  if (reservations.length > 0) {
    const resDates = [...new Set(reservations.map((r) => r.date))];
    resDates.forEach((dateStr) => {
      if (mockDates.includes(dateStr)) return;
      const d = new Date(dateStr);
      const diff = Math.round((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      let dDay = 'D-Day';
      if (diff > 0) dDay = `D+${diff}`;
      else if (diff < 0) dDay = `D${diff}`;
      const formatted = dateStr.replace(/-/g, '.');

      dateGroups.push({
        date: dateStr,
        label: formatted,
        dDay,
        items: pochakVodContents.slice(0, 3),
      });
    });
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">시청예약</h1>

      <div className="space-y-8">
        {dateGroups.map((group) => (
          <section key={group.date}>
            <div className="flex items-center gap-3 mb-4">
              <h3 className="text-[18px] font-semibold text-white">{group.label}</h3>
              <span className="text-[14px] font-semibold text-[#00CC33]">{group.dDay}</span>
            </div>
            <HScrollRow scrollAmount={300}>
              {group.items.map((v, i) => {
                const dateParts = group.date.split('-');
                const badge = `${dateParts[1]}/${dateParts[2]} 예정`;
                return (
                  <div key={`${v.id}-${group.date}-${i}`} className="flex-shrink-0 w-[280px]">
                    <div className="relative">
                      <HVideoCard
                        title={v.title}
                        sub={v.competition ?? ''}
                        duration={v.duration ? formatDuration(v.duration) : undefined}
                        tags={v.tags.slice(0, 4)}
                        thumbnailUrl={v.thumbnailUrl}
                        linkTo={`/contents/vod/${v.id}`}
                        className="w-full"
                      />
                      {/* Date badge overlay */}
                      <div className="absolute top-2 left-2 z-10">
                        <span className="bg-[#00CC33] text-[#1A1A1A] text-[11px] font-bold px-2 py-0.5 rounded">
                          {badge}
                        </span>
                      </div>
                      {/* Bookmark icon overlay */}
                      <div className="absolute top-2 right-2 z-10">
                        <Bookmark className="h-5 w-5 text-[#00CC33] fill-[#00CC33]" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </HScrollRow>
          </section>
        ))}

        {dateGroups.length === 0 && (
          <div className="text-center py-16">
            <p className="text-[15px] text-[#A6A6A6]">시청예약된 영상이 없습니다</p>
            <p className="text-[13px] text-[#606060] mt-1">일정에서 경기를 예약하면 여기에 표시됩니다</p>
            <Link to="/schedule" className="inline-block mt-4 text-[13px] text-[#00CC33] hover:underline">
              일정 보러가기 →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
