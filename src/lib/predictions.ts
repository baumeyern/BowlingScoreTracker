import type { PredictionResult, PredictionLeaderboardEntry } from '@/types';

export function calculateWeeklyPredictionResults(
  predictions: { predictorId: string; targetId: string; gameNumber: 1 | 2 | 3; predicted: number }[],
  actuals: { bowlerId: string; gameNumber: 1 | 2 | 3; score: number }[]
): Omit<PredictionResult, 'weekId' | 'weekNumber'>[] {
  return predictions.map(pred => {
    const actual = actuals.find(
      a => a.bowlerId === pred.targetId && a.gameNumber === pred.gameNumber
    )?.score ?? null;
    const difference = actual !== null ? Math.abs(pred.predicted - actual) : null;
    return {
      predictorId: pred.predictorId,
      targetId: pred.targetId,
      gameNumber: pred.gameNumber,
      predictedScore: pred.predicted,
      actualScore: actual,
      difference,
      points: difference
    };
  });
}

export function calculatePredictionLeaderboard(
  allResults: PredictionResult[]
): PredictionLeaderboardEntry[] {
  const grouped = allResults.reduce((acc, result) => {
    if (result.difference === null) return acc;
    
    if (!acc[result.predictorId]) {
      acc[result.predictorId] = { totalDiff: 0, count: 0 };
    }
    acc[result.predictorId].totalDiff += result.difference;
    acc[result.predictorId].count++;
    return acc;
  }, {} as Record<string, { totalDiff: number; count: number }>);

  return Object.entries(grouped)
    .map(([bowlerId, data]) => ({
      bowlerId,
      totalDifference: data.totalDiff,
      avgDifference: data.count > 0 ? data.totalDiff / data.count : 0,
      predictionsCount: data.count
    }))
    .sort((a, b) => a.totalDifference - b.totalDifference || a.avgDifference - b.avgDifference);
}
