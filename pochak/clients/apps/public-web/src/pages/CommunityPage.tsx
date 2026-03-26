import { useState, useMemo } from 'react';
import { Heart, MessageCircle, Clock, ChevronDown, User, MapPin } from 'lucide-react';
import TabBar from '@/components/TabBar';

// ── Types ────────────────────────────────────────────────────────────────────

type CommunityTab = 'news' | 'recruit' | 'gathering' | 'free';

const tabItems: { key: CommunityTab; label: string }[] = [
  { key: 'news', label: '소식' },
  { key: 'recruit', label: '구인' },
  { key: 'gathering', label: '모집' },
  { key: 'free', label: '자유' },
];

interface CommunityPost {
  id: string;
  tab: CommunityTab;
  title: string;
  body: string;
  author: string;
  date: string;
  likes: number;
  comments: number;
  region: string;
  liked?: boolean;
}

// ── Mock data ────────────────────────────────────────────────────────────────

const regionOptions = ['전체', '서울', '경기', '인천', '부산', '대구', '대전', '광주'];

const mockPosts: CommunityPost[] = [
  // 소식
  { id: 'n1', tab: 'news', title: '2025 화랑대기 8강 결과 안내', body: '8강전이 성공적으로 진행되었습니다. 4강 대진표가 확정되었으니 확인해 주세요.', author: '포착운영팀', date: '2026-03-24', likes: 128, comments: 34, region: '서울' },
  { id: 'n2', tab: 'news', title: '포착 시티 서비스 오픈 안내', body: '내 주변 체육시설을 한눈에! 포착 시티 서비스가 정식 오픈되었습니다.', author: '포착운영팀', date: '2026-03-23', likes: 89, comments: 15, region: '전체' },
  { id: 'n3', tab: 'news', title: '인천남동FC 신규 코치 영입 소식', body: 'AFC 라이센스 A급 보유 김민호 코치가 인천남동FC에 합류합니다.', author: '인천남동FC', date: '2026-03-22', likes: 67, comments: 22, region: '인천' },
  { id: 'n4', tab: 'news', title: '경기도 유소년 축구 대회 일정 변경', body: '기상 악화로 인해 3월 마지막 주 경기가 4월 첫째 주로 연기되었습니다.', author: '경기도축구협회', date: '2026-03-21', likes: 45, comments: 8, region: '경기' },
  { id: 'n5', tab: 'news', title: '서울강남FC U-12 선수 모집', body: '2026 시즌 U-12 선수를 모집합니다. 테스트 일정은 4월 5일입니다.', author: '서울강남FC', date: '2026-03-20', likes: 56, comments: 11, region: '서울' },

  // 구인
  { id: 'r1', tab: 'recruit', title: '유소년 축구 코치 구합니다', body: 'AFC C급 이상 라이센스 보유자, 주 3회 근무, 서울 강남 지역. 급여 협의 가능합니다.', author: '강남스포츠클럽', date: '2026-03-24', likes: 23, comments: 7, region: '서울' },
  { id: 'r2', tab: 'recruit', title: '체육시설 매니저 채용 (성남)', body: '성남시 종합운동장 내 실내체육관 매니저를 모집합니다. 경력 2년 이상 우대.', author: '성남시체육회', date: '2026-03-23', likes: 15, comments: 4, region: '경기' },
  { id: 'r3', tab: 'recruit', title: '대회 운영 스태프 모집', body: '2025 화랑대기 결승 라운드 운영 스태프를 모집합니다. 일당 지급.', author: '화랑대기조직위', date: '2026-03-22', likes: 31, comments: 9, region: '서울' },
  { id: 'r4', tab: 'recruit', title: '영상 촬영 스태프 모집', body: '주말 경기 촬영 스태프를 구합니다. 카메라 운용 경험자 우대합니다.', author: '포착미디어', date: '2026-03-21', likes: 42, comments: 12, region: '전체' },

  // 모집
  { id: 'g1', tab: 'gathering', title: '일요일 풋살 같이 하실 분', body: '매주 일요일 오전 10시, 강남 풋살장에서 함께 뛰실 분을 찾습니다. 실력 무관!', author: '축구좋아', date: '2026-03-24', likes: 34, comments: 18, region: '서울' },
  { id: 'g2', tab: 'gathering', title: '부산 해운대 조기축구 회원 모집', body: '매주 토요일 새벽 6시 해운대해수욕장 인근 구장에서 축구합니다.', author: '해운대조기축구', date: '2026-03-23', likes: 28, comments: 6, region: '부산' },
  { id: 'g3', tab: 'gathering', title: '배드민턴 동호회 회원 모집 (인천)', body: '인천 남동구 배드민턴 동호회에서 신규 회원을 모집합니다. 초보자 환영!', author: '남동셔틀콕', date: '2026-03-22', likes: 19, comments: 5, region: '인천' },
  { id: 'g4', tab: 'gathering', title: '대구 달서구 주말 농구 모임', body: '토요일 오후 2시 달서구민체육센터에서 농구합니다. 3on3 위주.', author: '달서농구', date: '2026-03-21', likes: 25, comments: 8, region: '대구' },

  // 자유
  { id: 'f1', tab: 'free', title: '오늘 경기 진짜 대박이었네요', body: '후반 역전 골 장면 아직도 심장이 두근두근합니다. 포착에서 다시보기 꼭 보세요!', author: '축구덕후', date: '2026-03-24', likes: 87, comments: 29, region: '서울' },
  { id: 'f2', tab: 'free', title: '축구화 추천 부탁드립니다', body: '인조잔디용 축구화를 찾고 있습니다. 20만원 이하로 추천 부탁드려요.', author: '축구입문', date: '2026-03-23', likes: 45, comments: 31, region: '경기' },
  { id: 'f3', tab: 'free', title: '아이 첫 대회 출전 후기', body: '떨리는 마음으로 응원했는데 정말 뿌듯하네요. 결과보다 경험이 중요하다는 걸 느꼈습니다.', author: '축구맘', date: '2026-03-22', likes: 112, comments: 24, region: '부산' },
  { id: 'f4', tab: 'free', title: '경기장 근처 맛집 공유', body: '양재시민의숲 근처 김치찌개 맛집 찾았어요. 경기 끝나고 가기 딱 좋습니다.', author: '맛집탐험가', date: '2026-03-21', likes: 63, comments: 17, region: '서울' },
  { id: 'f5', tab: 'free', title: '비 오는 날 실내 운동 추천', body: '비 올 때 갈 수 있는 실내 축구장이나 풋살장 정보 공유합니다.', author: '비와도축구', date: '2026-03-20', likes: 38, comments: 9, region: '대전' },
];

