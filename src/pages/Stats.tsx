import { useBowlers } from '@/hooks/useBowlers';
import { useBowlerStats } from '@/hooks/useStats';
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

  if (bowlersLoading || statsLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto p-4 space-y-6 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold mb-2">Statistics</h1>
        <p className="text-muted-foreground">View detailed performance analytics</p>
      </div>

      <TeamStats />

      <Tabs defaultValue="charts" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="charts">Charts</TabsTrigger>
          <TabsTrigger value="individual">Individual</TabsTrigger>
          <TabsTrigger value="bests">Personal Bests</TabsTrigger>
        </TabsList>

        <TabsContent value="charts" className="space-y-6 mt-6">
          <AverageOverTime />
          <TeamComparison />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GameByGameChart />
            <ScoreDistribution />
          </div>
          <HandicapTrend />
        </TabsContent>

        <TabsContent value="individual" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bowlers?.map(bowler => {
              const stats = statsData?.find(s => s.bowlerId === bowler.id);
              return (
                <BowlerStatsCard
                  key={bowler.id}
                  bowler={bowler}
                  stats={stats}
                />
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="bests" className="mt-6">
          <PersonalBests />
        </TabsContent>
      </Tabs>
    </div>
  );
}
