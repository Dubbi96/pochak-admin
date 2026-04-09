import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LuPlus, LuUsers, LuChevronRight, LuSearch } from 'react-icons/lu'
import { get } from '@/lib/api'

interface ClubItem {
  teamId: number
  name: string
  shortName?: string
  logoUrl?: string
  sportName?: string
  memberCount: number
}

export default function ClubManagePage() {
  const navigate = useNavigate()
  const [clubs, setClubs] = useState<ClubItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    get<ClubItem[]>('/api/v1/clubs').then((data) => {
      setClubs(data ?? [])
      setLoading(false)
    })
  }, [])

  const filtered = clubs.filter(
    (c) => !search || c.name.includes(search) || (c.sportName ?? '').includes(search)
  )

  return (
    <div>
      <div className="flex items-center justify-between" style={{ marginBottom: 24 }}>
        <h1 className="text-[22px] font-bold">클럽 관리</h1>
        <button
          className="flex items-center rounded-lg text-white text-[14px] font-medium transition-colors"
          style={{ height: 40, padding: '0 16px', gap: 6, backgroundColor: 'var(--color-pochak-primary)' }}
          onClick={() => navigate('/clubs/new')}
        >
          <LuPlus className="w-4 h-4" /> 클럽 등록
        </button>
      </div>

      <div
        className="flex items-center rounded-lg border"
        style={{ marginBottom: 20, backgroundColor: 'var(--color-bg-surface)', borderColor: 'var(--color-border-subtle)' }}
      >
        <LuSearch className="w-4 h-4 flex-shrink-0" style={{ marginLeft: 14, color: 'var(--color-pochak-text-muted)' }} />
        <input
          type="text"
          placeholder="클럽명으로 검색"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 h-10 text-[14px] outline-none bg-transparent"
          style={{ paddingLeft: 10, paddingRight: 14 }}
        />
      </div>

      {loading && (
        <div className="rounded-xl border" style={{ padding: 32, backgroundColor: 'var(--color-bg-surface)', borderColor: 'var(--color-border-subtle)', textAlign: 'center' }}>
          <p className="text-[14px]" style={{ color: 'var(--color-pochak-text-muted)' }}>불러오는 중...</p>
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="rounded-xl border" style={{ padding: 48, backgroundColor: 'var(--color-bg-surface)', borderColor: 'var(--color-border-subtle)', textAlign: 'center' }}>
          <LuUsers className="w-10 h-10 mx-auto mb-4" style={{ color: 'var(--color-pochak-text-muted)' }} />
          <p className="text-[15px] font-semibold" style={{ color: 'var(--color-pochak-text)' }}>
            {search ? '검색 결과가 없습니다.' : '등록된 클럽이 없습니다.'}
          </p>
          {!search && (
            <>
              <p className="text-[14px] mt-2 mb-6" style={{ color: 'var(--color-pochak-text-muted)' }}>
                클럽을 등록하고 멤버와 활동을 관리하세요.
              </p>
              <button
                onClick={() => navigate('/clubs/new')}
                className="inline-flex items-center rounded-lg text-white text-[14px] font-medium transition-colors"
                style={{ height: 40, padding: '0 20px', gap: 6, backgroundColor: 'var(--color-pochak-primary)' }}
              >
                <LuPlus className="w-4 h-4" /> 첫 번째 클럽 등록
              </button>
            </>
          )}
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--color-bg-surface)', borderColor: 'var(--color-border-subtle)' }}>
          {filtered.map((club, i) => (
            <button
              key={club.teamId}
              onClick={() => navigate(`/clubs/${club.teamId}`)}
              className="w-full flex items-center gap-4 text-left transition-colors hover:bg-black/5"
              style={{
                padding: '16px 20px',
                borderBottom: i < filtered.length - 1 ? '1px solid var(--color-border-subtle)' : 'none',
              }}
            >
              {/* Club avatar */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-[18px] font-bold text-white"
                style={{ backgroundColor: 'var(--color-pochak-primary)', opacity: 0.85 }}
              >
                {club.logoUrl ? (
                  <img src={club.logoUrl} alt="" className="w-full h-full rounded-xl object-cover" />
                ) : (
                  (club.shortName?.charAt(0) ?? club.name.charAt(0))
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-semibold" style={{ color: 'var(--color-pochak-text)' }}>
                  {club.name}
                </p>
                <p className="text-[13px] mt-0.5" style={{ color: 'var(--color-pochak-text-muted)' }}>
                  {club.sportName ?? '–'} · 멤버 {club.memberCount}명
                </p>
              </div>

              <LuChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-pochak-text-muted)' }} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
