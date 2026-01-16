'use client';

import { useEffect, useState } from 'react';

export default function ScrollHint() {
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    // Only run on mobile
    const isMobile = window.innerWidth < 768;
    if (!isMobile) return;

    // Check if user has already scrolled this session
    if (sessionStorage.getItem('hasSeenScrollHint')) return;

    // Wait for globe to load and settle before hinting scroll
    const timeout = setTimeout(() => {
      // Animate scroll down then back up
      window.scrollTo({ top: 60, behavior: 'smooth' });

      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        sessionStorage.setItem('hasSeenScrollHint', 'true');
        setHasScrolled(true);
      }, 400);
    }, 1500);

    return () => clearTimeout(timeout);
  }, []);

  // Don't render anything visible
  return null;
}
