import { useState, useMemo } from 'react';
import { MapPin, CheckCircle, ChevronDown, Search, Clock, Phone } from 'lucide-react';

// ── Mock region data ─────────────────────────────────────────────────────────

const regions: Record<string, string[]> = {
  서울특별시: ['강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구', '노원구', '도봉구', '동대문구', '동작구', '마포구', '서대문구', '서초구', '성동구', '성북구', '송파구', '양천구', '영등포구', '용산구', '은평구', '종로구', '중구', '중랑구'],
  경기도: ['성남시', '수원시', '용인시', '고양시', '안양시', '부천시', '화성시', '남양주시', '안산시', '평택시'],
  인천광역시: ['남동구', '부평구', '서구', '연수구', '중구', '미추홀구'],
  부산광역시: ['해운대구', '수영구', '사하구', '부산진구', '동래구', '남구'],
  대구광역시: ['수성구', '달서구', '북구', '중구', '동구'],
  대전광역시: ['유성구', '서구', '중구', '대덕구', '동구'],
};

const sidoList = Object.keys(regions);

// ── Mock facility data ───────────────────────────────────────────────────────

interface Facility {
  id: string;
  name: string;
  sportType: string;
  address: string;
  sido: string;
  sigungu: string;
  verified: boolean;
  reservationStatus: 'available' | 'full' | 'closed';
  phone: string;
  openHours: string;
  imageColor: string;
}

