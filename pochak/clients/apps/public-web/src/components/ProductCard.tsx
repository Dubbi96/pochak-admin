import { Gift } from 'lucide-react';

export type ProductType = 'subscription' | 'sport' | 'competition';

export interface ProductData {
  id: string;
  type: ProductType;
  name: string;
  description: string;
  price: string;
  originalPrice?: string;
  discount?: string;
  badge: string;
  badgeColor: string;
  sport?: string;
  sportIcon?: string;
  posterColor?: string;
  period?: string;
}

export default function ProductCard({ product }: { product: ProductData }) {
  return (
    <div className="rounded-xl border border-[#4D4D4D] bg-[#262626] p-5 hover:border-[#00CC33] transition-colors">
      <div className="flex items-start justify-between mb-4">
        <span
          className="text-xs font-bold px-2.5 py-1 rounded-lg text-white"
          style={{ backgroundColor: product.badgeColor }}
        >
          {product.badge}
        </span>
        {product.posterColor && (
          <div
            className="w-12 h-16 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: product.posterColor }}
          >
            <span className="text-white text-[10px] font-bold text-center">
              {product.sportIcon ?? product.sport ?? ''}
            </span>
          </div>
        )}
      </div>

      <h3 className="text-base font-bold text-white">{product.name}</h3>
      <p className="text-sm text-[#A6A6A6] mt-1 line-clamp-2">{product.description}</p>

      {product.period && (
        <p className="text-xs text-[#A6A6A6] mt-2">{product.period}</p>
      )}

      <div className="flex items-baseline gap-2 mt-3">
        <span className="text-lg font-bold text-white">{product.price}</span>
        {product.originalPrice && (
          <span className="text-sm text-[#606060] line-through">{product.originalPrice}</span>
        )}
        {product.discount && (
          <span className="text-sm font-bold text-[#00CC33]">{product.discount}</span>
        )}
      </div>

      <div className="flex items-center gap-2 mt-4">
        <button
          className="flex-1 px-4 py-2.5 rounded-lg bg-[#00CC33] text-[#1A1A1A] text-sm font-bold hover:bg-[#00E676] transition-colors"
          onClick={() => alert('구매 페이지로 이동합니다.')}
        >
          {product.type === 'subscription' ? '구독하기' : '구매하기'}
        </button>
        {product.type !== 'subscription' && (
          <button
            className="px-3 py-2.5 rounded-lg border border-[#4D4D4D] text-[#A6A6A6] hover:text-white hover:border-[#606060] transition-colors"
            onClick={() => alert('선물 기능은 준비 중입니다.')}
          >
            <Gift className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
