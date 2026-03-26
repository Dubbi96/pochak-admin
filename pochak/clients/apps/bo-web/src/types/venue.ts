export type OwnerType = "B2B" | "B2G" | "B2C";
export type VenueType = "FIXED" | "MOBILE";
export type CameraLinkStatus = "LINKED" | "UNLINKED";

export interface Venue {
  id: number;
  name: string;
  ownerType: OwnerType;
  venueType: VenueType;
  organizationId: number | null;
  organizationName: string | null;
  branchId: number | null;
  branchName: string | null;
  sportId: number | null;
  sportName: string | null;
  zipCode: string;
  address: string;
  addressDetail: string;
  districtCode: string;
  latitude: number | null;
  longitude: number | null;
  qrCode: string | null;
  pixellotClubId: string | null;
  cameraLinkStatus: CameraLinkStatus;
  isActive: boolean;
  createdAt: string;
}

export interface VenueFilter {
  ownerType?: OwnerType | null;
  venueType?: VenueType | null;
  venueName?: string;
  cameraName?: string;
}

export interface VenueCreateRequest {
  name: string;
  ownerType: OwnerType;
  venueType: VenueType;
  organizationId?: number;
  branchId?: number;
  sportId?: number;
  zipCode: string;
  address: string;
  addressDetail: string;
  districtCode: string;
  latitude?: number;
  longitude?: number;
  qrCode?: string;
  pixellotClubId?: string;
  isActive: boolean;
}

export interface VenueUpdateRequest extends VenueCreateRequest {
  id: number;
}
