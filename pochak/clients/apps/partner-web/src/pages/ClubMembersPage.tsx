import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { LuArrowLeft, LuSearch, LuUsers, LuUserCheck, LuUserX, LuShield } from 'react-icons/lu'
import { get, api } from '@/lib/api'

interface ClubMember {
  membershipId: number
  userId: number
  nickname: string
  role: string
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED'
  uniformNumber?: number
  joinedAt: string
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: '관리자',
  MANAGER: '매니저',
  COACH: '코치',
  PLAYER: '선수',
  GUARDIAN: '보호자',
  MEMBER: '일반',
}

const ROLE_OPTIONS = ['PLAYER', 'MEMBER', 'MANAGER', 'COACH', 'ADMIN']

export default function ClubMembersPage() {
  const { id: clubId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [members, setMembers] = useState<ClubMember[]>([])
  const [pending, setPending] = useState<ClubMember[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'approved' | 'pending'>('approved')
  const [search, setSearch] = useState('')
  const [actionLoading, setActionLoading] = useState<number | null>(null)

  const fetchMembers = async () => {
    if (!clubId) return
    setLoading(true)
    const all = await get<ClubMember[]>(`/api/v1/clubs/${clubId}/members`)
    if (all) {
      setMembers(all.filter((m) => m.approvalStatus === 'APPROVED'))
      setPending(all.filter((m) => m.approvalStatus === 'PENDING'))
    }
    setLoading(false)
  }

  useEffect(() => { fetchMembers() }, [clubId])

  const handleApprove = async (membershipId: number) => {
    if (!clubId) return
    setActionLoading(membershipId)
    try {
      await api.patch(`/api/v1/clubs/${clubId}/members/${membershipId}/approve`)
      await fetchMembers()
    } catch { /* ignore */ } finally { setActionLoading(null) }
  }

  const handleReject = async (membershipId: number) => {
    if (!clubId) return
    setActionLoading(membershipId)
    try {
      await api.delete(`/api/v1/clubs/${clubId}/members/${membershipId}`)
      setPending((prev) => prev.filter((m) => m.membershipId !== membershipId))
    } catch { /* ignore */ } finally { setActionLoading(null) }
  }

  const handleRoleChange = async (membershipId: number, role: string) => {
    if (!clubId) return
    setActionLoading(membershipId)
    try {
      await api.patch(`/api/v1/clubs/${clubId}/members/${membershipId}/role`, { role })
      setMembers((prev) => prev.map((m) => m.membershipId === membershipId ? { ...m, role } : m))
    } catch { /* ignore */ } finally { setActionLoading(null) }
  }

  const handleRemove = async (membershipId: number) => {
    if (!clubId || !confirm('정말 이 멤버를 강퇴하시겠습니까?')) return
    setActionLoading(membershipId)
    try {
      await api.delete(`/api/v1/clubs/${clubId}/members/${membershipId}`)
      setMembers((prev) => prev.filter((m) => m.membershipId !== membershipId))
    } catch { /* ignore */ } finally { setActionLoading(null) }
  }

  const filteredMembers = members.filter((m) =>
    !search || m.nickname.includes(search)
  )

  return (
    <div style={{ maxWidth: 720 }}>
      {/* Header */}
      <div className="flex items-center gap-3" style={{ marginBottom: 24 }}>
        <button
          onClick={() => navigate('/clubs')}
          className="flex items-center justify-center w-9 h-9 rounded-lg border hover:bg-black/5 transition-colors"
          style={{ borderColor: 'var(--color-border-default)' }}
        >
          <LuArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-[22px] font-bold">클럽 멤버 관리</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4" style={{ marginBottom: 20 }}>
        {[
          { label: '전체 멤버', value: members.length, icon: LuUsers },
          { label: '가입 대기', value: pending.length, icon: LuUserCheck },
        ].map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="rounded-xl border flex items-center gap-3"
            style={{ padding: '16px 20px', backgroundColor: 'var(--color-bg-surface)', borderColor: 'var(--color-border-subtle)' }}
          >
            <Icon className="w-5 h-5" style={{ color: 'var(--color-pochak-primary)' }} />
            <div>
              <p className="text-[13px]" style={{ color: 'var(--color-pochak-text-muted)' }}>{label}</p>
              <p className="text-[20px] font-bold">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border-b" style={{ marginBottom: 16, borderColor: 'var(--color-border-subtle)' }}>
        {(['approved', 'pending'] as const).map((t) => (
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
            {t === 'approved' ? `멤버 (${members.length})` : `대기 (${pending.length})`}
          </button>
        ))}
      </div>

      {/* Search (members only) */}
      {tab === 'approved' && (
        <div
          className="flex items-center rounded-lg border"
          style={{ marginBottom: 12, backgroundColor: 'var(--color-bg-surface)', borderColor: 'var(--color-border-subtle)' }}
        >
          <LuSearch className="w-4 h-4 flex-shrink-0" style={{ marginLeft: 12, color: 'var(--color-pochak-text-muted)' }} />
          <input
            type="text"
            placeholder="닉네임 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 h-10 text-[14px] outline-none bg-transparent"
            style={{ paddingLeft: 8, paddingRight: 12 }}
          />
        </div>
      )}

      {/* Content */}
      <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--color-bg-surface)', borderColor: 'var(--color-border-subtle)' }}>
        {loading ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--color-pochak-text-muted)' }}>불러오는 중...</div>
        ) : tab === 'approved' ? (
          filteredMembers.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--color-pochak-text-muted)' }}>멤버가 없습니다.</div>
          ) : (
            filteredMembers.map((m, i) => (
              <div
                key={m.membershipId}
                className="flex items-center gap-3"
                style={{
                  padding: '14px 20px',
                  borderBottom: i < filteredMembers.length - 1 ? '1px solid var(--color-border-subtle)' : 'none',
                  opacity: actionLoading === m.membershipId ? 0.5 : 1,
                }}
              >
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-[14px] flex-shrink-0"
                  style={{ backgroundColor: 'var(--color-pochak-primary)' }}>
                  {m.nickname.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium truncate">{m.nickname}</p>
                  {m.uniformNumber != null && (
                    <p className="text-[12px]" style={{ color: 'var(--color-pochak-text-muted)' }}>#{m.uniformNumber}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <LuShield className="w-3.5 h-3.5" style={{ color: 'var(--color-pochak-primary)' }} />
                  <select
                    value={m.role}
                    onChange={(e) => handleRoleChange(m.membershipId, e.target.value)}
                    disabled={actionLoading === m.membershipId}
                    className="text-[13px] border rounded px-2 py-1 outline-none"
                    style={{ borderColor: 'var(--color-border-default)', backgroundColor: 'var(--color-bg-app)' }}
                  >
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r} value={r}>{ROLE_LABELS[r] ?? r}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleRemove(m.membershipId)}
                    disabled={actionLoading === m.membershipId}
                    className="p-1.5 rounded hover:bg-red-50 transition-colors"
                    title="강퇴"
                  >
                    <LuUserX className="w-4 h-4" style={{ color: 'var(--color-pochak-error, #ef4444)' }} />
                  </button>
                </div>
              </div>
            ))
          )
        ) : pending.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--color-pochak-text-muted)' }}>
            가입 대기 중인 멤버가 없습니다.
          </div>
        ) : (
          pending.map((m, i) => (
            <div
              key={m.membershipId}
              className="flex items-center gap-3"
              style={{
                padding: '14px 20px',
                borderBottom: i < pending.length - 1 ? '1px solid var(--color-border-subtle)' : 'none',
                opacity: actionLoading === m.membershipId ? 0.5 : 1,
              }}
            >
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-[14px] flex-shrink-0"
                style={{ backgroundColor: 'var(--color-pochak-primary)', opacity: 0.5 }}>
                {m.nickname.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-medium truncate">{m.nickname}</p>
                <p className="text-[12px]" style={{ color: 'var(--color-pochak-text-muted)' }}>
                  가입 신청: {new Date(m.joinedAt).toLocaleDateString('ko-KR')}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleApprove(m.membershipId)}
                  disabled={actionLoading === m.membershipId}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-[13px] font-medium transition-colors"
                  style={{ backgroundColor: 'var(--color-pochak-primary)' }}
                >
                  <LuUserCheck className="w-3.5 h-3.5" />
                  승인
                </button>
                <button
                  onClick={() => handleReject(m.membershipId)}
                  disabled={actionLoading === m.membershipId}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium border transition-colors hover:bg-black/5"
                  style={{ borderColor: 'var(--color-border-default)' }}
                >
                  <LuUserX className="w-3.5 h-3.5" />
                  거절
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
