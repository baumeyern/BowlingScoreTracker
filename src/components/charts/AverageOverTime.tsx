import { useBowlers } from '@/hooks/useBowlers';
import { useBowlerGames } from '@/hooks/useGames';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { calculateAverage } from '@/lib/handicap';

export function AverageOverTime() {
  const { data: bowlers, isLoading: bowlersLoading } = useBowlers();

  if (bowlersLoading) {
    return <LoadingSpinner />;
  }

  // Fetch all bowler games
  const bowlerGamesQueries = bowlers?.map(b => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { data } = useBowlerGames(b.id);
    return { bowlerId: b.id, games: data || [] };
  }) || [];

  // Calculate running averages per week
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

    // Calculate cumulative average up to each week
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
      week: `Week ${weekNum}`,
      weekNumber: Number(weekNum),
      ...averages,
    }))
    .sort((a, b) => a.weekNumber - b.weekNumber);

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Average Over Time</CardTitle>
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
        <CardTitle>Average Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis domain={[0, 250]} />
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
      </CardContent>
    </Card>
  );
}
