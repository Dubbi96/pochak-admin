import { LuPlus } from 'react-icons/lu'

export default function ProductsPage() {
  return (
    <div>
      <div className="flex items-center justify-between" style={{ marginBottom: 24 }}>
        <h1 className="text-[22px] font-bold">상품 관리</h1>
        <button
          className="flex items-center rounded-lg text-white text-[14px] font-medium"
          style={{ height: 40, padding: '0 16px', gap: 6, backgroundColor: 'var(--color-pochak-primary)' }}
        >
          <LuPlus className="w-4 h-4" /> 상품 등록
        </button>
      </div>

      <div className="rounded-xl border" style={{ padding: 32, backgroundColor: 'var(--color-bg-surface)', borderColor: 'var(--color-border-subtle)', textAlign: 'center' }}>
        <p className="text-[14px]" style={{ color: 'var(--color-pochak-text-muted)' }}>
          등록된 상품이 없습니다.
        </p>
      </div>
    </div>
  )
}
