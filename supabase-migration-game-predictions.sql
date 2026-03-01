-- Migration: Change predictions from series to individual games
-- Run this in your Supabase SQL Editor

-- Step 1: Drop existing prediction-related objects
DROP VIEW IF EXISTS prediction_accuracy;
DROP TABLE IF EXISTS predictions;

-- Step 2: Create new predictions table for individual game predictions
CREATE TABLE predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  week_id UUID REFERENCES weeks(id) ON DELETE CASCADE,
  predictor_id UUID REFERENCES bowlers(id) ON DELETE CASCADE,
  target_id UUID REFERENCES bowlers(id) ON DELETE CASCADE,
  game_number INTEGER NOT NULL CHECK (game_number >= 1 AND game_number <= 3),
  predicted_score INTEGER NOT NULL CHECK (predicted_score >= 0 AND predicted_score <= 300),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(week_id, predictor_id, target_id, game_number),
  CHECK (predictor_id != target_id)
);

-- Step 3: Create trigger for updated_at
CREATE TRIGGER update_predictions_updated_at BEFORE UPDATE ON predictions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 4: Create indexes
CREATE INDEX idx_predictions_week ON predictions(week_id);
CREATE INDEX idx_predictions_predictor ON predictions(predictor_id);
CREATE INDEX idx_predictions_target ON predictions(target_id);
CREATE INDEX idx_predictions_week_predictor ON predictions(week_id, predictor_id);

-- Step 5: Create updated prediction accuracy view
-- Scoring is pure pin difference (lower is better)
CREATE OR REPLACE VIEW prediction_accuracy AS
SELECT 
  p.predictor_id,
  p.week_id,
  w.week_number,
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

-- Step 6: Enable RLS
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON predictions FOR ALL USING (true) WITH CHECK (true);

-- Migration complete!
-- Your predictions table now supports individual game predictions instead of series totals.
