import { PredictionLeaderboard } from '@/components/predictions/PredictionLeaderboard';
import { usePredictionResults } from '@/hooks/usePredictions';
import { useBowlers } from '@/hooks/useBowlers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export function Leaderboard() {
  const { data: results, isLoading: resultsLoading } = usePredictionResults();
  const { data: bowlers } = useBowlers();

  if (resultsLoading) {
    return <LoadingSpinner />;
  }

  // Calculate weekly winners
  const weeklyWinners: { weekNumber: number; winnerId: string; points: number }[] = [];
  
  if (results && bowlers) {
    const byWeek = results.reduce((acc, result) => {
      if (!acc[result.weekNumber]) {
        acc[result.weekNumber] = {};
      }
      if (!acc[result.weekNumber][result.predictorId]) {
        acc[result.weekNumber][result.predictorId] = 0;
      }
      acc[result.weekNumber][result.predictorId] += result.points || 0;
      return acc;
    }, {} as Record<number, Record<string, number>>);

    Object.entries(byWeek).forEach(([weekNum, predictorPoints]) => {
      const entries = Object.entries(predictorPoints);
      if (entries.length > 0) {
        const winner = entries.reduce((max, curr) => 
          curr[1] > max[1] ? curr : max
        );
        weeklyWinners.push({
          weekNumber: Number(weekNum),
          winnerId: winner[0],
          points: winner[1],
        });
      }
    });
    weeklyWinners.sort((a, b) => b.weekNumber - a.weekNumber);
  }

  return (
    <div className="container mx-auto p-4 space-y-6 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold mb-2">Prediction Leaderboard</h1>
        <p className="text-muted-foreground">See who's the best at predicting scores</p>
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
                        <p className="text-sm font-bold text-primary">{winner.points} pts</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">How Points Work</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="flex justify-between">
                <span>Exact match</span>
                <span className="font-bold">10 pts</span>
              </div>
              <div className="flex justify-between">
                <span>Within 10 pins</span>
                <span className="font-bold">7 pts</span>
              </div>
              <div className="flex justify-between">
                <span>Within 25 pins</span>
                <span className="font-bold">5 pts</span>
              </div>
              <div className="flex justify-between">
                <span>Within 50 pins</span>
                <span className="font-bold">3 pts</span>
              </div>
              <div className="flex justify-between">
                <span>Within 75 pins</span>
                <span className="font-bold">1 pt</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>More than 75</span>
                <span>0 pts</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
