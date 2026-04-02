import { LuMapPin, LuPackage, LuCalendarCheck, LuTrendingUp } from 'react-icons/lu'
import { Link } from 'react-router-dom'

const stats = [
  { label: '등록 시설', value: '—', icon: LuMapPin, path: '/venues' },
  { label: '활성 상품', value: '—', icon: LuPackage, path: '/products' },
  { label: '이번 달 예약', value: '—', icon: LuCalendarCheck, path: '/reservations' },
  { label: '이번 달 매출', value: '—', icon: LuTrendingUp, path: '/analytics' },
]

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

      <div className="rounded-xl border" style={{ padding: 24, backgroundColor: 'var(--color-bg-surface)', borderColor: 'var(--color-border-subtle)' }}>
        <h2 className="text-[16px] font-semibold" style={{ marginBottom: 16 }}>최근 예약</h2>
        <p className="text-[14px]" style={{ color: 'var(--color-pochak-text-muted)' }}>
          API 연동 후 최근 예약 목록이 표시됩니다.
        </p>
      </div>
    </div>
  )
}
