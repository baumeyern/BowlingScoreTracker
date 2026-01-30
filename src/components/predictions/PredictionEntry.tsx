import { useState, useEffect } from 'react';
import { useBowlers } from '@/hooks/useBowlers';
import { usePredictions, useBatchUpsertPredictions } from '@/hooks/usePredictions';
import { useWeeklySeries } from '@/hooks/useGames';
import { useBowlerStats } from '@/hooks/useStats';
import { PredictionCard } from './PredictionCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { BowlerSelector } from '@/components/layout/BowlerSelector';
import { toast } from 'sonner';
import { isValidSeriesPrediction } from '@/lib/utils';
import type { Prediction } from '@/types';

interface PredictionEntryProps {
  weekId: string;
  weekNumber: number;
  predictionsLocked: boolean;
  currentBowlerId?: string;
}

export function PredictionEntry({ weekId, weekNumber, predictionsLocked, currentBowlerId }: PredictionEntryProps) {
  const [selectedBowlerId, setSelectedBowlerId] = useState(currentBowlerId || '');
  const { data: bowlers, isLoading: bowlersLoading } = useBowlers();
  const { data: existingPredictions, isLoading: predictionsLoading } = usePredictions(weekId, selectedBowlerId);
  const { data: weeklySeries } = useWeeklySeries();
  const { data: statsData } = useBowlerStats();
  const batchUpsert = useBatchUpsertPredictions();

  // State: { targetBowlerId: predictedSeries }
  const [predictions, setPredictions] = useState<Record<string, number | null>>({});

  // Set initial bowler if not set
  useEffect(() => {
    if (!selectedBowlerId && bowlers && bowlers.length > 0) {
      setSelectedBowlerId(bowlers[0].id);
    }
  }, [bowlers, selectedBowlerId]);

  // Initialize predictions from existing data
  useEffect(() => {
    if (bowlers && existingPredictions) {
      const initialPredictions: Record<string, number | null> = {};
      bowlers.forEach(bowler => {
        if (bowler.id !== selectedBowlerId) {
          const existing = existingPredictions.find(p => p.targetId === bowler.id);
          initialPredictions[bowler.id] = existing?.predictedSeries ?? null;
        }
      });
      setPredictions(initialPredictions);
    }
  }, [bowlers, existingPredictions, selectedBowlerId]);

  const handlePredictionChange = (targetBowlerId: string, value: number | null) => {
    setPredictions(prev => ({
      ...prev,
      [targetBowlerId]: value,
    }));
  };

  const handleSave = async () => {
    if (!selectedBowlerId) {
      toast.error('Please select a bowler');
      return;
    }

    const predictionsToUpsert: Omit<Prediction, 'id' | 'createdAt' | 'updatedAt'>[] = [];

    Object.entries(predictions).forEach(([targetId, predictedSeries]) => {
      if (predictedSeries !== null) {
        if (!isValidSeriesPrediction(predictedSeries)) {
          toast.error(`Invalid prediction for ${bowlers?.find(b => b.id === targetId)?.name}: ${predictedSeries}`);
          return;
        }
        predictionsToUpsert.push({
          weekId,
          predictorId: selectedBowlerId,
          targetId,
          predictedSeries,
        });
      }
    });

    if (predictionsToUpsert.length === 0) {
      toast.error('No predictions to save');
      return;
    }

    try {
      await batchUpsert.mutateAsync(predictionsToUpsert);
      toast.success(`Saved ${predictionsToUpsert.length} predictions!`);
    } catch (error) {
      console.error('Error saving predictions:', error);
      toast.error('Failed to save predictions');
    }
  };

  if (bowlersLoading || predictionsLoading) {
    return <LoadingSpinner />;
  }

  if (!bowlers || bowlers.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">No bowlers found.</p>
        </CardContent>
      </Card>
    );
  }

  const targetBowlers = bowlers.filter(b => b.id !== selectedBowlerId);
  const lastWeekNumber = weekNumber - 1;

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">You are:</Label>
            <BowlerSelector
              value={selectedBowlerId}
              onChange={setSelectedBowlerId}
              className="w-48"
            />
          </div>
          {predictionsLocked && (
            <p className="text-sm text-amber-600 mt-2 flex items-center gap-2">
              🔒 Predictions are locked for this week
            </p>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        {targetBowlers.map(bowler => {
          const stats = statsData?.find(s => s.bowlerId === bowler.id);
          const lastWeekData = weeklySeries?.find(
            s => s.bowlerId === bowler.id && s.weekNumber === lastWeekNumber
          );

          return (
            <PredictionCard
              key={bowler.id}
              targetBowler={bowler}
              value={predictions[bowler.id] ?? null}
              onChange={(v) => handlePredictionChange(bowler.id, v)}
              disabled={predictionsLocked}
              average={stats?.average}
              lastWeekSeries={lastWeekData?.seriesTotal}
            />
          );
        })}
      </div>

      <Button
        onClick={handleSave}
        disabled={batchUpsert.isPending || predictionsLocked}
        className="w-full h-12 text-lg"
        size="lg"
      >
        {batchUpsert.isPending ? 'Saving...' : 'Submit Predictions'}
      </Button>
    </div>
  );
}
