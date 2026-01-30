import { useState, useEffect } from 'react';
import { useWeeks } from '@/hooks/useWeeks';
import { PredictionEntryNew } from '@/components/predictions/PredictionEntryNew';
import { PredictionResultsNew } from '@/components/predictions/PredictionResultsNew';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { TrendingUp, Calendar } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export function Predictions() {
  const { data: weeks, isLoading } = useWeeks();
  const [selectedWeekId, setSelectedWeekId] = useState<string>('');

  useEffect(() => {
    if (weeks && weeks.length > 0 && !selectedWeekId) {
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
          icon={TrendingUp}
          title="No weeks created yet"
          description="Create a week to start making predictions"
        />
      </div>
    );
  }

  const selectedWeek = weeks.find(w => w.id === selectedWeekId);

  return (
    <div className="container mx-auto p-4 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold mb-2">Predictions</h1>
        <p className="text-muted-foreground">Predict your teammates' scores and compete for points</p>
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
      </Card>

      {selectedWeek && (
        <Tabs defaultValue="entry">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="entry">Make Predictions</TabsTrigger>
            <TabsTrigger value="results">View Results</TabsTrigger>
          </TabsList>
          
          <TabsContent value="entry" className="mt-6">
            <PredictionEntryNew
              weekId={selectedWeek.id}
              weekNumber={selectedWeek.weekNumber}
              predictionsLocked={selectedWeek.predictionsLocked}
            />
          </TabsContent>
          
          <TabsContent value="results" className="mt-6">
            <PredictionResultsNew
              weekId={selectedWeek.id}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
