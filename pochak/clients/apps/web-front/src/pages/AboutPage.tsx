import { Card, CardContent } from '@/components/ui/card';

export default function AboutPage() {
  return (
    <div className="max-w-[800px]">
      <h1 className="text-2xl font-bold text-foreground mb-6">회사소개</h1>
      <div className="flex flex-col gap-6 text-[15px] text-muted-foreground leading-relaxed">
        <div className="flex items-center gap-3 mb-8">
          <span className="text-[32px] font-black text-primary">POCHAK</span>
          <span className="text-[15px] text-pochak-text-tertiary tracking-wider">Connect you play.</span>
        </div>
        <p>포착은 유소년 스포츠를 위한 OTT 플랫폼입니다. 아이들의 경기를 촬영하고, 중계하고, 공유하는 모든 과정을 하나의 플랫폼에서 제공합니다.</p>
        <p>우리는 모든 아이들의 스포츠 활동이 기록되고, 공유되고, 응원받아야 한다고 믿습니다.</p>

        <Card className="mt-6">
          <CardContent className="p-5">
            <h2 className="text-[15px] font-bold text-foreground mb-3">회사 정보</h2>
            <div className="flex flex-col gap-1.5 text-[14px]">
              <p><span className="text-pochak-text-tertiary w-24 inline-block">법인명</span> 주식회사 호각</p>
              <p><span className="text-pochak-text-tertiary w-24 inline-block">대표이사</span> 전명섭</p>
              <p><span className="text-pochak-text-tertiary w-24 inline-block">사업자등록번호</span> 184-81-03231</p>
              <p><span className="text-pochak-text-tertiary w-24 inline-block">주소</span> 경기도 성남시 분당구 판교역로 182, 한국만도제너럴앰블리BD 2층</p>
              <p><span className="text-pochak-text-tertiary w-24 inline-block">고객센터</span> 031-778-8668</p>
              <p><span className="text-pochak-text-tertiary w-24 inline-block">이메일</span> help@hogak.co.kr</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
