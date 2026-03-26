"use client";

import { useEffect } from "react";

/**
 * 일반 에러 (500 등) - Dashboard 내부 (LNB/GNB 유지)
 * CLAS 디자인 가이드: 로봇 일러스트 + "일시적인 오류가 발생했습니다." + 다시 시도 버튼
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[BO Error]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
      {/* 일러스트 - CLAS 스타일 로봇 */}
      <div className="relative w-[280px] h-[280px] mb-8">
        <svg viewBox="0 0 280 280" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* 파란 배경 원 */}
          <ellipse cx="140" cy="155" rx="120" ry="115" fill="#dbeafe" />

          {/* 화분 */}
          <rect x="205" y="185" width="28" height="30" rx="2" fill="#1a1a2e" />
          <rect x="201" y="180" width="36" height="8" rx="2" fill="#1a1a2e" />
          {/* 잎사귀 */}
          <path d="M219 180 Q225 150 240 145 Q228 160 225 180" fill="#93c5fd" />
          <path d="M219 180 Q210 155 215 140 Q218 155 222 175" fill="#60a5fa" />
          <path d="M222 175 Q230 160 245 160 Q232 167 225 177" fill="#bfdbfe" />

          {/* 로봇 몸체 */}
          <rect x="112" y="145" width="56" height="55" rx="6" fill="white" stroke="#1a1a2e" strokeWidth="2.5" />

          {/* 몸체 줄무늬 */}
          <line x1="120" y1="162" x2="160" y2="162" stroke="#dbeafe" strokeWidth="2" />
          <line x1="120" y1="170" x2="160" y2="170" stroke="#dbeafe" strokeWidth="2" />
          <line x1="120" y1="178" x2="160" y2="178" stroke="#dbeafe" strokeWidth="2" />
          <line x1="120" y1="186" x2="160" y2="186" stroke="#dbeafe" strokeWidth="2" />

          {/* 로봇 머리 */}
          <rect x="118" y="95" width="44" height="42" rx="8" fill="white" stroke="#1a1a2e" strokeWidth="2.5" />

          {/* 안테나 */}
          <line x1="140" y1="95" x2="140" y2="78" stroke="#1a1a2e" strokeWidth="2.5" />
          <circle cx="140" cy="74" r="5" fill="#2563eb" />

          {/* 눈 - X표시 (고장난 느낌) */}
          <g stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round">
            <line x1="127" y1="108" x2="133" y2="114" />
            <line x1="133" y1="108" x2="127" y2="114" />
            <line x1="147" y1="108" x2="153" y2="114" />
            <line x1="153" y1="108" x2="147" y2="114" />
          </g>

          {/* 입 - 물결 */}
          <path d="M130 126 Q133 123 136 126 Q139 129 142 126 Q145 123 148 126 Q151 129 154 126" stroke="#1a1a2e" strokeWidth="2" fill="none" strokeLinecap="round" />

          {/* 귀/볼트 */}
          <rect x="108" y="108" width="10" height="14" rx="2" fill="#93c5fd" stroke="#1a1a2e" strokeWidth="1.5" />
          <rect x="162" y="108" width="10" height="14" rx="2" fill="#93c5fd" stroke="#1a1a2e" strokeWidth="1.5" />

          {/* 팔 왼쪽 */}
          <path d="M112 155 Q95 155 90 168 Q88 175 92 178" stroke="#1a1a2e" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <circle cx="92" cy="180" r="5" fill="white" stroke="#1a1a2e" strokeWidth="2" />

          {/* 팔 오른쪽 */}
          <path d="M168 155 Q185 155 190 168 Q192 175 188 178" stroke="#1a1a2e" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <circle cx="188" cy="180" r="5" fill="white" stroke="#1a1a2e" strokeWidth="2" />

          {/* 다리 */}
          <rect x="122" y="200" width="14" height="18" rx="4" fill="white" stroke="#1a1a2e" strokeWidth="2" />
          <rect x="144" y="200" width="14" height="18" rx="4" fill="white" stroke="#1a1a2e" strokeWidth="2" />

          {/* 서류/문서 (로봇 옆에 떨어진) */}
          <g transform="rotate(-15 80 200)">
            <rect x="55" y="185" width="22" height="28" rx="1" fill="white" stroke="#9ca3af" strokeWidth="1" />
            <line x1="60" y1="192" x2="72" y2="192" stroke="#dbeafe" strokeWidth="1.5" />
            <line x1="60" y1="197" x2="72" y2="197" stroke="#dbeafe" strokeWidth="1.5" />
            <line x1="60" y1="202" x2="68" y2="202" stroke="#dbeafe" strokeWidth="1.5" />
          </g>
          <g transform="rotate(8 85 210)">
            <rect x="70" y="195" width="22" height="28" rx="1" fill="white" stroke="#9ca3af" strokeWidth="1" />
            <line x1="75" y1="202" x2="87" y2="202" stroke="#dbeafe" strokeWidth="1.5" />
            <line x1="75" y1="207" x2="87" y2="207" stroke="#dbeafe" strokeWidth="1.5" />
            <line x1="75" y1="212" x2="83" y2="212" stroke="#dbeafe" strokeWidth="1.5" />
          </g>

          {/* X 스파크 (오류 표시) */}
          <g stroke="#2563eb" strokeWidth="1.5" opacity="0.6">
            <line x1="185" y1="92" x2="190" y2="87" />
            <line x1="190" y1="92" x2="185" y2="87" />
            <line x1="95" y1="98" x2="100" y2="93" />
            <line x1="100" y1="98" x2="95" y2="93" />
            <line x1="175" y1="130" x2="180" y2="125" />
            <line x1="180" y1="130" x2="175" y2="125" />
          </g>

          {/* 바닥 점선 */}
          <line x1="55" y1="222" x2="90" y2="222" stroke="#9ca3af" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="170" y1="222" x2="225" y2="222" stroke="#9ca3af" strokeWidth="1" strokeDasharray="3 3" />
        </svg>
      </div>

      {/* 텍스트 */}
      <h1 className="text-xl font-bold text-gray-900 mb-2">
        일시적인 오류가 발생했습니다.
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        서비스 이용에 불편을 드려 죄송합니다. 잠시 후 다시 확인해주세요.
      </p>

      {/* 다시 시도 버튼 */}
      <button
        onClick={reset}
        className="inline-flex items-center justify-center h-10 px-8 rounded-full bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
      >
        다시 시도
      </button>
    </div>
  );
}
