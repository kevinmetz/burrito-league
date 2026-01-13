// GPS coordinates for all Burrito League chapter cities
// Format: [latitude, longitude]

export interface ChapterCoordinates {
  city: string;
  state: string;
  country: string;
  lat: number;
  lng: number;
}

export const chapterCoordinates: ChapterCoordinates[] = [
  // Canada - Alberta
  { city: 'Calgary', state: 'Alberta', country: 'Canada', lat: 51.0447, lng: -114.0719 },
  { city: 'Crowsnest Pass', state: 'Alberta', country: 'Canada', lat: 49.5958, lng: -114.4128 },
  { city: 'Red Deer', state: 'Alberta', country: 'Canada', lat: 52.2681, lng: -113.8112 },

  // Canada - British Columbia
  { city: 'Colwood', state: 'British Columbia', country: 'Canada', lat: 48.4236, lng: -123.4958 },
  { city: 'Vancouver', state: 'British Columbia', country: 'Canada', lat: 49.2827, lng: -123.1207 },

  // Canada - Manitoba
  { city: 'Winnipeg', state: 'Manitoba', country: 'Canada', lat: 49.8951, lng: -97.1384 },

  // Canada - Nova Scotia
  { city: 'Dartmouth', state: 'Nova Scotia', country: 'Canada', lat: 44.6713, lng: -63.5772 },
  { city: 'Hanover', state: 'Nova Scotia', country: 'Canada', lat: 44.4500, lng: -65.0667 },

  // Canada - Ontario
  { city: 'Toronto', state: 'Ontario', country: 'Canada', lat: 43.6532, lng: -79.3832 },
  { city: 'Hamilton', state: 'Ontario', country: 'Canada', lat: 43.2557, lng: -79.8711 },

  // USA - Arizona
  { city: 'Tempe', state: 'Arizona', country: 'USA', lat: 33.4255, lng: -111.9400 },
  { city: 'Flagstaff', state: 'Arizona', country: 'USA', lat: 35.1983, lng: -111.6513 },
  { city: 'Tucson', state: 'Arizona', country: 'USA', lat: 32.2226, lng: -110.9747 },
  { city: 'Prescott', state: 'Arizona', country: 'USA', lat: 34.5400, lng: -112.4685 },
  { city: 'Marana', state: 'Arizona', country: 'USA', lat: 32.4366, lng: -111.2253 },
  { city: 'Gila Bend', state: 'Arizona', country: 'USA', lat: 32.9478, lng: -112.7166 },

  // USA - California
  { city: 'Redlands', state: 'California', country: 'USA', lat: 34.0556, lng: -117.1825 },
  { city: 'San Francisco', state: 'California', country: 'USA', lat: 37.7749, lng: -122.4194 },
  { city: 'Santa Barbara', state: 'California', country: 'USA', lat: 34.4208, lng: -119.6982 },
  { city: 'Auburn', state: 'California', country: 'USA', lat: 38.8966, lng: -121.0769 },
  { city: 'La Quinta', state: 'California', country: 'USA', lat: 33.6634, lng: -116.3100 },
  { city: 'Oceanside', state: 'California', country: 'USA', lat: 33.1959, lng: -117.3795 },
  { city: 'Palm Springs', state: 'California', country: 'USA', lat: 33.8303, lng: -116.5453 },
  { city: 'Roseville-Rocklin', state: 'California', country: 'USA', lat: 38.7521, lng: -121.2880 },
  { city: 'Lompoc', state: 'California', country: 'USA', lat: 34.6392, lng: -120.4579 },
  { city: 'Arcata', state: 'California', country: 'USA', lat: 40.8665, lng: -124.0828 },

  // USA - Colorado
  { city: 'Denver', state: 'Colorado', country: 'USA', lat: 39.7392, lng: -104.9903 },
  { city: 'Boulder', state: 'Colorado', country: 'USA', lat: 40.0150, lng: -105.2705 },
  { city: 'Castle Rock', state: 'Colorado', country: 'USA', lat: 39.3722, lng: -104.8561 },
  { city: 'Berthoud', state: 'Colorado', country: 'USA', lat: 40.3083, lng: -105.0811 },
  { city: 'Windsor', state: 'Colorado', country: 'USA', lat: 40.4775, lng: -104.9014 },
  { city: 'Golden', state: 'Colorado', country: 'USA', lat: 39.7555, lng: -105.2211 },
  { city: 'Salida', state: 'Colorado', country: 'USA', lat: 38.5347, lng: -105.9989 },

  // USA - Florida
  { city: 'Ponte Vedra', state: 'Florida', country: 'USA', lat: 30.2397, lng: -81.3856 },

  // USA - Georgia
  { city: 'Atlanta', state: 'Georgia', country: 'USA', lat: 33.7490, lng: -84.3880 },

  // USA - Hawaii
  { city: 'Koloa', state: 'Hawaii', country: 'USA', lat: 21.9067, lng: -159.4700 },

  // USA - Idaho
  { city: 'Boise', state: 'Idaho', country: 'USA', lat: 43.6150, lng: -116.2023 },

  // USA - Indiana
  { city: 'Westfield', state: 'Indiana', country: 'USA', lat: 40.0428, lng: -86.1275 },

  // USA - Montana
  { city: 'Bozeman', state: 'Montana', country: 'USA', lat: 45.6770, lng: -111.0429 },
  { city: 'Missoula', state: 'Montana', country: 'USA', lat: 46.8721, lng: -113.9940 },

  // USA - Nevada
  { city: 'Las Vegas', state: 'Nevada', country: 'USA', lat: 36.1699, lng: -115.1398 },

  // USA - New York
  { city: 'New Paltz', state: 'New York', country: 'USA', lat: 41.7495, lng: -74.0868 },
  { city: 'Saratoga Springs', state: 'New York', country: 'USA', lat: 43.0831, lng: -73.7846 },
  { city: 'New York', state: 'New York', country: 'USA', lat: 40.7128, lng: -74.0060 },

  // USA - Pennsylvania
  { city: 'Henryville', state: 'Pennsylvania', country: 'USA', lat: 41.0739, lng: -75.2793 },

  // USA - Tennessee
  { city: 'Chattanooga', state: 'Tennessee', country: 'USA', lat: 35.0456, lng: -85.3097 },
  { city: 'Nashville', state: 'Tennessee', country: 'USA', lat: 36.1627, lng: -86.7816 },

  // USA - Texas
  { city: 'Houston', state: 'Texas', country: 'USA', lat: 29.7604, lng: -95.3698 },

  // USA - Utah
  { city: 'St George', state: 'Utah', country: 'USA', lat: 37.0965, lng: -113.5684 },

  // USA - Washington
  { city: 'Winthrop', state: 'Washington', country: 'USA', lat: 48.4793, lng: -120.1862 },
  { city: 'Aberdeen', state: 'Washington', country: 'USA', lat: 46.9754, lng: -123.8157 },

  // USA - Washington DC
  { city: 'Washington DC', state: 'DC', country: 'USA', lat: 38.9072, lng: -77.0369 },

  // Australia
  { city: 'Sydney', state: 'New South Wales', country: 'Australia', lat: -33.8688, lng: 151.2093 },

  // Mexico
  { city: 'Guadalajara', state: 'Jalisco', country: 'Mexico', lat: 20.6597, lng: -103.3496 },

  // New Zealand
  { city: 'Auckland', state: 'Auckland', country: 'New Zealand', lat: -36.8509, lng: 174.7645 },
];

// Helper to convert lat/lng to 3D sphere coordinates
export function latLngToVector3(lat: number, lng: number, radius: number = 1): [number, number, number] {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return [x, y, z];
}
