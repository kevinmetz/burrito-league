import { NextRequest, NextResponse } from 'next/server';
import { fetchChaptersFromSheet } from '@/lib/sheets';
import { chapterCoordinates } from '@/lib/coordinates';
import { getChapterCoordinates, upsertChapterCoordinate } from '@/lib/supabase';
import { geocodeCity, delay } from '@/lib/geocode';

// Verify cron secret to prevent unauthorized access
function verifyCronSecret(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return true; // Allow if not configured (dev mode)

  const authHeader = request.headers.get('authorization');
  return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(request: NextRequest) {
  // Verify authorization
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('Pre-poll: Starting city scan...');

    // 1. Fetch current chapters from Google Sheet
    const sheetChapters = await fetchChaptersFromSheet();
    console.log(`Pre-poll: Found ${sheetChapters.length} chapters in sheet`);

    // 2. Get known cities from static coordinates
    const staticCities = new Set(
      chapterCoordinates.map((c) => `${c.city.toLowerCase()}|${(c.state || '').toLowerCase()}|${c.country.toLowerCase()}`)
    );

    // 3. Get known cities from Supabase
    const supabaseCities = await getChapterCoordinates();
    const supabaseCitySet = new Set(
      supabaseCities.map((c) => `${c.city.toLowerCase()}|${(c.state || '').toLowerCase()}|${c.country.toLowerCase()}`)
    );

    // 4. Find new cities not in either source
    const newCities: Array<{ city: string; state: string; country: string }> = [];

    for (const chapter of sheetChapters) {
      if (chapter.status === 'duplicate') continue;

      const key = `${chapter.city.toLowerCase()}|${(chapter.state || '').toLowerCase()}|${chapter.country.toLowerCase()}`;

      if (!staticCities.has(key) && !supabaseCitySet.has(key)) {
        newCities.push({
          city: chapter.city,
          state: chapter.state,
          country: chapter.country,
        });
      }
    }

    console.log(`Pre-poll: Found ${newCities.length} new cities to geocode`);

    if (newCities.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No new cities to geocode',
        sheetChapters: sheetChapters.length,
        newCities: 0,
        geocoded: 0,
      });
    }

    // 5. Geocode new cities and save to Supabase
    let geocodedCount = 0;
    const geocodedCities: string[] = [];
    const failedCities: string[] = [];

    for (const { city, state, country } of newCities) {
      console.log(`Pre-poll: Geocoding ${city}, ${state || '-'}, ${country}...`);

      const coords = await geocodeCity(city, state || null, country);

      if (coords) {
        const saved = await upsertChapterCoordinate(
          city,
          state || null,
          country,
          coords.lat,
          coords.lng,
          'geocoded'
        );

        if (saved) {
          geocodedCount++;
          geocodedCities.push(`${city}, ${state || country}`);
          console.log(`Pre-poll: Saved ${city} at ${coords.lat}, ${coords.lng}`);
        } else {
          failedCities.push(`${city}, ${state || country} (save failed)`);
        }
      } else {
        failedCities.push(`${city}, ${state || country} (geocode failed)`);
        console.warn(`Pre-poll: Could not geocode ${city}, ${state || '-'}, ${country}`);
      }

      // Rate limit: wait between requests
      await delay(1100);
    }

    console.log(`Pre-poll: Completed. Geocoded ${geocodedCount}/${newCities.length} cities`);

    return NextResponse.json({
      success: true,
      message: `Geocoded ${geocodedCount} new cities`,
      sheetChapters: sheetChapters.length,
      newCities: newCities.length,
      geocoded: geocodedCount,
      geocodedCities,
      failedCities: failedCities.length > 0 ? failedCities : undefined,
    });
  } catch (error) {
    console.error('Pre-poll error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Also support POST for manual triggers
export async function POST(request: NextRequest) {
  return GET(request);
}
