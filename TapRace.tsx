
import React, { useState, useEffect } from 'react';
import { record2PWin } from '../services/scoreService';

const TapRace: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(10);
  const [taps, setTaps] = useState({ p1: 0, p2: 0 });
  const [active, setActive] = useState(false);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    let timer: any;
    if (active && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0 && active) {
      setActive(false);
      setFinished(true);
      record2PWin('tap-race', taps.p1 > taps.p2 ? 1 : taps.p1 < taps.p2 ? 2 : 'draw');
    }
    return () => clearInterval(timer);
  }, [active, timeLeft, taps]);

  const handleTap = (p: 1 | 2) => {
    if (!active && !finished) {
      setActive(true);
    }
    if (active) {
      setTaps(prev => ({ ...prev, [p === 1 ? 'p1' : 'p2']: prev[p === 1 ? 'p1' : 'p2'] + 1 }));
    }
  };

  const reset = () => {
    setTimeLeft(10);
    setTaps({ p1: 0, p2: 0 });
    setFinished(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950">
      <button onClick={() => handleTap(1)} className="flex-1 w-full bg-blue-600/20 rotate-180 flex flex-col items-center justify-center p-8 active:bg-blue-600/40 transition-colors">
        <span className="text-5xl font-black text-white">{taps.p1}</span>
        <span className="text-xs font-bold text-blue-400 mt-2 uppercase">¡TAP RÁPIDO!</span>
      </button>

      <div className="h-16 flex items-center justify-center bg-slate-900 border-y border-slate-800 font-black text-xl text-yellow-500">
        {finished ? (
          <button onClick={reset} className="px-6 py-2 bg-indigo-600 text-white text-xs rounded-full">REINICIAR</button>
        ) : (
          <span>{timeLeft}s</span>
        )}
      </div>

      <button onClick={() => handleTap(2)} className="flex-1 w-full bg-red-600/20 flex flex-col items-center justify-center p-8 active:bg-red-600/40 transition-colors">
        <span className="text-xs font-bold text-red-400 mb-2 uppercase">¡TAP RÁPIDO!</span>
        <span className="text-5xl font-black text-white">{taps.p2}</span>
      </button>
    </div>
  );
};

export default TapRace;
