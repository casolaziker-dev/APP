
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { record1PScore, getStats } from '../services/scoreService';

type GamePhase = 'idle' | 'charging' | 'launching' | 'finished';

const RocketSVG: React.FC<{ flameIntensity: number, isLaunching: boolean }> = ({ flameIntensity, isLaunching }) => (
  <div className="relative w-24 h-40 flex flex-col items-center">
    {/* Flame / Propulsion */}
    {(flameIntensity > 0) && (
      <div 
        className="absolute bottom-[-10px] w-full flex justify-center transition-all duration-75"
        style={{ transform: `scale(${isLaunching ? 1.5 : flameIntensity})` }}
      >
        <div className="w-8 h-20 bg-gradient-to-t from-transparent via-orange-500 to-yellow-300 rounded-full blur-sm animate-pulse" />
        <div className="absolute top-2 w-4 h-12 bg-white rounded-full blur-[2px] opacity-80" />
      </div>
    )}
    
    {/* Rocket Body */}
    <svg viewBox="0 0 100 150" className="w-full h-full drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
      {/* Fins */}
      <path d="M20 110 L5 140 L35 130 Z" fill="#334155" />
      <path d="M80 110 L95 140 L65 130 Z" fill="#334155" />
      <path d="M40 120 L50 145 L60 120 Z" fill="#1e293b" />
      
      {/* Main Hull */}
      <path d="M30 130 L70 130 L70 50 Q70 10 50 10 Q30 10 30 50 Z" fill="#f8fafc" stroke="#1e293b" strokeWidth="2" />
      
      {/* Window */}
      <circle cx="50" cy="55" r="10" fill="#bae6fd" stroke="#1e293b" strokeWidth="2" />
      <path d="M45 50 Q50 45 55 50" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      
      {/* Details */}
      <rect x="48" y="80" width="4" height="20" rx="2" fill="#cbd5e1" />
    </svg>
  </div>
);

