import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const termsTabs = ['이용약관', '개인정보처리방침', '청소년보호정책'] as const;

export default function TermsPage() {
  const [activeTab, setActiveTab] = useState<string>('이용약관');

  return (
    <div className="max-w-[800px]">
      <h1 className="text-2xl font-bold text-foreground mb-6">약관 및 정책</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          {termsTabs.map((tab) => (
            <TabsTrigger key={tab} value={tab}>{tab}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="이용약관">
          <div className="text-[14px] text-muted-foreground leading-relaxed flex flex-col gap-4">
            <p className="text-[13px] text-pochak-text-tertiary">최종 업데이트: 2026.01.01</p>
            <h2 className="text-[15px] font-bold text-foreground mt-4">제1조 (목적)</h2>
            <p>이 약관은 주식회사 호각(이하 "회사")이 제공하는 포착 서비스(이하 "서비스")의 이용조건 및 절차에 관한 기본적인 사항을 규정함을 목적으로 합니다.</p>
            <h2 className="text-[15px] font-bold text-foreground mt-4">제2조 (용어의 정의)</h2>
            <p>"서비스"란 회사가 제공하는 스포츠 영상 스트리밍, 클립 생성, 커뮤니티 등 일체의 서비스를 의미합니다.</p>
            <h2 className="text-[15px] font-bold text-foreground mt-4">제3조 (약관의 효력 및 변경)</h2>
            <p>이 약관은 서비스를 이용하고자 하는 모든 회원에 대하여 그 효력을 발생합니다.</p>
          </div>
        </TabsContent>

        <TabsContent value="개인정보처리방침">
          <div className="text-[14px] text-muted-foreground leading-relaxed flex flex-col gap-4">
            <p className="text-[13px] text-pochak-text-tertiary">최종 업데이트: 2026.01.01</p>

            <h3 className="text-[16px] font-bold text-foreground mt-4">1. 수집하는 개인정보 항목</h3>
            <p>회사는 서비스 제공을 위해 다음과 같은 개인정보를 수집합니다.</p>
            <p><strong className="text-pochak-text">필수 수집 항목:</strong> 이메일 주소, 비밀번호, 닉네임, 휴대전화번호</p>
            <p><strong className="text-pochak-text">선택 수집 항목:</strong> 프로필 이미지, 관심 종목, 응원 팀, 생년월일</p>
            <p><strong className="text-pochak-text">자동 수집 항목:</strong> 기기 정보(OS, 브라우저 유형), IP 주소, 쿠키, 서비스 이용 기록, 접속 로그</p>

            <h3 className="text-[16px] font-bold text-foreground mt-4">2. 개인정보 수집 목적</h3>
            <p>회사는 수집한 개인정보를 다음의 목적을 위해 활용합니다.</p>
            <p>- 회원 가입 및 관리: 본인 확인, 회원제 서비스 제공, 개인 식별, 부정 이용 방지</p>
            <p>- 서비스 제공: 스포츠 영상 스트리밍, 클립 생성, 맞춤형 콘텐츠 추천, 결제 및 정산</p>
            <p>- 마케팅 및 광고: 이벤트 안내, 맞춤형 광고 제공, 서비스 이용 통계 분석</p>
            <p>- 고객 지원: 민원 처리, 공지사항 전달, 분쟁 조정을 위한 기록 보존</p>

            <h3 className="text-[16px] font-bold text-foreground mt-4">3. 개인정보 보유 및 이용 기간</h3>
            <p>회사는 개인정보 수집 및 이용 목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 다만, 관계 법령에 의해 보존이 필요한 경우 아래와 같이 일정 기간 보관합니다.</p>
            <p>- 계약 또는 청약철회 등에 관한 기록: 5년 (전자상거래법)</p>
            <p>- 대금결제 및 재화 등의 공급에 관한 기록: 5년 (전자상거래법)</p>
            <p>- 소비자 불만 또는 분쟁처리에 관한 기록: 3년 (전자상거래법)</p>
            <p>- 접속에 관한 기록: 3개월 (통신비밀보호법)</p>

            <h3 className="text-[16px] font-bold text-foreground mt-4">4. 개인정보의 제3자 제공</h3>
            <p>회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만, 이용자가 사전에 동의한 경우 또는 법령의 규정에 의한 경우는 예외로 합니다.</p>

            <h3 className="text-[16px] font-bold text-foreground mt-4">5. 개인정보의 파기 절차 및 방법</h3>
            <p>회사는 원칙적으로 개인정보 수집 및 이용 목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 전자적 파일 형태의 정보는 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제하며, 종이에 출력된 개인정보는 분쇄기로 분쇄하거나 소각하여 파기합니다.</p>

            <h3 className="text-[16px] font-bold text-foreground mt-4">6. 이용자의 권리와 행사 방법</h3>
            <p>이용자는 언제든지 등록된 자신의 개인정보를 조회하거나 수정할 수 있으며, 회원 탈퇴를 통해 개인정보의 처리 정지를 요청할 수 있습니다. 개인정보 열람, 정정, 삭제, 처리정지 요청은 서비스 내 설정 메뉴 또는 고객센터(support@pochak.com)를 통해 가능합니다.</p>

            <h3 className="text-[16px] font-bold text-foreground mt-4">7. 개인정보 보호책임자</h3>
            <p>성명: 김호각 | 직책: 개인정보 보호책임자 | 연락처: privacy@pochak.com</p>
          </div>
        </TabsContent>

        <TabsContent value="청소년보호정책">
          <div className="text-[14px] text-muted-foreground leading-relaxed flex flex-col gap-4">
            <p className="text-[13px] text-pochak-text-tertiary">최종 업데이트: 2026.01.01</p>

            <h3 className="text-[16px] font-bold text-foreground mt-4">1. 목적</h3>
            <p>주식회사 호각(이하 "회사")은 청소년이 건전한 인격체로 성장할 수 있도록 청소년보호법에 근거하여 청소년보호정책을 수립하고, 유해 정보로부터 청소년을 보호하기 위한 기술적·관리적 조치를 시행합니다.</p>

            <h3 className="text-[16px] font-bold text-foreground mt-4">2. 청소년 유해 정보의 차단</h3>
            <p>회사는 청소년에게 유해한 정보(폭력적, 선정적, 사행성 콘텐츠 등)가 노출되지 않도록 연령 확인 절차를 운영하며, 청소년 유해 매체물로 지정된 콘텐츠에 대해서는 19세 미만 이용자의 접근을 제한합니다.</p>

            <h3 className="text-[16px] font-bold text-foreground mt-4">3. 연령 확인 및 이용 제한</h3>
            <p>회사는 서비스 가입 시 생년월일 정보를 통해 이용자의 연령을 확인하며, 만 14세 미만 아동의 경우 법정대리인의 동의를 받아 서비스를 제공합니다. 청소년 유해 콘텐츠 이용 시에는 본인 인증을 통한 추가 연령 확인을 진행합니다.</p>

            <h3 className="text-[16px] font-bold text-foreground mt-4">4. 청소년 보호를 위한 기술적 조치</h3>
            <p>- 콘텐츠 등급 분류 시스템 운영 (전체 이용가, 12세 이용가, 15세 이용가, 청소년 이용 불가)</p>
            <p>- 청소년 유해 콘텐츠 자동 필터링 및 모니터링</p>
            <p>- 청소년 이용자 대상 이용 시간 제한 기능 제공</p>
            <p>- 유해 정보 신고 기능 운영</p>

            <h3 className="text-[16px] font-bold text-foreground mt-4">5. 결제 및 과금 보호</h3>
            <p>청소년 이용자의 과도한 결제를 방지하기 위해 월 결제 한도를 설정하며, 법정대리인의 동의 없이 이루어진 청소년의 결제는 법정대리인이 취소할 수 있습니다. 유료 콘텐츠 구매 시 청소년에게는 별도의 안내 문구를 노출합니다.</p>

            <h3 className="text-[16px] font-bold text-foreground mt-4">6. 청소년보호 책임자</h3>
            <p>회사는 청소년 보호를 위해 청소년보호 책임자를 지정하여 운영합니다.</p>
            <p>성명: 박호각 | 직책: 청소년보호 책임자 | 연락처: youth@pochak.com</p>

            <h3 className="text-[16px] font-bold text-foreground mt-4">7. 신고 및 상담</h3>
            <p>청소년 유해 정보 발견 시 서비스 내 신고 기능 또는 고객센터(support@pochak.com)를 통해 신고할 수 있으며, 방송통신심의위원회(www.kocsc.or.kr, 전화 1377) 또는 청소년보호센터(www.kyci.or.kr, 전화 1388)에도 상담 및 신고가 가능합니다.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
