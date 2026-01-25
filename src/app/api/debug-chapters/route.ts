import { NextResponse } from 'next/server';
import { fetchChaptersFromSheet } from '@/lib/sheets';

export async function GET() {
  const chapters = await fetchChaptersFromSheet();

  // Find the problem segments
  const targetIds = [40750978, 40802176, 40802759, 1433169, 40758106];

  const found = chapters.filter(c => targetIds.includes(c.segmentId || 0));
  const allWithSegments = chapters.filter(c => c.segmentId).map(c => ({
    city: c.city,
    state: c.state,
    segmentId: c.segmentId,
  }));

  return NextResponse.json({
    totalChapters: chapters.length,
    chaptersWithSegmentId: chapters.filter(c => c.segmentId).length,
    targetSegmentsFound: found,
    allSegmentIds: allWithSegments,
  });
}
