import { Card, CardContent } from '@/components/ui/card';
import { GamePredictionInput } from './GamePredictionInput';
import { BowlerAvatar } from '@/components/common/BowlerAvatar';
import type { Bowler } from '@/types';

interface PredictionCardNewProps {
  targetBowler: Bowler;
  game1: number | null;
  game2: number | null;
  game3: number | null;
  onGame1Change: (value: number | null) => void;
  onGame2Change: (value: number | null) => void;
  onGame3Change: (value: number | null) => void;
  disabled?: boolean;
  lastWeekScores?: [number, number, number];
  average?: number;
}

export function PredictionCardNew({ 
  targetBowler, 
  game1,
  game2,
  game3,
  onGame1Change,
  onGame2Change,
  onGame3Change,
  disabled,
  lastWeekScores,
  average 
}: PredictionCardNewProps) {
  return (
    <Card>
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center justify-between mb-3 gap-2">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <BowlerAvatar bowler={targetBowler} size="md" />
            <div className="min-w-0">
              <p className="font-semibold text-sm sm:text-base truncate">{targetBowler.name}</p>
              {targetBowler.nickname && (
                <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{targetBowler.nickname}</p>
              )}
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            {average !== undefined && (
              <p className="text-xs sm:text-sm text-muted-foreground">Avg: <span className="font-semibold">{average.toFixed(1)}</span></p>
            )}
            {lastWeekScores && (
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                Last: {lastWeekScores[0]}, {lastWeekScores[1]}, {lastWeekScores[2]}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-center gap-2 sm:gap-3">
          <GamePredictionInput
            gameNumber={1}
            value={game1}
            onChange={onGame1Change}
            disabled={disabled}
            targetName={targetBowler.name}
          />
          <GamePredictionInput
            gameNumber={2}
            value={game2}
            onChange={onGame2Change}
            disabled={disabled}
            targetName={targetBowler.name}
          />
          <GamePredictionInput
            gameNumber={3}
            value={game3}
            onChange={onGame3Change}
            disabled={disabled}
            targetName={targetBowler.name}
          />
        </div>
        <p className="text-[10px] sm:text-xs text-muted-foreground text-center mt-2 tabular-nums">
          Predicted series: {(game1 || 0) + (game2 || 0) + (game3 || 0)}
        </p>
      </CardContent>
    </Card>
  );
}
