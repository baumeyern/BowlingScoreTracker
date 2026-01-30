import { useBowlerStats } from '@/hooks/useStats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Users, TrendingUp, Award } from 'lucide-react';

export function TeamStats() {
  const { data: statsData, isLoading } = useBowlerStats();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!statsData || statsData.length === 0) {
    return null;
  }

  const teamAverage = statsData.reduce((sum, s) => sum + s.average, 0) / statsData.length;
  const teamHighGame = Math.max(...statsData.map(s => s.highGame));
  const totalGames = statsData.reduce((sum, s) => sum + s.totalGames, 0);
  const totalPins = statsData.reduce((sum, s) => sum + s.totalPins, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Users className="h-4 w-4" />
            Team Average
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{teamAverage.toFixed(1)}</p>
          <p className="text-xs text-muted-foreground mt-1">{totalGames} total games</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Award className="h-4 w-4" />
            Team High Game
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">{teamHighGame}</p>
          <p className="text-xs text-muted-foreground mt-1">Best single game</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Total Pins
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{totalPins.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">As a team</p>
        </CardContent>
      </Card>
    </div>
  );
}
