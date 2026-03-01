import { useBowlers } from '@/hooks/useBowlers';
import { useBowlerStats } from '@/hooks/useStats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border/50 bg-popover/95 backdrop-blur-sm p-3 shadow-xl">
      <p className="text-xs font-semibold text-foreground mb-1.5">{label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.fill }} />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-semibold text-foreground">{typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export function TeamComparison() {
  const { data: bowlers, isLoading: bowlersLoading } = useBowlers();
  const { data: statsData, isLoading: statsLoading } = useBowlerStats();

  if (bowlersLoading || statsLoading) {
    return <LoadingSpinner />;
  }

  const chartData = bowlers?.map(bowler => {
    const stats = statsData?.find(s => s.bowlerId === bowler.id);
    return {
      name: bowler.name,
      average: stats?.average || 0,
      highGame: stats?.highGame || 0,
      handicap: stats?.handicap || 0,
      color: bowler.avatarColor,
    };
  }) || [];

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader className="px-3 sm:px-6 pt-4 sm:pt-6 pb-2">
          <CardTitle className="text-base sm:text-lg">Team Comparison</CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pb-4 sm:pb-6">
          <p className="text-center text-muted-foreground py-8">No data available yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="px-3 sm:px-6 pt-4 sm:pt-6 pb-2">
        <CardTitle className="text-base sm:text-lg">Team Comparison</CardTitle>
      </CardHeader>
      <CardContent className="px-2 sm:px-6 pb-4 sm:pb-6">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData} margin={{ left: 0, right: 5, top: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(230 20% 18%)" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(215 20% 55%)' }} axisLine={{ stroke: 'hsl(230 20% 18%)' }} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: 'hsl(215 20% 55%)' }} width={45} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(230 20% 14% / 0.5)' }} />
            <Bar dataKey="average" name="Average" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={index} fill={entry.color} fillOpacity={0.85} />
              ))}
            </Bar>
            <Bar dataKey="highGame" name="High Game" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={index} fill={entry.color} fillOpacity={0.4} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex justify-center gap-4 mt-2 text-[10px] sm:text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-sm bg-primary opacity-85" /> Average</div>
          <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-sm bg-primary opacity-40" /> High Game</div>
        </div>
      </CardContent>
    </Card>
  );
}
