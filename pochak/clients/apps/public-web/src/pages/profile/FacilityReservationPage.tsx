import { useState } from 'react';
import { Search, MapPin, Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { SubTabChips } from './shared';

/* ── Types ─────────────────────────────────────────────────────── */
type ReservationStatus = 'confirmed' | 'pending' | 'cancelled';

interface Reservation {
  id: string;
  facility: string;
  court: string;
  date: string;
  time: string;
  status: ReservationStatus;
  address: string;
  isPast: boolean;
}

interface AvailableFacility {
  id: string;
  name: string;
  address: string;
  availableTimes: string[];
  sports: string[];
}

/* ── Mock data ─────────────────────────────────────────────────── */
const reservations: Reservation[] = [
  { id: 'r1', facility: '화성드림파크야구장', court: '1구장', date: '2026.01.20', time: '14:00-16:00', status: 'confirmed', address: '경기도 화성시 동탄중앙로 200', isPast: false },
  { id: 'r2', facility: '잠실종합운동장 풋살장', court: 'A코트', date: '2026.01.22', time: '18:00-20:00', status: 'pending', address: '서울특별시 송파구 올림픽로 25', isPast: false },
  { id: 'r3', facility: '수원월드컵경기장 보조구장', court: '2구장', date: '2026.01.25', time: '10:00-12:00', status: 'confirmed', address: '경기도 수원시 팔달구 월드컵로 310', isPast: false },
  { id: 'r4', facility: '화성드림파크야구장', court: '2구장', date: '2025.12.15', time: '14:00-16:00', status: 'confirmed', address: '경기도 화성시 동탄중앙로 200', isPast: true },
  { id: 'r5', facility: '일산 킨텍스 풋살파크', court: 'B코트', date: '2025.12.10', time: '19:00-21:00', status: 'cancelled', address: '경기도 고양시 일산서구 킨텍스로 217-59', isPast: true },
  { id: 'r6', facility: '인천아시안스타디움 연습장', court: '3구장', date: '2025.11.28', time: '09:00-11:00', status: 'confirmed', address: '인천광역시 중구 참외전로 246', isPast: true },
];

const availableFacilities: AvailableFacility[] = [
  { id: 'af1', name: '화성드림파크야구장', address: '경기도 화성시 동탄중앙로 200', availableTimes: ['09:00', '11:00', '14:00', '16:00'], sports: ['야구'] },
  { id: 'af2', name: '잠실종합운동장 풋살장', address: '서울특별시 송파구 올림픽로 25', availableTimes: ['10:00', '14:00', '18:00'], sports: ['풋살', '축구'] },
  { id: 'af3', name: '수원월드컵경기장 보조구장', address: '경기도 수원시 팔달구 월드컵로 310', availableTimes: ['08:00', '10:00', '14:00'], sports: ['축구'] },
  { id: 'af4', name: '일산 킨텍스 풋살파크', address: '경기도 고양시 일산서구 킨텍스로 217-59', availableTimes: ['17:00', '19:00', '21:00'], sports: ['풋살'] },
  { id: 'af5', name: '인천아시안스타디움 연습장', address: '인천광역시 중구 참외전로 246', availableTimes: ['09:00', '13:00'], sports: ['야구', '축구'] },
];

/* ── Status badge component ────────────────────────────────────── */
function StatusBadge({ status }: { status: ReservationStatus }) {
  const config = {
    confirmed: { label: '확정', icon: CheckCircle2, cls: 'bg-[#00CC33]/20 text-[#00CC33]' },
    pending: { label: '대기', icon: Loader2, cls: 'bg-yellow-600/20 text-yellow-400' },
    cancelled: { label: '취소', icon: XCircle, cls: 'bg-red-600/20 text-red-400' },
  }[status];
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${config.cls}`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}

type TabKey = 'status' | 'book';

export default function FacilityReservationPage() {
  const [tab, setTab] = useState<TabKey>('status');
  const [searchQuery, setSearchQuery] = useState('');

  const upcoming = reservations.filter((r) => !r.isPast);
  const past = reservations.filter((r) => r.isPast);

  const filteredFacilities = availableFacilities.filter(
    (f) => f.name.includes(searchQuery) || f.address.includes(searchQuery),
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">시설예약</h1>

      <SubTabChips
        tabs={[
          { key: 'status' as const, label: '예약현황' },
          { key: 'book' as const, label: '예약하기' },
        ]}
        active={tab}
        onChange={setTab}
      />

      {/* ── 예약현황 tab ──────────────────────────────────────────── */}
      {tab === 'status' && (
        <div className="flex flex-col gap-6">
          {/* Upcoming */}
          <section>
            <h2 className="text-[15px] font-semibold text-white mb-3">다가오는 예약</h2>
            {upcoming.length === 0 && (
              <p className="text-[13px] text-[#A6A6A6]">예정된 예약이 없습니다.</p>
            )}
            <div className="flex flex-col gap-3">
              {upcoming.map((r) => (
                <div key={r.id} className="bg-[#262626] rounded-xl p-4 border border-[#4D4D4D]/50">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[15px] font-semibold text-white">{r.facility}</span>
                        <StatusBadge status={r.status} />
                      </div>
                      <p className="text-[13px] text-[#A6A6A6]">{r.court}</p>
                      <div className="flex items-center gap-3 mt-2 text-[13px] text-[#A6A6A6]">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {r.date} {r.time}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-[12px] text-[#A6A6A6]">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{r.address}</span>
                      </div>
                    </div>
                    <button className="flex-shrink-0 px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors">
                      취소
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Past */}
          <section>
            <h2 className="text-[15px] font-semibold text-white mb-3">지난 예약</h2>
            <div className="flex flex-col gap-3">
              {past.map((r) => (
                <div key={r.id} className="bg-[#262626] rounded-xl p-4 border border-[#4D4D4D]/50 opacity-70">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[15px] font-semibold text-white">{r.facility}</span>
                        <StatusBadge status={r.status} />
                      </div>
                      <p className="text-[13px] text-[#A6A6A6]">{r.court}</p>
                      <div className="flex items-center gap-3 mt-2 text-[13px] text-[#A6A6A6]">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {r.date} {r.time}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-[12px] text-[#A6A6A6]">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{r.address}</span>
                      </div>
                    </div>
                    <button className="flex-shrink-0 px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-[#00CC33]/20 text-[#00CC33] hover:bg-[#00CC33]/30 transition-colors">
                      재예약
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* ── 예약하기 tab ──────────────────────────────────────────── */}
      {tab === 'book' && (
        <div>
          {/* Search input */}
          <div className="relative mb-5">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A6A6A6]" />
            <input
              type="text"
              placeholder="시설명 또는 주소 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#262626] border border-[#4D4D4D] rounded-lg text-[14px] text-white placeholder-[#A6A6A6] outline-none focus:border-[#00CC33] transition-colors"
            />
          </div>

          {/* Facility list */}
          <div className="flex flex-col gap-3">
            {filteredFacilities.map((f) => (
              <div key={f.id} className="bg-[#262626] rounded-xl overflow-hidden border border-[#4D4D4D]/50">
                <div className="flex items-stretch">
                  {/* Image placeholder */}
                  <div className="w-[100px] min-h-[100px] flex-shrink-0 bg-gradient-to-br from-[#333] to-[#555] flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-[#A6A6A6]" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 px-4 py-3 min-w-0 flex flex-col justify-between">
                    <div>
                      <p className="text-[15px] font-semibold text-white mb-0.5">{f.name}</p>
                      <p className="text-[12px] text-[#A6A6A6] truncate">{f.address}</p>
                      <div className="flex gap-1.5 mt-1.5">
                        {f.sports.map((s) => (
                          <span key={s} className="px-2 py-0.5 rounded-full text-[11px] bg-[#4D4D4D] text-[#A6A6A6]">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1.5 text-[12px] text-[#A6A6A6]">
                        <Clock className="h-3 w-3" />
                        <span>{f.availableTimes.join(' / ')}</span>
                      </div>
                      <button className="px-4 py-1.5 rounded-lg text-[12px] font-semibold bg-[#00CC33] text-[#1A1A1A] hover:bg-[#00BB2D] transition-colors">
                        예약
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {filteredFacilities.length === 0 && (
              <p className="text-center text-[13px] text-[#A6A6A6] py-8">검색 결과가 없습니다.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
