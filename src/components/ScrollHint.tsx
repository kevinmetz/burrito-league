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
      // Scroll down to hint there's more content
      window.scrollTo({ top: 120, behavior: 'smooth' });
      sessionStorage.setItem('hasSeenScrollHint', 'true');
      setHasScrolled(true);
    }, 1000);

    return () => clearTimeout(timeout);
  }, []);

  // Don't render anything visible
  return null;
}
