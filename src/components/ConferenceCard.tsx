'use client';

import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';

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

function HiddenMaleLeaderRow() {
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Close tooltip on outside tap or scroll
  useEffect(() => {
    if (!showTooltip) return;

    const handleClose = () => setShowTooltip(false);

    const handleClickOutside = (e: TouchEvent | MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node)) {
        setShowTooltip(false);
      }
    };

    window.addEventListener('scroll', handleClose, true);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleClose, true);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showTooltip]);

  return (
    <div className="relative">
      <div
        className="flex items-center gap-3 blur-[2px] opacity-50 select-none"
        aria-hidden="true"
      >
        <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-black/10 shadow-lg bg-gray-200 flex items-center justify-center">
          <span className="text-black/30 text-lg">?</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-black/50 uppercase tracking-wide">Male</p>
          <p className="text-black text-lg font-semibold truncate">
            Hidden
          </p>
        </div>
        <div className="text-[#FE0A5F] text-3xl font-black">
          ?
        </div>
      </div>

      {/* Overlay with tooltip trigger */}
      <div
        className="absolute inset-0 flex items-center justify-center cursor-help"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onTouchEnd={(e) => {
          e.preventDefault();
          setShowTooltip(!showTooltip);
        }}
      >
        <div className="bg-black/5 backdrop-blur-sm rounded-full p-2 border border-black/10">
          <svg
            className="w-5 h-5 text-black/50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div ref={tooltipRef} className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-50 w-64">
          <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl border border-white/20">
            <p className="font-semibold mb-1">Here for the women&apos;s race!</p>
            <p className="text-white/70">
              When a woman leads the segment, Strava doesn&apos;t expose male leader data.
            </p>
            <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      )}
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
          {/* Show blurred male row when female is leading and male data is hidden by Strava */}
          {femaleLeader.efforts > 0 &&
          maleLeader.efforts === 0 &&
          maleLeader.name === 'No leader yet' ? (
            <HiddenMaleLeaderRow />
          ) : (
            <LeaderRow label="Male" leader={maleLeader} />
          )}
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
