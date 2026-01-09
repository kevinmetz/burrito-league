export interface Chapter {
  id: string;
  city: string;
  state: string;
  segmentId: number;
  featured?: boolean;
}

export const chapters: Chapter[] = [
  // Featured chapter first
  { id: 'tempe', city: 'Tempe', state: 'AZ', segmentId: 40744376, featured: true },

  // Alphabetical by city
  { id: 'atlanta', city: 'Atlanta', state: 'GA', segmentId: 40747724 },
  { id: 'berthoud', city: 'Berthoud', state: 'CO', segmentId: 40746992 },
  { id: 'boulder', city: 'Boulder', state: 'CO', segmentId: 40751499 },
  { id: 'calgary', city: 'Calgary', state: 'Alberta', segmentId: 40748818 },
  { id: 'castle-rock', city: 'Castle Rock', state: 'CO', segmentId: 40744240 },
  { id: 'chattanooga', city: 'Chattanooga', state: 'TN', segmentId: 40752705 },
  { id: 'crowsnest-pass', city: 'Crowsnest Pass', state: 'Alberta', segmentId: 40748430 },
  { id: 'denver', city: 'Denver', state: 'CO', segmentId: 40750921 },
  { id: 'flagstaff', city: 'Flagstaff', state: 'AZ', segmentId: 40748849 },
  { id: 'gila-bend', city: 'Gila Bend', state: 'AZ', segmentId: 40748843 },
  { id: 'hamilton', city: 'Hamilton', state: 'Ontario', segmentId: 40751550 },
  { id: 'henryville', city: 'Henryville', state: 'PA', segmentId: 40750978 },
  { id: 'houston', city: 'Houston', state: 'TX', segmentId: 40747282 },
  { id: 'madison-heights', city: 'Madison Heights', state: 'MI', segmentId: 40752439 },
  { id: 'marana', city: 'Marana', state: 'AZ', segmentId: 40750504 },
  { id: 'ponte-vedra', city: 'Ponte Vedra', state: 'FL', segmentId: 40752662 },
  { id: 'prescott', city: 'Prescott', state: 'AZ', segmentId: 40752963 },
  { id: 'redlands', city: 'Redlands', state: 'CA', segmentId: 40744216 },
  { id: 'san-francisco', city: 'San Francisco', state: 'CA', segmentId: 40744617 },
  { id: 'santa-barbara', city: 'Santa Barbara', state: 'CA', segmentId: 40748122 },
  { id: 'toronto', city: 'Toronto', state: 'Ontario', segmentId: 40748081 },
  { id: 'tucson', city: 'Tucson', state: 'AZ', segmentId: 40748423 },
];
