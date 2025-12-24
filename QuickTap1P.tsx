
import React, { useState, useEffect, useRef } from 'react';
import { record1PScore, getStats } from '../services/scoreService';

const QuickTap1P: React.FC = () => {
  const [gameState, setGameState] = useState<'idle' | 'waiting' | 'ready' | 'result' | 'early'>('idle');
  const [startTime, setStartTime] = useState(0);
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [bestTime, setBestTime] = useState<number | null>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    const stats = getStats('quick-tap-1p');
    setBestTime(stats.bestMoves || null); // Using bestMoves for lowest reaction time record
  }, []);

  const startTest = () => {
    setGameState('waiting');
    setReactionTime(null);
    const delay = 1000 + Math.random() * 4000;
    timerRef.current = setTimeout(() => {
      setGameState('ready');
      setStartTime(Date.now());
    }, delay);
  };

  const handleTap = () => {
    if (gameState === 'waiting') {
      clearTimeout(timerRef.current);
      setGameState('early');
    } else if (gameState === 'ready') {
      const time = Date.now() - startTime;
      setReactionTime(time);
      setGameState('result');
      record1PScore('quick-tap-1p', time, 'low');
      
      if (!bestTime || time < bestTime) {
        setBestTime(time);
      }
    }
  };

  return (
    <div 
      className={`flex flex-col h-full items-center justify-center p-8 transition-colors duration-150 cursor-pointer select-none
        ${gameState === 'idle' ? 'bg-slate-950' : ''}
        ${gameState === 'waiting' ? 'bg-red-600' : ''}
        ${gameState === 'ready' ? 'bg-emerald-500' : ''}
        ${gameState === 'result' ? 'bg-indigo-600' : ''}
        ${gameState === 'early' ? 'bg-slate-900' : ''}
      `}
      onClick={gameState === 'idle' || gameState === 'result' || gameState === 'early' ? startTest : handleTap}
    >
      <div className="text-center">
        {gameState === 'idle' && (
          <>
            <div className="text-6xl mb-6">🎯</div>
            <h2 className="text-3xl font-black text-white mb-2">TEST DE REFLEJOS</h2>
            <p className="text-slate-400 mb-8">Toca la pantalla cuando cambie a verde lo más rápido posible.</p>
            <button className="bg-white text-slate-950 px-10 py-4 rounded-2xl font-black text-xl active:scale-95 transition-transform">COMENZAR</button>
          </>
        )}

        {gameState === 'waiting' && (
          <h2 className="text-5xl font-black text-white animate-pulse">ESPERA...</h2>
        )}

        {gameState === 'ready' && (
          <h2 className="text-8xl font-black text-white italic">¡TOCA YA!</h2>
        )}

        {gameState === 'result' && (
          <>
            <h2 className="text-2xl font-bold text-white mb-1 opacity-70">TU TIEMPO</h2>
            <div className="text-8xl font-black text-white mb-4">{reactionTime}ms</div>
            {reactionTime && bestTime && reactionTime <= bestTime && (
              <p className="text-yellow-300 font-bold mb-8 animate-bounce">¡NUEVO MEJOR TIEMPO!</p>
            )}
            <p className="text-white/60 mb-8">Toca para intentar de nuevo</p>
          </>
        )}

        {gameState === 'early' && (
          <>
            <h2 className="text-4xl font-black text-red-500 mb-4">¡MUY PRONTO!</h2>
            <p className="text-slate-400 mb-8">Has tocado antes de que cambiara a verde.</p>
            <button className="bg-slate-800 text-white px-8 py-3 rounded-xl font-bold">REINTENTAR</button>
          </>
        )}
      </div>

      {(gameState === 'idle' || gameState === 'result' || gameState === 'early') && bestTime && (
        <div className="absolute bottom-10 px-6 py-2 bg-black/30 rounded-full border border-white/10">
          <span className="text-xs font-bold text-white/50 uppercase tracking-widest">RÉCORD PERSONAL: </span>
          <span className="text-xs font-black text-emerald-400">{bestTime}ms</span>
        </div>
      )}
    </div>
  );
};

export default QuickTap1P;
