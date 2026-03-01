-- Migration: Add league support
-- Run this in your Supabase SQL Editor
-- This is NON-DESTRUCTIVE: no tables are dropped, only altered/created.

-- Step 1: Create leagues table
CREATE TABLE IF NOT EXISTS leagues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE leagues ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all leagues" ON leagues;
CREATE POLICY "Allow all leagues" ON leagues FOR ALL USING (true) WITH CHECK (true);

-- Step 2: Add league_id to weeks (nullable so existing data is preserved)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'weeks' AND column_name = 'league_id'
  ) THEN
    ALTER TABLE weeks ADD COLUMN league_id UUID REFERENCES leagues(id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_weeks_league ON weeks(league_id);

-- Step 3: Recreate bowler_weekly_series view to include league_id
-- DROP is safe: views are just saved queries, no data is lost.
DROP VIEW IF EXISTS bowler_weekly_series;
CREATE VIEW bowler_weekly_series AS
SELECT
  g.bowler_id,
  g.week_id,
  w.week_number,
  w.league_id,
  SUM(g.score) AS series_total,
  ARRAY_AGG(g.score ORDER BY g.game_number) AS game_scores,
  COUNT(*)::integer AS games_entered
FROM games g
JOIN weeks w ON g.week_id = w.id
WHERE g.score IS NOT NULL
GROUP BY g.bowler_id, g.week_id, w.week_number, w.league_id;

-- Step 4: Recreate prediction_accuracy view to include league_id
DROP VIEW IF EXISTS prediction_accuracy;
CREATE VIEW prediction_accuracy AS
SELECT
  p.predictor_id,
  p.week_id,
  w.week_number,
  w.league_id,
  p.target_id,
  p.game_number,
  p.predicted_score,
  g.score AS actual_score,
  ABS(p.predicted_score - g.score) AS difference,
  ABS(p.predicted_score - g.score) AS points
FROM predictions p
JOIN weeks w ON p.week_id = w.id
LEFT JOIN games g ON p.week_id = g.week_id
  AND p.target_id = g.bowler_id
  AND p.game_number = g.game_number;

-- Step 5: Create league-scoped bowler averages view
CREATE OR REPLACE VIEW league_bowler_averages AS
SELECT
  w.league_id,
  g.bowler_id,
  COUNT(*) AS total_games,
  ROUND(AVG(g.score)::numeric, 2) AS average,
  ROUND((215 - AVG(g.score)) * 0.9)::integer AS handicap,
  MAX(g.score) AS high_game,
  MIN(g.score) AS low_game,
  SUM(g.score) AS total_pins
FROM games g
JOIN weeks w ON g.week_id = w.id
WHERE g.score IS NOT NULL AND w.league_id IS NOT NULL
GROUP BY w.league_id, g.bowler_id;

-- Migration complete!
-- Existing bowler_averages view is untouched and serves as the all-time/overall stats.
-- league_bowler_averages provides per-league stats.
