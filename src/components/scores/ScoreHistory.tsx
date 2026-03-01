import { useBowlers } from '@/hooks/useBowlers';
import { useWeeklySeries } from '@/hooks/useGames';
import { useBowlerStats } from '@/hooks/useStats';
import { useSelectedLeague } from '@/contexts/LeagueContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { BowlerAvatar } from '@/components/common/BowlerAvatar';
import { History } from 'lucide-react';

export function ScoreHistory() {
  const { data: bowlers, isLoading: bowlersLoading } = useBowlers();
  const { data: weeklySeries, isLoading: seriesLoading } = useWeeklySeries();
  const { data: statsData } = useBowlerStats();
  const { selectedLeagueId } = useSelectedLeague();

  if (bowlersLoading || seriesLoading) {
    return <LoadingSpinner />;
  }

  const filteredSeries = selectedLeagueId
    ? weeklySeries?.filter(s => s.leagueId === selectedLeagueId)
    : weeklySeries;

  if (!filteredSeries || filteredSeries.length === 0) {
    return (
      <EmptyState
        icon={History}
        title="No score history yet"
        description="Start entering scores to see your history here"
      />
    );
  }

  const weekNumbers = [...new Set(filteredSeries.map(s => s.weekNumber))].sort((a, b) => b - a);

  return (
    <div className="space-y-3 sm:space-y-4">
      {weekNumbers.map(weekNum => {
        const weekData = filteredSeries.filter(s => s.weekNumber === weekNum);

        return (
          <Card key={weekNum}>
            <CardHeader className="px-3 sm:px-6 pt-3 sm:pt-6 pb-2 sm:pb-4">
              <CardTitle className="text-base sm:text-lg">Week {weekNum}</CardTitle>
            </CardHeader>
            <CardContent className="px-0 sm:px-6 pb-3 sm:pb-6">
              <div className="overflow-x-auto -mx-0">
                <table className="w-full text-xs sm:text-sm min-w-[520px]">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2 sm:px-3 sticky left-0 bg-card z-10">Bowler</th>
                      <th className="text-center py-2 px-1.5 sm:px-2">G1</th>
                      <th className="text-center py-2 px-1.5 sm:px-2">G2</th>
                      <th className="text-center py-2 px-1.5 sm:px-2">G3</th>
                      <th className="text-center py-2 px-1.5 sm:px-2">Avg</th>
                      <th className="text-center py-2 px-1.5 sm:px-2">Series</th>
                      <th className="text-center py-2 px-1.5 sm:px-2">HC</th>
                      <th className="text-center py-2 px-1.5 sm:px-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bowlers?.map(bowler => {
                      const series = weekData.find(s => s.bowlerId === bowler.id);
                      const stats = statsData?.find(s => s.bowlerId === bowler.id);
                      const handicap = stats?.handicap || 0;

                      return (
                        <tr key={bowler.id} className="border-b last:border-0">
                          <td className="py-2.5 px-2 sm:px-3 sticky left-0 bg-card z-10">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              <BowlerAvatar bowler={bowler} size="xxs" />
                              <span className="font-medium whitespace-nowrap">{bowler.name}</span>
                            </div>
                          </td>
                          <td className="text-center py-2.5 px-1.5 sm:px-2 tabular-nums">
                            {series?.gameScores[0] || '-'}
                          </td>
                          <td className="text-center py-2.5 px-1.5 sm:px-2 tabular-nums">
                            {series?.gameScores[1] || '-'}
                          </td>
                          <td className="text-center py-2.5 px-1.5 sm:px-2 tabular-nums">
                            {series?.gameScores[2] || '-'}
                          </td>
                          <td className="text-center py-2.5 px-1.5 sm:px-2 font-semibold tabular-nums">
                            {series ? Math.round(series.seriesTotal / series.gamesEntered) : '-'}
                          </td>
                          <td className="text-center py-2.5 px-1.5 sm:px-2 font-semibold tabular-nums">
                            {series?.seriesTotal || '-'}
                          </td>
                          <td className="text-center py-2.5 px-1.5 sm:px-2 text-muted-foreground tabular-nums">
                            +{handicap * (series?.gamesEntered || 0)}
                          </td>
                          <td className="text-center py-2.5 px-1.5 sm:px-2 font-bold text-primary tabular-nums">
                            {series ? series.seriesTotal + (handicap * series.gamesEntered) : '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
