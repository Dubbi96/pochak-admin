import { useState } from 'react';
import TabBar from '@/components/TabBar';
import SportFilterTags from '@/components/SportFilterTags';
import { Gift } from 'lucide-react';
import type { ProductData } from '@/components/ProductCard';

const pochakSubscriptionProducts: ProductData[] = [];
const pochakSportProducts: ProductData[] = [];
const pochakCompetitionProducts: ProductData[] = [];

type StoreTab = 'all' | 'affiliate' | 'subscription' | 'sport' | 'competition';
const tabItems: { key: StoreTab; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'affiliate', label: '제휴' },
  { key: 'subscription', label: '구독' },
  { key: 'sport', label: '종목' },
  { key: 'competition', label: '대회' },
];

const sportOptions = ['전체', '축구', '야구', '배구', '핸드볼', '농구', '기타'];

// ── Affiliate mock products ─────────────────────────────────────────────────
const affiliateProducts: ProductData[] = [
  {
    id: 'aff-1', type: 'subscription', name: '제휴 프리미엄 시청권',
    badge: '제휴', badgeColor: '#FF6D00',
    description: '제휴사 할인이 적용된 올인원 시청 상품입니다.',
    price: '월 7,900원', originalPrice: '월 9,900원', discount: '-20%',
  },
  {
    id: 'aff-2', type: 'subscription', name: '가족 무제한 시청권',
    badge: '제휴', badgeColor: '#FF6D00',
    description: '가족 전원이 함께 사용할 수 있는 제휴 시청권입니다.',
    price: '월 12,900원', originalPrice: '월 16,900원', discount: '-24%',
  },
];

// ── Store product card (matches PDF design) ──────────────────────────────────
function StoreProductCard({ product }: { product: ProductData }) {
  return (
    <div className="rounded-xl border border-[#4D4D4D] bg-[#262626] overflow-hidden hover:border-[#00CC33] transition-colors flex flex-col">
      {/* Thumbnail area with pochak logo */}
      <div
        className="aspect-[4/3] flex items-center justify-center"
        style={{ backgroundColor: product.posterColor ?? '#1A3A1A' }}
      >
        <div className="w-16 h-16 rounded-xl bg-[#00CC33]/20 flex items-center justify-center">
          <span className="text-[#00CC33] font-black text-2xl">P</span>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-[14px] font-bold text-white leading-snug line-clamp-2">{product.name}</h3>
        <p className="text-[12px] text-[#A6A6A6] mt-1 line-clamp-2">{product.description}</p>

        <div className="mt-auto pt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-[15px] font-bold text-white">{product.price}</span>
            {product.originalPrice && (
              <span className="text-[12px] text-[#606060] line-through">{product.originalPrice}</span>
            )}
            {product.discount && (
              <span className="text-[12px] font-bold text-[#00CC33] bg-[#00CC33]/10 px-1.5 py-0.5 rounded">
                {product.discount}
              </span>
            )}
          </div>

          <button
            className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#00CC33] text-[#1A1A1A] text-[13px] font-bold hover:bg-[#00E676] transition-colors"
            onClick={() => alert('구매/선물 기능은 준비 중입니다.')}
          >
            <Gift className="h-3.5 w-3.5" />
            구매/선물
          </button>
        </div>
      </div>
    </div>
  );
}

export default function StorePage() {
  const [activeTab, setActiveTab] = useState<StoreTab>('all');
  const [selectedSport, setSelectedSport] = useState('전체');

  const filteredSportProducts = pochakSportProducts.filter(
    (p) => selectedSport === '전체' || p.sport === selectedSport,
  );

  const filteredCompProducts = pochakCompetitionProducts.filter(
    (p) => selectedSport === '전체' || p.sport === selectedSport,
  );

  // "전체" tab shows all products combined
  const allProducts: ProductData[] = [
    ...pochakSubscriptionProducts,
    ...affiliateProducts,
    ...pochakSportProducts,
    ...pochakCompetitionProducts,
  ];

  const renderProductGrid = (products: ProductData[]) => {
    if (products.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-[#A6A6A6]">
          <p className="text-base">해당 상품이 없습니다.</p>
        </div>
      );
    }
    return (
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {products.map((product) => (
          <StoreProductCard key={product.id} product={product} />
        ))}
      </div>
    );
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">구독/이용권 구매</h1>

      <TabBar tabs={tabItems} activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="mt-6">
        {/* ── 전체 ─────────────────────────── */}
        {activeTab === 'all' && renderProductGrid(allProducts)}

        {/* ── 제휴 ─────────────────────────── */}
        {activeTab === 'affiliate' && renderProductGrid(affiliateProducts)}

        {/* ── 구독 ─────────────────────────── */}
        {activeTab === 'subscription' && renderProductGrid(pochakSubscriptionProducts)}

        {/* ── 종목 ─────────────────────────── */}
        {activeTab === 'sport' && (
          <div className="space-y-6">
            <SportFilterTags
              sports={sportOptions}
              selected={selectedSport}
              onSelect={setSelectedSport}
            />
            {renderProductGrid(filteredSportProducts)}
          </div>
        )}

        {/* ── 대회 ─────────────────────────── */}
        {activeTab === 'competition' && (
          <div className="space-y-6">
            <SportFilterTags
              sports={sportOptions}
              selected={selectedSport}
              onSelect={setSelectedSport}
            />
            {renderProductGrid(filteredCompProducts)}
          </div>
        )}
      </div>
    </div>
  );
}
