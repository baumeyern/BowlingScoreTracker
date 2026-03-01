import { Link } from 'react-router-dom';
import { useBowlers } from '@/hooks/useBowlers';
import { useWeeks } from '@/hooks/useWeeks';
import { useBowlerStats } from '@/hooks/useStats';
import { useLeagueBowlerStats } from '@/hooks/useStats';
import { usePredictions } from '@/hooks/usePredictions';
import { useWeeklySeries } from '@/hooks/useGames';
import { usePredictionResults } from '@/hooks/usePredictions';
import { useSelectedBowler } from '@/contexts/BowlerContext';
import { useSelectedLeague } from '@/contexts/LeagueContext';
import { useLeagues } from '@/hooks/useLeagues';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BowlerSelector } from '@/components/layout/BowlerSelector';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { calculatePredictionLeaderboard } from '@/lib/predictions';
import { AlertCircle, Edit, TrendingUp, BarChart3 } from 'lucide-react';

export function Dashboard() {
  const { data: bowlers, isLoading: bowlersLoading } = useBowlers();
  const { selectedLeagueId } = useSelectedLeague();
  const { data: leagues } = useLeagues();
  const { data: weeks, isLoading: weeksLoading } = useWeeks(selectedLeagueId || undefined);
  const { data: statsData } = useBowlerStats();
  const { data: leagueStats } = useLeagueBowlerStats(selectedLeagueId || undefined);
  const { data: allPredictionResults } = usePredictionResults();
  const { selectedBowlerId, setSelectedBowlerId } = useSelectedBowler();

  const currentWeek = weeks && weeks.length > 0 ? weeks[weeks.length - 1] : null;
  const { data: currentWeekPredictions } = usePredictions(currentWeek?.id, selectedBowlerId);
  const { data: currentWeekSeries } = useWeeklySeries(currentWeek?.id);

  const selectedLeague = leagues?.find(l => l.id === selectedLeagueId);

  if (bowlersLoading || weeksLoading) {
    return <LoadingSpinner />;
  }

  const overallStats = statsData?.find(s => s.bowlerId === selectedBowlerId);
  const leagueStat = leagueStats?.find(s => s.bowlerId === selectedBowlerId);

  const needsPredictions = currentWeek && (!currentWeekPredictions || currentWeekPredictions.length < 9);
  const needsScores = currentWeek && (!currentWeekSeries || currentWeekSeries.filter(s => s.bowlerId === selectedBowlerId).length === 0);

  const leaguePredictionResults = allPredictionResults?.filter(r => r.leagueId === selectedLeagueId) || [];
  const predictionLeaderboard = leaguePredictionResults.length > 0
    ? calculatePredictionLeaderboard(leaguePredictionResults)
    : [];
  const topPredictor = predictionLeaderboard.length > 0 ? predictionLeaderboard[0] : null;
  const topPredictorBowler = topPredictor ? bowlers?.find(b => b.id === topPredictor.bowlerId) : null;

  const displayStats = leagueStats || statsData;
  const teamStandings = displayStats
    ?.map(stat => {
      const bowler = bowlers?.find(b => b.id === stat.bowlerId);
      return { ...stat, bowler };
    })
    .sort((a, b) => b.average - a.average) || [];

  return (
    <div className="container mx-auto p-4 space-y-6 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold">Team Dashboard</h1>
        <p className="text-muted-foreground">
          {selectedLeague ? selectedLeague.name : 'No league selected'}
          {currentWeek && ` — Week ${currentWeek.weekNumber}`}
          {currentWeek?.bowlingDate && ` • ${new Date(currentWeek.bowlingDate).toLocaleDateString()}`}
        </p>
      </div>

      <BowlerSelector
        value={selectedBowlerId}
        onChange={setSelectedBowlerId}
        label="Select Your Profile"
      />

      {(leagueStat || overallStats) && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {leagueStat ? 'League Average' : 'Overall Average'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{(leagueStat || overallStats)!.average.toFixed(1)}</p>
              {leagueStat && overallStats && (
                <p className="text-xs text-muted-foreground mt-1">Overall: {overallStats.average.toFixed(1)}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {leagueStat ? 'League Handicap' : 'Handicap'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{(leagueStat || overallStats)!.handicap}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">High Game</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-green-600 dark:text-green-400">{(leagueStat || overallStats)!.highGame}</p>
            </CardContent>
          </Card>
        </div>
      )}

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

      <Card>
        <CardHeader>
          <CardTitle>Team Standings (by Average)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {teamStandings.map((standing, index) => {
              const percentage = (standing.average / 220) * 100;
              return (
                <div key={standing.bowlerId} className="space-y-1">
                  <div className="flex items-center justify-between text-sm gap-3">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="font-semibold w-6 flex-shrink-0">{index + 1}.</span>
                      <div
                        className="h-6 w-6 rounded-full flex-shrink-0"
                        style={{ backgroundColor: standing.bowler?.avatarColor }}
                      />
                      <span className="font-medium">{standing.bowler?.name}</span>
                      {index === 0 && <span className="text-lg flex-shrink-0">🔥</span>}
                    </div>
                    <span className="font-bold flex-shrink-0 ml-2">{standing.average.toFixed(1)}</span>
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
                  {topPredictor?.totalDifference}
                </p>
                <p className="text-sm text-muted-foreground">total pins off 🏆</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
