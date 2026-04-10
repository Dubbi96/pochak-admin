import { useEffect, useState } from 'react'
import {
  fetchReservations,
  approveReservation,
  rejectReservation,
  RESERVATION_STATUS_LABELS,
  type Reservation,
  type ReservationStatus,
} from '@/lib/reservations'

const tabs: { label: string; status?: ReservationStatus }[] = [
  { label: '전체' },
  { label: '대기', status: 'PENDING' },
  { label: '확정', status: 'CONFIRMED' },
  { label: '완료', status: 'COMPLETED' },
  { label: '취소', status: 'CANCELLED' },
]

const STATUS_COLORS: Record<ReservationStatus, { bg: string; text: string }> = {
  PENDING: { bg: 'rgba(245,158,11,0.1)', text: '#f59e0b' },
  CONFIRMED: { bg: 'rgba(16,185,92,0.1)', text: 'var(--color-pochak-primary)' },
  COMPLETED: { bg: 'rgba(99,102,241,0.1)', text: '#6366f1' },
  CANCELLED: { bg: 'rgba(239,68,68,0.1)', text: '#ef4444' },
}

function formatDateTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function ReservationsPage() {
  const [activeTab, setActiveTab] = useState(0)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<number | null>(null)

  const loadReservations = (tabIndex: number) => {
    setLoading(true)
    fetchReservations(tabs[tabIndex].status).then((data) => {
      setReservations(data)
      setLoading(false)
    })
  }

  useEffect(() => {
    loadReservations(activeTab)
  }, [activeTab])

  const handleTabChange = (idx: number) => {
    setActiveTab(idx)
  }

  const handleApprove = async (id: number) => {
    setActionLoading(id)
    await approveReservation(id)
    setActionLoading(null)
    loadReservations(activeTab)
  }

  const handleReject = async (id: number) => {
    setActionLoading(id)
    await rejectReservation(id)
    setActionLoading(null)
    loadReservations(activeTab)
  }

  return (
    <div>
      <h1 className="text-[22px] font-bold" style={{ marginBottom: 24 }}>예약 관리</h1>

      <div className="flex items-center border-b" style={{ borderColor: 'var(--color-border-subtle)', marginBottom: 20 }}>
        {tabs.map((tab, idx) => (
          <button
            key={tab.label}
            onClick={() => handleTabChange(idx)}
            className="relative text-[14px] font-medium transition-colors"
            style={{
              padding: '10px 16px',
              color: activeTab === idx ? 'var(--color-pochak-primary)' : 'var(--color-pochak-text-muted)',
              fontWeight: activeTab === idx ? 600 : 400,
            }}
          >
            {tab.label}
            {activeTab === idx && (
              <span
                className="absolute left-4 right-4 bottom-0 rounded-full"
                style={{ height: 2, backgroundColor: 'var(--color-pochak-primary)' }}
              />
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border" style={{ padding: 16, backgroundColor: 'var(--color-bg-surface)', borderColor: 'var(--color-border-subtle)' }}>
              <div className="h-4 w-48 rounded" style={{ backgroundColor: 'var(--color-border-default)' }} />
            </div>
          ))}
        </div>
      ) : reservations.length === 0 ? (
        <div className="rounded-xl border" style={{ padding: 32, backgroundColor: 'var(--color-bg-surface)', borderColor: 'var(--color-border-subtle)', textAlign: 'center' }}>
          <p className="text-[14px]" style={{ color: 'var(--color-pochak-text-muted)' }}>
            예약 내역이 없습니다.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {reservations.map((r) => {
            const colors = STATUS_COLORS[r.status]
            const isPending = r.status === 'PENDING'
            const isActing = actionLoading === r.id
            return (
              <div
                key={r.id}
                className="rounded-xl border"
                style={{ padding: 16, backgroundColor: 'var(--color-bg-surface)', borderColor: 'var(--color-border-subtle)' }}
              >
                <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
                  <div className="flex items-center gap-3">
                    <span className="text-[13px] font-medium" style={{ color: 'var(--color-pochak-text-muted)' }}>
                      #{r.id}
                    </span>
                    <span
                      className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
                      style={{ backgroundColor: colors.bg, color: colors.text }}
                    >
                      {RESERVATION_STATUS_LABELS[r.status]}
                    </span>
                    <span className="text-[12px]" style={{ color: 'var(--color-pochak-text-muted)' }}>
                      {r.reservationType}
                    </span>
                  </div>
                  <span className="text-[13px] font-semibold">
                    {r.pointCost?.toLocaleString()}P
                  </span>
                </div>

                <div className="text-[13px]" style={{ color: 'var(--color-pochak-text-secondary)', marginBottom: isPending ? 12 : 0 }}>
                  {formatDateTime(r.startTime)} ~ {formatDateTime(r.endTime)}
                  {r.description && (
                    <span style={{ marginLeft: 8, color: 'var(--color-pochak-text-muted)' }}>· {r.description}</span>
                  )}
                </div>

                {isPending && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => handleApprove(r.id)}
                      disabled={isActing}
                      className="rounded-lg text-white text-[13px] font-medium transition-colors disabled:opacity-50"
                      style={{ height: 32, padding: '0 14px', backgroundColor: 'var(--color-pochak-primary)' }}
                    >
                      {isActing ? '처리 중...' : '승인'}
                    </button>
                    <button
                      onClick={() => handleReject(r.id)}
                      disabled={isActing}
                      className="rounded-lg text-[13px] font-medium transition-colors disabled:opacity-50 border"
                      style={{ height: 32, padding: '0 14px', borderColor: 'var(--color-border-default)', color: 'var(--color-pochak-text-secondary)' }}
                    >
                      거절
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
