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
import { AlertCircle, Edit, TrendingUp, BarChart3, Trophy, ChevronRight } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { BowlerAvatar } from '@/components/common/BowlerAvatar';

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
  const displayStats = leagueStats || statsData;
  const teamStandings = displayStats
    ?.map(stat => {
      const bowler = bowlers?.find(b => b.id === stat.bowlerId);
      return { ...stat, bowler };
    })
    .sort((a, b) => b.average - a.average) || [];

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 space-y-4 sm:space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Team Dashboard</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          {selectedLeague ? selectedLeague.name : 'No league selected'}
          {currentWeek && ` — Week ${currentWeek.weekNumber}`}
          {currentWeek?.bowlingDate && ` • ${formatDate(currentWeek.bowlingDate)}`}
        </p>
      </div>

      <BowlerSelector
        value={selectedBowlerId}
        onChange={setSelectedBowlerId}
        label="Select Your Profile"
      />

      {(leagueStat || overallStats) && (
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <div className="rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-600/5 border border-cyan-500/20 p-3 sm:p-5">
            <p className="text-[10px] sm:text-xs font-medium text-cyan-400/80 mb-1">
              {leagueStat ? 'League Avg' : 'Average'}
            </p>
            <p className="text-2xl sm:text-4xl font-bold text-cyan-50 tabular-nums">{(leagueStat || overallStats)!.average.toFixed(1)}</p>
            {leagueStat && overallStats && (
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Overall: {overallStats.average.toFixed(1)}</p>
            )}
          </div>

          <div className="rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-600/5 border border-violet-500/20 p-3 sm:p-5">
            <p className="text-[10px] sm:text-xs font-medium text-violet-400/80 mb-1">
              {leagueStat ? 'League HC' : 'Handicap'}
            </p>
            <p className="text-2xl sm:text-4xl font-bold text-violet-50 tabular-nums">{(leagueStat || overallStats)!.handicap}</p>
          </div>

          <div className="rounded-xl bg-gradient-to-br from-emerald-500/10 to-green-600/5 border border-emerald-500/20 p-3 sm:p-5">
            <p className="text-[10px] sm:text-xs font-medium text-emerald-400/80 mb-1">High Game</p>
            <p className="text-2xl sm:text-4xl font-bold text-emerald-300 tabular-nums">{(leagueStat || overallStats)!.highGame}</p>
          </div>
        </div>
      )}

      {currentWeek && (needsPredictions || needsScores) && (
        <div className="space-y-2">
          {needsPredictions && !currentWeek.predictionsLocked && (
            <Link
              to="/predictions"
              className="flex items-center gap-3 p-3 sm:p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl active:scale-[0.98] transition-all hover:bg-amber-500/15"
            >
              <div className="p-1.5 rounded-lg bg-amber-500/20">
                <AlertCircle className="h-4 w-4 text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm sm:text-base">Predictions due!</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Submit before bowling</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </Link>
          )}

          {needsScores && (
            <Link
              to="/scores"
              className="flex items-center gap-3 p-3 sm:p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl active:scale-[0.98] transition-all hover:bg-blue-500/15"
            >
              <div className="p-1.5 rounded-lg bg-blue-500/20">
                <Edit className="h-4 w-4 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm sm:text-base">Scores not entered</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Enter this week's scores</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </Link>
          )}
        </div>
      )}

      <Card>
        <CardHeader className="pb-3 px-3 sm:px-6 pt-4 sm:pt-6">
          <CardTitle className="text-base sm:text-lg">Team Standings</CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pb-4 sm:pb-6">
          <div className="space-y-3">
            {teamStandings.map((standing, index) => {
              const percentage = (standing.average / 220) * 100;
              return (
                <div key={standing.bowlerId} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="font-bold text-sm w-5 flex-shrink-0 text-muted-foreground">{index + 1}</span>
                      {standing.bowler && (
                        <BowlerAvatar bowler={standing.bowler} size="xxs" />
                      )}
                      <span className="font-medium text-sm truncate">{standing.bowler?.name}</span>
                      {index === 0 && <span className="flex-shrink-0 text-xs">🔥</span>}
                    </div>
                    <span className="font-bold text-sm flex-shrink-0 tabular-nums">{standing.average.toFixed(1)}</span>
                  </div>
                  <div className="w-full bg-muted/40 rounded-full h-1.5 sm:h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${percentage}%`,
                        background: `linear-gradient(90deg, ${standing.bowler?.avatarColor}99, ${standing.bowler?.avatarColor})`,
                        boxShadow: `0 0 8px ${standing.bowler?.avatarColor}40`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {predictionLeaderboard.length > 0 && (
        <Card>
          <CardHeader className="pb-3 px-3 sm:px-6 pt-4 sm:pt-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400" />
              Prediction Standings
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-4 sm:pb-6">
            <div className="space-y-2">
              {predictionLeaderboard.map((entry, index) => {
                const bowler = bowlers?.find(b => b.id === entry.bowlerId);
                if (!bowler) return null;
                return (
                  <div
                    key={entry.bowlerId}
                    className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl border transition-colors ${
                      index === 0 ? 'border-amber-500/30 bg-amber-500/10 glow-amber' : 'border-border/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <span className="font-semibold w-5 sm:w-6 text-center flex-shrink-0 text-sm">
                        {index === 0 && '🥇'}
                        {index === 1 && '🥈'}
                        {index === 2 && '🥉'}
                        {index > 2 && `${index + 1}.`}
                      </span>
                      <BowlerAvatar bowler={bowler} size="sm" />
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{bowler.name}</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">{entry.predictionsCount} predictions</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className="text-base sm:text-lg font-bold text-primary tabular-nums">{entry.totalDifference}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground tabular-nums">avg {entry.avgDifference.toFixed(1)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <Button asChild variant="outline" className="h-16 sm:h-20 rounded-xl border-border/50 hover:bg-primary/5 hover:border-primary/30 transition-all">
          <Link to="/stats" className="flex flex-col items-center gap-1 sm:gap-2">
            <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <span className="text-xs sm:text-sm">Stats</span>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-16 sm:h-20 rounded-xl border-border/50 hover:bg-primary/5 hover:border-primary/30 transition-all">
          <Link to="/history" className="flex flex-col items-center gap-1 sm:gap-2">
            <Edit className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <span className="text-xs sm:text-sm">History</span>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-16 sm:h-20 rounded-xl border-border/50 hover:bg-primary/5 hover:border-primary/30 transition-all">
          <Link to="/predictions" className="flex flex-col items-center gap-1 sm:gap-2">
            <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <span className="text-xs sm:text-sm">Predict</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
