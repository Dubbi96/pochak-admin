import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronUp, ChevronDown, Globe, Moon } from "lucide-react";

export default function Footer() {
  const [infoOpen, setInfoOpen] = useState(false);

  return (
    <footer className="border-t border-[#4D4D4D] bg-[#1A1A1A]">
      <div className="px-4 py-6 lg:px-8">
        {/* Company name + toggle */}
        <button
          onClick={() => setInfoOpen(!infoOpen)}
          className="flex items-center gap-2 text-[15px] font-semibold text-white hover:text-[#A6A6A6] transition-colors"
        >
          <span>주식회사 호각</span>
          {infoOpen ? (
            <ChevronUp className="h-4 w-4 text-[#A6A6A6]" />
          ) : (
            <ChevronDown className="h-4 w-4 text-[#A6A6A6]" />
          )}
        </button>

        {/* Collapsible company info */}
        {infoOpen && (
          <div className="mt-3 space-y-1 text-[11px] text-[#A6A6A6] leading-relaxed">
            <p>
              대표이사: 전명섭 | 사업자등록번호: 184-81-03231 | 고객센터: 031-778-8668 | 이메일문의: help@hogak.co.kr
            </p>
            <p>
              주소: 경기도 성남시 분당구 판교역로 182, 한국만도제너럴앰블리BD 2층
            </p>
            <p>
              통신판매업신고번호: 제2024-성남분당A-0854호 | 호스팅 제공자: 주식회사 포착
            </p>
          </div>
        )}
      </div>

      {/* Bottom links bar */}
      <div className="border-t border-[#4D4D4D] px-4 py-4 lg:px-8">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] text-[#A6A6A6]">
          <Link to="/about" className="hover:text-white transition-colors">회사소개</Link>
          <span className="text-[#4D4D4D]">|</span>
          <Link to="/partnership" className="hover:text-white transition-colors">제휴문의</Link>
          <span className="text-[#4D4D4D]">|</span>
          <Link to="/terms" className="hover:text-white transition-colors">약관 및 정책</Link>
          <span className="text-[#4D4D4D]">|</span>
          <span className="flex items-center gap-1">
            한국어 <Globe className="h-3 w-3" />
          </span>
          <span className="text-[#4D4D4D]">|</span>
          <span className="flex items-center gap-1 cursor-pointer hover:text-white transition-colors">
            다크모드 <Moon className="h-3 w-3" />
          </span>
        </div>
        <p className="mt-3 text-[11px] text-[#606060]">
          &copy; 2026 Hogak Co., Ltd. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
