import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { cn, isValidSeriesPrediction } from '@/lib/utils';
import type { Bowler } from '@/types';

interface PredictionCardProps {
  targetBowler: Bowler;
  value: number | null;
  onChange: (value: number | null) => void;
  disabled?: boolean;
  lastWeekSeries?: number;
  average?: number;
}

export function PredictionCard({ 
  targetBowler, 
  value, 
  onChange, 
  disabled,
  lastWeekSeries,
  average 
}: PredictionCardProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '') {
      onChange(null);
      return;
    }
    const num = parseInt(val, 10);
    if (!isNaN(num)) {
      onChange(num);
    }
  };

  const isInvalid = value !== null && !isValidSeriesPrediction(value);
  
  // Calculate typical range based on average (±15%)
  const typicalLow = average ? Math.round(average * 3 * 0.85) : undefined;
  const typicalHigh = average ? Math.round(average * 3 * 1.15) : undefined;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: targetBowler.avatarColor }}
            >
              {targetBowler.name.charAt(0)}
            </div>
            <div>
              <Label className="text-base font-semibold">{targetBowler.name}</Label>
              {targetBowler.nickname && (
                <p className="text-xs text-muted-foreground">{targetBowler.nickname}</p>
              )}
            </div>
          </div>
          <div className="text-right text-sm">
            {average !== undefined && (
              <p className="text-muted-foreground">Avg: <span className="font-semibold">{average.toFixed(1)}</span></p>
            )}
            {lastWeekSeries !== undefined && (
              <p className="text-muted-foreground">Last: <span className="font-semibold">{lastWeekSeries}</span></p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`predict-${targetBowler.id}`}>Your prediction (3-game series)</Label>
          <Input
            id={`predict-${targetBowler.id}`}
            type="number"
            min="0"
            max="900"
            value={value ?? ''}
            onChange={handleChange}
            disabled={disabled}
            placeholder="Enter series total"
            className={cn(
              'text-lg font-semibold text-center h-12',
              isInvalid && 'border-destructive focus-visible:ring-destructive'
            )}
          />
          {isInvalid && (
            <p className="text-xs text-destructive">Must be between 0-900</p>
          )}
          {typicalLow && typicalHigh && !isInvalid && (
            <p className="text-xs text-muted-foreground text-center">
              💡 Typical range: {typicalLow}-{typicalHigh}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
