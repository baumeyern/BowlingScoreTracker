# Bowling League Tracker - Complete Implementation Prompt

## Overview
Build a production-ready React web application for a 4-person bowling league team to track weekly scores, visualize performance trends, and run a prediction mini-game where teammates guess each other's scores. The app must support backfilling historical data (currently in week 5) and calculate handicaps using the 90% of 220 formula.

## Tech Stack
- **Frontend**: React 18+ with TypeScript, Vite, TailwindCSS, shadcn/ui components
- **Backend**: Supabase (PostgreSQL database, Auth, Row Level Security)
- **Deployment**: Vercel
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: React Router v6
- **Charts**: Recharts for data visualization

## Database Schema (Supabase)

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Bowlers table (the 4 teammates)
CREATE TABLE bowlers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  nickname TEXT,
  pin_code TEXT, -- Simple 4-digit PIN for "logging in"
  avatar_color TEXT DEFAULT '#3B82F6', -- For UI differentiation
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Weeks table (each week of the league)
CREATE TABLE weeks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  week_number INTEGER NOT NULL UNIQUE,
  bowling_date DATE,
  is_complete BOOLEAN DEFAULT FALSE, -- All scores entered
  predictions_locked BOOLEAN DEFAULT FALSE, -- Lock predictions once bowling starts
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Games table (3 games per bowler per week)
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  week_id UUID REFERENCES weeks(id) ON DELETE CASCADE,
  bowler_id UUID REFERENCES bowlers(id) ON DELETE CASCADE,
  game_number INTEGER NOT NULL CHECK (game_number >= 1 AND game_number <= 3),
  score INTEGER CHECK (score >= 0 AND score <= 300),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(week_id, bowler_id, game_number)
);

