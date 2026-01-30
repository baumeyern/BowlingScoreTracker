import { useBowlers } from '@/hooks/useBowlers';
import { useBowlerGames } from '@/hooks/useGames';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { calculateAverage, calculateHandicap } from '@/lib/handicap';

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

  // Calculate handicap progression per week
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

    // Calculate cumulative handicap up to each week
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
      week: `Week ${weekNum}`,
      weekNumber: Number(weekNum),
      ...handicaps,
    }))
    .sort((a, b) => a.weekNumber - b.weekNumber);

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Handicap Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">No data available yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Handicap Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis label={{ value: 'Handicap', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            {bowlers?.map(bowler => (
              <Line
                key={bowler.id}
                type="monotone"
                dataKey={bowler.id}
                name={bowler.name}
                stroke={bowler.avatarColor}
                strokeWidth={2}
                dot={{ fill: bowler.avatarColor }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
        <p className="text-xs text-muted-foreground text-center mt-4">
          Lower handicap = higher average (you're improving!)
        </p>
      </CardContent>
    </Card>
  );
}
