import { useBowlers } from '@/hooks/useBowlers';
import { useBowlerStats, useLeagueBowlerStats } from '@/hooks/useStats';
import { useSelectedLeague } from '@/contexts/LeagueContext';
import { useLeagues } from '@/hooks/useLeagues';
import { BowlerStatsCard } from '@/components/stats/BowlerStatsCard';
import { TeamStats } from '@/components/stats/TeamStats';
import { PersonalBests } from '@/components/stats/PersonalBests';
import { AverageOverTime } from '@/components/charts/AverageOverTime';
import { GameByGameChart } from '@/components/charts/GameByGameChart';
import { ScoreDistribution } from '@/components/charts/ScoreDistribution';
import { HandicapTrend } from '@/components/charts/HandicapTrend';
import { TeamComparison } from '@/components/charts/TeamComparison';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function Stats() {
  const { data: bowlers, isLoading: bowlersLoading } = useBowlers();
  const { data: statsData, isLoading: statsLoading } = useBowlerStats();
  const { selectedLeagueId } = useSelectedLeague();
  const { data: leagueStats } = useLeagueBowlerStats(selectedLeagueId || undefined);
  const { data: leagues } = useLeagues();

  const selectedLeague = leagues?.find(l => l.id === selectedLeagueId);

  if (bowlersLoading || statsLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 space-y-4 sm:space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-1">Statistics</h1>
        <p className="text-xs sm:text-base text-muted-foreground">
          {selectedLeague ? `${selectedLeague.name} — ` : ''}Performance analytics
        </p>
      </div>

      <TeamStats />

      <Tabs defaultValue="charts" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="charts" className="text-xs sm:text-sm">Charts</TabsTrigger>
          <TabsTrigger value="individual" className="text-xs sm:text-sm">Individual</TabsTrigger>
          <TabsTrigger value="bests" className="text-xs sm:text-sm">Bests</TabsTrigger>
        </TabsList>

        <TabsContent value="charts" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
          <AverageOverTime />
          <TeamComparison />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <GameByGameChart />
            <ScoreDistribution />
          </div>
          <HandicapTrend />
        </TabsContent>

        <TabsContent value="individual" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {bowlers?.map(bowler => {
              const leagueStat = leagueStats?.find(s => s.bowlerId === bowler.id);
              const overallStat = statsData?.find(s => s.bowlerId === bowler.id);
              const stat = leagueStat || overallStat;
              return (
                <BowlerStatsCard
                  key={bowler.id}
                  bowler={bowler}
                  stats={stat}
                />
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="bests" className="mt-4 sm:mt-6">
          <PersonalBests />
        </TabsContent>
      </Tabs>
    </div>
  );
}
