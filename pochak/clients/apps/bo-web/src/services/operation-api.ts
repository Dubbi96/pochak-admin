/**
 * Operation Management API service (Venues & Cameras)
 * Calls real admin API via gateway, with mock fallback.
 */

import type { PageResponse } from "@/types/common";
import type { Venue, VenueFilter, VenueCreateRequest } from "@/types/venue";
import type { Camera, CameraFilter, CameraCreateRequest } from "@/types/camera";
import { gatewayApi } from "@/lib/api-client";

// ── Helper ─────────────────────────────────────────────────────────────────────

function delay(ms = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── Venue APIs ─────────────────────────────────────────────────────────────────

export async function getVenues(
  filters: VenueFilter,
  page = 0,
  size = 20
): Promise<PageResponse<Venue>> {
  // Try real API first
  const params: Record<string, string> = {
    page: String(page),
    size: String(size),
  };
  if (filters.ownerType) params.ownerType = filters.ownerType;
  if (filters.venueType) params.venueType = filters.venueType;
  if (filters.venueName) params.venueName = filters.venueName;
  if (filters.cameraName) params.cameraName = filters.cameraName;

  const apiResult = await gatewayApi.get<PageResponse<Venue>>(
    "/api/v1/admin/venues",
    params
  );
  if (apiResult) return apiResult;

  // Mock fallback
  console.warn("[operation-api] Backend unavailable, using mock data");
  await delay();

  let filtered = [...venuesData];

  if (filters.ownerType) {
    filtered = filtered.filter((v) => v.ownerType === filters.ownerType);
  }
  if (filters.venueType) {
    filtered = filtered.filter((v) => v.venueType === filters.venueType);
  }
  if (filters.venueName) {
    const kw = filters.venueName.toLowerCase();
    filtered = filtered.filter((v) => v.name.toLowerCase().includes(kw));
  }
  if (filters.cameraName) {
    const kw = filters.cameraName.toLowerCase();
    const venueIds = camerasData
      .filter((c) => c.name.toLowerCase().includes(kw))
      .map((c) => c.venueId);
    filtered = filtered.filter((v) => venueIds.includes(v.id));
  }

  const start = page * size;
  const content = filtered.slice(start, start + size);

  return {
    content,
    totalElements: filtered.length,
    totalPages: Math.ceil(filtered.length / size),
    page,
    size,
  };
}

export async function createVenue(data: VenueCreateRequest): Promise<Venue> {
  // Try real API first
  const apiResult = await gatewayApi.post<Venue>("/api/v1/admin/venues", data);
  if (apiResult) return apiResult;

  // Mock fallback
  console.warn("[operation-api] Backend unavailable, using mock data");
  await delay();

  const venue: Venue = {
    id: nextVenueId++,
    name: data.name,
    ownerType: data.ownerType,
    venueType: data.venueType,
    organizationId: data.organizationId || null,
    organizationName: data.organizationId ? "단체명" : null,
    branchId: data.branchId || null,
    branchName: data.branchId ? "지점명" : null,
    sportId: data.sportId || null,
    sportName: data.sportId ? "종목명" : null,
    zipCode: data.zipCode,
    address: data.address,
    addressDetail: data.addressDetail,
    districtCode: data.districtCode,
    latitude: data.latitude || null,
    longitude: data.longitude || null,
    qrCode: data.qrCode || null,
    pixellotClubId: data.pixellotClubId || null,
    cameraLinkStatus: "UNLINKED",
    isActive: data.isActive,
    createdAt: new Date().toISOString(),
  };

  venuesData.push(venue);
  return venue;
}

export async function updateVenue(
  id: number,
  data: VenueCreateRequest
): Promise<Venue> {
  // Try real API first
  const apiResult = await gatewayApi.put<Venue>(`/api/v1/admin/venues/${id}`, data);
  if (apiResult) return apiResult;

  // Mock fallback
  console.warn("[operation-api] Backend unavailable, using mock data");
  await delay();

  const idx = venuesData.findIndex((v) => v.id === id);
  if (idx === -1) throw new Error("Venue not found");

  venuesData[idx] = {
    ...venuesData[idx],
    ...data,
    organizationName: data.organizationId ? "단체명" : null,
    branchName: data.branchId ? "지점명" : null,
    sportName: data.sportId ? "종목명" : null,
    organizationId: data.organizationId || null,
    branchId: data.branchId || null,
    sportId: data.sportId || null,
    latitude: data.latitude || null,
    longitude: data.longitude || null,
    qrCode: data.qrCode || null,
    pixellotClubId: data.pixellotClubId || null,
  };

  return venuesData[idx];
}

export async function deleteVenue(id: number): Promise<void> {
  // Try real API first
  const apiResult = await gatewayApi.delete(`/api/v1/admin/venues/${id}`);
  if (apiResult !== null) return;

  // Mock fallback
  console.warn("[operation-api] Backend unavailable, using mock data");
  await delay();
  venuesData = venuesData.filter((v) => v.id !== id);
}

// ── Camera APIs ────────────────────────────────────────────────────────────────

export async function getCameras(
  filters: CameraFilter,
  page = 0,
  size = 20
): Promise<PageResponse<Camera>> {
  // Try real API first
  const params: Record<string, string> = {
    page: String(page),
    size: String(size),
  };
  if (filters.type) params.type = filters.type;
  if (filters.keyword) params.keyword = filters.keyword;

  const apiResult = await gatewayApi.get<PageResponse<Camera>>(
    "/api/v1/admin/cameras",
    params
  );
  if (apiResult) return apiResult;

  // Mock fallback
  console.warn("[operation-api] Backend unavailable, using mock data");
  await delay();

  let filtered = [...camerasData];

  if (filters.type) {
    filtered = filtered.filter((c) => c.type === filters.type);
  }
  if (filters.keyword) {
    const kw = filters.keyword.toLowerCase();
    filtered = filtered.filter((c) => c.name.toLowerCase().includes(kw));
  }

  const start = page * size;
  const content = filtered.slice(start, start + size);

  return {
    content,
    totalElements: filtered.length,
    totalPages: Math.ceil(filtered.length / size),
    page,
    size,
  };
}

export async function createCamera(data: CameraCreateRequest): Promise<Camera> {
  // Try real API first
  const apiResult = await gatewayApi.post<Camera>("/api/v1/admin/cameras", data);
  if (apiResult) return apiResult;

  // Mock fallback
  console.warn("[operation-api] Backend unavailable, using mock data");
  await delay();

  const camera: Camera = {
    id: nextCameraId++,
    cameraId: `CAM-${String(nextCameraId).padStart(3, "0")}`,
    name: data.name,
    type: data.type,
    serialNumber: data.serialNumber,
    isPanorama: data.isPanorama,
    pixellotId: data.pixellotId || null,
    venueId: null,
    venueName: null,
    createdAt: new Date().toISOString(),
  };

  camerasData.push(camera);
  return camera;
}

export async function linkCameraToVenue(
  cameraId: number,
  venueId: number
): Promise<void> {
  // Try real API first
  const apiResult = await gatewayApi.post(`/api/v1/admin/cameras/${cameraId}/link`, { venueId });
  if (apiResult !== null) return;

  // Mock fallback
  console.warn("[operation-api] Backend unavailable, using mock data");
  await delay();

  const cameraIdx = camerasData.findIndex((c) => c.id === cameraId);
  if (cameraIdx === -1) throw new Error("Camera not found");

  const venue = venuesData.find((v) => v.id === venueId);
  if (!venue) throw new Error("Venue not found");

  camerasData[cameraIdx] = {
    ...camerasData[cameraIdx],
    venueId,
    venueName: venue.name,
  };
}

export async function unlinkCamera(cameraId: number): Promise<void> {
  // Try real API first
  const apiResult = await gatewayApi.post(`/api/v1/admin/cameras/${cameraId}/unlink`);
  if (apiResult !== null) return;

  // Mock fallback
  console.warn("[operation-api] Backend unavailable, using mock data");
  await delay();

  const idx = camerasData.findIndex((c) => c.id === cameraId);
  if (idx === -1) throw new Error("Camera not found");

  camerasData[idx] = {
    ...camerasData[idx],
    venueId: null,
    venueName: null,
  };
}

export async function getUnlinkedCameras(): Promise<Camera[]> {
  // Try real API first
  const apiResult = await gatewayApi.get<Camera[]>("/api/v1/admin/cameras/unlinked");
  if (apiResult) return apiResult;

  // Mock fallback
  console.warn("[operation-api] Backend unavailable, using mock data");
  await delay();
  return camerasData.filter((c) => c.venueId === null);
}

export async function getCamerasByVenue(venueId: number): Promise<Camera[]> {
  // Try real API first
  const apiResult = await gatewayApi.get<Camera[]>(
    `/api/v1/admin/venues/${venueId}/cameras`
  );
  if (apiResult) return apiResult;

  // Mock fallback
  console.warn("[operation-api] Backend unavailable, using mock data");
  await delay();
  return camerasData.filter((c) => c.venueId === venueId);
}

// ── Mock Data ──────────────────────────────────────────────────────────────────

const mockVenues: Venue[] = [
  {
    id: 1, name: "서울 월드컵경기장", ownerType: "B2G", venueType: "FIXED",
    organizationId: 1, organizationName: "서울시체육회", branchId: 1, branchName: "마포지점",
    sportId: 1, sportName: "축구", zipCode: "03900",
    address: "서울특별시 마포구 월드컵로 240", addressDetail: "1층",
    districtCode: "1140", latitude: 37.5683, longitude: 126.8975,
    qrCode: "VENUE-001-QR", pixellotClubId: "PXL-CLUB-001",
    cameraLinkStatus: "LINKED", isActive: true, createdAt: "2025-01-10T09:00:00",
  },
  {
    id: 2, name: "강남 실내체육관", ownerType: "B2B", venueType: "FIXED",
    organizationId: 2, organizationName: "강남스포츠", branchId: 2, branchName: "강남본점",
    sportId: 2, sportName: "농구", zipCode: "06100",
    address: "서울특별시 강남구 테헤란로 123", addressDetail: "B1",
    districtCode: "1168", latitude: 37.5012, longitude: 127.0396,
    qrCode: "VENUE-002-QR", pixellotClubId: "PXL-CLUB-002",
    cameraLinkStatus: "LINKED", isActive: true, createdAt: "2025-01-20T10:00:00",
  },
  {
    id: 3, name: "인천 야구장", ownerType: "B2C", venueType: "FIXED",
    organizationId: null, organizationName: null, branchId: null, branchName: null,
    sportId: 3, sportName: "야구", zipCode: "21998",
    address: "인천광역시 미추홀구 매소홀로 618", addressDetail: "",
    districtCode: "2817", latitude: 37.4370, longitude: 126.6932,
    qrCode: null, pixellotClubId: null,
    cameraLinkStatus: "UNLINKED", isActive: true, createdAt: "2025-02-05T11:00:00",
  },
  {
    id: 4, name: "부산 다목적체육관", ownerType: "B2G", venueType: "MOBILE",
    organizationId: 3, organizationName: "부산시체육회", branchId: 3, branchName: "해운대지점",
    sportId: 4, sportName: "배구", zipCode: "48060",
    address: "부산광역시 해운대구 센텀중앙로 55", addressDetail: "3층",
    districtCode: "2635", latitude: 35.1695, longitude: 129.1313,
    qrCode: "VENUE-004-QR", pixellotClubId: "PXL-CLUB-004",
    cameraLinkStatus: "LINKED", isActive: false, createdAt: "2025-02-15T14:00:00",
  },
  {
    id: 5, name: "대전 배드민턴장", ownerType: "B2C", venueType: "MOBILE",
    organizationId: null, organizationName: null, branchId: null, branchName: null,
    sportId: 5, sportName: "배드민턴", zipCode: "34126",
    address: "대전광역시 유성구 대학로 99", addressDetail: "체육관동",
    districtCode: "3020", latitude: 36.3743, longitude: 127.3650,
    qrCode: null, pixellotClubId: null,
    cameraLinkStatus: "UNLINKED", isActive: true, createdAt: "2025-03-01T09:30:00",
  },
];

const mockCameras: Camera[] = [
  { id: 1, cameraId: "CAM-001", name: "메인 카메라 A", type: "PTZ", serialNumber: "SN-PTZ-00001", isPanorama: false, pixellotId: "PXL-CAM-001", venueId: 1, venueName: "서울 월드컵경기장", createdAt: "2025-01-10T09:00:00" },
  { id: 2, cameraId: "CAM-002", name: "파노라마 카메라 B", type: "PANORAMA", serialNumber: "SN-PAN-00002", isPanorama: true, pixellotId: "PXL-CAM-002", venueId: 1, venueName: "서울 월드컵경기장", createdAt: "2025-01-12T10:00:00" },
  { id: 3, cameraId: "CAM-003", name: "실내 카메라 C", type: "FIXED", serialNumber: "SN-FIX-00003", isPanorama: false, pixellotId: "PXL-CAM-003", venueId: 2, venueName: "강남 실내체육관", createdAt: "2025-01-20T11:00:00" },
  { id: 4, cameraId: "CAM-004", name: "이동형 카메라 D", type: "MOBILE", serialNumber: "SN-MOB-00004", isPanorama: false, pixellotId: null, venueId: null, venueName: null, createdAt: "2025-02-01T08:00:00" },
  { id: 5, cameraId: "CAM-005", name: "파노라마 카메라 E", type: "PANORAMA", serialNumber: "SN-PAN-00005", isPanorama: true, pixellotId: "PXL-CAM-005", venueId: 4, venueName: "부산 다목적체육관", createdAt: "2025-02-15T14:30:00" },
];

let venuesData = [...mockVenues];
let camerasData = [...mockCameras];
let nextVenueId = 6;
let nextCameraId = 6;
