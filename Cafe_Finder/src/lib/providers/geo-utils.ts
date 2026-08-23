/**
 * Haversine formula for exact distance between two GPS coordinates in kilometers.
 */
export function haversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Formats distance into a human-friendly string (e.g. "350 m", "2.4 km").
 */
export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

/**
 * Standardizes place names to eliminate trivial naming differences.
 * e.g. "The Blue Tokai Cafe!" -> "blue tokai"
 */
export function normalizePlaceName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\b(the|cafe|coffee|roastery|bakery|restaurant|bar|co-working|coworking|espresso|tea|house)\b/gi, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

/**
 * Computes Levenshtein edit distance between two strings.
 */
export function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

/**
 * Checks if two places are duplicates (within <= 25m proximity and matching name similarity).
 */
export function areDuplicates(
  placeA: { lat: number; lng: number; name: string },
  placeB: { lat: number; lng: number; name: string }
): boolean {
  const distanceKm = haversineDistanceKm(placeA.lat, placeA.lng, placeB.lat, placeB.lng);
  
  // Proximity threshold: 25 meters (0.025 km)
  if (distanceKm > 0.025) return false;

  const normA = normalizePlaceName(placeA.name);
  const normB = normalizePlaceName(placeB.name);

  if (!normA || !normB) return true; // At same coordinate within 25m
  if (normA === normB) return true;

  const editDistance = levenshteinDistance(normA, normB);
  const maxLength = Math.max(normA.length, normB.length);
  return editDistance <= Math.max(2, Math.floor(maxLength * 0.25));
}
