import { useState } from 'react';
import { Heart, MessageCircle, ThumbsUp, Clock } from 'lucide-react';
import { SubTabChips } from './shared';

// ── Mock data ────────────────────────────────────────────────────────────────

interface MockPost {
  id: string;
  title: string;
  body: string;
  date: string;
  likes: number;
  comments: number;
  competition: string;
  liked?: boolean;
}

interface MockComment {
  id: string;
  originalPostTitle: string;
  comment: string;
  date: string;
}

const myPosts: MockPost[] = [
  { id: 'p1', title: '오늘 경기 하이라이트 정리', body: '전반 15분 첫 골 이후 후반까지 치열한 접전이 이어졌습니다. 특히 후반 30분 동점골은 정말 대단했어요.', date: '2026-03-22', likes: 24, comments: 8, competition: '2025 화랑대기' },
  { id: 'p2', title: '유소년 축구 훈련 팁 공유', body: '아이들과 함께 연습할 때 가장 중요한 건 기본기입니다. 패스, 트래핑, 드리블 순서로 연습하면 효과적이에요.', date: '2026-03-20', likes: 45, comments: 12, competition: '포착 유소년축구' },
  { id: 'p3', title: '경기용인YSFC vs 대구강북주니어 후기', body: '양 팀 모두 컨디션이 좋아서 볼만한 경기였습니다. 경기용인의 패스 연결이 인상적이었어요.', date: '2026-03-18', likes: 31, comments: 5, competition: '2025 화랑대기' },
  { id: 'p4', title: '주말 경기 일정 공유합니다', body: '이번 주말 화랑대기 8강전이 진행됩니다. 오전 10시부터 시작이니 응원 많이 해주세요!', date: '2026-03-15', likes: 18, comments: 3, competition: '2025 화랑대기' },
  { id: 'p5', title: '송도고 신입생 모집 안내', body: '2026년 신입생을 모집합니다. 축구에 관심 있는 학생이라면 누구나 환영합니다.', date: '2026-03-12', likes: 56, comments: 20, competition: '송도고' },
  { id: 'p6', title: '경기장 시설 이용 후기', body: '새로 리모델링된 잔디구장이 정말 좋아졌네요. 배수 시설도 개선되어서 비 온 다음날도 문제없이 사용 가능합니다.', date: '2026-03-10', likes: 12, comments: 4, competition: '포착 유소년축구' },
  { id: 'p7', title: '울산울브스FC 연습경기 참관기', body: '어제 연습경기를 보고 왔는데 선수들의 체력 훈련이 인상적이었습니다.', date: '2026-03-08', likes: 29, comments: 7, competition: '포착 유소년축구' },
  { id: 'p8', title: '축구화 추천 부탁드립니다', body: '인조잔디에서 사용할 축구화를 찾고 있습니다. 초등학생 기준으로 추천 부탁드려요.', date: '2026-03-05', likes: 37, comments: 15, competition: '자유게시판' },
  { id: 'p9', title: '대회 준비 식단 관리 팁', body: '대회 시즌에는 탄수화물 위주의 식단이 좋습니다. 경기 3일 전부터 단백질 섭취를 늘려주세요.', date: '2026-03-02', likes: 42, comments: 9, competition: '자유게시판' },
  { id: 'p10', title: '인천남동FC 팬 모임 후기', body: '지난 주말 팬 모임이 성황리에 끝났습니다. 다음 모임은 4월 첫째 주에 예정되어 있습니다.', date: '2026-02-28', likes: 15, comments: 6, competition: '인천남동FC' },
];

const myComments: MockComment[] = [
  { id: 'c1', originalPostTitle: '오늘 경기 MVP는 누구?', comment: '저는 7번 선수가 MVP라고 생각합니다. 수비부터 공격까지 완벽했어요.', date: '2026-03-22' },
  { id: 'c2', originalPostTitle: '화랑대기 4강 예측', comment: '경기용인이 유력하다고 봅니다. 최근 폼이 너무 좋아요.', date: '2026-03-21' },
  { id: 'c3', originalPostTitle: '유소년 대회 일정 변경 안내', comment: '일정 변경 확인했습니다. 감사합니다!', date: '2026-03-19' },
  { id: 'c4', originalPostTitle: '경기장 주차 안내', comment: '주차장이 좁으니 대중교통 이용을 추천합니다.', date: '2026-03-17' },
  { id: 'c5', originalPostTitle: '축구 기본기 연습법', comment: '리프팅 연습이 볼 감각 키우는데 정말 좋더라고요.', date: '2026-03-14' },
  { id: 'c6', originalPostTitle: '대구강북주니어 선수 소개', comment: '10번 선수 정말 기대되는 선수입니다!', date: '2026-03-11' },
  { id: 'c7', originalPostTitle: '주말 경기 같이 볼 분', comment: '저도 참석할게요! 장소 알려주세요.', date: '2026-03-08' },
  { id: 'c8', originalPostTitle: '경기 영상 업로드 요청', comment: '후반전 하이라이트 부분 업로드 부탁드립니다.', date: '2026-03-05' },
];

