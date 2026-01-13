// Fallback data from Jan 12, 2026 backup - used when Strava API returns 429
// Last updated: 2026-01-12 08:44 AM

export interface FallbackChapterData {
  displayLocation: string;
  city: string;
  totalEfforts: string;
  maleLeader: {
    name: string;
    profilePic: string;
    efforts: number;
  };
  femaleLeader: {
    name: string;
    profilePic: string;
    efforts: number;
  };
}

// Fallback data extracted from screenshots on Jan 12, 2026
export const fallbackData: Record<string, FallbackChapterData> = {
  // Conference Cities
  'tempe': {
    displayLocation: 'Tempe, AZ',
    city: 'tempe',
    totalEfforts: '12,181',
    maleLeader: { name: 'Troy Croxdale', profilePic: '', efforts: 1011 },
    femaleLeader: { name: 'Kelsey McGill', profilePic: '', efforts: 559 },
  },
  'san francisco': {
    displayLocation: 'San Francisco, CA',
    city: 'san francisco',
    totalEfforts: '1,598',
    maleLeader: { name: 'Armand Rosario', profilePic: '', efforts: 214 },
    femaleLeader: { name: 'Dian Chen', profilePic: '', efforts: 129 },
  },
  'redlands': {
    displayLocation: 'Redlands, CA',
    city: 'redlands',
    totalEfforts: '6,860',
    maleLeader: { name: 'Cody VR', profilePic: '', efforts: 492 },
    femaleLeader: { name: 'Santa Barajas', profilePic: '', efforts: 170 },
  },
  'new york': {
    displayLocation: 'New York, NY',
    city: 'new york',
    totalEfforts: '1,837',
    maleLeader: { name: 'Roland Mann', profilePic: '', efforts: 275 },
    femaleLeader: { name: 'Kumi Dashing', profilePic: '', efforts: 71 },
  },
  'denver / wheat ridge': {
    displayLocation: 'Denver / Wheat Ridge, CO',
    city: 'denver / wheat ridge',
    totalEfforts: '3,186',
    maleLeader: { name: 'Jake Ryor', profilePic: '', efforts: 310 },
    femaleLeader: { name: 'Karen Wylie', profilePic: '', efforts: 154 },
  },
  'flagstaff': {
    displayLocation: 'Flagstaff, AZ',
    city: 'flagstaff',
    totalEfforts: '1,983',
    maleLeader: { name: 'Pete Kostelnick', profilePic: '', efforts: 239 },
    femaleLeader: { name: 'Tara Friend', profilePic: '', efforts: 119 },
  },

  // Other Chapters
  'atlanta': {
    displayLocation: 'Atlanta, GA #1',
    city: 'atlanta',
    totalEfforts: '3,081',
    maleLeader: { name: 'Steven Waldecker', profilePic: '', efforts: 161 },
    femaleLeader: { name: 'Emily Hull', profilePic: '', efforts: 51 },
  },
  'tucson': {
    displayLocation: 'Tucson, AZ',
    city: 'tucson',
    totalEfforts: '2,981',
    maleLeader: { name: 'Ben Gerkin', profilePic: '', efforts: 448 },
    femaleLeader: { name: 'Laura Swenson', profilePic: '', efforts: 190 },
  },
  'santa barbara': {
    displayLocation: 'Santa Barbara, CA',
    city: 'santa barbara',
    totalEfforts: '2,821',
    maleLeader: { name: 'Preston Explores', profilePic: '', efforts: 538 },
    femaleLeader: { name: 'Morgan Solorio', profilePic: '', efforts: 144 },
  },
  'boulder': {
    displayLocation: 'Boulder, CO',
    city: 'boulder',
    totalEfforts: '1,769',
    maleLeader: { name: 'No leader yet', profilePic: '', efforts: 0 },
    femaleLeader: { name: 'Kelsey Lakowske', profilePic: '', efforts: 145 },
  },
  'toronto': {
    displayLocation: 'Toronto, Ontario',
    city: 'toronto',
    totalEfforts: '1,748',
    maleLeader: { name: 'Andrew Goupil | BIM', profilePic: '', efforts: 347 },
    femaleLeader: { name: 'Rebeca Escobar', profilePic: '', efforts: 249 },
  },
  'arcata': {
    displayLocation: 'Arcata, CA',
    city: 'arcata',
    totalEfforts: '1,713',
    maleLeader: { name: 'No leader yet', profilePic: '', efforts: 0 },
    femaleLeader: { name: 'Jazz McGinnis', profilePic: '', efforts: 447 },
  },
  'boise': {
    displayLocation: 'Boise, ID',
    city: 'boise',
    totalEfforts: '1,653',
    maleLeader: { name: 'David Yousling', profilePic: '', efforts: 233 },
    femaleLeader: { name: 'Madison Turley', profilePic: '', efforts: 63 },
  },
  'castle rock': {
    displayLocation: 'Castle Rock, CO',
    city: 'castle rock',
    totalEfforts: '1,491',
    maleLeader: { name: 'Hagan McHenry', profilePic: '', efforts: 251 },
    femaleLeader: { name: 'Teresa Castagna', profilePic: '', efforts: 114 },
  },
  'missoula': {
    displayLocation: 'Missoula, MT',
    city: 'missoula',
    totalEfforts: '1,468',
    maleLeader: { name: 'No leader yet', profilePic: '', efforts: 0 },
    femaleLeader: { name: 'Christy Von Lanken', profilePic: '', efforts: 108 },
  },
  'chattanooga': {
    displayLocation: 'Chattanooga, TN',
    city: 'chattanooga',
    totalEfforts: '1,454',
    maleLeader: { name: 'No leader yet', profilePic: '', efforts: 0 },
    femaleLeader: { name: 'Whitney Dancaster', profilePic: '', efforts: 162 },
  },
  'calgary': {
    displayLocation: 'Calgary, Alberta',
    city: 'calgary',
    totalEfforts: '1,119',
    maleLeader: { name: 'Neil Wagner', profilePic: '', efforts: 274 },
    femaleLeader: { name: 'Tina Ramen', profilePic: '', efforts: 36 },
  },
  'las vegas': {
    displayLocation: 'Las Vegas, NV',
    city: 'las vegas',
    totalEfforts: '927',
    maleLeader: { name: 'Sam Longson', profilePic: '', efforts: 127 },
    femaleLeader: { name: 'Rebecca Thomas', profilePic: '', efforts: 76 },
  },
  'houston': {
    displayLocation: 'Houston, TX',
    city: 'houston',
    totalEfforts: '809',
    maleLeader: { name: 'Adam Kuskos', profilePic: '', efforts: 250 },
    femaleLeader: { name: 'Christy Somers', profilePic: '', efforts: 101 },
  },
  'prescott': {
    displayLocation: 'Prescott, AZ',
    city: 'prescott',
    totalEfforts: '685',
    maleLeader: { name: 'Jon Wolfinger', profilePic: '', efforts: 93 },
    femaleLeader: { name: 'Carol Northrup', profilePic: '', efforts: 74 },
  },
  'vancouver': {
    displayLocation: 'Vancouver, BC',
    city: 'vancouver',
    totalEfforts: '642',
    maleLeader: { name: 'Chase Marting', profilePic: '', efforts: 65 },
    femaleLeader: { name: 'Paige Bennett', profilePic: '', efforts: 31 },
  },
  'oceanside': {
    displayLocation: 'Oceanside, CA',
    city: 'oceanside',
    totalEfforts: '616',
    maleLeader: { name: 'Deric Anthony', profilePic: '', efforts: 76 },
    femaleLeader: { name: 'Josette Caissie', profilePic: '', efforts: 33 },
  },
  'bozeman': {
    displayLocation: 'Bozeman, MT',
    city: 'bozeman',
    totalEfforts: '494',
    maleLeader: { name: 'Calvin Van Ryzin', profilePic: '', efforts: 112 },
    femaleLeader: { name: 'cara keleher', profilePic: '', efforts: 65 },
  },
  'windsor': {
    displayLocation: 'Windsor, CO',
    city: 'windsor',
    totalEfforts: '480',
    maleLeader: { name: 'Devan McKenney', profilePic: '', efforts: 138 },
    femaleLeader: { name: 'Elyssa Bell', profilePic: '', efforts: 24 },
  },
  'crowsnest pass': {
    displayLocation: 'Crowsnest Pass, Alberta',
    city: 'crowsnest pass',
    totalEfforts: '448',
    maleLeader: { name: 'Skylar Roth-MacDonald', profilePic: '', efforts: 120 },
    femaleLeader: { name: 'Jessica Sprague', profilePic: '', efforts: 108 },
  },
  'colwood': {
    displayLocation: 'Colwood, BC',
    city: 'colwood',
    totalEfforts: '383',
    maleLeader: { name: 'No leader yet', profilePic: '', efforts: 0 },
    femaleLeader: { name: 'Kirsten Chicoine', profilePic: '', efforts: 79 },
  },
  'winthrop': {
    displayLocation: 'Winthrop, WA',
    city: 'winthrop',
    totalEfforts: '329',
    maleLeader: { name: 'No leader yet', profilePic: '', efforts: 0 },
    femaleLeader: { name: 'Bri Boley (Graves)', profilePic: '', efforts: 76 },
  },
  'koloa': {
    displayLocation: 'Koloa, HI',
    city: 'koloa',
    totalEfforts: '301',
    maleLeader: { name: 'Isaiah Martinez', profilePic: '', efforts: 76 },
    femaleLeader: { name: 'Leila Miss', profilePic: '', efforts: 30 },
  },
  'nashville': {
    displayLocation: 'Nashville, TN',
    city: 'nashville',
    totalEfforts: '293',
    maleLeader: { name: 'Quintin Gay', profilePic: '', efforts: 40 },
    femaleLeader: { name: 'Carolyn Pippin', profilePic: '', efforts: 30 },
  },
  'aberdeen': {
    displayLocation: 'Aberdeen, WA',
    city: 'aberdeen',
    totalEfforts: '263',
    maleLeader: { name: 'Ted Wiseman', profilePic: '', efforts: 113 },
    femaleLeader: { name: 'Lauri Paulsen', profilePic: '', efforts: 41 },
  },
  'washington dc': {
    displayLocation: 'Washington DC',
    city: 'washington dc',
    totalEfforts: '240',
    maleLeader: { name: 'michael wardian', profilePic: '', efforts: 69 },
    femaleLeader: { name: 'Dora Elmore', profilePic: '', efforts: 11 },
  },
  'winnipeg': {
    displayLocation: 'Winnipeg, MB',
    city: 'winnipeg',
    totalEfforts: '233',
    maleLeader: { name: 'Timothy Preston', profilePic: '', efforts: 57 },
    femaleLeader: { name: 'Lindsey Lee', profilePic: '', efforts: 36 },
  },
  'marana': {
    displayLocation: 'Marana, AZ',
    city: 'marana',
    totalEfforts: '192',
    maleLeader: { name: 'Zack Benedict', profilePic: '', efforts: 66 },
    femaleLeader: { name: 'Gillian Algar', profilePic: '', efforts: 50 },
  },
  'hamilton': {
    displayLocation: 'Hamilton, Ontario',
    city: 'hamilton',
    totalEfforts: '186',
    maleLeader: { name: 'Kyle Kirkwood', profilePic: '', efforts: 92 },
    femaleLeader: { name: 'Nancy Krochmalnicki', profilePic: '', efforts: 30 },
  },
  'roseville-rocklin': {
    displayLocation: 'Roseville-Rocklin, CA',
    city: 'roseville-rocklin',
    totalEfforts: '161',
    maleLeader: { name: 'theo wirth', profilePic: '', efforts: 48 },
    femaleLeader: { name: 'Lena Wirth', profilePic: '', efforts: 17 },
  },
  'dartmouth': {
    displayLocation: 'Dartmouth, NS',
    city: 'dartmouth',
    totalEfforts: '156',
    maleLeader: { name: 'Mike DeCoffe', profilePic: '', efforts: 81 },
    femaleLeader: { name: 'Liz McEwen', profilePic: '', efforts: 25 },
  },
  'new paltz': {
    displayLocation: 'New Paltz, NY',
    city: 'new paltz',
    totalEfforts: '150',
    maleLeader: { name: 'Karl LaRocca', profilePic: '', efforts: 42 },
    femaleLeader: { name: 'Erin Quinn', profilePic: '', efforts: 14 },
  },
  'westfield': {
    displayLocation: 'Westfield, IN',
    city: 'westfield',
    totalEfforts: '149',
    maleLeader: { name: 'Jon Kuhn', profilePic: '', efforts: 54 },
    femaleLeader: { name: 'No leader yet', profilePic: '', efforts: 0 },
  },
  'la quinta': {
    displayLocation: 'La Quinta, CA',
    city: 'la quinta',
    totalEfforts: '148',
    maleLeader: { name: 'Hector Osuna', profilePic: '', efforts: 55 },
    femaleLeader: { name: 'Natalia Gonzalez', profilePic: '', efforts: 17 },
  },
  'sydney': {
    displayLocation: 'Sydney, Australia',
    city: 'sydney',
    totalEfforts: '131',
    maleLeader: { name: 'Ciaran Madden', profilePic: '', efforts: 39 },
    femaleLeader: { name: 'No leader yet', profilePic: '', efforts: 0 },
  },
  'red deer': {
    displayLocation: 'Red Deer, Alberta',
    city: 'red deer',
    totalEfforts: '130',
    maleLeader: { name: 'Sawback Tom', profilePic: '', efforts: 94 },
    femaleLeader: { name: 'Michelle Durette', profilePic: '', efforts: 35 },
  },
  'st george': {
    displayLocation: 'St George, UT',
    city: 'st george',
    totalEfforts: '76',
    maleLeader: { name: "Turd'L Miller", profilePic: '', efforts: 44 },
    femaleLeader: { name: 'Stacey Schuster', profilePic: '', efforts: 1 },
  },
  'guadalajara': {
    displayLocation: 'Guadalajara Jalisco, MX',
    city: 'guadalajara',
    totalEfforts: '68',
    maleLeader: { name: 'No leader yet', profilePic: '', efforts: 0 },
    femaleLeader: { name: 'Jenny Coombes', profilePic: '', efforts: 32 },
  },
  'berthoud': {
    displayLocation: 'Berthoud, CO',
    city: 'berthoud',
    totalEfforts: '55',
    maleLeader: { name: 'No leader yet', profilePic: '', efforts: 0 },
    femaleLeader: { name: 'Rosey Vaughan', profilePic: '', efforts: 32 },
  },
  'salida': {
    displayLocation: 'Salida, CO',
    city: 'salida',
    totalEfforts: '41',
    maleLeader: { name: 'Justin Walker', profilePic: '', efforts: 32 },
    femaleLeader: { name: 'Callie Cooper', profilePic: '', efforts: 2 },
  },
  'palm desert': {
    displayLocation: 'Palm Desert, CA',
    city: 'palm desert',
    totalEfforts: '26',
    maleLeader: { name: 'Hector Osuna', profilePic: '', efforts: 16 },
    femaleLeader: { name: 'No leader yet', profilePic: '', efforts: 0 },
  },
  'palm springs': {
    displayLocation: 'Palm Springs, CA',
    city: 'palm springs',
    totalEfforts: '26',
    maleLeader: { name: 'Hector Osuna', profilePic: '', efforts: 16 },
    femaleLeader: { name: 'No leader yet', profilePic: '', efforts: 0 },
  },
  'lompoc': {
    displayLocation: 'Lompoc, CA',
    city: 'lompoc',
    totalEfforts: '17',
    maleLeader: { name: 'Kalen Eittreim', profilePic: '', efforts: 17 },
    femaleLeader: { name: 'No leader yet', profilePic: '', efforts: 0 },
  },
  'saratoga springs': {
    displayLocation: 'Saratoga Springs, NY',
    city: 'saratoga springs',
    totalEfforts: '6',
    maleLeader: { name: 'No leader yet', profilePic: '', efforts: 0 },
    femaleLeader: { name: 'Keana Albert', profilePic: '', efforts: 2 },
  },
  'henryville': {
    displayLocation: 'Henryville, PA',
    city: 'henryville',
    totalEfforts: '6',
    maleLeader: { name: 'No leader yet', profilePic: '', efforts: 0 },
    femaleLeader: { name: 'Valeria Wang', profilePic: '', efforts: 6 },
  },
  'gila bend': {
    displayLocation: 'Gila Bend, AZ',
    city: 'gila bend',
    totalEfforts: '3',
    maleLeader: { name: 'No leader yet', profilePic: '', efforts: 0 },
    femaleLeader: { name: 'Tara Ultrarunningprayerwarrior', profilePic: '', efforts: 3 },
  },
  'auckland': {
    displayLocation: 'Auckland, New Zealand',
    city: 'auckland',
    totalEfforts: '1',
    maleLeader: { name: 'Hamish Hammer Johnstone', profilePic: '', efforts: 1 },
    femaleLeader: { name: 'No leader yet', profilePic: '', efforts: 0 },
  },
  'auburn': {
    displayLocation: 'Auburn, CA',
    city: 'auburn',
    totalEfforts: '0',
    maleLeader: { name: 'No leader yet', profilePic: '', efforts: 0 },
    femaleLeader: { name: 'No leader yet', profilePic: '', efforts: 0 },
  },
  'golden': {
    displayLocation: 'Golden, CO',
    city: 'golden',
    totalEfforts: '0',
    maleLeader: { name: 'No leader yet', profilePic: '', efforts: 0 },
    femaleLeader: { name: 'No leader yet', profilePic: '', efforts: 0 },
  },
  'ponte vedra': {
    displayLocation: 'Ponte Vedra, FL',
    city: 'ponte vedra',
    totalEfforts: '0',
    maleLeader: { name: 'No leader yet', profilePic: '', efforts: 0 },
    femaleLeader: { name: 'No leader yet', profilePic: '', efforts: 0 },
  },
  'hanover': {
    displayLocation: 'Hanover, NH',
    city: 'hanover',
    totalEfforts: '0',
    maleLeader: { name: 'No leader yet', profilePic: '', efforts: 0 },
    femaleLeader: { name: 'No leader yet', profilePic: '', efforts: 0 },
  },
};

// Helper to get fallback data for a city
export function getFallbackData(city: string): FallbackChapterData | null {
  const normalizedCity = city.toLowerCase().trim();
  return fallbackData[normalizedCity] || null;
}

// Date when fallback data was captured
export const FALLBACK_DATA_DATE = '2026-01-12T08:44:00';
