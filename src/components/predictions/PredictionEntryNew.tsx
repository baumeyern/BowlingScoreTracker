import { useState, useEffect } from 'react';
import { useBowlers } from '@/hooks/useBowlers';
import { usePredictions, useBatchUpsertPredictions } from '@/hooks/usePredictions';
import { useWeeklySeries } from '@/hooks/useGames';
import { useBowlerStats } from '@/hooks/useStats';
import { useSelectedBowler } from '@/contexts/BowlerContext';
import { PredictionCardNew } from './PredictionCardNew';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { BowlerSelector } from '@/components/layout/BowlerSelector';
import { toast } from 'sonner';
import { isValidScore } from '@/lib/utils';
import type { Prediction } from '@/types';

interface PredictionEntryNewProps {
  weekId: string;
  weekNumber: number;
  predictionsLocked: boolean;
}

export function PredictionEntryNew({ weekId, weekNumber, predictionsLocked }: PredictionEntryNewProps) {
  const { selectedBowlerId, setSelectedBowlerId } = useSelectedBowler();
  const { data: bowlers, isLoading: bowlersLoading } = useBowlers();
  const { data: existingPredictions, isLoading: predictionsLoading } = usePredictions(weekId, selectedBowlerId);
  const { data: weeklySeries } = useWeeklySeries();
  const { data: statsData } = useBowlerStats();
  const batchUpsert = useBatchUpsertPredictions();

  // State: { targetBowlerId: { 1: score, 2: score, 3: score } }
  const [predictions, setPredictions] = useState<Record<string, Record<1 | 2 | 3, number | null>>>({});

  useEffect(() => {
    if (bowlers && existingPredictions) {
      const initialPredictions: Record<string, Record<1 | 2 | 3, number | null>> = {};
      bowlers.forEach(bowler => {
        if (bowler.id !== selectedBowlerId) {
          initialPredictions[bowler.id] = { 1: null, 2: null, 3: null };
          existingPredictions
            .filter(p => p.targetId === bowler.id)
            .forEach(p => {
              initialPredictions[bowler.id][p.gameNumber] = p.predictedScore;
            });
        }
      });
      setPredictions(initialPredictions);
    }
  }, [bowlers, existingPredictions, selectedBowlerId]);

  const handlePredictionChange = (targetBowlerId: string, gameNumber: 1 | 2 | 3, value: number | null) => {
    setPredictions(prev => ({
      ...prev,
      [targetBowlerId]: {
        ...prev[targetBowlerId],
        [gameNumber]: value,
      },
    }));
  };

  const handleSave = async () => {
    if (!selectedBowlerId) {
      toast.error('Please select a bowler');
      return;
    }

    const predictionsToUpsert: Omit<Prediction, 'id' | 'createdAt' | 'updatedAt'>[] = [];

    Object.entries(predictions).forEach(([targetId, games]) => {
      ([1, 2, 3] as const).forEach(gameNumber => {
        const predictedScore = games[gameNumber];
        if (predictedScore !== null) {
          if (!isValidScore(predictedScore)) {
            const targetName = bowlers?.find(b => b.id === targetId)?.name;
            toast.error(`Invalid prediction for ${targetName} game ${gameNumber}: ${predictedScore}`);
            return;
          }
          predictionsToUpsert.push({
            weekId,
            predictorId: selectedBowlerId,
            targetId,
            gameNumber,
            predictedScore,
          });
        }
      });
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <Label className="text-sm font-medium">You are:</Label>
            <BowlerSelector
              value={selectedBowlerId}
              onChange={setSelectedBowlerId}
              className="w-full sm:w-48"
            />
          </div>
          {predictionsLocked && (
            <p className="text-sm text-amber-600 mt-3 flex items-center gap-2">
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
          const bowlerPredictions = predictions[bowler.id] || { 1: null, 2: null, 3: null };

          return (
            <PredictionCardNew
              key={bowler.id}
              targetBowler={bowler}
              game1={bowlerPredictions[1]}
              game2={bowlerPredictions[2]}
              game3={bowlerPredictions[3]}
              onGame1Change={(v) => handlePredictionChange(bowler.id, 1, v)}
              onGame2Change={(v) => handlePredictionChange(bowler.id, 2, v)}
              onGame3Change={(v) => handlePredictionChange(bowler.id, 3, v)}
              disabled={predictionsLocked}
              average={stats?.average}
              lastWeekScores={lastWeekData?.gameScores as [number, number, number] | undefined}
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
