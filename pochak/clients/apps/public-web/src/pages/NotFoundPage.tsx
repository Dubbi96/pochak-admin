import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[calc(100vh-56px)] flex-col items-center justify-center px-4">
      <div className="text-center">
        <p className="text-6xl font-black text-[#00CC33] mb-4">404</p>
        <h1 className="text-xl font-bold text-white mb-2">
          페이지를 찾을 수 없습니다
        </h1>
        <p className="text-sm text-[#A6A6A6] mb-8">
          요청하신 페이지가 존재하지 않거나, 주소가 변경되었습니다.
        </p>
        <Link
          to="/home"
          className="inline-flex items-center justify-center rounded-xl bg-[#00CC33] px-6 py-3 text-sm font-semibold text-[#1A1A1A] transition-colors hover:bg-[#00E676]"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
