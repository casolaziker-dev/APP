
import React, { useState, useEffect } from 'react';
import { record1PScore } from '../services/scoreService';

const COLORS = [
  { icon: '🔴', color: '#ef4444' },
  { icon: '🔵', color: '#3b82f6' },
  { icon: '🟢', color: '#22c55e' },
  { icon: '🟡', color: '#eab308' },
  { icon: '🟣', color: '#a855f7' },
  { icon: '🟠', color: '#f97316' }
];

const CODE_LENGTH = 4;
const MAX_ATTEMPTS = 10;

interface Attempt {
  guess: string[];
  feedback: string[]; 
}

const ColorLogic: React.FC = () => {
  const [secret, setSecret] = useState<string[]>([]);
  const [history, setHistory] = useState<Attempt[]>([]);
  const [currentGuess, setCurrentGuess] = useState<string[]>([]);
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');

  const initGame = () => {
    const newSecret = Array.from({ length: CODE_LENGTH }, () => COLORS[Math.floor(Math.random() * COLORS.length)].icon);
    setSecret(newSecret);
    setHistory([]);
    setCurrentGuess([]);
    setGameState('playing');
  };

  useEffect(() => {
    initGame();
  }, []);

  const handleColorSelect = (color: string) => {
    if (gameState !== 'playing' || currentGuess.length >= CODE_LENGTH) return;
    setCurrentGuess([...currentGuess, color]);
  };

  const removeColor = () => {
    if (gameState !== 'playing' || currentGuess.length === 0) return;
    setCurrentGuess(currentGuess.slice(0, -1));
  };

  const submitGuess = () => {
    if (currentGuess.length !== CODE_LENGTH) return;

    const feedback: string[] = Array(CODE_LENGTH).fill('❌');
    let perfectCount = 0;

    // Lógica Binaria Posicional: Solo comprobamos si es igual al secreto en esa posición
    for (let i = 0; i < CODE_LENGTH; i++) {
      if (currentGuess[i] === secret[i]) {
        feedback[i] = '✅';
        perfectCount++;
      } else {
        feedback[i] = '❌';
      }
    }

    const newAttempt: Attempt = { guess: currentGuess, feedback };
    const newHistory = [newAttempt, ...history];
    setHistory(newHistory);
    setCurrentGuess([]);

    if (perfectCount === CODE_LENGTH) {
      setGameState('won');
      record1PScore('color-logic', MAX_ATTEMPTS - history.length, 'high');
    } else if (newHistory.length >= MAX_ATTEMPTS) {
      setGameState('lost');
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 overflow-hidden relative">
      <style>{`
        .scan-line { animation: scan 4s linear infinite; }
        @keyframes scan {
          0% { transform: translateY(-100%); opacity: 0; }
          50% { opacity: 0.1; }
          100% { transform: translateY(100%); opacity: 0; }
        }
        .slot-flicker { animation: pulse 2s infinite; }
      `}</style>

      {/* Header Info - Simplificado sin "Casi" */}
      <div className="flex-none p-3 px-4 flex justify-between items-center border-b border-slate-900 bg-slate-950/50">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">Intentos</span>
            <span className="text-lg font-black text-white">{history.length}<span className="text-slate-700">/{MAX_ATTEMPTS}</span></span>
          </div>
          <div className="h-6 w-[1px] bg-slate-800" />
          <div className="flex gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px]">✅</span>
              <span className="text-[9px] text-emerald-400 font-black uppercase tracking-widest">Correcto</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px]">❌</span>
              <span className="text-[9px] text-rose-500 font-black uppercase tracking-widest">Error</span>
            </div>
          </div>
        </div>
      </div>

      {/* Historial con feedback binario posicional */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 custom-scrollbar">
        {history.length === 0 && gameState === 'playing' && (
          <div className="h-full flex flex-col items-center justify-center opacity-20 text-center">
            <span className="text-4xl mb-4">🔐</span>
            <p className="text-[10px] font-black uppercase tracking-[0.3em]">Protocolo de Seguridad Activo</p>
          </div>
        )}
        
        {history.map((att, i) => (
          <div key={i} className="flex flex-col gap-2.5 bg-slate-900/40 p-4 rounded-2xl border border-slate-800/60 animate-in slide-in-from-top-2">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {att.guess.map((c, j) => (
                  <div key={j} className="w-10 h-10 flex items-center justify-center bg-slate-950 rounded-xl text-2xl shadow-inner border border-white/5">
                    {c}
                  </div>
                ))}
              </div>

              <div className="flex gap-2 bg-slate-950/80 p-1.5 px-2 rounded-xl border border-slate-800 shadow-inner">
                {att.feedback.map((icon, k) => (
                  <div key={k} className={`w-7 h-7 flex items-center justify-center rounded-lg text-[10px] transition-all
                    ${icon === '❌' ? 'bg-rose-500/10 border border-rose-500/20' : 'bg-emerald-500/10 border border-emerald-500/20'}
                  `}>
                    <span className={icon === '❌' ? 'text-rose-500 font-black' : 'text-emerald-500 font-black'}>
                      {icon === '❌' ? 'X' : '✅'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Panel Inferior */}
      <div className="flex-none bg-slate-900 border-t border-slate-800 p-4 pb-6 rounded-t-[2rem] shadow-2xl relative z-50">
        <div className="absolute inset-x-0 top-0 h-1 bg-indigo-500/5 scan-line" />
        
        {gameState === 'playing' ? (
          <div className="space-y-4">
            <div className="flex justify-center items-center gap-3">
              <div className="flex flex-1 justify-around items-center bg-slate-950 py-3 px-4 rounded-xl border border-indigo-500/10 shadow-inner">
                {Array.from({ length: CODE_LENGTH }).map((_, i) => (
                  <div key={i} 
                    className={`w-10 h-10 rounded-lg border flex items-center justify-center text-xl transition-all
                      ${currentGuess[i] ? 'border-indigo-500/50 bg-indigo-500/5 shadow-[0_0_10px_rgba(99,102,241,0.1)]' : 'border-slate-800 bg-slate-900/50 slot-flicker'}
                    `}
                  >
                    {currentGuess[i] || ''}
                  </div>
                ))}
              </div>
              
              <button 
                onClick={removeColor}
                disabled={currentGuess.length === 0}
                className="w-11 h-11 bg-slate-800 flex items-center justify-center rounded-xl text-rose-500 disabled:opacity-5 active:scale-90 border border-slate-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9.75 14.25 12m0 0 2.25 2.25M14.25 12l2.25-2.25M14.25 12 12 14.25m-12 0 5.25 5.25a2.25 2.25 0 0 0 1.59.66h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-1.59.66L0 12l5.25 5.25Z" />
                </svg>
              </button>
            </div>

            <div className="flex justify-center gap-2">
              {COLORS.map((c) => (
                <button
                  key={c.icon}
                  onClick={() => handleColorSelect(c.icon)}
                  disabled={currentGuess.length >= CODE_LENGTH}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800 border border-slate-700 active:scale-90 transition-all
                    ${currentGuess.length >= CODE_LENGTH ? 'opacity-20 grayscale' : 'hover:border-indigo-500/50 shadow-md'}
                  `}
                >
                  <span className="text-xl">{c.icon}</span>
                </button>
              ))}
            </div>

            <button
              onClick={submitGuess}
              disabled={currentGuess.length !== CODE_LENGTH}
              className={`w-full py-4 rounded-xl font-black text-xs tracking-[0.2em] transition-all
                ${currentGuess.length === CODE_LENGTH 
                  ? 'bg-indigo-600 text-white shadow-lg active:scale-95' 
                  : 'bg-slate-800 text-slate-600 border border-slate-700 cursor-not-allowed'}
              `}
            >
              VALIDAR SECUENCIA
            </button>
          </div>
        ) : (
          <div className="text-center py-4 animate-in fade-in zoom-in duration-500">
            <h3 className={`text-2xl font-black italic mb-4 ${gameState === 'won' ? 'text-emerald-400' : 'text-rose-500'}`}>
              {gameState === 'won' ? 'ACCESO CONCEDIDO' : 'FALLO CRÍTICO'}
            </h3>

            <div className="bg-slate-950 p-4 px-6 rounded-2xl border border-slate-800 inline-block mb-6 shadow-2xl">
               <p className="text-[8px] font-black text-slate-600 uppercase mb-3 tracking-widest">Código Original:</p>
               <div className="flex gap-4">
                  {secret.map((s, i) => (
                    <span key={i} className="text-3xl">{s}</span>
                  ))}
               </div>
            </div>

            <button 
              onClick={initGame}
              className="w-full bg-white text-slate-950 py-4 rounded-xl font-black text-lg active:scale-95 transition-all shadow-xl"
            >
              REINTENTAR
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ColorLogic;
