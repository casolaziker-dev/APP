
import React from 'react';
import { Game, GameStats } from '../types';
import { getStats } from '../services/scoreService';

interface GameListProps {
  games: Game[];
  onSelectGame: (game: Game) => void;
  isDark: boolean;
}

const GameList: React.FC<GameListProps> = ({ games, onSelectGame, isDark }) => {
  return (
    <div className="flex flex-col space-y-4 pt-4">
      {games.map((game) => {
        const stats = getStats(game.id);
        
        return (
          <button
            key={game.id}
            onClick={() => onSelectGame(game)}
            className={`flex items-center p-4 rounded-2xl border transition-all active:scale-95 group
              ${isDark 
                ? 'bg-slate-900 border-slate-800 hover:border-indigo-500/50' 
                : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'}
            `}
          >
            <div className={`w-14 h-14 ${game.color} rounded-xl flex items-center justify-center text-3xl shadow-lg shadow-black/10 group-hover:rotate-12 transition-transform`}>
              {game.icon}
            </div>
            <div className="ml-4 text-left flex-1">
              <h4 className={`font-bold text-lg leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{game.title}</h4>
              <p className={`text-xs line-clamp-1 mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{game.description}</p>
              
              {/* Stats Badge */}
              <div className="flex items-center space-x-2">
                {game.players === 1 ? (
                  <>
                    {stats.highScore !== undefined && (
                      <span className="text-[10px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full font-bold border border-purple-500/20">
                        Best: {stats.highScore}
                      </span>
                    )}
                    {stats.bestMoves !== undefined && (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold border border-emerald-500/20">
                        Récord: {stats.bestMoves} movs
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    {stats.totalPlayed > 0 && (
                      <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-bold border border-blue-500/20">
                        P1: {stats.p1Wins || 0} | P2: {stats.p2Wins || 0}
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
            <div className={`ml-2 ${isDark ? 'text-slate-700' : 'text-slate-300'}`}>
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default GameList;