-- Predictions table (each bowler predicts others' series totals)
CREATE TABLE predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  week_id UUID REFERENCES weeks(id) ON DELETE CASCADE,
  predictor_id UUID REFERENCES bowlers(id) ON DELETE CASCADE, -- Who made the prediction
  target_id UUID REFERENCES bowlers(id) ON DELETE CASCADE,    -- Who they're predicting
  predicted_series INTEGER NOT NULL CHECK (predicted_series >= 0 AND predicted_series <= 900),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(week_id, predictor_id, target_id),
  CHECK (predictor_id != target_id) -- Can't predict your own score
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON games
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_predictions_updated_at BEFORE UPDATE ON predictions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_games_week ON games(week_id);
CREATE INDEX idx_games_bowler ON games(bowler_id);
CREATE INDEX idx_games_week_bowler ON games(week_id, bowler_id);
CREATE INDEX idx_predictions_week ON predictions(week_id);
CREATE INDEX idx_predictions_predictor ON predictions(predictor_id);

-- Views for common queries

-- Bowler weekly series (sum of 3 games)
CREATE OR REPLACE VIEW bowler_weekly_series AS
SELECT 
  g.week_id,
  g.bowler_id,
  w.week_number,
  SUM(g.score) AS series_total,
  ARRAY_AGG(g.score ORDER BY g.game_number) AS game_scores,
  COUNT(g.score) AS games_entered
FROM games g
JOIN weeks w ON g.week_id = w.id
WHERE g.score IS NOT NULL
GROUP BY g.week_id, g.bowler_id, w.week_number;

-- Bowler running averages (for handicap calculation)
CREATE OR REPLACE VIEW bowler_averages AS
SELECT 
  bowler_id,
  COUNT(*) AS total_games,
  ROUND(AVG(score)::numeric, 2) AS average,
  ROUND((220 - AVG(score)) * 0.9)::integer AS handicap,
  MAX(score) AS high_game,
  MIN(score) AS low_game,
  SUM(score) AS total_pins
FROM games
WHERE score IS NOT NULL
GROUP BY bowler_id;

-- Prediction accuracy per predictor
CREATE OR REPLACE VIEW prediction_accuracy AS
SELECT 
  p.predictor_id,
  p.week_id,
  w.week_number,
  p.target_id,
  p.predicted_series,
  bws.series_total AS actual_series,
  ABS(p.predicted_series - bws.series_total) AS difference,
  CASE 
    WHEN bws.series_total IS NOT NULL THEN 
      ROUND(100 - (ABS(p.predicted_series - bws.series_total)::numeric / bws.series_total * 100), 1)
    ELSE NULL 
  END AS accuracy_pct
FROM predictions p
JOIN weeks w ON p.week_id = w.id
LEFT JOIN bowler_weekly_series bws ON p.week_id = bws.week_id AND p.target_id = bws.bowler_id;

-- Row Level Security (open access for team app)
ALTER TABLE bowlers ENABLE ROW LEVEL SECURITY;
ALTER TABLE weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all" ON bowlers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON weeks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON games FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON predictions FOR ALL USING (true) WITH CHECK (true);
```

## Handicap Calculation Logic

```typescript
// lib/handicap.ts

/**
 * League handicap formula: 90% of (220 - average)
 * 
 * Example: 
 *   - Bowler average: 180
 *   - Handicap = (220 - 180) * 0.9 = 36
 *   - Handicap score for a 175 game = 175 + 36 = 211
 */

export const HANDICAP_BASE = 220;
export const HANDICAP_PERCENTAGE = 0.9;

export function calculateHandicap(average: number): number {
  if (average >= HANDICAP_BASE) return 0; // No handicap if averaging 220+
  return Math.round((HANDICAP_BASE - average) * HANDICAP_PERCENTAGE);
}

export function calculateAverage(scores: number[]): number {
  if (scores.length === 0) return 0;
  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
}

export function calculateHandicapScore(scratchScore: number, handicap: number): number {
  return scratchScore + handicap;
}

export function calculateSeriesWithHandicap(
  gameScores: number[], 
  handicap: number
): { scratch: number; withHandicap: number } {
  const scratch = gameScores.reduce((sum, score) => sum + score, 0);
  return {
    scratch,
    withHandicap: scratch + (handicap * gameScores.length) // Handicap applied per game
  };
}
```

## Prediction Scoring System

```typescript
// lib/predictions.ts

export interface PredictionResult {
  predictorId: string;
  targetId: string;
  predicted: number;
  actual: number;
  difference: number;
  points: number;
}

/**
 * Prediction scoring: Award points based on accuracy
 * - Exact (0 difference): 10 points
 * - Within 10 pins: 7 points
 * - Within 25 pins: 5 points
 * - Within 50 pins: 3 points
 * - Within 75 pins: 1 point
 * - More than 75 off: 0 points
 */
export function calculatePredictionPoints(difference: number): number {
  if (difference === 0) return 10;
  if (difference <= 10) return 7;
  if (difference <= 25) return 5;
  if (difference <= 50) return 3;
  if (difference <= 75) return 1;
  return 0;
}

export function calculateWeeklyPredictionResults(
  predictions: { predictorId: string; targetId: string; predicted: number }[],
  actuals: { bowlerId: string; series: number }[]
): PredictionResult[] {
  return predictions.map(pred => {
    const actual = actuals.find(a => a.bowlerId === pred.targetId)?.series ?? 0;
    const difference = Math.abs(pred.predicted - actual);
    return {
      ...pred,
      actual,
      difference,
      points: calculatePredictionPoints(difference)
    };
  });
}

// Leaderboard for prediction game
export function calculatePredictionLeaderboard(
  allResults: PredictionResult[]
): { bowlerId: string; totalPoints: number; avgDifference: number }[] {
  const grouped = allResults.reduce((acc, result) => {
    if (!acc[result.predictorId]) {
      acc[result.predictorId] = { points: 0, differences: [], count: 0 };
    }
    acc[result.predictorId].points += result.points;
    acc[result.predictorId].differences.push(result.difference);
    acc[result.predictorId].count++;
    return acc;
  }, {} as Record<string, { points: number; differences: number[]; count: number }>);

  return Object.entries(grouped)
    .map(([bowlerId, data]) => ({
      bowlerId,
      totalPoints: data.points,
      avgDifference: data.differences.reduce((a, b) => a + b, 0) / data.differences.length
    }))
    .sort((a, b) => b.totalPoints - a.totalPoints || a.avgDifference - b.avgDifference);
}
```

## Application Structure

```
src/
├── components/
│   ├── ui/                      # shadcn components
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Navigation.tsx
│   │   ├── MobileNav.tsx
│   │   └── BowlerSelector.tsx   # Switch between bowlers
│   ├── scores/
│   │   ├── WeeklyScoreEntry.tsx # Enter 3 games for a week
│   │   ├── GameScoreInput.tsx   # Individual game input (0-300)
│   │   ├── SeriesSummary.tsx    # Shows 3-game total + handicap
│   │   └── ScoreHistory.tsx     # Past weeks table
│   ├── predictions/
│   │   ├── PredictionEntry.tsx  # Enter predictions for teammates
│   │   ├── PredictionCard.tsx   # Single prediction input
│   │   ├── PredictionResults.tsx # Show accuracy after week completes
│   │   └── PredictionLeaderboard.tsx
│   ├── charts/
│   │   ├── AverageOverTime.tsx  # Line chart of running average
│   │   ├── ScoreDistribution.tsx # Histogram of scores
│   │   ├── GameByGameChart.tsx  # All games plotted
│   │   ├── TeamComparison.tsx   # Compare all 4 bowlers
│   │   └── HandicapTrend.tsx    # Handicap changes over time
│   ├── stats/
│   │   ├── BowlerStatsCard.tsx  # Individual stats summary
│   │   ├── TeamStats.tsx        # Team aggregate stats
│   │   └── PersonalBests.tsx    # High game, high series, etc.
│   └── common/
│       ├── LoadingSpinner.tsx
│       ├── ErrorBoundary.tsx
│       └── EmptyState.tsx
├── hooks/
│   ├── useSupabase.ts
│   ├── useBowlers.ts
│   ├── useWeeks.ts
│   ├── useGames.ts
│   ├── usePredictions.ts
│   └── useStats.ts
├── lib/
│   ├── supabase.ts              # Supabase client
│   ├── handicap.ts              # Handicap calculations
│   ├── predictions.ts           # Prediction scoring
│   └── utils.ts
├── pages/
│   ├── Dashboard.tsx            # Home with quick stats & current week
│   ├── EnterScores.tsx          # Score entry for any week
│   ├── Predictions.tsx          # Make/view predictions
│   ├── Stats.tsx                # Charts and statistics
│   ├── History.tsx              # All weeks history table
│   ├── Leaderboard.tsx          # Prediction game standings
│   └── Settings.tsx             # Manage bowlers, reset data
├── types/
│   └── index.ts                 # TypeScript interfaces
├── App.tsx
└── main.tsx
```

## Key Components Specifications

### 1. WeeklyScoreEntry.tsx (Primary Data Entry)
Clean interface for entering/editing 3 games per bowler per week:

```tsx
// Layout concept:
// ┌─────────────────────────────────────────────────────┐
// │  Week 5 - November 15, 2024          [Edit Date]   │
// ├─────────────────────────────────────────────────────┤
// │                                                     │
// │  ┌─────────────────────────────────────────────┐   │
// │  │  Nick                        Avg: 185  HC: 32│   │
// │  │  ┌────────┐ ┌────────┐ ┌────────┐          │   │
// │  │  │  168   │ │  195   │ │  182   │  = 545   │   │
// │  │  │ Game 1 │ │ Game 2 │ │ Game 3 │  Series  │   │
// │  │  └────────┘ └────────┘ └────────┘          │   │
// │  │                          w/HC: 641         │   │
// │  └─────────────────────────────────────────────┘   │
// │                                                     │
// │  ┌─────────────────────────────────────────────┐   │
// │  │  Mike                        Avg: 165  HC: 50│   │
// │  │  ...                                        │   │
// │  └─────────────────────────────────────────────┘   │
// │                                                     │
// │  [Save All Scores]                                 │
// └─────────────────────────────────────────────────────┘
```

Features:
- Number input with validation (0-300)
- Tab between inputs for quick entry
- Auto-calculate series total
- Show current average and handicap
- Show series with handicap applied
- Support for editing any past week via week selector dropdown
- Visual indicator for incomplete entries (missing games)
- Confirmation before overwriting existing scores

### 2. PredictionEntry.tsx (Mini-Game Interface)
Before each week, predict teammates' series totals:

```tsx
// Layout concept:
// ┌─────────────────────────────────────────────────────┐
// │  Week 6 Predictions                                │
// │  Due before bowling starts!        🔒 Locks at 7pm │
// ├─────────────────────────────────────────────────────┤
// │                                                     │
// │  You are: Nick                    [Switch Bowler]  │
// │                                                     │
// │  Predict each teammate's 3-game series:            │
// │                                                     │
// │  ┌─────────────────────────────────────────────┐   │
// │  │  Mike       Avg: 165    Last week: 512      │   │
// │  │  Your prediction: [____510____] pins        │   │
// │  │  💡 Hint: Usually bowls 480-540             │   │
// │  └─────────────────────────────────────────────┘   │
// │                                                     │
// │  ┌─────────────────────────────────────────────┐   │
// │  │  Tom        Avg: 178    Last week: 548      │   │
// │  │  Your prediction: [____555____] pins        │   │
// │  └─────────────────────────────────────────────┘   │
// │                                                     │
// │  ┌─────────────────────────────────────────────┐   │
// │  │  Dave       Avg: 155    Last week: 478      │   │
// │  │  Your prediction: [____465____] pins        │   │
// │  └─────────────────────────────────────────────┘   │
// │                                                     │
// │  [Submit Predictions]                              │
// └─────────────────────────────────────────────────────┘
```

Features:
- Shows helpful context (average, last week's score, typical range)
- Slider OR number input for prediction (0-900 range for series)
- Predictions can be edited until locked
- Lock mechanism (manual toggle or time-based)
- Can't predict your own score (grayed out)
- Visual feedback when prediction submitted

### 3. PredictionResults.tsx (Post-Week Reveal)
After scores are entered, show prediction accuracy:

```tsx
// Layout concept:
// ┌─────────────────────────────────────────────────────┐
// │  Week 5 Prediction Results                         │
// ├─────────────────────────────────────────────────────┤
// │                                                     │
// │  Nick's Predictions:                    +12 pts    │
// │  ┌─────────────────────────────────────────────┐   │
// │  │  Mike:  Predicted 510 → Actual 522  │ 12 off│ 5pts│
// │  │  Tom:   Predicted 555 → Actual 561  │  6 off│ 7pts│
// │  │  Dave:  Predicted 465 → Actual 465  │ EXACT!│10pts│ 🎯
// │  └─────────────────────────────────────────────┘   │
// │                                                     │
// │  Mike's Predictions:                    +8 pts     │
// │  ...                                               │
// │                                                     │
// │  ─────────────────────────────────────────────     │
// │  This Week's Best Predictor: Dave (15 pts) 🏆     │
// └─────────────────────────────────────────────────────┘
```

### 4. Chart Components

#### AverageOverTime.tsx
```tsx
// Recharts line chart showing:
// - X-axis: Week number
// - Y-axis: Average (calculated cumulatively up to that week)
// - One line per bowler (color-coded)
// - Tooltip showing exact values
// - Optional: show league average as dotted line
```

#### GameByGameChart.tsx
```tsx
// Scatter or line chart showing:
// - Every individual game score
// - X-axis: Game number (1, 2, 3, 4, 5, ..., 15 for 5 weeks)
// - Y-axis: Score (0-300)
// - Filter by bowler or show all
// - Trend line overlay option
```

#### ScoreDistribution.tsx
```tsx
// Histogram showing:
// - Buckets: <120, 120-139, 140-159, ..., 280-300
// - Count of games in each bucket
// - Per bowler or aggregate
// - Highlights personal best zone
```

#### HandicapTrend.tsx
```tsx
// Line chart showing:
// - How handicap has changed as average evolves
// - Useful for seeing improvement (handicap decreasing = getting better)
```

### 5. Dashboard.tsx (Home Page)
Quick overview when opening the app:

```tsx
// Layout concept:
// ┌─────────────────────────────────────────────────────┐
// │  🎳 Team Strikeforce                               │
// │  Week 5 of 32                                      │
// ├─────────────────────────────────────────────────────┤
// │                                                     │
// │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
// │  │ Your Avg    │ │ Your HC     │ │ High Game   │   │
// │  │    185      │ │     32      │ │    234      │   │
// │  └─────────────┘ └─────────────┘ └─────────────┘   │
// │                                                     │
// │  This Week:                                        │
// │  ┌─────────────────────────────────────────────┐   │
// │  │  ⚠️ Predictions due!     [Make Predictions] │   │
// │  │  📝 Scores not entered   [Enter Scores]     │   │
// │  └─────────────────────────────────────────────┘   │
// │                                                     │
// │  Team Standings (by Average):                      │
// │  1. Nick    185.4  ████████████████░░░░ 🔥        │
// │  2. Tom     178.2  ██████████████░░░░░░           │
// │  3. Mike    165.8  ████████████░░░░░░░░           │
// │  4. Dave    155.3  ██████████░░░░░░░░░░           │
// │                                                     │
// │  Prediction Game Leader: Dave (42 pts) 🏆         │
// │                                                     │
// │  [View All Stats]  [Score History]  [Predictions] │
// └─────────────────────────────────────────────────────┘
```

## UI/UX Requirements

### Design System
- Primary color: Bowling alley aesthetic - deep purple (#4C1D95) or electric blue (#2563EB)
- Accent: Strike gold (#F59E0B) for achievements
- Clean white/gray backgrounds
- Dark mode support
- Use shadcn/ui components throughout

### Mobile-First Considerations
- Bottom navigation bar
- Large number inputs (easy to tap on phone at bowling alley)
- Swipe between bowlers on score entry
- Pull-to-refresh for data sync
- Works offline (queue updates)

### Data Entry Optimization
- Number pad style input for scores (large buttons 0-9)
- Quick presets: "Strike game" (shows common high scores)
- Tab order flows naturally through all 3 games
- Visual validation (red border if >300 or <0)

## TypeScript Types

```typescript
// types/index.ts

export interface Bowler {
  id: string;
  name: string;
  nickname?: string;
  pinCode?: string;
  avatarColor: string;
  createdAt: string;
}

export interface Week {
  id: string;
  weekNumber: number;
  bowlingDate?: string;
  isComplete: boolean;
  predictionsLocked: boolean;
  createdAt: string;
}

export interface Game {
  id: string;
  weekId: string;
  bowlerId: string;
  gameNumber: 1 | 2 | 3;
  score: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Prediction {
  id: string;
  weekId: string;
  predictorId: string;
  targetId: string;
  predictedSeries: number;
  createdAt: string;
  updatedAt: string;
}

export interface BowlerStats {
  bowlerId: string;
  totalGames: number;
  average: number;
  handicap: number;
  highGame: number;
  lowGame: number;
  totalPins: number;
}

export interface WeeklySeries {
  weekId: string;
  bowlerId: string;
  weekNumber: number;
  seriesTotal: number;
  gameScores: number[];
  gamesEntered: number;
}

export interface PredictionResult {
  predictorId: string;
  weekId: string;
  weekNumber: number;
  targetId: string;
  predictedSeries: number;
  actualSeries: number | null;
  difference: number | null;
  points: number | null;
}
```

## Environment Setup

```env
# .env.local
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Seed Data for Testing

```sql
-- Insert the 4 bowlers
INSERT INTO bowlers (name, nickname, pin_code, avatar_color) VALUES
  ('Nick', 'Kingpin', '1234', '#3B82F6'),
  ('Mike', 'Spare Me', '2345', '#10B981'),
  ('Tom', 'Gutter Tom', '3456', '#F59E0B'),
  ('Dave', 'Big D', '4567', '#EF4444');

-- Insert weeks 1-5 (backfill scenario)
INSERT INTO weeks (week_number, bowling_date, is_complete, predictions_locked) VALUES
  (1, '2024-10-18', true, true),
  (2, '2024-10-25', true, true),
  (3, '2024-11-01', true, true),
  (4, '2024-11-08', true, true),
  (5, '2024-11-15', false, false);

-- Sample scores for week 1 (you'd repeat pattern for other weeks)
-- Get IDs first, then insert games
DO $$
DECLARE
  nick_id UUID;
  mike_id UUID;
  tom_id UUID;
  dave_id UUID;
  week1_id UUID;
BEGIN
  SELECT id INTO nick_id FROM bowlers WHERE name = 'Nick';
  SELECT id INTO mike_id FROM bowlers WHERE name = 'Mike';
  SELECT id INTO tom_id FROM bowlers WHERE name = 'Tom';
  SELECT id INTO dave_id FROM bowlers WHERE name = 'Dave';
  SELECT id INTO week1_id FROM weeks WHERE week_number = 1;
  
  -- Nick's games week 1
  INSERT INTO games (week_id, bowler_id, game_number, score) VALUES
    (week1_id, nick_id, 1, 178),
    (week1_id, nick_id, 2, 195),
    (week1_id, nick_id, 3, 182);
  
  -- Mike's games week 1
  INSERT INTO games (week_id, bowler_id, game_number, score) VALUES
    (week1_id, mike_id, 1, 156),
    (week1_id, mike_id, 2, 172),
    (week1_id, mike_id, 3, 168);
  
  -- Tom's games week 1
  INSERT INTO games (week_id, bowler_id, game_number, score) VALUES
    (week1_id, tom_id, 1, 185),
    (week1_id, tom_id, 2, 167),
    (week1_id, tom_id, 3, 191);
  
  -- Dave's games week 1
  INSERT INTO games (week_id, bowler_id, game_number, score) VALUES
    (week1_id, dave_id, 1, 145),
    (week1_id, dave_id, 2, 162),
    (week1_id, dave_id, 3, 151);
END $$;
```

## Key Features Checklist

### Core Functionality
- [ ] Bowler management (pre-seeded with 4 teammates)
- [ ] Week creation and management
- [ ] Score entry for 3 games per bowler per week
- [ ] Edit historical weeks (backfill support)
- [ ] Running average calculation
- [ ] Handicap calculation (90% of 220)
- [ ] Series totals (scratch and with handicap)

### Prediction Mini-Game
- [ ] Enter predictions for teammates before each week
- [ ] Lock predictions mechanism (manual or time-based)
- [ ] Calculate prediction accuracy after scores entered
- [ ] Points system for prediction accuracy
- [ ] Prediction game leaderboard
- [ ] Historical prediction accuracy stats

### Visualizations (Charts)
- [ ] Average over time (line chart, all bowlers)
- [ ] Individual game scores over time
- [ ] Score distribution histogram
- [ ] Handicap trend over time
- [ ] Team comparison chart
- [ ] Prediction accuracy over time

### Statistics
- [ ] Personal bests (high game, high series)
- [ ] Current average and handicap
- [ ] Games bowled count
- [ ] Strike/spare tracking (optional enhancement)
- [ ] Week-over-week improvement

### UX Polish
- [ ] Mobile-responsive design
- [ ] Quick bowler switching
- [ ] Real-time sync (Supabase subscriptions)
- [ ] Offline support with sync queue
- [ ] Loading states and skeletons
- [ ] Toast notifications for saves
- [ ] Confirmation dialogs for edits

## Deployment Configuration

### vercel.json
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

## Dependencies

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.x",
    "@tanstack/react-query": "^5.x",
    "react": "^18.x",
    "react-dom": "^18.x",
    "react-router-dom": "^6.x",
    "recharts": "^2.x",
    "class-variance-authority": "^0.7.x",
    "clsx": "^2.x",
    "tailwind-merge": "^2.x",
    "lucide-react": "^0.x",
    "date-fns": "^3.x",
    "framer-motion": "^11.x",
    "sonner": "^1.x"
  },
  "devDependencies": {
    "@types/react": "^18.x",
    "@types/react-dom": "^18.x",
    "typescript": "^5.x",
    "vite": "^5.x",
    "@vitejs/plugin-react": "^4.x",
    "tailwindcss": "^3.x",
    "autoprefixer": "^10.x",
    "postcss": "^8.x"
  }
}
```

## Critical Implementation Notes

1. **Backfill Support**: The week selector must allow choosing ANY week, not just current. Users need to enter weeks 1-4 historical data.

2. **Average Calculation**: Running average includes ALL games up to and including selected week. Don't recalculate with future data when viewing past weeks.

3. **Handicap Timing**: Handicap shown should be based on average BEFORE that week (what they walked in with), not after.

4. **Prediction Locking**: Once predictions are locked OR any scores are entered for a week, predictions cannot be modified.

5. **Partial Data Handling**: Support entering only some games (e.g., if someone left early). Don't require all 3 games to save.

6. **Real-time Updates**: Use Supabase real-time subscriptions so all 4 teammates see score updates live.

7. **Number Validation**: Bowling scores are 0-300 only. Series predictions are 0-900.

8. **Tie Handling in Predictions**: If two people have same prediction points, use average difference as tiebreaker (lower is better).

---

**IMPORTANT**: Generate ALL files completely. Do not use placeholders or "// implement later" comments. Every component should be fully functional. The app should work end-to-end after Supabase setup. Focus especially on the score entry UX - it needs to be fast and easy to use at the bowling alley on a phone.
