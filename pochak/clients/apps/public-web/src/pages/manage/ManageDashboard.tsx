import { useNavigate } from 'react-router-dom';

const summaryCards = [
  { title: '공지사항', count: 24, path: '/manage/notices' },
  { title: '회원', count: 1_283, path: '/manage/members' },
  { title: '콘텐츠', count: 456, path: '/manage/content' },
];

const recentActivity = [
  { id: 1, action: '공지사항 등록', detail: '"시스템 점검 안내" 공지가 등록되었습니다.', time: '10분 전' },
  { id: 2, action: '회원 권한 변경', detail: 'user123의 권한이 MANAGER로 변경되었습니다.', time: '1시간 전' },
  { id: 3, action: '콘텐츠 공개범위 변경', detail: '"2026 결승전 하이라이트" → PUBLIC으로 변경', time: '2시간 전' },
  { id: 4, action: '회원 차단', detail: 'spam_user01 계정이 차단되었습니다.', time: '3시간 전' },
  { id: 5, action: '공지사항 수정', detail: '"서비스 업데이트 안내" 공지가 수정되었습니다.', time: '5시간 전' },
];

export default function ManageDashboard() {
  const navigate = useNavigate();

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">관리 대시보드</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {summaryCards.map((card) => (
          <div key={card.title} className="bg-[#262626] border border-[#4D4D4D] rounded-xl p-5 flex flex-col gap-3">
            <p className="text-[#A6A6A6] text-sm font-medium">{card.title}</p>
            <p className="text-3xl font-bold text-white">{card.count.toLocaleString()}</p>
            <button
              onClick={() => navigate(card.path)}
              className="mt-auto self-start px-4 py-1.5 text-sm font-semibold rounded-lg bg-[#00CC33] text-[#1A1A1A] hover:bg-[#00B82E] transition-colors"
            >
              관리
            </button>
          </div>
        ))}
      </div>

      {/* Recent activity */}
      <div className="bg-[#262626] border border-[#4D4D4D] rounded-xl p-5">
        <h2 className="text-lg font-semibold text-white mb-4">최근 활동</h2>
        <ul className="divide-y divide-[#4D4D4D]">
          {recentActivity.map((item) => (
            <li key={item.id} className="py-3 first:pt-0 last:pb-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-white">{item.action}</p>
                  <p className="text-xs text-[#A6A6A6] mt-0.5">{item.detail}</p>
                </div>
                <span className="text-xs text-[#808080] whitespace-nowrap flex-shrink-0">{item.time}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
