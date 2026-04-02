"use client";

import Link from "next/link";

/**
 * Root-level 404 Not Found
 * Next.js App Router에서 루트 not-found는 (dashboard) layout 밖에서 렌더링됨.
 * CLAS 가이드: LNB/GNB 유지 상태에서 에러 표시.
 * 루트 레벨에서는 LNB/GNB 없이 풀스크린으로 표시하되,
 * 대시보드 내부의 not-found는 LNB/GNB가 유지됨.
 */
export default function RootNotFound() {
  return (
    <div className="min-h-screen bg-[#f8f9fb] flex flex-col items-center justify-center">
      {/* 일러스트 - CLAS 스타일 고양이 with 404 */}
      <div className="relative w-[280px] h-[280px] mb-8">
        <svg viewBox="0 0 280 280" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <ellipse cx="140" cy="155" rx="120" ry="115" fill="#dbeafe" />
          <rect x="205" y="180" width="28" height="32" rx="2" fill="#1a1a2e" />
          <rect x="201" y="175" width="36" height="8" rx="2" fill="#1a1a2e" />
          <path d="M219 175 Q225 145 240 140 Q228 155 225 175" fill="#93c5fd" />
          <path d="M219 175 Q210 150 215 135 Q218 150 222 170" fill="#60a5fa" />
          <path d="M222 170 Q230 155 245 155 Q232 162 225 172" fill="#bfdbfe" />
          <text x="80" y="175" fontFamily="system-ui" fontWeight="800" fontSize="72" fill="#2563eb" opacity="0.15">4</text>
          <text x="175" y="175" fontFamily="system-ui" fontWeight="800" fontSize="72" fill="#2563eb" opacity="0.15">4</text>
          <ellipse cx="140" cy="170" rx="32" ry="28" fill="white" stroke="#1a1a2e" strokeWidth="2.5" />
          <path d="M120 160 Q140 155 160 160" stroke="#93c5fd" strokeWidth="2" fill="none" />
          <path d="M118 168 Q140 163 162 168" stroke="#93c5fd" strokeWidth="2" fill="none" />
          <path d="M120 176 Q140 171 160 176" stroke="#93c5fd" strokeWidth="2" fill="none" />
          <circle cx="140" cy="125" r="28" fill="white" stroke="#1a1a2e" strokeWidth="2.5" />
          <path d="M118 105 L110 78 L130 98" fill="white" stroke="#1a1a2e" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M162 105 L170 78 L150 98" fill="white" stroke="#1a1a2e" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M120 102 L115 85 L128 99" fill="#dbeafe" />
          <path d="M160 102 L165 85 L152 99" fill="#dbeafe" />
          <path d="M128 108 Q140 103 152 108" stroke="#93c5fd" strokeWidth="2" fill="none" />
          <path d="M125 115 Q140 110 155 115" stroke="#93c5fd" strokeWidth="2" fill="none" />
          <circle cx="130" cy="122" r="5" fill="#1a1a2e" />
          <circle cx="150" cy="122" r="5" fill="#1a1a2e" />
          <circle cx="131.5" cy="120.5" r="1.5" fill="white" />
          <circle cx="151.5" cy="120.5" r="1.5" fill="white" />
          <path d="M137 130 L140 133 L143 130" fill="#f9a8d4" />
          <path d="M140 133 Q136 137 132 135" stroke="#1a1a2e" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M140 133 Q144 137 148 135" stroke="#1a1a2e" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <line x1="105" y1="125" x2="125" y2="128" stroke="#1a1a2e" strokeWidth="1.2" />
          <line x1="105" y1="132" x2="125" y2="132" stroke="#1a1a2e" strokeWidth="1.2" />
          <line x1="155" y1="128" x2="175" y2="125" stroke="#1a1a2e" strokeWidth="1.2" />
          <line x1="155" y1="132" x2="175" y2="132" stroke="#1a1a2e" strokeWidth="1.2" />
          <path d="M118 185 Q115 200 118 210 Q122 215 126 210 Q128 200 125 188" fill="white" stroke="#1a1a2e" strokeWidth="2" />
          <path d="M155 188 Q152 200 154 210 Q158 215 162 210 Q165 200 162 185" fill="white" stroke="#1a1a2e" strokeWidth="2" />
          <path d="M108 175 Q80 170 75 150 Q72 140 78 135" stroke="#1a1a2e" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <circle cx="85" cy="215" r="14" fill="none" stroke="#93c5fd" strokeWidth="2" />
          <circle cx="85" cy="215" r="8" fill="none" stroke="#60a5fa" strokeWidth="1.5" />
          <path d="M95 205 Q110 195 100 185" stroke="#93c5fd" strokeWidth="1.5" fill="none" />
          <line x1="55" y1="220" x2="75" y2="220" stroke="#9ca3af" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="170" y1="220" x2="210" y2="220" stroke="#9ca3af" strokeWidth="1" strokeDasharray="3 3" />
        </svg>
      </div>

      <h1 className="text-xl font-bold text-gray-900 mb-2">404 ERROR</h1>
      <p className="text-sm text-gray-500 mb-6">
        페이지를 찾을 수 없습니다. URL 주소를 다시 확인해 주세요
      </p>

      <Link
        href="/"
        className="inline-flex items-center justify-center h-10 px-8 rounded-full bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
      >
        다시 시도
      </Link>
    </div>
  );
}
