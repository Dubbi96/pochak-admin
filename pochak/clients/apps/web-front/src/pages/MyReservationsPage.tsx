import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LuCalendarDays, LuClock, LuMapPin,
  LuBuilding2, LuVideo, LuCamera, LuFilter,
} from 'react-icons/lu';
import { Button } from '@/components/ui/button';
import FilterChip from '@/components/FilterChip';
import { useMyReservations } from '@/hooks/useApi';
import type { Reservation, ReservationStatus, VenueProductType } from '@/types/content';

const STATUS_LABELS: Record<ReservationStatus, string> = {
  PENDING: '대기',
  CONFIRMED: '확정',
  CANCELLED: '취소',
  COMPLETED: '완료',
};

const STATUS_COLORS: Record<ReservationStatus, string> = {
  PENDING: 'bg-yellow-500/15 text-yellow-400',
  CONFIRMED: 'bg-primary/15 text-primary',
  CANCELLED: 'bg-white/[0.06] text-white/30',
  COMPLETED: 'bg-white/[0.06] text-white/50',
};

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

/* ── Mock data (until API is live) ── */
const mockReservations: Reservation[] = [
  {
    id: 'r1', venueId: 'v1', venueName: '잠실 유소년 야구장',
    productId: 'p2', productName: '공간 + 촬영 패키지', productType: 'SPACE_CAMERA',
    date: '2026-04-10', timeSlot: '10:00', hours: 2, totalPrice: 240000,
    status: 'CONFIRMED', createdAt: '2026-04-03T09:00:00Z',
  },
  {
    id: 'r2', venueId: 'v2', venueName: '화성 드림파크 풋살 센터',
    productId: 'p1', productName: '공간 대여 (2시간)', productType: 'SPACE_ONLY',
    date: '2026-04-15', timeSlot: '14:00', hours: 2, totalPrice: 100000,
    status: 'PENDING', createdAt: '2026-04-02T15:30:00Z',
  },
  {
    id: 'r3', venueId: 'v1', venueName: '잠실 유소년 야구장',
    productId: 'p3', productName: '촬영만 (원정)', productType: 'CAMERA_ONLY',
    date: '2026-03-28', timeSlot: '09:00', hours: 3, totalPrice: 240000,
    status: 'COMPLETED', createdAt: '2026-03-25T11:00:00Z',
  },
];

const statusFilters: (ReservationStatus | '전체')[] = ['전체', 'CONFIRMED', 'PENDING', 'COMPLETED', 'CANCELLED'];

function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} (${days[d.getDay()]})`;
}

function formatPrice(n: number): string {
  return n.toLocaleString('ko-KR') + '원';
}

export default function MyReservationsPage() {
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | '전체'>('전체');
  const { data: apiReservations } = useMyReservations();

  const reservations = apiReservations.length > 0 ? apiReservations : mockReservations;

  const filtered = statusFilter === '전체'
    ? reservations
    : reservations.filter(r => r.status === statusFilter);

  return (
    <div className="md:px-6 lg:px-8 flex flex-col gap-6">
      {/* ── Page header ── */}
      <div className="flex items-center justify-between">
        <h1 className="text-[24px] font-bold tracking-[-0.04em] text-white">내 예약</h1>
        <Button variant="outline" size="sm" className="gap-1.5">
          <LuFilter className="h-3.5 w-3.5" />
          필터
        </Button>
      </div>

      {/* ── Status filter chips ── */}
      <div className="flex gap-2 flex-wrap">
        {statusFilters.map((f) => (
          <FilterChip
            key={f}
            label={f === '전체' ? '전체' : STATUS_LABELS[f]}
            selected={statusFilter === f}
            onClick={() => setStatusFilter(f)}
          />
        ))}
      </div>

      {/* ── Reservation list ── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16">
          <LuCalendarDays className="h-12 w-12 text-white/15" />
          <p className="text-[15px] text-white/40">예약 내역이 없습니다</p>
          <Link to="/city">
            <Button variant="cta">시설 둘러보기</Button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((reservation) => {
            const Icon = PRODUCT_TYPE_ICONS[reservation.productType];
            return (
              <Link
                key={reservation.id}
                to={`/city/venue/${reservation.venueId}`}
                className="rounded-xl border border-border-subtle bg-pochak-surface p-5 hover:border-white/[0.15] transition-all group"
              >
                <div className="flex items-start justify-between" style={{ marginBottom: 12 }}>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-white/[0.06] flex items-center justify-center">
                      <Icon className="h-4 w-4 text-white/50" />
                    </div>
                    <div>
                      <p className="text-[15px] font-bold text-white group-hover:text-primary transition-colors">
                        {reservation.venueName}
                      </p>
                      <p className="text-[13px] text-white/45">{reservation.productName}</p>
                    </div>
                  </div>
                  <span className={`inline-flex px-2.5 py-1 rounded-md text-[11px] font-bold ${STATUS_COLORS[reservation.status]}`}>
                    {STATUS_LABELS[reservation.status]}
                  </span>
                </div>

                <div className="flex flex-wrap gap-4 text-[13px] text-white/55">
                  <span className="flex items-center gap-1.5">
                    <LuCalendarDays className="h-3.5 w-3.5" />
                    {formatDate(reservation.date)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <LuClock className="h-3.5 w-3.5" />
                    {reservation.timeSlot} ~ {parseInt(reservation.timeSlot) + reservation.hours}:00 ({reservation.hours}시간)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <LuMapPin className="h-3.5 w-3.5" />
                    {PRODUCT_TYPE_LABELS[reservation.productType]}
                  </span>
                </div>

                <div className="flex items-center justify-between" style={{ marginTop: 12 }}>
                  <span className="text-[12px] text-white/30">
                    예약일: {new Date(reservation.createdAt).toLocaleDateString('ko-KR')}
                  </span>
                  <span className="text-[15px] font-bold text-primary">
                    {formatPrice(reservation.totalPrice)}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
