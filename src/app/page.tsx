import Image from "next/image";
import { getAllChaptersData, ChapterWithData } from "@/lib/strava";
import { getChaptersFromSupabase, ChapterFromSupabase, bootstrapIfEmpty } from "@/lib/supabase";
import ChapterCard from "@/components/ChapterCard";
import ConferenceCard from "@/components/ConferenceCard";
import MissingSegmentCard from "@/components/MissingSegmentCard";
import LoadingSegmentCard from "@/components/LoadingSegmentCard";
import CountdownTimer from "@/components/CountdownTimer";
import GlobalStats from "@/components/GlobalStats";
import GlobeSection from "@/components/GlobeSection";
import ScrollHint from "@/components/ScrollHint";

// Revalidate every 15 minutes - Supabase reads are cheap, and we want fresh sheet data
export const revalidate = 900;

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

// Union type for both data sources
type ChapterData = ChapterWithData | ChapterFromSupabase;

function calculateGlobalStats(chapters: ChapterData[]) {
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

export default async function Home() {
  let chaptersData: ChapterData[] = [];
  let dataSource: 'supabase' | 'strava' | 'fallback' = 'fallback';
  let lastUpdated: string | null = null;

  // Try Supabase first (fast, no API calls)
  try {
    let supabaseResult = await getChaptersFromSupabase();

    // If Supabase is empty, bootstrap with initial poll
    if (!supabaseResult) {
      console.log('Page: Supabase empty, bootstrapping...');
      const didBootstrap = await bootstrapIfEmpty();
      if (didBootstrap) {
        // Retry fetching from Supabase after bootstrap
        supabaseResult = await getChaptersFromSupabase();
      }
    }

    if (supabaseResult && supabaseResult.chapters.length > 0) {
      chaptersData = supabaseResult.chapters;
      dataSource = 'supabase';
      lastUpdated = supabaseResult.lastUpdated;
      console.log(`Page: Loaded ${chaptersData.length} chapters from Supabase`);
    }
  } catch (error) {
    console.error("Failed to fetch from Supabase:", error);
  }

  // Fall back to direct Strava API if Supabase still empty (bootstrap failed)
  if (chaptersData.length === 0) {
    try {
      console.log('Page: Supabase still empty, falling back to direct Strava API');
      chaptersData = await getAllChaptersData();
      dataSource = 'strava';
    } catch (error) {
      console.error("Failed to fetch chapters data:", error);
    }
  }

  const globalStats = calculateGlobalStats(chaptersData);

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
        <main className="max-w-6xl mx-auto px-4 pt-3 pb-8 md:pt-8">
          <ScrollHint />
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
              href="https://burrito-league.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white font-semibold hover:underline"
            >
              learn more at burrito-league.com
            </a>
          </p>

          {/* Countdown Timer */}
          <div className="-mb-4">
            <CountdownTimer />
          </div>

          {/* 3D Globe */}
          <div className="mb-6">
            <GlobeSection />
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
                  const chapterId = `chapter-${chapter.city.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`;
                  if (chapter.segmentData && chapter.segmentUrl) {
                    return (
                      <div key={chapter.displayLocation} id={chapterId} className="transition-all duration-300">
                        <ConferenceCard
                          displayLocation={chapter.displayLocation}
                          totalEfforts={chapter.segmentData.totalEfforts}
                          maleLeader={chapter.segmentData.maleLeader}
                          femaleLeader={chapter.segmentData.femaleLeader}
                          segmentUrl={chapter.segmentUrl}
                        />
                      </div>
                    );
                  } else if (chapter.segmentUrl) {
                    return (
                      <div key={chapter.displayLocation} id={chapterId} className="transition-all duration-300">
                        <LoadingSegmentCard
                          displayLocation={chapter.displayLocation}
                          segmentUrl={chapter.segmentUrl}
                        />
                      </div>
                    );
                  } else {
                    return (
                      <div key={chapter.displayLocation} id={chapterId} className="transition-all duration-300">
                        <MissingSegmentCard
                          displayLocation={chapter.displayLocation}
                        />
                      </div>
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
                const chapterId = `chapter-${chapter.city.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`;
                if (chapter.segmentData && chapter.segmentUrl) {
                  return (
                    <div key={chapter.displayLocation} id={chapterId} className="transition-all duration-300">
                      <ChapterCard
                        displayLocation={chapter.displayLocation}
                        totalEfforts={chapter.segmentData.totalEfforts}
                        maleLeader={chapter.segmentData.maleLeader}
                        femaleLeader={chapter.segmentData.femaleLeader}
                        segmentUrl={chapter.segmentUrl}
                      />
                    </div>
                  );
                } else if (chapter.segmentUrl) {
                  return (
                    <div key={chapter.displayLocation} id={chapterId} className="transition-all duration-300">
                      <LoadingSegmentCard
                        displayLocation={chapter.displayLocation}
                        segmentUrl={chapter.segmentUrl}
                      />
                    </div>
                  );
                } else {
                  return (
                    <div key={chapter.displayLocation} id={chapterId} className="transition-all duration-300">
                      <MissingSegmentCard
                        displayLocation={chapter.displayLocation}
                      />
                    </div>
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
