import { useState } from 'react';
import { Star, Bell, BellOff, MapPin, Navigation } from 'lucide-react';

/* ── Types ─────────────────────────────────────────────────────── */
interface FrequentFacility {
  id: string;
  name: string;
  address: string;
  sports: string[];
  distance: string;
  lastVisited: string;
  notificationOn: boolean;
}

/* ── Mock data ─────────────────────────────────────────────────── */
const initialFacilities: FrequentFacility[] = [
  { id: 'f1', name: '화성드림파크야구장', address: '경기도 화성시 동탄중앙로 200', sports: ['야구'], distance: '12.5km', lastVisited: '2026.01.10', notificationOn: true },
  { id: 'f2', name: '잠실종합운동장 풋살장', address: '서울특별시 송파구 올림픽로 25', sports: ['풋살', '축구'], distance: '8.2km', lastVisited: '2026.01.08', notificationOn: true },
  { id: 'f3', name: '수원월드컵경기장 보조구장', address: '경기도 수원시 팔달구 월드컵로 310', sports: ['축구'], distance: '22.1km', lastVisited: '2025.12.20', notificationOn: false },
  { id: 'f4', name: '일산 킨텍스 풋살파크', address: '경기도 고양시 일산서구 킨텍스로 217-59', sports: ['풋살'], distance: '35.7km', lastVisited: '2025.12.15', notificationOn: false },
  { id: 'f5', name: '인천아시안스타디움 연습장', address: '인천광역시 중구 참외전로 246', sports: ['야구', '축구'], distance: '40.3km', lastVisited: '2025.11.28', notificationOn: true },
  { id: 'f6', name: '파주NFC 다목적구장', address: '경기도 파주시 탄현면 축구장로 37', sports: ['축구', '풋살'], distance: '48.0km', lastVisited: '2025.11.10', notificationOn: false },
];

/* ── Gradient for thumbnail ────────────────────────────────────── */
function thumbGradient(sports: string[]) {
  const primary = sports[0];
  switch (primary) {
    case '야구': return 'from-blue-900 to-blue-700';
    case '축구': return 'from-green-900 to-green-700';
    case '풋살': return 'from-orange-900 to-orange-700';
    default: return 'from-[#333] to-[#555]';
  }
}

export default function FrequentFacilitiesPage() {
  const [facilities, setFacilities] = useState(initialFacilities);

  const toggleNotification = (id: string) => {
    setFacilities((prev) =>
      prev.map((f) => (f.id === id ? { ...f, notificationOn: !f.notificationOn } : f)),
    );
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">자주가는 시설</h1>

      {facilities.length === 0 && (
        <p className="text-[13px] text-[#A6A6A6] py-8 text-center">즐겨찾기한 시설이 없습니다.</p>
      )}

      <div className="flex flex-col gap-3">
        {facilities.map((f) => (
          <div
            key={f.id}
            className="bg-[#262626] rounded-xl overflow-hidden border border-[#4D4D4D]/50 hover:bg-[#333] transition-colors"
          >
            <div className="flex items-stretch">
              {/* Thumbnail placeholder */}
              <div
                className={`w-[100px] min-h-[110px] flex-shrink-0 bg-gradient-to-br ${thumbGradient(f.sports)} flex items-center justify-center`}
              >
                <MapPin className="h-7 w-7 text-white/50" />
              </div>

              {/* Content */}
              <div className="flex-1 px-4 py-3 min-w-0 flex flex-col justify-between">
                {/* Top row: name + bookmark + notification */}
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[15px] font-semibold text-white truncate">{f.name}</span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Star className="h-4 w-4 text-[#00CC33] fill-[#00CC33]" />
                      <button
                        onClick={() => toggleNotification(f.id)}
                        className="text-[#A6A6A6] hover:text-white transition-colors"
                        title={f.notificationOn ? '알림 끄기' : '알림 켜기'}
                      >
                        {f.notificationOn ? (
                          <Bell className="h-4 w-4 text-[#00CC33]" />
                        ) : (
                          <BellOff className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Address */}
                  <p className="text-[12px] text-[#A6A6A6] mt-0.5 truncate">{f.address}</p>

                  {/* Sports tags */}
                  <div className="flex gap-1.5 mt-1.5">
                    {f.sports.map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded-full text-[11px] bg-[#4D4D4D] text-[#A6A6A6]">
                        {s}
                      </span>
                    ))}
                    <span className="px-2 py-0.5 rounded-full text-[11px] bg-[#4D4D4D]/50 text-[#A6A6A6]">
                      {f.distance}
                    </span>
                  </div>
                </div>

                {/* Bottom row: last visited + directions */}
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[12px] text-[#A6A6A6]">
                    마지막 방문: {f.lastVisited}
                  </span>
                  <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-[#4D4D4D] text-white hover:bg-[#666] transition-colors">
                    <Navigation className="h-3 w-3" />
                    길찾기
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
