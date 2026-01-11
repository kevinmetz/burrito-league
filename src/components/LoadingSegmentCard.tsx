'use client';

interface LoadingSegmentCardProps {
  displayLocation: string;
  segmentUrl: string;
}

export default function LoadingSegmentCard({
  displayLocation,
  segmentUrl,
}: LoadingSegmentCardProps) {
  return (
    <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-5 w-full border border-white/10">
      {/* Header */}
      <div className="text-center mb-4">
        <h2 className="text-[#FE0A5F] text-2xl font-black tracking-tight">
          {displayLocation}
        </h2>
        <p className="text-white/70 text-sm mt-1">
          City Segments: <span className="text-white/50">Loading...</span>
        </p>
      </div>

      {/* Divider */}
      <div className="h-px bg-white/20 my-4" />

      {/* Loading Message */}
      <div className="text-center py-6">
        <p className="text-white/50 text-sm">
          Data loading...
        </p>
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
