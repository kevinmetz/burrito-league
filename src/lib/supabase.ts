import { createClient } from '@supabase/supabase-js';
import { ChapterWithData, SegmentData } from './strava';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for database rows
interface ChapterSnapshotRow {
  id: number;
  city: string;
  state: string | null;
  display_location: string;
  segment_id: number | null;
  segment_url: string | null;
  total_efforts: string | null;
  total_athletes: string | null;
  total_distance: string | null;
  male_leader_name: string | null;
  male_leader_pic: string | null;
  male_leader_efforts: number | null;
  female_leader_name: string | null;
  female_leader_pic: string | null;
  female_leader_efforts: number | null;
  snapshot_date: string;
}

interface GlobalStatsRow {
  id: number;
  total_chapters: number;
  total_efforts: number;
  total_athletes: number;
  total_miles: number;
  snapshot_date: string;
}

// Save chapter data to Supabase
export async function saveChapterSnapshot(chapter: ChapterWithData): Promise<void> {
  const { error } = await supabase
    .from('chapter_snapshots')
    .upsert({
      city: chapter.city,
      state: chapter.state,
      display_location: chapter.displayLocation,
      segment_id: chapter.segmentId,
      segment_url: chapter.segmentUrl,
      total_efforts: chapter.segmentData?.totalEfforts || null,
      total_athletes: chapter.segmentData?.totalAthletes || null,
      total_distance: chapter.segmentData?.totalDistance || null,
      male_leader_name: chapter.segmentData?.maleLeader.name || null,
      male_leader_pic: chapter.segmentData?.maleLeader.profilePic || null,
      male_leader_efforts: chapter.segmentData?.maleLeader.efforts || null,
      female_leader_name: chapter.segmentData?.femaleLeader.name || null,
      female_leader_pic: chapter.segmentData?.femaleLeader.profilePic || null,
      female_leader_efforts: chapter.segmentData?.femaleLeader.efforts || null,
      snapshot_date: new Date().toISOString(),
    }, {
      onConflict: 'city,segment_id',
    });

  if (error) {
    console.error('Failed to save chapter snapshot:', error);
  }
}

// Save all chapters data
export async function saveAllChaptersSnapshot(chapters: ChapterWithData[]): Promise<void> {
  const validChapters = chapters.filter(c => c.segmentData);

  if (validChapters.length === 0) {
    console.log('No valid chapter data to save');
    return;
  }

  const rows = validChapters.map(chapter => ({
    city: chapter.city,
    state: chapter.state,
    display_location: chapter.displayLocation,
    segment_id: chapter.segmentId,
    segment_url: chapter.segmentUrl,
    total_efforts: chapter.segmentData?.totalEfforts || null,
    total_athletes: chapter.segmentData?.totalAthletes || null,
    total_distance: chapter.segmentData?.totalDistance || null,
    male_leader_name: chapter.segmentData?.maleLeader.name || null,
    male_leader_pic: chapter.segmentData?.maleLeader.profilePic || null,
    male_leader_efforts: chapter.segmentData?.maleLeader.efforts || null,
    female_leader_name: chapter.segmentData?.femaleLeader.name || null,
    female_leader_pic: chapter.segmentData?.femaleLeader.profilePic || null,
    female_leader_efforts: chapter.segmentData?.femaleLeader.efforts || null,
    snapshot_date: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from('chapter_snapshots')
    .upsert(rows, {
      onConflict: 'city,segment_id',
    });

  if (error) {
    console.error('Failed to save chapters snapshot:', error);
  } else {
    console.log(`Saved ${rows.length} chapters to Supabase`);
  }
}

// Save global stats
export async function saveGlobalStatsSnapshot(stats: {
  totalChapters: number;
  totalEfforts: number;
  totalAthletes: number;
  totalMiles: number;
}): Promise<void> {
  const { error } = await supabase
    .from('global_stats_snapshots')
    .insert({
      total_chapters: stats.totalChapters,
      total_efforts: stats.totalEfforts,
      total_athletes: stats.totalAthletes,
      total_miles: stats.totalMiles,
      snapshot_date: new Date().toISOString(),
    });

  if (error) {
    console.error('Failed to save global stats snapshot:', error);
  } else {
    console.log('Saved global stats to Supabase');
  }
}

// Load cached chapters from Supabase
export async function loadCachedChapters(): Promise<ChapterWithData[] | null> {
  const { data, error } = await supabase
    .from('chapter_snapshots')
    .select('*')
    .order('snapshot_date', { ascending: false });

  if (error) {
    console.error('Failed to load cached chapters:', error);
    return null;
  }

  if (!data || data.length === 0) {
    console.log('No cached chapters found');
    return null;
  }

  // Convert database rows to ChapterWithData format
  const chapters: ChapterWithData[] = (data as ChapterSnapshotRow[]).map(row => ({
    city: row.city,
    state: row.state || '',
    displayLocation: row.display_location,
    segmentId: row.segment_id,
    segmentUrl: row.segment_url,
    segmentData: row.total_efforts ? {
      segmentId: row.segment_id || 0,
      segmentName: '',
      city: row.city,
      state: row.state || '',
      totalEfforts: row.total_efforts || '0',
      totalAthletes: row.total_athletes || '0',
      totalDistance: row.total_distance || '0 mi',
      maleLeader: {
        name: row.male_leader_name || 'No leader yet',
        profilePic: row.male_leader_pic || '',
        efforts: row.male_leader_efforts || 0,
      },
      femaleLeader: {
        name: row.female_leader_name || 'No leader yet',
        profilePic: row.female_leader_pic || '',
        efforts: row.female_leader_efforts || 0,
      },
      lastUpdated: row.snapshot_date,
    } : null,
  }));

  console.log(`Loaded ${chapters.length} cached chapters from Supabase`);
  return chapters;
}

// Load cached global stats from Supabase
export async function loadCachedGlobalStats(): Promise<{
  totalChapters: number;
  totalEfforts: number;
  totalAthletes: number;
  totalMiles: number;
  snapshotDate: string;
} | null> {
  const { data, error } = await supabase
    .from('global_stats_snapshots')
    .select('*')
    .order('snapshot_date', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error('Failed to load cached global stats:', error);
    return null;
  }

  if (!data) {
    console.log('No cached global stats found');
    return null;
  }

  const row = data as GlobalStatsRow;
  return {
    totalChapters: row.total_chapters,
    totalEfforts: row.total_efforts,
    totalAthletes: row.total_athletes,
    totalMiles: row.total_miles,
    snapshotDate: row.snapshot_date,
  };
}
