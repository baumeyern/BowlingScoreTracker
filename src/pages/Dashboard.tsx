import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useBowlers } from '@/hooks/useBowlers';
import { useWeeks } from '@/hooks/useWeeks';
import { useBowlerStats } from '@/hooks/useStats';
import { usePredictions } from '@/hooks/usePredictions';
import { useWeeklySeries } from '@/hooks/useGames';
import { usePredictionResults } from '@/hooks/usePredictions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BowlerSelector } from '@/components/layout/BowlerSelector';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { calculatePredictionLeaderboard } from '@/lib/predictions';
import { AlertCircle, Edit, TrendingUp, BarChart3 } from 'lucide-react';

export function Dashboard() {
  const { data: bowlers, isLoading: bowlersLoading } = useBowlers();
  const { data: weeks, isLoading: weeksLoading } = useWeeks();
  const { data: statsData } = useBowlerStats();
  const { data: allPredictionResults } = usePredictionResults();
  
  const [selectedBowlerId, setSelectedBowlerId] = useState<string>('');

  useEffect(() => {
    if (bowlers && bowlers.length > 0 && !selectedBowlerId) {
      setSelectedBowlerId(bowlers[0].id);
    }
  }, [bowlers, selectedBowlerId]);

  const currentWeek = weeks && weeks.length > 0 ? weeks[weeks.length - 1] : null;
  const { data: currentWeekPredictions } = usePredictions(currentWeek?.id, selectedBowlerId);
  const { data: currentWeekSeries } = useWeeklySeries(currentWeek?.id);

  if (bowlersLoading || weeksLoading) {
    return <LoadingSpinner />;
  }

  const selectedStats = statsData?.find(s => s.bowlerId === selectedBowlerId);

  // Check if current week needs predictions or scores
  // Need 9 predictions: 3 games for each of 3 teammates
  const needsPredictions = currentWeek && (!currentWeekPredictions || currentWeekPredictions.length < 9);
  const needsScores = currentWeek && (!currentWeekSeries || currentWeekSeries.filter(s => s.bowlerId === selectedBowlerId).length === 0);

  // Calculate prediction leaderboard
  const predictionLeaderboard = allPredictionResults 
    ? calculatePredictionLeaderboard(allPredictionResults)
    : [];
  const topPredictor = predictionLeaderboard.length > 0 ? predictionLeaderboard[0] : null;
  const topPredictorBowler = topPredictor ? bowlers?.find(b => b.id === topPredictor.bowlerId) : null;

  // Team standings by average
  const teamStandings = statsData
    ?.map(stat => {
      const bowler = bowlers?.find(b => b.id === stat.bowlerId);
      return { ...stat, bowler };
    })
    .sort((a, b) => b.average - a.average) || [];

  return (
    <div className="container mx-auto p-4 space-y-6 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold">Team Dashboard</h1>
        {currentWeek && (
          <p className="text-muted-foreground">
            Week {currentWeek.weekNumber} {currentWeek.bowlingDate && `• ${new Date(currentWeek.bowlingDate).toLocaleDateString()}`}
          </p>
        )}
      </div>
      
      <BowlerSelector
        value={selectedBowlerId}
        onChange={setSelectedBowlerId}
        label="Select Your Profile"
      />

      {/* Personal Stats */}
      {selectedStats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Your Average</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{selectedStats.average.toFixed(1)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Your Handicap</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{selectedStats.handicap}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">High Game</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-green-600 dark:text-green-400">{selectedStats.highGame}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Action Items */}
      {currentWeek && (
        <Card>
          <CardHeader>
            <CardTitle>This Week</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {needsPredictions && !currentWeek.predictionsLocked && (
              <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                  <div>
                    <p className="font-medium">Predictions due!</p>
                    <p className="text-sm text-muted-foreground">Submit your predictions before bowling</p>
                  </div>
                </div>
                <Button asChild>
                  <Link to="/predictions">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Make Predictions
                  </Link>
                </Button>
              </div>
            )}

            {needsScores && (
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <Edit className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Scores not entered</p>
                    <p className="text-sm text-muted-foreground">Enter this week's scores</p>
                  </div>
                </div>
                <Button asChild>
                  <Link to="/scores">
                    <Edit className="h-4 w-4 mr-2" />
                    Enter Scores
                  </Link>
                </Button>
              </div>
            )}

            {!needsPredictions && !needsScores && (
              <div className="text-center p-4 text-muted-foreground">
                ✓ All set for this week!
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Team Standings */}
      <Card>
        <CardHeader>
          <CardTitle>Team Standings (by Average)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {teamStandings.map((standing, index) => {
              const percentage = (standing.average / 220) * 100; // Max average of 220
              return (
                <div key={standing.bowlerId} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold w-6">{index + 1}.</span>
                      <div
                        className="h-6 w-6 rounded-full"
                        style={{ backgroundColor: standing.bowler?.avatarColor }}
                      />
                      <span className="font-medium">{standing.bowler?.name}</span>
                      {index === 0 && <span className="text-lg">🔥</span>}
                    </div>
                    <span className="font-bold">{standing.average.toFixed(1)}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: standing.bowler?.avatarColor,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Prediction Game Leader */}
      {topPredictorBowler && (
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Prediction Game Leader</p>
                <div className="flex items-center gap-3">
                  <div
                    className="h-12 w-12 rounded-full flex items-center justify-center text-white text-xl font-bold"
                    style={{ backgroundColor: topPredictorBowler.avatarColor }}
                  >
                    {topPredictorBowler.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xl font-bold">{topPredictorBowler.name}</p>
                    <p className="text-sm text-muted-foreground">{topPredictor?.predictionsCount} predictions</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold text-amber-600 dark:text-amber-400">
                  {topPredictor?.totalPoints}
                </p>
                <p className="text-sm text-muted-foreground">points 🏆</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Button asChild variant="outline" className="h-20">
          <Link to="/stats" className="flex flex-col items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            <span>View All Stats</span>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-20">
          <Link to="/history" className="flex flex-col items-center gap-2">
            <Edit className="h-6 w-6" />
            <span>Score History</span>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-20">
          <Link to="/predictions" className="flex flex-col items-center gap-2">
            <TrendingUp className="h-6 w-6" />
            <span>Predictions</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
