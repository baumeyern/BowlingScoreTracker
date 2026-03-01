import { useBowlers } from '@/hooks/useBowlers';
import { useBowlerGames } from '@/hooks/useGames';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { calculateAverage } from '@/lib/handicap';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border/50 bg-popover/95 backdrop-blur-sm p-3 shadow-xl">
      <p className="text-xs font-semibold text-foreground mb-1.5">{label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-semibold text-foreground">{entry.value?.toFixed(1)}</span>
        </div>
      ))}
    </div>
  );
};

export function AverageOverTime() {
  const { data: bowlers, isLoading: bowlersLoading } = useBowlers();

  if (bowlersLoading) {
    return <LoadingSpinner />;
  }

  const bowlerGamesQueries = bowlers?.map(b => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { data } = useBowlerGames(b.id);
    return { bowlerId: b.id, games: data || [] };
  }) || [];

  const weeklyAverages: Record<number, Record<string, number>> = {};

  bowlerGamesQueries.forEach(({ bowlerId, games }) => {
    const gamesByWeek: Record<number, number[]> = {};
    
    games.forEach((game: any) => {
      const weekNum = game.weeks?.week_number;
      if (weekNum && game.score !== null) {
        if (!gamesByWeek[weekNum]) gamesByWeek[weekNum] = [];
        gamesByWeek[weekNum].push(game.score);
      }
    });

    const allScores: number[] = [];
    Object.keys(gamesByWeek)
      .map(Number)
      .sort((a, b) => a - b)
      .forEach(weekNum => {
        allScores.push(...gamesByWeek[weekNum]);
        const avg = calculateAverage(allScores);
        if (!weeklyAverages[weekNum]) weeklyAverages[weekNum] = {};
        weeklyAverages[weekNum][bowlerId] = avg;
      });
  });

  const chartData = Object.entries(weeklyAverages)
    .map(([weekNum, averages]) => ({
      week: `Wk ${weekNum}`,
      weekNumber: Number(weekNum),
      ...averages,
    }))
    .sort((a, b) => a.weekNumber - b.weekNumber);

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader className="px-3 sm:px-6 pt-4 sm:pt-6 pb-2">
          <CardTitle className="text-base sm:text-lg">Average Over Time</CardTitle>
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
        <CardTitle className="text-base sm:text-lg">Average Over Time</CardTitle>
      </CardHeader>
      <CardContent className="px-2 sm:px-6 pb-4 sm:pb-6">
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={chartData} margin={{ left: -15, right: 5, top: 10, bottom: 5 }}>
            <defs>
              {bowlers?.map(bowler => (
                <linearGradient key={bowler.id} id={`grad-avg-${bowler.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={bowler.avatarColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={bowler.avatarColor} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(230 20% 18%)" />
            <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'hsl(215 20% 55%)' }} axisLine={{ stroke: 'hsl(230 20% 18%)' }} tickLine={false} />
            <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11, fill: 'hsl(215 20% 55%)' }} width={35} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            {bowlers?.map(bowler => (
              <Area
                key={bowler.id}
                type="monotone"
                dataKey={bowler.id}
                name={bowler.name}
                stroke={bowler.avatarColor}
                strokeWidth={2.5}
                fill={`url(#grad-avg-${bowler.id})`}
                dot={{ fill: bowler.avatarColor, r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, strokeWidth: 2, stroke: 'hsl(230 25% 9%)' }}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
