// Fetches chapter data from the Mountain Outpost Google Sheet

const SHEET_CSV_URL =
  'https://docs.google.com/spreadsheets/d/14IryBvhyVun3fXbHCdDD6q6kWe5JwoqIj2TeRbYptxo/gviz/tq?tqx=out:csv';

export interface SheetChapter {
  segmentName: string;
  city: string;
  state: string;
  country: string;
}

// US state abbreviations
const US_STATE_ABBREV: Record<string, string> = {
  'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR',
  'california': 'CA', 'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE',
  'florida': 'FL', 'georgia': 'GA', 'hawaii': 'HI', 'idaho': 'ID',
  'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA', 'kansas': 'KS',
  'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD',
  'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN', 'mississippi': 'MS',
  'missouri': 'MO', 'montana': 'MT', 'nebraska': 'NE', 'nevada': 'NV',
  'new hampshire': 'NH', 'new jersey': 'NJ', 'new mexico': 'NM', 'new york': 'NY',
  'north carolina': 'NC', 'north dakota': 'ND', 'ohio': 'OH', 'oklahoma': 'OK',
  'oregon': 'OR', 'pennsylvania': 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
  'south dakota': 'SD', 'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT',
  'vermont': 'VT', 'virginia': 'VA', 'washington': 'WA', 'west virginia': 'WV',
  'wisconsin': 'WI', 'wyoming': 'WY',
  // Common abbreviations in sheet
  'az': 'AZ', 'ca': 'CA', 'co': 'CO', 'fl': 'FL', 'ga': 'GA', 'hi': 'HI',
  'mi': 'MI', 'nv': 'NV', 'ny': 'NY', 'pa': 'PA', 'tn': 'TN', 'tx': 'TX',
  'wa': 'WA',
};

// Parse full CSV handling multi-line quoted fields
function parseCSV(csv: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < csv.length; i++) {
    const char = csv[i];

    if (char === '"') {
      if (inQuotes && csv[i + 1] === '"') {
        // Escaped quote
        currentField += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentField.trim());
      currentField = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      // End of row (skip \r in \r\n)
      if (char === '\r' && csv[i + 1] === '\n') {
        i++;
      }
      currentRow.push(currentField.trim());
      if (currentRow.some(f => f)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }

  // Don't forget the last field/row
  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some(f => f)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

// Country code to full name for display
const COUNTRY_NAMES: Record<string, string> = {
  'AUS': 'Australia',
  'MEX': 'Mexico',
  'NZ': 'New Zealand',
  'CAN': 'Canada',
};

export function formatLocation(city: string, state: string, country: string): string {
  const cleanCity = city.trim();
  const cleanState = state.trim();
  const cleanCountry = country.trim().toUpperCase();

  if (cleanCountry === 'USA' || cleanCountry === 'US') {
    // US: City, STATE_ABBREV
    const abbrev = US_STATE_ABBREV[cleanState.toLowerCase()] || cleanState;
    return `${cleanCity}, ${abbrev}`;
  } else if (cleanState) {
    // International with state/province: City, State
    return `${cleanCity}, ${cleanState}`;
  } else {
    // International without state: City, Country
    const countryName = COUNTRY_NAMES[cleanCountry] || cleanCountry;
    return `${cleanCity}, ${countryName}`;
  }
}

export async function fetchChaptersFromSheet(): Promise<SheetChapter[]> {
  try {
    const response = await fetch(SHEET_CSV_URL, {
      next: { revalidate: 900 }, // Cache for 15 minutes
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch sheet: ${response.status}`);
    }

    const csv = await response.text();
    const rows = parseCSV(csv);

    // Skip header row
    const chapters: SheetChapter[] = [];
    for (let i = 1; i < rows.length; i++) {
      const cols = rows[i];

      // Skip rows without city data
      if (!cols[1] || !cols[1].trim()) continue;

      chapters.push({
        segmentName: cols[0] || '',
        city: cols[1] || '',
        state: cols[2] || '',
        country: cols[3] || 'USA',
      });
    }

    return chapters;
  } catch (error) {
    console.error('Error fetching chapters from sheet:', error);
    return [];
  }
}
