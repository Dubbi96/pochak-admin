import { useEffect, useState } from 'react'
import {
  LuPlus, LuSearch, LuPackage, LuCamera, LuUsers, LuClock,
  LuHistory, LuPencil, LuTrash2,
} from 'react-icons/lu'
import {
  fetchProducts, toggleProductActive, deleteProduct,
  PRODUCT_TYPE_LABELS,
  type ProductListItem, type ProductType,
} from '@/lib/products'
import ProductCreateDialog from '@/components/ProductCreateDialog'
import PriceHistoryDialog from '@/components/PriceHistoryDialog'

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductListItem[]>([])
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<ProductType | 'all'>('all')
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [priceHistoryTarget, setPriceHistoryTarget] = useState<{ venueId: string; productId: string; name: string } | null>(null)

  const loadProducts = () => {
    fetchProducts().then((data) => {
      setProducts(data)
      setLoading(false)
    })
  }

  useEffect(() => { loadProducts() }, [])

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.venueName.toLowerCase().includes(search.toLowerCase())
    const matchType = typeFilter === 'all' || p.type === typeFilter
    return matchSearch && matchType
  })

  const handleToggle = async (product: ProductListItem) => {
    const prev = product.isActive
    setProducts((ps) => ps.map((p) => p.id === product.id ? { ...p, isActive: !prev } : p))
    const result = await toggleProductActive(product.venueId, product.id, !prev)
    if (!result) {
      setProducts((ps) => ps.map((p) => p.id === product.id ? { ...p, isActive: prev } : p))
    }
  }

  const handleDelete = async (product: ProductListItem) => {
    if (!window.confirm(`"${product.name}" 상품을 삭제하시겠습니까?`)) return
    const ok = await deleteProduct(product.venueId, product.id)
    if (ok) {
      setProducts((ps) => ps.filter((p) => p.id !== product.id))
    }
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('ko-KR').format(price) + '원'

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between" style={{ marginBottom: 24 }}>
        <h1 className="text-[22px] font-bold">상품 관리</h1>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center rounded-lg text-white text-[14px] font-medium"
          style={{ height: 40, padding: '0 16px', gap: 6, backgroundColor: 'var(--color-pochak-primary)' }}
        >
          <LuPlus className="w-4 h-4" /> 상품 등록
        </button>
      </div>

      {/* Search + Filter */}
      <div className="flex items-center" style={{ marginBottom: 20, gap: 12 }}>
        <div
          className="flex items-center rounded-lg border flex-1"
          style={{ backgroundColor: 'var(--color-bg-surface)', borderColor: 'var(--color-border-subtle)' }}
        >
          <LuSearch className="w-4 h-4 flex-shrink-0" style={{ marginLeft: 14, color: 'var(--color-pochak-text-muted)' }} />
          <input
            type="text"
            placeholder="상품명 또는 시설명으로 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 h-10 text-[14px] outline-none bg-transparent"
            style={{ paddingLeft: 10, paddingRight: 14 }}
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as ProductType | 'all')}
          className="rounded-lg border text-[14px] outline-none"
          style={{
            height: 40,
            padding: '0 12px',
            backgroundColor: 'var(--color-bg-surface)',
            borderColor: 'var(--color-border-subtle)',
          }}
        >
          <option value="all">전체 유형</option>
          <option value="space">공간</option>
          <option value="space_camera">공간+카메라</option>
          <option value="camera">카메라</option>
        </select>
      </div>

      {/* Content */}
      {loading ? (
        <EmptyState text="불러오는 중..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          text={products.length === 0 ? '등록된 상품이 없습니다. 상품을 등록해주세요.' : '검색 결과가 없습니다.'}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onToggle={() => handleToggle(product)}
              onDelete={() => handleDelete(product)}
              onPriceHistory={() => setPriceHistoryTarget({ venueId: product.venueId, productId: product.id, name: product.name })}
              formatPrice={formatPrice}
            />
          ))}
        </div>
      )}

      {/* Create Dialog */}
      {createOpen && (
        <ProductCreateDialog
          onClose={() => setCreateOpen(false)}
          onCreated={() => {
            setCreateOpen(false)
            loadProducts()
          }}
        />
      )}

      {/* Price History Dialog */}
      {priceHistoryTarget && (
        <PriceHistoryDialog
          venueId={priceHistoryTarget.venueId}
          productId={priceHistoryTarget.productId}
          productName={priceHistoryTarget.name}
          onClose={() => setPriceHistoryTarget(null)}
        />
      )}
    </div>
  )
}

