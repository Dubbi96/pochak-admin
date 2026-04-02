import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, Bell, BellRing } from 'lucide-react';
import TeamLogo from './TeamLogo';
import { isReserved, toggleReservation } from '@/stores/reservationStore';

export interface MatchListItemData {
  id: string;
  time: string;
  round?: string;
  homeTeam: string;
  homeTeamShort: string;
  homeTeamColor: string;
  awayTeam: string;
  awayTeamShort: string;
  awayTeamColor: string;
  homeScore?: number;
  awayScore?: number;
  venue?: string;
  status: 'LIVE' | '예정' | '종료';
  contentId?: string;
  competition?: string;
  date?: string;
  resultNote?: string;
}

function StatusAction({ match }: { match: MatchListItemData }) {
  const [reserved, setReserved] = useState(() => isReserved(match.id));

  useEffect(() => {
    const handler = () => setReserved(isReserved(match.id));
    window.addEventListener('pochak_reservation_change', handler);
    return () => window.removeEventListener('pochak_reservation_change', handler);
  }, [match.id]);

  const handleToggle = () => {
    toggleReservation({
      matchId: match.id,
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam,
      date: match.date ?? '',
      time: match.time,
      competition: match.competition,
    });
  };

  if (match.status === '종료' && match.contentId) {
    return (
      <Link to={`/contents/vod/${match.contentId}`} className="flex items-center gap-1.5 text-[13px] text-white hover:text-[#00CC33] transition-colors">
        <Play className="h-4 w-4 fill-current" />
        다시보기
      </Link>
    );
  }
  if (match.status === '종료') {
    return <span className="text-[13px] text-[#606060]">종료</span>;
  }
  if (match.status === 'LIVE') {
    return (
      <Link to={match.contentId ? `/contents/live/${match.contentId}` : '#'} className="flex items-center gap-1.5 text-[13px] text-[#00CC33] hover:text-[#00E676] transition-colors">
        <Play className="h-4 w-4 fill-[#00CC33]" />
        라이브
      </Link>
    );
  }
  if (reserved) {
    return (
      <button onClick={handleToggle} className="flex items-center gap-1.5 text-[13px] text-[#A6A6A6] hover:text-[#E51728] transition-colors">
        <BellRing className="h-4 w-4" />
        알림취소
      </button>
    );
  }
  return (
    <button onClick={handleToggle} className="flex items-center gap-1.5 text-[13px] text-[#A6A6A6] hover:text-[#00CC33] transition-colors">
      <Bell className="h-4 w-4" />
      예약알림
    </button>
  );
}

export default function MatchListItem({ match }: { match: MatchListItemData }) {
  const hasScore = match.homeScore !== undefined && match.awayScore !== undefined;

  return (
    <div className="flex items-center px-6 py-3 border-b border-[#4D4D4D] last:border-b-0 hover:bg-[#262626]/30 transition-colors">
      {/* 시간 */}
      <div className="w-[50px] flex-shrink-0">
        <span className="text-[13px] font-bold text-white">{match.time}</span>
      </div>

      {/* 라운드 뱃지 */}
      {match.round && (
        <div className="w-[100px] flex-shrink-0">
          <span className="inline-block rounded bg-[#00CC33] px-2 py-0.5 text-[11px] font-semibold text-[#1A1A1A]">
            {match.round}
          </span>
        </div>
      )}

      {/* 팀 VS 팀 (중앙 정렬) */}
      <div className="flex-1 flex flex-col items-center">
        <div className="flex items-center gap-2">
          {/* 홈팀: 이름 → 로고 */}
          <span className="text-[13px] font-semibold text-white">{match.homeTeam}</span>
          <TeamLogo color={match.homeTeamColor} short={match.homeTeamShort} size="sm" />

          {/* 스코어 or 대시 */}
          {hasScore ? (
            <span className="text-[15px] font-bold mx-2">
              <span className="text-white">{match.homeScore}</span>
              <span className="text-[#A6A6A6] mx-1">VS</span>
              <span className="text-white">{match.awayScore}</span>
            </span>
          ) : (
            <span className="text-[13px] text-[#606060] mx-2">-</span>
          )}

          {/* 원정팀: 로고 → 이름 */}
          <TeamLogo color={match.awayTeamColor} short={match.awayTeamShort} size="sm" />
          <span className="text-[13px] font-semibold text-white">{match.awayTeam}</span>
        </div>

        {/* 결과 부가정보 (아래줄) */}
        {match.resultNote && (
          <span className="text-[11px] text-[#606060] mt-0.5">{match.resultNote}</span>
        )}
      </div>

      {/* 장소 */}
      {match.venue && (
        <div className="w-[140px] flex-shrink-0 text-right hidden md:block">
          <span className="text-[11px] text-[#A6A6A6]">{match.venue}</span>
        </div>
      )}

      {/* 상태 액션 */}
      <div className="w-[80px] flex-shrink-0 flex justify-end">
        <StatusAction match={match} />
      </div>
    </div>
  );
}
