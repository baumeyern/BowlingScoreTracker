import { useState, useEffect } from 'react';
import { useWeeks } from '@/hooks/useWeeks';
import { WeeklyScoreEntry } from '@/components/scores/WeeklyScoreEntry';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { Edit, Calendar } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export function EnterScores() {
  const { data: weeks, isLoading } = useWeeks();
  const [selectedWeekId, setSelectedWeekId] = useState<string>('');

  useEffect(() => {
    if (weeks && weeks.length > 0 && !selectedWeekId) {
      // Default to the latest week
      setSelectedWeekId(weeks[weeks.length - 1].id);
    }
  }, [weeks, selectedWeekId]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!weeks || weeks.length === 0) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <EmptyState
          icon={Edit}
          title="No weeks created yet"
          description="Create a week to start entering scores"
        />
      </div>
    );
  }

  const selectedWeek = weeks.find(w => w.id === selectedWeekId);

  return (
    <div className="container mx-auto p-4 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold mb-2">Enter Scores</h1>
        <p className="text-muted-foreground">Record your team's bowling scores</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Select Week
            </CardTitle>
            <Select value={selectedWeekId} onValueChange={setSelectedWeekId}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {weeks.map(week => (
                  <SelectItem key={week.id} value={week.id}>
                    Week {week.weekNumber} {week.bowlingDate && `(${formatDate(week.bowlingDate)})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        {selectedWeek && (
          <CardContent>
            <div className="text-sm text-muted-foreground mb-4">
              {selectedWeek.bowlingDate && (
                <p>Date: {formatDate(selectedWeek.bowlingDate)}</p>
              )}
              {selectedWeek.isComplete && (
                <p className="text-green-600 dark:text-green-400">✓ Week marked as complete</p>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {selectedWeek && (
        <WeeklyScoreEntry 
          weekId={selectedWeek.id} 
          weekNumber={selectedWeek.weekNumber}
        />
      )}
    </div>
  );
}
