import Image from "next/image";
import { getAllChaptersData, SegmentData } from "@/lib/strava";
import ChapterCard from "@/components/ChapterCard";
import CountdownTimer from "@/components/CountdownTimer";
import GlobalStats from "@/components/GlobalStats";

export const revalidate = 900; // Revalidate every 15 minutes

function parseNumber(str: string): number {
  return parseFloat(str.replace(/,/g, '')) || 0;
}

function parseMiles(str: string): number {
  return parseFloat(str.replace(/,/g, '').replace(' mi', '')) || 0;
}

function calculateGlobalStats(chapters: SegmentData[]) {
  return chapters.reduce(
    (acc, chapter) => ({
      totalEfforts: acc.totalEfforts + parseNumber(chapter.totalEfforts),
      totalMiles: acc.totalMiles + parseMiles(chapter.totalDistance),
      totalAthletes: acc.totalAthletes + parseNumber(chapter.totalAthletes),
    }),
    { totalEfforts: 0, totalMiles: 0, totalAthletes: 0 }
  );
}

export default async function Home() {
  let chaptersData: SegmentData[] = [];

  try {
    chaptersData = await getAllChaptersData();
  } catch (error) {
    console.error("Failed to fetch chapters data:", error);
  }

  const globalStats = calculateGlobalStats(chaptersData);

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
          {chaptersData.length > 0 && (
            <GlobalStats
              totalChapters={chaptersData.length}
              totalEfforts={globalStats.totalEfforts}
              totalMiles={globalStats.totalMiles}
              totalAthletes={globalStats.totalAthletes}
            />
          )}

          {/* Chapter Cards Grid */}
          {chaptersData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {chaptersData.map((chapter) => (
                <ChapterCard
                  key={chapter.segmentId}
                  city={chapter.city}
                  state={chapter.state}
                  totalEfforts={chapter.totalEfforts}
                  maleLeader={chapter.maleLeader}
                  femaleLeader={chapter.femaleLeader}
                  segmentUrl={`https://www.strava.com/segments/${chapter.segmentId}`}
                />
              ))}
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