function ProductCard({
  product,
  onToggle,
  onDelete,
  onPriceHistory,
  formatPrice,
}: {
  product: ProductListItem
  onToggle: () => void
  onDelete: () => void
  onPriceHistory: () => void
  formatPrice: (n: number) => string
}) {
  return (
    <div
      className="rounded-xl border"
      style={{
        padding: 20,
        backgroundColor: 'var(--color-bg-surface)',
        borderColor: 'var(--color-border-subtle)',
      }}
    >
      <div className="flex items-start justify-between" style={{ marginBottom: 14 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="flex items-center" style={{ gap: 8, marginBottom: 4 }}>
            <h3 className="text-[15px] font-semibold truncate">{product.name}</h3>
            <TypeBadge type={product.type} />
          </div>
          <p className="text-[13px]" style={{ color: 'var(--color-pochak-text-secondary)' }}>
            {product.venueName}
          </p>
        </div>

        <div className="flex items-center flex-shrink-0" style={{ gap: 8 }}>
          {/* Toggle */}
          <button
            onClick={onToggle}
            className="relative rounded-full transition-colors"
            style={{
              width: 44,
              height: 24,
              backgroundColor: product.isActive ? 'var(--color-pochak-primary)' : '#ccc',
              flexShrink: 0,
            }}
            title={product.isActive ? '활성 — 클릭하여 비활성화' : '비활성 — 클릭하여 활성화'}
          >
            <span
              className="absolute top-[2px] rounded-full bg-white transition-[left]"
              style={{
                width: 20,
                height: 20,
                left: product.isActive ? 22 : 2,
              }}
            />
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex flex-wrap items-center text-[13px]" style={{ gap: 20, color: 'var(--color-pochak-text-muted)' }}>
        <div className="flex items-center" style={{ gap: 5 }}>
          <LuClock className="w-3.5 h-3.5" />
          <span>시간당 {formatPrice(product.hourlyPrice)}</span>
        </div>
        <div className="flex items-center" style={{ gap: 5 }}>
          <LuPackage className="w-3.5 h-3.5" />
          <span>일 {formatPrice(product.dailyPrice)}</span>
        </div>
        <div className="flex items-center" style={{ gap: 5 }}>
          <LuUsers className="w-3.5 h-3.5" />
          <span>최대 {product.maxCapacity}명</span>
        </div>
        {product.includedCameras > 0 && (
          <div className="flex items-center" style={{ gap: 5 }}>
            <LuCamera className="w-3.5 h-3.5" />
            <span>카메라 {product.includedCameras}대</span>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center" style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--color-border-subtle)', gap: 8 }}>
        <ActionButton icon={LuPencil} label="수정" onClick={() => {}} />
        <ActionButton icon={LuHistory} label="가격 이력" onClick={onPriceHistory} />
        <ActionButton icon={LuTrash2} label="삭제" onClick={onDelete} danger />
      </div>
    </div>
  )
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  onClick: () => void
  danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center rounded-md text-[13px] transition-colors hover:bg-black/5"
      style={{
        height: 32,
        padding: '0 10px',
        gap: 5,
        color: danger ? 'var(--color-pochak-error)' : 'var(--color-pochak-text-secondary)',
      }}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  )
}

function TypeBadge({ type }: { type: ProductType }) {
  return (
    <span
      className="text-[11px] font-medium rounded-full flex-shrink-0"
      style={{
        padding: '2px 8px',
        backgroundColor: 'rgba(16, 185, 92, 0.08)',
        color: 'var(--color-pochak-primary)',
      }}
    >
      {PRODUCT_TYPE_LABELS[type]}
    </span>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <div
      className="rounded-xl border"
      style={{
        padding: 32,
        backgroundColor: 'var(--color-bg-surface)',
        borderColor: 'var(--color-border-subtle)',
        textAlign: 'center',
      }}
    >
      <p className="text-[14px]" style={{ color: 'var(--color-pochak-text-muted)' }}>{text}</p>
    </div>
  )
}
