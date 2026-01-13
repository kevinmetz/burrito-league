'use client';

import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { chapterCoordinates, ChapterCoordinates } from '@/lib/coordinates';

// Dynamically import react-globe.gl to avoid SSR issues
const GlobeGL = dynamic(() => import('react-globe.gl'), {
  ssr: false,
  loading: () => null,
});

interface GlobeProps {
  onNavigateToChapter?: (city: string) => void;
}

export default function Globe({ onNavigateToChapter }: GlobeProps) {
  const globeRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredChapter, setHoveredChapter] = useState<ChapterCoordinates | null>(null);
  const [globeReady, setGlobeReady] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 500, height: 500 });
  const [countries, setCountries] = useState<any>({ features: [] });

  // Handle responsive sizing
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        // Mobile: use nearly full width (minus small padding)
        // Desktop: larger max size
        const isMobile = containerWidth < 640;
        const width = isMobile
          ? containerWidth - 16  // Tight padding on mobile
          : Math.min(containerWidth - 40, 620);  // Larger on desktop
        setDimensions({ width, height: width });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Load country polygons
  useEffect(() => {
    fetch('https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson')
      .then(res => res.json())
      .then(setCountries);
  }, []);

  // Convert chapter coordinates to points data
  const pointsData = useMemo(() => {
    return chapterCoordinates.map((chapter) => ({
      lat: chapter.lat,
      lng: chapter.lng,
      chapter: chapter,
    }));
  }, []);

  // Set up controls after globe is ready
  useEffect(() => {
    if (globeRef.current && globeReady) {
      const controls = globeRef.current.controls();
      if (controls) {
        controls.autoRotate = false;
        controls.enableZoom = true;
        controls.minDistance = 120;
        controls.maxDistance = 400;
        controls.enableDamping = true;
        controls.dampingFactor = 0.1;
      }

      globeRef.current.pointOfView({ lat: 30, lng: -95, altitude: 2.2 }, 0);
    }
  }, [globeReady]);

  // Handle point hover - keep showing last hovered chapter until a new one is hovered
  const handlePointHover = useCallback((point: any) => {
    if (point) {
      setHoveredChapter(point.chapter);
    }
    // Don't clear when leaving a point - keep showing until new hover
  }, []);

  const handleNavigate = useCallback((city: string) => {
    if (onNavigateToChapter) {
      onNavigateToChapter(city);
    }
    setHoveredChapter(null);
  }, [onNavigateToChapter]);

  const handleResetGlobe = useCallback(() => {
    if (globeRef.current) {
      // Animate back to initial position
      globeRef.current.pointOfView({ lat: 30, lng: -95, altitude: 2.2 }, 1000);
      setHoveredChapter(null);
    }
  }, []);

  const handleGlobeReady = useCallback(() => {
    setGlobeReady(true);
  }, []);

  return (
    <div className="w-full flex flex-col items-center px-3" ref={containerRef}>
      {/* Globe container */}
      <div
        className="relative"
        style={{ width: dimensions.width, height: dimensions.height }}
      >
        <GlobeGL
          ref={globeRef}
          onGlobeReady={handleGlobeReady}

          // Solid blue ocean (#2980B9)
          globeImageUrl="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1' height='1'%3E%3Crect fill='%232980B9' width='1' height='1'/%3E%3C/svg%3E"
          backgroundImageUrl=""
          backgroundColor="rgba(0,0,0,0)"

          // Blue atmosphere
          showGlobe={true}
          showAtmosphere={true}
          atmosphereColor="#2980B9"
          atmosphereAltitude={0.15}

          // Green land polygons
          polygonsData={countries.features}
          polygonCapColor={() => '#4A7C59'}
          polygonSideColor={() => '#3D6B4A'}
          polygonStrokeColor={() => 'rgba(255,255,255,0.2)'}
          polygonAltitude={0.005}

          // Invisible points for hover/click detection
          pointsData={pointsData}
          pointLat="lat"
          pointLng="lng"
          pointColor={() => 'rgba(0,0,0,0)'}
          pointAltitude={0.02}
          pointRadius={0.5}
          onPointHover={handlePointHover}
          onPointClick={handlePointHover}

          // Burrito emoji markers via HTML elements
          htmlElementsData={pointsData}
          htmlLat="lat"
          htmlLng="lng"
          htmlAltitude={0.02}
          htmlElement={(d: any) => {
            const el = document.createElement('div');
            el.textContent = '🌯';
            el.style.fontSize = '20px';
            el.style.cursor = 'pointer';
            el.style.userSelect = 'none';
            el.style.pointerEvents = 'none';
            return el;
          }}

          // Ring effect on hover
          ringsData={hoveredChapter ? [{ lat: hoveredChapter.lat, lng: hoveredChapter.lng }] : []}
          ringLat="lat"
          ringLng="lng"
          ringColor={() => 'rgba(254, 24, 96, 0.6)'}
          ringMaxRadius={3}
          ringPropagationSpeed={2}
          ringRepeatPeriod={800}

          width={dimensions.width}
          height={dimensions.height}
        />
      </div>

      {/* Info card and reset button - below the globe */}
      <div className="mt-2 flex items-center gap-2">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg flex items-center gap-3">
          {hoveredChapter ? (
            <>
              <span className="text-gray-700 text-sm font-medium">
                🌯 {hoveredChapter.city}, {hoveredChapter.state}
              </span>
              <button
                onClick={() => handleNavigate(hoveredChapter.city)}
                className="bg-[#FE1860] text-white text-xs py-1 px-3 rounded hover:bg-[#e01555] transition-colors whitespace-nowrap"
              >
                View →
              </button>
            </>
          ) : (
            <span className="text-gray-700 text-sm font-medium">
              🌯 Tap a burrito to learn more
            </span>
          )}
        </div>
        <button
          onClick={handleResetGlobe}
          className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg text-gray-500 hover:text-gray-700 transition-colors"
          title="Reset globe view"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </div>
  );
}
