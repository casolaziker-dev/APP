
import React, { useState } from 'react';
import { Game } from '../types';
import { record1PScore, record2PWin } from '../services/scoreService';

const SimplePlaceholder: React.FC<{ game: Game }> = ({ game }) => {
  const [score, setScore] = useState(0);
  const [p1, setP1] = useState(0);
  const [p2, setP2] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const handle1P = () => {
    const newScore = score + 1;
    setScore(newScore);
    if (newScore >= 50) {
      setGameOver(true);
      record1PScore(game.id, newScore, 'high');
    }
  };

  const handle2P = (player: 1 | 2) => {
    if (player === 1) {
      const next = p1 + 1;
      setP1(next);
      if (next >= 30) {
        setGameOver(true);
        record2PWin(game.id, 1);
      }
    } else {
      const next = p2 + 1;
      setP2(next);
      if (next >= 30) {
        setGameOver(true);
        record2PWin(game.id, 2);
      }
    }
  };

  if (gameOver) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-slate-900/50">
        <span className="text-6xl mb-4">🎉</span>
        <h2 className="text-2xl font-bold text-white mb-2">¡Partida Terminada!</h2>
        {game.players === 1 ? (
          <p className="text-slate-400">Puntuación lograda: {score}</p>
        ) : (
          <p className="text-slate-400">Ganador: Jugador {p1 >= 30 ? '1 (Arriba)' : '2 (Abajo)'}</p>
        )}
        <button 
          onClick={() => { setScore(0); setP1(0); setP2(0); setGameOver(false); }}
          className="mt-6 px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl active:scale-95"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-900/20">
      <div className="p-4 text-center">
        <p className="text-slate-500 text-xs font-bold uppercase mb-4">Modo Beta: ¡Toca rápido para ganar!</p>
      </div>

      {game.players === 1 ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="text-6xl font-black text-white mb-10">{score}</div>
          <button 
            onClick={handle1P}
            className={`w-40 h-40 rounded-full ${game.color} shadow-2xl flex items-center justify-center text-5xl active:scale-90 transition-transform`}
          >
            {game.icon}
          </button>
          <p className="mt-8 text-slate-400 text-sm">Llega a 50 para registrar récord</p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          <button 
            onClick={() => handle2P(1)}
            className="flex-1 w-full bg-slate-800 flex flex-col items-center justify-center rotate-180 active:bg-slate-700 transition-colors"
          >
            <span className="text-xs text-slate-500 mb-2 font-bold">JUGADOR 1</span>
            <span className="text-4xl font-black text-white mb-4">{p1}</span>
            <span className="text-4xl">{game.icon}</span>
          </button>
          <div className="h-2 bg-slate-700 w-full" />
          <button 
            onClick={() => handle2P(2)}
            className="flex-1 w-full bg-slate-900 flex flex-col items-center justify-center active:bg-slate-800 transition-colors"
          >
            <span className="text-4xl">{game.icon}</span>
            <span className="text-4xl font-black text-white mt-4">{p2}</span>
            <span className="text-xs text-slate-500 mt-2 font-bold">JUGADOR 2</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default SimplePlaceholder;
