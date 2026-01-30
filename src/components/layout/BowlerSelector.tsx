import { useBowlers } from '@/hooks/useBowlers';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import type { Bowler } from '@/types';

interface BowlerSelectorProps {
  value?: string;
  onChange: (bowlerId: string) => void;
  label?: string;
  className?: string;
}

export function BowlerSelector({ value, onChange, label = 'Select Bowler', className }: BowlerSelectorProps) {
  const { data: bowlers, isLoading } = useBowlers();

  if (isLoading) return <LoadingSpinner size="sm" />;

  return (
    <div className={className}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={label} />
        </SelectTrigger>
        <SelectContent>
          {bowlers?.map((bowler: Bowler) => (
            <SelectItem key={bowler.id} value={bowler.id}>
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: bowler.avatarColor }}
                />
                <span>{bowler.name}</span>
                {bowler.nickname && (
                  <span className="text-muted-foreground">({bowler.nickname})</span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
