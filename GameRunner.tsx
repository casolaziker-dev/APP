
import React, { useState, useEffect } from 'react';
import { Game } from '../types';
import QuizAI from '../games/QuizAI';
import TicTacToe from '../games/TicTacToe';
import ReflexDuel from '../games/ReflexDuel';
import MemoryGame from '../games/MemoryGame';
import SnakeGame from '../games/SnakeGame';
import MathDuel from '../games/MathDuel';
import TugOfWar from '../games/TugOfWar';
import WordAI from '../games/WordAI';
import WordleAI from '../games/WordleAI';
import NeonJump from '../games/NeonJump';
import MinesLite from '../games/MinesLite';
import QuickTap1P from '../games/QuickTap1P';
import Maze1P from '../games/Maze1P';
import ColorLogic from '../games/ColorLogic';
import AirHockey from '../games/AirHockey';
import DotsAndBoxes from '../games/DotsAndBoxes';
import BombPass from '../games/BombPass';
import MashBattle from '../games/MashBattle';
import SinkFleet from '../games/SinkFleet';
import SyncTap from '../games/SyncTap';
import SimplePlaceholder from '../games/SimplePlaceholder';

interface GameRunnerProps {
  game: Game;
}

const GAME_INSTRUCTIONS: Record<string, string[]> = {
  'quiz-ai': ['Selecciona un tema generado por IA.', 'Responde las 5 preguntas correctamente.', '¡Usa tu conocimiento para batir el récord!'],
  'wordle-ai': ['Adivina la palabra de 5 letras.', 'VERDE: Letra correcta en sitio correcto.', 'AMARILLO: Letra correcta en sitio equivocado.', 'GRIS: La letra no está en la palabra.'],
  'word-ai': ['Lee la pista críptica de la IA.', 'Escribe la palabra que crees que es.', 'Pide ayuda si te bloqueas (IA pensando...).'],
  'memory': ['Voltea las cartas para encontrar parejas.', 'Recuerda las posiciones de los emojis.', 'Termina con el menor número de movimientos.'],
  'snake': ['Usa las flechas para mover la serpiente.', 'Come los puntos rojos para crecer.', 'No choques con las paredes ni contigo mismo.'],
  'neon-jump': ['Pulsa repetidamente para cargar energía.', 'Tienes 5 segundos antes del despegue.', '¡Llega lo más alto posible en la atmósfera!'],
  'maze-1p': ['Usa las flechas para navegar.', 'Encuentra el camino hasta la meta (cuadro inferior).', 'Planifica tus movimientos con cuidado.'],
  'mine-lite': ['Toca para revelar casillas.', 'El número indica cuántas minas hay cerca.', 'Usa el modo bandera para marcar bombas.'],
  'color-logic': [
    'Adivina la secuencia de 4 colores secreta.', 
    'Colores disponibles: 🔴 🔵 🟢 🟡 🟣 🟠', 
    'El feedback es posicional (orden de izquierda a derecha):',
    '✅: El color en esta posición es CORRECTO.', 
    'X: El color en esta posición es INCORRECTO.'
  ],
  'quick-tap-1p': ['Espera a que la pantalla cambie a VERDE.', 'Toca lo más rápido que puedas.', 'Si tocas antes de tiempo, pierdes el turno.'],
  'tictactoe': ['Consigue 3 en raya (horizontal, vertical o diagonal).', 'Alterna turnos con tu oponente.', 'Bloquea sus movimientos estratégicamente.'],
  'reflex': ['Cada jugador tiene una mitad de pantalla.', 'Toca cuando tu zona cambie de color.', '¡El más rápido gana el punto!'],
  'tug-of-war': ['Pulsa tu botón frenéticamente.', 'Cada pulsación tira de la cuerda hacia ti.', 'Lleva el nudo a tu extremo para ganar.'],
  'math-duel': ['Resuelve la operación matemática rápido.', 'Toca la opción correcta en tu pantalla.', 'Gana el que responda correctamente primero.'],
  'hockey-2p': ['Desliza para mover tu mazo.', 'Golpea el disco para marcar en la portería rival.', 'No dejes que el disco entre en tu zona.'],
  'dots-boxes': ['Dibuja líneas entre los puntos.', 'Al cerrar un cuadrado, ganas un punto.', 'Si cierras un cuadrado, repites turno.'],
  'sink-fleet': ['Primero, cada jugador coloca sus 3 barcos en secreto.', 'Por turnos, disparad al tablero del rival.', 'Hunde todos los barcos enemigos para ganar.'],
  'sync-tap': ['Sigue el ritmo del pulso central.', 'Ambos deben pulsar al mismo tiempo.', 'Cuanta menor sea la diferencia, más puntos.'],
  'bomb-pass': ['Toca tu zona para pasar la bomba.', '¡No te quedes con ella cuando explote!', 'La bomba se infla antes de detonar.'],
  'wordle-2p': ['Adivina la palabra antes que tu oponente.', 'Usa las pistas de colores para deducir las letras.'],
  'mash-battle': ['Espera a que termine la cuenta atrás.', 'Machaca tu zona para empujar la barra.', 'Lleva el marcador al lado contrario.'],
};

