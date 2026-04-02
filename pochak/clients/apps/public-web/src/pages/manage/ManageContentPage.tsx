import { useState } from 'react';
import { useToast } from '@/hooks/useToast';

type ContentItem = {
  id: number;
  thumbnail: string;
  title: string;
  type: 'LIVE' | 'VOD' | 'CLIP';
  visibility: 'PUBLIC' | 'MEMBERS_ONLY' | 'PRIVATE';
  views: number;
  createdAt: string;
};

const mockContent: ContentItem[] = [
  { id: 1, thumbnail: '', title: '2026 봄 시즌 개막전 LIVE', type: 'LIVE', visibility: 'PUBLIC', views: 12430, createdAt: '2026-03-23' },
  { id: 2, thumbnail: '', title: '결승전 하이라이트 모음', type: 'VOD', visibility: 'PUBLIC', views: 8921, createdAt: '2026-03-22' },
  { id: 3, thumbnail: '', title: '선수 인터뷰 클립', type: 'CLIP', visibility: 'PUBLIC', views: 4567, createdAt: '2026-03-21' },
  { id: 4, thumbnail: '', title: '전술 분석 VOD', type: 'VOD', visibility: 'MEMBERS_ONLY', views: 2345, createdAt: '2026-03-20' },
  { id: 5, thumbnail: '', title: '감독 기자회견 LIVE', type: 'LIVE', visibility: 'PUBLIC', views: 6789, createdAt: '2026-03-19' },
  { id: 6, thumbnail: '', title: '비하인드 영상', type: 'VOD', visibility: 'PRIVATE', views: 890, createdAt: '2026-03-18' },
  { id: 7, thumbnail: '', title: '베스트 골 TOP 10', type: 'CLIP', visibility: 'PUBLIC', views: 15670, createdAt: '2026-03-17' },
  { id: 8, thumbnail: '', title: '훈련 현장 스케치', type: 'VOD', visibility: 'MEMBERS_ONLY', views: 1234, createdAt: '2026-03-16' },
  { id: 9, thumbnail: '', title: '팬 미팅 LIVE', type: 'LIVE', visibility: 'MEMBERS_ONLY', views: 3456, createdAt: '2026-03-15' },
  { id: 10, thumbnail: '', title: '시즌 프리뷰 특집', type: 'VOD', visibility: 'PUBLIC', views: 7890, createdAt: '2026-03-14' },
  { id: 11, thumbnail: '', title: '경기 후 리액션 클립', type: 'CLIP', visibility: 'PUBLIC', views: 5432, createdAt: '2026-03-13' },
  { id: 12, thumbnail: '', title: '신입 선수 소개 영상', type: 'VOD', visibility: 'PRIVATE', views: 678, createdAt: '2026-03-12' },
];

const typeOptions = ['전체', 'LIVE', 'VOD', 'CLIP'] as const;
const visibilityOptions = ['전체', 'PUBLIC', 'MEMBERS_ONLY', 'PRIVATE'] as const;
const visibilityChangeOptions = ['PUBLIC', 'MEMBERS_ONLY', 'PRIVATE'] as const;

const visibilityLabel: Record<string, string> = {
  PUBLIC: '전체 공개',
  MEMBERS_ONLY: '회원 전용',
  PRIVATE: '비공개',
};

const typeColor: Record<string, string> = {
  LIVE: 'bg-red-500/20 text-red-400',
  VOD: 'bg-blue-500/20 text-blue-400',
  CLIP: 'bg-purple-500/20 text-purple-400',
};

export default function ManageContentPage() {
  const toast = useToast();
  const [content, setContent] = useState<ContentItem[]>(mockContent);
  const [typeFilter, setTypeFilter] = useState<string>('전체');
  const [visibilityFilter, setVisibilityFilter] = useState<string>('전체');

  const filtered = content.filter((c) => {
    const matchType = typeFilter === '전체' || c.type === typeFilter;
    const matchVisibility = visibilityFilter === '전체' || c.visibility === visibilityFilter;
    return matchType && matchVisibility;
  });

  const handleVisibilityChange = (id: number, newVisibility: string) => {
    const item = content.find((c) => c.id === id);
    if (!item) return;
    if (confirm(`"${item.title}"의 공개범위를 ${visibilityLabel[newVisibility]}(으)로 변경하시겠습니까?`)) {
      setContent((prev) => prev.map((c) => c.id === id ? { ...c, visibility: newVisibility as ContentItem['visibility'] } : c));
      alert(`공개범위가 ${visibilityLabel[newVisibility]}(으)로 변경되었습니다.`);
    }
  };

  const handleCopyLink = (id: number) => {
    const url = `${window.location.origin}/content/vod/${id}`;
    navigator.clipboard.writeText(url).then(() => {
      toast.show('링크가 복사되었습니다');
    }).catch(() => {
      toast.show('링크 복사에 실패했습니다');
    });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">콘텐츠 관리</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-[#333333] border border-[#4D4D4D] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#00CC33]"
        >
          {typeOptions.map((t) => (
            <option key={t} value={t}>유형: {t}</option>
          ))}
        </select>

        <select
          value={visibilityFilter}
          onChange={(e) => setVisibilityFilter(e.target.value)}
          className="bg-[#333333] border border-[#4D4D4D] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#00CC33]"
        >
          {visibilityOptions.map((v) => (
            <option key={v} value={v}>공개범위: {v === '전체' ? v : visibilityLabel[v]}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-[#262626] border border-[#4D4D4D] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#4D4D4D] text-[#A6A6A6]">
                <th className="text-left px-4 py-3 font-medium">썸네일</th>
                <th className="text-left px-4 py-3 font-medium">제목</th>
                <th className="text-left px-4 py-3 font-medium">유형</th>
                <th className="text-left px-4 py-3 font-medium">공개범위</th>
                <th className="text-right px-4 py-3 font-medium">조회수</th>
                <th className="text-left px-4 py-3 font-medium">등록일</th>
                <th className="text-right px-4 py-3 font-medium">액션</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className="border-b border-[#3A3A3A] last:border-b-0 hover:bg-[#2A2A2A]">
                  <td className="px-4 py-3">
                    <div className="w-16 h-10 rounded bg-[#333333] flex items-center justify-center text-[#808080] text-xs">
                      IMG
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white max-w-[200px] truncate">{item.title}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${typeColor[item.type]}`}>
                      {item.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={item.visibility}
                      onChange={(e) => handleVisibilityChange(item.id, e.target.value)}
                      className="bg-[#333333] border border-[#4D4D4D] rounded px-2 py-1 text-xs text-white focus:outline-none"
                    >
                      {visibilityChangeOptions.map((v) => (
                        <option key={v} value={v}>{visibilityLabel[v]}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right text-[#A6A6A6]">{item.views.toLocaleString()}</td>
                  <td className="px-4 py-3 text-[#A6A6A6]">{item.createdAt}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleCopyLink(item.id)}
                      className="px-2.5 py-1 text-xs rounded bg-[#333333] text-[#A6A6A6] hover:text-white hover:bg-[#444444] transition-colors"
                    >
                      링크 복사
                    </button>
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
