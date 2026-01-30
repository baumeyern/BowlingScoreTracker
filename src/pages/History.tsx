import { ScoreHistory } from '@/components/scores/ScoreHistory';

export function History() {
  return (
    <div className="container mx-auto p-4 space-y-6 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold mb-2">Score History</h1>
        <p className="text-muted-foreground">View all past weeks and scores</p>
      </div>

      <ScoreHistory />
    </div>
  );
}
