export type PlugDensity = 'NONE' | 'SCARCE' | 'MODERATE' | 'PLENTIFUL' | 'AT_EVERY_SEAT';
export type NoiseLevel = 'SILENT' | 'QUIET' | 'MODERATE' | 'LIVELY' | 'NOISY';
export type SeatingCapacity = 'SMALL' | 'MEDIUM' | 'LARGE' | 'SPACIOUS';
export type SeatingComfort = 'BASIC' | 'MIXED' | 'ERGONOMIC' | 'COZY_COUCHES';
export type LightingType = 'NATURAL_LIGHT' | 'BRIGHT' | 'DIM_COZY' | 'MIXED';
export type FoodOption = 'NONE' | 'PASTRIES' | 'LIGHT_BITES' | 'FULL_MENU';
export type WifiReliability = 'ROCK_SOLID' | 'STABLE' | 'SPOTTY';

export type CafeSource = 'OSM' | 'GOOGLE' | 'MAPBOX' | 'USER_SUBMITTED' | 'VERIFIED' | 'db' | 'osm';

/** Lightweight OpenStreetMap cafe result */
export interface OsmCafe {
  id: string;            // "osm_<node_id>"
  osmId: number;
  source: 'osm';
  name: string;
  lat: number;
  lng: number;
  address: string;
  city: string;
  neighborhood?: string;
  website?: string;
  phone?: string;
  openingHours?: string;
  coverImage: string;
  distanceKm: number;
}

export interface CafeReview {
  id: string;
  cafeId: string;
  userId?: string | null;
  authorName: string;
  authorAvatar?: string | null;
  overallRating: number;
  wifiRating: number;
  noiseRating: number;
  outletRating: number;
  comfortRating: number;
  coffeeRating: number;
  reportedWifiSpeed?: number | null;
  comment: string;
  bestForTags?: string | null;
  visitTiming?: string | null;
  helpfulCount: number;
  createdAt: string | Date;
}

export interface SpeedTestLogItem {
  id: string;
  cafeId: string;
  downloadMbps: number;
  uploadMbps: number;
  pingMs: number;
  deviceType?: string | null;
  createdAt: string | Date;
}

export interface CafeItem {
  id: string;
  name: string;
  slug: string;
  tagline?: string | null;
  description: string;
  address: string;
  city: string;
  neighborhood?: string | null;
  lat: number;
  lng: number;
  phone?: string | null;
  website?: string | null;
  googlePlaceId?: string | null;
  coverImage: string;
  images: string;
  priceLevel: number;

  hasWifi: boolean;
  wifiSpeedMbps: number;
  wifiUploadMbps: number;
  wifiReliability: string;
  wifiPasswordNote?: string | null;

  powerPlugDensity: string;
  noiseLevel: string;
  seatingCapacity: string;
  seatingComfort: string;
  lighting: string;

  hasOutdoorSeating: boolean;
  isPetFriendly: boolean;
  hasCallBooths: boolean;
  hasMeetingRooms: boolean;
  hasParking: boolean;
  hasAirConditioning: boolean;
  hasRestrooms: boolean;
  openLate: boolean;

  specialtyCoffee: boolean;
  roasterName?: string | null;
  foodOptions: string;
  veganOptions: boolean;

  status: string;
  isVerified: boolean;
  openingHours: string;

  averageRating: number;
  reviewCount: number;

  reviews?: CafeReview[];
  speedTests?: SpeedTestLogItem[];
  createdAt?: string | Date;

  /** Added at query time */
  source?: CafeSource;
  distanceKm?: number;
}

export interface CuratedListItemType {
  id: string;
  listId: string;
  cafeId: string;
  cafe: CafeItem;
  curatorNote?: string | null;
  order: number;
}

export interface CuratedListType {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverImage?: string | null;
  isPublic: boolean;
  tags?: string | null;
  authorName: string;
  userId?: string | null;
  createdAt: string | Date;
  items: CuratedListItemType[];
}

export interface FilterState {
  searchQuery: string;
  city: string;
  minWifiSpeed: number;
  plugDensity: string[];
  noiseLevel: string[];
  seatingComfort: string[];
  lighting: string[];
  foodOptions: string[];
  openLateOnly: boolean;
  specialtyCoffeeOnly: boolean;
  outdoorSeatingOnly: boolean;
  petFriendlyOnly: boolean;
  callBoothsOnly: boolean;
  verifiedOnly: boolean;
  sortBy: 'highest_rated' | 'fastest_wifi' | 'plug_density' | 'most_reviews' | 'name' | 'nearest';
  /** Geolocation filters */
  nearMe: boolean;
  radiusKm: number;
}

export interface UserLocation {
  lat: number;
  lng: number;
  accuracy: number;
}
