import Image from "next/image";
import { getAllChaptersData, ChapterWithData } from "@/lib/strava";
import { saveGlobalStatsSnapshot, loadCachedGlobalStats } from "@/lib/supabase";
import ChapterCard from "@/components/ChapterCard";
import ConferenceCard from "@/components/ConferenceCard";
import MissingSegmentCard from "@/components/MissingSegmentCard";
import LoadingSegmentCard from "@/components/LoadingSegmentCard";
import CountdownTimer from "@/components/CountdownTimer";
import GlobalStats from "@/components/GlobalStats";

export const revalidate = 14400; // Revalidate every 4 hours

// Official Mount to Coast Conference cities (displayed first)
const CONFERENCE_CITIES = [
  'tempe',
  'san francisco',
  'redlands',
  'new york',
  'denver / wheat ridge',
  'flagstaff',
];

function isConferenceCity(city: string): boolean {
  return CONFERENCE_CITIES.includes(city.toLowerCase().trim());
}

function parseNumber(str: string): number {
  return parseFloat(str.replace(/,/g, '')) || 0;
}

function parseMiles(str: string): number {
  return parseFloat(str.replace(/,/g, '').replace(' mi', '')) || 0;
}

// Fallback global stats from Jan 12, 2026 backup
const FALLBACK_GLOBAL_STATS = {
  totalChapters: 56,
  totalEfforts: 57809,
  totalAthletes: 3818,
  totalMiles: 13972,
};

// Calculate global stats with three-tier fallback:
// 1. Fresh calculated data (save to Supabase)
// 2. Supabase cached data
// 3. Hardcoded fallback data
async function calculateGlobalStats(chapters: ChapterWithData[]): Promise<{
  totalEfforts: number;
  totalMiles: number;
  totalAthletes: number;
}> {
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

  // If we have fresh data (athletes > 0), save to Supabase and return
  if (calculated.totalAthletes > 0) {
    const validChapters = chapters.filter(c => c.segmentData).length;
    saveGlobalStatsSnapshot({
      totalChapters: validChapters,
      totalEfforts: calculated.totalEfforts,
      totalAthletes: calculated.totalAthletes,
      totalMiles: calculated.totalMiles,
    }).catch(err => console.error('Failed to save global stats:', err));

    return calculated;
  }

  // Tier 2: Try Supabase cache
  const cachedStats = await loadCachedGlobalStats();
  if (cachedStats) {
    console.log('Using cached global stats from Supabase');
    return {
      totalEfforts: cachedStats.totalEfforts,
      totalMiles: cachedStats.totalMiles,
      totalAthletes: cachedStats.totalAthletes,
    };
  }

  // Tier 3: Use hardcoded fallback
  console.log('Using hardcoded fallback global stats');
  return {
    totalEfforts: FALLBACK_GLOBAL_STATS.totalEfforts,
    totalMiles: FALLBACK_GLOBAL_STATS.totalMiles,
    totalAthletes: FALLBACK_GLOBAL_STATS.totalAthletes,
  };
}

