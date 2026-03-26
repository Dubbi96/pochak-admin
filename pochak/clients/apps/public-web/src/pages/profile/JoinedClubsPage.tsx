import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';
import { pochakChannels } from '@/services/webApi';

const joinedClubs = pochakChannels.slice(0, 7);

export default function JoinedClubsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">가입한 클럽</h1>

      {joinedClubs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#A6A6A6]">
          <Users className="h-12 w-12 mb-4 text-[#4D4D4D]" />
          <p className="text-base mb-2">가입한 클럽이 없습니다</p>
          <Link to="/search" className="text-[#00CC33] text-sm hover:underline">
            클럽 찾아보기 &rarr;
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {joinedClubs.map((club) => (
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

              {/* Leave button */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // TODO: handle leave club
                }}
                className="text-[#A6A6A6] text-xs hover:text-red-400 transition-colors shrink-0"
              >
                탈퇴
              </button>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
