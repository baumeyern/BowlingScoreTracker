import { useBowlers } from '@/hooks/useBowlers';
import { usePredictionResults } from '@/hooks/usePredictions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { Trophy } from 'lucide-react';
import { calculatePredictionLeaderboard } from '@/lib/predictions';

export function PredictionLeaderboard() {
  const { data: bowlers } = useBowlers();
  const { data: allResults, isLoading } = usePredictionResults();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!allResults || allResults.length === 0) {
    return (
      <EmptyState
        icon={Trophy}
        title="No prediction results yet"
        description="Leaderboard will appear after predictions are made and scores are entered"
      />
    );
  }

  const leaderboard = calculatePredictionLeaderboard(allResults);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" />
          Prediction Game Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {leaderboard.map((entry, index) => {
            const bowler = bowlers?.find(b => b.id === entry.bowlerId);
            if (!bowler) return null;

            const isFirst = index === 0;
            const isTop3 = index < 3;

            return (
              <div
                key={entry.bowlerId}
                className={cn(
                  'flex items-center justify-between p-4 rounded-lg border',
                  isFirst && 'border-amber-400 bg-amber-50 dark:bg-amber-950/20',
                  isTop3 && !isFirst && 'bg-muted/50'
                )}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="text-2xl font-bold text-muted-foreground w-8">
                    {index === 0 && '🥇'}
                    {index === 1 && '🥈'}
                    {index === 2 && '🥉'}
                    {index > 2 && `${index + 1}.`}
                  </div>
                  <div
                    className="h-12 w-12 rounded-full flex items-center justify-center text-white text-lg font-bold"
                    style={{ backgroundColor: bowler.avatarColor }}
                  >
                    {bowler.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-lg">{bowler.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {entry.predictionsCount} predictions
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">{entry.totalPoints}</p>
                  <p className="text-xs text-muted-foreground">points</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Avg diff: {entry.avgDifference.toFixed(1)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
