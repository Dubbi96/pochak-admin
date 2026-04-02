import { LuPlus, LuSearch } from 'react-icons/lu'

export default function VenuesPage() {
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
        />
      </div>

      <div className="rounded-xl border" style={{ padding: 32, backgroundColor: 'var(--color-bg-surface)', borderColor: 'var(--color-border-subtle)', textAlign: 'center' }}>
        <p className="text-[14px]" style={{ color: 'var(--color-pochak-text-muted)' }}>
          등록된 시설이 없습니다. 시설을 등록해주세요.
        </p>
      </div>
    </div>
  )
}
