"use client";

/**
 * Global Error (root layout 자체 에러 시)
 * CLAS 디자인 가이드: 우주인 일러스트 + "505 ERROR" + 안내 + 다시 시도 버튼
 * global-error는 자체 html/body를 포함해야 함 (root layout이 깨진 상태)
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-[#f8f9fb] flex flex-col items-center justify-center" style={{ fontFamily: "Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif" }}>
        {/* 일러스트 - CLAS 스타일 우주인 with 505 */}
        <div style={{ width: 280, height: 280, marginBottom: 32 }}>
          <svg viewBox="0 0 280 280" fill="none" xmlns="http://www.w3.org/2000/svg" width="280" height="280">
            {/* 파란 배경 원 */}
            <ellipse cx="140" cy="155" rx="120" ry="115" fill="#dbeafe" />

            {/* 505 숫자 */}
            <text x="55" y="195" fontFamily="system-ui" fontWeight="800" fontSize="64" fill="#2563eb" opacity="0.12">505</text>

            {/* 행성들 */}
            <circle cx="85" cy="200" r="18" fill="#2563eb" opacity="0.25" />
            <ellipse cx="85" cy="200" rx="26" ry="6" stroke="#1a1a2e" strokeWidth="1.5" fill="none" transform="rotate(-20 85 200)" />
            <circle cx="170" cy="210" r="12" fill="#2563eb" opacity="0.2" />
            <ellipse cx="170" cy="210" rx="18" ry="4" stroke="#1a1a2e" strokeWidth="1.2" fill="none" transform="rotate(15 170 210)" />

            {/* 우주인 헬멧 */}
            <circle cx="140" cy="120" r="32" fill="white" stroke="#1a1a2e" strokeWidth="2.5" />
            {/* 헬멧 바이저 */}
            <circle cx="140" cy="118" r="22" fill="#eff6ff" stroke="#93c5fd" strokeWidth="1.5" />

            {/* 눈 */}
            <circle cx="133" cy="116" r="3.5" fill="#1a1a2e" />
            <circle cx="147" cy="116" r="3.5" fill="#1a1a2e" />
            <circle cx="134" cy="114.5" r="1.2" fill="white" />
            <circle cx="148" cy="114.5" r="1.2" fill="white" />

            {/* 입 */}
            <path d="M135 125 Q140 128 145 125" stroke="#1a1a2e" strokeWidth="1.5" fill="none" strokeLinecap="round" />

            {/* 안테나 */}
            <line x1="140" y1="88" x2="140" y2="75" stroke="#1a1a2e" strokeWidth="2" />
            <circle cx="140" cy="72" r="4" fill="#2563eb" />
            {/* 안테나 신호 */}
            <path d="M130 68 Q140 62 150 68" stroke="#93c5fd" strokeWidth="1.2" fill="none" />
            <path d="M126 63 Q140 55 154 63" stroke="#93c5fd" strokeWidth="1" fill="none" opacity="0.6" />

            {/* 몸체 */}
            <rect x="118" y="150" width="44" height="40" rx="8" fill="white" stroke="#1a1a2e" strokeWidth="2.5" />
            {/* 가슴 패널 */}
            <rect x="128" y="158" width="24" height="16" rx="3" fill="#eff6ff" stroke="#93c5fd" strokeWidth="1" />
            <circle cx="135" cy="166" r="2" fill="#2563eb" />
            <circle cx="145" cy="166" r="2" fill="#93c5fd" />

            {/* 팔 왼쪽 (인사) */}
            <path d="M118 158 Q100 148 95 130 Q93 122 98 118" stroke="#1a1a2e" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <circle cx="98" cy="116" r="5" fill="white" stroke="#1a1a2e" strokeWidth="2" />
            {/* 손가락 */}
            <line x1="96" y1="112" x2="94" y2="108" stroke="#1a1a2e" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="98" y1="111" x2="98" y2="107" stroke="#1a1a2e" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="100" y1="112" x2="102" y2="108" stroke="#1a1a2e" strokeWidth="1.5" strokeLinecap="round" />

            {/* 팔 오른쪽 */}
            <path d="M162 160 Q178 162 182 175" stroke="#1a1a2e" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <circle cx="183" cy="178" r="5" fill="white" stroke="#1a1a2e" strokeWidth="2" />

            {/* 다리 */}
            <rect x="124" y="190" width="12" height="18" rx="4" fill="white" stroke="#1a1a2e" strokeWidth="2" />
            <rect x="144" y="190" width="12" height="18" rx="4" fill="white" stroke="#1a1a2e" strokeWidth="2" />
            {/* 부츠 */}
            <rect x="122" y="205" width="16" height="8" rx="4" fill="#1a1a2e" />
            <rect x="142" y="205" width="16" height="8" rx="4" fill="#1a1a2e" />

            {/* 연결 코드 */}
            <path d="M162 175 Q175 185 170 200 Q165 215 155 220 Q140 228 125 220" stroke="#1a1a2e" strokeWidth="1.5" fill="none" strokeDasharray="4 3" />

            {/* 별/스파크 */}
            <g fill="#2563eb" opacity="0.4">
              <circle cx="75" cy="105" r="2" />
              <circle cx="200" cy="95" r="2.5" />
              <circle cx="190" cy="140" r="1.5" />
              <circle cx="95" cy="85" r="1.5" />
            </g>
          </svg>
        </div>

        <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111827", marginBottom: 8 }}>
          505 ERROR
        </h1>
        <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 24 }}>
          올바른 요청을 처리할 수 없습니다.
        </p>

        <button
          onClick={reset}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            height: 40,
            padding: "0 32px",
            borderRadius: 9999,
            backgroundColor: "#111827",
            color: "white",
            fontSize: 14,
            fontWeight: 500,
            border: "none",
            cursor: "pointer",
          }}
        >
          다시 시도
        </button>
      </body>
    </html>
  );
}
