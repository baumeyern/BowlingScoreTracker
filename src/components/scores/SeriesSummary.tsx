import { Card } from '@/components/ui/card';
import { calculateSeriesWithHandicap } from '@/lib/handicap';

interface SeriesSummaryProps {
  gameScores: (number | null)[];
  handicap: number;
  bowlerName: string;
  bowlerColor: string;
  bowlerPictureUrl?: string;
}

export function SeriesSummary({ gameScores, handicap }: SeriesSummaryProps) {
  const validScores = gameScores.filter((s): s is number => s !== null);
  const series = validScores.length > 0 
    ? calculateSeriesWithHandicap(validScores, handicap)
    : { scratch: 0, withHandicap: 0 };

  const gamesEntered = validScores.length;

  return (
    <Card className="p-3 sm:p-4 bg-gradient-to-br from-primary/5 to-transparent border-primary/10">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 text-center">
        <div>
          <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5">Scratch Series</p>
          <p className="text-xl sm:text-2xl font-bold tabular-nums">{series.scratch}</p>
          <p className="text-[10px] sm:text-xs text-muted-foreground">({gamesEntered}/3 games)</p>
        </div>
        <div>
          <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5">With Handicap</p>
          <p className="text-xl sm:text-2xl font-bold text-primary tabular-nums">{series.withHandicap}</p>
          <p className="text-[10px] sm:text-xs text-muted-foreground tabular-nums">+{handicap * gamesEntered}</p>
        </div>
      </div>
    </Card>
  );
}
