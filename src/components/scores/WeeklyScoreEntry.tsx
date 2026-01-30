import { useState, useEffect } from 'react';
import { useBowlers } from '@/hooks/useBowlers';
import { useGames, useBatchUpsertGames } from '@/hooks/useGames';
import { useBowlerStats } from '@/hooks/useStats';
import { GameScoreInput } from './GameScoreInput';
import { SeriesSummary } from './SeriesSummary';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { toast } from 'sonner';
import { isValidScore } from '@/lib/utils';
import type { Game } from '@/types';

interface WeeklyScoreEntryProps {
  weekId: string;
  weekNumber: number;
}

export function WeeklyScoreEntry({ weekId, weekNumber }: WeeklyScoreEntryProps) {
  const { data: bowlers, isLoading: bowlersLoading } = useBowlers();
  const { data: existingGames, isLoading: gamesLoading } = useGames(weekId);
  const { data: statsData } = useBowlerStats();
  const batchUpsert = useBatchUpsertGames();

  // State: { bowlerId: { 1: score, 2: score, 3: score } }
  const [scores, setScores] = useState<Record<string, Record<1 | 2 | 3, number | null>>>({});

  // Initialize scores from existing games
  useEffect(() => {
    if (bowlers && existingGames) {
      const initialScores: Record<string, Record<1 | 2 | 3, number | null>> = {};
      bowlers.forEach(bowler => {
        initialScores[bowler.id] = { 1: null, 2: null, 3: null };
        existingGames
          .filter((g: Game) => g.bowlerId === bowler.id)
          .forEach((g: Game) => {
            initialScores[bowler.id][g.gameNumber] = g.score;
          });
      });
      setScores(initialScores);
    }
  }, [bowlers, existingGames]);

  const handleScoreChange = (bowlerId: string, gameNumber: 1 | 2 | 3, value: number | null) => {
    setScores(prev => ({
      ...prev,
      [bowlerId]: {
        ...prev[bowlerId],
        [gameNumber]: value,
      },
    }));
  };

  const handleSave = async () => {
    const gamesToUpsert: Omit<Game, 'id' | 'createdAt' | 'updatedAt'>[] = [];

    Object.entries(scores).forEach(([bowlerId, bowlerScores]) => {
      ([1, 2, 3] as const).forEach(gameNumber => {
        const score = bowlerScores[gameNumber];
        if (score !== null) {
          if (!isValidScore(score)) {
            toast.error(`Invalid score for game ${gameNumber}: ${score}`);
            return;
          }
          gamesToUpsert.push({
            weekId,
            bowlerId,
            gameNumber,
            score,
          });
        }
      });
    });

    if (gamesToUpsert.length === 0) {
      toast.error('No scores to save');
      return;
    }

    try {
      await batchUpsert.mutateAsync(gamesToUpsert);
      toast.success(`Saved ${gamesToUpsert.length} scores!`);
    } catch (error) {
      console.error('Error saving scores:', error);
      toast.error('Failed to save scores');
    }
  };

  if (bowlersLoading || gamesLoading) {
    return <LoadingSpinner />;
  }

  if (!bowlers || bowlers.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">No bowlers found. Please add bowlers first.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {bowlers.map(bowler => {
        const bowlerScores = scores[bowler.id] || { 1: null, 2: null, 3: null };
        const stats = statsData?.find(s => s.bowlerId === bowler.id);
        const handicap = stats?.handicap || 0;
        const average = stats?.average || 0;

        return (
          <Card key={bowler.id}>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: bowler.avatarColor }}
                  >
                    {bowler.name.charAt(0)}
                  </div>
                  <div>
                    <CardTitle className="text-xl">{bowler.name}</CardTitle>
                    {bowler.nickname && (
                      <p className="text-sm text-muted-foreground">{bowler.nickname}</p>
                    )}
                  </div>
                </div>
                <div className="text-right text-sm">
                  <p className="text-muted-foreground">Avg: <span className="font-semibold text-foreground">{average.toFixed(1)}</span></p>
                  <p className="text-muted-foreground">HC: <span className="font-semibold text-foreground">{handicap}</span></p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center gap-4 flex-wrap sm:flex-nowrap">
                <GameScoreInput
                  gameNumber={1}
                  value={bowlerScores[1]}
                  onChange={(v) => handleScoreChange(bowler.id, 1, v)}
                />
                <GameScoreInput
                  gameNumber={2}
                  value={bowlerScores[2]}
                  onChange={(v) => handleScoreChange(bowler.id, 2, v)}
                />
                <GameScoreInput
                  gameNumber={3}
                  value={bowlerScores[3]}
                  onChange={(v) => handleScoreChange(bowler.id, 3, v)}
                />
              </div>

              <SeriesSummary
                gameScores={[bowlerScores[1], bowlerScores[2], bowlerScores[3]]}
                handicap={handicap}
                bowlerName={bowler.name}
                bowlerColor={bowler.avatarColor}
              />
            </CardContent>
          </Card>
        );
      })}

      <Button
        onClick={handleSave}
        disabled={batchUpsert.isPending}
        className="w-full h-12 text-lg"
        size="lg"
      >
        {batchUpsert.isPending ? 'Saving...' : 'Save All Scores'}
      </Button>
    </div>
  );
}
