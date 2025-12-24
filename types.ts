
export type Sector = '1P' | '2P' | 'HOME';

export interface Game {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  players: 1 | 2;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export interface GameStats {
  highScore?: number;     // For Quiz (Higher is better)
  bestMoves?: number;     // For Memory (Lower is better)
  p1Wins?: number;        // For 2P
  p2Wins?: number;        // For 2P
  draws?: number;         // For 2P
  totalPlayed: number;
}
