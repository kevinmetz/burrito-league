// Maps segment names (lowercase) to verified Strava segment IDs
// Using segment name instead of city to handle cities with multiple segments

export const segmentIds: Record<string, number> = {
  // Canada - Alberta
  'burrito league calgary': 40748818,
  'burrito league blairmore': 40748430,
  'sawback beerrito league': 40751328, // Red Deer

  // Canada - British Columbia
  // 'burrito league-chilliwack': ROUTE not segment

  // Canada - Ontario
  'burrito league - wilbur mexicana': 40748081, // Toronto
  'burrito league: hamilton': 40751550,

  // Arizona
  'tempe burrito league': 40744376,
  'cocolocoburrito': 40748849, // Flagstaff
  'tucson burrito league': 40748423,
  'prescott burrito league': 40752963,
  'marana burrito league': 40750504,
  'gila bend burrito league chapter- la casa del burrito to sofia\'s': 40748843,
  'gila bend burrito league chapter - la casa del burrito to sofia\'s': 40748843,

  // California
  'burrito league - oscar\'s mexican restaurant': 40744216, // Redlands
  'burrito league san francisco': 40744617,
  'burrito league - santa barbara w/rabbit': 40748122,
  'buritto league - santa barbara w/rabbit': 40748122, // typo variant
  'burrito league, auburn': 40757275,
  'burrito league - la quinta': 40760530,
  'the oceanside bombers burrito league': 40761585,
  // 'roseville-rocklin burrito league': E-BIKE segment, not running
  // 'lompoc burrito league start at floriano\'s': segment ID needed
  'palm springs burrito league': 40761605,
  // 'burrito league-joshua tree, ca': ROUTE not segment

  // Colorado
  'burrito league denver official route': 40750921,
  'buritto league denver official route': 40750921, // typo variant
  'boulder burrito league': 40763570,
  'castle rock burrito league': 40744240,
  'burrito league berthoud': 40746992,
  'windsor co burrito league': 40753323,
  'golden roost burrito league': 40756636,
  'salida burrito league': 40770250,

  // Florida
  'ponte vedra burrito league 🌯': 40752662,
  'ponte vedra burrito league': 40752662,

  // Georgia - TWO segments
  'burrito league atl 2026': 40747724, // Atlanta #1
  'westside atl burrito league 2026': 40759130, // Atlanta #2

  // Hawaii
  'bloodhound hawaii x tl burrito league': 40750718, // Koloa

  // Idaho
  'boise burrito league': 40752498,

  // Michigan
  // 'burrito league - great lakes': WALK segment, not running

  // Montana
  'burrito league bozeman': 40756889,
  'higgins river hop': 18766988, // Missoula

  // Nevada
  'burrito league: vegas edition': 40762145, // Las Vegas - need to verify

  // New York
  'the village grind': 40747964, // New Paltz
  'saratoga burrito league': 40761317, // Saratoga Springs
  // 'future new york city (central park)': NO SEGMENT YET

  // Oregon
  // 'tualatin burrito league': ROUTE not segment

  // Pennsylvania
  'chucky burrito': 40750978, // Henryville

  // Tennessee
  'chattanooga burrito league official segment': 40758296,
  'nashville burrito league': 40756595,

  // Texas
  'burrito league - tio trompo houston, tx': 40747282,

  // Utah
  'burrito segment - don pedro\'s green valley': 40748892, // St George

  // Washington
  'burrito league - methow valley': 40752506, // Winthrop
  'sdb loop': 40748814, // Aberdeen

  // Australia
  'burrito league bondi': 40753760, // Sydney

  // Mexico
  'burrito leage guadalajara': 40760766,
  'burrito league guadalajara': 40760766,

  // New Zealand
  'burrito league west': 40758106, // Auckland

  // Indiana
  'burrito league westfield': 40759112, // Indiana

  // Other
  'backwoods burrito league': 40759628,
};

// Also keep city-based lookup as fallback
const cityFallback: Record<string, number> = {
  'calgary': 40748818,
  'crowsnest pass': 40748430,
  'tempe': 40744376,
  'flagstaff': 40748849,
  'tucson': 40748423,
  'prescott': 40752963,
  'marana': 40750504,
  'gila bend': 40748843,
  'redlands': 40744216,
  'san francisco': 40744617,
  'santa barbara': 40748122,
  'denver / wheat ridge': 40750921,
  'boulder': 40763570,
  'castle rock': 40744240,
  'berthoud': 40746992,
  'windsor': 40753323,
  'golden': 40756636,
  'salida': 40770250,
  'ponte vedra': 40752662,
  // 'madison heights': WALK segment
  'henryville': 40750978,
  'chattanooga': 40758296,
  'nashville': 40756595,
  'houston': 40747282,
  'toronto': 40748081,
  'hamilton': 40751550,
  'winthrop': 40752506,
  'aberdeen': 40748814,
  'boise': 40752498,
  'bozeman': 40756889,
  'missoula': 18766988,
  'sydney': 40753760,
  'auckland': 40758106,
  'new paltz': 40747964,
  'saratoga springs': 40761317,
  'auburn': 40757275,
  'la quinta': 40760530,
  'oceanside': 40761585,
  'palm springs': 40761605,
  'palm desert': 40761605,
  'guadalajara': 40760766,
  'guadalajara jalisco': 40760766,
  'koloa': 40750718,
  'red deer': 40751328,
  'st george': 40748892,
  'westfield': 40759112,
  'arcata': 40759628,
  'lompoc': 40768724,
  'colwood': 40752650,
  'vancouver': 40757542,
  'roseville-rocklin': 40747610,
  'winnipeg': 40756079,
  'hanover': 40769531,
  'dartmouth': 40751687,
  'new york': 40755642,
  'washington dc': 40754824,
};

export function getSegmentId(segmentName: string, city?: string): number | null {
  // Try city lookup first (more reliable)
  if (city) {
    const normalizedCity = city.toLowerCase().trim();
    if (cityFallback[normalizedCity]) {
      return cityFallback[normalizedCity];
    }
  }

  // Fall back to segment name lookup (for duplicates like Atlanta)
  const normalizedName = segmentName.toLowerCase().trim();
  if (segmentIds[normalizedName]) {
    return segmentIds[normalizedName];
  }

  return null;
}
