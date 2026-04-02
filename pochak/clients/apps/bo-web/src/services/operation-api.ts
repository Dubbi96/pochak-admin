/**
 * Operation Management API service (Venues & Cameras)
 * Calls real admin API via gateway.
 */

import type { PageResponse } from "@/types/common";
import type { Venue, VenueFilter, VenueCreateRequest } from "@/types/venue";
import type { Camera, CameraFilter, CameraCreateRequest } from "@/types/camera";
import { gatewayApi } from "@/lib/api-client";

// ── Venue APIs ─────────────────────────────────────────────────────────────────

export async function getVenues(
  filters: VenueFilter,
  page = 0,
  size = 20
): Promise<PageResponse<Venue>> {
  const params: Record<string, string> = {
    page: String(page),
    size: String(size),
  };
  if (filters.ownerType) params.ownerType = filters.ownerType;
  if (filters.venueType) params.venueType = filters.venueType;
  if (filters.venueName) params.venueName = filters.venueName;
  if (filters.cameraName) params.cameraName = filters.cameraName;

  return gatewayApi.get<PageResponse<Venue>>(
    "/api/v1/admin/venues",
    params
  );
}

export async function createVenue(data: VenueCreateRequest): Promise<Venue> {
  return gatewayApi.post<Venue>("/api/v1/admin/venues", data);
}

export async function updateVenue(
  id: number,
  data: VenueCreateRequest
): Promise<Venue> {
  return gatewayApi.put<Venue>(`/api/v1/admin/venues/${id}`, data);
}

export async function deleteVenue(id: number): Promise<void> {
  await gatewayApi.delete(`/api/v1/admin/venues/${id}`);
}

// ── Camera APIs ────────────────────────────────────────────────────────────────

export async function getCameras(
  filters: CameraFilter,
  page = 0,
  size = 20
): Promise<PageResponse<Camera>> {
  const params: Record<string, string> = {
    page: String(page),
    size: String(size),
  };
  if (filters.type) params.type = filters.type;
  if (filters.keyword) params.keyword = filters.keyword;

  return gatewayApi.get<PageResponse<Camera>>(
    "/api/v1/admin/cameras",
    params
  );
}

export async function createCamera(data: CameraCreateRequest): Promise<Camera> {
  return gatewayApi.post<Camera>("/api/v1/admin/cameras", data);
}

export async function linkCameraToVenue(
  cameraId: number,
  venueId: number
): Promise<void> {
  await gatewayApi.post(`/api/v1/admin/cameras/${cameraId}/link`, { venueId });
}

export async function unlinkCamera(cameraId: number): Promise<void> {
  await gatewayApi.post(`/api/v1/admin/cameras/${cameraId}/unlink`);
}

export async function getUnlinkedCameras(): Promise<Camera[]> {
  return gatewayApi.get<Camera[]>("/api/v1/admin/cameras/unlinked");
}

export async function getCamerasByVenue(venueId: number): Promise<Camera[]> {
  return gatewayApi.get<Camera[]>(
    `/api/v1/admin/venues/${venueId}/cameras`
  );
}