// ── Post Card ────────────────────────────────────────────────────────────────

function PostCard({ post }: { post: CommunityPost }) {
  return (
    <article className="rounded-xl border border-[#4D4D4D] bg-[#262626] p-5 hover:border-[#666] transition-colors cursor-pointer">
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="text-[15px] font-semibold text-white line-clamp-1">{post.title}</h3>
        <span className="flex-shrink-0 text-[11px] text-[#A6A6A6] bg-[#333] px-2 py-0.5 rounded">
          {post.region}
        </span>
      </div>

      <p className="text-sm text-[#A6A6A6] line-clamp-2 leading-relaxed mb-3">{post.body}</p>

      <div className="flex items-center gap-4 text-xs text-[#666]">
        <span className="flex items-center gap-1">
          <User className="h-3 w-3" />
          {post.author}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {post.date}
        </span>
        <span className="flex items-center gap-1">
          <Heart className="h-3 w-3" />
          {post.likes}
        </span>
        <span className="flex items-center gap-1">
          <MessageCircle className="h-3 w-3" />
          {post.comments}
        </span>
      </div>
    </article>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState<CommunityTab>('news');
  const [region, setRegion] = useState('전체');

  const filtered = useMemo(() => {
    let posts = mockPosts.filter((p) => p.tab === activeTab);
    if (region !== '전체') {
      posts = posts.filter((p) => p.region === region || p.region === '전체');
    }
    return posts;
  }, [activeTab, region]);

  return (
    <div className="px-6 py-6 lg:px-8 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">커뮤니티</h1>
        <p className="text-[15px] text-[#A6A6A6] mt-1">스포츠 소식과 정보를 나눠보세요</p>
      </div>

      {/* Tabs */}
      <TabBar tabs={tabItems} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Region filter */}
      <div className="flex items-center gap-3 mt-5 mb-5">
        <MapPin className="h-4 w-4 text-[#A6A6A6] flex-shrink-0" />
        <div className="relative">
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="appearance-none bg-[#262626] border border-[#4D4D4D] text-white text-sm rounded-lg px-4 py-2 pr-9 focus:outline-none focus:border-[#00CC33] transition-colors cursor-pointer"
          >
            {regionOptions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#A6A6A6] pointer-events-none" />
        </div>
        <span className="text-sm text-[#A6A6A6]">
          {filtered.length}개 게시글
        </span>
      </div>

      {/* Post list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#A6A6A6]">
          <MessageCircle className="h-10 w-10 mb-3 text-[#4D4D4D]" />
          <p className="text-sm">게시글이 없습니다.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
