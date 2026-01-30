import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { GamePredictionInput } from './GamePredictionInput';
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
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-4 gap-3">
          <div className="flex items-center gap-3 flex-1">
            <div
              className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
              style={{ backgroundColor: targetBowler.avatarColor }}
            >
              {targetBowler.name.charAt(0)}
            </div>
            <div className="flex-1">
              <Label className="text-base font-semibold break-words">{targetBowler.name}</Label>
              {targetBowler.nickname && (
                <p className="text-xs text-muted-foreground break-words">{targetBowler.nickname}</p>
              )}
            </div>
          </div>
          <div className="text-right text-sm flex-shrink-0">
            {average !== undefined && (
              <p className="text-muted-foreground whitespace-nowrap">Avg: <span className="font-semibold">{average.toFixed(1)}</span></p>
            )}
            {lastWeekScores && (
              <p className="text-xs text-muted-foreground whitespace-nowrap">
                Last: {lastWeekScores[0]}, {lastWeekScores[1]}, {lastWeekScores[2]}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-center mb-3">Predict each game:</p>
          <div className="flex justify-center gap-3">
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
          <p className="text-xs text-muted-foreground text-center mt-2">
            💡 Predicted series: {(game1 || 0) + (game2 || 0) + (game3 || 0)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
