import { Input } from '@/components/ui/input';
import { cn, isValidScore } from '@/lib/utils';

interface GamePredictionInputProps {
  gameNumber: 1 | 2 | 3;
  value: number | null;
  onChange: (value: number | null) => void;
  disabled?: boolean;
  targetName: string;
}

export function GamePredictionInput({ 
  gameNumber, 
  value, 
  onChange, 
  disabled,
  targetName 
}: GamePredictionInputProps) {
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

  const isInvalid = value !== null && !isValidScore(value);

  return (
    <div className="flex flex-col items-center flex-1 max-w-24">
      <span className="mb-1 text-[10px] sm:text-xs font-medium text-muted-foreground">
        Game {gameNumber}
      </span>
      <Input
        id={`predict-${targetName}-game-${gameNumber}`}
        type="number"
        inputMode="numeric"
        pattern="[0-9]*"
        min="0"
        max="300"
        value={value ?? ''}
        onChange={handleChange}
        disabled={disabled}
        className={cn(
          'w-full h-12 sm:h-14 text-center text-lg font-bold rounded-xl bg-muted/30 border-border/50 focus:border-primary/50 focus:bg-primary/5 transition-colors',
          isInvalid && 'border-destructive focus-visible:ring-destructive'
        )}
        placeholder="—"
      />
      {isInvalid && (
        <p className="text-[10px] text-destructive mt-1">0-300</p>
      )}
    </div>
  );
}
