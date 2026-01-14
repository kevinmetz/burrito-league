import { createClient } from '@supabase/supabase-js';

// Database types
export interface PollRun {
  id: string;
  polled_at: string;
  chapters_polled: number;
  chapters_successful: number;
  was_rate_limited: boolean;
  source: 'scheduled' | 'manual' | 'build';
}

export interface SegmentSnapshot {
  id: string;
  poll_run_id: string;
  segment_id: number;
  city: string;
  state: string | null;
  country: string | null;
  display_location: string | null;
  total_efforts: number | null;
  total_athletes: number | null;
  total_distance: string | null;
  male_leader_name: string | null;
  male_leader_efforts: number | null;
  male_leader_profile_pic: string | null;
  female_leader_name: string | null;
  female_leader_efforts: number | null;
  female_leader_profile_pic: string | null;
  polled_at: string;
}

export interface ChapterCoordinate {
  id: string;
  city: string;
  state: string | null;
  country: string;
  lat: number;
  lng: number;
  source: 'geocoded' | 'manual';
  created_at: string;
}

// Create Supabase client for server-side use
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.warn('SUPABASE_URL not configured');
}

// Service role client for cron jobs (full write access)
export const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

// Anon client for read-only operations
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Helper functions

export async function createPollRun(
  chaptersPolled: number,
  chaptersSuccessful: number,
  wasRateLimited: boolean,
  source: 'scheduled' | 'manual' | 'build' = 'scheduled'
): Promise<PollRun | null> {
  if (!supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin
    .from('poll_runs')
    .insert({
      chapters_polled: chaptersPolled,
      chapters_successful: chaptersSuccessful,
      was_rate_limited: wasRateLimited,
      source,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating poll run:', error);
    return null;
  }

  return data;
}

export async function insertSegmentSnapshots(
  pollRunId: string,
  snapshots: Omit<SegmentSnapshot, 'id' | 'poll_run_id' | 'polled_at'>[]
): Promise<boolean> {
  if (!supabaseAdmin) return false;

  const snapshotsWithPollId = snapshots.map((s) => ({
    ...s,
    poll_run_id: pollRunId,
  }));

  const { error } = await supabaseAdmin
    .from('segment_snapshots')
    .insert(snapshotsWithPollId);

  if (error) {
    console.error('Error inserting segment snapshots:', error);
    return false;
  }

  return true;
}

export async function getChapterCoordinates(): Promise<ChapterCoordinate[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('chapter_coordinates')
    .select('*');

  if (error) {
    console.error('Error fetching chapter coordinates:', error);
    return [];
  }

  return data || [];
}

export async function upsertChapterCoordinate(
  city: string,
  state: string | null,
  country: string,
  lat: number,
  lng: number,
  source: 'geocoded' | 'manual' = 'geocoded'
): Promise<boolean> {
  if (!supabaseAdmin) return false;

  const { error } = await supabaseAdmin
    .from('chapter_coordinates')
    .upsert(
      {
        city,
        state,
        country,
        lat,
        lng,
        source,
      },
      {
        onConflict: 'city,state,country',
      }
    );

  if (error) {
    console.error('Error upserting chapter coordinate:', error);
    return false;
  }

  return true;
}

export async function getLatestPollRun(): Promise<PollRun | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('poll_runs')
    .select('*')
    .order('polled_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error('Error fetching latest poll run:', error);
    return null;
  }

  return data;
}

export async function getSnapshotsForPollRun(pollRunId: string): Promise<SegmentSnapshot[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('segment_snapshots')
    .select('*')
    .eq('poll_run_id', pollRunId);

  if (error) {
    console.error('Error fetching snapshots for poll run:', error);
    return [];
  }

  return data || [];
}

export async function getLatestSnapshotForSegment(segmentId: number): Promise<SegmentSnapshot | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('segment_snapshots')
    .select('*')
    .eq('segment_id', segmentId)
    .order('polled_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
    console.error('Error fetching latest snapshot:', error);
    return null;
  }

  return data;
}

