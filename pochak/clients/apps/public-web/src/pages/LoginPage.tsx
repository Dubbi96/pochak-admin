import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const GATEWAY_URL = import.meta.env.VITE_GATEWAY_URL || 'http://localhost:8080';

const KAKAO_REST_KEY = '<REDACTED_KAKAO_REST_KEY>';
const GOOGLE_CLIENT_ID = '<REDACTED_GOOGLE_CLIENT_ID>';

function buildOAuthUrl(provider: 'kakao' | 'google' | 'naver'): string {
  const redirectUri = encodeURIComponent(`${GATEWAY_URL}/api/v1/auth/oauth2/callback/${provider}`);
  const state = 'web';
  switch (provider) {
    case 'kakao':
      return `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_REST_KEY}&redirect_uri=${redirectUri}&response_type=code&state=${state}`;
    case 'google':
      return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=openid%20email%20profile&state=${state}`;
    case 'naver':
      return `https://nid.naver.com/oauth2.0/authorize?client_id=<REDACTED_NAVER_CLIENT_ID>&redirect_uri=${redirectUri}&response_type=code&state=${state}`;
    default:
      return '#';
  }
}

export default function LoginPage() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => setMounted(true), 50);
  }, []);

  const handleLogin = async () => {
    setError('');
    if (!userId || !password) {
      setError('이메일과 비밀번호를 입력해주세요.');
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`${GATEWAY_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userId, password }),
      });
      const json = await res.json();
      const data = json.data ?? json;
      if (res.ok && data?.accessToken) {
        localStorage.setItem('pochak_token', data.accessToken);
        if (data.refreshToken) {
          localStorage.setItem('pochak_refresh_token', data.refreshToken);
        }
        localStorage.setItem('pochak_user', JSON.stringify({ nickname: userId }));
        navigate('/home');
        return;
      }
      if (res.status === 401 || res.status === 400) {
        setError('이메일 또는 비밀번호가 올바르지 않습니다.');
        return;
      }
      setError('서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    } catch {
      setError('서버에 연결할 수 없습니다. 네트워크를 확인해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin();
  };

  const handleSnsLogin = (provider: 'kakao' | 'google' | 'naver' | 'apple') => {
    if (provider === 'apple') {
      alert('Apple 로그인은 Developer 등록 후 지원됩니다.');
      return;
    }
    window.location.href = buildOAuthUrl(provider);
  };

  return (
    <div className="flex min-h-[calc(100vh-70px)] bg-[#0A0A0A] overflow-hidden">
      {/* ── Left: Hero visual ── */}
      <div className="hidden lg:flex lg:w-[55%] relative items-center justify-center overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#001a0a] via-[#0A0A0A] to-[#002211]" />

        {/* Diagonal green line accents */}
        <div
          className="absolute w-[200%] h-[1px] bg-gradient-to-r from-transparent via-[#00CC33]/30 to-transparent"
          style={{ top: '25%', left: '-50%', transform: 'rotate(-15deg)' }}
        />
        <div
          className="absolute w-[200%] h-[1px] bg-gradient-to-r from-transparent via-[#00CC33]/15 to-transparent"
          style={{ top: '45%', left: '-50%', transform: 'rotate(-15deg)' }}
        />
        <div
          className="absolute w-[200%] h-[1px] bg-gradient-to-r from-transparent via-[#00CC33]/10 to-transparent"
          style={{ top: '65%', left: '-50%', transform: 'rotate(-15deg)' }}
        />

        {/* Large logo icon — watermark style */}
        <div
          className={`relative transition-all duration-[1200ms] ease-out ${
            mounted ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'
          }`}
        >
          <img
            src="/pochak-full-logo.png"
            alt=""
            className="w-[540px] h-auto drop-shadow-[0_0_80px_rgba(0,204,51,0.3)]"
          />
        </div>

        {/* Bottom tagline */}
        <div
          className={`absolute bottom-16 left-12 transition-all duration-1000 delay-500 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <p className="text-[#00CC33]/60 text-[13px] font-medium tracking-[0.3em] uppercase mb-2">
            Sports Streaming Platform
          </p>
          <p className="text-white/30 text-[11px] tracking-wider">
            Connect you play.
          </p>
        </div>

        {/* Subtle grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* ── Right: Login form ── */}
      <div className="flex-1 flex items-center justify-center px-6 relative">
        {/* Subtle radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(0,204,51,0.04)_0%,_transparent_70%)]" />

        <div
          className={`w-full max-w-[380px] relative z-10 transition-all duration-700 delay-200 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          {/* Logo */}
          <div className="flex justify-center mb-12">
            <img
              src="/pochak-full-logo.png"
              alt="POCHAK"
              className="h-20 w-auto"
            />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative group">
              <input
                type="text"
                placeholder="이메일"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3.5 text-[14px] text-white placeholder-white/25 outline-none transition-all duration-300 focus:border-[#00CC33]/50 focus:bg-white/[0.06] focus:shadow-[0_0_0_3px_rgba(0,204,51,0.08)]"
              />
            </div>
            <div className="relative group">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3.5 pr-12 text-[14px] text-white placeholder-white/25 outline-none transition-all duration-300 focus:border-[#00CC33]/50 focus:bg-white/[0.06] focus:shadow-[0_0_0_3px_rgba(0,204,51,0.08)]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  {showPassword ? (
                    <>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </>
                  ) : (
                    <>
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </>
                  )}
                </svg>
              </button>
            </div>

            {error && (
              <p className="text-[12px] text-[#E51728] pl-1">{error}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-[#00CC33] hover:bg-[#00E639] text-[#0A0A0A] font-bold text-[14px] py-3.5 rounded-lg transition-all duration-300 hover:shadow-[0_0_24px_rgba(0,204,51,0.35)] active:scale-[0.98] disabled:opacity-50 disabled:hover:shadow-none"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  로그인 중
                </span>
              ) : '로그인'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-white/[0.06]" />
            <span className="text-[11px] text-white/20 tracking-wider">SNS 간편 로그인</span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>

          {/* SNS Buttons */}
          <div className="grid grid-cols-4 gap-3">
            <button
              onClick={() => handleSnsLogin('kakao')}
              className="group flex items-center justify-center h-12 rounded-xl bg-[#FEE500] hover:bg-[#FFEA2D] transition-all duration-200 hover:scale-105 active:scale-95"
              title="카카오 로그인"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#191919">
                <path d="M12 3C6.48 3 2 6.58 2 10.9c0 2.78 1.82 5.22 4.56 6.6-.2.74-.72 2.68-.82 3.1-.14.52.19.51.4.37.17-.11 2.62-1.78 3.69-2.5.7.1 1.43.15 2.17.15 5.52 0 10-3.58 10-7.92S17.52 3 12 3z"/>
              </svg>
            </button>
            <button
              onClick={() => handleSnsLogin('naver')}
              className="group flex items-center justify-center h-12 rounded-xl bg-[#03C75A] hover:bg-[#04D962] transition-all duration-200 hover:scale-105 active:scale-95"
              title="네이버 로그인"
            >
              <span className="text-white font-extrabold text-[16px]">N</span>
            </button>
            <button
              onClick={() => handleSnsLogin('google')}
              className="group flex items-center justify-center h-12 rounded-xl bg-white hover:bg-gray-50 transition-all duration-200 hover:scale-105 active:scale-95"
              title="구글 로그인"
            >
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 01-1.8 2.72v2.26h2.92A8.78 8.78 0 0017.64 9.2z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.71H.96v2.33A9 9 0 009 18z" fill="#34A853"/>
                <path d="M3.97 10.71A5.41 5.41 0 013.68 9c0-.6.1-1.17.29-1.71V4.96H.96A9 9 0 000 9c0 1.45.35 2.83.96 4.04l3.01-2.33z" fill="#FBBC05"/>
                <path d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 00.96 4.96l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
            </button>
            <button
              onClick={() => handleSnsLogin('apple')}
              className="group flex items-center justify-center h-12 rounded-xl bg-white/[0.06] border border-white/[0.08] hover:bg-white/[0.1] transition-all duration-200 hover:scale-105 active:scale-95"
              title="Apple 로그인"
            >
              <svg width="17" height="17" viewBox="0 0 17 17" fill="white">
                <path d="M12.15 0c.07.65-.18 1.3-.58 1.77-.4.47-1.06.83-1.7.78-.08-.63.22-1.3.56-1.72.4-.47 1.1-.8 1.72-.83zm2.09 5.89c-.06.03-1.21.7-1.2 2.08.02 1.65 1.45 2.23 1.47 2.24-.01.05-.23.79-.76 1.56-.45.67-1 1.34-1.76 1.35-.77.02-1.02-.46-1.9-.46-.88 0-1.15.44-1.88.48-.76.03-1.33-.73-1.79-1.39-.94-1.36-1.66-3.84-.69-5.52a2.67 2.67 0 012.25-1.37c.74-.02 1.44.5 1.9.5.45 0 1.3-.62 2.18-.53.37.02 1.42.15 2.09 1.14l.09-.08z"/>
              </svg>
            </button>
          </div>

          {/* Bottom links */}
          <div className="mt-8 flex items-center justify-center gap-3 text-[12px]">
            <Link to="/find-id" className="text-white/25 hover:text-white/60 transition-colors">
              아이디찾기
            </Link>
            <span className="text-white/10">|</span>
            <Link to="/find-id" className="text-white/25 hover:text-white/60 transition-colors">
              비밀번호찾기
            </Link>
            <span className="text-white/10">|</span>
            <Link to="/signup" className="text-[#00CC33]/60 hover:text-[#00CC33] transition-colors font-medium">
              회원가입
            </Link>
          </div>

          {/* Copyright */}
          <p className="mt-12 text-center text-[10px] text-white/10 tracking-wider">
            &copy; 2026 Hogak Co., Ltd.
          </p>
        </div>
      </div>
    </div>
  );
}
