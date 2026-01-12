import { getFallbackData, FALLBACK_DATA_DATE } from './fallbackData';
import { saveAllChaptersSnapshot, loadCachedChapters } from './supabase';

// Data priority:
// 1. Fresh Strava API data (save to Supabase on success)
// 2. Supabase cached data (from last successful poll)
// 3. Hardcoded fallback data (ensures site never shows empty)

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

// Track if we're rate limited
let isRateLimited = false;

interface LocalLegend {
  athlete_id: number;
  title: string;
  profile: string;
  mayor_effort_count: number;
  effort_description: string;
}

interface LocalLegendResponse {
  category: string;
  local_legend: LocalLegend;
  overall_efforts: {
    total_athletes: string;
    total_efforts: string;
    total_distance: string;
  };
}

export interface SegmentData {
  segmentId: number;
  segmentName: string;
  city: string;
  state: string;
  totalEfforts: string;
  totalAthletes: string;
  totalDistance: string;
  maleLeader: {
    name: string;
    profilePic: string;
    efforts: number;
  };
  femaleLeader: {
    name: string;
    profilePic: string;
    efforts: number;
  };
  lastUpdated: string;
}

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  // Return cached token if still valid (with 5 min buffer)
  if (cachedToken && cachedToken.expiresAt > Date.now() / 1000 + 300) {
    return cachedToken.token;
  }

  const response = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.STRAVA_CLIENT_ID!,
      client_secret: process.env.STRAVA_CLIENT_SECRET!,
      refresh_token: process.env.STRAVA_REFRESH_TOKEN!,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to refresh token: ${response.status}`);
  }

  const data: TokenResponse = await response.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: data.expires_at,
  };

  return data.access_token;
}

async function fetchLocalLegend(
  segmentId: number,
  category: 'overall' | 'female',
  token: string
): Promise<LocalLegendResponse | null> {
  const url = `https://www.strava.com/api/v3/segments/${segmentId}/local_legend?categories[]=${category}`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    if (response.status === 429) {
      console.error(`Rate limited by Strava API (429) - using fallback data`);
      isRateLimited = true;
    } else {
      console.error(`Failed to fetch local legend for ${segmentId}: ${response.status}`);
    }
    return null;
  }

  const data: LocalLegendResponse[] = await response.json();
  return data?.[0] || null;
}

function getMockSegmentData(
  segmentId: number,
  chapterInfo?: { city: string; state: string }
): SegmentData {
  return {
    segmentId,
    segmentName: 'Mock Segment',
    city: chapterInfo?.city || 'Mock City',
    state: chapterInfo?.state || 'Mock State',
    totalEfforts: '1,234',
    totalAthletes: '567',
    totalDistance: '890 mi',
    maleLeader: {
      name: 'Test Runner M',
      profilePic: '',
      efforts: 42,
    },
    femaleLeader: {
      name: 'Test Runner F',
      profilePic: '',
      efforts: 38,
    },
    lastUpdated: new Date().toISOString(),
  };
}

