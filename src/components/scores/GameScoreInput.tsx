import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn, isValidScore } from '@/lib/utils';

interface GameScoreInputProps {
  gameNumber: 1 | 2 | 3;
  value: number | null;
  onChange: (value: number | null) => void;
  disabled?: boolean;
}

export function GameScoreInput({ gameNumber, value, onChange, disabled }: GameScoreInputProps) {
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
      <Label htmlFor={`game-${gameNumber}`} className="mb-2 text-sm font-medium">
        Game {gameNumber}
      </Label>
      <Input
        id={`game-${gameNumber}`}
        type="number"
        min="0"
        max="300"
        value={value ?? ''}
        onChange={handleChange}
        disabled={disabled}
        className={cn(
          'w-24 h-16 text-center text-2xl font-bold',
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
