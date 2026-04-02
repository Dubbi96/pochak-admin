import { get, post, api } from './api'

export type ProductType = 'space' | 'space_camera' | 'camera'

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  space: '공간',
  space_camera: '공간+카메라',
  camera: '카메라',
}

export interface DayAvailability {
  day: string
  open: string
  close: string
  closed: boolean
}

export interface BlockedDate {
  date: string
  reason?: string
}

export interface PriceHistoryEntry {
  id: string
  hourlyPrice: number
  dailyPrice: number
  changedAt: string
}

export interface Product {
  id: string
  venueId: string
  name: string
  type: ProductType
  hourlyPrice: number
  dailyPrice: number
  maxCapacity: number
  includedCameras: number
  isActive: boolean
  availability: DayAvailability[]
  blockedDates: BlockedDate[]
  createdAt: string
  updatedAt: string
}

export interface ProductListItem {
  id: string
  venueId: string
  venueName: string
  name: string
  type: ProductType
  hourlyPrice: number
  dailyPrice: number
  maxCapacity: number
  includedCameras: number
  isActive: boolean
  updatedAt: string
}

export interface ProductCreatePayload {
  venueId: string
  name: string
  type: ProductType
  hourlyPrice: number
  dailyPrice: number
  maxCapacity: number
  includedCameras: number
  availability: DayAvailability[]
}

export interface ProductUpdatePayload {
  name?: string
  type?: ProductType
  hourlyPrice?: number
  dailyPrice?: number
  maxCapacity?: number
  includedCameras?: number
  isActive?: boolean
  availability?: DayAvailability[]
  blockedDates?: BlockedDate[]
}

export async function fetchProducts(): Promise<ProductListItem[]> {
  const data = await get<ProductListItem[]>('/api/v1/partners/me/products')
  return data ?? []
}

export async function fetchProduct(venueId: string, productId: string): Promise<Product | null> {
  return get<Product>(`/api/v1/venues/${venueId}/products/${productId}`)
}

export async function createProduct(payload: ProductCreatePayload): Promise<Product | null> {
  return post<Product>(`/api/v1/venues/${payload.venueId}/products`, payload)
}

export async function updateProduct(
  venueId: string,
  productId: string,
  payload: ProductUpdatePayload,
): Promise<Product | null> {
  try {
    const res = await api.put<{ data: Product }>(
      `/api/v1/venues/${venueId}/products/${productId}`,
      payload,
    )
    const body = res.data
    return body && typeof body === 'object' && 'data' in body
      ? body.data
      : (res.data as unknown as Product)
  } catch {
    return null
  }
}

export async function toggleProductActive(
  venueId: string,
  productId: string,
  isActive: boolean,
): Promise<Product | null> {
  return updateProduct(venueId, productId, { isActive })
}

export async function deleteProduct(venueId: string, productId: string): Promise<boolean> {
  try {
    await api.delete(`/api/v1/venues/${venueId}/products/${productId}`)
    return true
  } catch {
    return false
  }
}

export async function fetchPriceHistory(
  venueId: string,
  productId: string,
): Promise<PriceHistoryEntry[]> {
  const data = await get<PriceHistoryEntry[]>(
    `/api/v1/venues/${venueId}/products/${productId}/price-history`,
  )
  return data ?? []
}

export function defaultAvailability(): DayAvailability[] {
  const days = ['월', '화', '수', '목', '금', '토', '일']
  return days.map((day) => ({
    day,
    open: '09:00',
    close: '22:00',
    closed: day === '일',
  }))
}
