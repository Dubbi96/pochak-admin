// Mock data and types for Filming Reservation

export type CameraStatus = 'ONLINE' | 'OFFLINE' | 'MAINTENANCE';

export interface Venue {
  id: string;
  name: string;
  address: string;
  sport: string;
  cameraStatus: CameraStatus;
  cameraCount: number;
  pricePerHour: number;
}

export type TimeSlotStatus = 'AVAILABLE' | 'UNAVAILABLE' | 'SELECTED';

export interface TimeSlot {
  id: string;
  time: string; // "HH:mm"
  status: TimeSlotStatus;
}

export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export interface Reservation {
  id: string;
  venueId: string;
  venueName: string;
  date: string; // YYYY-MM-DD
  time: string;
  cost: number;
  status: ReservationStatus;
  createdAt: string;
}

// --------------- Mock Venues ---------------

export const mockVenues: Venue[] = [
  {
    id: 'v-1',
    name: '서울 월드컵경기장 보조구장',
    address: '서울특별시 마포구 월드컵로 240',
    sport: '축구',
    cameraStatus: 'ONLINE',
    cameraCount: 4,
    pricePerHour: 50000,
  },
  {
    id: 'v-2',
    name: '잠실 실내체육관',
    address: '서울특별시 송파구 올림픽로 25',
    sport: '농구',
    cameraStatus: 'ONLINE',
    cameraCount: 6,
    pricePerHour: 80000,
  },
  {
    id: 'v-3',
    name: '고척 스카이돔',
    address: '서울특별시 구로구 경인로 430',
    sport: '야구',
    cameraStatus: 'MAINTENANCE',
    cameraCount: 8,
    pricePerHour: 120000,
  },
  {
    id: 'v-4',
    name: '수원종합운동장',
    address: '경기도 수원시 팔달구 월드컵로 310',
    sport: '축구',
    cameraStatus: 'ONLINE',
    cameraCount: 3,
    pricePerHour: 40000,
  },
  {
    id: 'v-5',
    name: '인천 삼산월드체육관',
    address: '인천광역시 부평구 길주로 428',
    sport: '배구',
    cameraStatus: 'OFFLINE',
    cameraCount: 4,
    pricePerHour: 60000,
  },
  {
    id: 'v-6',
    name: '대전 한밭체육관',
    address: '대전광역시 중구 대종로 373',
    sport: '핸드볼',
    cameraStatus: 'ONLINE',
    cameraCount: 2,
    pricePerHour: 35000,
  },
];

// --------------- Mock Time Slots ---------------

export function getMockTimeSlots(): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const unavailableHours = [9, 10, 14, 15];
  for (let hour = 8; hour <= 22; hour++) {
    slots.push({
      id: `ts-${hour}`,
      time: `${String(hour).padStart(2, '0')}:00`,
      status: unavailableHours.includes(hour) ? 'UNAVAILABLE' : 'AVAILABLE',
    });
  }
  return slots;
}

// --------------- Mock Reservations ---------------

export const mockReservations: Reservation[] = [
  {
    id: 'r-1',
    venueId: 'v-1',
    venueName: '서울 월드컵경기장 보조구장',
    date: '2026-03-20',
    time: '11:00',
    cost: 50000,
    status: 'CONFIRMED',
    createdAt: '2026-03-18T10:30:00',
  },
  {
    id: 'r-2',
    venueId: 'v-2',
    venueName: '잠실 실내체육관',
    date: '2026-03-22',
    time: '16:00',
    cost: 80000,
    status: 'PENDING',
    createdAt: '2026-03-19T09:00:00',
  },
  {
    id: 'r-3',
    venueId: 'v-4',
    venueName: '수원종합운동장',
    date: '2026-03-15',
    time: '13:00',
    cost: 40000,
    status: 'COMPLETED',
    createdAt: '2026-03-13T14:20:00',
  },
  {
    id: 'r-4',
    venueId: 'v-3',
    venueName: '고척 스카이돔',
    date: '2026-03-10',
    time: '18:00',
    cost: 120000,
    status: 'CANCELLED',
    createdAt: '2026-03-08T11:00:00',
  },
];

// --------------- Helpers ---------------

export function formatCurrency(amount: number): string {
  return amount.toLocaleString('ko-KR') + '원';
}

export function getCameraStatusLabel(status: CameraStatus): string {
  switch (status) {
    case 'ONLINE':
      return '운영중';
    case 'OFFLINE':
      return '오프라인';
    case 'MAINTENANCE':
      return '점검중';
  }
}

export function getReservationStatusLabel(status: ReservationStatus): string {
  switch (status) {
    case 'PENDING':
      return '대기중';
    case 'CONFIRMED':
      return '확정';
    case 'COMPLETED':
      return '완료';
    case 'CANCELLED':
      return '취소';
  }
}
