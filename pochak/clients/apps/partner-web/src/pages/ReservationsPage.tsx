import { useState } from 'react'

const tabs = ['전체', '대기', '확정', '완료', '취소'] as const

export default function ReservationsPage() {
  const [activeTab, setActiveTab] = useState<string>('전체')

  return (
    <div>
      <h1 className="text-[22px] font-bold" style={{ marginBottom: 24 }}>예약 관리</h1>

      <div className="flex items-center border-b" style={{ gap: 0, borderColor: 'var(--color-border-subtle)', marginBottom: 20 }}>
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="relative text-[14px] font-medium transition-colors"
            style={{
              padding: '10px 16px',
              color: activeTab === tab ? 'var(--color-pochak-primary)' : 'var(--color-pochak-text-muted)',
              fontWeight: activeTab === tab ? 600 : 400,
            }}
          >
            {tab}
            {activeTab === tab && (
              <span
                className="absolute left-4 right-4 bottom-0 rounded-full"
                style={{ height: 2, backgroundColor: 'var(--color-pochak-primary)' }}
              />
            )}
          </button>
        ))}
      </div>

      <div className="rounded-xl border" style={{ padding: 32, backgroundColor: 'var(--color-bg-surface)', borderColor: 'var(--color-border-subtle)', textAlign: 'center' }}>
        <p className="text-[14px]" style={{ color: 'var(--color-pochak-text-muted)' }}>
          예약 내역이 없습니다.
        </p>
      </div>
    </div>
  )
}
