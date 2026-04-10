import { get } from './api'

export interface VenueListItem {
  id: number
  name: string
  venueType: string
  ownerType: string
  sportId: number | null
  address: string | null
  siGunGuCode: string | null
  cameraCount: number
  isActive: boolean
}

export async function fetchVenues(): Promise<VenueListItem[]> {
  const data = await get<VenueListItem[]>('/api/v1/partners/me/venues')
  return data ?? []
}
