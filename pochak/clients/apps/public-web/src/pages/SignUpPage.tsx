import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { postApi } from '@/services/apiClient';

// ── OAuth params ───────────────────────────────────────────────
function useOAuthParams() {
  const [sp] = useSearchParams();
  return {
    signupToken: sp.get('signupToken') || sessionStorage.getItem('pochak_signup_token') || '',
    provider: sp.get('provider') || sessionStorage.getItem('pochak_signup_provider') || '',
    email: sp.get('email') || sessionStorage.getItem('pochak_signup_email') || '',
    name: sp.get('name') || sessionStorage.getItem('pochak_signup_name') || '',
    isOAuth: !!(sp.get('signupToken') || sessionStorage.getItem('pochak_signup_token')),
  };
}

// ── Constants ──────────────────────────────────────────────────
const SPORTS = ['축구', '야구', '배구', '핸드볼', '농구', '기타'];
const PURPOSES = [
  '내 경기영상을 보고 싶어요 !',
  '자녀와 함께 경기 영상을 시청하고 싶어요 !',
  '나만의 팀을 만들고 운영하고 싶어요 !',
];
const REGIONS = [
  '서울시', '경기도', '인천시', '부산시', '대구시', '대전시', '광주시',
  '울산시', '세종시', '강원도', '충북', '충남', '전북', '전남', '경북', '경남', '제주도',
];

