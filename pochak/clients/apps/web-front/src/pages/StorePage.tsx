import { useState } from 'react';
import { Link } from 'react-router-dom';
import FilterChip from '@/components/FilterChip';
import { Button } from '@/components/ui/button';
import { GridSkeleton } from '@/components/Loading';
import { useProducts } from '@/hooks/useApi';

type Category = '전체' | '이용권' | '기프트' | '굿즈';
const categories: Category[] = ['전체', '이용권', '기프트', '굿즈'];

interface Product {
  id: string | number;
  name: string;
  price: number;
  description: string;
  category?: string;
  productType?: string;
  imageUrl?: string;
}

function formatPrice(price: number) {
  return price.toLocaleString('ko-KR') + '원';
}

export default function StorePage() {
  const [selected, setSelected] = useState<Category>('전체');
  const { data: apiProducts, loading, error } = useProducts(
    selected !== '전체' ? selected : undefined,
  );

  const products = (apiProducts as Product[]) || [];
  const filtered =
    selected === '전체'
      ? products
      : products.filter(
          (p) => p.category === selected || p.productType === selected,
        );

  return (
    <div className="py-6">
      <h1 className="text-[28px] font-bold text-foreground mb-5">스토어</h1>

      {/* Category filters */}
      <div className="flex items-center gap-0 flex-wrap mb-6 border-b border-white/[0.06]">
        {categories.map((cat) => (
          <FilterChip
            key={cat}
            label={cat}
            selected={selected === cat}
            onClick={() => setSelected(cat)}
          />
        ))}
      </div>

      {/* Loading */}
      {loading && <GridSkeleton count={8} />}

      {/* Error */}
      {error && !loading && (
        <div className="text-center py-16">
          <p className="text-pochak-text-secondary text-[15px]">
            상품을 불러오는 중 오류가 발생했습니다.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 text-primary text-[14px] hover:underline"
          >
            다시 시도
          </button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-pochak-text-secondary text-[15px]">
            등록된 상품이 없습니다.
          </p>
        </div>
      )}

      {/* Product grid */}
      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((product) => (
            <div
              key={product.id}
              className="rounded-2xl bg-pochak-surface hover:border-white/[0.22] hover:shadow-lg transition-all duration-200 flex flex-col overflow-hidden"
            >
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="aspect-video w-full object-cover rounded-lg"
                  loading="lazy"
                />
              ) : (
                <div className="aspect-video w-full bg-gradient-to-br from-secondary to-card flex items-center justify-center rounded-lg">
                  <span className="text-primary text-4xl font-black opacity-20">P</span>
                </div>
              )}
              <div className="flex flex-col flex-1 p-4 gap-2">
                <h3 className="text-[15px] font-semibold text-foreground leading-snug">
                  {product.name}
                </h3>
                <p className="text-primary font-bold text-[16px]">
                  {formatPrice(product.price)}
                </p>
                <p className="text-[14px] text-muted-foreground leading-relaxed flex-1">
                  {product.description}
                </p>
                <Link to={`/store/${product.id}`} className="mt-2">
                  <Button
                    variant="outline"
                    className="w-full border-border-default hover:border-white/[0.24] hover:bg-white/[0.04]"
                  >
                    구매하기
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
