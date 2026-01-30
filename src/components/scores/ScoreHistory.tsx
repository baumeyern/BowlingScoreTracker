import { useBowlers } from '@/hooks/useBowlers';
import { useWeeklySeries } from '@/hooks/useGames';
import { useBowlerStats } from '@/hooks/useStats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { History } from 'lucide-react';

export function ScoreHistory() {
  const { data: bowlers, isLoading: bowlersLoading } = useBowlers();
  const { data: weeklySeries, isLoading: seriesLoading } = useWeeklySeries();
  const { data: statsData } = useBowlerStats();

  if (bowlersLoading || seriesLoading) {
    return <LoadingSpinner />;
  }

  if (!weeklySeries || weeklySeries.length === 0) {
    return (
      <EmptyState
        icon={History}
        title="No score history yet"
        description="Start entering scores to see your history here"
      />
    );
  }

  const weekNumbers = [...new Set(weeklySeries.map(s => s.weekNumber))].sort((a, b) => b - a);

  return (
    <div className="space-y-4">
      {weekNumbers.map(weekNum => {
        const weekData = weeklySeries.filter(s => s.weekNumber === weekNum);
        
        return (
          <Card key={weekNum}>
            <CardHeader>
              <CardTitle className="text-lg">Week {weekNum}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2">Bowler</th>
                      <th className="text-center py-2 px-2">Game 1</th>
                      <th className="text-center py-2 px-2">Game 2</th>
                      <th className="text-center py-2 px-2">Game 3</th>
                      <th className="text-center py-2 px-2">Series</th>
                      <th className="text-center py-2 px-2">HC</th>
                      <th className="text-center py-2 px-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bowlers?.map(bowler => {
                      const series = weekData.find(s => s.bowlerId === bowler.id);
                      const stats = statsData?.find(s => s.bowlerId === bowler.id);
                      const handicap = stats?.handicap || 0;
                      
                      return (
                        <tr key={bowler.id} className="border-b last:border-0">
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-2">
                              <div
                                className="h-3 w-3 rounded-full"
                                style={{ backgroundColor: bowler.avatarColor }}
                              />
                              <span className="font-medium">{bowler.name}</span>
                            </div>
                          </td>
                          <td className="text-center py-3 px-2">
                            {series?.gameScores[0] || '-'}
                          </td>
                          <td className="text-center py-3 px-2">
                            {series?.gameScores[1] || '-'}
                          </td>
                          <td className="text-center py-3 px-2">
                            {series?.gameScores[2] || '-'}
                          </td>
                          <td className="text-center py-3 px-2 font-semibold">
                            {series?.seriesTotal || '-'}
                          </td>
                          <td className="text-center py-3 px-2 text-sm text-muted-foreground">
                            +{handicap * (series?.gamesEntered || 0)}
                          </td>
                          <td className="text-center py-3 px-2 font-bold text-primary">
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
