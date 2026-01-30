import { useBowlers } from '@/hooks/useBowlers';
import { useBowlerStats } from '@/hooks/useStats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
        <CardHeader>
          <CardTitle>Team Comparison</CardTitle>
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
        <CardTitle>Team Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="average" fill="#2563EB" name="Average" />
            <Bar dataKey="highGame" fill="#F59E0B" name="High Game" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
