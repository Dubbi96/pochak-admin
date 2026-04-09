import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { LuArrowLeft, LuPlus, LuPencil, LuTrash2, LuPin } from 'react-icons/lu'
import { get, api } from '@/lib/api'

interface ClubPost {
  id: number
  clubId: number
  postType: string
  title: string
  content: string
  pinned: boolean
  viewCount: number
  createdAt: string
  updatedAt: string
}

const POST_TYPE_LABELS: Record<string, string> = {
  NOTICE: '공지',
  POST: '게시글',
  EVENT: '이벤트',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

interface PostFormProps {
  clubId: string
  initial?: Partial<ClubPost>
  onSave: (post: ClubPost) => void
  onCancel: () => void
}

function PostForm({ clubId, initial, onSave, onCancel }: PostFormProps) {
  const [postType, setPostType] = useState(initial?.postType ?? 'NOTICE')
  const [title, setTitle] = useState(initial?.title ?? '')
  const [content, setContent] = useState(initial?.content ?? '')
  const [pinned, setPinned] = useState(initial?.pinned ?? false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      setError('제목과 내용을 입력해주세요.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const body = { postType, title, content, pinned }
      let res
      if (initial?.id) {
        res = await api.put<{ data: ClubPost }>(`/api/v1/clubs/${clubId}/posts/${initial.id}`, body)
      } else {
        res = await api.post<{ data: ClubPost }>(`/api/v1/clubs/${clubId}/posts`, body)
      }
      const data = res.data
      onSave((data as unknown as { data: ClubPost })?.data ?? (data as unknown as ClubPost))
    } catch {
      setError('저장에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="rounded-xl border"
      style={{ padding: 20, backgroundColor: 'var(--color-bg-surface)', borderColor: 'var(--color-border-subtle)', marginBottom: 16 }}
    >
      <div className="flex gap-3" style={{ marginBottom: 12 }}>
        <select
          value={postType}
          onChange={(e) => setPostType(e.target.value)}
          className="text-[13px] border rounded-lg px-2 py-1.5 outline-none"
          style={{ borderColor: 'var(--color-border-default)', backgroundColor: 'var(--color-bg-app)' }}
        >
          {Object.entries(POST_TYPE_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
        <label className="flex items-center gap-1.5 text-[13px] cursor-pointer">
          <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} className="w-3.5 h-3.5" />
          상단 고정
        </label>
      </div>
      <input
        type="text"
        placeholder="제목"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full h-10 rounded-lg border text-[14px] px-3 outline-none mb-3"
        style={{ borderColor: 'var(--color-border-default)', backgroundColor: 'var(--color-bg-app)' }}
      />
      <textarea
        placeholder="내용을 입력하세요"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={5}
        className="w-full rounded-lg border text-[14px] px-3 py-2.5 resize-none outline-none mb-3"
        style={{ borderColor: 'var(--color-border-default)', backgroundColor: 'var(--color-bg-app)' }}
      />
      {error && <p className="text-[12px] mb-2" style={{ color: 'var(--color-pochak-error, #ef4444)' }}>{error}</p>}
      <div className="flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="h-9 px-4 rounded-lg border text-[13px] font-medium hover:bg-black/5 transition-colors"
          style={{ borderColor: 'var(--color-border-default)' }}
        >
          취소
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="h-9 px-4 rounded-lg text-white text-[13px] font-medium disabled:opacity-50"
          style={{ backgroundColor: 'var(--color-pochak-primary)' }}
        >
          {saving ? '저장 중...' : '저장'}
        </button>
      </div>
    </div>
  )
}

export default function ClubPostsPage() {
  const { id: clubId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [posts, setPosts] = useState<ClubPost[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'NOTICE' | 'POST'>('NOTICE')
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState<ClubPost | null>(null)
  const [deleting, setDeleting] = useState<number | null>(null)

  useEffect(() => {
    if (!clubId) return
    setLoading(true)
    get<ClubPost[]>(`/api/v1/clubs/${clubId}/posts`).then((data) => {
      setPosts(data ?? [])
      setLoading(false)
    })
  }, [clubId])

  const handleSaved = (post: ClubPost) => {
    setPosts((prev) => {
      const idx = prev.findIndex((p) => p.id === post.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = post
        return next
      }
      return [post, ...prev]
    })
    setShowForm(false)
    setEditTarget(null)
  }

  const handleDelete = async (postId: number) => {
    if (!clubId || !confirm('정말 삭제하시겠습니까?')) return
    setDeleting(postId)
    try {
      await api.delete(`/api/v1/clubs/${clubId}/posts/${postId}`)
      setPosts((prev) => prev.filter((p) => p.id !== postId))
    } catch { /* ignore */ } finally { setDeleting(null) }
  }

  const filtered = posts.filter((p) => p.postType === tab)

  return (
    <div style={{ maxWidth: 720 }}>
      {/* Header */}
      <div className="flex items-center justify-between" style={{ marginBottom: 24 }}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/clubs')}
            className="flex items-center justify-center w-9 h-9 rounded-lg border hover:bg-black/5 transition-colors"
            style={{ borderColor: 'var(--color-border-default)' }}
          >
            <LuArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-[22px] font-bold">클럽 공지사항/게시글 관리</h1>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditTarget(null) }}
          className="flex items-center gap-1.5 h-9 px-4 rounded-lg text-white text-[14px] font-medium transition-colors"
          style={{ backgroundColor: 'var(--color-pochak-primary)' }}
        >
          <LuPlus className="w-4 h-4" />
          작성
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b" style={{ marginBottom: 16, borderColor: 'var(--color-border-subtle)' }}>
        {(['NOTICE', 'POST'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-4 py-2 text-[14px] font-medium transition-colors"
            style={{
              borderBottom: tab === t ? `2px solid var(--color-pochak-primary)` : '2px solid transparent',
              color: tab === t ? 'var(--color-pochak-primary)' : 'var(--color-pochak-text-muted)',
              marginBottom: -1,
            }}
          >
            {POST_TYPE_LABELS[t]}
          </button>
        ))}
      </div>

      {/* New post form */}
      {showForm && !editTarget && clubId && (
        <PostForm
          clubId={clubId}
          initial={{ postType: tab }}
          onSave={handleSaved}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Post list */}
      {loading ? (
        <div style={{ padding: 32, textAlign: 'center', color: 'var(--color-pochak-text-muted)' }}>불러오는 중...</div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-pochak-text-muted)' }}>
          작성된 {POST_TYPE_LABELS[tab]}이 없습니다.
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--color-bg-surface)', borderColor: 'var(--color-border-subtle)' }}>
          {filtered.map((post, i) => (
            <div key={post.id}>
              {editTarget?.id === post.id && clubId ? (
                <div style={{ padding: 16 }}>
                  <PostForm
                    clubId={clubId}
                    initial={post}
                    onSave={handleSaved}
                    onCancel={() => setEditTarget(null)}
                  />
                </div>
              ) : (
                <div
                  style={{
                    padding: '16px 20px',
                    borderBottom: i < filtered.length - 1 ? '1px solid var(--color-border-subtle)' : 'none',
                    opacity: deleting === post.id ? 0.5 : 1,
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
                        {post.pinned && (
                          <LuPin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--color-pochak-primary)' }} />
                        )}
                        <p className="text-[15px] font-semibold truncate">{post.title}</p>
                      </div>
                      <p className="text-[13px] line-clamp-2" style={{ color: 'var(--color-pochak-text-muted)' }}>
                        {post.content}
                      </p>
                      <p className="text-[12px] mt-1.5" style={{ color: 'var(--color-pochak-text-muted)' }}>
                        {formatDate(post.createdAt)} · 조회 {post.viewCount}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => setEditTarget(post)}
                        className="p-1.5 rounded hover:bg-black/5 transition-colors"
                        title="수정"
                      >
                        <LuPencil className="w-4 h-4" style={{ color: 'var(--color-pochak-text-muted)' }} />
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        disabled={deleting === post.id}
                        className="p-1.5 rounded hover:bg-red-50 transition-colors"
                        title="삭제"
                      >
                        <LuTrash2 className="w-4 h-4" style={{ color: 'var(--color-pochak-error, #ef4444)' }} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
