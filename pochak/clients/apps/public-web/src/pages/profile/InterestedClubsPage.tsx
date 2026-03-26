import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Bell, BellOff } from 'lucide-react';
import { pochakChannels } from '@/services/webApi';

const interestedClubs = pochakChannels.slice(2, 7);

export default function InterestedClubsPage() {
  const [notifications, setNotifications] = useState<Record<string, boolean>>(
    () => Object.fromEntries(interestedClubs.map((c) => [c.id, true])),
  );

  const [removed, setRemoved] = useState<Set<string>>(new Set());

  const visibleClubs = interestedClubs.filter((c) => !removed.has(c.id));

  const toggleNotification = (id: string) => {
    setNotifications((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const removeInterest = (id: string) => {
    setRemoved((prev) => new Set(prev).add(id));
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">관심클럽</h1>

      {visibleClubs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#A6A6A6]">
          <Heart className="h-12 w-12 mb-4 text-[#4D4D4D]" />
          <p className="text-base mb-2">관심 클럽이 없습니다</p>
          <Link to="/search" className="text-[#00CC33] text-sm hover:underline">
            클럽 둘러보기 &rarr;
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {visibleClubs.map((club) => {
            const isNotified = notifications[club.id] ?? true;

            return (
              <Link
                key={club.id}
                to={`/club/${club.id}`}
                className="flex items-center gap-4 bg-[#262626] rounded-xl px-4 py-3 hover:bg-[#333] transition-colors group"
              >
                {/* Club logo */}
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold shrink-0"
                  style={{ backgroundColor: club.color }}
                >
                  {club.initial}
                </div>

                {/* Club info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold truncate group-hover:text-[#00CC33] transition-colors">
                    {club.name}
                  </p>
                  <p className="text-[#A6A6A6] text-xs mt-0.5 truncate">
                    {club.subtitle} · {club.memberCount.toLocaleString()}명
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 shrink-0">
                  {/* Bell toggle */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleNotification(club.id);
                    }}
                    className={`transition-colors ${isNotified ? 'text-[#00CC33]' : 'text-[#4D4D4D] hover:text-[#A6A6A6]'}`}
                    title={isNotified ? '알림 켜짐' : '알림 꺼짐'}
                  >
                    {isNotified ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                  </button>

                  {/* Remove interest */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeInterest(club.id);
                    }}
                    className="text-[#A6A6A6] text-xs hover:text-red-400 transition-colors"
                  >
                    관심 해제
                  </button>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
