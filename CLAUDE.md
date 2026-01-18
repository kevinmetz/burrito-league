# Burrito League Dashboard

## Project Overview

A dashboard/website for tracking the grassroots "Burrito League" running competition - a community challenge where runners compete to collect the most Strava segment completions in a month, with the winner earning a year's worth of free burritos.

**Live at:** burrito.run or burritoboard.com (TBD)

**Learn more:** https://www.mountainoutpost.com/burritoleague/

## Background

Burrito League was born from the 2025 Chipotle x Strava challenge. When the official challenge didn't return in 2026, Aravaipa founder Jamil Coury took a grassroots approach, creating "Burrito League" with the OG Tempe segment as the first chapter. The league has grown to 24+ chapters worldwide.

Each chapter has a short Strava segment (~0.2-0.3 miles). The competition tracks "Local Legend" status - whoever has the most segment completions at month's end wins.

## Tech Stack

- **Framework:** Next.js 14+ (App Router) with React and TypeScript
- **Styling:** Tailwind CSS
- **Countdown Timer:** @leenguyen/react-flip-clock-countdown
- **API:** Next.js API routes for Strava integration
- **Deployment:** Netlify with custom domain
- **Data Source:** Strava API

## Project Structure

```
/app                 - Next.js app directory
/app/api             - API routes for Strava data fetching
/components          - React components (Card, Leaderboard, Timer, etc.)
/lib                 - Utility functions and Strava API client
/public              - Static assets (logo, wood texture)
/assets              - Source design assets (not deployed)
/designs             - Design mockups for reference
```

## Design Specifications

### Assets
- **Logo:** `assets/BL_Logo_low.png` (to be updated with high-res later)
- **Background:** `assets/bl_wood_ss.png` - wood paneling texture
  - Mobile: stretch to fit window width
  - Desktop: tile vertically as needed

### Typography
- **Font:** Avenir
- **Weights:** Heavy (most places), Black (segment numbers)

### Colors
- **City name (Tempe, AZ):** #FE0A5F
- **Athlete names:** White, size 18, with drop shadow
- **Segment numbers:** #FDDF58, size 34, Avenir Black, with drop shadow

## Features

### Header Section
1. Burrito League logo at top
2. Text: "wtf is burrito league? learn more at mountainoutpost!"
   - "mountainoutpost!" links to: https://www.mountainoutpost.com/burritoleague/

### Countdown Timer
- Flip-style animation (like old airport boards)
- Counts down to: February 1, 2026 00:00:00 Arizona Time (MST, no DST)
- Shows: Days, Hours, Minutes, Seconds
- Updates every second
- Package: @leenguyen/react-flip-clock-countdown

### Chapter Cards

#### Collapsed State (Mock1)
- Chapter name: "Tempe, AZ"
- City Segments: Total segment completions for that chapter
- Top Male leader: Profile pic (circle), name, segment count
- Top Female leader: Profile pic (circle), name, segment count
- CTA: "See full top 10" with down arrow

#### Expanded State (Mock2)
- Top 5 Male athletes (ranked 1-5)
- Top 5 Female athletes (ranked 1-5)
- Each entry: Rank number, circular profile pic, name, segment count
- Link: "View the Strava Segment" → Strava segment URL
- CTA: "Collapse" with up triangle

### Future Features (Not MVP)
- Master leaderboard: Top 10 male/female by total distance (segments × attempts)
- Top chapters dashboard: Which chapter has most miles
- Multiple chapter cards
- Participant counts per chapter

## Data Sources

### Primary Data: Mountain Outpost Google Sheet
The chapter list is driven by the official Burrito League spreadsheet:
- **Sheet URL:** https://docs.google.com/spreadsheets/d/14IryBvhyVun3fXbHCdDD6q6kWe5JwoqIj2TeRbYptxo
- **CSV Export:** https://docs.google.com/spreadsheets/d/14IryBvhyVun3fXbHCdDD6q6kWe5JwoqIj2TeRbYptxo/gviz/tq?tqx=out:csv
- **Columns Used:** Segment Name, City, State, Country

### Segment ID Mapping
Since hyperlinks aren't accessible via CSV export, segment IDs are maintained locally in `src/lib/segmentIds.ts`.
- Maps city names to Strava segment IDs
- If a city appears in sheet but has no segment ID → show "Segment ID needed on League sheet" with link to mountainoutpost
- Segment IDs must be verified manually (sheet data can be incorrect)