const likedPosts: MockPost[] = [
  { id: 'l1', title: '이번 시즌 최고의 골 모음', body: '시즌 베스트 골 TOP 10을 정리해봤습니다. 1위는 역시 결승전 역전골이죠.', date: '2026-03-23', likes: 128, comments: 34, competition: '2025 화랑대기', liked: true },
  { id: 'l2', title: '유소년 축구의 미래', body: '한국 유소년 축구의 발전 방향에 대해 이야기해봅시다. 기술 중심 교육이 핵심입니다.', date: '2026-03-21', likes: 89, comments: 22, competition: '포착 유소년축구', liked: true },
  { id: 'l3', title: '경기 분석: 전술 변화의 중요성', body: '전반 4-3-3에서 후반 3-5-2로 변경한 전술이 승리의 핵심이었습니다.', date: '2026-03-19', likes: 67, comments: 15, competition: '2025 화랑대기', liked: true },
  { id: 'l4', title: '감독 인터뷰 전문', body: '경기 후 감독 인터뷰 내용을 정리했습니다. 선수들의 노력에 감사하다는 말씀이 인상적이었어요.', date: '2026-03-16', likes: 54, comments: 8, competition: '포착 유소년축구', liked: true },
  { id: 'l5', title: '서울강남FC 훈련 공개', body: '어제 진행된 공개 훈련 후기입니다. 선수들의 집중력이 대단했습니다.', date: '2026-03-13', likes: 43, comments: 11, competition: '서울강남FC', liked: true },
  { id: 'l6', title: '부산서면유소년 창단 이야기', body: '5년 전 동네 친구들끼리 시작한 팀이 이렇게 성장하다니 감동적입니다.', date: '2026-03-10', likes: 76, comments: 19, competition: '부산서면유소년', liked: true },
];

// ── Components ───────────────────────────────────────────────────────────────

type Tab = 'posts' | 'comments' | 'liked';

function PostCard({ post, showHeart }: { post: MockPost; showHeart?: boolean }) {
  return (
    <div className="bg-[#262626] rounded-xl p-4 hover:bg-[#333] transition-colors cursor-pointer">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-semibold truncate">{post.title}</p>
          <p className="text-[#A6A6A6] text-xs mt-1 line-clamp-2 leading-relaxed">{post.body}</p>
        </div>
        {showHeart && (
          <Heart className="h-4 w-4 text-red-500 fill-red-500 shrink-0 mt-0.5" />
        )}
      </div>
      <div className="flex items-center gap-3 mt-3 text-[#666] text-xs">
        <span className="text-[#00CC33] font-medium">{post.competition}</span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {post.date}
        </span>
        <span className="flex items-center gap-1">
          <ThumbsUp className="h-3 w-3" />
          {post.likes}
        </span>
        <span className="flex items-center gap-1">
          <MessageCircle className="h-3 w-3" />
          {post.comments}
        </span>
      </div>
    </div>
  );
}

function CommentCard({ comment }: { comment: MockComment }) {
  return (
    <div className="bg-[#262626] rounded-xl p-4 hover:bg-[#333] transition-colors cursor-pointer">
      <p className="text-[#666] text-xs mb-1.5 truncate">
        원글: {comment.originalPostTitle}
      </p>
      <p className="text-white text-sm">{comment.comment}</p>
      <div className="flex items-center gap-1 mt-2 text-[#666] text-xs">
        <Clock className="h-3 w-3" />
        {comment.date}
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-[#A6A6A6]">
      <MessageCircle className="h-10 w-10 mb-3 text-[#4D4D4D]" />
      <p className="text-sm">{message}</p>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function CommunityPage() {
  const [tab, setTab] = useState<Tab>('posts');

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">커뮤니티</h1>

      <SubTabChips
        tabs={[
          { key: 'posts' as const, label: '내 게시글' },
          { key: 'comments' as const, label: '내 댓글' },
          { key: 'liked' as const, label: '좋아요한 글' },
        ]}
        active={tab}
        onChange={setTab}
      />

      {/* 내 게시글 */}
      {tab === 'posts' && (
        myPosts.length === 0 ? (
          <EmptyState message="작성한 게시글이 없습니다" />
        ) : (
          <div className="flex flex-col gap-3">
            {myPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )
      )}

      {/* 내 댓글 */}
      {tab === 'comments' && (
        myComments.length === 0 ? (
          <EmptyState message="작성한 댓글이 없습니다" />
        ) : (
          <div className="flex flex-col gap-3">
            {myComments.map((comment) => (
              <CommentCard key={comment.id} comment={comment} />
            ))}
          </div>
        )
      )}

      {/* 좋아요한 글 */}
      {tab === 'liked' && (
        likedPosts.length === 0 ? (
          <EmptyState message="좋아요한 게시글이 없습니다" />
        ) : (
          <div className="flex flex-col gap-3">
            {likedPosts.map((post) => (
              <PostCard key={post.id} post={post} showHeart />
            ))}
          </div>
        )
      )}
    </div>
  );
}
