import { useState } from 'react';
import { useBowlers } from '@/hooks/useBowlers';
import { useBowlerGames } from '@/hooks/useGames';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function ScoreDistribution() {
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

  // Create score buckets
  const buckets = [
    { range: '<120', min: 0, max: 119 },
    { range: '120-139', min: 120, max: 139 },
    { range: '140-159', min: 140, max: 159 },
    { range: '160-179', min: 160, max: 179 },
    { range: '180-199', min: 180, max: 199 },
    { range: '200-219', min: 200, max: 219 },
    { range: '220-239', min: 220, max: 239 },
    { range: '240-259', min: 240, max: 259 },
    { range: '260+', min: 260, max: 300 },
  ];

  const chartData = buckets.map(bucket => {
    const dataPoint: any = { range: bucket.range };
    
    if (selectedBowlerId === 'all') {
      // Count all games in this bucket
      let count = 0;
      bowlerGamesQueries.forEach(({ games }) => {
        games.forEach((game: any) => {
          if (game.score >= bucket.min && game.score <= bucket.max) {
            count++;
          }
        });
      });
      dataPoint.count = count;
    } else {
      // Count for selected bowler
      const bowlerData = bowlerGamesQueries.find(q => q.bowler.id === selectedBowlerId);
      const count = bowlerData?.games.filter(
        (game: any) => game.score >= bucket.min && game.score <= bucket.max
      ).length || 0;
      dataPoint.count = count;
    }
    
    return dataPoint;
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Score Distribution</CardTitle>
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
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="range" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar 
              dataKey="count" 
              fill={selectedBowlerId === 'all' ? '#2563EB' : bowlers?.find(b => b.id === selectedBowlerId)?.avatarColor || '#2563EB'} 
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
