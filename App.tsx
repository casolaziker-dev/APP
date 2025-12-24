
import React, { useState, useEffect, useRef } from 'react';
import { Sector, Game } from './types';
import Home from './components/Home';
import GameList from './components/GameList';
import GameRunner from './components/GameRunner';

const GAMES: Game[] = [
  // SECTOR 1 JUGADOR (10 Juegos)
  { id: 'quiz-ai', title: 'Trivia AI', description: 'Preguntas infinitas de IA.', icon: '🧠', color: 'bg-purple-500', players: 1 },
  { id: 'wordle-ai', title: 'Palabra del Día', description: 'Adivina la palabra oculta (Wordle).', icon: '📝', color: 'bg-emerald-600', players: 1 },
  { id: 'word-ai', title: 'Palabra AI', description: 'Adivina con pistas de IA.', icon: '✍️', color: 'bg-indigo-600', players: 1 },
  { id: 'memory', title: 'Parejas', description: 'Memoria visual clásica.', icon: '🃏', color: 'bg-emerald-500', players: 1 },
  { id: 'snake', title: 'Snake', description: 'El clásico de la serpiente.', icon: '🐍', color: 'bg-green-500', players: 1 },
  { id: 'neon-jump', title: 'Salto Neón', description: 'Llega a lo más alto.', icon: '🚀', color: 'bg-blue-500', players: 1 },
  { id: 'maze-1p', title: 'Laberinto', description: 'Busca la salida.', icon: '🌀', color: 'bg-slate-600', players: 1 },
  { id: 'mine-lite', title: 'Minas Lite', description: 'No pises la bomba.', icon: '💣', color: 'bg-red-600', players: 1 },
  { id: 'color-logic', title: 'Lógica Color', description: 'Descifra el código.', icon: '💡', color: 'bg-fuchsia-600', players: 1 },
  { id: 'quick-tap-1p', title: 'Reflejo Solo', description: 'Toca el círculo rápido.', icon: '🎯', color: 'bg-orange-500', players: 1 },

  // SECTOR 2 JUGADORES (10 Juegos)
  { id: 'tictactoe', title: '3 en Raya', description: 'Duelo estratégico.', icon: '❌', color: 'bg-blue-500', players: 2 },
  { id: 'reflex', title: 'Duelo Reflex', description: '¡El más rápido gana!', icon: '⚡', color: 'bg-red-500', players: 2 },
  { id: 'tug-of-war', title: 'Soga-Tira', description: 'Pulsa rápido tu botón.', icon: '🧶', color: 'bg-orange-600', players: 2 },
  { id: 'math-duel', title: 'Duelo Mate', description: 'Cálculo mental dual.', icon: '⚖️', color: 'bg-amber-500', players: 2 },
  { id: 'hockey-2p', title: 'Air Hockey', description: 'Golpea el disco.', icon: '🏒', color: 'bg-sky-400', players: 2 },
  { id: 'dots-boxes', title: 'Puntos y Cajas', description: 'Cierra los cuadrados.', icon: '🍱', color: 'bg-teal-600', players: 2 },
  { id: 'sink-fleet', title: 'Hundir la Flota', description: 'Guerra naval táctica.', icon: '🚢', color: 'bg-cyan-700', players: 2 },
  { id: 'sync-tap', title: 'Sincro-Tap', description: 'Pulsad al mismo tiempo.', icon: '🤝', color: 'bg-lime-600', players: 2 },
  { id: 'bomb-pass', title: 'Pasa la Bomba', description: '¡Que no te explote!', icon: '🧨', color: 'bg-yellow-600', players: 2 },
  { id: 'mash-battle', title: 'Mash Battle', description: 'Gana el que más pulse.', icon: '🤜', color: 'bg-indigo-400', players: 2 },
];

const App: React.FC = () => {
  const [sector, setSector] = useState<Sector>('HOME');
  const [activeGame, setActiveGame] = useState<Game | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isDark, setIsDark] = useState(false); // Estado para el tema oscuro

  const handleBack = () => {
    if (activeGame) {
      setActiveGame(null);
    } else {
      setSector('HOME');
    }
  };

  const toggleMusic = () => {
    setIsMuted(!isMuted);
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <div className={`flex flex-col h-[100dvh] w-full max-w-md mx-auto relative overflow-hidden transition-colors duration-300 font-['Fredoka'] shadow-2xl
      ${isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}
    `}>
      
      {/* Solo mostramos el header si no estamos en Snake (que tiene su propio header) */}
      {!(activeGame?.id === 'snake') && (
        <header className={`flex-none p-4 flex items-center justify-between z-[100] border-b transition-colors duration-300
          ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'}
        `}>
          <div className="flex gap-2">
            {sector !== 'HOME' ? (
              <button 
                onClick={handleBack}
                className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all border active:scale-90
                  ${isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-600'}
                `}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                </svg>
              </button>
            ) : (
              <button 
                onClick={toggleTheme}
                className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-all active:scale-90 text-lg
                  ${isDark ? 'bg-slate-800 border-slate-700 text-yellow-400' : 'bg-slate-100 border-slate-200 text-slate-500'}
                `}
              >
                {isDark ? '☀️' : '🌙'}
              </button>
            )}
          </div>
          
          <div className="text-center flex-1">
            <h1 className={`text-lg font-bold transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {activeGame ? activeGame.title : (sector === 'HOME' ? 'MINIJUEGOS AI' : `MODO ${sector}`)}
            </h1>
          </div>

          <button 
            onClick={toggleMusic}
            className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-all active:scale-90
              ${isMuted ? (isDark ? 'bg-slate-800 border-slate-700 text-slate-500' : 'bg-slate-100 border-slate-200 text-slate-400') : 'bg-indigo-50 text-indigo-600 border-indigo-200'}
            `}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
        </header>
      )}

      <main className="flex-1 overflow-y-auto custom-scrollbar relative z-10 flex flex-col">
        <div className={`flex-1 flex flex-col ${activeGame ? "h-full" : "pb-8"}`}>
          {activeGame ? (
            <GameRunner game={activeGame} />
          ) : sector === 'HOME' ? (
            <Home onSelectSector={setSector} isDark={isDark} />
          ) : (
            <div className="px-4">
              <GameList 
                games={GAMES.filter(g => g.players === (sector === '1P' ? 1 : 2))} 
                onSelectGame={setActiveGame} 
                isDark={isDark}
              />
            </div>
          )}
        </div>
      </main>

      {!activeGame && (
        <footer className={`flex-none p-3 text-center border-t transition-colors
          ${isDark ? 'bg-slate-900/50 border-slate-800 text-slate-500' : 'bg-white border-slate-100 text-slate-400'}
        `}>
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase">Powered by Gemini AI</p>
        </footer>
      )}
    </div>
  );
};

export default App;
