'use client';

import Image from 'next/image';

interface Leader {
  name: string;
  profilePic: string;
  efforts: number;
}

interface ChapterCardProps {
  displayLocation: string;
  totalEfforts: string;
  maleLeader: Leader;
  femaleLeader: Leader;
  segmentUrl: string;
}

function LeaderRow({ label, leader }: { label: string; leader: Leader }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white/30 shadow-lg bg-gray-700 flex items-center justify-center">
        {leader.profilePic ? (
          <Image
            src={leader.profilePic}
            alt={leader.name}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <span className="text-white/50 text-lg">?</span>
        )}
      </div>
      <div className="flex-1">
        <p className="text-xs text-white/60 uppercase tracking-wide">{label}</p>
        <p className="text-white text-lg font-semibold drop-shadow-md">
          {leader.name}
        </p>
      </div>
      <div className="text-[#FDDF58] text-3xl font-black drop-shadow-md">
        {leader.efforts}
      </div>
    </div>
  );
}

export default function ChapterCard({
  displayLocation,
  totalEfforts,
  maleLeader,
  femaleLeader,
  segmentUrl,
}: ChapterCardProps) {
  return (
    <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-5 w-full border border-white/10">
      {/* Header */}
      <div className="text-center mb-4">
        <h2 className="text-[#FE0A5F] text-2xl font-black tracking-tight">
          {displayLocation}
        </h2>
        <p className="text-white/70 text-sm mt-1">
          City Segments: <span className="text-white font-semibold">{totalEfforts}</span>
        </p>
      </div>

      {/* Divider */}
      <div className="h-px bg-white/20 my-4" />

      {/* Leaders */}
      <div className="space-y-4">
        <LeaderRow label="Male" leader={maleLeader} />
        <LeaderRow label="Female" leader={femaleLeader} />
      </div>

      {/* Strava Link */}
      <div className="mt-5 text-center">
        <a
          href={segmentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-white/60 text-sm hover:text-white transition-colors underline"
        >
          View the Strava Segment →
        </a>
      </div>
    </div>
  );
}
