import { useLeagues } from '@/hooks/useLeagues';
import { useSelectedLeague } from '@/contexts/LeagueContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function LeagueSelector() {
  const { data: leagues } = useLeagues();
  const { selectedLeagueId, setSelectedLeagueId } = useSelectedLeague();

  if (!leagues || leagues.length === 0) return null;

  return (
    <Select value={selectedLeagueId} onValueChange={setSelectedLeagueId}>
      <SelectTrigger className="w-32 sm:w-44 h-8 sm:h-9 text-xs sm:text-sm">
        <SelectValue placeholder="League" />
      </SelectTrigger>
      <SelectContent>
        {leagues.map(league => (
          <SelectItem key={league.id} value={league.id}>
            <div className="flex items-center gap-2">
              <span>{league.name}</span>
              {!league.isActive && (
                <span className="text-xs text-muted-foreground">(ended)</span>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
