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
