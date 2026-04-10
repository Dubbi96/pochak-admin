import { useEffect, useState } from 'react'
import { LuPlus, LuSearch, LuMapPin, LuCamera } from 'react-icons/lu'
import { fetchVenues, type VenueListItem } from '@/lib/venues'

const VENUE_TYPE_LABELS: Record<string, string> = {
  INDOOR: '실내',
  OUTDOOR: '야외',
  SEMI_INDOOR: '반실내',
}

export default function VenuesPage() {
  const [venues, setVenues] = useState<VenueListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchVenues().then((data) => {
      setVenues(data)
      setLoading(false)
    })
  }, [])

  const filtered = venues.filter((v) =>
    v.name.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div>
      <div className="flex items-center justify-between" style={{ marginBottom: 24 }}>
        <h1 className="text-[22px] font-bold">시설 관리</h1>
        <button
          className="flex items-center rounded-lg text-white text-[14px] font-medium transition-colors"
          style={{ height: 40, padding: '0 16px', gap: 6, backgroundColor: 'var(--color-pochak-primary)' }}
        >
          <LuPlus className="w-4 h-4" /> 시설 등록
        </button>
      </div>

      <div className="flex items-center rounded-lg border" style={{ marginBottom: 20, backgroundColor: 'var(--color-bg-surface)', borderColor: 'var(--color-border-subtle)' }}>
        <LuSearch className="w-4 h-4 flex-shrink-0" style={{ marginLeft: 14, color: 'var(--color-pochak-text-muted)' }} />
        <input
          type="text"
          placeholder="시설명으로 검색"
          className="flex-1 h-10 text-[14px] outline-none bg-transparent"
          style={{ paddingLeft: 10, paddingRight: 14 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" style={{ gap: 16 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border" style={{ padding: 20, backgroundColor: 'var(--color-bg-surface)', borderColor: 'var(--color-border-subtle)' }}>
              <div className="h-5 w-40 rounded" style={{ backgroundColor: 'var(--color-border-default)', marginBottom: 12 }} />
              <div className="h-4 w-full rounded" style={{ backgroundColor: 'var(--color-border-subtle)' }} />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border" style={{ padding: 32, backgroundColor: 'var(--color-bg-surface)', borderColor: 'var(--color-border-subtle)', textAlign: 'center' }}>
          <p className="text-[14px]" style={{ color: 'var(--color-pochak-text-muted)' }}>
            {search ? '검색 결과가 없습니다.' : '등록된 시설이 없습니다. 시설을 등록해주세요.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" style={{ gap: 16 }}>
          {filtered.map((venue) => (
            <div
              key={venue.id}
              className="rounded-xl border hover:shadow-md transition-shadow cursor-pointer"
              style={{ padding: 20, backgroundColor: 'var(--color-bg-surface)', borderColor: 'var(--color-border-subtle)' }}
            >
              <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
                <span className="text-[15px] font-semibold">{venue.name}</span>
                <span
                  className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
                  style={{
                    backgroundColor: venue.isActive ? 'rgba(16,185,92,0.1)' : 'rgba(107,114,128,0.1)',
                    color: venue.isActive ? 'var(--color-pochak-primary)' : 'var(--color-pochak-text-muted)',
                  }}
                >
                  {venue.isActive ? '운영 중' : '비활성'}
                </span>
              </div>

              {venue.venueType && (
                <span
                  className="inline-flex items-center rounded px-2 py-0.5 text-[12px]"
                  style={{ backgroundColor: 'var(--color-bg-app)', color: 'var(--color-pochak-text-secondary)', marginBottom: 10 }}
                >
                  {VENUE_TYPE_LABELS[venue.venueType] ?? venue.venueType}
                </span>
              )}

              {venue.address && (
                <div className="flex items-center gap-1.5" style={{ marginBottom: 8 }}>
                  <LuMapPin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--color-pochak-text-muted)' }} />
                  <span className="text-[13px] truncate" style={{ color: 'var(--color-pochak-text-secondary)' }}>{venue.address}</span>
                </div>
              )}

              <div className="flex items-center gap-1.5">
                <LuCamera className="w-3.5 h-3.5" style={{ color: 'var(--color-pochak-text-muted)' }} />
                <span className="text-[13px]" style={{ color: 'var(--color-pochak-text-secondary)' }}>카메라 {venue.cameraCount}대</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