const NeonJump: React.FC = () => {
  const [phase, setPhase] = useState<GamePhase>('idle');
  const [timeLeft, setTimeLeft] = useState(5);
  const [force, setForce] = useState(0);
  const [height, setHeight] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const timerRef = useRef<any>(null);
  const launchRef = useRef<any>(null);

  useEffect(() => {
    const stats = getStats('neon-jump');
    setHighScore(stats.highScore || 0);
  }, []);

  useEffect(() => {
    if (phase === 'charging' && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          const next = Math.max(0, prev - 0.1);
          if (next <= 0) {
            handleLaunch();
            return 0;
          }
          return next;
        });
      }, 100);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, timeLeft]);

  const playPropulsionSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 1.5);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.8);

      source.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      source.start();
    } catch (e) {
      console.error("Audio engine failed", e);
    }
  };

  const startCharging = () => {
    if (launchRef.current) clearInterval(launchRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase('charging');
    setTimeLeft(5);
    setForce(0);
    setHeight(0);
  };

  const handleLaunch = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase('launching');
    
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 200]);
    }

    playPropulsionSound();

    let currentH = 0;
    const targetH = Math.max(50, force * 5); 
    
    launchRef.current = setInterval(() => {
      currentH += Math.max(2, (targetH - currentH) / 20);
      if (currentH >= targetH - 1) {
        setHeight(Math.round(targetH));
        clearInterval(launchRef.current);
        setPhase('finished');
        record1PScore('neon-jump', Math.round(targetH), 'high');
      } else {
        setHeight(Math.floor(currentH));
      }
    }, 40);
  };

  const handleClick = (e?: React.MouseEvent) => {
    if (phase === 'idle' || phase === 'finished') {
      startCharging();
    } else if (phase === 'charging') {
      setForce((f) => Math.min(1000, f + 5)); // Incrementar más rápido para mejor jugabilidad
      if (navigator.vibrate) {
        navigator.vibrate(15);
      }
    }
  };

  const shakeIntensity = phase === 'charging' ? Math.min(force / 10, 10) : 0;
  const cityY = (phase === 'launching' || phase === 'finished') ? Math.min(height, 800) : 0;
  const skyOpacity = Math.min(height / 1000, 1);

  const nearBuildings = useMemo(() => [
    { h: 120, w: 16, windows: Array.from({ length: 15 }).map(() => ({ active: Math.random() > 0.5, flicker: Math.random() > 0.8 })) },
    { h: 200, w: 18, windows: Array.from({ length: 24 }).map(() => ({ active: Math.random() > 0.4, flicker: Math.random() > 0.7 })) },
    { h: 150, w: 14, windows: Array.from({ length: 18 }).map(() => ({ active: Math.random() > 0.6, flicker: Math.random() > 0.9 })) },
    { h: 180, w: 20, windows: Array.from({ length: 21 }).map(() => ({ active: Math.random() > 0.5, flicker: Math.random() > 0.8 })) },
    { h: 220, w: 16, windows: Array.from({ length: 27 }).map(() => ({ active: Math.random() > 0.4, flicker: Math.random() > 0.7 })) },
  ], []);

  const distantBuildings = useMemo(() => [
    { h: 180, w: 12, windows: Array.from({ length: 18 }).map(() => ({ active: Math.random() > 0.7 })) },
    { h: 250, w: 10, windows: Array.from({ length: 25 }).map(() => ({ active: Math.random() > 0.6 })) },
    { h: 200, w: 14, windows: Array.from({ length: 20 }).map(() => ({ active: Math.random() > 0.8 })) },
    { h: 300, w: 12, windows: Array.from({ length: 30 }).map(() => ({ active: Math.random() > 0.7 })) },
    { h: 150, w: 14, windows: Array.from({ length: 15 }).map(() => ({ active: Math.random() > 0.6 })) },
  ], []);

  return (
    <div 
      className="flex flex-col h-full items-center justify-end p-0 overflow-hidden bg-slate-950 relative select-none cursor-pointer"
      onClick={() => handleClick()}
    >
      <style>{`
        @keyframes move-car {
          from { transform: translateX(-100px); }
          to { transform: translateX(500px); }
        }
        @keyframes move-car-reverse {
          from { transform: translateX(500px); }
          to { transform: translateX(-100px); }
        }
        .animate-car { animation: move-car linear infinite; }
        .animate-car-reverse { animation: move-car-reverse linear infinite; }
        .flicker { animation: pulse 0.5s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
      `}</style>

      {/* Sky Layers */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-black via-slate-900 to-indigo-950 transition-colors duration-1000"
        style={{ backgroundColor: `rgba(15, 23, 42, ${1 - skyOpacity})` }}
      />

      {/* Stars */}
      <div className="absolute inset-0 pointer-events-none" style={{ opacity: skyOpacity }}>
        {Array.from({ length: 50 }).map((_, i) => (
          <div 
            key={i} 
            className="absolute bg-white rounded-full animate-pulse"
            style={{ 
              width: Math.random() * 2, 
              height: Math.random() * 2, 
              top: `${Math.random() * 100}%`, 
              left: `${Math.random() * 100}%` 
            }}
          />
        ))}
      </div>

      {/* City Background */}
      <div 
        className="absolute w-full bottom-24 transition-transform duration-75 pointer-events-none"
        style={{ transform: `translateY(${cityY * 0.8}px)` }}
      >
        <div className="flex justify-around items-end opacity-20">
          {distantBuildings.map((b, i) => (
            <div key={i} className="bg-slate-800" style={{ height: `${b.h}px`, width: `${b.w}px` }}>
              <div className="grid grid-cols-2 gap-1 p-1">
                {b.windows.map((win, j) => (
                  <div key={j} className={`w-1 h-1 ${win.active ? 'bg-yellow-500/50' : 'bg-slate-700'}`} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Near Buildings & Vehicles */}
      <div 
        className="absolute w-full bottom-24 transition-transform duration-75 pointer-events-none"
        style={{ transform: `translateY(${cityY}px)` }}
      >
        <div className="absolute bottom-0 w-full h-8 overflow-hidden">
          <div className="animate-car absolute bottom-1 flex gap-2" style={{ animationDuration: '8s' }}>
            <div className="w-4 h-2 bg-red-500/40 rounded-sm" />
            <div className="w-1 h-1 bg-white absolute right-0 top-0.5 rounded-full" />
          </div>
          <div className="animate-car-reverse absolute bottom-3 flex gap-2" style={{ animationDuration: '12s', animationDelay: '2s' }}>
            <div className="w-5 h-2.5 bg-indigo-500/40 rounded-sm" />
            <div className="w-1 h-1 bg-white absolute left-0 top-0.5 rounded-full" />
          </div>
        </div>

        <div className="flex justify-between items-end px-4">
          {nearBuildings.map((b, i) => (
            <div key={i} className="bg-slate-900 border-x border-slate-800" style={{ height: `${b.h}px`, width: `${b.w}px` }}>
              <div className="w-full h-1 bg-indigo-500/20" />
              <div className="grid grid-cols-3 gap-1 p-2">
                {b.windows.map((win, j) => (
                  <div 
                    key={j} 
                    className={`w-1.5 h-1.5 rounded-sm transition-opacity ${win.active ? 'bg-indigo-400/40 shadow-[0_0_5px_rgba(129,140,248,0.5)]' : 'bg-slate-800'} ${win.flicker ? 'flicker' : ''}`} 
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* UI Hud */}
      <div className="absolute top-10 w-full px-8 flex justify-between z-50 pointer-events-none">
        <div className="bg-black/40 backdrop-blur-md p-3 rounded-2xl border border-white/10">
          <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Carga</p>
          <p className="text-2xl font-black text-white">{force}</p>
        </div>
        <div className="bg-black/40 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-right">
          <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Altitud</p>
          <p className="text-2xl font-black text-indigo-400">{height}m</p>
        </div>
      </div>

      {/* Game Over / Idle Screens */}
      {(phase === 'idle' || phase === 'finished') && (
        <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-lg p-10 text-center animate-in fade-in duration-500">
          <div className="mb-6"><RocketSVG flameIntensity={0} isLaunching={false} /></div>
          <h2 className="text-4xl font-black text-white italic tracking-tighter mb-2">
            {phase === 'idle' ? 'SALTO NEÓN' : 'MISIÓN CUMPLIDA'}
          </h2>
          <p className="text-slate-400 text-sm mb-8">
            {phase === 'idle' 
              ? 'Toca rápidamente la pantalla durante 5 segundos para cargar energía y despegar.' 
              : `Has alcanzado una altitud de ${height} metros.`}
          </p>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              startCharging();
            }}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-12 py-4 rounded-2xl font-black text-xl shadow-[0_0_30px_rgba(79,70,229,0.4)] transition-all active:scale-95"
          >
            {phase === 'idle' ? 'DESPEGAR' : 'REINTENTAR'}
          </button>
          {highScore > 0 && <p className="mt-6 text-slate-500 font-bold text-xs uppercase tracking-widest">Mejor Vuelo: {highScore}m</p>}
        </div>
      )}

      {/* Charging Indicator */}
      {phase === 'charging' && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
          <p className="text-6xl font-black text-white opacity-20 scale-150 animate-ping absolute -inset-10">{Math.ceil(timeLeft)}</p>
          <p className="text-7xl font-black text-orange-500 drop-shadow-lg">{Math.ceil(timeLeft)}</p>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em] mt-2">Ignición</p>
        </div>
      )}

      {/* Rocket & Base */}
      <div 
        className="relative z-10 flex flex-col items-center mb-12 transition-transform duration-75 pointer-events-none"
        style={{ 
          transform: `translateY(${phase === 'launching' ? -Math.min(height, 300) : 0}px) translateX(${Math.random() * shakeIntensity - shakeIntensity/2}px)` 
        }}
      >
        <RocketSVG 
          flameIntensity={phase === 'charging' ? Math.min(force / 100, 1.5) : 1} 
          isLaunching={phase === 'launching'} 
        />
        
        {/* Charging Smoke */}
        {phase === 'charging' && (
          <div className="absolute bottom-0 w-64 flex justify-between px-10 pointer-events-none">
            <div className="w-16 h-16 bg-white/20 rounded-full blur-xl animate-ping" />
            <div className="w-16 h-16 bg-white/20 rounded-full blur-xl animate-ping delay-75" />
          </div>
        )}
      </div>

      {/* Launch Pad / Street */}
      <div 
        className="w-full h-32 bg-slate-900 border-t-8 border-slate-800 flex flex-col items-center pt-4 transition-transform duration-75 pointer-events-none"
        style={{ transform: `translateY(${cityY}px)` }}
      >
        <div className="w-40 h-2 bg-indigo-500/30 rounded-full mb-4" />
        <div className="flex gap-4 opacity-20">
          <div className="w-8 h-1 bg-yellow-500" />
          <div className="w-8 h-1 bg-yellow-500" />
          <div className="w-8 h-1 bg-yellow-500" />
        </div>
        <p className="mt-4 text-[10px] text-slate-600 font-bold tracking-[0.4em] uppercase">Sector Central - Distrito Neon</p>
        
        <div className="absolute bottom-4 w-full h-6 overflow-hidden pointer-events-none">
            <div className="animate-car absolute flex items-center gap-1 opacity-60" style={{ animationDuration: '5s' }}>
                <div className="w-6 h-3 bg-slate-700 rounded-sm" />
                <div className="w-1 h-1 bg-yellow-400 rounded-full" />
            </div>
            <div className="animate-car-reverse absolute flex items-center gap-1 opacity-60" style={{ animationDuration: '7s', animationDelay: '3s' }}>
                <div className="w-1 h-1 bg-yellow-400 rounded-full" />
                <div className="w-8 h-3 bg-slate-800 rounded-sm" />
            </div>
        </div>
      </div>
    </div>
  );
};

export default NeonJump;
