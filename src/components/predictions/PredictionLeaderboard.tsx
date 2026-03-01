import { useBowlers } from '@/hooks/useBowlers';
import { usePredictionResults } from '@/hooks/usePredictions';
import { useSelectedLeague } from '@/contexts/LeagueContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { BowlerAvatar } from '@/components/common/BowlerAvatar';
import { Trophy } from 'lucide-react';
import { calculatePredictionLeaderboard } from '@/lib/predictions';

export function PredictionLeaderboard() {
  const { data: bowlers } = useBowlers();
  const { data: allResults, isLoading } = usePredictionResults();
  const { selectedLeagueId } = useSelectedLeague();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const filteredResults = selectedLeagueId
    ? allResults?.filter(r => r.leagueId === selectedLeagueId)
    : allResults;

  if (!filteredResults || filteredResults.length === 0) {
    return (
      <EmptyState
        icon={Trophy}
        title="No prediction results yet"
        description="Leaderboard will appear after predictions are made and scores are entered"
      />
    );
  }

  const leaderboard = calculatePredictionLeaderboard(filteredResults);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" />
          Prediction Accuracy Leaderboard
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
                  <BowlerAvatar bowler={bowler} size="lg" />
                  <div>
                    <p className="font-semibold text-lg">{bowler.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {entry.predictionsCount} predictions
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">{entry.totalDifference}</p>
                  <p className="text-xs text-muted-foreground">total pins off</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Avg: {entry.avgDifference.toFixed(1)} per game
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
