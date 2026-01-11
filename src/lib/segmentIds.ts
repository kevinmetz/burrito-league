// Maps city names (lowercase) to verified Strava segment IDs
// These are manually verified - the sheet data can be incorrect

export const segmentIds: Record<string, number> = {
  // Arizona
  'tempe': 40744376,
  'flagstaff': 40748849,
  'tucson': 40748423,
  'prescott': 40752963,
  'marana': 40750504,
  'gila bend': 40748843,

  // California
  'redlands': 40744216,
  'san francisco': 40744617,
  'santa barbara': 40748122,

  // Colorado
  'denver / wheat ridge': 40750921,
  'boulder': 40763570,
  'castle rock': 40744240,
  'berthoud': 40746992,

  // Florida
  'ponte vedra': 40752662,

  // Georgia
  'atlanta': 40747724,

  // Michigan
  'madison heights': 40752439,

  // Pennsylvania
  'henryville': 40750978,

  // Tennessee
  'chattanooga': 40752705,

  // Texas
  'houston': 40747282,

  // Canada - Alberta
  'calgary': 40748818,
  'crowsnest pass': 40748430,

  // Canada - Ontario
  'toronto': 40748081,
  'hamilton': 40751550,
};

export function getSegmentId(city: string): number | null {
  const normalized = city.toLowerCase().trim();
  return segmentIds[normalized] ?? null;
}
