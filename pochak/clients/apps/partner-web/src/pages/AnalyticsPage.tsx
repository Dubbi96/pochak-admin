export default function AnalyticsPage() {
  return (
    <div>
      <h1 className="text-[22px] font-bold" style={{ marginBottom: 24 }}>통계</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 16 }}>
        <div className="rounded-xl border" style={{ padding: 24, backgroundColor: 'var(--color-bg-surface)', borderColor: 'var(--color-border-subtle)' }}>
          <h2 className="text-[16px] font-semibold" style={{ marginBottom: 16 }}>매출 현황</h2>
          <p className="text-[14px]" style={{ color: 'var(--color-pochak-text-muted)' }}>
            API 연동 후 매출 차트가 표시됩니다.
          </p>
        </div>
        <div className="rounded-xl border" style={{ padding: 24, backgroundColor: 'var(--color-bg-surface)', borderColor: 'var(--color-border-subtle)' }}>
          <h2 className="text-[16px] font-semibold" style={{ marginBottom: 16 }}>예약 추이</h2>
          <p className="text-[14px]" style={{ color: 'var(--color-pochak-text-muted)' }}>
            API 연동 후 예약 차트가 표시됩니다.
          </p>
        </div>
      </div>
    </div>
  )
}
