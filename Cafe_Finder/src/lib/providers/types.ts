export interface RawOsmElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

export interface OverpassResponse {
  elements: RawOsmElement[];
}

export interface NormalizedPlace {
  id: string;
  source: 'OSM' | 'GOOGLE' | 'MAPBOX' | 'USER_SUBMITTED' | 'VERIFIED';
  osmId?: bigint | null;
  googlePlaceId?: string | null;
  mapboxId?: string | null;
  name: string;
  slug: string;
  lat: number;
  lng: number;
  address: string;
  city: string;
  neighborhood?: string | null;
  phone?: string | null;
  website?: string | null;
  coverImage: string;
  images: string;
  distanceKm?: number;

  hasWifi: boolean;
  wifiSpeedMbps: number;
  wifiUploadMbps: number;
  wifiReliability: string;
  powerPlugDensity: string;
  noiseLevel: string;
  seatingComfort: string;
  isVerified: boolean;
  status: string;
  openingHours: string;
  averageRating: number;
  reviewCount: number;
}
