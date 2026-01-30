import { useState } from 'react';
import { useBowlers } from '@/hooks/useBowlers';
import { useBowlerGames } from '@/hooks/useGames';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export function GameByGameChart() {
  const { data: bowlers, isLoading: bowlersLoading } = useBowlers();
  const [selectedBowlerId, setSelectedBowlerId] = useState<string>('all');

  if (bowlersLoading) {
    return <LoadingSpinner />;
  }

  const bowlerGamesQueries = bowlers?.map(b => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { data } = useBowlerGames(b.id);
    return { bowler: b, games: data || [] };
  }) || [];

  // Prepare chart data
  const chartData: { gameIndex: number; [key: string]: any }[] = [];

  if (selectedBowlerId === 'all') {
    // Show all bowlers
    const maxGames = Math.max(...bowlerGamesQueries.map(q => q.games.length));
    for (let i = 0; i < maxGames; i++) {
      const dataPoint: any = { gameIndex: i + 1 };
      bowlerGamesQueries.forEach(({ bowler, games }) => {
        if (games[i]) {
          dataPoint[bowler.id] = games[i].score;
        }
      });
      chartData.push(dataPoint);
    }
  } else {
    // Show single bowler
    const bowlerData = bowlerGamesQueries.find(q => q.bowler.id === selectedBowlerId);
    bowlerData?.games.forEach((game: any, index: number) => {
      chartData.push({
        gameIndex: index + 1,
        score: game.score,
      });
    });
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Game by Game</CardTitle>
          <Select value={selectedBowlerId} onValueChange={setSelectedBowlerId}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Bowlers</SelectItem>
              {bowlers?.map(bowler => (
                <SelectItem key={bowler.id} value={bowler.id}>
                  {bowler.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No games recorded yet</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="gameIndex" 
                label={{ value: 'Game Number', position: 'insideBottom', offset: -5 }}
              />
              <YAxis domain={[0, 300]} label={{ value: 'Score', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <ReferenceLine y={200} stroke="#888" strokeDasharray="3 3" label="200" />
              {selectedBowlerId === 'all' ? (
                bowlers?.map(bowler => (
                  <Line
                    key={bowler.id}
                    type="monotone"
                    dataKey={bowler.id}
                    name={bowler.name}
                    stroke={bowler.avatarColor}
                    strokeWidth={2}
                    dot={{ fill: bowler.avatarColor }}
                    connectNulls
                  />
                ))
              ) : (
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke={bowlers?.find(b => b.id === selectedBowlerId)?.avatarColor || '#3B82F6'}
                  strokeWidth={2}
                  dot={{ fill: bowlers?.find(b => b.id === selectedBowlerId)?.avatarColor || '#3B82F6' }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
