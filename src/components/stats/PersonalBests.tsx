import { useBowlers } from '@/hooks/useBowlers';
import { useWeeklySeries } from '@/hooks/useGames';
import { useBowlerStats } from '@/hooks/useStats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Award } from 'lucide-react';

export function PersonalBests() {
  const { data: bowlers, isLoading: bowlersLoading } = useBowlers();
  const { data: statsData, isLoading: statsLoading } = useBowlerStats();
  const { data: weeklySeries, isLoading: seriesLoading } = useWeeklySeries();

  if (bowlersLoading || statsLoading || seriesLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-amber-500" />
          Personal Bests
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {bowlers?.map(bowler => {
            const stats = statsData?.find(s => s.bowlerId === bowler.id);
            const bowlerSeries = weeklySeries?.filter(s => s.bowlerId === bowler.id);
            const highSeries = bowlerSeries && bowlerSeries.length > 0
              ? Math.max(...bowlerSeries.map(s => s.seriesTotal))
              : undefined;

            return (
              <div key={bowler.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div
                    className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: bowler.avatarColor }}
                  >
                    {bowler.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold">{bowler.name}</p>
                    {stats && (
                      <p className="text-sm text-muted-foreground">{stats.totalGames} games</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-6 text-center">
                  <div>
                    <p className="text-xs text-muted-foreground">High Game</p>
                    <p className="text-xl font-bold text-green-600 dark:text-green-400">
                      {stats?.highGame || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">High Series</p>
                    <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                      {highSeries || '-'}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
