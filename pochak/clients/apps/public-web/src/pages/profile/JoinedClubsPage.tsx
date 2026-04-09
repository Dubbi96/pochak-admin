import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';
import { pochakChannels } from '@/services/webApi';
import { deleteApi } from '@/services/apiClient';

export default function JoinedClubsPage() {
  const [clubs, setClubs] = useState(() => pochakChannels.slice(0, 7));
  const [leavingId, setLeavingId] = useState<string | null>(null);

  const handleLeave = async (e: React.MouseEvent, clubId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!window.confirm('정말 이 클럽에서 탈퇴하시겠습니까?')) return;

    setLeavingId(clubId);
    try {
      // membershipId는 실제 API에서는 별도 필드이나 여기서는 clubId를 사용
      await deleteApi(`/clubs/${clubId}/members/${clubId}`, null);
      setClubs((prev) => prev.filter((c) => c.id !== clubId));
    } catch {
      alert('탈퇴 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setLeavingId(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">가입한 클럽</h1>

      {clubs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#A6A6A6]">
          <Users className="h-12 w-12 mb-4 text-[#4D4D4D]" />
          <p className="text-base mb-2">가입한 클럽이 없습니다</p>
          <Link to="/search" className="text-[#00CC33] text-sm hover:underline">
            클럽 찾아보기 &rarr;
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {clubs.map((club) => (
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
                onClick={(e) => handleLeave(e, club.id)}
                disabled={leavingId === club.id}
                className="text-[#A6A6A6] text-xs hover:text-red-400 transition-colors shrink-0 disabled:opacity-40"
              >
                {leavingId === club.id ? '처리 중...' : '탈퇴'}
              </button>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
