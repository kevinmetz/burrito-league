import { NextRequest, NextResponse } from 'next/server';
import { getAllChaptersData, ChapterWithData } from '@/lib/strava';
import {
  createPollRun,
  insertSegmentSnapshots,
  SegmentSnapshot,
} from '@/lib/supabase';

// Verify cron secret to prevent unauthorized access
function verifyCronSecret(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return true; // Allow if not configured (dev mode)

  const authHeader = request.headers.get('authorization');
  return authHeader === `Bearer ${cronSecret}`;
}

// Parse effort count from formatted string like "1,234"
function parseEfforts(efforts: string | number | undefined): number | null {
  if (typeof efforts === 'number') return efforts;
  if (!efforts) return null;
  const cleaned = efforts.toString().replace(/,/g, '');
  const parsed = parseInt(cleaned, 10);
  return isNaN(parsed) ? null : parsed;
}

export async function GET(request: NextRequest) {
  // Verify authorization
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const startTime = Date.now();

  try {
    console.log('Poll-Strava: Starting Strava API poll...');

    // 1. Fetch all chapters data from Strava
    const chapters = await getAllChaptersData();
    console.log(`Poll-Strava: Fetched ${chapters.length} chapters`);

    // 2. Count successful fetches
    const successfulChapters = chapters.filter(
      (c) => c.status === 'valid' && c.segmentData !== null
    );

    // Check if we got rate limited (indicated by having valid chapters but no data)
    const validChapters = chapters.filter((c) => c.status === 'valid');
    const wasRateLimited =
      validChapters.length > 0 &&
      successfulChapters.length < validChapters.length * 0.5; // Less than 50% success = likely rate limited

    console.log(
      `Poll-Strava: ${successfulChapters.length}/${validChapters.length} chapters successful`
    );

    // 3. Create poll run record
    const pollRun = await createPollRun(
      validChapters.length,
      successfulChapters.length,
      wasRateLimited,
      'scheduled'
    );

    if (!pollRun) {
      console.error('Poll-Strava: Failed to create poll run record');
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create poll run record (check Supabase config)',
        },
        { status: 500 }
      );
    }

    console.log(`Poll-Strava: Created poll run ${pollRun.id}`);

    // 4. Prepare segment snapshots
    const snapshots: Omit<SegmentSnapshot, 'id' | 'poll_run_id' | 'polled_at'>[] = [];

    for (const chapter of chapters) {
      if (!chapter.segmentId || chapter.status !== 'valid') continue;

      const data = chapter.segmentData;

      snapshots.push({
        segment_id: chapter.segmentId,
        city: chapter.city,
        state: chapter.state || null,
        country: null, // Not stored in current structure, could be added
        display_location: chapter.displayLocation,
        total_efforts: parseEfforts(data?.totalEfforts),
        total_athletes: parseEfforts(data?.totalAthletes),
        total_distance: data?.totalDistance || null,
        male_leader_name: data?.maleLeader?.name || null,
        male_leader_efforts: data?.maleLeader?.efforts || null,
        male_leader_profile_pic: data?.maleLeader?.profilePic || null,
        female_leader_name: data?.femaleLeader?.name || null,
        female_leader_efforts: data?.femaleLeader?.efforts || null,
        female_leader_profile_pic: data?.femaleLeader?.profilePic || null,
      });
    }

    // 5. Insert snapshots - uses "high water mark" approach
    // Only inserts snapshots that are better than existing data
    let insertResult = { inserted: 0, skipped: 0 };
    if (snapshots.length > 0) {
      insertResult = await insertSegmentSnapshots(pollRun.id, snapshots);
      console.log(
        `Poll-Strava: Inserted ${insertResult.inserted} snapshots, skipped ${insertResult.skipped} (existing data was better)`
      );
    }

    const duration = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      pollRunId: pollRun.id,
      totalChapters: chapters.length,
      validChapters: validChapters.length,
      successfulChapters: successfulChapters.length,
      snapshotsInserted: insertResult.inserted,
      snapshotsSkipped: insertResult.skipped,
      wasRateLimited,
      durationMs: duration,
    });
  } catch (error) {
    console.error('Poll-Strava error:', error);
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
