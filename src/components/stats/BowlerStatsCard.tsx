import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BowlerAvatar } from '@/components/common/BowlerAvatar';
import type { Bowler, BowlerStats } from '@/types';

interface BowlerStatsCardProps {
  bowler: Bowler;
  stats: BowlerStats | undefined;
}

export function BowlerStatsCard({ bowler, stats }: BowlerStatsCardProps) {
  if (!stats) {
    return (
      <Card>
        <CardHeader className="px-3 sm:px-6 pt-4 sm:pt-6 pb-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <BowlerAvatar bowler={bowler} size="sm" />
            <CardTitle className="text-base sm:text-lg">{bowler.name}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pb-4 sm:pb-6">
          <p className="text-sm text-muted-foreground">No games recorded yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div
        className="h-1"
        style={{ background: `linear-gradient(90deg, ${bowler.avatarColor}80, ${bowler.avatarColor})` }}
      />
      <CardHeader className="px-3 sm:px-6 pt-4 sm:pt-6 pb-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <BowlerAvatar bowler={bowler} size="sm" />
          <div className="min-w-0">
            <CardTitle className="text-base sm:text-lg truncate">{bowler.name}</CardTitle>
            {bowler.nickname && (
              <p className="text-xs sm:text-sm text-muted-foreground truncate">{bowler.nickname}</p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-3 sm:px-6 pb-4 sm:pb-6">
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <div className="text-center p-2.5 sm:p-3 bg-primary/5 border border-primary/10 rounded-xl">
            <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5">Average</p>
            <p className="text-xl sm:text-2xl font-bold tabular-nums text-primary">{stats.average.toFixed(1)}</p>
          </div>
          <div className="text-center p-2.5 sm:p-3 bg-violet-500/5 border border-violet-500/10 rounded-xl">
            <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5">Handicap</p>
            <p className="text-xl sm:text-2xl font-bold tabular-nums text-violet-300">{stats.handicap}</p>
          </div>
          <div className="text-center p-2.5 sm:p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
            <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5">High Game</p>
            <p className="text-xl sm:text-2xl font-bold text-emerald-400 tabular-nums">{stats.highGame}</p>
          </div>
          <div className="text-center p-2.5 sm:p-3 bg-red-500/5 border border-red-500/10 rounded-xl">
            <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5">Low Game</p>
            <p className="text-xl sm:text-2xl font-bold text-red-400 tabular-nums">{stats.lowGame}</p>
          </div>
          <div className="text-center p-2.5 sm:p-3 bg-muted/30 border border-border/50 rounded-xl col-span-2">
            <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5">Total Pins ({stats.totalGames} games)</p>
            <p className="text-xl sm:text-2xl font-bold tabular-nums">{stats.totalPins.toLocaleString()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
