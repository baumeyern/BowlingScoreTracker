import { ScoreHistory } from '@/components/scores/ScoreHistory';

export function History() {
  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 space-y-4 sm:space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-1">Score History</h1>
        <p className="text-sm sm:text-base text-muted-foreground">View all past weeks and scores</p>
      </div>

      <ScoreHistory />
    </div>
  );
}
