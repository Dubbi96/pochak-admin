import { useState } from 'react';

// ── Types ─────────────────────────────────────────────────────────

interface Comment {
  id: string;
  author: string;
  avatarColor: string;
  avatarInitial: string;
  body: string;
  time: string;
  replies: Comment[];
}

// ── Mock Data ─────────────────────────────────────────────────────

const mockComments: Comment[] = [
  {
    id: 'c1',
    author: '축구팬123',
    avatarColor: '#1565C0',
    avatarInitial: '축',
    body: '정말 멋진 경기였어요! 후반전 역전골 장면 소름 돋았습니다.',
    time: '2시간 전',
    replies: [
      {
        id: 'c1r1',
        author: '스포츠매니아',
        avatarColor: '#E65100',
        avatarInitial: '스',
        body: '맞아요! 특히 78분 프리킥 장면은 올해 최고였습니다.',
        time: '1시간 전',
        replies: [],
      },
    ],
  },
  {
    id: 'c2',
    author: '용인YSFC팬',
    avatarColor: '#2E7D32',
    avatarInitial: 'Y',
    body: '우리 팀 경기를 이렇게 깔끔한 화질로 볼 수 있다니 감사합니다!',
    time: '3시간 전',
    replies: [],
  },
  {
    id: 'c3',
    author: '농구좋아',
    avatarColor: '#6A1B9A',
    avatarInitial: '농',
    body: '다음 경기 일정도 빨리 올려주세요!',
    time: '5시간 전',
    replies: [
      {
        id: 'c3r1',
        author: 'POCHAK운영자',
        avatarColor: '#00CC33',
        avatarInitial: 'P',
        body: '다음 경기 일정은 일정 탭에서 확인하실 수 있습니다!',
        time: '4시간 전',
        replies: [],
      },
      {
        id: 'c3r2',
        author: '야구팬',
        avatarColor: '#C62828',
        avatarInitial: '야',
        body: '일정 탭 좋아요, 저도 매일 확인하고 있어요.',
        time: '3시간 전',
        replies: [],
      },
    ],
  },
  {
    id: 'c4',
    author: '학부모',
    avatarColor: '#F9A825',
    avatarInitial: '학',
    body: '아이 경기를 이렇게 다시 볼 수 있어서 너무 좋네요. 포착 최고!',
    time: '6시간 전',
    replies: [],
  },
];

// ── Single Comment ────────────────────────────────────────────────

