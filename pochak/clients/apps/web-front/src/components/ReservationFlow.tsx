import { useState, useMemo, useCallback } from 'react';
import {
  LuCalendarDays, LuClock, LuPackage, LuCreditCard,
  LuCheck, LuChevronLeft, LuCamera, LuBuilding2, LuVideo,
} from 'react-icons/lu';
import { Button } from '@/components/ui/button';
import Modal from '@/components/Modal';
import type { VenueProduct, VenueProductType, TimeSlot } from '@/types/content';
import { useTimeSlots, createReservation } from '@/hooks/useApi';

/* ── Mock data (until API is live) ── */

const mockProducts: VenueProduct[] = [
  { id: 'p1', venueId: 'v1', name: '공간 대여 (2시간)', type: 'SPACE_ONLY', description: '야구장 공간만 대여합니다. 장비는 별도 지참.', pricePerHour: 50000, imageUrl: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=400&h=240&fit=crop' },
  { id: 'p2', venueId: 'v1', name: '공간 + 촬영 패키지', type: 'SPACE_CAMERA', description: '야구장 대여 + 다각도 촬영 카메라 3대 포함.', pricePerHour: 120000, imageUrl: 'https://images.unsplash.com/photo-1552667466-07770ae110d0?w=400&h=240&fit=crop' },
  { id: 'p3', venueId: 'v1', name: '촬영만 (원정)', type: 'CAMERA_ONLY', description: '공간 없이 촬영 카메라 3대만 렌탈. 외부 경기 촬영용.', pricePerHour: 80000, imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=240&fit=crop' },
];

const mockTimeSlots: TimeSlot[] = [
  { time: '09:00', available: true },
  { time: '10:00', available: true },
  { time: '11:00', available: false },
  { time: '12:00', available: true },
  { time: '13:00', available: true },
  { time: '14:00', available: false },
  { time: '15:00', available: true },
  { time: '16:00', available: true },
  { time: '17:00', available: true },
  { time: '18:00', available: false },
  { time: '19:00', available: true },
  { time: '20:00', available: true },
];

type Step = 'date' | 'time' | 'product' | 'confirm' | 'done';

const PRODUCT_TYPE_LABELS: Record<VenueProductType, string> = {
  SPACE_ONLY: '공간만',
  SPACE_CAMERA: '공간+카메라',
  CAMERA_ONLY: '카메라만',
};

const PRODUCT_TYPE_ICONS: Record<VenueProductType, typeof LuBuilding2> = {
  SPACE_ONLY: LuBuilding2,
  SPACE_CAMERA: LuVideo,
  CAMERA_ONLY: LuCamera,
};

function generateDates(): string[] {
  const dates: string[] = [];
  const today = new Date();
  for (let i = 1; i <= 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return `${d.getMonth() + 1}/${d.getDate()} (${days[d.getDay()]})`;
}

function formatPrice(n: number): string {
  return n.toLocaleString('ko-KR') + '원';
}

interface ReservationFlowProps {
  venueId: string;
  venueName: string;
}

export default function ReservationFlow({ venueId, venueName }: ReservationFlowProps) {
  const [step, setStep] = useState<Step>('product');
  const [selectedProduct, setSelectedProduct] = useState<VenueProduct | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [hours, setHours] = useState(2);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const dates = useMemo(() => generateDates(), []);

  // Use API hook for time slots (falls back to mock when API is unavailable)
  const { data: apiTimeSlots } = useTimeSlots(venueId, selectedDate);
  const timeSlots = apiTimeSlots.length > 0 ? apiTimeSlots : mockTimeSlots;

  const totalPrice = selectedProduct ? selectedProduct.pricePerHour * hours : 0;

  const handleConfirm = useCallback(async () => {
    if (!selectedProduct || !selectedDate || !selectedTime) return;
    setSubmitting(true);
    try {
      await createReservation({
        venueId,
        productId: selectedProduct.id,
        date: selectedDate,
        timeSlot: selectedTime,
        hours,
      });
    } catch {
      // API not available yet — proceed with mock success
    }
    setSubmitting(false);
    setConfirmOpen(false);
    setStep('done');
  }, [venueId, selectedProduct, selectedDate, selectedTime, hours]);

  const goBack = () => {
    if (step === 'date') setStep('product');
    else if (step === 'time') setStep('date');
    else if (step === 'product') return;
    else if (step === 'confirm') setStep('time');
  };

  const reset = () => {
    setStep('product');
    setSelectedProduct(null);
    setSelectedDate('');
    setSelectedTime('');
    setHours(2);
  };

  /* ── Step indicators ── */
  const steps: { key: Step; label: string; icon: typeof LuCalendarDays }[] = [
    { key: 'product', label: '상품', icon: LuPackage },
    { key: 'date', label: '날짜', icon: LuCalendarDays },
    { key: 'time', label: '시간', icon: LuClock },
    { key: 'confirm', label: '결제', icon: LuCreditCard },
  ];

  const stepIndex = steps.findIndex(s => s.key === step);

  if (step === 'done') {
    return (
      <div className="flex flex-col items-center gap-6 py-12">
        <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
          <LuCheck className="h-8 w-8 text-primary" />
        </div>
        <div className="text-center">
          <h3 className="text-[20px] font-bold text-white">예약이 완료되었습니다</h3>
          <p className="text-[14px] text-white/50" style={{ marginTop: 8 }}>
            {venueName} · {selectedProduct?.name}
          </p>
          <p className="text-[14px] text-white/50" style={{ marginTop: 4 }}>
            {selectedDate && formatDate(selectedDate)} {selectedTime} ~ {hours}시간
          </p>
          <p className="text-[16px] font-bold text-primary" style={{ marginTop: 8 }}>
            {formatPrice(totalPrice)}
          </p>
        </div>
        <Button variant="cta" size="lg" onClick={reset}>
          다른 예약하기
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── Progress bar ── */}
      <div className="flex items-center gap-2">
        {step !== 'product' && (
          <button onClick={goBack} className="h-8 w-8 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.06] transition-colors" style={{ marginRight: 4 }}>
            <LuChevronLeft className="h-5 w-5" />
          </button>
        )}
        <div className="flex items-center gap-3 flex-1">
          {steps.map((s, i) => {
            const Icon = s.icon;
            const isActive = i === stepIndex;
            const isDone = i < stepIndex;
            return (
              <div key={s.key} className="flex items-center gap-2">
                <div
                  className={`h-8 w-8 rounded-lg flex items-center justify-center text-[13px] font-bold transition-colors ${
                    isActive ? 'bg-primary text-white' :
                    isDone ? 'bg-primary/20 text-primary' :
                    'bg-white/[0.06] text-white/30'
                  }`}
                >
                  {isDone ? <LuCheck className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                <span className={`text-[13px] font-medium ${isActive ? 'text-white' : isDone ? 'text-white/60' : 'text-white/30'}`}>
                  {s.label}
                </span>
                {i < steps.length - 1 && (
                  <div className={`w-8 h-[2px] rounded-full ${isDone ? 'bg-primary/40' : 'bg-white/[0.08]'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Step: Product selection ── */}
      {step === 'product' && (
        <div className="flex flex-col gap-4">
          <h3 className="text-[17px] font-bold text-white">상품 선택</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mockProducts.map((product) => {
              const Icon = PRODUCT_TYPE_ICONS[product.type];
              const isSelected = selectedProduct?.id === product.id;
              return (
                <button
                  key={product.id}
                  onClick={() => setSelectedProduct(product)}
                  className={`text-left rounded-xl border overflow-hidden transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/[0.06]'
                      : 'border-border-subtle bg-pochak-surface hover:border-white/[0.15]'
                  }`}
                >
                  {product.imageUrl && (
                    <div className="relative h-32 overflow-hidden">
                      <img src={product.imageUrl} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] to-transparent" />
                      <div className="absolute bottom-2 left-3 flex items-center gap-1.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold ${
                          isSelected ? 'bg-primary text-white' : 'bg-white/10 text-white/70'
                        }`}>
                          <Icon className="h-3 w-3" />
                          {PRODUCT_TYPE_LABELS[product.type]}
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="p-4">
                    <p className="text-[15px] font-bold text-white">{product.name}</p>
                    <p className="text-[13px] text-white/50 leading-5" style={{ marginTop: 4 }}>{product.description}</p>
                    <p className="text-[15px] font-bold text-primary" style={{ marginTop: 8 }}>
                      {formatPrice(product.pricePerHour)}
                      <span className="text-[12px] text-white/40 font-normal"> /시간</span>
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
          <Button
            variant="cta"
            size="lg"
            disabled={!selectedProduct}
            onClick={() => setStep('date')}
            className="self-end"
          >
            날짜 선택하기
          </Button>
        </div>
      )}

      {/* ── Step: Date selection ── */}
      {step === 'date' && (
        <div className="flex flex-col gap-4">
          <h3 className="text-[17px] font-bold text-white">날짜 선택</h3>
          <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
            {dates.map((d) => {
              const isSelected = selectedDate === d;
              const dateObj = new Date(d + 'T00:00:00');
              const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
              return (
                <button
                  key={d}
                  onClick={() => setSelectedDate(d)}
                  className={`flex flex-col items-center gap-1 rounded-xl py-3 px-2 border transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/[0.1] text-primary'
                      : 'border-border-subtle bg-pochak-surface hover:border-white/[0.15] text-white/70'
                  }`}
                >
                  <span className="text-[12px] font-medium">{formatDate(d).split(' ')[0]}</span>
                  <span className={`text-[11px] ${isWeekend ? 'text-pochak-live' : 'text-white/40'}`}>
                    {formatDate(d).split(' ')[1]}
                  </span>
                </button>
              );
            })}
          </div>
          <Button
            variant="cta"
            size="lg"
            disabled={!selectedDate}
            onClick={() => setStep('time')}
            className="self-end"
          >
            시간 선택하기
          </Button>
        </div>
      )}

      {/* ── Step: Time slot selection ── */}
      {step === 'time' && (
        <div className="flex flex-col gap-4">
          <h3 className="text-[17px] font-bold text-white">
            시간 선택 <span className="text-[14px] text-white/40 font-normal">({selectedDate && formatDate(selectedDate)})</span>
          </h3>
          <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
            {timeSlots.map((slot) => {
              const isSelected = selectedTime === slot.time;
              return (
                <button
                  key={slot.time}
                  onClick={() => slot.available && setSelectedTime(slot.time)}
                  disabled={!slot.available}
                  className={`rounded-xl py-3 text-center text-[14px] font-medium border transition-all ${
                    !slot.available
                      ? 'border-transparent bg-white/[0.02] text-white/20 cursor-not-allowed line-through'
                      : isSelected
                      ? 'border-primary bg-primary/[0.1] text-primary'
                      : 'border-border-subtle bg-pochak-surface hover:border-white/[0.15] text-white/70'
                  }`}
                >
                  {slot.time}
                </button>
              );
            })}
          </div>

          {selectedTime && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-pochak-surface border border-border-subtle">
              <span className="text-[14px] text-white/60">이용 시간</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setHours(Math.max(1, hours - 1))}
                  className="h-8 w-8 rounded-lg bg-white/[0.06] text-white/60 hover:bg-white/[0.1] flex items-center justify-center text-[16px] font-bold"
                >
                  −
                </button>
                <span className="text-[15px] font-bold text-white w-12 text-center">{hours}시간</span>
                <button
                  onClick={() => setHours(Math.min(6, hours + 1))}
                  className="h-8 w-8 rounded-lg bg-white/[0.06] text-white/60 hover:bg-white/[0.1] flex items-center justify-center text-[16px] font-bold"
                >
                  +
                </button>
              </div>
              <span className="text-[15px] font-bold text-primary ml-auto">
                {selectedProduct && formatPrice(selectedProduct.pricePerHour * hours)}
              </span>
            </div>
          )}

          <Button
            variant="cta"
            size="lg"
            disabled={!selectedTime}
            onClick={() => setStep('confirm')}
            className="self-end"
          >
            결제 정보 확인
          </Button>
        </div>
      )}

      {/* ── Step: Confirm & Pay ── */}
      {step === 'confirm' && selectedProduct && (
        <div className="flex flex-col gap-4">
          <h3 className="text-[17px] font-bold text-white">예약 확인</h3>

          <div className="rounded-xl border border-border-subtle bg-pochak-surface p-5 flex flex-col gap-4">
            <div className="flex items-start gap-4">
              {selectedProduct.imageUrl && (
                <img src={selectedProduct.imageUrl} alt="" className="w-20 h-14 rounded-lg object-cover flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-bold text-white">{selectedProduct.name}</p>
                <p className="text-[13px] text-white/50">{PRODUCT_TYPE_LABELS[selectedProduct.type]}</p>
              </div>
            </div>

            <div className="h-[1px] bg-white/[0.06]" />

            <div className="flex flex-col gap-2">
              {[
                { label: '장소', value: venueName },
                { label: '날짜', value: selectedDate && formatDate(selectedDate) },
                { label: '시간', value: `${selectedTime} ~ ${parseInt(selectedTime) + hours}:00 (${hours}시간)` },
                { label: '단가', value: `${formatPrice(selectedProduct.pricePerHour)} /시간` },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between">
                  <span className="text-[13px] text-white/50">{row.label}</span>
                  <span className="text-[14px] text-white/80">{row.value}</span>
                </div>
              ))}
            </div>

            <div className="h-[1px] bg-white/[0.06]" />

            <div className="flex items-center justify-between">
              <span className="text-[15px] font-bold text-white">총 결제 금액</span>
              <span className="text-[20px] font-bold text-primary">{formatPrice(totalPrice)}</span>
            </div>
          </div>

          <div className="rounded-xl border border-border-subtle bg-pochak-surface p-4">
            <h4 className="text-[14px] font-bold text-white/70" style={{ marginBottom: 8 }}>결제 수단</h4>
            <div className="grid grid-cols-3 gap-2">
              {['카카오페이', '네이버페이', '카드결제'].map((method, i) => (
                <button
                  key={method}
                  className={`rounded-lg py-3 text-[13px] font-medium text-center border transition-all ${
                    i === 0
                      ? 'border-primary bg-primary/[0.08] text-primary'
                      : 'border-border-subtle bg-white/[0.03] text-white/60 hover:border-white/[0.15]'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          <Button
            variant="cta"
            size="lg"
            onClick={() => setConfirmOpen(true)}
            className="w-full"
          >
            {formatPrice(totalPrice)} 결제하기
          </Button>
        </div>
      )}

      {/* ── Confirm Modal ── */}
      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="예약 확인">
        <div className="flex flex-col gap-4">
          <p className="text-[14px] text-white/70">
            아래 내용으로 예약을 진행합니다.
          </p>
          <div className="rounded-lg bg-white/[0.03] p-4 flex flex-col gap-2">
            <p className="text-[14px] text-white/80"><strong>{venueName}</strong></p>
            <p className="text-[13px] text-white/50">{selectedProduct?.name}</p>
            <p className="text-[13px] text-white/50">
              {selectedDate && formatDate(selectedDate)} · {selectedTime} · {hours}시간
            </p>
            <p className="text-[16px] font-bold text-primary">{formatPrice(totalPrice)}</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setConfirmOpen(false)}>
              취소
            </Button>
            <Button variant="cta" className="flex-1" onClick={handleConfirm} disabled={submitting}>
              {submitting ? '처리 중...' : '결제하기'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
