import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LuChevronUp, LuChevronDown, LuGlobe, LuMoon } from 'react-icons/lu';

export default function Footer() {
  const [infoOpen, setInfoOpen] = useState(false);

  return (
    <footer className="mt-12 border-t border-border/20" role="contentinfo">
      {/* Company info toggle */}
      <div className="px-5 pt-6 pb-4 lg:px-8">
        <button
          onClick={() => setInfoOpen(!infoOpen)}
          className="flex items-center gap-2 text-[14px] font-semibold text-muted-foreground hover:text-foreground transition-colors duration-200"
        >
          <span>주식회사 호각</span>
          {infoOpen ? <LuChevronUp className="h-3.5 w-3.5" /> : <LuChevronDown className="h-3.5 w-3.5" />}
        </button>

        {infoOpen && (
          <div className="mt-3 flex flex-col gap-1 text-[13px] text-pochak-text-tertiary leading-relaxed">
            <p>&copy; 2026 Hogak Co., Ltd. All rights reserved.</p>
            <p>대표이사: 전명섭 | 사업자등록번호: 184-81-03231</p>
            <p>주소: 경기도 성남시 분당구 판교역로 182, 한국만도제너럴앰블리BD 2층</p>
            <p>고객센터: 031-778-8668 | 이메일문의: help@hogak.co.kr</p>
            <p>통신판매업신고번호: 제2024-성남분당A-0854호 | 호스팅 제공자: 주식회사 포착</p>
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border/20" />
      <div className="px-5 py-4 lg:px-8">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[14px] text-pochak-text-tertiary">
          <Link to="/about" className="hover:text-pochak-text-secondary transition-colors duration-200">회사소개</Link>
          <Link to="/partnership" className="hover:text-pochak-text-secondary transition-colors duration-200">제휴문의</Link>
          <Link to="/terms" className="hover:text-pochak-text-secondary transition-colors duration-200">약관 및 정책</Link>
          <span className="flex items-center gap-1">
            한국어 <LuGlobe className="h-3 w-3" />
          </span>
          <span className="flex items-center gap-1">
            다크모드 <LuMoon className="h-3 w-3" />
          </span>
        </div>
      </div>
    </footer>
  );
}
