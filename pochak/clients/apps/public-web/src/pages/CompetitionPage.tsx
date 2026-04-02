import { useState, useMemo, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  ExternalLink,
  Pencil,
  ImagePlus,
  X,
  ChevronDown,
  ChevronUp,
  Bookmark,
  Instagram,
  Youtube,
  Facebook,
} from 'lucide-react';
import TabBar from '@/components/TabBar';
import HScrollRow from '@/components/HScrollRow';
import SectionHeader from '@/components/SectionHeader';
import HVideoCard from '@/components/HVideoCard';
import VClipCard from '@/components/VClipCard';
import MonthSelector from '@/components/MonthSelector';
import MatchListItem from '@/components/MatchListItem';
import type { MatchListItemData } from '@/components/MatchListItem';
import {
  pochakCompetitions,
  pochakLiveContents,
  pochakVodContents,
  pochakClips,
  pochakMatches,
  pochakPosts,
} from '@/services/webApi';

type TabKey = 'home' | 'videos' | 'schedule' | 'posts' | 'info';
const tabItems: { key: TabKey; label: string }[] = [
  { key: 'home', label: '홈' },
  { key: 'videos', label: '영상' },
  { key: 'schedule', label: '일정' },
  { key: 'posts', label: '게시글' },
  { key: 'info', label: '정보' },
];

type VideoSubTab = 'videos' | 'clips';

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function toMatchListItem(m: (typeof pochakMatches)[number]): MatchListItemData {
  return {
    id: m.id,
    time: m.time,
    homeTeam: m.homeTeam,
    homeTeamShort: m.homeTeamShort,
    homeTeamColor: m.homeTeamColor,
    awayTeam: m.awayTeam,
    awayTeamShort: m.awayTeamShort,
    awayTeamColor: m.awayTeamColor,
    status: m.status,
    contentId: m.id,
    round: m.competitionBadge,
    venue: m.competition,
    competition: m.competition,
    date: m.date,
    homeScore: m.score ? Number(m.score.split(':')[0]?.trim()) : undefined,
    awayScore: m.score ? Number(m.score.split(':')[1]?.trim()) : undefined,
  };
}

/* ── X / Twitter icon (lucide doesn't have it) ──────────────────────────────── */
function XTwitterIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

/* ── Post-related types ────────────────────────────────────────────────────── */
interface PostComment {
  id: string;
  nickname: string;
  avatar: string;
  date: string;
  text: string;
}

interface PostData {
  id: string;
  title: string;
  author: string;
  date: string;
  views: number;
  likes: number;
  comments: number;
  isPinned?: boolean;
  body?: string;
  images?: string[];
  competitionName?: string;
  isNotice?: boolean;
  commentList: PostComment[];
}

function toPostData(post: (typeof pochakPosts)[number]): PostData {
  return {
    ...post,
    isNotice: post.isPinned,
    commentList: [
      { id: `${post.id}-c1`, nickname: '축구좋아', avatar: '⚽', date: '2025.10.21', text: '정보 감사합니다!' },
      { id: `${post.id}-c2`, nickname: '파주맘', avatar: '🙋', date: '2025.10.21', text: '아이들 응원하러 가야겠네요~' },
    ],
  };
}

