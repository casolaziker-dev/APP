
import React, { useState, useEffect, useRef } from 'react';
import { record2PWin } from '../services/scoreService';

const TOTAL_ROUNDS = 5;

const SyncTap: React.FC = () => {
  const [round, setRound] = useState(1);
  const [gameState, setGameState] = useState<'waiting' | 'ready' | 'result' | 'finished'>('waiting');
  const [taps, setTaps] = useState<{ p1: number | null, p2: number | null }>({ p1: null, p2: null });
  const [diff, setDiff] = useState<number | null>(null);
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [pulse, setPulse] = useState(0);
  
  const timerRef = useRef<number | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    startRound();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  const startRound = () => {
    setGameState('waiting');
    setTaps({ p1: null, p2: null });
    setDiff(null);
    
    // Animación de pulso
    let start = Date.now();
    const animate = () => {
      const elapsed = Date.now() - start;
      const p = (elapsed % 2000) / 2000; // Ciclo de 2 segundos
      setPulse(p);
      
      // Activar ventana de "Ready" cuando el pulso esté cerca del final
      if (p > 0.85 && p < 0.95 && gameState !== 'ready') {
        // Solo activamos una vez por ciclo
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    animate();

    const delay = 2000 + Math.random() * 3000;
    timerRef.current = window.setTimeout(() => {
      setGameState('ready');
    }, delay);
  };

  const handleTap = (player: 1 | 2) => {
    if (gameState !== 'ready' || taps[player === 1 ? 'p1' : 'p2'] !== null) return;

    const now = Date.now();
    const newTaps = { ...taps, [player === 1 ? 'p1' : 'p2']: now };
    setTaps(newTaps);

    if (newTaps.p1 && newTaps.p2) {
      const difference = Math.abs(newTaps.p1 - newTaps.p2);
      setDiff(difference);
      setGameState('result');
      
      // El que pulsó primero (o más cerca del objetivo ideal si lo hubiera, 
      // pero aquí es sincronía entre ellos)
      // En Sincro-Tap, ambos ganan si la diferencia es baja, o comparamos contra un "ideal"
      // Vamos a dar el punto al que más se acerque al momento del "Flash"
      setScores(prev => ({
        p1: prev.p1 + (difference < 100 ? 1 : 0),
        p2: prev.p2 + (difference < 100 ? 1 : 0)
      }));

      setTimeout(() => {
        if (round < TOTAL_ROUNDS) {
          setRound(r => r + 1);
          startRound();
        } else {
          setGameState('finished');
          record2PWin('sync-tap', scores.p1 > scores.p2 ? 1 : scores.p2 > scores.p1 ? 2 : 'draw');
        }
      }, 2000);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 overflow-hidden relative select-none">
      {/* P1 Zone */}
      <button 
        onMouseDown={() => handleTap(1)}
        onTouchStart={(e) => { e.preventDefault(); handleTap(1); }}
        className={`flex-1 w-full flex flex-col items-center justify-center rotate-180 transition-colors
          ${taps.p1 ? 'bg-blue-500/40' : 'bg-slate-900/50'}
        `}
      >
        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4">Jugador 1</p>
        <div className={`w-16 h-16 rounded-full border-4 ${taps.p1 ? 'border-white' : 'border-blue-500/30'}`} />
      </button>

      {/* Sync Center */}
      <div className="h-64 bg-slate-900 border-y-4 border-slate-800 flex items-center justify-center relative">
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
           <div className="w-full h-1 bg-white" />
           <div className="h-full w-1 bg-white absolute" />
        </div>

        {/* Pulse Visualizer */}
        {gameState === 'waiting' && (
          <div 
            className="absolute rounded-full border-2 border-indigo-500/50"
            style={{ 
              width: `${pulse * 200}px`, 
              height: `${pulse * 200}px`,
              opacity: 1 - pulse
            }}
          />
        )}

        <div className="z-10 text-center">
          {gameState === 'waiting' && <p className="text-slate-500 font-black animate-pulse uppercase tracking-tighter">Esperando pulso...</p>}
          {gameState === 'ready' && <p className="text-4xl font-black text-green-400 animate-bounce uppercase">¡AHORA!</p>}
          {gameState === 'result' && (
            <div className="animate-in zoom-in duration-300">
              <p className="text-slate-400 text-xs font-bold uppercase">Diferencia</p>
              <p className="text-5xl font-black text-white">{diff}ms</p>
              <p className={`text-sm font-bold mt-2 ${diff! < 50 ? 'text-emerald-400' : 'text-yellow-400'}`}>
                {diff! < 50 ? '¡SINCRONÍA PERFECTA!' : 'Casi...'}
              </p>
            </div>
          )}
        </div>

        {/* Round Counter */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
          {Array.from({ length: TOTAL_ROUNDS }).map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full ${i < round ? 'bg-indigo-500' : 'bg-slate-700'}`} />
          ))}
        </div>
      </div>

      {/* P2 Zone */}
      <button 
        onMouseDown={() => handleTap(2)}
        onTouchStart={(e) => { e.preventDefault(); handleTap(2); }}
        className={`flex-1 w-full flex flex-col items-center justify-center transition-colors
          ${taps.p2 ? 'bg-red-500/40' : 'bg-slate-900/50'}
        `}
      >
        <div className={`w-16 h-16 rounded-full border-4 ${taps.p2 ? 'border-white' : 'border-red-500/30'} mb-4`} />
        <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">Jugador 2</p>
      </button>

      {gameState === 'finished' && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-xl">
           <div className="text-center">
              <h2 className="text-5xl font-black text-white italic mb-2">PARTIDA</h2>
              <p className="text-indigo-400 text-xl font-bold mb-8">Puntos de sincronía: {scores.p1}</p>
              <button onClick={() => window.location.reload()} className="bg-white text-slate-950 px-12 py-4 rounded-2xl font-black">VOLVER</button>
           </div>
        </div>
      )}
    </div>
  );
};

export default SyncTap;
