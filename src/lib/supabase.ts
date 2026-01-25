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

export interface PollDetail {
  id: string;
  poll_run_id: string;
  segment_id: number;
  display_location: string | null;
  // What Strava API returned
  api_total_efforts: number | null;
  api_male_leader_name: string | null;
  api_male_leader_efforts: number | null;
  api_female_leader_name: string | null;
  api_female_leader_efforts: number | null;
  // What we had before
  existing_total_efforts: number | null;
  existing_male_leader_efforts: number | null;
  existing_female_leader_efforts: number | null;
  // What we did
  action: 'inserted' | 'skipped' | 'no_data';
  skip_reason: string | null;
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

/**
 * Get all segment effort counts for sorting by activity
 * Returns a map of segmentId → total_efforts
 */
export async function getAllSegmentEfforts(): Promise<Map<number, number>> {
  if (!supabase) return new Map();

  const { data, error } = await supabase
    .from('segment_snapshots')
    .select('segment_id, total_efforts')
    .order('polled_at', { ascending: false });

  if (error) {
    console.error('Error fetching segment efforts:', error);
    return new Map();
  }

  // Keep only the most recent effort count per segment
  const effortsBySegment = new Map<number, number>();
  for (const row of data || []) {
    if (!effortsBySegment.has(row.segment_id) && row.total_efforts) {
      effortsBySegment.set(row.segment_id, row.total_efforts);
    }
  }

  return effortsBySegment;
}

/**
 * Get the latest snapshot for each segment ID
 * Used to compare against new data before inserting
 */
export async function getLatestSnapshots(
  segmentIds: number[]
): Promise<Map<number, SegmentSnapshot>> {
  if (!supabase || segmentIds.length === 0) return new Map();

  const { data, error } = await supabase
    .from('segment_snapshots')
    .select('*')
    .in('segment_id', segmentIds)
    .order('polled_at', { ascending: false });

  if (error) {
    console.error('Error fetching latest snapshots:', error);
    return new Map();
  }

  // Keep only the most recent snapshot per segment
  const latestBySegment = new Map<number, SegmentSnapshot>();
  for (const snapshot of data || []) {
    if (!latestBySegment.has(snapshot.segment_id)) {
      latestBySegment.set(snapshot.segment_id, snapshot);
    }
  }

  return latestBySegment;
}

/**
 * Check if new snapshot data is "better" than existing
 * Better means: more efforts, or has leader data where existing doesn't
 * This implements the "high water mark" approach - data only goes up, never backwards
 */
function isSnapshotBetter(
  newSnapshot: Omit<SegmentSnapshot, 'id' | 'poll_run_id' | 'polled_at'>,
  existing: SegmentSnapshot | undefined
): boolean {
  // No existing data = new data is always better (if it has any data)
  if (!existing) {
    return (newSnapshot.total_efforts ?? 0) > 0 ||
           !!newSnapshot.male_leader_name ||
           !!newSnapshot.female_leader_name;
  }

  // New data is empty/null = never overwrite
  if (!newSnapshot.total_efforts && !newSnapshot.male_leader_name && !newSnapshot.female_leader_name) {
    return false;
  }

  // Compare total efforts - higher is better
  const newEfforts = newSnapshot.total_efforts ?? 0;
  const existingEfforts = existing.total_efforts ?? 0;
  if (newEfforts > existingEfforts) {
    return true;
  }

  // If efforts are equal, check if we have new leader data
  if (newEfforts === existingEfforts) {
    // Has male leader where existing didn't
    if (newSnapshot.male_leader_name && !existing.male_leader_name) {
      return true;
    }
    // Has female leader where existing didn't
    if (newSnapshot.female_leader_name && !existing.female_leader_name) {
      return true;
    }
    // Male leader has more efforts
    if ((newSnapshot.male_leader_efforts ?? 0) > (existing.male_leader_efforts ?? 0)) {
      return true;
    }
    // Female leader has more efforts
    if ((newSnapshot.female_leader_efforts ?? 0) > (existing.female_leader_efforts ?? 0)) {
      return true;
    }
  }

  return false;
}

/**
 * Insert poll details for diagnostics - records what Strava returned vs what we had
 */
async function insertPollDetails(
  pollRunId: string,
  details: Omit<PollDetail, 'id' | 'created_at'>[]
): Promise<void> {
  if (!supabaseAdmin || details.length === 0) return;

  const { error } = await supabaseAdmin
    .from('poll_details')
    .insert(details.map(d => ({ ...d, poll_run_id: pollRunId })));

  if (error) {
    console.error('Error inserting poll details:', error);
  }
}

export async function insertSegmentSnapshots(
  pollRunId: string,
  snapshots: Omit<SegmentSnapshot, 'id' | 'poll_run_id' | 'polled_at'>[]
): Promise<{ inserted: number; skipped: number }> {
  if (!supabaseAdmin) return { inserted: 0, skipped: 0 };

  // Get existing snapshots to compare
  const segmentIds = snapshots.map(s => s.segment_id);
  const existingSnapshots = await getLatestSnapshots(segmentIds);

  // Track details for each snapshot
  const pollDetails: Omit<PollDetail, 'id' | 'created_at'>[] = [];
  const betterSnapshots: typeof snapshots = [];

  for (const snapshot of snapshots) {
    const existing = existingSnapshots.get(snapshot.segment_id);
    const isBetter = isSnapshotBetter(snapshot, existing);
    const hasNoData = !snapshot.total_efforts && !snapshot.male_leader_name && !snapshot.female_leader_name;

    let action: 'inserted' | 'skipped' | 'no_data';
    let skipReason: string | null = null;

    if (hasNoData) {
      action = 'no_data';
      skipReason = 'API returned no data';
    } else if (isBetter) {
      action = 'inserted';
      betterSnapshots.push(snapshot);
    } else {
      action = 'skipped';
      // Determine why we skipped
      if (existing && (existing.total_efforts ?? 0) > (snapshot.total_efforts ?? 0)) {
        skipReason = `Existing efforts (${existing.total_efforts}) > API (${snapshot.total_efforts})`;
      } else if (existing && (existing.total_efforts ?? 0) === (snapshot.total_efforts ?? 0)) {
        skipReason = `Efforts equal (${snapshot.total_efforts}), no new leader data`;
      } else {
        skipReason = 'Existing data is better or equal';
      }
    }

    pollDetails.push({
      poll_run_id: pollRunId,
      segment_id: snapshot.segment_id,
      display_location: snapshot.display_location,
      api_total_efforts: snapshot.total_efforts,
      api_male_leader_name: snapshot.male_leader_name,
      api_male_leader_efforts: snapshot.male_leader_efforts,
      api_female_leader_name: snapshot.female_leader_name,
      api_female_leader_efforts: snapshot.female_leader_efforts,
      existing_total_efforts: existing?.total_efforts ?? null,
      existing_male_leader_efforts: existing?.male_leader_efforts ?? null,
      existing_female_leader_efforts: existing?.female_leader_efforts ?? null,
      action,
      skip_reason: skipReason,
    });
  }

  // Insert poll details for diagnostics
  await insertPollDetails(pollRunId, pollDetails);

  const skipped = snapshots.length - betterSnapshots.length;

  if (betterSnapshots.length === 0) {
    console.log(`Poll: All ${snapshots.length} snapshots skipped (existing data is better or equal)`);
    return { inserted: 0, skipped };
  }

  // Deduplicate by segment_id (keep first occurrence, which has highest efforts due to sorting)
  const seenSegmentIds = new Set<number>();
  const uniqueSnapshots = betterSnapshots.filter(s => {
    if (seenSegmentIds.has(s.segment_id)) {
      console.log(`Poll: Skipping duplicate segment_id ${s.segment_id} (${s.display_location})`);
      return false;
    }
    seenSegmentIds.add(s.segment_id);
    return true;
  });

  console.log(`Poll: Inserting ${uniqueSnapshots.length} better snapshots, skipping ${skipped} (${betterSnapshots.length - uniqueSnapshots.length} duplicates removed)`);

  const snapshotsWithPollId = uniqueSnapshots.map((s) => ({
    ...s,
    poll_run_id: pollRunId,
  }));

  const { error } = await supabaseAdmin
    .from('segment_snapshots')
    .insert(snapshotsWithPollId);

  if (error) {
    console.error('Error inserting segment snapshots:', error);
    return { inserted: 0, skipped };
  }

  return { inserted: uniqueSnapshots.length, skipped };
}

/**
 * Force insert all snapshots, bypassing the high water mark check.
 * Use this when sheet structure changes or data needs a full refresh.
 */
export async function forceInsertSegmentSnapshots(
  pollRunId: string,
  snapshots: Omit<SegmentSnapshot, 'id' | 'poll_run_id' | 'polled_at'>[]
): Promise<{ inserted: number; skipped: number }> {
  if (!supabaseAdmin) return { inserted: 0, skipped: 0 };

  // Get existing snapshots for comparison logging
  const segmentIds = snapshots.map(s => s.segment_id);
  const existingSnapshots = await getLatestSnapshots(segmentIds);

  // Track details for each snapshot
  const pollDetails: Omit<PollDetail, 'id' | 'created_at'>[] = [];
  const validSnapshots: typeof snapshots = [];

  for (const snapshot of snapshots) {
    const existing = existingSnapshots.get(snapshot.segment_id);
    const hasNoData = !snapshot.total_efforts && !snapshot.male_leader_name && !snapshot.female_leader_name;

    if (hasNoData) {
      pollDetails.push({
        poll_run_id: pollRunId,
        segment_id: snapshot.segment_id,
        display_location: snapshot.display_location,
        api_total_efforts: snapshot.total_efforts,
        api_male_leader_name: snapshot.male_leader_name,
        api_male_leader_efforts: snapshot.male_leader_efforts,
        api_female_leader_name: snapshot.female_leader_name,
        api_female_leader_efforts: snapshot.female_leader_efforts,
        existing_total_efforts: existing?.total_efforts ?? null,
        existing_male_leader_efforts: existing?.male_leader_efforts ?? null,
        existing_female_leader_efforts: existing?.female_leader_efforts ?? null,
        action: 'no_data',
        skip_reason: 'API returned no data (force mode)',
      });
    } else {
      validSnapshots.push(snapshot);
      pollDetails.push({
        poll_run_id: pollRunId,
        segment_id: snapshot.segment_id,
        display_location: snapshot.display_location,
        api_total_efforts: snapshot.total_efforts,
        api_male_leader_name: snapshot.male_leader_name,
        api_male_leader_efforts: snapshot.male_leader_efforts,
        api_female_leader_name: snapshot.female_leader_name,
        api_female_leader_efforts: snapshot.female_leader_efforts,
        existing_total_efforts: existing?.total_efforts ?? null,
        existing_male_leader_efforts: existing?.male_leader_efforts ?? null,
        existing_female_leader_efforts: existing?.female_leader_efforts ?? null,
        action: 'inserted',
        skip_reason: null,
      });
    }
  }

  // Insert poll details for diagnostics
  await insertPollDetails(pollRunId, pollDetails);

  const skipped = snapshots.length - validSnapshots.length;

  if (validSnapshots.length === 0) {
    console.log(`Force Poll: No valid snapshots to insert (${skipped} had no data)`);
    return { inserted: 0, skipped };
  }

  // Deduplicate by segment_id (keep first occurrence)
  const seenSegmentIds = new Set<number>();
  const uniqueSnapshots = validSnapshots.filter(s => {
    if (seenSegmentIds.has(s.segment_id)) {
      console.log(`Force Poll: Skipping duplicate segment_id ${s.segment_id} (${s.display_location})`);
      return false;
    }
    seenSegmentIds.add(s.segment_id);
    return true;
  });

  console.log(`Force Poll: Inserting ${uniqueSnapshots.length} snapshots (bypassing high water mark), ${skipped} had no data, ${validSnapshots.length - uniqueSnapshots.length} duplicates removed`);

  const snapshotsWithPollId = uniqueSnapshots.map((s) => ({
    ...s,
    poll_run_id: pollRunId,
  }));

  const { error } = await supabaseAdmin
    .from('segment_snapshots')
    .insert(snapshotsWithPollId);

  if (error) {
    console.error('Error force inserting segment snapshots:', error);
    return { inserted: 0, skipped };
  }

  return { inserted: uniqueSnapshots.length, skipped };
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

// Delta info for leader changes
export interface LeaderDelta {
  delta: number | null;      // +X efforts since last change (null if no change or new segment)
  isNewLeader: boolean;      // true if leader name changed and count hasn't increased yet
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
      delta?: LeaderDelta;
    };
    femaleLeader: {
      name: string;
      profilePic: string;
      efforts: number;
      delta?: LeaderDelta;
    };
    lastUpdated: string;
  } | null;
  segmentUrl: string | null;
  status: 'valid' | 'need_segment';
}

