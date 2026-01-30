import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    <div className="flex flex-col items-center">
      <Label htmlFor={`predict-${targetName}-game-${gameNumber}`} className="mb-2 text-xs font-medium">
        Game {gameNumber}
      </Label>
      <Input
        id={`predict-${targetName}-game-${gameNumber}`}
        type="number"
        min="0"
        max="300"
        value={value ?? ''}
        onChange={handleChange}
        disabled={disabled}
        className={cn(
          'w-20 h-14 text-center text-lg font-bold',
          isInvalid && 'border-destructive focus-visible:ring-destructive'
        )}
        placeholder="---"
      />
      {isInvalid && (
        <p className="text-xs text-destructive mt-1">0-300</p>
      )}
    </div>
  );
}
