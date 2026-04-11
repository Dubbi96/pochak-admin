import { useParams, Link } from 'react-router-dom';
import { LuCheck } from 'react-icons/lu';
import { Button } from '@/components/ui/button';
import HScrollRow from '@/components/HScrollRow';

interface Product {
  id: number;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  yearlyDiscount: number;
  imageUrl: string;
  features: string[];
}

const products: Product[] = [
  {
    id: 1,
    name: '포착 프리미엄 월간 이용권',
    description: '모든 라이브 경기와 VOD를 무제한으로 시청할 수 있는 프리미엄 구독권입니다. 고화질 스트리밍과 다시보기를 언제 어디서나 즐기세요.',
    monthlyPrice: 9900,
    yearlyPrice: 99000,
    yearlyDiscount: 17,
    imageUrl: 'https://images.unsplash.com/photo-1461896836934-bd45ba8fcf9b?w=800&h=450&fit=crop',
    features: [
      '모든 라이브 경기 무제한 시청',
      'VOD 및 하이라이트 무제한 시청',
      '최대 4K 고화질 스트리밍',
      '동시접속 최대 2대',
      '클립 무제한 생성',
      '광고 없는 시청 환경',
    ],
  },
  {
    id: 2,
    name: '포착 연간 이용권',
    description: '12개월 프리미엄 이용권을 할인된 가격에 만나보세요. 연간 결제 시 2개월 무료 혜택을 드립니다.',
    monthlyPrice: 8250,
    yearlyPrice: 99000,
    yearlyDiscount: 17,
    imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=450&fit=crop',
    features: [
      '월간 이용권의 모든 혜택 포함',
      '연간 결제 시 2개월 무료',
      '가족 공유 최대 4명',
      '오프라인 다운로드 지원',
      '프리미엄 고객 전용 이벤트',
    ],
  },
  {
    id: 3,
    name: '응원 기프트 카드 5만원권',
    description: '소중한 분에게 스포츠 시청의 즐거움을 선물하세요. 모든 스토어 상품에 사용 가능합니다.',
    monthlyPrice: 50000,
    yearlyPrice: 50000,
    yearlyDiscount: 0,
    imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&h=450&fit=crop',
    features: [
      '모든 스토어 상품 결제 가능',
      '유효기간 1년',
      '잔액 환불 가능',
      '메시지 카드 첨부 가능',
    ],
  },
  {
    id: 4,
    name: '포착 로고 머플러 타월',
    description: '경기장에서 응원할 때 필수! 공식 로고 머플러 타월입니다.',
    monthlyPrice: 25000,
    yearlyPrice: 25000,
    yearlyDiscount: 0,
    imageUrl: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&h=450&fit=crop',
    features: [
      '고급 면 100% 소재',
      '공식 포착 로고 자수',
      '사이즈: 150cm x 20cm',
      '세탁 가능',
    ],
  },
  {
    id: 5,
    name: '포착 한정판 유니폼',
    description: '시즌 한정 디자인의 공식 유니폼입니다.',
    monthlyPrice: 89000,
    yearlyPrice: 89000,
    yearlyDiscount: 0,
    imageUrl: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&h=450&fit=crop',
    features: [
      '시즌 한정 디자인',
      '통기성 우수한 기능성 원단',
      '사이즈: S / M / L / XL',
      '공식 인증 홀로그램 포함',
    ],
  },
  {
    id: 6,
    name: '응원 기프트 카드 1만원권',
    description: '부담 없이 선물하는 스포츠 기프트 카드.',
    monthlyPrice: 10000,
    yearlyPrice: 10000,
    yearlyDiscount: 0,
    imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&h=450&fit=crop',
    features: [
      '모든 스토어 상품 결제 가능',
      '유효기간 1년',
      '잔액 환불 가능',
    ],
  },
];

function formatPrice(price: number) {
  return price.toLocaleString('ko-KR') + '원';
}

export default function StoreDetailPage() {
  const { id } = useParams();
  const product = products.find((p) => p.id === Number(id));

  if (!product) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-[15px] text-muted-foreground">상품을 찾을 수 없습니다.</p>
      </div>
    );
  }

  const relatedProducts = products.filter((p) => p.id !== product.id);

  return (
    <div className="py-6 max-w-[860px]">
      {/* Product Image */}
      <div className="rounded-2xl overflow-hidden border border-border-subtle">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full aspect-video object-cover"
        />
      </div>

      {/* Product Info */}
      <div className="mt-6 flex flex-col gap-4">
        <h1 className="text-[22px] font-bold text-foreground">{product.name}</h1>
        <p className="text-[15px] text-muted-foreground leading-relaxed">
          {product.description}
        </p>

        {/* Price */}
        <div className="flex flex-col gap-2 mt-2 p-5 rounded-lg bg-white/[0.03] border border-border-subtle">
          <div className="flex items-baseline gap-3">
            <span className="text-[13px] text-muted-foreground">월</span>
            <span className="text-[20px] font-bold text-foreground">
              {formatPrice(product.monthlyPrice)}
            </span>
          </div>
          {product.yearlyDiscount > 0 && (
            <div className="flex items-baseline gap-3">
              <span className="text-[13px] text-muted-foreground">연</span>
              <span className="text-[20px] font-bold text-foreground">
                {formatPrice(product.yearlyPrice)}
              </span>
              <span className="text-[13px] font-semibold text-primary">
                {product.yearlyDiscount}% 할인
              </span>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="flex flex-col gap-2.5 mt-2">
          {product.features.map((feature) => (
            <div key={feature} className="flex items-center gap-2.5">
              <LuCheck className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="text-[14px] text-foreground">{feature}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Button
          variant="outline"
          className="mt-4 h-12 text-[15px] font-semibold border-white/[0.15] hover:border-white/[0.3] hover:bg-white/[0.04]"
        >
          구매하기
        </Button>
      </div>

      {/* Related Products */}
      <section className="mt-12">
        <h2 className="text-[16px] font-bold text-foreground mb-4">다른 상품</h2>
        <HScrollRow>
          {relatedProducts.map((p) => (
            <Link
              key={p.id}
              to={`/store/${p.id}`}
              className="flex-shrink-0 w-[240px] rounded-lg border border-border-subtle bg-pochak-surface overflow-hidden hover:border-white/[0.18] transition-all duration-200"
            >
              <img
                src={p.imageUrl}
                alt={p.name}
                className="w-full aspect-video object-cover"
              />
              <div className="p-3 flex flex-col gap-1">
                <h3 className="text-[14px] font-semibold text-foreground truncate">
                  {p.name}
                </h3>
                <p className="text-[14px] font-bold text-primary">
                  {formatPrice(p.monthlyPrice)}
                </p>
              </div>
            </Link>
          ))}
        </HScrollRow>
      </section>
    </div>
  );
}
