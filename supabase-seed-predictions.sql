-- Seed prediction data based on known avg diff values (weeks 1-8)
-- Evan: 21.0 avg diff
-- Rory: 22.6 avg diff
-- Jacob: 22.7 avg diff
-- Nick: 26.1 avg diff
--
-- Strategy: For each predictor, create one prediction per target bowler per game
-- across weeks 1-8. Set predicted_score = actual_score - offset, distributing
-- the offset evenly to match the target avg difference.
-- The slot count is computed dynamically from actual game data.
-- Does NOT touch predictions for weeks outside 1-8.

-- Insert seeded predictions for weeks 1-8 only
WITH prediction_slots AS (
  SELECT
    p.id AS predictor_id,
    p.name AS predictor_name,
    t.id AS target_id,
    g.week_id,
    g.game_number,
    g.score AS actual_score,
    ROW_NUMBER() OVER (
      PARTITION BY p.id
      ORDER BY g.week_id, t.id, g.game_number
    ) AS slot_num
  FROM bowlers p
  CROSS JOIN bowlers t
  JOIN games g ON g.bowler_id = t.id AND g.score IS NOT NULL
  JOIN weeks w ON w.id = g.week_id AND w.week_number BETWEEN 1 AND 8
  WHERE p.id != t.id
),
-- Count how many slots each predictor actually has
slot_counts AS (
  SELECT predictor_id, COUNT(*) AS num_slots
  FROM prediction_slots
  GROUP BY predictor_id
),
-- Avg diffs from screenshot; total_diff = round(avg_diff * num_slots)
avg_diffs(predictor_name, avg_diff) AS (
  VALUES
    ('Evan'::text,  21.0),
    ('Rory'::text,  22.6),
    ('Jacob'::text, 22.7),
    ('Nick'::text,  26.1)
),
with_offsets AS (
  SELECT
    ps.predictor_id,
    ps.target_id,
    ps.week_id,
    ps.game_number,
    ps.actual_score,
    ps.slot_num,
    sc.num_slots,
    ROUND(ad.avg_diff * sc.num_slots)::int AS total_diff,
    ROUND(ad.avg_diff * sc.num_slots)::int / sc.num_slots::int AS base_diff,
    ROUND(ad.avg_diff * sc.num_slots)::int % sc.num_slots::int AS remainder
  FROM prediction_slots ps
  JOIN avg_diffs ad ON ps.predictor_name = ad.predictor_name
  JOIN slot_counts sc ON sc.predictor_id = ps.predictor_id
)
INSERT INTO predictions (week_id, predictor_id, target_id, game_number, predicted_score)
SELECT
  week_id,
  predictor_id,
  target_id,
  game_number,
  GREATEST(0, LEAST(300,
    actual_score - (
      CASE
        WHEN slot_num <= remainder THEN base_diff + 1
        ELSE base_diff
      END
    )
  ))
FROM with_offsets
ON CONFLICT (week_id, predictor_id, target_id, game_number) DO NOTHING;

-- Verify the results
SELECT
  b.name,
  COUNT(*) AS prediction_count,
  SUM(ABS(p.predicted_score - g.score)) AS total_diff,
  ROUND(SUM(ABS(p.predicted_score - g.score))::numeric / COUNT(*), 1) AS avg_diff
FROM predictions p
JOIN bowlers b ON b.id = p.predictor_id
JOIN games g ON g.week_id = p.week_id
  AND g.bowler_id = p.target_id
  AND g.game_number = p.game_number
JOIN weeks w ON w.id = p.week_id AND w.week_number BETWEEN 1 AND 8
GROUP BY b.name
ORDER BY avg_diff;
