import { useState } from 'react';
import { useBowlers } from '@/hooks/useBowlers';
import { useBowlerGames } from '@/hooks/useGames';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border/50 bg-popover/95 backdrop-blur-sm p-3 shadow-xl">
      <p className="text-xs font-semibold text-foreground mb-1">{label}</p>
      <p className="text-xs text-muted-foreground">{payload[0].value} games</p>
    </div>
  );
};

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

  const buckets = [
    { range: '<120', min: 0, max: 119 },
    { range: '120s', min: 120, max: 139 },
    { range: '140s', min: 140, max: 159 },
    { range: '160s', min: 160, max: 179 },
    { range: '180s', min: 180, max: 199 },
    { range: '200s', min: 200, max: 219 },
    { range: '220s', min: 220, max: 239 },
    { range: '240s', min: 240, max: 259 },
    { range: '260+', min: 260, max: 300 },
  ];

  const baseColor = selectedBowlerId === 'all' ? '#06b6d4' : bowlers?.find(b => b.id === selectedBowlerId)?.avatarColor || '#06b6d4';

  const chartData = buckets.map(bucket => {
    const dataPoint: any = { range: bucket.range };
    
    if (selectedBowlerId === 'all') {
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
      const bowlerData = bowlerGamesQueries.find(q => q.bowler.id === selectedBowlerId);
      const count = bowlerData?.games.filter(
        (game: any) => game.score >= bucket.min && game.score <= bucket.max
      ).length || 0;
      dataPoint.count = count;
    }
    
    return dataPoint;
  });

  const maxCount = Math.max(...chartData.map(d => d.count), 1);

  return (
    <Card>
      <CardHeader className="px-3 sm:px-6 pt-4 sm:pt-6 pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base sm:text-lg">Distribution</CardTitle>
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
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData} margin={{ left: 0, right: 5, top: 10, bottom: 5 }}>
            <defs>
              <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={baseColor} stopOpacity={0.9} />
                <stop offset="100%" stopColor={baseColor} stopOpacity={0.4} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(230 20% 18%)" vertical={false} />
            <XAxis dataKey="range" tick={{ fontSize: 10, fill: 'hsl(215 20% 55%)' }} interval={0} angle={-35} textAnchor="end" height={50} axisLine={{ stroke: 'hsl(230 20% 18%)' }} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'hsl(215 20% 55%)' }} width={35} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(230 20% 14% / 0.5)' }} />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={index} fill={baseColor} fillOpacity={0.3 + (entry.count / maxCount) * 0.7} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
