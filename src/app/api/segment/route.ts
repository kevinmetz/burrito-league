import { NextResponse } from 'next/server';
import { getSegmentData, SegmentData } from '@/lib/strava';

// Cache the data in memory
let cachedData: { data: SegmentData; timestamp: number } | null = null;
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

// Tempe segment ID
const TEMPE_SEGMENT_ID = 40744376;

export async function GET() {
  try {
    // Check cache
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
      return NextResponse.json(cachedData.data);
    }

    // Fetch fresh data
    const data = await getSegmentData(TEMPE_SEGMENT_ID);

    // Update cache
    cachedData = {
      data,
      timestamp: Date.now(),
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching segment data:', error);

    // Return cached data if available, even if stale
    if (cachedData) {
      return NextResponse.json(cachedData.data);
    }

    return NextResponse.json(
      { error: 'Failed to fetch segment data' },
      { status: 500 }
    );
  }
}
