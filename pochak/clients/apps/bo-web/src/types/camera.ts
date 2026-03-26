export interface Camera {
  id: number;
  cameraId: string;
  name: string;
  type: string;
  serialNumber: string;
  isPanorama: boolean;
  pixellotId: string | null;
  venueId: number | null;
  venueName: string | null;
  createdAt: string;
}

export interface CameraFilter {
  type?: string;
  keyword?: string;
}

export interface CameraCreateRequest {
  name: string;
  type: string;
  serialNumber: string;
  isPanorama: boolean;
  pixellotId?: string;
}
