import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { setAuthToken, GATEWAY_URL } from '@/services/apiClient';
import { fetchMyProfile } from '@/services/webApi';

/**
 * OAuth2 auth callback page (SEC-006).
 *
 * After the OAuth provider redirect, the server sends back a one-time
 * authorization code in the URL (not tokens). This page exchanges the
 * code for tokens via a secure POST request body, preventing token
 * exposure in browser history, server logs, and referrer headers.
 */
export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    const authCode = searchParams.get('code');

    // Legacy support: if tokens are still in URL (e.g., during rollout), handle them
    const legacyAccessToken = searchParams.get('accessToken');
    if (legacyAccessToken) {
      const refreshToken = searchParams.get('refreshToken');
      handleTokens(legacyAccessToken, refreshToken);
      return;
    }

    if (!authCode) {
      setError('로그인에 실패했습니다. 인증 코드를 받지 못했습니다.');
      return;
    }

    // Exchange auth code for tokens via POST (tokens in response body, not URL)
    exchangeAuthCode(authCode);
  }, [searchParams, navigate]);

  async function exchangeAuthCode(code: string) {
    try {
      const res = await fetch(`${GATEWAY_URL}/api/v1/auth/oauth2/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      if (!res.ok) {
        const errorBody = await res.text();
        console.error('[AuthCallback] Token exchange failed:', res.status, errorBody);
        setError('로그인에 실패했습니다. 인증 코드가 만료되었거나 유효하지 않습니다.');
        return;
      }

      const json = await res.json();
      const data = json.data ?? json;
      handleTokens(data.accessToken, data.refreshToken);
    } catch (err) {
      console.error('[AuthCallback] Token exchange error:', err);
      setError('로그인 처리 중 오류가 발생했습니다.');
    }
  }

  function handleTokens(accessToken: string, refreshToken: string | null) {
    setAuthToken(accessToken);
    if (refreshToken) {
      localStorage.setItem('pochak_refresh_token', refreshToken);
    }

    // Fetch user profile and store complete data
    fetchMyProfile()
      .then((profile) => {
        localStorage.setItem('pochak_user', JSON.stringify({
          nickname: profile.nickname || profile.name || '사용자',
          name: profile.name || '',
          email: profile.email || '',
          role: profile.role || 'USER',
          profileImageUrl: profile.profileImageUrl || null,
        }));
        window.dispatchEvent(new Event('pochak_auth_change'));
        navigate('/home', { replace: true });
      })
      .catch(() => {
        // Profile fetch failed but token is valid — store minimal user
        localStorage.setItem('pochak_user', JSON.stringify({ nickname: '사용자', role: 'USER' }));
        navigate('/home', { replace: true });
      });
  }

  if (error) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-8 text-center">
          <p className="text-red-400 text-sm mb-4">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-background hover:bg-accent-hover"
          >
            로그인으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto rounded-full border-2 border-[#00CC33] border-t-transparent animate-spin mb-4" />
        <p className="text-[#A6A6A6] text-sm">로그인 처리 중...</p>
      </div>
    </div>
  );
}
