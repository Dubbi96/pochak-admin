import { useState } from 'react';
import { LuChevronDown, LuChevronUp, LuSend, LuHeadphones } from 'react-icons/lu';
import { Button } from '@/components/ui/button';

const faqs = [
  { q: '구독 요금은 어떻게 되나요?', a: '포착은 월 10,010원부터 다양한 구독 플랜을 제공합니다. 자세한 내용은 구독/이용권 페이지에서 확인하세요.' },
  { q: '라이브 시청은 어떻게 하나요?', a: '홈 화면의 "공식 라이브" 섹션에서 현재 진행 중인 경기를 클릭하면 바로 시청할 수 있습니다.' },
  { q: '클립은 어떻게 만드나요?', a: '영상 재생 중 하단 컨트롤바의 가위 아이콘을 클릭하면 클립을 생성할 수 있습니다.' },
  { q: '환불은 어떻게 하나요?', a: '설정 > 구독 관리에서 환불 요청이 가능합니다. 자세한 내용은 약관을 참고해주세요.' },
  { q: '해외에서도 시청 가능한가요?', a: '현재 국내 서비스만 지원합니다. 해외 서비스는 준비 중입니다.' },
];

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [inquiryText, setInquiryText] = useState('');

  return (
    <div className="max-w-[800px]">
      <h1 className="text-2xl font-bold text-foreground mb-2">고객센터</h1>
      <p className="text-[14px] text-muted-foreground mb-8">문의사항이 있으시면 아래 FAQ를 확인하거나 1:1 문의를 남겨주세요.</p>

      {/* FAQ */}
      <h2 className="text-[16px] font-bold text-foreground mb-4">자주 묻는 질문</h2>
      <div className="flex flex-col gap-1 mb-10">
        {faqs.map((faq, i) => (
          <div key={i} className="rounded-xl border border-border-subtle overflow-hidden">
            <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
              className="flex items-center justify-between w-full px-4 py-3.5 text-left hover:bg-white/[0.02] transition-colors"
            >
              <span className="text-[15px] text-foreground">{faq.q}</span>
              {openFaq === i ? <LuChevronUp className="w-4 h-4 text-pochak-text-tertiary" /> : <LuChevronDown className="w-4 h-4 text-pochak-text-tertiary" />}
            </button>
            {openFaq === i && (
              <div className="pb-4 text-[14px] text-muted-foreground leading-relaxed">{faq.a}</div>
            )}
          </div>
        ))}
      </div>

      {/* 1:1 문의 */}
      <h2 className="text-[16px] font-bold text-foreground mb-4">1:1 문의</h2>
      <div className="rounded-xl bg-card border border-border-subtle p-4">
        <textarea value={inquiryText} onChange={(e) => setInquiryText(e.target.value)}
          placeholder="문의 내용을 입력해주세요..."
          className="w-full bg-transparent text-[14px] text-foreground placeholder-muted-foreground/50 resize-none outline-none h-32"
        />
        <div className="flex justify-between items-center mt-3">
          <p className="text-[13px] text-pochak-text-tertiary">고객센터: 031-778-8668 | help@hogak.co.kr</p>
          <Button variant="outline" className="gap-1.5 border-white/[0.15] hover:border-white/[0.3] hover:bg-white/[0.06]">
            <LuSend className="w-3.5 h-3.5" /> 문의하기
          </Button>
        </div>
      </div>
    </div>
  );
}