const mockFacilities: Facility[] = [
  {
    id: 'f1',
    name: '강남구민체육관',
    sportType: '축구',
    address: '서울특별시 강남구 삼성로 123',
    sido: '서울특별시',
    sigungu: '강남구',
    verified: true,
    reservationStatus: 'available',
    phone: '02-1234-5678',
    openHours: '06:00 ~ 22:00',
    imageColor: '#1B5E20',
  },
  {
    id: 'f2',
    name: '성남시 종합운동장',
    sportType: '축구',
    address: '경기도 성남시 분당구 야탑로 25',
    sido: '경기도',
    sigungu: '성남시',
    verified: true,
    reservationStatus: 'available',
    phone: '031-987-6543',
    openHours: '06:00 ~ 21:00',
    imageColor: '#0D47A1',
  },
  {
    id: 'f3',
    name: '인천남동체육센터',
    sportType: '축구',
    address: '인천광역시 남동구 소래로 456',
    sido: '인천광역시',
    sigungu: '남동구',
    verified: true,
    reservationStatus: 'full',
    phone: '032-555-1234',
    openHours: '07:00 ~ 21:00',
    imageColor: '#4A148C',
  },
  {
    id: 'f4',
    name: '수원월드컵보조구장',
    sportType: '축구',
    address: '경기도 수원시 팔달구 월드컵로 310',
    sido: '경기도',
    sigungu: '수원시',
    verified: false,
    reservationStatus: 'available',
    phone: '031-222-3333',
    openHours: '08:00 ~ 20:00',
    imageColor: '#B71C1C',
  },
  {
    id: 'f5',
    name: '해운대스포츠파크',
    sportType: '풋살',
    address: '부산광역시 해운대구 센텀중앙로 78',
    sido: '부산광역시',
    sigungu: '해운대구',
    verified: true,
    reservationStatus: 'closed',
    phone: '051-777-8888',
    openHours: '09:00 ~ 22:00',
    imageColor: '#E65100',
  },
  {
    id: 'f6',
    name: '송파다목적체육관',
    sportType: '배드민턴',
    address: '서울특별시 송파구 올림픽로 300',
    sido: '서울특별시',
    sigungu: '송파구',
    verified: true,
    reservationStatus: 'available',
    phone: '02-444-5555',
    openHours: '06:00 ~ 23:00',
    imageColor: '#006064',
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function reservationLabel(status: Facility['reservationStatus']) {
  switch (status) {
    case 'available':
      return { text: '예약 가능', className: 'text-[#00CC33] bg-[#00CC33]/10' };
    case 'full':
      return { text: '예약 마감', className: 'text-[#FF6D00] bg-[#FF6D00]/10' };
    case 'closed':
      return { text: '운영 종료', className: 'text-[#A6A6A6] bg-[#A6A6A6]/10' };
  }
}

// ── Dropdown Component ───────────────────────────────────────────────────────

function Dropdown({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <label className="block text-xs text-[#A6A6A6] mb-1">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="appearance-none w-full bg-[#262626] border border-[#4D4D4D] text-white text-sm rounded-lg px-4 py-2.5 pr-10 focus:outline-none focus:border-[#00CC33] transition-colors cursor-pointer"
        >
          <option value="">전체</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A6A6A6] pointer-events-none" />
      </div>
    </div>
  );
}

// ── Facility Card ────────────────────────────────────────────────────────────

function FacilityCard({ facility }: { facility: Facility }) {
  const badge = reservationLabel(facility.reservationStatus);

  return (
    <div className="rounded-xl border border-[#4D4D4D] bg-[#262626] overflow-hidden hover:border-[#666] transition-colors cursor-pointer group">
      {/* Image placeholder */}
      <div
        className="h-[140px] flex items-center justify-center"
        style={{ backgroundColor: facility.imageColor }}
      >
        <MapPin className="h-10 w-10 text-white/40 group-hover:text-white/60 transition-colors" />
      </div>

      <div className="p-4">
        {/* Name + verified */}
        <div className="flex items-center gap-1.5 mb-1">
          <h3 className="text-[15px] font-semibold text-white truncate">{facility.name}</h3>
          {facility.verified && (
            <CheckCircle className="h-4 w-4 text-[#00CC33] flex-shrink-0" />
          )}
        </div>

        {/* Sport type badge */}
        <span className="inline-block text-[11px] font-medium text-[#00CC33] bg-[#00CC33]/10 px-2 py-0.5 rounded mb-2">
          {facility.sportType}
        </span>

        {/* Address */}
        <p className="text-xs text-[#A6A6A6] mb-2 truncate">{facility.address}</p>

        {/* Info row */}
        <div className="flex items-center gap-3 text-xs text-[#A6A6A6] mb-3">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {facility.openHours}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-[#A6A6A6] mb-3">
          <Phone className="h-3 w-3" />
          {facility.phone}
        </div>

        {/* Reservation status */}
        <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded ${badge.className}`}>
          {badge.text}
        </span>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function CityPage() {
  const [sido, setSido] = useState('');
  const [sigungu, setSigungu] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const sigunguOptions = useMemo(() => {
    if (!sido) return [];
    return regions[sido] ?? [];
  }, [sido]);

  const handleSidoChange = (v: string) => {
    setSido(v);
    setSigungu('');
  };

  const filtered = useMemo(() => {
    let list = mockFacilities;
    if (sido) list = list.filter((f) => f.sido === sido);
    if (sigungu) list = list.filter((f) => f.sigungu === sigungu);
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.address.toLowerCase().includes(q) ||
          f.sportType.toLowerCase().includes(q),
      );
    }
    return list;
  }, [sido, sigungu, searchQuery]);

  return (
    <div className="px-6 py-6 lg:px-8 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">포착 시티</h1>
        <p className="text-[15px] text-[#A6A6A6] mt-1">내 주변 체육시설을 찾아보세요</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="w-full sm:w-[200px]">
          <Dropdown label="시/도" value={sido} options={sidoList} onChange={handleSidoChange} />
        </div>
        <div className="w-full sm:w-[200px]">
          <Dropdown label="시/군/구" value={sigungu} options={sigunguOptions} onChange={setSigungu} />
        </div>
        <div className="flex-1">
          <label className="block text-xs text-[#A6A6A6] mb-1">검색</label>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="시설명, 종목으로 검색"
              className="w-full bg-[#262626] border border-[#4D4D4D] text-white text-sm rounded-lg px-4 py-2.5 pr-10 placeholder-[#666] focus:outline-none focus:border-[#00CC33] transition-colors"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A6A6A6] pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-[#A6A6A6] mb-4">
        총 <span className="text-white font-semibold">{filtered.length}</span>개 시설
      </p>

      {/* Facility grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#A6A6A6]">
          <MapPin className="h-10 w-10 mb-3 text-[#4D4D4D]" />
          <p className="text-sm">해당 지역에 등록된 시설이 없습니다.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((facility) => (
            <FacilityCard key={facility.id} facility={facility} />
          ))}
        </div>
      )}
    </div>
  );
}
