import { Card } from '@/components/ui/card';
import { BowlerAvatar } from '@/components/common/BowlerAvatar';
import { calculateSeriesWithHandicap } from '@/lib/handicap';

interface SeriesSummaryProps {
  gameScores: (number | null)[];
  handicap: number;
  bowlerName: string;
  bowlerColor: string;
  bowlerPictureUrl?: string;
}

export function SeriesSummary({ gameScores, handicap, bowlerName, bowlerColor, bowlerPictureUrl }: SeriesSummaryProps) {
  const validScores = gameScores.filter((s): s is number => s !== null);
  const series = validScores.length > 0 
    ? calculateSeriesWithHandicap(validScores, handicap)
    : { scratch: 0, withHandicap: 0 };

  const gamesEntered = validScores.length;

  return (
    <Card className="p-4 bg-gradient-to-br from-background to-muted/20">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BowlerAvatar
            bowler={{ name: bowlerName, avatarColor: bowlerColor, profilePictureUrl: bowlerPictureUrl }}
            size="xs"
            className="!h-4 !w-4"
          />
          <h3 className="font-semibold text-lg">{bowlerName}</h3>
        </div>
        <div className="text-right text-sm text-muted-foreground">
          HC: {handicap}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-center">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Scratch Series</p>
          <p className="text-2xl font-bold">{series.scratch}</p>
          <p className="text-xs text-muted-foreground">({gamesEntered}/3 games)</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">With Handicap</p>
          <p className="text-2xl font-bold text-primary">{series.withHandicap}</p>
          <p className="text-xs text-muted-foreground">+{handicap * gamesEntered}</p>
        </div>
      </div>
    </Card>
  );
}
