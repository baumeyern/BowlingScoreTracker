import { useBowlers } from '@/hooks/useBowlers';
import { usePredictionResults } from '@/hooks/usePredictions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { Target, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PredictionResultsNewProps {
  weekId: string;
}

export function PredictionResultsNew({ weekId }: PredictionResultsNewProps) {
  const { data: bowlers } = useBowlers();
  const { data: results, isLoading } = usePredictionResults(weekId);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!results || results.length === 0) {
    return (
      <EmptyState
        icon={Target}
        title="No predictions yet"
        description="Predictions will appear here after they're submitted"
      />
    );
  }

  const hasActuals = results.some(r => r.actualScore !== null);

  // Group by target bowler (the person being predicted)
  const byTarget = results.reduce((acc, result) => {
    if (!acc[result.targetId]) {
      acc[result.targetId] = [];
    }
    acc[result.targetId].push(result);
    return acc;
  }, {} as Record<string, typeof results>);

  // Compute total difference per predictor for the summary table (lower = better)
  const predictorDiffMap = results.reduce((acc, result) => {
    if (result.difference === null) return acc;
    if (!acc[result.predictorId]) {
      acc[result.predictorId] = { totalDiff: 0, count: 0 };
    }
    acc[result.predictorId].totalDiff += result.difference;
    acc[result.predictorId].count++;
    return acc;
  }, {} as Record<string, { totalDiff: number; count: number }>);

  const predictorScores = Object.entries(predictorDiffMap)
    .map(([predictorId, { totalDiff, count }]) => ({
      predictorId,
      totalDifference: totalDiff,
      avgDifference: count > 0 ? totalDiff / count : 0,
    }))
    .sort((a, b) => a.totalDifference - b.totalDifference);

  return (
    <div className="space-y-6">
      {Object.entries(byTarget).map(([targetId, targetResults]) => {
        const target = bowlers?.find(b => b.id === targetId);
        if (!target) return null;

        // Group this target's results by predictor
        const byPredictor = targetResults.reduce((acc, result) => {
          if (!acc[result.predictorId]) {
            acc[result.predictorId] = [];
          }
          acc[result.predictorId].push(result);
          return acc;
        }, {} as Record<string, typeof results>);

        // Get actual scores for display in the header
        const actuals = [1, 2, 3].map(g => {
          const r = targetResults.find(r => r.actualScore !== null && r.gameNumber === g);
          return r?.actualScore ?? null;
        });
        const hasTargetActuals = actuals.some(a => a !== null);

        return (
          <Card key={targetId}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: target.avatarColor }}
                  >
                    {target.name.charAt(0)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">Predictions for {target.name}</CardTitle>
                    {hasTargetActuals && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Actual: {actuals.map((a, i) => (
                          <span key={i}>
                            {i > 0 && ', '}
                            <span className="font-semibold">{a ?? '-'}</span>
                          </span>
                        ))}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(byPredictor).map(([predictorId, predResults]) => {
                  const predictor = bowlers?.find(b => b.id === predictorId);
                  if (!predictor) return null;

                  const sortedResults = [...predResults].sort((a, b) => a.gameNumber - b.gameNumber);
                  const predictorTotalDiff = sortedResults.reduce((sum, r) => sum + (r.difference || 0), 0);
                  const hasPredActuals = sortedResults.some(r => r.actualScore !== null);

                  return (
                    <div key={predictorId} className="border rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-3">
                        <div
                          className="h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                          style={{ backgroundColor: predictor.avatarColor }}
                        >
                          {predictor.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{predictor.name}</p>
                        </div>
                        {hasPredActuals && (
                          <div className="text-right">
                            <p className="text-sm font-bold text-primary">{predictorTotalDiff} pins off</p>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        {sortedResults.map(result => {
                          const hasActual = result.actualScore !== null;
                          const isExact = result.difference === 0;

                          return (
                            <div
                              key={result.gameNumber}
                              className={cn(
                                'p-2 rounded border text-center',
                                isExact && 'border-amber-500 bg-amber-50 dark:bg-amber-950/20'
                              )}
                            >
                              <p className="text-xs text-muted-foreground mb-1">Game {result.gameNumber}</p>
                              <div className="text-sm">
                                <p className="font-semibold">Pred: {result.predictedScore}</p>
                                {hasActual && (
                                  <>
                                    <p className="text-muted-foreground">Act: {result.actualScore}</p>
                                    <p className={cn(
                                      'text-xs font-medium mt-1',
                                      isExact ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'
                                    )}>
                                      {isExact ? '🎯 Exact!' : `${result.difference} pins off`}
                                    </p>
                                  </>
                                )}
                                {!hasActual && (
                                  <p className="text-xs text-muted-foreground mt-1">Waiting...</p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Prediction accuracy summary table */}
      {hasActuals && predictorScores.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Trophy className="h-5 w-5" />
              Prediction Accuracy This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {predictorScores.map((entry, index) => {
                const predictor = bowlers?.find(b => b.id === entry.predictorId);
                if (!predictor) return null;

                const isFirst = index === 0;

                return (
                  <div
                    key={entry.predictorId}
                    className={cn(
                      'flex items-center justify-between p-3 rounded-lg border',
                      isFirst && 'border-amber-400 bg-amber-50 dark:bg-amber-950/20'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-lg font-bold text-muted-foreground w-8 text-center">
                        {index === 0 && '🥇'}
                        {index === 1 && '🥈'}
                        {index === 2 && '🥉'}
                        {index > 2 && `${index + 1}.`}
                      </div>
                      <div
                        className="h-9 w-9 rounded-full flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: predictor.avatarColor }}
                      >
                        {predictor.name.charAt(0)}
                      </div>
                      <p className="font-semibold">{predictor.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-primary">{entry.totalDifference} pins</p>
                      <p className="text-xs text-muted-foreground">avg {entry.avgDifference.toFixed(1)} per game</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
