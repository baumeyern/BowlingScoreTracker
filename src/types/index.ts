export interface Bowler {
  id: string;
  name: string;
  nickname?: string;
  pinCode?: string;
  avatarColor: string;
  createdAt: string;
}

export interface Week {
  id: string;
  weekNumber: number;
  bowlingDate?: string;
  isComplete: boolean;
  predictionsLocked: boolean;
  createdAt: string;
}

export interface Game {
  id: string;
  weekId: string;
  bowlerId: string;
  gameNumber: 1 | 2 | 3;
  score: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Prediction {
  id: string;
  weekId: string;
  predictorId: string;
  targetId: string;
  gameNumber: 1 | 2 | 3;
  predictedScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface BowlerStats {
  bowlerId: string;
  totalGames: number;
  average: number;
  handicap: number;
  highGame: number;
  lowGame: number;
  totalPins: number;
}

export interface WeeklySeries {
  weekId: string;
  bowlerId: string;
  weekNumber: number;
  seriesTotal: number;
  gameScores: number[];
  gamesEntered: number;
}

export interface PredictionResult {
  predictorId: string;
  weekId: string;
  weekNumber: number;
  targetId: string;
  gameNumber: 1 | 2 | 3;
  predictedScore: number;
  actualScore: number | null;
  difference: number | null;
  points: number | null;
}

export interface PredictionLeaderboardEntry {
  bowlerId: string;
  totalPoints: number;
  avgDifference: number;
  predictionsCount: number;
}