### Location Display Formatting
- **USA:** City, STATE_ABBREV (e.g., "Tempe, AZ", "San Francisco, CA")
- **Canada:** City, Province (e.g., "Calgary, Alberta", "Toronto, Ontario")
- **Other Countries:** City, Region/Country (e.g., "London, England")

### Card Sorting
Cards are sorted by total segment efforts (highest first), not alphabetically.

## Strava API Integration

### Segment
- **Tempe Chapter:** https://www.strava.com/segments/40744376
- **Segment ID:** 40744376

### API Requirements
- Fetch segment leaderboard data
- Get athlete profile pictures and names
- Separate male/female leaderboards

### Caching Strategy
- **Peak hours (6am-10pm Arizona):** Refresh every 15 minutes
- **Off-peak hours:** Refresh every hour
- **Estimated daily calls:** 70-80 (well within 1,000 limit)

### Rate Limit Handling
- Monitor headers: `X-Ratelimit-Usage` and `X-Ratelimit-Limit`
- Back off if approaching limits
- Store credentials in environment variables (server-side only)

## Environment Variables

```
STRAVA_CLIENT_ID=
STRAVA_CLIENT_SECRET=
STRAVA_REFRESH_TOKEN=
```

## Development Phases

### Phase 1: MVP (Current)
- Single Tempe chapter card
- Countdown timer
- Basic Strava integration
- Deploy to Netlify

### Phase 2: Multi-Chapter
- Add additional chapter cards
- Chapter configuration system

### Phase 3: Analytics
- Master leaderboard
- Top chapters by miles
- Participant statistics

## Strava API Setup Notes

1. Create Strava API Application at https://www.strava.com/settings/api
2. Get Client ID and Client Secret
3. Authorize app to get refresh token
4. Use refresh token flow for server-side API calls
5. Segment leaderboard endpoint: `GET /segments/{id}/leaderboard`

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
```

## Deployment

- Platform: Netlify → Vercel (migrated)
- Build command: `npm run build`
- Publish directory: `.next`
- Environment variables configured in dashboard

---

## Milestone Amendment: Google Sheets as Single Source of Truth

### Overview
Migrate from hardcoded segment IDs to using the Google Sheet as the single source of truth for all chapter data, including Strava segment links.

### Data Source Changes

#### Column K: Strava Segment Link
- **Has segment link** (e.g., `https://www.strava.com/segments/40744376`) → Extract segment ID, fetch data normally
- **Says "duplicate"** → Skip this row entirely
- **Says anything else** (e.g., "need segment", "pending", empty) → Show "need segment" treatment card

#### Multiple Listings (Same Location)
Cities with multiple entries (e.g., two Atlanta, GA rows) → Display as "Atlanta, GA #1", "Atlanta, GA #2", etc.

#### Map Integration
The globe/map should be powered by the same sheet data, with burrito emoji markers for each valid chapter based on city coordinates.

### Polling Schedule Changes

#### Current
- Revalidate every 4 hours (ISR)

#### New Schedule
Poll Strava API 4x daily at specific Arizona times:
- 12:00 AM MST
- 7:00 AM MST
- 12:00 PM MST
- 7:00 PM MST

#### Pre-Poll City Scanning
10 minutes before each poll time:
1. Fetch Google Sheet
2. Compare to known cities
3. If new city found → Add card with "loading" state
4. Await next poll to fill data

### Data Storage: Supabase Integration
- Store each poll's data in Supabase
- Insert/append (not overwrite) for historical tracking
- Enable future analytics features:
  - Trend analysis
  - Historical leaderboards
  - Chapter growth metrics

### Implementation Components

1. **sheets.ts updates**
   - Parse Column K for segment links
   - Handle "duplicate" skip logic
   - Handle "need segment" states
   - Extract segment ID from Strava URLs

2. **Remove segmentIds.ts**
   - No longer needed as source of truth
   - Segment IDs come from sheet Column K

3. **Cron job setup**
   - Vercel cron for scheduled polling
   - Pre-poll sheet scanning

4. **Supabase schema**
   - chapters table
   - poll_history table
   - segment_data table

5. **coordinates.ts updates**
   - Generate coordinates from sheet cities
   - Or add lat/lng columns to sheet

### UI Changes
- Card highlight border-radius matches card styling (rounded-2xl) ✅

---

## Milestone: Flagship & Affiliate Leagues - January 16, 2026