export async function getPreviousSnapshotForSegment(
  segmentId: number,
  beforePollRunId: string
): Promise<SegmentSnapshot | null> {
  if (!supabase) return null;

  // Get the poll run to find its timestamp
  const { data: pollRun } = await supabase
    .from('poll_runs')
    .select('polled_at')
    .eq('id', beforePollRunId)
    .single();

  if (!pollRun) return null;

  const { data, error } = await supabase
    .from('segment_snapshots')
    .select('*')
    .eq('segment_id', segmentId)
    .lt('polled_at', pollRun.polled_at)
    .order('polled_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching previous snapshot:', error);
    return null;
  }

  return data;
}

// Type matching strava.ts ChapterWithData for page compatibility
export interface ChapterFromSupabase {
  city: string;
  state: string;
  displayLocation: string;
  segmentId: number | null;
  segmentData: {
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
  } | null;
  segmentUrl: string | null;
  status: 'valid' | 'need_segment';
}

/**
 * Get all chapter data from the latest Supabase poll, combined with Google Sheet metadata.
 * This is the main function for powering the UI from Supabase instead of direct Strava calls.
 * Returns null if no poll data exists yet (triggers fallback to direct Strava).
 */
export async function getChaptersFromSupabase(): Promise<{
  chapters: ChapterFromSupabase[];
  pollRun: PollRun;
  lastUpdated: string;
} | null> {
  if (!supabase) {
    console.warn('Supabase not configured, cannot fetch from database');
    return null;
  }

  // 1. Get the latest poll run
  const { data: pollRun, error: pollError } = await supabase
    .from('poll_runs')
    .select('*')
    .order('polled_at', { ascending: false })
    .limit(1)
    .single();

  if (pollError || !pollRun) {
    console.log('No poll runs found in Supabase, will use direct Strava fetch');
    return null;
  }

  // 2. Get all snapshots for this poll run
  const { data: snapshots, error: snapshotsError } = await supabase
    .from('segment_snapshots')
    .select('*')
    .eq('poll_run_id', pollRun.id);

  if (snapshotsError || !snapshots || snapshots.length === 0) {
    console.log('No snapshots found for poll run, will use direct Strava fetch');
    return null;
  }

  // 3. Fetch Google Sheet for segment URLs and missing chapters
  const { fetchChaptersFromSheet, formatLocation } = await import('./sheets');
  const sheetChapters = await fetchChaptersFromSheet();

  // Create a map of segment IDs to sheet data
  const sheetBySegmentId = new Map<number, typeof sheetChapters[0]>();
  const sheetByCity = new Map<string, typeof sheetChapters[0]>();

  for (const chapter of sheetChapters) {
    if (chapter.segmentId) {
      sheetBySegmentId.set(chapter.segmentId, chapter);
    }
    // Also map by city for chapters without segment data
    const cityKey = `${chapter.city.toLowerCase()}|${chapter.state.toLowerCase()}`;
    sheetByCity.set(cityKey, chapter);
  }

  // 4. Convert snapshots to ChapterFromSupabase format
  const chapters: ChapterFromSupabase[] = [];
  const processedSegmentIds = new Set<number>();

  for (const snapshot of snapshots) {
    const sheetData = sheetBySegmentId.get(snapshot.segment_id);

    processedSegmentIds.add(snapshot.segment_id);

    chapters.push({
      city: snapshot.city,
      state: snapshot.state || '',
      displayLocation: snapshot.display_location || formatLocation(
        snapshot.city,
        snapshot.state || '',
        snapshot.country || 'USA'
      ),
      segmentId: snapshot.segment_id,
      segmentData: {
        segmentId: snapshot.segment_id,
        segmentName: '',
        city: snapshot.city,
        state: snapshot.state || '',
        totalEfforts: snapshot.total_efforts?.toLocaleString() || '0',
        totalAthletes: snapshot.total_athletes?.toLocaleString() || '0',
        totalDistance: snapshot.total_distance || '0 mi',
        maleLeader: {
          name: snapshot.male_leader_name || 'No leader yet',
          profilePic: snapshot.male_leader_profile_pic || '',
          efforts: snapshot.male_leader_efforts || 0,
        },
        femaleLeader: {
          name: snapshot.female_leader_name || 'No leader yet',
          profilePic: snapshot.female_leader_profile_pic || '',
          efforts: snapshot.female_leader_efforts || 0,
        },
        lastUpdated: snapshot.polled_at,
      },
      segmentUrl: sheetData?.segmentUrl || `https://www.strava.com/segments/${snapshot.segment_id}`,
      status: 'valid',
    });
  }

  // 5. Add chapters from sheet that aren't in snapshots (new/missing segments)
  for (const chapter of sheetChapters) {
    if (chapter.status === 'duplicate') continue;

    if (chapter.segmentId && processedSegmentIds.has(chapter.segmentId)) {
      continue; // Already processed
    }

    const displayLocation = formatLocation(chapter.city, chapter.state, chapter.country);

    chapters.push({
      city: chapter.city,
      state: chapter.state,
      displayLocation,
      segmentId: chapter.segmentId,
      segmentData: null, // No data yet
      segmentUrl: chapter.segmentUrl,
      status: chapter.status === 'valid' ? 'valid' : 'need_segment',
    });
  }

  console.log(`Loaded ${chapters.length} chapters from Supabase (poll: ${pollRun.id}, ${snapshots.length} snapshots)`);

  return {
    chapters,
    pollRun,
    lastUpdated: pollRun.polled_at,
  };
}

