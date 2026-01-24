import { fetchChaptersFromSheet } from "../src/lib/sheets";
import { chapterCoordinates } from "../src/lib/coordinates";

// State abbreviation to full name mapping
const STATE_ABBREV_TO_FULL: Record<string, string> = {
  'al': 'alabama', 'ak': 'alaska', 'az': 'arizona', 'ar': 'arkansas',
  'ca': 'california', 'co': 'colorado', 'ct': 'connecticut', 'de': 'delaware',
  'fl': 'florida', 'ga': 'georgia', 'hi': 'hawaii', 'id': 'idaho',
  'il': 'illinois', 'in': 'indiana', 'ia': 'iowa', 'ks': 'kansas',
  'ky': 'kentucky', 'la': 'louisiana', 'me': 'maine', 'md': 'maryland',
  'ma': 'massachusetts', 'mi': 'michigan', 'mn': 'minnesota', 'ms': 'mississippi',
  'mo': 'missouri', 'mt': 'montana', 'ne': 'nebraska', 'nv': 'nevada',
  'nh': 'new hampshire', 'nj': 'new jersey', 'nm': 'new mexico', 'ny': 'new york',
  'nc': 'north carolina', 'nd': 'north dakota', 'oh': 'ohio', 'ok': 'oklahoma',
  'or': 'oregon', 'pa': 'pennsylvania', 'ri': 'rhode island', 'sc': 'south carolina',
  'sd': 'south dakota', 'tn': 'tennessee', 'tx': 'texas', 'ut': 'utah',
  'vt': 'vermont', 'va': 'virginia', 'wa': 'washington', 'wv': 'west virginia',
  'wi': 'wisconsin', 'wy': 'wyoming', 'dc': 'dc',
  // Canadian provinces
  'bc': 'british columbia', 'ab': 'alberta', 'mb': 'manitoba',
  'nb': 'new brunswick', 'nl': 'newfoundland', 'ns': 'nova scotia',
  'on': 'ontario', 'pe': 'prince edward island', 'qc': 'quebec', 'sk': 'saskatchewan',
};

function normalizeState(state: string): string {
  const lower = state.toLowerCase().trim();
  return STATE_ABBREV_TO_FULL[lower] || lower;
}

async function findMissing() {
  const chapters = await fetchChaptersFromSheet();
  const validChapters = chapters.filter(c => c.status === "valid");

  // Build a set of existing coordinates (lowercase, normalized state names)
  const existingCities = new Set(
    chapterCoordinates.map(c => `${c.city.toLowerCase()}|${c.state.toLowerCase()}`)
  );

  // Find chapters without coordinates
  const missing: string[] = [];
  for (const chapter of validChapters) {
    const normalizedState = normalizeState(chapter.state);
    const key = `${chapter.city.toLowerCase()}|${normalizedState}`;
    const hasCoords = existingCities.has(key);
    if (hasCoords === false) {
      missing.push(`${chapter.city}, ${chapter.state}, ${chapter.country}`);
    }
  }

  console.log(`Total valid chapters: ${validChapters.length}`);
  console.log(`Chapters with coordinates: ${validChapters.length - missing.length}`);
  console.log(`Missing coordinates: ${missing.length}`);
  console.log("\nMissing cities:");
  missing.forEach(m => console.log(`  - ${m}`));
}

findMissing();
