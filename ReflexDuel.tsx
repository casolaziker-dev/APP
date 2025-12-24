
import React, { useState, useEffect, useRef } from 'react';
import { record2PWin, getStats } from '../services/scoreService';

const ReflexDuel: React.FC = () => {
  const [gameState, setGameState] = useState<'idle' | 'waiting' | 'ready' | 'finished'>('idle');
  const [winner, setWinner] = useState<number | null>(null);
  const [stats, setStats] = useState({ p1: 0, p2: 0 });
  const timerRef = useRef<any>(null);

  useEffect(() => {
    const s = getStats('reflex');
    setStats({ p1: s.p1Wins || 0, p2: s.p2Wins || 0 });
  }, []);

  const startGame = () => {
    setGameState('waiting');
    setWinner(null);
    const delay = 2000 + Math.random() * 3000;
    timerRef.current = setTimeout(() => {
      setGameState('ready');
    }, delay);
  };

  const handleTap = (player: number) => {
    if (gameState === 'waiting') {
      const actualWinner = player === 1 ? 2 : 1;
      setWinner(actualWinner);
      setGameState('finished');
      record2PWin('reflex', actualWinner as 1 | 2);
      if (timerRef.current) clearTimeout(timerRef.current);
    } else if (gameState === 'ready') {
      setWinner(player);
      setGameState('finished');
      record2PWin('reflex', player as 1 | 2);
    }
  };

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  if (gameState === 'idle') {
    return (
      <div className="flex flex-col items-center justify-center h-full pt-10">
        <div className="mb-10 text-center space-y-1">
          <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest">Historial de Duelos</h3>
          <p className="text-white font-black text-2xl">P1 {stats.p1} - {stats.p2} P2</p>
        </div>
        <button
          onClick={startGame}
          className="px-12 py-6 bg-red-500 rounded-3xl text-2xl font-bold text-white shadow-xl animate-pulse active:scale-95"
        >
          INICIAR DUELO
        </button>
        <p className="mt-6 text-slate-500 text-center px-8">
          Colocad el móvil entre los dos. Toca cuando la pantalla cambie de color.
        </p>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col z-50 overflow-hidden bg-slate-950">
      {/* Player 1 Top (Rotated) */}
      <button
        onClick={() => handleTap(1)}
        className={`flex-1 w-full transition-colors flex items-center justify-center transform rotate-180 
          ${gameState === 'ready' ? 'bg-green-500' : 'bg-slate-900'} 
          ${winner === 1 ? 'bg-indigo-600' : winner === 2 ? 'opacity-50' : ''}
        `}
      >
        <div className="flex flex-col items-center">
           <span className="text-4xl font-black text-white uppercase tracking-widest opacity-30">
            {gameState === 'ready' ? '¡YA!' : gameState === 'finished' ? (winner === 1 ? '¡GANASTE!' : 'PERDISTE') : 'ESPERA...'}
          </span>
          {gameState === 'finished' && <span className="text-white/20 mt-2 text-xs font-bold">Total: {getStats('reflex').p1Wins}</span>}
        </div>
      </button>

      {/* Middle Bar */}
      <div className="h-1 bg-slate-800 flex items-center justify-center relative">
        {gameState === 'finished' && (
          <button 
            onClick={() => {
              const s = getStats('reflex');
              setStats({ p1: s.p1Wins || 0, p2: s.p2Wins || 0 });
              startGame();
            }}
            className="absolute z-[100] px-6 py-2 bg-white text-black font-bold rounded-full shadow-2xl active:scale-90"
          >
            OTRA VEZ
          </button>
        )}
      </div>

      {/* Player 2 Bottom */}
      <button
        onClick={() => handleTap(2)}
        className={`flex-1 w-full transition-colors flex items-center justify-center
          ${gameState === 'ready' ? 'bg-green-500' : 'bg-slate-900'} 
          ${winner === 2 ? 'bg-indigo-600' : winner === 1 ? 'opacity-50' : ''}
        `}
      >
        <div className="flex flex-col items-center">
          <span className="text-4xl font-black text-white uppercase tracking-widest opacity-30">
            {gameState === 'ready' ? '¡YA!' : gameState === 'finished' ? (winner === 2 ? '¡GANASTE!' : 'PERDISTE') : 'ESPERA...'}
          </span>
          {gameState === 'finished' && <span className="text-white/20 mt-2 text-xs font-bold">Total: {getStats('reflex').p2Wins}</span>}
        </div>
      </button>
    </div>
  );
};

export default ReflexDuel;
