import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const categoryOptions = ['서비스', '이벤트', '점검'] as const;

export default function CreateNoticePage() {
  const navigate = useNavigate();
  const [category, setCategory] = useState<string>('서비스');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }
    if (!content.trim()) {
      alert('내용을 입력해주세요.');
      return;
    }
    alert('공지사항이 등록되었습니다.');
    navigate('/manage/notices');
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">공지사항 작성</h1>

      <form onSubmit={handleSubmit} className="bg-[#262626] border border-[#4D4D4D] rounded-xl p-6 space-y-5">
        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-[#A6A6A6] mb-1.5">카테고리</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-[#333333] border border-[#4D4D4D] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#00CC33]"
          >
            {categoryOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-[#A6A6A6] mb-1.5">제목</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="공지사항 제목을 입력하세요"
            className="w-full bg-[#333333] border border-[#4D4D4D] rounded-lg px-3 py-2 text-sm text-white placeholder-[#808080] focus:outline-none focus:border-[#00CC33]"
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-[#A6A6A6] mb-1.5">내용</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="공지사항 내용을 입력하세요 (리치 텍스트 에디터 예정)"
            rows={10}
            className="w-full bg-[#333333] border border-[#4D4D4D] rounded-lg px-3 py-2 text-sm text-white placeholder-[#808080] focus:outline-none focus:border-[#00CC33] resize-y"
          />
        </div>

        {/* Public toggle */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-[#A6A6A6]">공개여부</label>
          <button
            type="button"
            onClick={() => setIsPublic(!isPublic)}
            className={`relative w-11 h-6 rounded-full transition-colors ${isPublic ? 'bg-[#00CC33]' : 'bg-[#4D4D4D]'}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${isPublic ? 'left-[22px]' : 'left-0.5'}`} />
          </button>
          <span className="text-sm text-white">{isPublic ? '공개' : '비공개'}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            className="px-6 py-2 text-sm font-semibold rounded-lg bg-[#00CC33] text-[#1A1A1A] hover:bg-[#00B82E] transition-colors"
          >
            등록
          </button>
          <button
            type="button"
            onClick={() => navigate('/manage/notices')}
            className="px-6 py-2 text-sm font-semibold rounded-lg bg-[#333333] text-[#A6A6A6] hover:text-white hover:bg-[#444444] transition-colors"
          >
            취소
          </button>
        </div>
      </form>
    </div>
  );
}
