import { useEffect, useState } from 'react'
import { LuX } from 'react-icons/lu'
import { fetchPriceHistory, type PriceHistoryEntry } from '../lib/products'

interface Props {
  venueId: string
  productId: string
  productName: string
  onClose: () => void
}

export default function PriceHistoryDialog({ venueId, productId, productName, onClose }: Props) {
  const [history, setHistory] = useState<PriceHistoryEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPriceHistory(venueId, productId).then((data) => {
      setHistory(data)
      setLoading(false)
    })
  }, [venueId, productId])

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('ko-KR').format(price) + '원'

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }) +
      ' ' + d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)', padding: 16 }}
    >
      <div
        className="rounded-2xl w-full"
        style={{
          maxWidth: 520,
          backgroundColor: 'var(--color-bg-surface)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between border-b"
          style={{ padding: '16px 24px', borderColor: 'var(--color-border-subtle)' }}
        >
          <div>
            <h2 className="text-[17px] font-bold">가격 이력</h2>
            <p className="text-[13px]" style={{ color: 'var(--color-pochak-text-secondary)', marginTop: 2 }}>
              {productName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-black/5"
          >
            <LuX className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '16px 24px', maxHeight: 400, overflowY: 'auto' }}>
          {loading ? (
            <p className="text-[14px]" style={{ color: 'var(--color-pochak-text-muted)', textAlign: 'center', padding: 24 }}>
              불러오는 중...
            </p>
          ) : history.length === 0 ? (
            <p className="text-[14px]" style={{ color: 'var(--color-pochak-text-muted)', textAlign: 'center', padding: 24 }}>
              가격 변경 이력이 없습니다.
            </p>
          ) : (
            <table className="w-full text-[13px]">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                  <th className="text-left font-medium" style={{ padding: '8px 0', color: 'var(--color-pochak-text-secondary)' }}>변경일시</th>
                  <th className="text-right font-medium" style={{ padding: '8px 0', color: 'var(--color-pochak-text-secondary)' }}>시간당</th>
                  <th className="text-right font-medium" style={{ padding: '8px 0', color: 'var(--color-pochak-text-secondary)' }}>일</th>
                </tr>
              </thead>
              <tbody>
                {history.map((entry, idx) => (
                  <tr
                    key={entry.id}
                    style={{
                      borderBottom: idx < history.length - 1 ? '1px solid var(--color-border-subtle)' : undefined,
                    }}
                  >
                    <td style={{ padding: '10px 0' }}>{formatDate(entry.changedAt)}</td>
                    <td className="text-right" style={{ padding: '10px 0' }}>{formatPrice(entry.hourlyPrice)}</td>
                    <td className="text-right" style={{ padding: '10px 0' }}>{formatPrice(entry.dailyPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-end border-t"
          style={{ padding: '12px 24px', borderColor: 'var(--color-border-subtle)' }}
        >
          <button
            onClick={onClose}
            className="rounded-lg border text-[14px] font-medium hover:bg-black/5"
            style={{ height: 36, padding: '0 16px', borderColor: 'var(--color-border-default)' }}
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  )
}
