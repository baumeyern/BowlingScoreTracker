import { useBowlers } from '@/hooks/useBowlers';
import { usePredictionResults } from '@/hooks/usePredictions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { Target } from 'lucide-react';
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
        const hasActuals = predictorResults.some(r => r.actualScore !== null);

        // Group by target for display
        const byTarget = predictorResults.reduce((acc, result) => {
          if (!acc[result.targetId]) {
            acc[result.targetId] = [];
          }
          acc[result.targetId].push(result);
          return acc;
        }, {} as Record<string, typeof results>);

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
                    <p className="text-sm text-muted-foreground">Total Points</p>
                    <p className="text-2xl font-bold text-primary">+{totalPoints}</p>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(byTarget).map(([targetId, targetResults]) => {
                  const target = bowlers?.find(b => b.id === targetId);
                  if (!target) return null;

                  // Sort by game number
                  const sortedResults = [...targetResults].sort((a, b) => a.gameNumber - b.gameNumber);
                  const gamePoints = sortedResults.reduce((sum, r) => sum + (r.points || 0), 0);

                  return (
                    <div key={targetId} className="border rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-3">
                        <div
                          className="h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                          style={{ backgroundColor: target.avatarColor }}
                        >
                          {target.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{target.name}</p>
                        </div>
                        {hasActuals && (
                          <div className="text-right">
                            <p className="text-sm font-bold text-primary">{gamePoints} pts</p>
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
                                      {isExact ? '🎯 Exact!' : `${result.difference} off`}
                                    </p>
                                    <p className="text-sm font-bold text-primary">{result.points} pts</p>
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

      {/* Best predictor for this week */}
      {results.some(r => r.actualScore !== null) && (
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
