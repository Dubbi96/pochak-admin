import { useEffect, useState } from 'react'
import { LuMapPin, LuPackage, LuCalendarCheck, LuTrendingUp, LuUsers, LuFileText, LuSettings, LuArrowRight, LuUserCheck } from 'react-icons/lu'
import { Link } from 'react-router-dom'
import { get } from '@/lib/api'

const stats = [
  { label: '등록 시설', value: '—', icon: LuMapPin, path: '/venues' },
  { label: '활성 상품', value: '—', icon: LuPackage, path: '/products' },
  { label: '이번 달 예약', value: '—', icon: LuCalendarCheck, path: '/reservations' },
  { label: '이번 달 매출', value: '—', icon: LuTrendingUp, path: '/analytics' },
]

interface ClubItem {
  teamId: number
  name: string
  logoUrl?: string
}

interface ClubStats {
  memberCount: number
  pendingCount: number
  recentPostCount: number
  status: 'active' | 'suspended'
}

function ClubStatsWidget() {
  const [clubs, setClubs] = useState<ClubItem[]>([])
  const [clubStats, setClubStats] = useState<ClubStats | null>(null)
  const [primaryClub, setPrimaryClub] = useState<ClubItem | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    get<ClubItem[]>('/api/v1/clubs').then((data) => {
      if (!data || data.length === 0) { setLoading(false); return }
      const club = data[0]
      setClubs(data)
      setPrimaryClub(club)
      get<ClubStats>(`/api/v1/clubs/${club.teamId}/stats`).then((s) => {
        setClubStats(s)
        setLoading(false)
      })
    })
  }, [])

  if (loading) {
    return (
      <div className="rounded-xl border" style={{ padding: 24, backgroundColor: 'var(--color-bg-surface)', borderColor: 'var(--color-border-subtle)' }}>
        <div className="h-4 w-24 rounded" style={{ backgroundColor: 'var(--color-border-default)', marginBottom: 16 }} />
        <div className="h-20 rounded" style={{ backgroundColor: 'var(--color-border-subtle)' }} />
      </div>
    )
  }

  if (!primaryClub) return null

  const statusActive = clubStats?.status !== 'suspended'

  return (
    <div className="rounded-xl border" style={{ padding: 24, backgroundColor: 'var(--color-bg-surface)', borderColor: 'var(--color-border-subtle)', marginBottom: 24 }}>
      {/* Header */}
      <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
        <div className="flex items-center gap-3">
          <h2 className="text-[16px] font-semibold">클럽 현황</h2>
          <span
            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[12px] font-medium"
            style={{
              backgroundColor: statusActive ? 'rgba(16,185,92,0.1)' : 'rgba(239,68,68,0.1)',
              color: statusActive ? 'var(--color-pochak-primary)' : '#ef4444',
            }}
          >
            {statusActive ? '활성' : '정지'}
          </span>
        </div>
        {clubs.length > 1 && (
          <span className="text-[13px]" style={{ color: 'var(--color-pochak-text-muted)' }}>
            총 {clubs.length}개 클럽
          </span>
        )}
      </div>

      <p className="text-[14px] font-medium" style={{ color: 'var(--color-pochak-text-secondary)', marginBottom: 16 }}>
        {primaryClub.name}
      </p>

      {/* Stat cards */}
      <div className="grid grid-cols-3" style={{ gap: 12, marginBottom: 20 }}>
        <div className="rounded-lg" style={{ padding: 16, backgroundColor: 'var(--color-bg-app)' }}>
          <div className="flex items-center gap-2" style={{ marginBottom: 8 }}>
            <LuUsers className="w-4 h-4" style={{ color: 'var(--color-pochak-primary)' }} />
            <span className="text-[12px]" style={{ color: 'var(--color-pochak-text-muted)' }}>총 회원</span>
          </div>
          <p className="text-[22px] font-bold">{clubStats?.memberCount?.toLocaleString() ?? '—'}</p>
        </div>

        <div className="rounded-lg" style={{ padding: 16, backgroundColor: 'var(--color-bg-app)' }}>
          <div className="flex items-center gap-2" style={{ marginBottom: 8 }}>
            <LuUserCheck className="w-4 h-4" style={{ color: '#f59e0b' }} />
            <span className="text-[12px]" style={{ color: 'var(--color-pochak-text-muted)' }}>가입 대기</span>
          </div>
          <p className="text-[22px] font-bold">{clubStats?.pendingCount?.toLocaleString() ?? '—'}</p>
        </div>

        <div className="rounded-lg" style={{ padding: 16, backgroundColor: 'var(--color-bg-app)' }}>
          <div className="flex items-center gap-2" style={{ marginBottom: 8 }}>
            <LuFileText className="w-4 h-4" style={{ color: '#6366f1' }} />
            <span className="text-[12px]" style={{ color: 'var(--color-pochak-text-muted)' }}>최근 게시글</span>
          </div>
          <p className="text-[22px] font-bold">{clubStats?.recentPostCount?.toLocaleString() ?? '—'}</p>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-3" style={{ gap: 8 }}>
        {[
          { label: '회원 관리', path: `/clubs/${primaryClub.teamId}/members`, icon: LuUsers },
          { label: '게시글', path: `/clubs/${primaryClub.teamId}/posts`, icon: LuFileText },
          { label: '커스터마이즈', path: `/clubs/${primaryClub.teamId}/customize`, icon: LuSettings },
        ].map(({ label, path, icon: Icon }) => (
          <Link
            key={path}
            to={path}
            className="flex items-center justify-between rounded-lg border hover:shadow-sm transition-all"
            style={{
              padding: '10px 14px',
              borderColor: 'var(--color-border-default)',
              color: 'var(--color-pochak-text-secondary)',
              fontSize: 13,
            }}
          >
            <div className="flex items-center gap-2">
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </div>
            <LuArrowRight className="w-3.5 h-3.5 opacity-40" />
          </Link>
        ))}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-[22px] font-bold" style={{ marginBottom: 24 }}>대시보드</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4" style={{ gap: 16, marginBottom: 32 }}>
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <Link
              key={s.label}
              to={s.path}
              className="rounded-xl border hover:shadow-md transition-shadow"
              style={{
                padding: 20,
                backgroundColor: 'var(--color-bg-surface)',
                borderColor: 'var(--color-border-subtle)',
              }}
            >
              <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
                <span className="text-[13px] font-medium" style={{ color: 'var(--color-pochak-text-secondary)' }}>
                  {s.label}
                </span>
                <Icon className="w-5 h-5" style={{ color: 'var(--color-pochak-primary)' }} />
              </div>
              <p className="text-[28px] font-bold">{s.value}</p>
            </Link>
          )
        })}
      </div>

      <ClubStatsWidget />

      <div className="rounded-xl border" style={{ padding: 24, backgroundColor: 'var(--color-bg-surface)', borderColor: 'var(--color-border-subtle)' }}>
        <h2 className="text-[16px] font-semibold" style={{ marginBottom: 16 }}>최근 예약</h2>
        <p className="text-[14px]" style={{ color: 'var(--color-pochak-text-muted)' }}>
          API 연동 후 최근 예약 목록이 표시됩니다.
        </p>
      </div>
    </div>
  )
}
