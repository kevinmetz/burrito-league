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

async function freeze() {
  // Import after env vars are set so the Supabase client picks them up
  const { getChaptersFromSupabase } = await import('../src/lib/supabase');

  console.log('Calling getChaptersFromSupabase() — the exact function the live site uses...\n');
  const result = await getChaptersFromSupabase();

  if (!result) {
    console.error('getChaptersFromSupabase() returned null — nothing to freeze.');
    process.exit(1);
  }

  console.log(`Got ${result.chapters.length} chapters, poll run ${result.pollRun.id}, last updated ${result.lastUpdated}`);

  const outDir = path.join(__dirname, '../src/data');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'chapters-final-2026.json');
  fs.writeFileSync(outPath, JSON.stringify(result, null, 2));

  console.log(`\nWrote frozen snapshot to ${outPath}`);
}

freeze().catch((err) => {
  console.error(err);
  process.exit(1);
});
