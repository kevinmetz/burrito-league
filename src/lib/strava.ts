interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

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
    console.error(`Failed to fetch local legend for ${segmentId}: ${response.status}`);
    return null;
  }

  const data: LocalLegendResponse[] = await response.json();
  return data?.[0] || null;
}

export async function getSegmentData(
  segmentId: number,
  chapterInfo?: { city: string; state: string }
): Promise<SegmentData | null> {
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

import { chapters, Chapter } from './chapters';

export async function getAllChaptersData(): Promise<SegmentData[]> {
  const results: SegmentData[] = [];

  // Fetch in batches to avoid rate limits
  for (const chapter of chapters) {
    try {
      const data = await getSegmentData(chapter.segmentId, {
        city: chapter.city,
        state: chapter.state,
      });
      if (data) {
        results.push(data);
      }
    } catch (error) {
      console.error(`Failed to fetch data for ${chapter.city}:`, error);
    }
  }

  return results;
}
