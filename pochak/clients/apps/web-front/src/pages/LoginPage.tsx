import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { LuEye, LuEyeOff } from 'react-icons/lu';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';

export default function LoginPage() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!userId || !password) {
      setError('아이디와 비밀번호를 입력해주세요.');
      return;
    }
    setIsLoading(true);
    const success = await login(userId, password);
    setIsLoading(false);
    if (success) {
      navigate('/home');
    } else {
      setError('아이디 또는 비밀번호를 확인해주세요.');
    }
  };

  return (
    <div className="min-h-screen bg-bg-app text-foreground">
      <div className="mx-auto grid min-h-screen max-w-[1280px] grid-cols-1 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="relative hidden overflow-hidden border-r border-border-subtle lg:flex">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,92,0.14),_transparent_34%),linear-gradient(180deg,_#101010_0%,_#070707_72%)]" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent" />
          <div className="absolute left-12 right-12 top-12 flex items-center justify-between text-[13px] uppercase tracking-[0.22em] text-white/45">
            <span>Pochak</span>
            <span>Sports Streaming Platform</span>
          </div>

          <div
            className={`relative flex h-full w-full flex-col justify-between px-12 py-16 transition-all duration-700 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <div className="max-w-[420px] pt-24">
              <div className="mb-8 inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[13px] font-medium tracking-[0.14em] text-primary uppercase">
                Admin access
              </div>
              <h1 className="text-[56px] font-semibold leading-[1.02] tracking-[-0.05em] text-white">
                POCHAK를
                <br />
                더 조용하고
                <br />
                정확하게 관리
              </h1>
              <p className="mt-6 max-w-[360px] text-[15px] leading-6 text-white/62">
                운영 화면은 과장된 장식보다 빠른 인지와 안정적인 흐름이 먼저다. 로그인도 같은 톤으로 단정하게 맞춘다.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Minimal UI', value: '불필요한 장식 제거' },
                { label: 'Dense Layout', value: '정보 밀도 정리' },
                { label: 'Brand Accent', value: '포인트 컬러 절제' },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-border-subtle bg-white/[0.03] p-4">
                  <p className="text-[13px] uppercase tracking-[0.14em] text-white/40">{item.label}</p>
                  <p className="mt-2 text-[14px] font-medium text-white/82">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center px-6 py-10 sm:px-10">
        <div
          className={`w-full max-w-[420px] transition-all duration-700 delay-200 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <div className="p-7 shadow-2xl sm:p-8">
            <div className="mb-8">
              <div className="mb-5 flex items-center justify-between">
                <Link to="/" className="inline-flex items-center gap-2" aria-label="POCHAK 홈">
                  <img src="/pochak-logo.svg" alt="POCHAK" className="h-6 w-auto" />
                </Link>
                <span className="rounded-full border border-border-subtle bg-white/[0.03] px-3 py-1 text-[13px] text-white/48">
                  Web Admin
                </span>
              </div>
              <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-white">로그인</h1>
              <p className="mt-2 text-[15px] leading-6 text-muted-foreground">
                운영 계정으로 로그인해 콘텐츠, 팀, 일정과 알림을 관리하세요.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="stagger-children flex flex-col gap-4">
            <Input
              type="text"
              placeholder="아이디 또는 전화번호"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="h-12"
              aria-label="아이디"
            />
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 pr-12"
                aria-label="비밀번호"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground/60 transition-colors hover:bg-white/[0.04] hover:text-foreground"
                aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
              >
                {showPassword ? <LuEye size={18} /> : <LuEyeOff size={18} />}
              </button>
            </div>

            <label className="flex items-center justify-between bg-transparent px-4 py-3 text-[14px] text-muted-foreground">
              <span>로그인 상태 유지</span>
              <button
                type="button"
                onClick={() => setKeepLoggedIn((value) => !value)}
                className={`inline-flex h-6 min-w-[52px] items-center rounded-full border px-[3px] transition-colors ${
                  keepLoggedIn
                    ? 'border-primary/35 bg-primary/18 justify-end'
                    : 'border-border bg-bg-surface-2 justify-start'
                }`}
                aria-pressed={keepLoggedIn}
              >
                <span className="h-4.5 w-4.5 rounded-full bg-white" />
              </button>
            </label>

            {error && (
              <p className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="mt-2 h-12 w-full"
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
            </Button>
          </form>

            <div className="my-8 flex items-center gap-3">
              <div className="h-px flex-1 bg-white/[0.08]" />
              <span className="text-[14px] whitespace-nowrap text-white/40">
                간편 로그인
              </span>
              <div className="h-px flex-1 bg-white/[0.08]" />
            </div>

            <div className="flex items-center justify-center gap-6">
              {[
                { label: '카카오', badge: 'K', bg: '#FEE500', text: '#3C1E1E' },
                { label: '네이버', badge: 'N', bg: '#03C75A', text: '#FFFFFF' },
                { label: '구글', badge: 'G', bg: '#FFFFFF', text: '#4285F4' },
                { label: '애플', badge: '', bg: '#000000', text: '#FFFFFF', border: true },
              ].map((sns) => (
                <button
                  key={sns.label}
                  className="flex flex-col items-center gap-2 group"
                  aria-label={`${sns.label} 로그인`}
                >
                  <span
                    className={`flex h-12 w-12 items-center justify-center rounded-full text-[16px] font-bold transition-transform ${sns.border ? 'border border-white/[0.15]' : ''}`}
                    style={{ backgroundColor: sns.bg, color: sns.text }}
                  >
                    {sns.label === '애플' ? (
                      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
                    ) : sns.badge}
                  </span>
                  <span className="text-[13px] text-white/45">{sns.label}</span>
                </button>
              ))}
            </div>

            <div className="mt-8 flex items-center justify-center gap-3 text-[14px]">
              <Link to="/find-id" className="text-muted-foreground hover:text-foreground transition-colors">
                아이디 찾기
              </Link>
              <span className="text-white/20">|</span>
              <Link to="/find-password" className="text-muted-foreground hover:text-foreground transition-colors">
                비밀번호 찾기
              </Link>
            </div>

            <div className="mt-5 text-center text-[14px]">
              <span className="text-muted-foreground">아직 회원이 아니신가요?</span>{' '}
              <Link to="/signup" className="font-medium text-primary hover:text-primary/85 transition-colors">
                회원가입
              </Link>
            </div>

            <p className="mt-10 text-[13px] tracking-[0.08em] text-white/28">
              &copy; 2026 Hogak Co., Ltd. All rights reserved.
            </p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
