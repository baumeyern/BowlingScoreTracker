import { useBowlers } from '@/hooks/useBowlers';
import { usePredictionResults } from '@/hooks/usePredictions';
import { useSelectedLeague } from '@/contexts/LeagueContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { BowlerAvatar } from '@/components/common/BowlerAvatar';
import { Trophy } from 'lucide-react';
import { calculatePredictionLeaderboard } from '@/lib/predictions';
import { cn } from '@/lib/utils';

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
      <CardHeader className="px-3 sm:px-6 pt-4 sm:pt-6 pb-3">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
          Prediction Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 sm:px-6 pb-4 sm:pb-6">
        <div className="space-y-2 sm:space-y-3">
          {leaderboard.map((entry, index) => {
            const bowler = bowlers?.find(b => b.id === entry.bowlerId);
            if (!bowler) return null;

            const isFirst = index === 0;
            const isTop3 = index < 3;

            return (
              <div
                key={entry.bowlerId}
                className={cn(
                  'flex items-center justify-between p-2.5 sm:p-4 rounded-xl border border-border/50',
                  isFirst && 'border-amber-500/30 bg-amber-500/10 glow-amber',
                  isTop3 && !isFirst && 'bg-muted/20'
                )}
              >
                <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                  <span className="text-sm sm:text-2xl font-bold text-muted-foreground w-5 sm:w-8 text-center flex-shrink-0">
                    {index === 0 && '🥇'}
                    {index === 1 && '🥈'}
                    {index === 2 && '🥉'}
                    {index > 2 && `${index + 1}.`}
                  </span>
                  <BowlerAvatar bowler={bowler} size="sm" />
                  <div className="min-w-0">
                    <p className="font-semibold text-sm sm:text-lg truncate">{bowler.name}</p>
                    <p className="text-[10px] sm:text-sm text-muted-foreground">
                      {entry.predictionsCount} predictions
                    </p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0 ml-2">
                  <p className="text-lg sm:text-2xl font-bold text-primary tabular-nums">{entry.totalDifference}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground tabular-nums">
                    avg {entry.avgDifference.toFixed(1)}/game
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
