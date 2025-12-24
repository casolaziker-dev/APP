
import { GameStats } from "../types";

const PREFIX = "minijuegos_stats_";

export const getStats = (gameId: string): GameStats => {
  const saved = localStorage.getItem(PREFIX + gameId);
  if (saved) {
    return JSON.parse(saved);
  }
  return { totalPlayed: 0 };
};

export const saveStats = (gameId: string, stats: GameStats) => {
  localStorage.setItem(PREFIX + gameId, JSON.stringify(stats));
};

export const record1PScore = (gameId: string, score: number, type: 'high' | 'low') => {
  const stats = getStats(gameId);
  stats.totalPlayed += 1;
  
  if (type === 'high') {
    if (stats.highScore === undefined || score > stats.highScore) {
      stats.highScore = score;
    }
  } else {
    if (stats.bestMoves === undefined || score < stats.bestMoves) {
      stats.bestMoves = score;
    }
  }
  
  saveStats(gameId, stats);
  return stats;
};

export const record2PWin = (gameId: string, winner: 1 | 2 | 'draw') => {
  const stats = getStats(gameId);
  stats.totalPlayed += 1;
  
  if (winner === 1) stats.p1Wins = (stats.p1Wins || 0) + 1;
  else if (winner === 2) stats.p2Wins = (stats.p2Wins || 0) + 1;
  else stats.draws = (stats.draws || 0) + 1;
  
  saveStats(gameId, stats);
  return stats;
};
