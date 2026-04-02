import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '@/hooks/useApi';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { GridSkeleton } from '@/components/Loading';
import ProfileSidebar from '@/components/ProfileSidebar';

const tabs = ['전체', '제휴', '구독', '종목', '대회'] as const;
const sportSubFilters = ['전체', '축구', '야구', '배구', '핸드볼', '농구', '기타'];

interface SubscriptionProduct {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  discount: number;
  type?: string;
}

export default function SubscriptionPage() {
  const [activeTab, setActiveTab] = useState<string>('전체');
  const [selectedSport, setSelectedSport] = useState('전체');
  const { data: apiProducts, loading, error } = useProducts(activeTab !== '전체' ? activeTab : undefined);

  const products = (Array.isArray(apiProducts) ? apiProducts : []) as SubscriptionProduct[];
  const filtered = activeTab === '전체' ? products : products.filter((p) => p.type === activeTab);

  return (
    <div className="flex gap-8">
      <ProfileSidebar />
      <div className="flex-1 min-w-0 py-6">
      <h1 className="text-2xl font-bold text-foreground mb-6">구독/이용권 구매</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          {tabs.map((tab) => (
            <TabsTrigger key={tab} value={tab}>{tab}</TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent key={tab} value={tab}>
            {(tab === '종목' || tab === '대회') && (
              <div className="flex gap-2 mb-6 flex-wrap">
                {sportSubFilters.map((s) => (
                  <Button key={s} size="sm" variant={selectedSport === s ? 'default' : 'outline'} className="rounded-full" onClick={() => setSelectedSport(s)}>
                    {s}
                  </Button>
                ))}
              </div>
            )}

            {loading && <GridSkeleton count={8} />}

            {error && !loading && (
              <div className="text-center py-12">
                <p className="text-pochak-text-secondary text-[15px]">상품을 불러오는 중 오류가 발생했습니다.</p>
                <button onClick={() => window.location.reload()} className="mt-2 text-primary text-[14px] hover:underline">다시 시도</button>
              </div>
            )}

            {!loading && !error && filtered.length === 0 && (
              <div className="text-center py-12">
                <p className="text-pochak-text-secondary text-[15px]">등록된 상품이 없습니다.</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              {filtered.map((product) => (
                <Card key={product.id} className="overflow-hidden group">
                  {/* Product image placeholder */}
                  <div className="aspect-[4/3] bg-gradient-to-br from-secondary to-card flex items-center justify-center">
                    <span className="text-primary text-4xl font-black opacity-20">P</span>
                  </div>
                  <CardContent className="p-4">
                    <p className="text-[15px] font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">{product.name}</p>
                    <p className="text-[14px] text-pochak-text-tertiary mt-1 line-clamp-2">{product.description}</p>
                    <div className="mt-3">
                      <p className="text-[16px] font-bold text-foreground">월 {product.monthlyPrice.toLocaleString()}원</p>
                      <p className="text-[13px] text-pochak-text-tertiary">
                        연 {product.yearlyPrice.toLocaleString()}원
                        <span className="text-primary ml-1">-{product.discount}%</span>
                      </p>
                    </div>
                    <Link to={`/checkout?product=${encodeURIComponent(product.name)}&price=${product.monthlyPrice.toLocaleString()}`}>
                      <Button variant="outline" className="w-full mt-3 border-border-default hover:border-white/[0.24] hover:bg-white/[0.04]">
                        구매/선물
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
      </div>
    </div>
  );
}
