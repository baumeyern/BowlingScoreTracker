import type { PredictionResult, PredictionLeaderboardEntry } from '@/types';

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
): Omit<PredictionResult, 'weekId' | 'weekNumber'>[] {
  return predictions.map(pred => {
    const actual = actuals.find(a => a.bowlerId === pred.targetId)?.series ?? null;
    const difference = actual !== null ? Math.abs(pred.predicted - actual) : null;
    return {
      predictorId: pred.predictorId,
      targetId: pred.targetId,
      predictedSeries: pred.predicted,
      actualSeries: actual,
      difference,
      points: difference !== null ? calculatePredictionPoints(difference) : null
    };
  });
}

// Leaderboard for prediction game
export function calculatePredictionLeaderboard(
  allResults: PredictionResult[]
): PredictionLeaderboardEntry[] {
  const grouped = allResults.reduce((acc, result) => {
    if (result.points === null) return acc; // Skip if no actual score yet
    
    if (!acc[result.predictorId]) {
      acc[result.predictorId] = { points: 0, differences: [], count: 0 };
    }
    acc[result.predictorId].points += result.points;
    if (result.difference !== null) {
      acc[result.predictorId].differences.push(result.difference);
    }
    acc[result.predictorId].count++;
    return acc;
  }, {} as Record<string, { points: number; differences: number[]; count: number }>);

  return Object.entries(grouped)
    .map(([bowlerId, data]) => ({
      bowlerId,
      totalPoints: data.points,
      avgDifference: data.differences.length > 0 
        ? data.differences.reduce((a, b) => a + b, 0) / data.differences.length 
        : 0,
      predictionsCount: data.count
    }))
    .sort((a, b) => b.totalPoints - a.totalPoints || a.avgDifference - b.avgDifference);
}