/* ── Image Lightbox ────────────────────────────────────────────────────────── */
function ImageLightbox({ src, onClose }: { src: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-[#A6A6A6] transition-colors"
      >
        <X className="h-8 w-8" />
      </button>
      <img
        src={src}
        alt=""
        className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

/* ── Post Writing Form ─────────────────────────────────────────────────────── */
function PostWriteForm({
  onSubmit,
}: {
  onSubmit: (text: string, images: File[], isNotice: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isNotice, setIsNotice] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImageAdd = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;
      const remaining = 3 - images.length;
      const newFiles = Array.from(files).slice(0, remaining);
      const newPreviews = newFiles.map((f) => URL.createObjectURL(f));
      setImages((prev) => [...prev, ...newFiles]);
      setPreviews((prev) => [...prev, ...newPreviews]);
      e.target.value = '';
    },
    [images.length],
  );

  const removeImage = useCallback((idx: number) => {
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[idx]);
      return prev.filter((_, i) => i !== idx);
    });
    setImages((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const handleSubmit = () => {
    if (!text.trim()) return;
    onSubmit(text.trim(), images, isNotice);
    setText('');
    previews.forEach((url) => URL.revokeObjectURL(url));
    setImages([]);
    setPreviews([]);
    setIsNotice(false);
    setOpen(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-[#4D4D4D] bg-[#262626] text-white hover:border-[#00CC33] transition-colors text-sm font-medium"
      >
        <Pencil className="h-4 w-4" />
        글쓰기
      </button>
    );
  }

  return (
    <div className="rounded-lg border border-[#4D4D4D] bg-[#262626] p-5">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="게시글을 작성해주세요..."
        className="w-full min-h-[120px] bg-transparent text-white text-sm placeholder-[#A6A6A6] border-none outline-none resize-none leading-relaxed"
      />

      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mt-3">
          {previews.map((url, idx) => (
            <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-[#1A1A1A]">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button
                onClick={() => removeImage(idx)}
                className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 text-white hover:bg-black/80 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#4D4D4D]">
        <div className="flex items-center gap-4">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleImageAdd}
          />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={images.length >= 3}
            className="flex items-center gap-1.5 text-sm text-[#A6A6A6] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ImagePlus className="h-4 w-4" />
            이미지 ({images.length}/3)
          </button>

          <label className="flex items-center gap-1.5 text-sm text-[#A6A6A6] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isNotice}
              onChange={(e) => setIsNotice(e.target.checked)}
              className="accent-[#00CC33] w-4 h-4"
            />
            공지로 등록
          </label>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setOpen(false);
              setText('');
              previews.forEach((u) => URL.revokeObjectURL(u));
              setImages([]);
              setPreviews([]);
              setIsNotice(false);
            }}
            className="px-4 py-2 text-sm text-[#A6A6A6] hover:text-white transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={!text.trim()}
            className="px-5 py-2 rounded-lg text-sm font-medium text-white bg-[#00CC33] hover:bg-[#00BB2D] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            등록
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Card Feed Item (게시글 탭) ──────────────────────────────────────────────── */
function CardFeedItem({
  post,
  liked,
  onToggleLike,
  commentsExpanded,
  onToggleComments,
  onAddComment,
}: {
  post: PostData;
  liked: boolean;
  onToggleLike: () => void;
  commentsExpanded: boolean;
  onToggleComments: () => void;
  onAddComment: (text: string) => void;
}) {
  const [bodyExpanded, setBodyExpanded] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  const bodyText = post.body ?? '';
  const bodyLines = bodyText.split('\n');
  const isTruncatable = bodyLines.length > 3 || bodyText.length > 150;
  const displayBody = bodyExpanded
    ? bodyText
    : bodyLines.length > 3
      ? bodyLines.slice(0, 3).join('\n') + '...'
      : bodyText.length > 150
        ? bodyText.slice(0, 150) + '...'
        : bodyText;

  const handleCommentSubmit = () => {
    if (!commentText.trim()) return;
    onAddComment(commentText.trim());
    setCommentText('');
  };

  return (
    <>
      {lightboxSrc && <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />}

      <article className="rounded-lg border border-[#4D4D4D] bg-[#262626] overflow-hidden">
        <div className="flex items-center gap-3 px-5 pt-4 pb-3">
          <span className="flex-shrink-0 text-base">🏆</span>
          <div className="flex-1 min-w-0 flex items-center gap-1.5">
            <p className="text-sm font-medium text-white truncate">
              {post.competitionName ?? post.author}
            </p>
            <span className="text-[#A6A6A6] text-xs">|</span>
            <p className="text-xs text-[#A6A6A6] flex-shrink-0">{post.date}</p>
          </div>
          <button className="flex-shrink-0 text-[#A6A6A6] hover:text-white transition-colors p-1">
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>

        {post.isNotice && (
          <div className="px-5 pb-1">
            <span className="text-[11px] font-bold text-[#00CC33] bg-[#00CC33]/10 px-2 py-0.5 rounded">
              공지
            </span>
          </div>
        )}

        <div className="px-5 pb-3">
          <h3 className="text-[15px] font-semibold text-white mb-1">{post.title}</h3>
          {bodyText && (
            <p className="text-sm text-[#D4D4D4] whitespace-pre-line leading-relaxed">
              {displayBody}
            </p>
          )}
          {isTruncatable && !bodyExpanded && (
            <button
              onClick={() => setBodyExpanded(true)}
              className="text-sm text-[#A6A6A6] hover:text-white mt-1 transition-colors"
            >
              더보기
            </button>
          )}
          {isTruncatable && bodyExpanded && (
            <button
              onClick={() => setBodyExpanded(false)}
              className="text-sm text-[#A6A6A6] hover:text-white mt-1 transition-colors"
            >
              접기
            </button>
          )}
        </div>

        {post.images && post.images.length > 0 && (
          <div className="px-5 pb-3">
            <div className="grid grid-cols-3 gap-2">
              {post.images.slice(0, 3).map((url, idx) => (
                <div
                  key={idx}
                  className="aspect-square rounded-lg overflow-hidden bg-[#1A1A1A] cursor-pointer"
                  onClick={() => setLightboxSrc(url)}
                >
                  <img
                    src={url}
                    alt=""
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-5 px-5 py-3 border-t border-[#4D4D4D] text-[#A6A6A6] text-sm">
          <button
            onClick={onToggleLike}
            className={`flex items-center gap-1.5 transition-colors ${liked ? 'text-[#E51728]' : 'hover:text-white'}`}
          >
            <Heart className={`h-4 w-4 ${liked ? 'fill-[#E51728]' : ''}`} />
            {post.likes + (liked ? 1 : 0)}
          </button>
          <button
            onClick={onToggleComments}
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            {post.commentList.length}
          </button>
          <span className="ml-auto cursor-pointer hover:text-white transition-colors">
            <Share2 className="h-4 w-4" />
          </span>
        </div>

        {commentsExpanded && (
          <div className="border-t border-[#4D4D4D] px-5 py-4 space-y-3">
            <button
              onClick={onToggleComments}
              className="flex items-center gap-1 text-xs text-[#A6A6A6] hover:text-white transition-colors mb-2"
            >
              댓글 접기
              <ChevronUp className="h-3 w-3" />
            </button>

            {post.commentList.length === 0 && (
              <p className="text-sm text-[#A6A6A6]">아직 댓글이 없습니다.</p>
            )}
            {post.commentList.map((c) => (
              <div key={c.id} className="flex gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#1A1A1A] flex items-center justify-center text-sm">
                  {c.avatar}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">{c.nickname}</span>
                    <span className="text-xs text-[#A6A6A6]">{c.date}</span>
                  </div>
                  <p className="text-sm text-[#D4D4D4] mt-0.5">{c.text}</p>
                </div>
              </div>
            ))}

            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#4D4D4D]">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCommentSubmit();
                }}
                placeholder="댓글을 입력하세요..."
                className="flex-1 bg-[#1A1A1A] text-sm text-white placeholder-[#A6A6A6] rounded-lg px-3 py-2 border border-[#4D4D4D] outline-none focus:border-[#00CC33] transition-colors"
              />
              <button
                onClick={handleCommentSubmit}
                disabled={!commentText.trim()}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-[#00CC33] hover:bg-[#00BB2D] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                등록
              </button>
            </div>
          </div>
        )}

        {!commentsExpanded && post.commentList.length > 0 && (
          <button
            onClick={onToggleComments}
            className="w-full flex items-center justify-center gap-1 py-2.5 text-xs text-[#A6A6A6] hover:text-white border-t border-[#4D4D4D] transition-colors"
          >
            댓글 {post.commentList.length}개 보기
            <ChevronDown className="h-3 w-3" />
          </button>
        )}
      </article>
    </>
  );
}

/* ── Post Preview Card (홈 탭 가로 스크롤용) ─────────────────────────────────── */
function PostPreviewCard({ post }: { post: PostData }) {
  const bodyText = post.body ?? '';
  const truncated = bodyText.length > 80 ? bodyText.slice(0, 80) + '...' : bodyText;

  return (
    <div className="flex-shrink-0 w-[260px] rounded-lg bg-white p-4 cursor-pointer hover:ring-1 hover:ring-[#00CC33] transition-all">
      {post.isNotice && (
        <span className="text-[11px] font-bold text-[#00CC33] bg-[#00CC33]/10 px-2 py-0.5 rounded mb-2 inline-block">
          공지
        </span>
      )}
      <h4 className="text-[14px] font-semibold text-[#1A1A1A] leading-tight line-clamp-2">{post.title}</h4>
      <p className="text-[12px] text-[#666] mt-1.5 leading-relaxed line-clamp-3">{truncated}</p>
      <div className="flex items-center gap-3 mt-3 text-[11px] text-[#999]">
        <span>{post.date}</span>
        <span className="flex items-center gap-0.5">
          <Heart className="h-3 w-3" /> {post.likes}
        </span>
        <span className="flex items-center gap-0.5">
          <MessageCircle className="h-3 w-3" /> {post.commentList.length}
        </span>
      </div>
    </div>
  );
}

/* ── Social Link Row (정보 탭) ───────────────────────────────────────────────── */
function SocialLinkRow({ label, href }: { label: string; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between px-4 py-3 rounded-lg bg-[#1A1A1A] hover:bg-[#333] transition-colors group"
    >
      <span className="text-sm text-white">{label}</span>
      <ExternalLink className="h-4 w-4 text-[#A6A6A6] group-hover:text-white transition-colors" />
    </a>
  );
}

/* ── Similar Competition Card (정보 탭) ──────────────────────────────────────── */
function SimilarCompetitionCard({ comp }: { comp: (typeof pochakCompetitions)[number] }) {
  return (
    <div className="flex-shrink-0 w-[200px] rounded-xl border border-[#4D4D4D] bg-[#262626] overflow-hidden cursor-pointer hover:border-[#00CC33] transition-colors">
      <div
        className="h-24 flex items-center justify-center text-white text-xl font-bold"
        style={{ backgroundColor: comp.logoColor }}
      >
        {comp.logoText}
      </div>
      <div className="p-3">
        <p className="text-sm font-medium text-white truncate">{comp.name}</p>
        <p className="text-xs text-[#A6A6A6] mt-1">
          {comp.sport} · {comp.dateRange}
        </p>
      </div>
    </div>
  );
}

/* ── Pill sub-tab selector ──────────────────────────────────────────────────── */
function PillTabs<T extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: { key: T; label: string }[];
  active: T;
  onChange: (key: T) => void;
}) {
  return (
    <div className="flex gap-2">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            active === tab.key
              ? 'bg-[#00CC33] text-white'
              : 'bg-[#262626] text-[#A6A6A6] hover:text-white'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

/* ── Date grouping helper for schedule ──────────────────────────────────────── */
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

function groupMatchesByDate(matches: typeof pochakMatches) {
  const groups = new Map<string, (typeof pochakMatches)[number][]>();
  for (const m of matches) {
    const key = m.date;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(m);
  }
  return Array.from(groups.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dateStr, items]) => {
      const d = new Date(dateStr);
      const label = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} (${WEEKDAYS[d.getDay()]})`;
      return { label, matches: items };
    });
}

/* ══════════════════════════════════════════════════════════════════════════════
   Main Component
   ══════════════════════════════════════════════════════════════════════════════ */

export default function CompetitionPage() {
  const { competitionId: _competitionId } = useParams<{ competitionId: string }>();
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [videoSubTab, setVideoSubTab] = useState<VideoSubTab>('videos');
  const [year, setYear] = useState(2025);
  const [month, setMonth] = useState(10);
  const [isFavorite, setIsFavorite] = useState(false);

  /* ── Posts state ────────────────────────────────────────────────────────── */
  const [posts, setPosts] = useState<PostData[]>(() => pochakPosts.map(toPostData));
  const [likedPosts, setLikedPosts] = useState<Set<string>>(() => new Set());
  const [expandedComments, setExpandedComments] = useState<Set<string>>(() => new Set());

  const toggleLike = useCallback((postId: string) => {
    setLikedPosts((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  }, []);

  const toggleComments = useCallback((postId: string) => {
    setExpandedComments((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  }, []);

  const addComment = useCallback((postId: string, text: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              commentList: [
                ...p.commentList,
                {
                  id: `${postId}-c${Date.now()}`,
                  nickname: '나',
                  avatar: '👤',
                  date: new Date().toISOString().slice(0, 10).replace(/-/g, '.'),
                  text,
                },
              ],
            }
          : p,
      ),
    );
  }, []);

  const handleNewPost = useCallback((text: string, imageFiles: File[], isNotice: boolean) => {
    const imageUrls = imageFiles.map((f) => URL.createObjectURL(f));
    const newPost: PostData = {
      id: `post-new-${Date.now()}`,
      title: text.split('\n')[0].slice(0, 50),
      author: '나',
      date: new Date().toISOString().slice(0, 10).replace(/-/g, '.'),
      views: 0,
      likes: 0,
      comments: 0,
      isPinned: isNotice,
      isNotice,
      competitionName: pochakCompetitions[0]?.name,
      body: text,
      images: imageUrls.length > 0 ? imageUrls : undefined,
      commentList: [],
    };
    setPosts((prev) => [newPost, ...prev]);
  }, []);

  const competition = pochakCompetitions[0];

  const scheduleMatches = useMemo(() => {
    return pochakMatches.filter((m) => {
      const d = new Date(m.date);
      return d.getFullYear() === year && d.getMonth() + 1 === month;
    });
  }, [year, month]);

  const dateGroupedMatches = useMemo(() => groupMatchesByDate(scheduleMatches), [scheduleMatches]);

  const similarCompetitions = pochakCompetitions.filter((c) => c.id !== competition.id);

  return (
    <div className="px-6 py-6 lg:px-8 max-w-[1200px] mx-auto">
      {/* ── Header Section ─────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row gap-6 mb-6">
        {/* Left: text content */}
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl lg:text-3xl font-bold text-white leading-tight">
            {competition.name} {competition.subtitle}
          </h1>
          <p className="text-sm text-[#00CC33] mt-2">
            {competition.dateRange.match(/\d{4}/)?.[0] ?? '2026'} |{' '}
            {competition.dateRange.replace(/\d{4}\.?\s*/, '').trim()}
          </p>
          <p className="text-sm text-[#A6A6A6] mt-2 line-clamp-2 leading-relaxed">
            {competition.name} {competition.subtitle}는 전국 각지의 유소년팀이 참가하는 대회로,
            미래의 스타를 발굴하는 대회입니다...
          </p>

          {/* Social media icons */}
          <div className="flex items-center gap-3 mt-4">
            <button className="w-8 h-8 rounded-full bg-[#262626] flex items-center justify-center text-[#A6A6A6] hover:text-white hover:bg-[#404040] transition-colors">
              <Instagram className="h-4 w-4" />
            </button>
            <button className="w-8 h-8 rounded-full bg-[#262626] flex items-center justify-center text-[#A6A6A6] hover:text-white hover:bg-[#404040] transition-colors">
              <Youtube className="h-4 w-4" />
            </button>
            <button className="w-8 h-8 rounded-full bg-[#262626] flex items-center justify-center text-[#A6A6A6] hover:text-white hover:bg-[#404040] transition-colors">
              <XTwitterIcon className="h-4 w-4" />
            </button>
            <button className="w-8 h-8 rounded-full bg-[#262626] flex items-center justify-center text-[#A6A6A6] hover:text-white hover:bg-[#404040] transition-colors">
              <Facebook className="h-4 w-4" />
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 mt-4">
            <button className="px-6 py-2.5 rounded-lg bg-[#00CC33] text-white text-sm font-bold hover:bg-[#00E676] transition-colors">
              구매하기
            </button>
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className={`w-10 h-10 rounded-full border flex items-center justify-center transition-colors ${
                isFavorite
                  ? 'border-[#00CC33] text-[#00CC33]'
                  : 'border-[#4D4D4D] text-[#A6A6A6] hover:text-white'
              }`}
            >
              <Bookmark className={`h-5 w-5 ${isFavorite ? 'fill-[#00CC33]' : ''}`} />
            </button>
            <button className="w-10 h-10 rounded-full border border-[#4D4D4D] flex items-center justify-center text-[#A6A6A6] hover:text-white transition-colors">
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Right: competition banner image/logo */}
        <div
          className="w-48 h-64 md:w-52 md:h-72 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: competition.logoColor }}
        >
          <span className="text-white text-lg font-bold text-center px-3">
            {competition.logoText}
          </span>
        </div>
      </div>

      {/* ── Tabs ───────────────────────────────────────────────────────────── */}
      <TabBar tabs={tabItems} activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="mt-6">
        {/* ── 홈 탭 ──────────────────────── */}
        {activeTab === 'home' && (
          <div className="space-y-8">
            {/* 라이브 */}
            <section>
              <SectionHeader prefix="라이브" highlight="" linkTo="/contents?type=LIVE" />
              <HScrollRow scrollAmount={300}>
                {pochakLiveContents.map((c) => (
                  <HVideoCard
                    key={c.id}
                    title={c.title}
                    sub={`${c.competition} · ${c.status === 'LIVE' ? 'LIVE' : '예정'}`}
                    live={c.status === 'LIVE'}
                    dateBadge={c.status !== 'LIVE' ? '01/01 예정' : undefined}
                    showBookmark
                    thumbnailUrl={c.thumbnailUrl}
                    tags={c.tags.slice(0, 3)}
                    linkTo={`/contents/live/${c.id}`}
                  />
                ))}
              </HScrollRow>
            </section>

            {/* 최근 클립 */}
            <section>
              <SectionHeader prefix="최근" highlight="클립" linkTo="/contents?type=CLIP" />
              <HScrollRow scrollAmount={200}>
                {pochakClips.map((clip) => (
                  <VClipCard
                    key={clip.id}
                    title={clip.title}
                    viewCount={clip.viewCount}
                    showMoreMenu
                    linkTo={`/clip/${clip.id}`}
                  />
                ))}
              </HScrollRow>
            </section>

            {/* 최근 영상 */}
            <section>
              <SectionHeader prefix="최근" highlight="영상" linkTo="/contents?type=VOD" />
              <HScrollRow scrollAmount={300}>
                {pochakVodContents.map((v) => (
                  <HVideoCard
                    key={v.id}
                    title={v.title}
                    sub={`${v.competition} · ${v.date.slice(0, 10)}`}
                    duration={v.duration ? formatDuration(v.duration) : undefined}
                    thumbnailUrl={v.thumbnailUrl}
                    showBookmark
                    showMoreMenu
                    tags={v.tags.slice(0, 3)}
                    linkTo={`/contents/vod/${v.id}`}
                  />
                ))}
              </HScrollRow>
            </section>

            {/* 게시글 */}
            <section>
              <SectionHeader prefix="" highlight="게시글" onMore={() => setActiveTab('posts')} />
              <HScrollRow scrollAmount={280}>
                {posts.slice(0, 6).map((post) => (
                  <PostPreviewCard key={post.id} post={post} />
                ))}
              </HScrollRow>
            </section>
          </div>
        )}

        {/* ── 영상 탭 ─────────────────────── */}
        {activeTab === 'videos' && (
          <div className="space-y-6">
            <PillTabs
              tabs={[
                { key: 'videos' as VideoSubTab, label: '영상' },
                { key: 'clips' as VideoSubTab, label: '클립' },
              ]}
              active={videoSubTab}
              onChange={setVideoSubTab}
            />

            {videoSubTab === 'videos' && (
              <div className="grid gap-5 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7">
                {[...pochakLiveContents, ...pochakVodContents].slice(0, 28).map((v) => (
                  <HVideoCard
                    key={v.id}
                    title={v.title}
                    sub={v.competition}
                    duration={'duration' in v && v.duration ? formatDuration(v.duration) : undefined}
                    thumbnailUrl={v.thumbnailUrl}
                    showBookmark
                    showMoreMenu
                    tags={'tags' in v ? v.tags.slice(0, 2) : undefined}
                    className="w-full"
                    linkTo={`/contents/vod/${v.id}`}
                  />
                ))}
              </div>
            )}

            {videoSubTab === 'clips' && (
              <div className="grid gap-4 grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8">
                {pochakClips.slice(0, 24).map((clip) => (
                  <VClipCard
                    key={clip.id}
                    title={clip.title}
                    viewCount={clip.viewCount}
                    showMoreMenu
                    className="w-full"
                    linkTo={`/clip/${clip.id}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── 일정 탭 ─────────────────────── */}
        {activeTab === 'schedule' && (
          <div className="space-y-6">
            <MonthSelector year={year} month={month} onYearChange={setYear} onMonthChange={setMonth} />
            {scheduleMatches.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-[#A6A6A6]">
                <p className="text-base">해당 기간에 일정이 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {dateGroupedMatches.map((group) => (
                  <div key={group.label}>
                    <h3 className="text-sm font-semibold text-white mb-3 px-1">{group.label}</h3>
                    <div className="space-y-2">
                      {group.matches.map((match) => (
                        <MatchListItem key={match.id} match={toMatchListItem(match)} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── 게시글 탭 (Card Feed) ─────────────────────── */}
        {activeTab === 'posts' && (
          <div className="space-y-4">
            <PostWriteForm onSubmit={handleNewPost} />
            {posts.map((post) => (
              <CardFeedItem
                key={post.id}
                post={post}
                liked={likedPosts.has(post.id)}
                onToggleLike={() => toggleLike(post.id)}
                commentsExpanded={expandedComments.has(post.id)}
                onToggleComments={() => toggleComments(post.id)}
                onAddComment={(text) => addComment(post.id, text)}
              />
            ))}
          </div>
        )}

        {/* ── 정보 탭 ─────────────────────── */}
        {activeTab === 'info' && (
          <div className="space-y-6">
            <div className="rounded-xl border border-[#4D4D4D] bg-[#262626] p-6">
              <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                대회 정보
                <Pencil className="h-4 w-4 text-[#A6A6A6]" />
              </h3>

              <dl className="space-y-3 text-sm mb-6">
                <div className="flex gap-4">
                  <dt className="w-20 text-[#A6A6A6] flex-shrink-0">종목</dt>
                  <dd className="text-white">{competition.sport}</dd>
                </div>
                <div className="flex gap-4">
                  <dt className="w-20 text-[#A6A6A6] flex-shrink-0">대회기간</dt>
                  <dd className="text-white">{competition.dateRange}</dd>
                </div>
                <div className="flex gap-4">
                  <dt className="w-20 text-[#A6A6A6] flex-shrink-0">참가조건</dt>
                  <dd className="text-white">U10 이하 유소년</dd>
                </div>
                <div className="flex gap-4">
                  <dt className="w-20 text-[#A6A6A6] flex-shrink-0">주최/주관</dt>
                  <dd className="text-white">대한야구소프트볼협회</dd>
                </div>
              </dl>

              <p className="text-sm text-[#D4D4D4] leading-relaxed mb-5">
                {competition.name} {competition.subtitle}는 전국 각지의 유소년팀이 참가하여 미래의
                스타를 발굴하는 대회입니다. 매년 열리는 전통 있는 대회로, 스포츠 정신과 팀워크를
                강조합니다.
              </p>

              <div className="flex flex-wrap gap-2 mb-2">
                {[
                  `#${competition.sport}`,
                  '#유소년',
                  '#전국대회',
                  `#${competition.name.split(' ')[0]}`,
                ].map((tag) => (
                  <span key={tag} className="text-sm text-[#00CC33] cursor-pointer hover:underline">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-[#4D4D4D] bg-[#262626] p-6">
              <h3 className="text-lg font-bold text-white mb-4">소셜 링크</h3>
              <div className="space-y-2">
                <SocialLinkRow label="공식 홈페이지" href="#" />
                <SocialLinkRow label="유튜브 채널" href="#" />
                <SocialLinkRow label="인스타그램" href="#" />
              </div>
            </div>

            <section>
              <SectionHeader prefix="이 대회와 비슷한" highlight="대회" />
              <HScrollRow scrollAmount={220}>
                {similarCompetitions.map((comp) => (
                  <SimilarCompetitionCard key={comp.id} comp={comp} />
                ))}
              </HScrollRow>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
