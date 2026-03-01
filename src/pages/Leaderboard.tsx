import { PredictionLeaderboard } from '@/components/predictions/PredictionLeaderboard';
import { usePredictionResults } from '@/hooks/usePredictions';
import { useBowlers } from '@/hooks/useBowlers';
import { useSelectedLeague } from '@/contexts/LeagueContext';
import { useLeagues } from '@/hooks/useLeagues';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

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
    <div className="container mx-auto p-4 space-y-6 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold mb-2">Prediction Leaderboard</h1>
        <p className="text-muted-foreground">
          {selectedLeague ? `${selectedLeague.name} — ` : ''}See who's the best at predicting scores
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PredictionLeaderboard />
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Weekly Winners</CardTitle>
            </CardHeader>
            <CardContent>
              {weeklyWinners.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No results yet
                </p>
              ) : (
                <div className="space-y-2">
                  {weeklyWinners.map(winner => {
                    const bowler = bowlers?.find(b => b.id === winner.winnerId);
                    return (
                      <div key={winner.weekNumber} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                            style={{ backgroundColor: bowler?.avatarColor }}
                          >
                            {bowler?.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium">Week {winner.weekNumber}</p>
                            <p className="text-xs text-muted-foreground">{bowler?.name}</p>
                          </div>
                        </div>
                        <p className="text-sm font-bold text-primary">{winner.totalDiff} pins off</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">How Scoring Works</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p className="text-muted-foreground">
                Your score is the total pin difference between your predictions and actual scores. Lower is better!
              </p>
              <div className="flex justify-between mt-3">
                <span>Exact match</span>
                <span className="font-bold">0 pins off</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                The predictor with the lowest total pins off wins each week and the overall leaderboard.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
