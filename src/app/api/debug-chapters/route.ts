import { NextResponse } from 'next/server';
import { fetchChaptersFromSheet } from '@/lib/sheets';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const chapters = await fetchChaptersFromSheet();
  const targetIds = [40750978, 40802176, 40802759, 1433169, 40758106];

  // Check Supabase directly
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
  );

  const { data: snapshots, error } = await supabase
    .from('segment_snapshots')
    .select('segment_id, display_location, total_efforts, polled_at')
    .in('segment_id', targetIds)
    .order('polled_at', { ascending: false })
    .limit(10);

  // Check what getChaptersFromSupabase would see
  const { data: allSnapshots } = await supabase
    .from('segment_snapshots')
    .select('segment_id')
    .order('polled_at', { ascending: false });

  const uniqueSegmentIds = [...new Set(allSnapshots?.map(s => s.segment_id) || [])];
  const targetInSnapshots = targetIds.filter(id => uniqueSegmentIds.includes(id));
  const targetMissing = targetIds.filter(id => !uniqueSegmentIds.includes(id));

  return NextResponse.json({
    sheetParsing: {
      totalChapters: chapters.length,
      chaptersWithSegmentId: chapters.filter(c => c.segmentId).length,
      targetSegmentsInSheet: chapters.filter(c => targetIds.includes(c.segmentId || 0)).map(c => ({
        city: c.city,
        segmentId: c.segmentId,
      })),
    },
    supabase: {
      error: error?.message,
      targetSnapshots: snapshots,
      totalUniqueSegments: uniqueSegmentIds.length,
      targetInSnapshots,
      targetMissing,
    },
  });
}
