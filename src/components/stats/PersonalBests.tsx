import { useBowlers } from '@/hooks/useBowlers';
import { useWeeklySeries } from '@/hooks/useGames';
import { useBowlerStats } from '@/hooks/useStats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { BowlerAvatar } from '@/components/common/BowlerAvatar';
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
      <CardHeader className="px-3 sm:px-6 pt-4 sm:pt-6 pb-3">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Award className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
          Personal Bests
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 sm:px-6 pb-4 sm:pb-6">
        <div className="space-y-2 sm:space-y-4">
          {bowlers?.map(bowler => {
            const stats = statsData?.find(s => s.bowlerId === bowler.id);
            const bowlerSeries = weeklySeries?.filter(s => s.bowlerId === bowler.id);
            const highSeries = bowlerSeries && bowlerSeries.length > 0
              ? Math.max(...bowlerSeries.map(s => s.seriesTotal))
              : undefined;

            return (
              <div key={bowler.id} className="flex items-center justify-between p-2.5 sm:p-3 border rounded-lg">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <BowlerAvatar bowler={bowler} size="sm" />
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{bowler.name}</p>
                    {stats && (
                      <p className="text-[10px] sm:text-sm text-muted-foreground">{stats.totalGames} games</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 sm:gap-6 text-center flex-shrink-0 ml-2">
                  <div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">High Game</p>
                    <p className="text-lg sm:text-xl font-bold text-emerald-400 tabular-nums">
                      {stats?.highGame || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">High Series</p>
                    <p className="text-lg sm:text-xl font-bold text-cyan-400 tabular-nums">
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
