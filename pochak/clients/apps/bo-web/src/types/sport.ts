export interface SportTag {
  id: number;
  name: string;
}

export interface Sport {
  id: number;
  sportCode: string;
  name: string;
  imageUrl: string | null;
  displayOrder: number;
  isActive: boolean;
  tags: SportTag[];
  createdBy: string;
  createdAt: string;
}

export interface SportFilter {
  isActive?: boolean | null;
  keyword?: string;
}

export interface SportCreateRequest {
  name: string;
  sportCode: string;
  imageUrl?: string;
  isActive: boolean;
  tags: string[];
}

export interface SportUpdateRequest extends SportCreateRequest {
  id: number;
}

export interface SportOrderUpdateRequest {
  items: { id: number; displayOrder: number }[];
}
