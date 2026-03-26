import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { postApi } from '@/services/apiClient';

const PROVIDER_NAMES: Record<string, string> = {
  KAKAO: '카카오',
  GOOGLE: '구글',
  NAVER: '네이버',
  APPLE: 'Apple',
};

export default function AuthLinkPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);

  const signupToken = searchParams.get('signupToken') || '';
  const provider = searchParams.get('provider') || '';
  const email = searchParams.get('email') || '';
  const providerName = PROVIDER_NAMES[provider] || provider;

  const handleLink = async () => {
    setIsLoading(true);
    try {
      const res = await postApi<{ accessToken?: string; refreshToken?: string }>(
        '/auth/oauth2/link',
        { signupToken },
        null as unknown as { accessToken?: string; refreshToken?: string }
      );
      if (res?.accessToken) {
        localStorage.setItem('pochak_token', res.accessToken);
        localStorage.setItem('pochak_user', JSON.stringify({ nickname: email.split('@')[0], email }));
        setDone(true);
      }
    } catch {
      alert('계정 연결에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  if (done) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#00CC33]/20 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00CC33" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white mb-2">계정 연결 완료</h1>
          <p className="text-[14px] text-[#A6A6A6] mb-1">
            {providerName} 로그인이 기존 계정에 연결되었습니다.
          </p>
          <p className="text-[13px] text-[#606060] mb-8">{email}</p>
          <button
            onClick={() => navigate('/home')}
            className="w-full bg-[#00CC33] text-[#0A0A0A] font-bold text-[14px] py-3 rounded-lg hover:bg-[#00E639] transition-colors"
          >
            홈으로 이동
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#262626] flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00CC33" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white mb-2">기존 계정 발견</h1>
          <p className="text-[14px] text-[#A6A6A6]">
            <span className="text-white font-medium">{email}</span> 으로 이미 가입된 계정이 있습니다.
          </p>
          <p className="text-[14px] text-[#A6A6A6] mt-1">
            {providerName} 로그인을 기존 계정에 연결할까요?
          </p>
        </div>

        <div className="rounded-xl bg-[#262626] border border-[#4D4D4D] p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#00CC33] flex items-center justify-center text-[#0A0A0A] font-bold text-sm">
              {email.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-[14px] text-white font-medium">{email}</p>
              <p className="text-[12px] text-[#A6A6A6]">기존 계정</p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-[#4D4D4D]">
            <p className="text-[12px] text-[#A6A6A6]">
              연결할 로그인 방식: <span className="text-[#00CC33] font-medium">{providerName}</span>
            </p>
          </div>
        </div>

        <button
          onClick={handleLink}
          disabled={isLoading}
          className="w-full bg-[#00CC33] text-[#0A0A0A] font-bold text-[14px] py-3 rounded-lg hover:bg-[#00E639] transition-colors disabled:opacity-50 mb-3"
        >
          {isLoading ? '연결 중...' : '계정 연결하기'}
        </button>

        <button
          onClick={() => navigate('/login')}
          className="w-full text-[#A6A6A6] text-[13px] py-2 hover:text-white transition-colors"
        >
          취소
        </button>
      </div>
    </div>
  );
}