function CommentItem({
  comment,
  depth = 0,
  onReply,
}: {
  comment: Comment;
  depth?: number;
  onReply: (parentId: string) => void;
}) {
  return (
    <div className={depth > 0 ? 'ml-10 mt-3' : ''}>
      <div className="flex gap-3">
        {/* Avatar */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
          style={{ backgroundColor: comment.avatarColor }}
        >
          {comment.avatarInitial}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">{comment.author}</span>
            <span className="text-xs text-[#606060]">{comment.time}</span>
          </div>
          <p className="mt-1 text-sm text-[#A6A6A6] leading-relaxed">{comment.body}</p>
          <button
            className="mt-1 text-xs text-[#606060] hover:text-[#00CC33] transition-colors"
            onClick={() => onReply(comment.id)}
          >
            답글
          </button>
        </div>
      </div>

      {/* Nested Replies */}
      {comment.replies.length > 0 && (
        <div className="mt-3 space-y-3">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              onReply={onReply}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Comment Section ───────────────────────────────────────────────

export default function CommentSection() {
  const [comments, setComments] = useState<Comment[]>(mockComments);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const handleSubmit = () => {
    const text = newComment.trim();
    if (!text) return;

    const comment: Comment = {
      id: `c-${Date.now()}`,
      author: '나',
      avatarColor: '#00CC33',
      avatarInitial: 'N',
      body: text,
      time: '방금',
      replies: [],
    };

    setComments((prev) => [comment, ...prev]);
    setNewComment('');
  };

  const handleReply = (parentId: string) => {
    setReplyTo(parentId);
    setReplyText('');
  };

  const submitReply = () => {
    const text = replyText.trim();
    if (!text || !replyTo) return;

    const reply: Comment = {
      id: `r-${Date.now()}`,
      author: '나',
      avatarColor: '#00CC33',
      avatarInitial: 'N',
      body: text,
      time: '방금',
      replies: [],
    };

    setComments((prev) =>
      prev.map((c) => {
        if (c.id === replyTo) {
          return { ...c, replies: [...c.replies, reply] };
        }
        // Check nested replies one level deep
        const updatedReplies = c.replies.map((r) => {
          if (r.id === replyTo) {
            return { ...r, replies: [...r.replies, reply] };
          }
          return r;
        });
        return { ...c, replies: updatedReplies };
      }),
    );

    setReplyTo(null);
    setReplyText('');
  };

  const commentCount = comments.reduce(
    (acc, c) => acc + 1 + c.replies.reduce((ra, r) => ra + 1 + r.replies.length, 0),
    0,
  );

  return (
    <section className="mt-10 text-left">
      <h2 className="mb-5 text-lg font-bold text-white">
        댓글 <span className="text-[#00CC33]">{commentCount}</span>
      </h2>

      {/* Add comment form */}
      <div className="mb-6 flex gap-3">
        <div className="w-8 h-8 rounded-full bg-[#00CC33] flex items-center justify-center text-xs font-bold text-[#1A1A1A] flex-shrink-0">
          N
        </div>
        <div className="flex-1 min-w-0">
          <textarea
            className="w-full rounded-lg border border-[#4D4D4D] bg-[#262626] px-3 py-2 text-sm text-white placeholder-[#606060] outline-none focus:border-[#00CC33] resize-none"
            rows={3}
            placeholder="댓글을 남겨보세요..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          <div className="mt-2 flex justify-end">
            <button
              className="rounded-lg bg-[#00CC33] px-4 py-1.5 text-xs font-semibold text-[#1A1A1A] transition-colors hover:bg-[#00E676] disabled:opacity-40"
              disabled={!newComment.trim()}
              onClick={handleSubmit}
            >
              등록
            </button>
          </div>
        </div>
      </div>

      {/* Comment List */}
      <div className="space-y-5">
        {comments.map((comment) => (
          <div key={comment.id}>
            <CommentItem comment={comment} onReply={handleReply} />

            {/* Inline reply form */}
            {replyTo === comment.id && (
              <div className="ml-10 mt-3 flex gap-3">
                <div className="w-8 h-8 rounded-full bg-[#00CC33] flex items-center justify-center text-xs font-bold text-[#1A1A1A] flex-shrink-0">
                  N
                </div>
                <div className="flex-1 min-w-0">
                  <textarea
                    className="w-full rounded-lg border border-[#4D4D4D] bg-[#262626] px-3 py-2 text-sm text-white placeholder-[#606060] outline-none focus:border-[#00CC33] resize-none"
                    rows={2}
                    placeholder="답글을 입력하세요..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        submitReply();
                      }
                    }}
                  />
                  <div className="mt-2 flex justify-end gap-2">
                    <button
                      className="rounded-lg border border-[#4D4D4D] px-3 py-1 text-xs text-[#A6A6A6] hover:text-white transition-colors"
                      onClick={() => setReplyTo(null)}
                    >
                      취소
                    </button>
                    <button
                      className="rounded-lg bg-[#00CC33] px-3 py-1 text-xs font-semibold text-[#1A1A1A] transition-colors hover:bg-[#00E676] disabled:opacity-40"
                      disabled={!replyText.trim()}
                      onClick={submitReply}
                    >
                      답글
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Also show reply form for nested comment replies */}
            {comment.replies.map((reply) =>
              replyTo === reply.id ? (
                <div key={`reply-form-${reply.id}`} className="ml-20 mt-3 flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#00CC33] flex items-center justify-center text-xs font-bold text-[#1A1A1A] flex-shrink-0">
                    N
                  </div>
                  <div className="flex-1 min-w-0">
                    <textarea
                      className="w-full rounded-lg border border-[#4D4D4D] bg-[#262626] px-3 py-2 text-sm text-white placeholder-[#606060] outline-none focus:border-[#00CC33] resize-none"
                      rows={2}
                      placeholder="답글을 입력하세요..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          submitReply();
                        }
                      }}
                    />
                    <div className="mt-2 flex justify-end gap-2">
                      <button
                        className="rounded-lg border border-[#4D4D4D] px-3 py-1 text-xs text-[#A6A6A6] hover:text-white transition-colors"
                        onClick={() => setReplyTo(null)}
                      >
                        취소
                      </button>
                      <button
                        className="rounded-lg bg-[#00CC33] px-3 py-1 text-xs font-semibold text-[#1A1A1A] transition-colors hover:bg-[#00E676] disabled:opacity-40"
                        disabled={!replyText.trim()}
                        onClick={submitReply}
                      >
                        답글
                      </button>
                    </div>
                  </div>
                </div>
              ) : null,
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
