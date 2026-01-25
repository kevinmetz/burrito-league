import { NextResponse } from 'next/server';
import { getChaptersFromSupabase } from '@/lib/supabase';

export async function GET() {
  const targetIds = [40750978, 40802176, 40802759, 1433169, 40758106];

  // Call the actual function used by the page
  const result = await getChaptersFromSupabase();

  if (!result) {
    return NextResponse.json({ error: 'getChaptersFromSupabase returned null' });
  }

  // Find the target chapters
  const targetChapters = result.chapters.filter(c =>
    targetIds.includes(c.segmentId || 0)
  );

  // Check which have data vs not
  const withData = targetChapters.filter(c => c.segmentData !== null);
  const withoutData = targetChapters.filter(c => c.segmentData === null);

  return NextResponse.json({
    totalChapters: result.chapters.length,
    chaptersWithData: result.chapters.filter(c => c.segmentData !== null).length,
    chaptersWithoutData: result.chapters.filter(c => c.segmentData === null).length,
    targetChapters: {
      total: targetChapters.length,
      withData: withData.map(c => ({ city: c.city, segmentId: c.segmentId, efforts: c.segmentData?.totalEfforts })),
      withoutData: withoutData.map(c => ({ city: c.city, segmentId: c.segmentId, status: c.status })),
    },
  });
}
