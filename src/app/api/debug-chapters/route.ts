import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { fetchChaptersFromSheet } from '@/lib/sheets';

export async function GET() {
  const targetIds = [40750978, 40802176, 40802759, 1433169, 40758106];

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
  );

  // Get all snapshots (same query as getChaptersFromSupabase - with explicit limit)
  const { data: allSnapshots } = await supabase
    .from('segment_snapshots')
    .select('*')
    .order('polled_at', { ascending: false })
    .limit(10000);

  // Build the map the same way
  const bestSnapshotBySegment = new Map<number, any>();
  for (const snapshot of allSnapshots || []) {
    const segmentId = Number(snapshot.segment_id);
    if (!bestSnapshotBySegment.has(segmentId)) {
      bestSnapshotBySegment.set(segmentId, snapshot);
    }
  }

  // Check if target IDs are in the map
  const targetInMap = targetIds.map(id => ({
    id,
    inMap: bestSnapshotBySegment.has(id),
    snapshot: bestSnapshotBySegment.get(id) ? {
      segment_id: bestSnapshotBySegment.get(id).segment_id,
      segment_id_type: typeof bestSnapshotBySegment.get(id).segment_id,
      display_location: bestSnapshotBySegment.get(id).display_location,
    } : null,
  }));

  // Get sheet chapters
  const sheetChapters = await fetchChaptersFromSheet();
  const sheetBySegmentId = new Map<number, any>();
  for (const chapter of sheetChapters) {
    if (chapter.segmentId) {
      sheetBySegmentId.set(chapter.segmentId, chapter);
    }
  }

  // Check if target IDs are in sheet map
  const targetInSheetMap = targetIds.map(id => ({
    id,
    inSheetMap: sheetBySegmentId.has(id),
    chapter: sheetBySegmentId.get(id) ? {
      city: sheetBySegmentId.get(id).city,
      segmentId: sheetBySegmentId.get(id).segmentId,
      segmentId_type: typeof sheetBySegmentId.get(id).segmentId,
    } : null,
  }));

  return NextResponse.json({
    totalSnapshots: allSnapshots?.length,
    uniqueSegmentsInMap: bestSnapshotBySegment.size,
    targetInSnapshotMap: targetInMap,
    totalSheetChapters: sheetChapters.length,
    uniqueSegmentsInSheetMap: sheetBySegmentId.size,
    targetInSheetMap: targetInSheetMap,
  });
}
