import { useBowlerStats } from '@/hooks/useStats';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

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
    <div className="grid grid-cols-3 gap-2 sm:gap-4">
      <div className="rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-600/5 border border-cyan-500/20 p-3 sm:p-5">
        <p className="text-[10px] sm:text-xs font-medium text-cyan-400/80 mb-1">Team Avg</p>
        <p className="text-2xl sm:text-3xl font-bold text-cyan-50 tabular-nums">{teamAverage.toFixed(1)}</p>
        <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">{totalGames} games</p>
      </div>

      <div className="rounded-xl bg-gradient-to-br from-emerald-500/10 to-green-600/5 border border-emerald-500/20 p-3 sm:p-5">
        <p className="text-[10px] sm:text-xs font-medium text-emerald-400/80 mb-1">High Game</p>
        <p className="text-2xl sm:text-3xl font-bold text-emerald-300 tabular-nums">{teamHighGame}</p>
        <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Best single</p>
      </div>

      <div className="rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-600/5 border border-violet-500/20 p-3 sm:p-5">
        <p className="text-[10px] sm:text-xs font-medium text-violet-400/80 mb-1">Total Pins</p>
        <p className="text-2xl sm:text-3xl font-bold text-violet-50 tabular-nums">{totalPins.toLocaleString()}</p>
        <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Team total</p>
      </div>
    </div>
  );
}
