import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

type MainTab = 'find-id' | 'reset-pw';
type SubMethod = 'email' | 'phone';

export default function FindIdPage() {
  const location = useLocation();
  const initialTab: MainTab = location.pathname === '/find-password' ? 'reset-pw' : 'find-id';

  const [mainTab, setMainTab] = useState<MainTab>(initialTab);
  const [subMethod, setSubMethod] = useState<SubMethod>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [showResult, setShowResult] = useState(false);

  const inputClass =
    'w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3.5 text-[14px] text-white placeholder-white/25 outline-none transition-all duration-300 focus:border-[#00CC33]/50 focus:bg-white/[0.06] focus:shadow-[0_0_0_3px_rgba(0,204,51,0.08)]';

  const handleFindId = () => {
    setShowResult(true);
  };

  const handleResetPassword = () => {
    alert('비밀번호 재설정 링크가 이메일로 발송되었습니다.');
  };

  return (
    <div className="min-h-[calc(100vh-70px)] bg-[#1A1A1A] flex items-center justify-center px-6">
      <div className="w-full max-w-[480px]">
        <h1 className="text-2xl font-bold text-white text-center mb-8">
          아이디/비밀번호 찾기
        </h1>

        {/* Main tabs — underline style */}
        <div className="flex border-b border-[#4D4D4D] mb-8">
          {([
            { key: 'find-id' as const, label: '아이디 찾기' },
            { key: 'reset-pw' as const, label: '비밀번호 재설정' },
          ]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setMainTab(tab.key);
                setShowResult(false);
              }}
              className={`flex-1 pb-3 text-[15px] font-semibold transition-colors relative ${
                mainTab === tab.key ? 'text-white' : 'text-[#A6A6A6] hover:text-white'
              }`}
            >
              {tab.label}
              {mainTab === tab.key && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00CC33]" />
              )}
            </button>
          ))}
        </div>

        {/* Card */}
        <div className="rounded-xl bg-[#262626] border border-[#4D4D4D] p-8">
          {mainTab === 'find-id' && !showResult && (
            <>
              {/* Sub-options: pill chips */}
              <div className="flex gap-2 mb-6">
                {([
                  { key: 'email' as const, label: '이메일로 찾기' },
                  { key: 'phone' as const, label: '본인인증 찾기' },
                ]).map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => setSubMethod(opt.key)}
                    className={`px-4 py-2 rounded-full text-[13px] font-medium transition-colors ${
                      subMethod === opt.key
                        ? 'bg-[#00CC33] text-[#0A0A0A]'
                        : 'bg-white/[0.06] text-[#A6A6A6] hover:bg-white/[0.1]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {subMethod === 'email' ? (
                <div className="space-y-4">
                  <input
                    type="email"
                    placeholder="가입 시 등록한 이메일을 입력하세요"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                  />
                  <button
                    onClick={handleFindId}
                    className="w-full bg-[#00CC33] hover:bg-[#00E639] text-[#0A0A0A] font-bold text-[14px] py-3.5 rounded-lg transition-colors"
                  >
                    조회하기
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <input
                    type="tel"
                    placeholder="연락처 본인 인증"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={inputClass}
                  />
                  <button
                    onClick={handleFindId}
                    className="w-full bg-[#00CC33] hover:bg-[#00E639] text-[#0A0A0A] font-bold text-[14px] py-3.5 rounded-lg transition-colors"
                  >
                    인증하기
                  </button>
                </div>
              )}
            </>
          )}

          {mainTab === 'find-id' && showResult && (
            <div className="text-center">
              <p className="text-[14px] text-[#A6A6A6] mb-6">
                입력하신 정보와 일치하는 아이디입니다.
              </p>

              <div className="space-y-3 mb-8">
                {['pochak20**', 'pochak20**'].map((id, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-lg bg-[#1A1A1A] border border-[#4D4D4D] px-4 py-3"
                  >
                    <img
                      src="/pochak-full-logo.png"
                      alt=""
                      className="h-5 w-auto opacity-60"
                    />
                    <span className="text-[14px] text-white">{id}</span>
                  </div>
                ))}
              </div>

              <Link
                to="/"
                className="inline-block w-full bg-[#00CC33] hover:bg-[#00E639] text-[#0A0A0A] font-bold text-[14px] py-3.5 rounded-lg transition-colors text-center"
              >
                메인으로
              </Link>
            </div>
          )}

          {mainTab === 'reset-pw' && (
            <div className="space-y-4">
              <p className="text-[14px] text-[#A6A6A6] mb-2">
                가입 시 등록한 이메일을 입력하시면 비밀번호 재설정 링크를
                보내드립니다.
              </p>
              <input
                type="email"
                placeholder="이메일을 입력하세요"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className={inputClass}
              />
              <button
                onClick={handleResetPassword}
                className="w-full bg-[#00CC33] hover:bg-[#00E639] text-[#0A0A0A] font-bold text-[14px] py-3.5 rounded-lg transition-colors"
              >
                비밀번호 재설정 링크 받기
              </button>
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-[12px] text-[#A6A6A6]">
          <Link to="/login" className="hover:text-white transition-colors">
            로그인으로 돌아가기
          </Link>
        </p>
      </div>
    </div>
  );
}