// ── Checkbox ───────────────────────────────────────────────────
function Check({ on, toggle, children, bold, right }: {
  on: boolean; toggle: () => void; children: React.ReactNode; bold?: boolean; right?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-2.5 cursor-pointer" onClick={toggle}>
      <div className="flex items-center gap-3">
        <div className={`w-[18px] h-[18px] rounded-[4px] flex items-center justify-center flex-shrink-0 transition-colors ${
          on ? 'bg-[#00CC33]' : 'border border-[#4D4D4D]'
        }`}>
          {on && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#0A0A0A" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
        </div>
        <span className={`text-[14px] ${bold ? 'text-white font-semibold' : 'text-[#A6A6A6]'}`}>{children}</span>
      </div>
      {right}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
export default function SignUpPage() {
  const navigate = useNavigate();
  const oauth = useOAuthParams();
  const savedStep = Number(sessionStorage.getItem('pochak_signup_step') || '1');
  const [step, setStep] = useState(savedStep);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  // Persist signupToken and step to sessionStorage
  useEffect(() => {
    if (oauth.signupToken) {
      sessionStorage.setItem('pochak_signup_token', oauth.signupToken);
      sessionStorage.setItem('pochak_signup_provider', oauth.provider);
      sessionStorage.setItem('pochak_signup_email', oauth.email);
      sessionStorage.setItem('pochak_signup_name', oauth.name);
    }
  }, [oauth.signupToken, oauth.provider, oauth.email, oauth.name]);

  useEffect(() => {
    sessionStorage.setItem('pochak_signup_step', String(step));
  }, [step]);

  // ── Step 1: Terms ────────────────────────────────────────────
  const [allCheck, setAllCheck] = useState(false);
  const [age14, setAge14] = useState(false);
  const [svcTerm, setSvcTerm] = useState(false);
  const [privTerm, setPrivTerm] = useState(false);
  const [thirdTerm, setThirdTerm] = useState(false);
  const [mktTerm, setMktTerm] = useState(false);
  const [smsRcv, setSmsRcv] = useState(false);
  const [emailRcv, setEmailRcv] = useState(false);
  const [pushRcv, setPushRcv] = useState(false);
  const [nightRcv, setNightRcv] = useState(false);
  const handleAll = () => {
    const v = !allCheck;
    setAllCheck(v); setAge14(v); setSvcTerm(v); setPrivTerm(v);
    setThirdTerm(v); setMktTerm(v); setSmsRcv(v); setEmailRcv(v); setPushRcv(v); setNightRcv(v);
  };
  const termsOk = age14 && svcTerm && privTerm;

  // ── Step 2: Phone ────────────────────────────────────────────
  const [phone, setPhone] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [verCode, setVerCode] = useState('');
  const [verified, setVerified] = useState(false);

  // ── Step 3: Account (skipped for OAuth) ──────────────────────
  const [loginId, setLoginId] = useState('');
  const [idOk, setIdOk] = useState(false);
  const [pw, setPw] = useState('');
  const [pwConfirm, setPwConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [acctEmail, setAcctEmail] = useState(oauth.email);
  const [emailDom, setEmailDom] = useState('@gmail.com');

  // ── Step 4: Region ───────────────────────────────────────────
  const [regionQ, setRegionQ] = useState('');
  const [selRegions, setSelRegions] = useState<string[]>([]);
  const filteredR = regionQ ? REGIONS.filter(r => r.includes(regionQ) && !selRegions.includes(r)) : [];

  // ── Step 5: Sports ───────────────────────────────────────────
  const [selSports, setSelSports] = useState<string[]>([]);
  const [customSportInput, setCustomSportInput] = useState('');
  const [customSports, setCustomSports] = useState<string[]>([]);
  const toggleSport = (s: string) => setSelSports(p => p.includes(s) ? p.filter(x => x !== s) : p.length < 3 ? [...p, s] : p);

  // ── Step 6: Purpose ──────────────────────────────────────────
  const [selPurposes, setSelPurposes] = useState<string[]>([]);
  const togglePurpose = (p: string) => setSelPurposes(v => v.includes(p) ? v.filter(x => x !== p) : [...v, p]);

  // ── Submit ───────────────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false);

  const handleComplete = async () => {
    setSubmitting(true);
    try {
      if (oauth.isOAuth) {
        const res = await postApi<{ accessToken?: string }>('/auth/oauth2/complete-signup',
          { signupToken: oauth.signupToken, nickname: loginId || oauth.name || 'pochak_user' },
          null as unknown as { accessToken?: string });
        if (res?.accessToken) {
          localStorage.setItem('pochak_token', res.accessToken);
          localStorage.setItem('pochak_user', JSON.stringify({ nickname: loginId || oauth.name, email: oauth.email }));
        }
      } else {
        await postApi('/auth/signup', {
          loginId, password: pw, email: acctEmail + emailDom, phone,
          preferredSports: [...selSports, ...customSports], regions: selRegions,
          purposes: selPurposes, marketingConsent: mktTerm,
        }, null);
      }
    } catch { /* mock */ }
    setSubmitting(false);
    setStep(99);
    sessionStorage.removeItem('pochak_signup_token');
    sessionStorage.removeItem('pochak_signup_provider');
    sessionStorage.removeItem('pochak_signup_email');
    sessionStorage.removeItem('pochak_signup_name');
    sessionStorage.removeItem('pochak_signup_step');
  };

  // ── Step logic ───────────────────────────────────────────────
  const maxStep = oauth.isOAuth ? 6 : 7;
  const actualStep = step > maxStep ? maxStep : step;

  const canNext = () => {
    const s = actualStep;
    if (s === 1) return termsOk;
    if (s === 2) return verified;
    if (!oauth.isOAuth && s === 3) return loginId && idOk && pw && pw === pwConfirm && acctEmail;
    return true;
  };

  const handleNext = () => {
    const nextStep = step + 1;
    // If OAuth and step 2 done, skip account info (step 3) → go to region (step 4 becomes step 3)
    if (oauth.isOAuth && step === 2) {
      setStep(4); // jump to region
      return;
    }
    if ((!oauth.isOAuth && nextStep === 8) || (oauth.isOAuth && nextStep === 7)) {
      handleComplete();
      return;
    }
    setStep(nextStep);
  };

  // ── Step titles ──────────────────────────────────────────────
  const stepLabel = () => {
    if (step === 1) return { title: '서비스 약관동의', sub: '포착 서비스 이용을 위해 약관에 동의해주세요.' };
    if (step === 2) return { title: '연락처 본인 인증', sub: '본인 확인을 위해 연락처를 인증해주세요.' };
    if (step === 3 && !oauth.isOAuth) return { title: '계정정보 입력', sub: '로그인에 사용할 계정 정보를 입력해주세요.' };
    if (step === 4) return { title: '관심지역 선택', sub: '설정한 지역의 대회, 팀 정보를 제공드려요.' };
    if (step === 5) return { title: '관심종목 선택', sub: '최대 3개 선택 가능' };
    if (step === 6) return { title: '서비스 이용 계기', sub: '' };
    return { title: '', sub: '' };
  };

  const additionalStep = () => {
    if (step === 4) return '1 / 3';
    if (step === 5) return '2 / 3';
    if (step === 6) return '3 / 3';
    return null;
  };

  const isSkippable = step >= 4 && step <= 6;

  // ── Complete screen ──────────────────────────────────────────
  if (step === 99) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-70px)]">
        <div className={`text-center transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-[#00CC33]/10 flex items-center justify-center">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#00CC33" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h1 className="text-[28px] font-bold text-white mb-4">회원가입 완료</h1>
          <p className="text-[14px] text-[#A6A6A6] mb-12">포착에 오신 것을 환영합니다!</p>
          <button onClick={() => navigate('/store')}
            className="bg-[#00CC33] text-[#0A0A0A] font-bold text-[15px] px-10 py-4 rounded-xl hover:bg-[#00E639] transition-colors mb-4 block mx-auto">
            대가족 무제한 시청권! 지금 구독하기
          </button>
          <button onClick={() => navigate('/home')} className="text-[14px] text-[#606060] hover:text-white transition-colors">
            다음에 할게요.
          </button>
        </div>
      </div>
    );
  }

  // ── Submitting screen ────────────────────────────────────────
  if (submitting) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-70px)]">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-2 border-[#00CC33] border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-[14px] text-[#A6A6A6]">가입 처리 중...</p>
        </div>
      </div>
    );
  }

  const { title, sub } = stepLabel();
  const addStep = additionalStep();

  return (
    <div className="flex min-h-[calc(100vh-70px)]">
      {/* ── Left: Branding panel ── */}
      <div className="hidden lg:flex lg:w-[400px] xl:w-[480px] flex-col justify-between bg-gradient-to-b from-[#001a0a] to-[#0A0A0A] border-r border-[#262626] p-10">
        <div>
          <img src="/pochak-icon.png" alt="" className="w-16 h-auto mb-8 opacity-60" />
          <h2 className="text-[32px] font-bold text-white leading-tight mb-3">
            스포츠의<br/>새로운 경험
          </h2>
          <p className="text-[15px] text-[#606060]">포착과 함께 시작하세요.</p>
        </div>
        <div>
          {/* Progress */}
          <div className="flex items-center gap-2 mb-3">
            {Array.from({ length: maxStep - 1 }).map((_, i) => (
              <div key={i} className={`h-1 rounded-full transition-all duration-500 ${
                i + 1 < step ? 'w-4 bg-[#00CC33]/60' : i + 1 === step ? 'w-8 bg-[#00CC33]' : 'w-4 bg-[#262626]'
              }`} />
            ))}
          </div>
          {addStep && <p className="text-[12px] text-[#606060]">추가정보 {addStep}</p>}
          {oauth.isOAuth && (
            <div className="mt-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#00CC33]" />
              <span className="text-[11px] text-[#606060]">{oauth.provider} 계정으로 가입 중</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Right: Form area ── */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 lg:px-10 py-5 border-b border-[#262626]">
          <button onClick={() => step > 1 ? setStep(step === 4 && oauth.isOAuth ? 2 : step - 1) : navigate('/login')}
            className="text-[#A6A6A6] hover:text-white transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div className="lg:hidden flex gap-1.5">
            {Array.from({ length: maxStep - 1 }).map((_, i) => (
              <div key={i} className={`h-1 rounded-full transition-all ${
                i + 1 === step ? 'w-6 bg-[#00CC33]' : i + 1 < step ? 'w-1.5 bg-[#00CC33]/50' : 'w-1.5 bg-[#262626]'
              }`} />
            ))}
          </div>
          {isSkippable ? (
            <button onClick={handleNext} className="text-[13px] text-[#606060] hover:text-[#A6A6A6] transition-colors">건너뛰기</button>
          ) : <div className="w-12" />}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 lg:px-10 xl:px-16 py-8">
          <div className="max-w-[520px]">
            <h1 className="text-[24px] font-bold text-white mb-1">{title}</h1>
            {sub && <p className="text-[13px] text-[#606060] mb-8">{sub}</p>}
            {!sub && <div className="mb-8" />}

            {/* ── Step 1: Terms ── */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="rounded-xl bg-[#262626] border border-[#4D4D4D] px-5 py-3">
                  <Check on={allCheck} toggle={handleAll} bold>전체동의</Check>
                </div>
                <div className="rounded-xl bg-[#262626] border border-[#4D4D4D] px-5 py-1 divide-y divide-[#3a3a3a]">
                  <Check on={age14} toggle={() => setAge14(!age14)}>만 14세 이상</Check>
                  <Check on={svcTerm} toggle={() => setSvcTerm(!svcTerm)}
                    right={<span className="text-[12px] text-[#606060] hover:text-[#A6A6A6] cursor-pointer">전문보기</span>}>
                    (필수) 서비스이용약관 동의
                  </Check>
                  <Check on={privTerm} toggle={() => setPrivTerm(!privTerm)}
                    right={<span className="text-[12px] text-[#606060] hover:text-[#A6A6A6] cursor-pointer">전문보기</span>}>
                    (필수) 개인정보 수집 및 이용 동의
                  </Check>
                  <Check on={thirdTerm} toggle={() => setThirdTerm(!thirdTerm)}
                    right={<span className="text-[12px] text-[#606060] hover:text-[#A6A6A6] cursor-pointer">전문보기</span>}>
                    (선택) 개인정보 제 3자 제공 동의
                  </Check>
                  <Check on={mktTerm} toggle={() => setMktTerm(!mktTerm)}
                    right={<span className="text-[12px] text-[#606060] hover:text-[#A6A6A6] cursor-pointer">전문보기</span>}>
                    (선택) 마케팅 정보 수신 동의
                  </Check>
                </div>
                <div className="px-2 space-y-0">
                  <Check on={smsRcv} toggle={() => setSmsRcv(!smsRcv)}>SMS 수신</Check>
                  <Check on={emailRcv} toggle={() => setEmailRcv(!emailRcv)}>이메일 수신</Check>
                  <Check on={pushRcv} toggle={() => setPushRcv(!pushRcv)}>푸시 알림 수신</Check>
                  <Check on={nightRcv} toggle={() => setNightRcv(!nightRcv)}>야간 서비스 알림 수신 (21시 ~ 08시)</Check>
                </div>
              </div>
            )}

            {/* ── Step 2: Phone ── */}
            {step === 2 && (
              <div>
                {!verified ? (
                  <div className="space-y-3">
                    <div className="rounded-xl bg-[#262626] border border-[#4D4D4D] px-5 py-1">
                      <div className="flex items-center">
                        <input type="tel" placeholder="연락처" value={phone} onChange={e => setPhone(e.target.value)}
                          className="flex-1 bg-transparent py-3.5 text-[14px] text-white placeholder-[#606060] outline-none" />
                        <button onClick={() => setCodeSent(true)} disabled={!phone}
                          className="text-[#00CC33] text-[14px] font-semibold disabled:text-[#4D4D4D]">인증하기</button>
                      </div>
                    </div>
                    {codeSent && (
                      <div className="rounded-xl bg-[#262626] border border-[#4D4D4D] px-5 py-1">
                        <div className="flex items-center">
                          <input type="text" placeholder="인증번호 입력" value={verCode} onChange={e => setVerCode(e.target.value)}
                            className="flex-1 bg-transparent py-3.5 text-[14px] text-white placeholder-[#606060] outline-none" />
                          <button onClick={() => setVerified(true)} disabled={!verCode}
                            className="text-[#00CC33] text-[14px] font-semibold disabled:text-[#4D4D4D]">확인</button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-xl bg-[#262626] border border-[#4D4D4D] px-5 py-3.5 flex items-center">
                    <span className="flex-1 text-[14px] text-white">{phone}</span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00CC33" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                )}
              </div>
            )}

            {/* ── Step 3: Account ── */}
            {step === 3 && !oauth.isOAuth && (
              <div className="space-y-3">
                <div className="rounded-xl bg-[#262626] border border-[#4D4D4D] px-5 py-1">
                  <div className="flex items-center">
                    <input placeholder="아이디" value={loginId} onChange={e => { setLoginId(e.target.value); setIdOk(false); }}
                      className="flex-1 bg-transparent py-3.5 text-[14px] text-white placeholder-[#606060] outline-none" />
                    <button onClick={() => setIdOk(true)} disabled={!loginId}
                      className="text-[#00CC33] text-[14px] font-semibold disabled:text-[#4D4D4D]">중복체크</button>
                  </div>
                </div>
                {idOk && <p className="text-[12px] text-[#00CC33] px-2">사용 가능한 아이디입니다.</p>}
                <div className="rounded-xl bg-[#262626] border border-[#4D4D4D] px-5 divide-y divide-[#3a3a3a]">
                  <div className="flex items-center">
                    <input type={showPw ? 'text' : 'password'} placeholder="비밀번호" value={pw} onChange={e => setPw(e.target.value)}
                      className="flex-1 bg-transparent py-3.5 text-[14px] text-white placeholder-[#606060] outline-none" />
                    <button onClick={() => setShowPw(!showPw)} className="text-[#606060] hover:text-[#A6A6A6]">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d={showPw ? "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" : "M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8"}/>{showPw && <circle cx="12" cy="12" r="3"/>}{!showPw && <line x1="1" y1="1" x2="23" y2="23"/>}</svg>
                    </button>
                  </div>
                  <div className="flex items-center">
                    <input type={showPw ? 'text' : 'password'} placeholder="비밀번호 확인" value={pwConfirm} onChange={e => setPwConfirm(e.target.value)}
                      className="flex-1 bg-transparent py-3.5 text-[14px] text-white placeholder-[#606060] outline-none" />
                  </div>
                </div>
                {pw && pwConfirm && pw !== pwConfirm && <p className="text-[12px] text-[#E51728] px-2">비밀번호가 일치하지 않습니다.</p>}
                <div className="rounded-xl bg-[#262626] border border-[#4D4D4D] px-5 py-1">
                  <div className="flex items-center gap-2">
                    <input placeholder="이메일" value={acctEmail} onChange={e => setAcctEmail(e.target.value)}
                      className="flex-1 bg-transparent py-3.5 text-[14px] text-white placeholder-[#606060] outline-none" />
                    <select value={emailDom} onChange={e => setEmailDom(e.target.value)}
                      className="bg-transparent text-[14px] text-[#606060] outline-none cursor-pointer">
                      <option value="@gmail.com">@gmail.com</option>
                      <option value="@naver.com">@naver.com</option>
                      <option value="@daum.net">@daum.net</option>
                      <option value="@hogak.co.kr">@hogak.co.kr</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 4: Region ── */}
            {step === 4 && (
              <div>
                <div className="relative mb-3">
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00CC33" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <input placeholder="주소검색" value={regionQ} onChange={e => setRegionQ(e.target.value)}
                    className="w-full bg-[#262626] border border-[#00CC33]/40 rounded-xl pl-11 pr-4 py-3.5 text-[14px] text-white placeholder-[#606060] outline-none focus:border-[#00CC33]" />
                </div>
                {filteredR.length > 0 && (
                  <div className="rounded-xl bg-[#262626] border border-[#4D4D4D] mb-3 max-h-48 overflow-y-auto">
                    {filteredR.map(r => (
                      <button key={r} onClick={() => { setSelRegions(p => [...p, r]); setRegionQ(''); }}
                        className="w-full text-left px-5 py-3 text-[14px] text-[#A6A6A6] hover:bg-[#333] hover:text-white transition-colors">{r}</button>
                    ))}
                  </div>
                )}
                {selRegions.length > 0 && (
                  <div className="rounded-xl bg-[#262626] border border-[#4D4D4D] divide-y divide-[#3a3a3a]">
                    {selRegions.map(r => (
                      <div key={r} className="flex items-center gap-3 px-5 py-3">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="#00CC33"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>
                        <span className="flex-1 text-[14px] text-white">대한민국 {r}</span>
                        <button onClick={() => setSelRegions(p => p.filter(x => x !== r))} className="text-[#606060] hover:text-[#A6A6A6]">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Step 5: Sports ── */}
            {step === 5 && (
              <div>
                <div className="flex flex-wrap gap-2 mb-6">
                  {SPORTS.map(s => (
                    <button key={s} onClick={() => toggleSport(s)}
                      className={`px-5 py-2.5 rounded-full text-[13px] font-medium transition-colors ${
                        selSports.includes(s) ? 'border border-[#00CC33] text-[#00CC33]' : 'bg-[#262626] border border-[#4D4D4D] text-[#A6A6A6] hover:text-white'
                      }`}>#{s}</button>
                  ))}
                </div>
                <div className="rounded-xl bg-[#262626] border border-[#4D4D4D] px-5 py-1 mb-3">
                  <div className="flex items-center">
                    <input placeholder="종목 직접입력" value={customSportInput} onChange={e => setCustomSportInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && customSportInput.trim()) { setCustomSports(p => [...p, customSportInput.trim()]); setCustomSportInput(''); } }}
                      className="flex-1 bg-transparent py-3.5 text-[14px] text-white placeholder-[#606060] outline-none" />
                    <button onClick={() => { if (customSportInput.trim()) { setCustomSports(p => [...p, customSportInput.trim()]); setCustomSportInput(''); } }}
                      className="text-[#00CC33] text-[14px] font-semibold">추가</button>
                  </div>
                </div>
                {customSports.length > 0 && (
                  <div className="rounded-xl bg-[#262626] border border-[#4D4D4D] divide-y divide-[#3a3a3a]">
                    {customSports.map(s => (
                      <div key={s} className="flex items-center gap-3 px-5 py-3">
                        <span className="text-[#00CC33] font-bold text-[14px]">#</span>
                        <span className="flex-1 text-[14px] text-white">{s}</span>
                        <button onClick={() => setCustomSports(p => p.filter(x => x !== s))} className="text-[#606060] hover:text-[#A6A6A6]">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Step 6: Purpose ── */}
            {step === 6 && (
              <div className="space-y-1">
                {PURPOSES.map(p => (
                  <button key={p} onClick={() => togglePurpose(p)}
                    className="w-full flex items-center justify-between py-4 rounded-lg px-2 hover:bg-[#262626] transition-colors">
                    <span className={`text-[15px] ${selPurposes.includes(p) ? 'text-[#00CC33] font-medium' : 'text-[#A6A6A6]'}`}>{p}</span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={selPurposes.includes(p) ? '#00CC33' : '#4D4D4D'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom action */}
        <div className="px-6 lg:px-10 xl:px-16 py-5 border-t border-[#262626]">
          <div className="max-w-[520px] flex items-center gap-4">
            {addStep && <span className="text-[13px] text-[#606060]">추가정보 {addStep}</span>}
            <button onClick={handleNext} disabled={!canNext()}
              className={`flex-1 py-3.5 rounded-xl text-[14px] font-bold transition-all ${
                canNext()
                  ? 'bg-[#00CC33] text-[#0A0A0A] hover:bg-[#00E639]'
                  : 'bg-[#262626] text-[#606060] cursor-not-allowed'
              }`}>
              {step === 6 ? '가입완료' : '다음'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