const GameRunner: React.FC<GameRunnerProps> = ({ game }) => {
  const [showBriefing, setShowBriefing] = useState(true);

  const renderGame = () => {
    switch (game.id) {
      case 'quiz-ai': return <QuizAI />;
      case 'wordle-ai': return <WordleAI />;
      case 'word-ai': return <WordAI />;
      case 'memory': return <MemoryGame />;
      case 'snake': return <SnakeGame />;
      case 'neon-jump': return <NeonJump />;
      case 'mine-lite': return <MinesLite />;
      case 'quick-tap-1p': return <QuickTap1P />;
      case 'maze-1p': return <Maze1P />;
      case 'color-logic': return <ColorLogic />;
      case 'tictactoe': return <TicTacToe />;
      case 'reflex': return <ReflexDuel />;
      case 'math-duel': return <MathDuel />;
      case 'tug-of-war': return <TugOfWar />;
      case 'hockey-2p': return <AirHockey />;
      case 'dots-boxes': return <DotsAndBoxes />;
      case 'bomb-pass': return <BombPass />;
      case 'mash-battle': return <MashBattle />;
      case 'sink-fleet': return <SinkFleet />;
      case 'sync-tap': return <SyncTap />;
      default:
        return <SimplePlaceholder game={game} />;
    }
  };

  if (showBriefing) {
    return (
      <div className="flex flex-col h-full bg-slate-950 p-6 animate-in fade-in duration-500">
        <div className="flex-1 flex flex-col items-center justify-center space-y-8">
          <div className={`w-24 h-24 ${game.color} rounded-3xl flex items-center justify-center text-5xl shadow-2xl animate-bounce`}>
            {game.icon}
          </div>
          
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">{game.title}</h2>
            <div className="flex justify-center">
              <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 rounded-full text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                {game.players === 1 ? 'Modo Solitario' : 'Duelo 2 Jugadores'}
              </span>
            </div>
          </div>

          <div className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-2">Instrucciones de Misión</h3>
            <ul className="space-y-3">
              {(GAME_INSTRUCTIONS[game.id] || ['Toca los elementos para interactuar.', 'Consigue la mayor puntuación posible.']).map((inst, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-indigo-500 font-bold mt-1">▹</span>
                  <p className="text-slate-300 text-sm font-medium">{inst}</p>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-[10px] text-slate-600 font-bold italic text-center px-4">
            "{game.description}"
          </p>
        </div>

        <button
          onClick={() => setShowBriefing(false)}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-5 rounded-2xl font-black text-xl shadow-xl shadow-indigo-900/20 active:scale-95 transition-all uppercase tracking-widest"
        >
          Iniciar Protocolo
        </button>
      </div>
    );
  }

  return renderGame();
};

export default GameRunner;
