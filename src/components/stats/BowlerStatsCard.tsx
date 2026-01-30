import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Bowler, BowlerStats } from '@/types';

interface BowlerStatsCardProps {
  bowler: Bowler;
  stats: BowlerStats | undefined;
}

export function BowlerStatsCard({ bowler, stats }: BowlerStatsCardProps) {
  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: bowler.avatarColor }}
            >
              {bowler.name.charAt(0)}
            </div>
            <CardTitle>{bowler.name}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No games recorded yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div
            className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold"
            style={{ backgroundColor: bowler.avatarColor }}
          >
            {bowler.name.charAt(0)}
          </div>
          <div>
            <CardTitle>{bowler.name}</CardTitle>
            {bowler.nickname && (
              <p className="text-sm text-muted-foreground">{bowler.nickname}</p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Average</p>
            <p className="text-2xl font-bold">{stats.average.toFixed(1)}</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Handicap</p>
            <p className="text-2xl font-bold">{stats.handicap}</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">High Game</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.highGame}</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Low Game</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.lowGame}</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg col-span-2">
            <p className="text-xs text-muted-foreground mb-1">Total Pins ({stats.totalGames} games)</p>
            <p className="text-2xl font-bold">{stats.totalPins.toLocaleString()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
