import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export default function FindIdPage() {
  const [phone, setPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [foundId, setFoundId] = useState('');

  const [email, setEmail] = useState('');
  const [resetLinkSent, setResetLinkSent] = useState(false);

  const handleSendCode = () => {
    if (!phone) return;
    setCodeSent(true);
  };

  const handleVerifyCode = () => {
    if (!verificationCode) return;
    setFoundId('user***@example.com');
  };

  const handleSendResetLink = () => {
    if (!email) return;
    setResetLinkSent(true);
  };

  return (
    <div className="min-h-screen bg-bg-app text-foreground flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[440px] mx-auto">
        <div className="p-7 shadow-2xl sm:p-8">
          <div className="mb-6">
            <Link to="/" className="inline-flex items-center gap-2 mb-5" aria-label="POCHAK 홈">
              <img src="/pochak-logo.svg" alt="POCHAK" className="h-6 w-auto" />
            </Link>
            <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-white">계정 찾기</h1>
            <p className="mt-2 text-[15px] leading-6 text-muted-foreground">
              가입 시 등록한 정보로 계정을 찾거나 비밀번호를 재설정할 수 있습니다.
            </p>
          </div>

          <Tabs defaultValue="find-id">
            <TabsList className="w-full">
              <TabsTrigger value="find-id">아이디 찾기</TabsTrigger>
              <TabsTrigger value="reset-pw">비밀번호 재설정</TabsTrigger>
            </TabsList>

            <TabsContent value="find-id">
              <div className="stagger-children flex flex-col gap-4 pt-2">
                <div>
                  <label className="mb-2 block text-[14px] font-medium text-white/70">
                    휴대폰 번호
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="tel"
                      placeholder="01012345678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="h-12 flex-1"
                      aria-label="휴대폰 번호"
                    />
                    <Button
                      variant="secondary"
                      className="h-12 shrink-0 px-4"
                      onClick={handleSendCode}
                      disabled={!phone}
                    >
                      인증번호 발송
                    </Button>
                  </div>
                </div>

                {codeSent && (
                  <div>
                    <label className="mb-2 block text-[14px] font-medium text-white/70">
                      인증번호
                    </label>
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="인증번호 6자리"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        className="h-12 flex-1"
                        aria-label="인증번호"
                      />
                      <Button
                        className="h-12 shrink-0 px-6"
                        onClick={handleVerifyCode}
                        disabled={!verificationCode}
                      >
                        확인
                      </Button>
                    </div>
                  </div>
                )}

                {foundId && (
                  <div className="rounded-2xl border border-primary/20 bg-primary/[0.06] px-4 py-4">
                    <p className="text-[14px] text-white/60">조회된 아이디</p>
                    <p className="mt-1 text-[15px] font-semibold text-white">{foundId}</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="reset-pw">
              <div className="stagger-children flex flex-col gap-4 pt-2">
                <div>
                  <label className="mb-2 block text-[14px] font-medium text-white/70">
                    이메일
                  </label>
                  <Input
                    type="email"
                    placeholder="가입 시 등록한 이메일"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12"
                    aria-label="이메일"
                  />
                </div>

                <Button
                  className="h-12 w-full"
                  onClick={handleSendResetLink}
                  disabled={!email}
                >
                  재설정 링크 발송
                </Button>

                {resetLinkSent && (
                  <div className="rounded-2xl border border-primary/20 bg-primary/[0.06] px-4 py-4">
                    <p className="text-[15px] text-white/80">
                      입력하신 이메일로 비밀번호 재설정 링크를 발송했습니다. 메일함을 확인해주세요.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-8 text-center">
            <Link
              to="/login"
              className="text-[14px] text-muted-foreground transition-colors hover:text-foreground"
            >
              로그인으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
