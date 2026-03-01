import { useState, useEffect } from 'react';
import { useWeeks } from '@/hooks/useWeeks';
import { useSelectedLeague } from '@/contexts/LeagueContext';
import { PredictionEntryNew } from '@/components/predictions/PredictionEntryNew';
import { PredictionResultsNew } from '@/components/predictions/PredictionResultsNew';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { TrendingUp } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export function Predictions() {
  const { selectedLeagueId } = useSelectedLeague();
  const { data: weeks, isLoading } = useWeeks(selectedLeagueId || undefined);
  const [selectedWeekId, setSelectedWeekId] = useState<string>('');

  useEffect(() => {
    if (weeks && weeks.length > 0) {
      const currentValid = weeks.some(w => w.id === selectedWeekId);
      if (!currentValid) {
        setSelectedWeekId(weeks[weeks.length - 1].id);
      }
    } else {
      setSelectedWeekId('');
    }
  }, [weeks, selectedLeagueId]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!weeks || weeks.length === 0) {
    return (
      <div className="container mx-auto px-3 sm:px-4 py-4 max-w-4xl">
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
    <div className="container mx-auto px-3 sm:px-4 py-4 space-y-4 sm:space-y-6 max-w-4xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Predictions</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Predict scores & compete</p>
        </div>
        <Select value={selectedWeekId} onValueChange={setSelectedWeekId}>
          <SelectTrigger className="w-36 sm:w-48 h-9">
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

      {selectedWeek && (
        <Tabs defaultValue="entry">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="entry">Make Predictions</TabsTrigger>
            <TabsTrigger value="results">View Results</TabsTrigger>
          </TabsList>
          
          <TabsContent value="entry" className="mt-4 sm:mt-6">
            <PredictionEntryNew
              weekId={selectedWeek.id}
              weekNumber={selectedWeek.weekNumber}
              predictionsLocked={selectedWeek.predictionsLocked}
            />
          </TabsContent>
          
          <TabsContent value="results" className="mt-4 sm:mt-6">
            <PredictionResultsNew
              weekId={selectedWeek.id}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
