import { useBowlers } from '@/hooks/useBowlers';
import { usePredictionResults } from '@/hooks/usePredictions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { Target } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PredictionResultsProps {
  weekId: string;
  weekNumber: number;
}

export function PredictionResults({ weekId }: PredictionResultsProps) {
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

  // Group by predictor
  const byPredictor = results.reduce((acc, result) => {
    if (!acc[result.predictorId]) {
      acc[result.predictorId] = [];
    }
    acc[result.predictorId].push(result);
    return acc;
  }, {} as Record<string, typeof results>);

  return (
    <div className="space-y-6">
      {Object.entries(byPredictor).map(([predictorId, predictorResults]) => {
        const predictor = bowlers?.find(b => b.id === predictorId);
        if (!predictor) return null;

        const totalPoints = predictorResults.reduce((sum, r) => sum + (r.points || 0), 0);
        const hasActuals = predictorResults.some(r => r.actualSeries !== null);

        return (
          <Card key={predictorId}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: predictor.avatarColor }}
                  >
                    {predictor.name.charAt(0)}
                  </div>
                  <CardTitle className="text-lg">{predictor.name}'s Predictions</CardTitle>
                </div>
                {hasActuals && (
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Points</p>
                    <p className="text-2xl font-bold text-primary">+{totalPoints}</p>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {predictorResults.map(result => {
                  const target = bowlers?.find(b => b.id === result.targetId);
                  if (!target) return null;

                  const hasActual = result.actualSeries !== null;
                  const isExact = result.difference === 0;

                  return (
                    <div
                      key={result.targetId}
                      className={cn(
                        'flex items-center justify-between p-3 rounded-md border',
                        isExact && 'border-amber-500 bg-amber-50 dark:bg-amber-950/20'
                      )}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div
                          className="h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                          style={{ backgroundColor: target.avatarColor }}
                        >
                          {target.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{target.name}</p>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">
                              Predicted: <span className="font-semibold">{result.predictedSeries}</span>
                            </span>
                            {hasActual && (
                              <>
                                <span className="text-muted-foreground">→</span>
                                <span className="text-muted-foreground">
                                  Actual: <span className="font-semibold">{result.actualSeries}</span>
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {hasActual && result.difference !== null && (
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <div>
                              <p className={cn(
                                'text-sm font-medium',
                                isExact ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'
                              )}>
                                {isExact ? 'EXACT!' : `${result.difference} off`}
                              </p>
                              <p className="text-lg font-bold text-primary">
                                {result.points} pts
                              </p>
                            </div>
                            {isExact && <span className="text-2xl">🎯</span>}
                          </div>
                        </div>
                      )}

                      {!hasActual && (
                        <div className="text-sm text-muted-foreground">
                          Waiting for scores...
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Best predictor for this week */}
      {results.some(r => r.actualSeries !== null) && (
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800">
          <CardContent className="p-6">
            {(() => {
              const predictorScores = Object.entries(byPredictor).map(([predictorId, preds]) => ({
                predictorId,
                totalPoints: preds.reduce((sum, r) => sum + (r.points || 0), 0),
              })).sort((a, b) => b.totalPoints - a.totalPoints);

              const winner = predictorScores[0];
              const winnerBowler = bowlers?.find(b => b.id === winner?.predictorId);

              return winnerBowler ? (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">This Week's Best Predictor</p>
                  <div className="flex items-center justify-center gap-3">
                    <div
                      className="h-12 w-12 rounded-full flex items-center justify-center text-white text-xl font-bold"
                      style={{ backgroundColor: winnerBowler.avatarColor }}
                    >
                      {winnerBowler.name.charAt(0)}
                    </div>
                    <div className="text-left">
                      <p className="text-xl font-bold">{winnerBowler.name}</p>
                      <p className="text-lg text-amber-600 dark:text-amber-400">
                        {winner.totalPoints} points 🏆
                      </p>
                    </div>
                  </div>
                </div>
              ) : null;
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
