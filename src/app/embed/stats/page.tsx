import { ChapterFromSupabase } from '@/lib/supabase';
import frozenChapters from '@/data/chapters-final-2026.json';

// Season is over (Burrito League 2026 ended Jan 31, 2026) - data is a frozen static snapshot
export const revalidate = false;

function parseNumber(str: string): number {
  return parseFloat(str.replace(/,/g, '')) || 0;
}

function parseMiles(str: string): number {
  return parseFloat(str.replace(/,/g, '').replace(' mi', '')) || 0;
}

function calculateGlobalStats(chapters: ChapterFromSupabase[]) {
  return chapters.reduce(
    (acc, chapter) => {
      if (chapter.segmentData) {
        return {
          totalEfforts: acc.totalEfforts + parseNumber(chapter.segmentData.totalEfforts),
          totalMiles: acc.totalMiles + parseMiles(chapter.segmentData.totalDistance),
          totalAthletes: acc.totalAthletes + parseNumber(chapter.segmentData.totalAthletes),
        };
      }
      return acc;
    },
    { totalEfforts: 0, totalMiles: 0, totalAthletes: 0 }
  );
  // Note: With high water mark in Supabase, data only improves - no fallback needed
}

export default async function EmbedStatsPage() {
  const chapters = frozenChapters.chapters as ChapterFromSupabase[];
  const chaptersWithData = chapters.filter(c => c.segmentData);
  const totalChapters = chaptersWithData.length;
  const stats = calculateGlobalStats(chapters);

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          <div className="text-center">
            <p className="text-[#FDDF58] text-3xl md:text-4xl font-black drop-shadow-md">
              {totalChapters}
            </p>
            <p className="text-white/70 text-sm uppercase tracking-wide">Chapters</p>
          </div>
          <div className="text-center">
            <p className="text-[#FDDF58] text-3xl md:text-4xl font-black drop-shadow-md">
              {stats.totalEfforts.toLocaleString()}
            </p>
            <p className="text-white/70 text-sm uppercase tracking-wide">Segments Run</p>
          </div>
          <div className="text-center">
            <p className="text-[#FDDF58] text-3xl md:text-4xl font-black drop-shadow-md">
              {stats.totalAthletes.toLocaleString()}
            </p>
            <p className="text-white/70 text-sm uppercase tracking-wide">Athletes</p>
          </div>
          <div className="text-center">
            <p className="text-[#FDDF58] text-3xl md:text-4xl font-black drop-shadow-md">
              {stats.totalMiles.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
            <p className="text-white/70 text-sm uppercase tracking-wide">Miles</p>
          </div>
        </div>

      </div>
    </div>
  );
}
