
import React, { useState, useEffect, useRef } from 'react';
import { record2PWin } from '../services/scoreService';

const MashBattle: React.FC = () => {
  const [progress, setProgress] = useState(50); // 0 to 100, 50 is center
  const [winner, setWinner] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(3);
  const timerRef = useRef<any>(null);

  const startRace = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    setWinner(null);
    setProgress(50);
    let count = 3;
    setCountdown(count);

    timerRef.current = setInterval(() => {
      count--;
      setCountdown(count);
      
      if (count <= 0) {
        clearInterval(timerRef.current);
      }
    }, 1000);
  };

  const handleMash = (player: 1 | 2) => {
    // Solo permitir machacar si no hay ganador y el contador ha terminado
    if (winner || countdown > 0) return;
    
    setProgress(prev => {
      const step = 2.5; // Un poco más rápido para mayor dinamismo
      const next = player === 1 ? prev - step : prev + step;
      
      if (next <= 0) {
        setWinner(1);
        record2PWin('mash-battle', 1);
        return 0;
      }
      if (next >= 100) {
        setWinner(2);
        record2PWin('mash-battle', 2);
        return 100;
      }
      return next;
    });
  };

  useEffect(() => {
    startRace();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col h-full bg-slate-950 relative overflow-hidden select-none">
      {/* Player 1 (Blue) - Rotated for facing player */}
      <button 
        onMouseDown={() => handleMash(1)}
        onTouchStart={(e) => { e.preventDefault(); handleMash(1); }}
        className={`flex-1 w-full transition-colors flex flex-col items-center justify-center rotate-180
          ${winner === 1 ? 'bg-blue-600/40' : 'bg-blue-600/10 active:bg-blue-600/30'}
        `}
      >
        <div className="text-center p-8 pointer-events-none">
           <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.5em] mb-4">Jugador 1</p>
           <h2 className="text-5xl font-black text-white italic">¡MACHACA!</h2>
        </div>
      </button>

      {/* Central Battle Bar */}
      <div className="h-10 bg-slate-900 relative shadow-[0_0_50px_rgba(0,0,0,0.5)] z-20 border-y border-slate-800">
        <div 
          className="absolute top-0 bottom-0 left-0 transition-all duration-75 flex items-center justify-end"
          style={{ width: `${progress}%`, backgroundColor: '#3b82f6', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5), 0 0 15px #3b82f6' }}
        >
          <div className="w-1 h-full bg-white opacity-30" />
        </div>
        <div 
          className="absolute top-0 bottom-0 right-0 transition-all duration-75 flex items-center justify-start"
          style={{ width: `${100 - progress}%`, backgroundColor: '#ef4444', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5), 0 0 15px #ef4444' }}
        >
          <div className="w-1 h-full bg-white opacity-30" />
        </div>
        
        {/* Pointer / Marker */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 w-8 h-12 bg-white rounded-lg z-30 shadow-2xl transition-all duration-75 flex items-center justify-center border-4 border-slate-950"
          style={{ left: `calc(${progress}% - 16px)` }}
        >
          <div className="w-1 h-6 bg-slate-400 rounded-full" />
        </div>
      </div>

      {/* Player 2 (Red) */}
      <button 
        onMouseDown={() => handleMash(2)}
        onTouchStart={(e) => { e.preventDefault(); handleMash(2); }}
        className={`flex-1 w-full transition-colors flex flex-col items-center justify-center
          ${winner === 2 ? 'bg-red-600/40' : 'bg-red-600/10 active:bg-red-600/30'}
        `}
      >
        <div className="text-center p-8 pointer-events-none">
           <h2 className="text-5xl font-black text-white italic">¡MACHACA!</h2>
           <p className="text-red-400 text-[10px] font-black uppercase tracking-[0.5em] mt-4">Jugador 2</p>
        </div>
      </button>

      {/* Overlays */}
      {countdown > 0 && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md">
           <div className="relative">
             <div className="text-[12rem] font-black text-white animate-ping opacity-10 absolute inset-0 flex items-center justify-center">{countdown}</div>
             <div className="text-[10rem] font-black text-white italic drop-shadow-[0_0_30px_rgba(255,255,255,0.4)] relative">{countdown}</div>
           </div>
        </div>
      )}

      {winner && (
        <div className="absolute inset-0 z-[60] flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-xl p-8 text-center animate-in fade-in zoom-in duration-300">
           <div className="text-8xl mb-6 drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">{winner === 1 ? '🔵' : '🔴'}</div>
           <h2 className="text-5xl font-black text-white italic mb-2 tracking-tighter">¡VICTORIA!</h2>
           <p className={`text-xl font-bold mb-10 tracking-widest uppercase ${winner === 1 ? 'text-blue-400' : 'text-red-400'}`}>
             EL JUGADOR {winner} TIENE MEJORES REFLEJOS
           </p>
           <button 
            onClick={startRace} 
            className="bg-white text-slate-950 px-12 py-5 rounded-2xl font-black text-2xl shadow-[0_0_40px_rgba(255,255,255,0.3)] active:scale-95 transition-all"
           >
             REPETIR DUELO
           </button>
        </div>
      )}
    </div>
  );
};

export default MashBattle;
