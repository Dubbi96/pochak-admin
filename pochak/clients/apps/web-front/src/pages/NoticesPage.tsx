import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { GATEWAY_URL } from '@/services/api-client';

interface NoticeItem {
  id: number;
  noticeType: string;
  title: string;
  content: string;
  isPinned: boolean;
  isActive: boolean;
  createdAt: string;
}

interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
}

export default function NoticesPage() {
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${GATEWAY_URL}/admin/api/v1/site/notices?size=50`)
      .then((r) => r.json())
      .then((data: PageResponse<NoticeItem>) => {
        setNotices(data.content ?? []);
      })
      .catch((err) => {
        console.warn('Failed to load notices:', err);
        setNotices([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return dateStr.slice(0, 10).replace(/-/g, '.');
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      GENERAL: '공지',
      EVENT: '이벤트',
      MAINTENANCE: '점검',
      UPDATE: '업데이트',
    };
    return labels[type] ?? type;
  };

  return (
    <div className="max-w-[800px]">
      <h1 className="text-2xl font-bold text-foreground mb-6">공지사항</h1>
      {loading ? (
        <p className="text-pochak-text-secondary text-[15px]">로딩 중...</p>
      ) : notices.length === 0 ? (
        <p className="text-pochak-text-secondary text-[15px]">등록된 공지사항이 없습니다.</p>
      ) : (
        <div className="flex flex-col gap-1">
          {notices.map((n) => (
            <div key={n.id} className="flex items-center gap-4 py-4/10 hover:bg-white/[0.02] px-3 rounded-lg cursor-pointer transition-colors">
              <Badge variant="secondary" className="flex-shrink-0">{getTypeLabel(n.noticeType)}</Badge>
              <p className="text-[15px] text-foreground flex-1">{n.title}</p>
              <span className="text-[14px] text-pochak-text-tertiary flex-shrink-0">{formatDate(n.createdAt)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
