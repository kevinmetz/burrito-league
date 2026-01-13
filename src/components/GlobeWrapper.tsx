'use client';

import dynamic from 'next/dynamic';

const Globe = dynamic(() => import('./Globe'), {
  ssr: false,
  loading: () => (
    <div className="w-full flex items-center justify-center px-3">
      <div className="w-full max-w-[620px] aspect-square flex items-center justify-center">
        <div className="text-gray-600 text-center">
          <div className="animate-spin w-10 h-10 border-3 border-gray-300 border-t-[#FE1860] rounded-full mx-auto mb-3"></div>
          <p className="text-sm">Loading globe...</p>
        </div>
      </div>
    </div>
  ),
});

interface GlobeWrapperProps {
  onNavigateToChapter?: (city: string) => void;
}

export default function GlobeWrapper({ onNavigateToChapter }: GlobeWrapperProps) {
  return <Globe onNavigateToChapter={onNavigateToChapter} />;
}
