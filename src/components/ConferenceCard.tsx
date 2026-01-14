'use client';

import Image from 'next/image';

interface Leader {
  name: string;
  profilePic: string;
  efforts: number;
}

interface ConferenceCardProps {
  displayLocation: string;
  totalEfforts: string;
  maleLeader: Leader;
  femaleLeader: Leader;
  segmentUrl: string;
}

function LeaderRow({ label, leader }: { label: string; leader: Leader }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-black/10 shadow-lg bg-gray-200 flex items-center justify-center">
        {leader.profilePic ? (
          <Image
            src={leader.profilePic}
            alt={leader.name}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <span className="text-black/30 text-lg">?</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-black/50 uppercase tracking-wide">{label}</p>
        <p className="text-black text-lg font-semibold truncate">
          {leader.name}
        </p>
      </div>
      <div className="text-[#FE0A5F] text-3xl font-black">
        {leader.efforts}
      </div>
    </div>
  );
}

export default function ConferenceCard({
  displayLocation,
  totalEfforts,
  maleLeader,
  femaleLeader,
  segmentUrl,
}: ConferenceCardProps) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden w-full border border-black/10">
      {/* Conference Header Bar */}
      <div className="bg-white px-4 py-2 flex items-center justify-between border-b border-black/10">
        <Image
          src="/m2clogo.png"
          alt="Mount to Coast"
          width={100}
          height={32}
          className="h-6 w-auto"
        />
        <span className="text-black font-bold text-sm tracking-wider">CONFERENCE</span>
      </div>

      {/* Card Content */}
      <div className="p-5">
        {/* Header */}
        <div className="text-center mb-4">
          <h2 className="text-[#FE0A5F] text-2xl font-black tracking-tight truncate">
            {displayLocation}
          </h2>
          <p className="text-black/60 text-sm mt-1">
            City Segments: <span className="text-black font-semibold">{totalEfforts}</span>
          </p>
        </div>

        {/* Divider */}
        <div className="h-px bg-black/10 my-4" />

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
            className="text-black/50 text-sm hover:text-black transition-colors underline"
          >
            View the Strava Segment →
          </a>
        </div>
      </div>
    </div>
  );
}
