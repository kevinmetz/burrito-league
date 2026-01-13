'use client';

import { useCallback } from 'react';
import GlobeWrapper from './GlobeWrapper';

export default function GlobeSection() {
  const handleNavigateToChapter = useCallback((city: string) => {
    const slug = city.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const element = document.getElementById(`chapter-${slug}`);

    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('ring-4', 'ring-[#FE1860]', 'ring-opacity-75');
      setTimeout(() => {
        element.classList.remove('ring-4', 'ring-[#FE1860]', 'ring-opacity-75');
      }, 2000);
    } else {
      // Try partial match
      const allCards = document.querySelectorAll('[id^="chapter-"]');
      for (const card of allCards) {
        if (card.id.includes(slug) || slug.includes(card.id.replace('chapter-', ''))) {
          card.scrollIntoView({ behavior: 'smooth', block: 'center' });
          card.classList.add('ring-4', 'ring-[#FE1860]', 'ring-opacity-75');
          setTimeout(() => {
            card.classList.remove('ring-4', 'ring-[#FE1860]', 'ring-opacity-75');
          }, 2000);
          return;
        }
      }
    }
  }, []);

  return (
    <div>
      <GlobeWrapper onNavigateToChapter={handleNavigateToChapter} />
    </div>
  );
}
