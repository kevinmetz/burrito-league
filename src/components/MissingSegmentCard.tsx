'use client';

interface MissingSegmentCardProps {
  displayLocation: string;
}

export default function MissingSegmentCard({
  displayLocation,
}: MissingSegmentCardProps) {
  return (
    <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-5 w-full border border-white/10 opacity-60">
      {/* Header */}
      <div className="text-center mb-4">
        <h2 className="text-[#FE0A5F] text-2xl font-black tracking-tight">
          {displayLocation}
        </h2>
        <p className="text-white/70 text-sm mt-1">
          City Segments: <span className="text-white/50">--</span>
        </p>
      </div>

      {/* Divider */}
      <div className="h-px bg-white/20 my-4" />

      {/* Missing Segment Message */}
      <div className="text-center py-6">
        <p className="text-white/50 text-sm">
          Segment ID needed
        </p>
        <p className="text-white/30 text-xs mt-2">
          Check back soon!
        </p>
      </div>
    </div>
  );
}
