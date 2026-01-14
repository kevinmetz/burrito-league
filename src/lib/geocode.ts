// Geocoding helper using Nominatim (OpenStreetMap)
// Free service, no API key required
// Rate limit: 1 request per second (we add delays)

interface GeocodingResult {
  lat: number;
  lng: number;
}

interface NominatimResponse {
  lat: string;
  lon: string;
  display_name: string;
}

// Country code mappings for better geocoding results
const COUNTRY_CODES: Record<string, string> = {
  'USA': 'us',
  'US': 'us',
  'CAN': 'ca',
  'Canada': 'ca',
  'AUS': 'au',
  'Australia': 'au',
  'NZ': 'nz',
  'New Zealand': 'nz',
  'MEX': 'mx',
  'Mexico': 'mx',
  'Chile': 'cl',
};

/**
 * Geocode a city/state/country to lat/lng coordinates using Nominatim
 * @param city - City name
 * @param state - State/province (optional)
 * @param country - Country name or code
 * @returns Coordinates or null if not found
 */
export async function geocodeCity(
  city: string,
  state: string | null,
  country: string
): Promise<GeocodingResult | null> {
  try {
    // Build query string
    const parts = [city.trim()];
    if (state) parts.push(state.trim());
    parts.push(country.trim());
    const query = parts.join(', ');

    // Get country code for better results
    const countryCode = COUNTRY_CODES[country] || COUNTRY_CODES[country.toUpperCase()];

    // Build URL with parameters
    const params = new URLSearchParams({
      q: query,
      format: 'json',
      limit: '1',
      addressdetails: '0',
    });

    if (countryCode) {
      params.set('countrycodes', countryCode);
    }

    const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;

    const response = await fetch(url, {
      headers: {
        // Nominatim requires a valid User-Agent
        'User-Agent': 'BurritoLeague/1.0 (https://burrito.run)',
      },
    });

    if (!response.ok) {
      console.error(`Geocoding failed for "${query}": ${response.status}`);
      return null;
    }

    const data: NominatimResponse[] = await response.json();

    if (!data || data.length === 0) {
      console.warn(`No geocoding results for "${query}"`);
      return null;
    }

    const result = data[0];
    return {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
    };
  } catch (error) {
    console.error(`Geocoding error for ${city}, ${state}, ${country}:`, error);
    return null;
  }
}

/**
 * Delay helper to respect Nominatim rate limits
 * @param ms - Milliseconds to wait (default 1100ms for safety)
 */
export function delay(ms: number = 1100): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Batch geocode multiple cities with rate limiting
 * @param cities - Array of city/state/country tuples
 * @returns Map of city key to coordinates
 */
export async function batchGeocode(
  cities: Array<{ city: string; state: string | null; country: string }>
): Promise<Map<string, GeocodingResult>> {
  const results = new Map<string, GeocodingResult>();

  for (const { city, state, country } of cities) {
    const coords = await geocodeCity(city, state, country);

    if (coords) {
      const key = `${city}|${state || ''}|${country}`;
      results.set(key, coords);
      console.log(`Geocoded: ${city}, ${state || '-'}, ${country} → ${coords.lat}, ${coords.lng}`);
    }

    // Respect rate limit
    await delay();
  }

  return results;
}
