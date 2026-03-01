import { useState } from 'react';
import { useBowlers } from '@/hooks/useBowlers';
import { useBowlerGames } from '@/hooks/useGames';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border/50 bg-popover/95 backdrop-blur-sm p-3 shadow-xl">
      <p className="text-xs font-semibold text-foreground mb-1.5">Game {label}</p>
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

  const chartData: { gameIndex: number; [key: string]: any }[] = [];

  if (selectedBowlerId === 'all') {
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
    const bowlerData = bowlerGamesQueries.find(q => q.bowler.id === selectedBowlerId);
    bowlerData?.games.forEach((game: any, index: number) => {
      chartData.push({
        gameIndex: index + 1,
        score: game.score,
      });
    });
  }

  const selectedColor = bowlers?.find(b => b.id === selectedBowlerId)?.avatarColor || '#06b6d4';

  return (
    <Card>
      <CardHeader className="px-3 sm:px-6 pt-4 sm:pt-6 pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base sm:text-lg">Game by Game</CardTitle>
          <Select value={selectedBowlerId} onValueChange={setSelectedBowlerId}>
            <SelectTrigger className="w-28 sm:w-40 h-8 text-xs sm:text-sm">
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
      <CardContent className="px-2 sm:px-6 pb-4 sm:pb-6">
        {chartData.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No games recorded yet</p>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData} margin={{ left: 0, right: 5, top: 10, bottom: 5 }}>
              <defs>
                {selectedBowlerId === 'all' ? (
                  bowlers?.map(bowler => (
                    <linearGradient key={bowler.id} id={`grad-gbg-${bowler.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={bowler.avatarColor} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={bowler.avatarColor} stopOpacity={0} />
                    </linearGradient>
                  ))
                ) : (
                  <linearGradient id="grad-gbg-single" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={selectedColor} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={selectedColor} stopOpacity={0} />
                  </linearGradient>
                )}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(230 20% 18%)" />
              <XAxis dataKey="gameIndex" tick={{ fontSize: 11, fill: 'hsl(215 20% 55%)' }} axisLine={{ stroke: 'hsl(230 20% 18%)' }} tickLine={false} />
              <YAxis domain={[0, 300]} tick={{ fontSize: 11, fill: 'hsl(215 20% 55%)' }} width={45} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={200} stroke="hsl(215 20% 30%)" strokeDasharray="6 4" label={{ value: '200', position: 'right', fill: 'hsl(215 20% 40%)', fontSize: 10 }} />
              {selectedBowlerId === 'all' ? (
                bowlers?.map(bowler => (
                  <Area
                    key={bowler.id}
                    type="monotone"
                    dataKey={bowler.id}
                    name={bowler.name}
                    stroke={bowler.avatarColor}
                    strokeWidth={2}
                    fill={`url(#grad-gbg-${bowler.id})`}
                    dot={{ fill: bowler.avatarColor, r: 2, strokeWidth: 0 }}
                    activeDot={{ r: 4, strokeWidth: 2, stroke: 'hsl(230 25% 9%)' }}
                    connectNulls
                  />
                ))
              ) : (
                <Area
                  type="monotone"
                  dataKey="score"
                  name="Score"
                  stroke={selectedColor}
                  strokeWidth={2.5}
                  fill="url(#grad-gbg-single)"
                  dot={{ fill: selectedColor, r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5, strokeWidth: 2, stroke: 'hsl(230 25% 9%)' }}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
