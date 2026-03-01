import { useBowlers } from '@/hooks/useBowlers';
import { useBowlerGames } from '@/hooks/useGames';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { calculateAverage, calculateHandicap } from '@/lib/handicap';
import { TrendingDown } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border/50 bg-popover/95 backdrop-blur-sm p-3 shadow-xl">
      <p className="text-xs font-semibold text-foreground mb-1.5">{label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color || entry.stroke }} />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-semibold text-foreground">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export function HandicapTrend() {
  const { data: bowlers, isLoading: bowlersLoading } = useBowlers();

  if (bowlersLoading) {
    return <LoadingSpinner />;
  }

  const bowlerGamesQueries = bowlers?.map(b => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { data } = useBowlerGames(b.id);
    return { bowlerId: b.id, games: data || [] };
  }) || [];

  const weeklyHandicaps: Record<number, Record<string, number>> = {};

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
        const handicap = calculateHandicap(avg);
        if (!weeklyHandicaps[weekNum]) weeklyHandicaps[weekNum] = {};
        weeklyHandicaps[weekNum][bowlerId] = handicap;
      });
  });

  const chartData = Object.entries(weeklyHandicaps)
    .map(([weekNum, handicaps]) => ({
      week: `Wk ${weekNum}`,
      weekNumber: Number(weekNum),
      ...handicaps,
    }))
    .sort((a, b) => a.weekNumber - b.weekNumber);

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader className="px-3 sm:px-6 pt-4 sm:pt-6 pb-2">
          <CardTitle className="text-base sm:text-lg">Handicap Trend</CardTitle>
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
        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
          Handicap Trend
          <TrendingDown className="h-4 w-4 text-green-400" />
        </CardTitle>
      </CardHeader>
      <CardContent className="px-2 sm:px-6 pb-4 sm:pb-6">
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={chartData} margin={{ left: -15, right: 5, top: 10, bottom: 5 }}>
            <defs>
              {bowlers?.map(bowler => (
                <linearGradient key={bowler.id} id={`grad-hc-${bowler.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={bowler.avatarColor} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={bowler.avatarColor} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(230 20% 18%)" />
            <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'hsl(215 20% 55%)' }} axisLine={{ stroke: 'hsl(230 20% 18%)' }} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: 'hsl(215 20% 55%)' }} width={35} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            {bowlers?.map(bowler => (
              <Area
                key={bowler.id}
                type="monotone"
                dataKey={bowler.id}
                name={bowler.name}
                stroke={bowler.avatarColor}
                strokeWidth={2.5}
                fill={`url(#grad-hc-${bowler.id})`}
                dot={{ fill: bowler.avatarColor, r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, strokeWidth: 2, stroke: 'hsl(230 25% 9%)' }}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
        <p className="text-[10px] sm:text-xs text-muted-foreground text-center mt-3 flex items-center justify-center gap-1">
          <TrendingDown className="h-3 w-3 text-green-400" />
          Lower = higher average (improving!)
        </p>
      </CardContent>
    </Card>
  );
}
