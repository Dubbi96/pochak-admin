import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, Trophy } from 'lucide-react';

// Mock invite code validation
const VALID_INVITE_CODES = new Set([
  'HWRANG2025',
  'POCHAK-FC',
  'YOUTH-CUP',
  'INVITE-001',
]);

// Map invite codes to competition IDs for redirection
const inviteToCompetition: Record<string, string> = {
  'HWRANG2025': 'comp-1',
  'POCHAK-FC': 'comp-2',
  'YOUTH-CUP': 'comp-3',
  'INVITE-001': 'comp-1',
};

type InviteState = 'loading' | 'valid' | 'invalid';

export default function CompetitionInvitePage() {
  const { inviteCode } = useParams<{ inviteCode: string }>();
  const navigate = useNavigate();
  const [state, setState] = useState<InviteState>('loading');

  useEffect(() => {
    if (!inviteCode) {
      setState('invalid');
      return;
    }

    // Simulate API validation delay
    const timer = setTimeout(() => {
      const code = inviteCode.toUpperCase();
      if (VALID_INVITE_CODES.has(code)) {
        setState('valid');
        // Redirect to competition page after brief success display
        const redirectTimer = setTimeout(() => {
          const competitionId = inviteToCompetition[code] ?? 'comp-1';
          navigate(`/tv/competition/${competitionId}`, { replace: true });
        }, 1500);
        return () => clearTimeout(redirectTimer);
      } else {
        setState('invalid');
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [inviteCode, navigate]);

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-70px)] px-6">
      <div className="w-full max-w-[400px] text-center">
        {/* Loading */}
        {state === 'loading' && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#262626] flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-[#00CC33] animate-spin" />
            </div>
            <div>
              <p className="text-white text-lg font-semibold">초대 링크 확인 중</p>
              <p className="text-[#A6A6A6] text-sm mt-1">잠시만 기다려 주세요...</p>
            </div>
          </div>
        )}

        {/* Valid - redirecting */}
        {state === 'valid' && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#00CC33]/10 flex items-center justify-center">
              <Trophy className="h-8 w-8 text-[#00CC33]" />
            </div>
            <div>
              <p className="text-white text-lg font-semibold">초대가 확인되었습니다</p>
              <p className="text-[#A6A6A6] text-sm mt-1">대회 페이지로 이동합니다...</p>
            </div>
          </div>
        )}

        {/* Invalid */}
        {state === 'invalid' && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#E51728]/10 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-[#E51728]" />
            </div>
            <div>
              <p className="text-white text-lg font-semibold">유효하지 않은 초대 링크입니다</p>
              <p className="text-[#A6A6A6] text-sm mt-2 leading-relaxed">
                초대 코드가 만료되었거나 잘못된 링크입니다.<br />
                대회 운영자에게 문의해 주세요.
              </p>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => navigate('/home')}
                className="px-5 py-2.5 text-sm font-medium text-white bg-[#262626] border border-[#4D4D4D] rounded-lg hover:bg-[#333] transition-colors"
              >
                홈으로
              </button>
              <button
                onClick={() => navigate('/competitions')}
                className="px-5 py-2.5 text-sm font-medium text-[#1A1A1A] bg-[#00CC33] rounded-lg hover:bg-[#00B82E] transition-colors"
              >
                대회 목록 보기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