/**
 * Bootstrap Supabase with initial poll data if empty.
 * Called on first page load when no poll data exists yet.
 * Returns true if bootstrap was performed.
 */
export async function bootstrapIfEmpty(): Promise<boolean> {
  if (!supabaseAdmin) {
    console.log('Bootstrap: Supabase admin not configured, skipping');
    return false;
  }

  // Check if we have any poll runs
  const { data: existingPolls, error } = await supabaseAdmin
    .from('poll_runs')
    .select('id')
    .limit(1);

  if (error) {
    console.error('Bootstrap: Error checking poll_runs:', error);
    return false;
  }

  if (existingPolls && existingPolls.length > 0) {
    console.log('Bootstrap: Data already exists, skipping');
    return false;
  }

  console.log('Bootstrap: No data found, triggering initial poll...');

  try {
    // Import and run the poll logic directly
    const { getAllChaptersData } = await import('./strava');
    const chapters = await getAllChaptersData();

    // Count successful fetches
    const validChapters = chapters.filter((c) => c.status === 'valid');
    const successfulChapters = chapters.filter(
      (c) => c.status === 'valid' && c.segmentData !== null
    );

    const wasRateLimited =
      validChapters.length > 0 &&
      successfulChapters.length < validChapters.length * 0.5;

    // Create poll run record
    const pollRun = await createPollRun(
      validChapters.length,
      successfulChapters.length,
      wasRateLimited,
      'build'
    );

    if (!pollRun) {
      console.error('Bootstrap: Failed to create poll run');
      return false;
    }

    // Prepare and insert snapshots
    const snapshots: Omit<SegmentSnapshot, 'id' | 'poll_run_id' | 'polled_at'>[] = [];

    for (const chapter of chapters) {
      if (!chapter.segmentId || chapter.status !== 'valid') continue;

      const data = chapter.segmentData;
      const parseEfforts = (efforts: string | number | undefined): number | null => {
        if (typeof efforts === 'number') return efforts;
        if (!efforts) return null;
        const cleaned = efforts.toString().replace(/,/g, '');
        const parsed = parseInt(cleaned, 10);
        return isNaN(parsed) ? null : parsed;
      };

      snapshots.push({
        segment_id: chapter.segmentId,
        city: chapter.city,
        state: chapter.state || null,
        country: null,
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

    if (snapshots.length > 0) {
      await insertSegmentSnapshots(pollRun.id, snapshots);
    }

    console.log(`Bootstrap: Completed! Created poll run ${pollRun.id} with ${snapshots.length} snapshots`);
    return true;
  } catch (error) {
    console.error('Bootstrap: Error during initial poll:', error);
    return false;
  }
}