export default async function Home() {
  let chaptersData: ChapterWithData[] = [];

  try {
    chaptersData = await getAllChaptersData();
  } catch (error) {
    console.error("Failed to fetch chapters data:", error);
  }

  const globalStats = await calculateGlobalStats(chaptersData);

  // Separate conference cities from others
  const conferenceChapters = chaptersData.filter(c => isConferenceCity(c.city));
  const otherChapters = chaptersData.filter(c => !isConferenceCity(c.city));

  // Sort conference cities by the defined order
  const sortedConference = [...conferenceChapters].sort((a, b) => {
    const aIndex = CONFERENCE_CITIES.indexOf(a.city.toLowerCase().trim());
    const bIndex = CONFERENCE_CITIES.indexOf(b.city.toLowerCase().trim());
    return aIndex - bIndex;
  });

  // Sort other chapters by total efforts (highest first), chapters without data go to end
  const sortedOthers = [...otherChapters].sort((a, b) => {
    const aEfforts = a.segmentData ? parseNumber(a.segmentData.totalEfforts) : -1;
    const bEfforts = b.segmentData ? parseNumber(b.segmentData.totalEfforts) : -1;
    return bEfforts - aEfforts;
  });

  // Count chapters with valid segment data (use fallback if too low)
  const validChapters = chaptersData.filter(c => c.segmentData).length || FALLBACK_GLOBAL_STATS.totalChapters;

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{
        backgroundImage: "url('/wood-bg.png')",
        backgroundSize: "cover",
      }}
    >
      <div className="min-h-screen bg-black/10">
        <main className="max-w-6xl mx-auto px-4 py-8">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <Image
              src="/logo.png"
              alt="Burrito League"
              width={280}
              height={120}
              priority
              className="drop-shadow-2xl"
            />
          </div>

          {/* Tagline */}
          <p className="text-center text-white/80 text-sm mb-8 drop-shadow-md">
            wtf is burrito league?{" "}
            <a
              href="https://www.mountainoutpost.com/burritoleague/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white font-semibold hover:underline"
            >
              learn more at mountainoutpost!
            </a>
          </p>

          {/* Countdown Timer */}
          <div className="mb-8">
            <CountdownTimer />
          </div>

          {/* Global Stats */}
          {validChapters > 0 && (
            <GlobalStats
              totalChapters={validChapters}
              totalEfforts={globalStats.totalEfforts}
              totalMiles={globalStats.totalMiles}
              totalAthletes={globalStats.totalAthletes}
            />
          )}

          {/* Conference Cards */}
          {sortedConference.length > 0 && (
            <div className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedConference.map((chapter) => {
                  if (chapter.segmentData && chapter.segmentUrl) {
                    return (
                      <ConferenceCard
                        key={chapter.displayLocation}
                        displayLocation={chapter.displayLocation}
                        totalEfforts={chapter.segmentData.totalEfforts}
                        maleLeader={chapter.segmentData.maleLeader}
                        femaleLeader={chapter.segmentData.femaleLeader}
                        segmentUrl={chapter.segmentUrl}
                      />
                    );
                  } else if (chapter.segmentUrl) {
                    return (
                      <LoadingSegmentCard
                        key={chapter.displayLocation}
                        displayLocation={chapter.displayLocation}
                        segmentUrl={chapter.segmentUrl}
                      />
                    );
                  } else {
                    return (
                      <MissingSegmentCard
                        key={chapter.displayLocation}
                        displayLocation={chapter.displayLocation}
                      />
                    );
                  }
                })}
              </div>
            </div>
          )}

          {/* Other Chapter Cards Grid */}
          {sortedOthers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedOthers.map((chapter) => {
                if (chapter.segmentData && chapter.segmentUrl) {
                  return (
                    <ChapterCard
                      key={chapter.displayLocation}
                      displayLocation={chapter.displayLocation}
                      totalEfforts={chapter.segmentData.totalEfforts}
                      maleLeader={chapter.segmentData.maleLeader}
                      femaleLeader={chapter.segmentData.femaleLeader}
                      segmentUrl={chapter.segmentUrl}
                    />
                  );
                } else if (chapter.segmentUrl) {
                  return (
                    <LoadingSegmentCard
                      key={chapter.displayLocation}
                      displayLocation={chapter.displayLocation}
                      segmentUrl={chapter.segmentUrl}
                    />
                  );
                } else {
                  return (
                    <MissingSegmentCard
                      key={chapter.displayLocation}
                      displayLocation={chapter.displayLocation}
                    />
                  );
                }
              })}
            </div>
          ) : (
            <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-8 text-center">
              <p className="text-white/70">
                Unable to load segment data. Please try again later.
              </p>
            </div>
          )}

          {/* Footer */}
          <footer className="mt-12 pb-4 text-center">
            <p className="text-white/40 text-sm">
              vibecoded with ❤️ by k-money
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
