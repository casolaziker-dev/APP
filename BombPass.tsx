
import React, { useState, useEffect, useRef } from 'react';
import { record2PWin } from '../services/scoreService';

const BombPass: React.FC = () => {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'exploded'>('idle');
  const [holder, setHolder] = useState<1 | 2>(1);
  const [timeLeft, setTimeLeft] = useState(0);
  const [winner, setWinner] = useState<number | null>(null);
  const timerRef = useRef<any>(null);

  const startGame = () => {
    setGameState('playing');
    setHolder(Math.random() > 0.5 ? 1 : 2);
    const duration = 5 + Math.random() * 10; // 5 to 15 seconds
    setTimeLeft(duration);
    
    if (timerRef.current) clearInterval(timerRef.current);
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0.1) {
          clearInterval(timerRef.current);
          explode();
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);
  };

  const explode = () => {
    setGameState('exploded');
    // The winner is the one who ISN'T holding the bomb
    // But since we update holder on click, at the moment of explosion, 
    // the current holder is the loser.
  };

  useEffect(() => {
    if (gameState === 'exploded') {
      const win = holder === 1 ? 2 : 1;
      setWinner(win);
      record2PWin('bomb-pass', win as 1 | 2);
    }
  }, [gameState]);

  const passBomb = (player: 1 | 2) => {
    if (gameState !== 'playing' || holder !== player) return;
    setHolder(player === 1 ? 2 : 1);
  };

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  const bombScale = gameState === 'playing' ? 1 + (1 / (timeLeft + 1)) * 0.5 : 1;
  const bombColor = timeLeft < 3 ? 'text-red-500' : timeLeft < 6 ? 'text-orange-500' : 'text-yellow-500';

  return (
    <div className="flex flex-col h-full bg-slate-950 overflow-hidden relative">
      {/* Player 1 Area (Top) */}
      <button 
        onClick={() => passBomb(1)}
        className={`flex-1 w-full transition-colors flex flex-col items-center justify-center rotate-180
          ${holder === 1 && gameState === 'playing' ? 'bg-blue-600/20' : 'bg-slate-900/40'}
          ${gameState === 'exploded' && holder === 1 ? 'bg-red-900/60' : ''}
        `}
      >
        <span className="text-xs font-black text-blue-400 mb-4 tracking-widest uppercase">Jugador 1</span>
        {holder === 1 && gameState === 'playing' && <span className="text-xl font-bold text-white animate-bounce">¡TOCA PARA PASAR!</span>}
        {gameState === 'exploded' && holder === 1 && <span className="text-3xl font-black text-red-500">💥 ¡BOOM! 💥</span>}
      </button>

      {/* Bomb Center */}
      <div className="h-48 bg-slate-900 border-y-4 border-slate-800 flex items-center justify-center relative z-10 shadow-2xl">
        {gameState === 'idle' ? (
          <button 
            onClick={startGame}
            className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black text-xl shadow-[0_0_30px_rgba(79,70,229,0.4)] active:scale-95 transition-all"
          >
            EMPEZAR
          </button>
        ) : (
          <div 
            className={`text-8xl transition-all duration-100 ${bombColor} ${gameState === 'playing' ? 'animate-pulse' : ''}`}
            style={{ transform: `scale(${bombScale}) rotate(${gameState === 'playing' ? Math.random() * 5 - 2.5 : 0}deg)` }}
          >
            {gameState === 'exploded' ? '🔥' : '💣'}
          </div>
        )}
      </div>

      {/* Player 2 Area (Bottom) */}
      <button 
        onClick={() => passBomb(2)}
        className={`flex-1 w-full transition-colors flex flex-col items-center justify-center
          ${holder === 2 && gameState === 'playing' ? 'bg-red-600/20' : 'bg-slate-900/40'}
          ${gameState === 'exploded' && holder === 2 ? 'bg-red-900/60' : ''}
        `}
      >
        <span className="text-xs font-black text-red-400 mb-4 tracking-widest uppercase">Jugador 2</span>
        {holder === 2 && gameState === 'playing' && <span className="text-xl font-bold text-white animate-bounce">¡TOCA PARA PASAR!</span>}
        {gameState === 'exploded' && holder === 2 && <span className="text-3xl font-black text-red-500">💥 ¡BOOM! 💥</span>}
      </button>

      {gameState === 'exploded' && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
           <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 text-center shadow-2xl animate-in zoom-in duration-300">
             <h2 className="text-4xl font-black text-white mb-2">¡PARTIDA!</h2>
             <p className="text-indigo-400 text-xl font-bold mb-6 uppercase">Ganador: P{winner}</p>
             <button onClick={() => setGameState('idle')} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold shadow-lg">OTRA VEZ</button>
           </div>
        </div>
      )}
    </div>
  );
};

export default BombPass;
