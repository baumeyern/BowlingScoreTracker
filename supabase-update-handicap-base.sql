-- Update handicap calculation to use 215 instead of 220
-- Run this in your Supabase SQL Editor

-- Drop and recreate the bowler_averages view with new handicap formula
DROP VIEW IF EXISTS bowler_averages;

CREATE OR REPLACE VIEW bowler_averages AS
SELECT 
  bowler_id,
  COUNT(*) AS total_games,
  ROUND(AVG(score)::numeric, 2) AS average,
  ROUND((215 - AVG(score)) * 0.9)::integer AS handicap,
  MAX(score) AS high_game,
  MIN(score) AS low_game,
  SUM(score) AS total_pins
FROM games
WHERE score IS NOT NULL
GROUP BY bowler_id;

-- Verify the change
SELECT bowler_id, average, handicap FROM bowler_averages;
