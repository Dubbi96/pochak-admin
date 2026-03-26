import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

type Notice = {
  id: number;
  category: '서비스' | '이벤트' | '점검';
  title: string;
  createdAt: string;
  status: '공개' | '비공개';
  views: number;
};

const mockNotices: Notice[] = [
  { id: 1, category: '서비스', title: '포착 TV 서비스 오픈 안내', createdAt: '2026-03-20', status: '공개', views: 1523 },
  { id: 2, category: '이벤트', title: '봄맞이 구독권 할인 이벤트', createdAt: '2026-03-18', status: '공개', views: 892 },
  { id: 3, category: '점검', title: '서버 정기 점검 안내 (3/25)', createdAt: '2026-03-17', status: '공개', views: 654 },
  { id: 4, category: '서비스', title: '클립 기능 업데이트 안내', createdAt: '2026-03-15', status: '공개', views: 445 },
  { id: 5, category: '이벤트', title: '친구 초대 이벤트 종료 안내', createdAt: '2026-03-14', status: '비공개', views: 312 },
  { id: 6, category: '서비스', title: '개인정보 처리방침 변경 안내', createdAt: '2026-03-12', status: '공개', views: 287 },
  { id: 7, category: '점검', title: '결제 시스템 점검 안내 (3/10)', createdAt: '2026-03-09', status: '비공개', views: 198 },
  { id: 8, category: '서비스', title: '모바일 앱 v2.0 출시 안내', createdAt: '2026-03-07', status: '공개', views: 1102 },
  { id: 9, category: '이벤트', title: '시청 미션 달성 보상 이벤트', createdAt: '2026-03-05', status: '공개', views: 756 },
  { id: 10, category: '서비스', title: '실시간 채팅 기능 추가 안내', createdAt: '2026-03-03', status: '공개', views: 543 },
];

const categories = ['전체', '서비스', '이벤트', '점검'] as const;

export default function ManageNoticesPage() {
  const navigate = useNavigate();
  const [categoryFilter, setCategoryFilter] = useState<string>('전체');
  const [notices, setNotices] = useState<Notice[]>(mockNotices);

  const filtered = categoryFilter === '전체'
    ? notices
    : notices.filter((n) => n.category === categoryFilter);

  const handleDelete = (id: number) => {
    if (confirm('이 공지사항을 삭제하시겠습니까?')) {
      setNotices((prev) => prev.filter((n) => n.id !== id));
      alert('공지사항이 삭제되었습니다.');
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">공지사항 관리</h1>
        <button
          onClick={() => navigate('/manage/notices/create')}
          className="px-4 py-2 text-sm font-semibold rounded-lg bg-[#00CC33] text-[#1A1A1A] hover:bg-[#00B82E] transition-colors"
        >
          새 공지 작성
        </button>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 mb-4">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              categoryFilter === cat
                ? 'bg-[#00CC33] text-[#1A1A1A] font-semibold'
                : 'bg-[#333333] text-[#A6A6A6] hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-[#262626] border border-[#4D4D4D] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#4D4D4D] text-[#A6A6A6]">
                <th className="text-left px-4 py-3 font-medium">카테고리</th>
                <th className="text-left px-4 py-3 font-medium">제목</th>
                <th className="text-left px-4 py-3 font-medium">작성일</th>
                <th className="text-left px-4 py-3 font-medium">상태</th>
                <th className="text-right px-4 py-3 font-medium">조회수</th>
                <th className="text-right px-4 py-3 font-medium">액션</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((notice) => (
                <tr key={notice.id} className="border-b border-[#3A3A3A] last:border-b-0 hover:bg-[#2A2A2A]">
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      notice.category === '서비스' ? 'bg-blue-500/20 text-blue-400' :
                      notice.category === '이벤트' ? 'bg-purple-500/20 text-purple-400' :
                      'bg-orange-500/20 text-orange-400'
                    }`}>
                      {notice.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white">{notice.title}</td>
                  <td className="px-4 py-3 text-[#A6A6A6]">{notice.createdAt}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium ${notice.status === '공개' ? 'text-[#00CC33]' : 'text-[#808080]'}`}>
                      {notice.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-[#A6A6A6]">{notice.views.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => alert('수정 기능은 준비 중입니다.')}
                        className="px-2.5 py-1 text-xs rounded bg-[#333333] text-[#A6A6A6] hover:text-white hover:bg-[#444444] transition-colors"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDelete(notice.id)}
                        className="px-2.5 py-1 text-xs rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                      >
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