/**
 * Calculate delta info for a leader by comparing current snapshot with historical ones.
 * Returns delta (change since last different value) and whether it's a new leader.
 */
function calculateLeaderDelta(
  currentName: string | null,
  currentEfforts: number | null,
  historicalSnapshots: Array<{ name: string | null; efforts: number | null }>,
): LeaderDelta {
  // No current data
  if (!currentName || currentEfforts === null || currentEfforts === 0) {
    return { delta: null, isNewLeader: false };
  }

  // No history to compare
  if (historicalSnapshots.length === 0) {
    return { delta: null, isNewLeader: false };
  }

  // Find the first historical snapshot where either:
  // 1. The efforts count was different (to calculate delta)
  // 2. The leader name was different (to detect new leader)

  let previousDifferentEfforts: number | null = null;
  let previousLeaderName: string | null = null;

  for (const hist of historicalSnapshots) {
    // Skip if no valid data
    if (!hist.name || hist.efforts === null || hist.efforts === 0) continue;

    // Track the first valid previous leader name we see
    if (previousLeaderName === null) {
      previousLeaderName = hist.name;
    }

    // Find first snapshot with different efforts
    if (previousDifferentEfforts === null && hist.efforts !== currentEfforts) {
      previousDifferentEfforts = hist.efforts;
      break;
    }
  }

  // Determine if this is a new leader (name changed from previous)
  const isNewLeader = previousLeaderName !== null && previousLeaderName !== currentName;

  // If new leader, check if their count has increased since taking over
  // If count increased, show delta instead of crown
  if (isNewLeader) {
    // Find this leader's first appearance (when they took over)
    let firstAppearanceEfforts: number | null = null;
    for (const hist of historicalSnapshots) {
      if (hist.name === currentName && hist.efforts !== null && hist.efforts > 0) {
        firstAppearanceEfforts = hist.efforts;
      } else if (hist.name !== currentName) {
        // We've gone past this leader's reign
        break;
      }
    }

    // If their count increased since taking over, show delta instead of crown
    if (firstAppearanceEfforts !== null && currentEfforts > firstAppearanceEfforts) {
      return {
        delta: currentEfforts - firstAppearanceEfforts,
        isNewLeader: false
      };
    }

    // New leader, count hasn't increased yet - show crown
    return { delta: null, isNewLeader: true };
  }

  // Same leader - calculate delta if efforts changed
  if (previousDifferentEfforts !== null && currentEfforts > previousDifferentEfforts) {
    return { delta: currentEfforts - previousDifferentEfforts, isNewLeader: false };
  }

  // No change or decrease
  return { delta: null, isNewLeader: false };
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

  // 1. Get the latest poll run (for metadata)
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

  // 2. Get all snapshots for each segment (needed for delta calculations)
  // No limit - data volume is small enough that this is fine
  const { data: allSnapshots, error: snapshotsError } = await supabase
    .from('segment_snapshots')
    .select('*')
    .order('polled_at', { ascending: false });

  if (snapshotsError || !allSnapshots || allSnapshots.length === 0) {
    console.log('No snapshots found, will use direct Strava fetch');
    return null;
  }

  // Group ALL snapshots by segment_id (for delta calculations)
  // and also track the best (most recent with valid data) for display
  // Note: Supabase may return segment_id as string, so we coerce to number for consistent Map keys
  const allSnapshotsBySegment = new Map<number, typeof allSnapshots>();
  const bestSnapshotBySegment = new Map<number, typeof allSnapshots[0]>();

  for (const snapshot of allSnapshots) {
    const segmentId = Number(snapshot.segment_id);

    // Add to history array
    const history = allSnapshotsBySegment.get(segmentId) || [];
    history.push(snapshot);
    allSnapshotsBySegment.set(segmentId, history);

    // Track best snapshot for display
    const existing = bestSnapshotBySegment.get(segmentId);
    if (!existing) {
      bestSnapshotBySegment.set(segmentId, snapshot);
    } else if (existing.total_efforts === null && snapshot.total_efforts !== null) {
      bestSnapshotBySegment.set(segmentId, snapshot);
    }
  }

  const snapshots = Array.from(bestSnapshotBySegment.values());

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
  // Only include snapshots that are still in the current sheet (filter out orphaned/old segments)
  const chapters: ChapterFromSupabase[] = [];
  const processedSegmentIds = new Set<number>();

  for (const snapshot of snapshots) {
    const segmentId = Number(snapshot.segment_id);
    const sheetData = sheetBySegmentId.get(segmentId);

    // Skip snapshots that are no longer in the sheet (orphaned segments)
    if (!sheetData) {
      continue;
    }

    processedSegmentIds.add(segmentId);

    // Get historical snapshots for delta calculation (skip the first one which is current)
    const segmentHistory = allSnapshotsBySegment.get(segmentId) || [];
    const historicalSnapshots = segmentHistory.slice(1); // Skip current, get older ones

    // Calculate deltas for male and female leaders
    const maleDelta = calculateLeaderDelta(
      snapshot.male_leader_name,
      snapshot.male_leader_efforts,
      historicalSnapshots.map(s => ({ name: s.male_leader_name, efforts: s.male_leader_efforts }))
    );

    const femaleDelta = calculateLeaderDelta(
      snapshot.female_leader_name,
      snapshot.female_leader_efforts,
      historicalSnapshots.map(s => ({ name: s.female_leader_name, efforts: s.female_leader_efforts }))
    );

    chapters.push({
      city: snapshot.city,
      state: snapshot.state || '',
      displayLocation: snapshot.display_location || formatLocation(
        snapshot.city,
        snapshot.state || '',
        snapshot.country || 'USA'
      ),
      segmentId: segmentId,
      segmentData: {
        segmentId: segmentId,
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
          delta: maleDelta,
        },
        femaleLeader: {
          name: snapshot.female_leader_name || 'No leader yet',
          profilePic: snapshot.female_leader_profile_pic || '',
          efforts: snapshot.female_leader_efforts || 0,
          delta: femaleDelta,
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