### Overview
Restructured the Mount to Coast conference system into two tiers: Flagship League and Affiliate League, with distinct visual treatments for each.

### Flagship League (Black Cards)
Premium tier cities displayed first with dark styling:
- Tempe
- San Francisco
- Redlands
- New York
- Denver / Wheat Ridge
- Flagstaff
- Chattanooga
- Boston
- Atlanta (segment #40747724 only)

**Styling:** Black background (`bg-black/90`), white text, gold accent numbers (`#FDDF58`), "FLAGSHIP LEAGUE" header with white M2C logo

### Affiliate League (White Cards)
Secondary tier cities displayed after Flagship:
- Salida
- Bend
- Reno
- Castle Rock
- Nashville
- Ogden
- Healdsburg

**Styling:** White background (`bg-white/80`), black text, pink accent numbers (`#FE0A5F`), "AFFILIATE LEAGUE" header with dark M2C logo

### Rendering Order
1. Flagship League cards (9 cities)
2. Affiliate League cards (7 cities)
3. All other chapters sorted by total efforts

### Files Changed
- `src/app/page.tsx` - Added FLAGSHIP_CITIES, AFFILIATE_CITIES arrays, updated filtering/sorting logic
- `src/components/ConferenceCard.tsx` - Restyled to black for Flagship League
- `src/components/AffiliateCard.tsx` - New component with white styling for Affiliate League

### Notes
- Atlanta has multiple segments; only segment 40747724 is Flagship, others render as regular cards
- Boston needs to be added to Google Sheet with valid Strava segment URL

---

## Milestone: Delta Display & New Leader Crowns - January 17, 2026

### Overview
Added real-time change indicators showing effort deltas and celebrating new leaders with crown overlays. This feature leverages historical Supabase snapshots to show how leaderboards are evolving between polls.

### Features

#### Delta Display (+X)
Shows the change in effort count since the last time the value was different:
- Positioned above-left of the main effort number (superscript style)
- Subtle -6° rotation for visual flair
- `font-black` weight with drop shadow for visibility
- **Male delta color:** `#39B7FF` (blue)
- **Female delta color:** `#FF751F` (orange)

**Logic:**
- Only shows positive deltas (no -X or +0)
- Compares against historical snapshots to find last *different* value
- If duplicate polls return same data, no delta shown
- Only enabled for Flagship and Affiliate league cards

#### New Leader Crown
When a leader changes, celebrates with:
- Crown image overlay on profile picture (`w-14 h-10`, positioned above avatar)
- "NEW LEADER!" badge replacing the "Male"/"Female" label
- Badge color: Gold `#FDDF58` on Flagship, Pink `#FE0A5F` on Affiliate

**Logic:**
- Crown appears when leader name changes from previous snapshot
- Crown disappears once the new leader's effort count increases (they've defended their position)
- Tracks `isNewLeader` boolean alongside delta calculation

### Data Layer Changes

#### New Interface: LeaderDelta
```typescript
interface LeaderDelta {
  delta: number | null;      // +X efforts since last change
  isNewLeader: boolean;      // true if leader changed and hasn't increased yet
}
```

#### Updated: Leader Interface
```typescript
interface Leader {
  name: string;
  profilePic: string;
  efforts: number;
  delta?: LeaderDelta;       // Optional delta info
}
```

#### Function: calculateLeaderDelta
Added to `src/lib/supabase.ts` - compares current snapshot against historical data grouped by segment to determine:
1. If leader name changed → `isNewLeader: true`
2. Last different effort value → calculate delta
3. If new leader's count increased → `isNewLeader: false`, show delta instead

### Files Changed
- `src/lib/supabase.ts` - Added `LeaderDelta` interface, `calculateLeaderDelta()` function, updated `getChaptersFromSupabase()` to include delta data
- `src/components/ConferenceCard.tsx` - Added crown overlay, delta display, updated `LeaderRow` component
- `src/components/AffiliateCard.tsx` - Same updates as ConferenceCard with Affiliate styling
- `public/crown.png` - Crown asset for new leader display

### Design Iterations
Initial implementation had deltas inline with effort numbers. After QA review:
- Increased crown size from `w-8 h-6` to `w-14 h-10`
- Changed delta from `text-sm font-bold` to `text-base font-black`
- Repositioned delta to absolute above-left of main number
- Reduced rotation from -12° to -6°
- Added drop shadow for better visibility on light backgrounds
