export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl?: string;
  gradient: string;
  linkTo: string;
}

export interface ContentItem {
  id: string;
  title: string;
  type: 'LIVE' | 'VOD' | 'CLIP';
  competition: string;
  sport: string;
  date: string;
  duration?: string;
  viewCount: number;
  tags: string[];
  thumbnailUrl?: string;
  homeTeam?: string;
  awayTeam?: string;
  isLive?: boolean;
  isFree?: boolean;
}

export interface Channel {
  id: string;
  name: string;
  color: string;
  initial: string;
  subtitle: string;
  followers: number;
  imageUrl?: string;
}

export interface Competition {
  id: string;
  name: string;
  dateRange: string;
  logoColor: string;
  logoText: string;
  subtitle: string;
  isAd: boolean;
  imageUrl?: string;
}

export type VenueProductType = 'SPACE_ONLY' | 'SPACE_CAMERA' | 'CAMERA_ONLY';

export interface VenueProduct {
  id: string;
  venueId: string;
  name: string;
  type: VenueProductType;
  description: string;
  pricePerHour: number;
  imageUrl?: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export interface Reservation {
  id: string;
  venueId: string;
  venueName: string;
  productId: string;
  productName: string;
  productType: VenueProductType;
  date: string;
  timeSlot: string;
  hours: number;
  totalPrice: number;
  status: ReservationStatus;
  createdAt: string;
}
