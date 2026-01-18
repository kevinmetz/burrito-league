import { getChaptersFromSupabase, ChapterFromSupabase } from '@/lib/supabase';

// Revalidate every 15 minutes to match main site
export const revalidate = 900;

// Fallback global stats from Jan 18, 2026
const FALLBACK_GLOBAL_STATS = {
  totalChapters: 101,
  totalEfforts: 191790,
  totalAthletes: 8975,
  totalMiles: 48150,
};

function parseNumber(str: string): number {
  return parseFloat(str.replace(/,/g, '')) || 0;
}

function parseMiles(str: string): number {
  return parseFloat(str.replace(/,/g, '').replace(' mi', '')) || 0;
}

function calculateGlobalStats(chapters: ChapterFromSupabase[]) {
  const calculated = chapters.reduce(
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

  // Use fallback if calculated values seem too low (likely rate limited)
  if (calculated.totalEfforts < 1000) {
    return {
      totalEfforts: FALLBACK_GLOBAL_STATS.totalEfforts,
      totalMiles: FALLBACK_GLOBAL_STATS.totalMiles,
      totalAthletes: FALLBACK_GLOBAL_STATS.totalAthletes,
    };
  }

  return calculated;
}

export default async function EmbedStatsPage() {
  // Fetch data from Supabase
  const supabaseData = await getChaptersFromSupabase();

  let totalChapters = FALLBACK_GLOBAL_STATS.totalChapters;
  let stats = {
    totalEfforts: FALLBACK_GLOBAL_STATS.totalEfforts,
    totalMiles: FALLBACK_GLOBAL_STATS.totalMiles,
    totalAthletes: FALLBACK_GLOBAL_STATS.totalAthletes,
  };

  if (supabaseData) {
    const chaptersWithData = supabaseData.chapters.filter(c => c.segmentData);
    totalChapters = chaptersWithData.length;
    stats = calculateGlobalStats(supabaseData.chapters);
  }

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

        {/* Powered by link */}
        <div className="text-center mt-4">
          <a
            href="https://burrito.run"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/40 text-xs hover:text-white/60 transition-colors"
          >
            powered by burrito.run
          </a>
        </div>
      </div>
    </div>
  );
}
