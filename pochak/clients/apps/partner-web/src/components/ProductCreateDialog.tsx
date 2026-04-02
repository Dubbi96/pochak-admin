import { useState, useEffect } from 'react'
import { LuX, LuPlus, LuTrash2 } from 'react-icons/lu'
import {
  createProduct, defaultAvailability, PRODUCT_TYPE_LABELS,
  type ProductType, type DayAvailability, type BlockedDate,
} from '../lib/products'
import { get } from '../lib/api'

interface VenueOption {
  id: string
  name: string
}

interface Props {
  onClose: () => void
  onCreated: () => void
}

export default function ProductCreateDialog({ onClose, onCreated }: Props) {
  const [venues, setVenues] = useState<VenueOption[]>([])
  const [venuesLoading, setVenuesLoading] = useState(true)

  // Form fields
  const [venueId, setVenueId] = useState('')
  const [name, setName] = useState('')
  const [type, setType] = useState<ProductType>('space')
  const [hourlyPrice, setHourlyPrice] = useState('')
  const [dailyPrice, setDailyPrice] = useState('')
  const [maxCapacity, setMaxCapacity] = useState('')
  const [includedCameras, setIncludedCameras] = useState('')
  const [availability, setAvailability] = useState<DayAvailability[]>(defaultAvailability())
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([])
  const [newBlockedDate, setNewBlockedDate] = useState('')
  const [newBlockedReason, setNewBlockedReason] = useState('')

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    get<VenueOption[]>('/api/v1/partners/me/venues').then((data) => {
      const list = data ?? []
      setVenues(list)
      if (list.length > 0) setVenueId(list[0].id)
      setVenuesLoading(false)
    })
  }, [])

  const updateAvailability = (index: number, field: keyof DayAvailability, value: string | boolean) => {
    setAvailability((prev) => prev.map((a, i) => (i === index ? { ...a, [field]: value } : a)))
  }

  const addBlockedDate = () => {
    if (!newBlockedDate) return
    if (blockedDates.some((bd) => bd.date === newBlockedDate)) return
    setBlockedDates((prev) => [...prev, { date: newBlockedDate, reason: newBlockedReason || undefined }])
    setNewBlockedDate('')
    setNewBlockedReason('')
  }

  const removeBlockedDate = (date: string) => {
    setBlockedDates((prev) => prev.filter((bd) => bd.date !== date))
  }

  const handleSubmit = async () => {
    setError(null)

    if (!venueId) { setError('시설을 선택해주세요.'); return }
    if (!name.trim()) { setError('상품명을 입력해주세요.'); return }
    if (!hourlyPrice || Number(hourlyPrice) <= 0) { setError('시간당 가격을 입력해주세요.'); return }
    if (!dailyPrice || Number(dailyPrice) <= 0) { setError('일 가격을 입력해주세요.'); return }
    if (!maxCapacity || Number(maxCapacity) <= 0) { setError('최대 수용인원을 입력해주세요.'); return }

    setSaving(true)
    const result = await createProduct({
      venueId,
      name: name.trim(),
      type,
      hourlyPrice: Number(hourlyPrice),
      dailyPrice: Number(dailyPrice),
      maxCapacity: Number(maxCapacity),
      includedCameras: Number(includedCameras) || 0,
      availability,
    })

    if (result) {
      onCreated()
    } else {
      setError('상품 등록에 실패했습니다. 다시 시도해주세요.')
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)', padding: '40px 16px', overflowY: 'auto' }}
    >
      <div
        className="rounded-2xl w-full"
        style={{
          maxWidth: 640,
          backgroundColor: 'var(--color-bg-surface)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between border-b"
          style={{ padding: '16px 24px', borderColor: 'var(--color-border-subtle)' }}
        >
          <h2 className="text-[17px] font-bold">상품 등록</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-black/5"
          >
            <LuX className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Venue selector */}
          <FieldGroup label="시설 선택" required>
            {venuesLoading ? (
              <p className="text-[13px]" style={{ color: 'var(--color-pochak-text-muted)' }}>불러오는 중...</p>
            ) : venues.length === 0 ? (
              <p className="text-[13px]" style={{ color: 'var(--color-pochak-error)' }}>등록된 시설이 없습니다. 먼저 시설을 등록해주세요.</p>
            ) : (
              <select
                value={venueId}
                onChange={(e) => setVenueId(e.target.value)}
                className="w-full rounded-lg border text-[14px] outline-none"
                style={{ height: 40, padding: '0 12px', borderColor: 'var(--color-border-default)' }}
              >
                {venues.map((v) => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            )}
          </FieldGroup>

          {/* Name */}
          <FieldGroup label="상품명" required>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 스튜디오 A 기본 패키지"
              className="w-full rounded-lg border text-[14px] outline-none focus:ring-2 focus:ring-[var(--color-pochak-primary)]/30"
              style={{ height: 40, padding: '0 12px', borderColor: 'var(--color-border-default)' }}
            />
          </FieldGroup>

          {/* Type */}
          <FieldGroup label="상품 유형" required>
            <div className="flex" style={{ gap: 8 }}>
              {(Object.entries(PRODUCT_TYPE_LABELS) as [ProductType, string][]).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setType(key)}
                  className="rounded-lg border text-[14px] font-medium transition-colors"
                  style={{
                    height: 40,
                    padding: '0 16px',
                    borderColor: type === key ? 'var(--color-pochak-primary)' : 'var(--color-border-default)',
                    backgroundColor: type === key ? 'rgba(16, 185, 92, 0.08)' : 'transparent',
                    color: type === key ? 'var(--color-pochak-primary)' : 'var(--color-pochak-text-secondary)',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </FieldGroup>

          {/* Prices */}
          <div className="grid grid-cols-2" style={{ gap: 12 }}>
            <FieldGroup label="시간당 가격 (원)" required>
              <input
                type="number"
                value={hourlyPrice}
                onChange={(e) => setHourlyPrice(e.target.value)}
                placeholder="10000"
                min="0"
                className="w-full rounded-lg border text-[14px] outline-none focus:ring-2 focus:ring-[var(--color-pochak-primary)]/30"
                style={{ height: 40, padding: '0 12px', borderColor: 'var(--color-border-default)' }}
              />
            </FieldGroup>
            <FieldGroup label="일 가격 (원)" required>
              <input
                type="number"
                value={dailyPrice}
                onChange={(e) => setDailyPrice(e.target.value)}
                placeholder="80000"
                min="0"
                className="w-full rounded-lg border text-[14px] outline-none focus:ring-2 focus:ring-[var(--color-pochak-primary)]/30"
                style={{ height: 40, padding: '0 12px', borderColor: 'var(--color-border-default)' }}
              />
            </FieldGroup>
          </div>

          {/* Capacity + Cameras */}
          <div className="grid grid-cols-2" style={{ gap: 12 }}>
            <FieldGroup label="최대 수용인원" required>
              <input
                type="number"
                value={maxCapacity}
                onChange={(e) => setMaxCapacity(e.target.value)}
                placeholder="10"
                min="1"
                className="w-full rounded-lg border text-[14px] outline-none focus:ring-2 focus:ring-[var(--color-pochak-primary)]/30"
                style={{ height: 40, padding: '0 12px', borderColor: 'var(--color-border-default)' }}
              />
            </FieldGroup>
            <FieldGroup label="포함 카메라 수">
              <input
                type="number"
                value={includedCameras}
                onChange={(e) => setIncludedCameras(e.target.value)}
                placeholder="0"
                min="0"
                className="w-full rounded-lg border text-[14px] outline-none focus:ring-2 focus:ring-[var(--color-pochak-primary)]/30"
                style={{ height: 40, padding: '0 12px', borderColor: 'var(--color-border-default)' }}
              />
            </FieldGroup>
          </div>

          {/* Availability */}
          <FieldGroup label="요일별 운영시간">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {availability.map((a, i) => (
                <div key={a.day} className="flex items-center" style={{ gap: 10 }}>
                  <span className="text-[14px] font-medium" style={{ width: 24, textAlign: 'center' }}>{a.day}</span>
                  <label className="flex items-center text-[13px]" style={{ gap: 6, width: 70 }}>
                    <input
                      type="checkbox"
                      checked={!a.closed}
                      onChange={(e) => updateAvailability(i, 'closed', !e.target.checked)}
                      className="rounded"
                      style={{ accentColor: 'var(--color-pochak-primary)' }}
                    />
                    {a.closed ? '휴무' : '영업'}
                  </label>
                  {!a.closed && (
                    <>
                      <input
                        type="time"
                        value={a.open}
                        onChange={(e) => updateAvailability(i, 'open', e.target.value)}
                        className="rounded-lg border text-[13px] outline-none"
                        style={{ height: 34, padding: '0 8px', borderColor: 'var(--color-border-default)' }}
                      />
                      <span className="text-[13px]" style={{ color: 'var(--color-pochak-text-muted)' }}>~</span>
                      <input
                        type="time"
                        value={a.close}
                        onChange={(e) => updateAvailability(i, 'close', e.target.value)}
                        className="rounded-lg border text-[13px] outline-none"
                        style={{ height: 34, padding: '0 8px', borderColor: 'var(--color-border-default)' }}
                      />
                    </>
                  )}
                </div>
              ))}
            </div>
          </FieldGroup>

          {/* Blocked Dates */}
          <FieldGroup label="특정일 비운영">
            <div className="flex items-end" style={{ gap: 8, marginBottom: blockedDates.length > 0 ? 10 : 0 }}>
              <div style={{ flex: 1 }}>
                <label className="text-[12px]" style={{ color: 'var(--color-pochak-text-muted)', marginBottom: 4, display: 'block' }}>날짜</label>
                <input
                  type="date"
                  value={newBlockedDate}
                  onChange={(e) => setNewBlockedDate(e.target.value)}
                  className="w-full rounded-lg border text-[13px] outline-none"
                  style={{ height: 34, padding: '0 8px', borderColor: 'var(--color-border-default)' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label className="text-[12px]" style={{ color: 'var(--color-pochak-text-muted)', marginBottom: 4, display: 'block' }}>사유 (선택)</label>
                <input
                  type="text"
                  value={newBlockedReason}
                  onChange={(e) => setNewBlockedReason(e.target.value)}
                  placeholder="예: 시설 점검"
                  className="w-full rounded-lg border text-[13px] outline-none"
                  style={{ height: 34, padding: '0 8px', borderColor: 'var(--color-border-default)' }}
                />
              </div>
              <button
                onClick={addBlockedDate}
                className="flex items-center justify-center rounded-lg border text-[13px] hover:bg-black/5"
                style={{ height: 34, padding: '0 10px', gap: 4, borderColor: 'var(--color-border-default)', flexShrink: 0 }}
              >
                <LuPlus className="w-3.5 h-3.5" /> 추가
              </button>
            </div>
            {blockedDates.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {blockedDates.map((bd) => (
                  <div
                    key={bd.date}
                    className="flex items-center justify-between rounded-lg"
                    style={{ padding: '6px 10px', backgroundColor: 'var(--color-bg-app)' }}
                  >
                    <span className="text-[13px]">
                      {bd.date}{bd.reason ? ` — ${bd.reason}` : ''}
                    </span>
                    <button
                      onClick={() => removeBlockedDate(bd.date)}
                      className="w-6 h-6 flex items-center justify-center rounded hover:bg-black/10"
                    >
                      <LuTrash2 className="w-3 h-3" style={{ color: 'var(--color-pochak-error)' }} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </FieldGroup>

          {/* Error */}
          {error && (
            <p className="text-[13px] font-medium" style={{ color: 'var(--color-pochak-error)' }}>{error}</p>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-end border-t"
          style={{ padding: '16px 24px', borderColor: 'var(--color-border-subtle)', gap: 8 }}
        >
          <button
            onClick={onClose}
            className="rounded-lg border text-[14px] font-medium hover:bg-black/5"
            style={{ height: 40, padding: '0 20px', borderColor: 'var(--color-border-default)' }}
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="rounded-lg text-white text-[14px] font-medium"
            style={{
              height: 40,
              padding: '0 20px',
              backgroundColor: saving ? 'var(--color-pochak-text-muted)' : 'var(--color-pochak-primary)',
              cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            {saving ? '등록 중...' : '등록'}
          </button>
        </div>
      </div>
    </div>
  )
}

function FieldGroup({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[13px] font-medium" style={{ marginBottom: 6, color: 'var(--color-pochak-text-secondary)' }}>
        {label}{required && <span style={{ color: 'var(--color-pochak-error)', marginLeft: 2 }}>*</span>}
      </label>
      {children}
    </div>
  )
}
