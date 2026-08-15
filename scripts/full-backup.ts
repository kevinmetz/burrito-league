import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
for (const line of envContent.split('\n')) {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match && !process.env[match[1]]) {
    process.env[match[1]] = match[2];
  }
}

// Service role client - bypasses RLS so we get every row, including poll_details
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function fetchAllRows(table: string): Promise<any[]> {
  let all: any[] = [];
  let page = 0;
  const pageSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) {
      console.error(`Error fetching ${table} page ${page}:`, error);
      hasMore = false;
    } else if (!data || data.length === 0) {
      hasMore = false;
    } else {
      all = all.concat(data);
      hasMore = data.length === pageSize;
      page++;
    }
  }

  return all;
}

const SCHEMA_NOTES = `
# Burrito League Supabase Schema (as of backup date)

Reconstructed from src/lib/supabase.ts TypeScript interfaces and .from()/.select()
calls, since the Supabase CLI was never linked to this project (no migrations
directory). If rebuilding in a future year, recreate these tables with
equivalent columns before restoring the JSON data below.

## poll_runs
- id: uuid (primary key)
- polled_at: timestamptz
- chapters_polled: int
- chapters_successful: int
- was_rate_limited: boolean
- source: text ('scheduled' | 'manual' | 'build')

## segment_snapshots
- id: uuid (primary key)
- poll_run_id: uuid (fk -> poll_runs.id)
- segment_id: bigint
- city: text
- state: text | null
- country: text | null
- display_location: text | null
- total_efforts: int | null
- total_athletes: int | null
- total_distance: text | null
- male_leader_name: text | null
- male_leader_efforts: int | null
- male_leader_profile_pic: text | null
- female_leader_name: text | null
- female_leader_efforts: int | null
- female_leader_profile_pic: text | null
- polled_at: timestamptz

## chapter_coordinates
- id: uuid (primary key)
- city: text
- state: text | null
- country: text
- lat: numeric
- lng: numeric
- source: text ('geocoded' | 'manual')
- created_at: timestamptz

## poll_details
- id: uuid (primary key)
- poll_run_id: uuid (fk -> poll_runs.id)
- segment_id: bigint
- display_location: text | null
- api_total_efforts: int | null
- api_male_leader_name: text | null
- api_male_leader_efforts: int | null
- api_female_leader_name: text | null
- api_female_leader_efforts: int | null
- existing_total_efforts: int | null
- existing_male_leader_efforts: int | null
- existing_female_leader_efforts: int | null
- action: text ('inserted' | 'skipped' | 'no_data')
- skip_reason: text | null
- created_at: timestamptz

## Notes for a 2027 rebuild
- Polling logic + batching: src/app/api/cron/poll-strava/route.ts,
  .github/workflows/poll-strava.yml (cron schedules preserved there, commented out)
- Chapter source of truth was a Google Sheet, not these tables:
  https://docs.google.com/spreadsheets/d/14IryBvhyVun3fXbHCdDD6q6kWe5JwoqIj2TeRbYptxo
- Env vars needed: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY,
  STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, STRAVA_REFRESH_TOKEN, CRON_SECRET
`;

async function backup() {
  const outDir = path.join(__dirname, '../backup');
  fs.mkdirSync(outDir, { recursive: true });

  const tables = ['poll_runs', 'segment_snapshots', 'chapter_coordinates', 'poll_details'];
  const summary: Record<string, number> = {};

  for (const table of tables) {
    console.log(`Fetching all rows from ${table}...`);
    const rows = await fetchAllRows(table);
    summary[table] = rows.length;
    fs.writeFileSync(path.join(outDir, `${table}.json`), JSON.stringify(rows, null, 2));
    console.log(`  -> ${rows.length} rows written to backup/${table}.json`);
  }

  fs.writeFileSync(path.join(outDir, 'SCHEMA.md'), SCHEMA_NOTES.trim() + '\n');

  const manifest = {
    backedUpAt: new Date().toISOString(),
    rowCounts: summary,
    note: 'Full raw Supabase export for the 2026 Burrito League project. Not committed to the public repo — this is the private archive to enable a 2027 rebuild.',
  };
  fs.writeFileSync(path.join(outDir, 'MANIFEST.json'), JSON.stringify(manifest, null, 2));

  console.log('\nBackup complete:');
  console.log(JSON.stringify(summary, null, 2));
}

backup().catch((err) => {
  console.error(err);
  process.exit(1);
});
