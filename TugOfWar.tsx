
import React, { useState } from 'react';
import { record2PWin } from '../services/scoreService';

const TugOfWar: React.FC = () => {
  const [pos, setPos] = useState(50); // 0 is P1 win, 100 is P2 win
  const [winner, setWinner] = useState<number | null>(null);

  const pull = (p: 1 | 2) => {
    if (winner) return;
    const newPos = p === 1 ? pos - 2 : pos + 2;
    if (newPos <= 0) {
      setWinner(1);
      record2PWin('tug-of-war', 1);
    } else if (newPos >= 100) {
      setWinner(2);
      record2PWin('tug-of-war', 2);
    }
    setPos(newPos);
  };

  const reset = () => {
    setPos(50);
    setWinner(null);
  };

  return (
    <div className="flex flex-col h-full items-center justify-center p-4">
      {/* Zona P1 */}
      <div className="flex-1 w-full flex flex-col items-center justify-center rotate-180 bg-blue-900/10 rounded-t-3xl border border-blue-500/10">
         <button 
           onClick={() => pull(1)} 
           disabled={!!winner} 
           className="w-40 h-24 bg-blue-600 rounded-3xl text-white font-black text-2xl active:scale-95 shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all"
         >
           TIRA
         </button>
      </div>

      {/* Carril de Juego */}
      <div className="w-full h-16 relative bg-slate-800/50 rounded-full my-6 overflow-hidden border border-slate-700">
        {/* Marcador Central (Bolita sustituyendo a la línea) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-yellow-400 rounded-full z-10 shadow-[0_0_15px_#facc15] opacity-50" />
        
        {/* La Cuerda/Nudo */}
        <div 
          className="absolute top-0 bottom-0 transition-all duration-75 flex items-center justify-center"
          style={{ left: `${pos}%`, width: '48px', marginLeft: '-24px' }}
        >
          <span className="text-4xl drop-shadow-lg">🧶</span>
        </div>
      </div>

      {/* Zona P2 */}
      <div className="flex-1 w-full flex flex-col items-center justify-center bg-red-900/10 rounded-b-3xl border border-red-500/10">
        {winner ? (
          <div className="text-center animate-in zoom-in duration-300">
            <h2 className="text-3xl font-black text-white mb-2 italic">¡GANADOR P{winner}!</h2>
            <button onClick={reset} className="px-10 py-3 bg-indigo-600 text-white font-black rounded-xl shadow-lg active:scale-95 transition-all">REPETIR</button>
          </div>
        ) : (
          <button 
            onClick={() => pull(2)} 
            disabled={!!winner} 
            className="w-40 h-24 bg-red-600 rounded-3xl text-white font-black text-2xl active:scale-95 shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all"
          >
            TIRA
          </button>
        )}
      </div>
    </div>
  );
};

export default TugOfWar;
