'use client';

interface GlobalStatsProps {
  totalChapters: number;
  totalEfforts: number;
  totalMiles: number;
  totalAthletes: number;
}

export default function GlobalStats({
  totalChapters,
  totalEfforts,
  totalMiles,
  totalAthletes,
}: GlobalStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-10 mb-8 max-w-2xl mx-auto">
      <div className="text-center">
        <p className="text-[#FDDF58] text-3xl md:text-4xl font-black drop-shadow-md">
          {totalChapters}
        </p>
        <p className="text-white/70 text-sm uppercase tracking-wide">Chapters</p>
      </div>
      <div className="text-center">
        <p className="text-[#FDDF58] text-3xl md:text-4xl font-black drop-shadow-md">
          {totalEfforts.toLocaleString()}
        </p>
        <p className="text-white/70 text-sm uppercase tracking-wide">Segments Run</p>
      </div>
      <div className="text-center">
        <p className="text-[#FDDF58] text-3xl md:text-4xl font-black drop-shadow-md">
          {totalAthletes.toLocaleString()}
        </p>
        <p className="text-white/70 text-sm uppercase tracking-wide">Athletes</p>
      </div>
      <div className="text-center">
        <p className="text-[#FDDF58] text-3xl md:text-4xl font-black drop-shadow-md">
          {totalMiles.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </p>
        <p className="text-white/70 text-sm uppercase tracking-wide">Miles</p>
      </div>
    </div>
  );
}