export async function getSegmentData(
  segmentId: number,
  chapterInfo?: { city: string; state: string }
): Promise<SegmentData | null> {
  // Use mock data for development (set USE_MOCK_DATA=true in env)
  if (process.env.USE_MOCK_DATA === 'true') {
    return getMockSegmentData(segmentId, chapterInfo);
  }

  const token = await getAccessToken();

  // Fetch both categories in parallel
  const [overallData, femaleData] = await Promise.all([
    fetchLocalLegend(segmentId, 'overall', token),
    fetchLocalLegend(segmentId, 'female', token),
  ]);

  // If no local legend data, return null
  if (!overallData) {
    return null;
  }

  // Use provided chapter info or fetch from API
  let city = chapterInfo?.city || '';
  let state = chapterInfo?.state || '';
  let segmentName = '';

  if (!chapterInfo) {
    const segmentResponse = await fetch(
      `https://www.strava.com/api/v3/segments/${segmentId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const segmentDetails = await segmentResponse.json();
    city = segmentDetails.city;
    state = segmentDetails.state;
    segmentName = segmentDetails.name;
  }

  const defaultLeader = {
    name: 'No leader yet',
    profilePic: '',
    efforts: 0,
  };

  // Check if overall leader is the same as female leader (meaning the overall leader is female)
  const overallIsFemale =
    overallData.local_legend &&
    femaleData?.local_legend &&
    overallData.local_legend.athlete_id === femaleData.local_legend.athlete_id;

  return {
    segmentId,
    segmentName,
    city,
    state,
    totalEfforts: overallData.overall_efforts?.total_efforts || '0',
    totalAthletes: overallData.overall_efforts?.total_athletes || '0',
    totalDistance: overallData.overall_efforts?.total_distance || '0 mi',
    maleLeader: overallData.local_legend && !overallIsFemale
      ? {
          name: overallData.local_legend.title,
          profilePic: overallData.local_legend.profile,
          efforts: overallData.local_legend.mayor_effort_count,
        }
      : defaultLeader,
    femaleLeader: femaleData?.local_legend
      ? {
          name: femaleData.local_legend.title,
          profilePic: femaleData.local_legend.profile,
          efforts: femaleData.local_legend.mayor_effort_count,
        }
      : defaultLeader,
    lastUpdated: new Date().toISOString(),
  };
}

import { fetchChaptersFromSheet, formatLocation, SheetChapter } from './sheets';
import { getSegmentId } from './segmentIds';

export interface ChapterWithData {
  city: string;
  state: string;
  displayLocation: string;
  segmentId: number | null;
  segmentData: SegmentData | null;
  segmentUrl: string | null;
}

export async function getAllChaptersData(): Promise<ChapterWithData[]> {
  // Fetch chapters from Google Sheet
  const sheetChapters = await fetchChaptersFromSheet();
  const results: ChapterWithData[] = [];

  // Track location counts for numbering duplicates
  const locationCounts: Record<string, number> = {};
  const seenSegments = new Set<number>();

  // Track if we got any fresh data from Strava
  let gotFreshData = false;

  for (const chapter of sheetChapters) {
    const baseLocation = formatLocation(chapter.city, chapter.state, chapter.country);

    // Look up segment by name first, then city
    const segmentId = getSegmentId(chapter.segmentName, chapter.city);

    // Skip if we've already seen this segment ID (true duplicate)
    if (segmentId && seenSegments.has(segmentId)) {
      continue;
    }
    if (segmentId) {
      seenSegments.add(segmentId);
    }

    // Number duplicate locations (e.g., Atlanta, GA #1, Atlanta, GA #2)
    locationCounts[baseLocation] = (locationCounts[baseLocation] || 0) + 1;
    const count = locationCounts[baseLocation];

    // Check if this location will have duplicates by scanning ahead
    const totalForLocation = sheetChapters.filter(
      c => formatLocation(c.city, c.state, c.country) === baseLocation &&
           getSegmentId(c.segmentName, c.city) !== null
    ).length;

    const displayLocation = totalForLocation > 1
      ? `${baseLocation} #${count}`
      : baseLocation;

    let segmentData: SegmentData | null = null;

    if (segmentId) {
      try {
        // Skip API call if we're already rate limited
        if (!isRateLimited) {
          segmentData = await getSegmentData(segmentId, {
            city: chapter.city,
            state: chapter.state,
          });
          if (segmentData) {
            gotFreshData = true;
          }
        }
      } catch (error) {
        console.error(`Failed to fetch data for ${chapter.city}:`, error);
      }
    }

    results.push({
      city: chapter.city,
      state: chapter.state,
      displayLocation,
      segmentId,
      segmentData,
      segmentUrl: segmentId ? `https://www.strava.com/segments/${segmentId}` : null,
    });
  }

  // If we got fresh data, save to Supabase cache
  if (gotFreshData && !isRateLimited) {
    console.log('Saving fresh data to Supabase cache...');
    saveAllChaptersSnapshot(results).catch(err =>
      console.error('Failed to save to Supabase:', err)
    );
    return results;
  }

  // If rate limited or no fresh data, try Supabase cache first
  if (isRateLimited || !gotFreshData) {
    console.log('Trying Supabase cache...');
    const cachedData = await loadCachedChapters();

    if (cachedData && cachedData.length > 0) {
      console.log(`Using ${cachedData.length} chapters from Supabase cache`);
      return cachedData;
    }

    // Tier 3: Fall back to hardcoded data if Supabase is empty
    console.log('Supabase empty, using hardcoded fallback data...');
    for (const result of results) {
      if (result.segmentId && !result.segmentData) {
        const fallback = getFallbackData(result.city);
        if (fallback) {
          result.segmentData = {
            segmentId: result.segmentId,
            segmentName: '',
            city: result.city,
            state: result.state,
            totalEfforts: fallback.totalEfforts,
            totalAthletes: '0',
            totalDistance: '0 mi',
            maleLeader: fallback.maleLeader,
            femaleLeader: fallback.femaleLeader,
            lastUpdated: FALLBACK_DATA_DATE,
          };
        }
      }
    }
  }

  return results;
}
