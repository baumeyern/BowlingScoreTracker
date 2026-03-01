import { PredictionLeaderboard } from '@/components/predictions/PredictionLeaderboard';
import { usePredictionResults } from '@/hooks/usePredictions';
import { useBowlers } from '@/hooks/useBowlers';
import { useSelectedLeague } from '@/contexts/LeagueContext';
import { useLeagues } from '@/hooks/useLeagues';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { BowlerAvatar } from '@/components/common/BowlerAvatar';

export function Leaderboard() {
  const { data: results, isLoading: resultsLoading } = usePredictionResults();
  const { data: bowlers } = useBowlers();
  const { selectedLeagueId } = useSelectedLeague();
  const { data: leagues } = useLeagues();

  const selectedLeague = leagues?.find(l => l.id === selectedLeagueId);

  if (resultsLoading) {
    return <LoadingSpinner />;
  }

  const leagueResults = selectedLeagueId
    ? results?.filter(r => r.leagueId === selectedLeagueId)
    : results;

  const weeklyWinners: { weekNumber: number; winnerId: string; totalDiff: number }[] = [];

  if (leagueResults && bowlers) {
    const byWeek = leagueResults.reduce((acc, result) => {
      if (result.difference === null) return acc;
      if (!acc[result.weekNumber]) {
        acc[result.weekNumber] = {};
      }
      if (!acc[result.weekNumber][result.predictorId]) {
        acc[result.weekNumber][result.predictorId] = 0;
      }
      acc[result.weekNumber][result.predictorId] += result.difference;
      return acc;
    }, {} as Record<number, Record<string, number>>);

    Object.entries(byWeek).forEach(([weekNum, predictorDiffs]) => {
      const entries = Object.entries(predictorDiffs);
      if (entries.length > 0) {
        const winner = entries.reduce((min, curr) =>
          curr[1] < min[1] ? curr : min
        );
        weeklyWinners.push({
          weekNumber: Number(weekNum),
          winnerId: winner[0],
          totalDiff: winner[1],
        });
      }
    });
    weeklyWinners.sort((a, b) => b.weekNumber - a.weekNumber);
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 space-y-4 sm:space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-1">Leaderboard</h1>
        <p className="text-xs sm:text-base text-muted-foreground">
          {selectedLeague ? `${selectedLeague.name} — ` : ''}Best predictors
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2">
          <PredictionLeaderboard />
        </div>

        <div className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader className="px-3 sm:px-6 pt-4 sm:pt-6 pb-2 sm:pb-4">
              <CardTitle className="text-base sm:text-lg">Weekly Winners</CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-4 sm:pb-6">
              {weeklyWinners.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No results yet
                </p>
              ) : (
                <div className="space-y-1.5 sm:space-y-2">
                  {weeklyWinners.map(winner => {
                    const bowler = bowlers?.find(b => b.id === winner.winnerId);
                    return (
                      <div key={winner.weekNumber} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2 min-w-0">
                          {bowler && <BowlerAvatar bowler={bowler} size="xxs" />}
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-medium">Wk {winner.weekNumber}</p>
                            <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{bowler?.name}</p>
                          </div>
                        </div>
                        <p className="text-xs sm:text-sm font-bold text-primary flex-shrink-0 ml-2 tabular-nums">{winner.totalDiff} off</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="px-3 sm:px-6 pt-4 sm:pt-6 pb-2 sm:pb-4">
              <CardTitle className="text-base sm:text-lg">How Scoring Works</CardTitle>
            </CardHeader>
            <CardContent className="text-xs sm:text-sm space-y-2 px-3 sm:px-6 pb-4 sm:pb-6">
              <p className="text-muted-foreground">
                Your score is the total pin difference between predictions and actual scores. Lower is better!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
