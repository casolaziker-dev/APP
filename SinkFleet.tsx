
import React, { useState, useEffect, useCallback } from 'react';
import { record2PWin } from '../services/scoreService';

const GRID_SIZE = 6;
const SHIPS = [3, 2, 1]; // Tamaños de barcos

type CellStatus = 'empty' | 'ship' | 'hit' | 'miss' | 'animating-hit' | 'animating-miss';
type Orientation = 'H' | 'V';

interface PlayerBoard {
  grid: CellStatus[][];
  remainingShips: number;
}

const SinkFleet: React.FC = () => {
  const [phase, setPhase] = useState<'setup1' | 'setup2' | 'battle1' | 'battle2' | 'won'>('setup1');
  const [boards, setBoards] = useState<Record<number, PlayerBoard>>({
    1: { grid: Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill('empty')), remainingShips: 0 },
    2: { grid: Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill('empty')), remainingShips: 0 }
  });
  const [orientation, setOrientation] = useState<Orientation>('H');
  const [currentShipIndex, setCurrentShipIndex] = useState(0);
  const [winner, setWinner] = useState<number | null>(null);
  const [turnOverlay, setTurnOverlay] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Nuevo estado para la previsualización
  const [previewPos, setPreviewPos] = useState<{ r: number, c: number } | null>(null);

  const totalShipCells = SHIPS.reduce((a, b) => a + b, 0);

  const checkPlacement = (r: number, c: number, size: number, player: number, orient: Orientation) => {
    const board = boards[player];
    
    // Límites
    if (orient === 'H' && c + size > GRID_SIZE) return false;
    if (orient === 'V' && r + size > GRID_SIZE) return false;
    
    // Solapamiento
    for (let i = 0; i < size; i++) {
      const nr = orient === 'V' ? r + i : r;
      const nc = orient === 'H' ? c + i : c;
      if (board.grid[nr][nc] === 'ship') return false;
    }
    return true;
  };

  const handleSetupClick = (r: number, c: number, player: number) => {
    if (currentShipIndex >= SHIPS.length) return;
    
    const size = SHIPS[currentShipIndex];
    const isValid = checkPlacement(r, c, size, player, orientation);

    if (!isValid) return;

    // Si es el mismo sitio que la previsualización, confirmamos
    if (previewPos && previewPos.r === r && previewPos.c === c) {
      const board = boards[player];
      const newGrid = board.grid.map(row => [...row]);
      for (let i = 0; i < size; i++) {
        const nr = orientation === 'V' ? r + i : r;
        const nc = orientation === 'H' ? c + i : c;
        newGrid[nr][nc] = 'ship';
      }

      setBoards(prev => ({
        ...prev,
        [player]: { ...board, grid: newGrid, remainingShips: totalShipCells }
      }));

      setPreviewPos(null); // Limpiar previsualización

      if (currentShipIndex < SHIPS.length - 1) {
        setCurrentShipIndex(currentShipIndex + 1);
      } else {
        setCurrentShipIndex(0);
        setOrientation('H');
        if (player === 1) {
          showTurnTransition(2, 'setup2');
        } else {
          showTurnTransition(1, 'battle1');
        }
      }
    } else {
      // Si es un sitio nuevo, mostramos la previsualización
      setPreviewPos({ r, c });
    }
  };

  const showTurnTransition = (nextPlayer: number, nextPhase: any) => {
    setTurnOverlay(nextPlayer);
    setTimeout(() => {
      setPhase(nextPhase);
      setTurnOverlay(null);
      setPreviewPos(null);
    }, 1500);
  };

  const handleBattleClick = (r: number, c: number, attacker: number) => {
    if (isAnimating || turnOverlay) return;
    
    const defender = attacker === 1 ? 2 : 1;
    const defBoard = boards[defender];
    const cell = defBoard.grid[r][c];

    if (cell === 'hit' || cell === 'miss' || cell.startsWith('animating')) return;

    setIsAnimating(true);
    const newGrid = defBoard.grid.map(row => [...row]);
    const isHit = cell === 'ship';
    
    newGrid[r][c] = isHit ? 'animating-hit' : 'animating-miss';
    setBoards(prev => ({
      ...prev,
      [defender]: { ...defBoard, grid: newGrid }
    }));

    setTimeout(() => {
      const finalGrid = defBoard.grid.map(row => [...row]);
      finalGrid[r][c] = isHit ? 'hit' : 'miss';
      const newRemaining = isHit ? defBoard.remainingShips - 1 : defBoard.remainingShips;

      setBoards(prev => ({
        ...prev,
        [defender]: { ...defBoard, grid: finalGrid, remainingShips: newRemaining }
      }));
      
      setIsAnimating(false);

      if (newRemaining <= 0) {
        setWinner(attacker);
        setPhase('won');
        record2PWin('sink-fleet', attacker as 1 | 2);
      } else {
        showTurnTransition(defender, attacker === 1 ? 'battle2' : 'battle1');
      }
    }, 1200); 
  };

  const reset = () => {
    setPhase('setup1');
    setBoards({
      1: { grid: Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill('empty')), remainingShips: 0 },
      2: { grid: Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill('empty')), remainingShips: 0 }
    });
    setCurrentShipIndex(0);
    setWinner(null);
    setOrientation('H');
    setPreviewPos(null);
  };

  const GridDisplay = ({ grid, onCellClick, hideShips = false }: { grid: CellStatus[][], onCellClick?: (r: number, c: number) => void, hideShips?: boolean }) => {
    // Calcular qué celdas son de previsualización
    const isPreviewing = (r: number, c: number) => {
      if (!previewPos || hideShips) return false;
      const size = SHIPS[currentShipIndex];
      if (orientation === 'H') {
        return r === previewPos.r && c >= previewPos.c && c < previewPos.c + size;
      } else {
        return c === previewPos.c && r >= previewPos.r && r < previewPos.r + size;
      }
    };

    return (
      <div className="grid grid-cols-6 gap-2 p-3 bg-slate-900/80 rounded-3xl border-2 border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-500/5 to-transparent pointer-events-none" />
        {grid.map((row, r) => row.map((cell, c) => {
          const inPreview = isPreviewing(r, c);
          return (
            <button
              key={`${r}-${c}`}
              onClick={() => onCellClick?.(r, c)}
              className={`w-11 h-11 rounded-full transition-all duration-300 flex items-center justify-center border-2 relative
                ${cell === 'empty' ? 'bg-slate-800/40 border-slate-700/30' : ''}
                ${cell === 'ship' ? (hideShips ? 'bg-slate-800/40 border-slate-700/30' : 'bg-cyan-500 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)] animate-in zoom-in-50 duration-300') : ''}
                ${cell === 'hit' ? 'bg-rose-600 border-rose-400 shadow-[0_0_20px_#f43f5e]' : ''}
                ${cell === 'miss' ? 'bg-slate-400/20 border-slate-500/40' : ''}
                ${cell === 'animating-hit' ? 'bg-orange-500 border-white scale-125 z-10 animate-ping' : ''}
                ${cell === 'animating-miss' ? 'bg-blue-400/20 border-blue-400 scale-90 z-10' : ''}
                ${inPreview ? 'bg-cyan-400/40 border-cyan-300 border-dashed animate-pulse scale-105 z-20' : ''}
                active:scale-90 touch-none
              `}
            >
              {cell === 'hit' && <div className="w-2 h-2 bg-white rounded-full animate-pulse" />}
              {cell === 'miss' && <div className="w-1.5 h-1.5 bg-slate-500 rounded-full opacity-40" />}
              {cell === 'animating-hit' && <span className="absolute text-xl">💥</span>}
              {cell === 'animating-miss' && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="absolute w-full h-full rounded-full border-2 border-cyan-400/60 animate-[ping_0.8s_ease-out_infinite]" />
                  <div className="absolute w-[150%] h-[150%] rounded-full border border-cyan-300/30 animate-[ping_1.2s_ease-out_infinite]" />
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-cyan-200 rounded-full animate-bounce [animation-duration:0.4s]" />
                    <div className="w-1.5 h-1.5 bg-cyan-100 rounded-full animate-bounce [animation-duration:0.4s] [animation-delay:0.1s]" />
                    <div className="w-1.5 h-1.5 bg-cyan-200 rounded-full animate-bounce [animation-duration:0.4s] [animation-delay:0.2s]" />
                  </div>
                </div>
              )}
              {inPreview && !cell.startsWith('animating') && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full border border-cyan-500 animate-bounce flex items-center justify-center">
                   <div className="w-1 h-1 bg-cyan-500 rounded-full" />
                </div>
              )}
            </button>
          );
        }))}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 p-4 select-none relative overflow-hidden">
      <style>{`
        @keyframes slide-in {
          0% { transform: translateX(-100%); opacity: 0; }
          20% { transform: translateX(0); opacity: 1; }
          80% { transform: translateX(0); opacity: 1; }
          100% { transform: translateX(100%); opacity: 0; }
        }
        .turn-overlay-anim {
          animation: slide-in 1.5s ease-in-out forwards;
        }
      `}</style>

      {/* Turn Transition Overlay */}
      {turnOverlay && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-slate-950/40 backdrop-blur-sm pointer-events-none">
          <div className="turn-overlay-anim w-full bg-gradient-to-r from-transparent via-indigo-600 to-transparent py-10 flex flex-col items-center shadow-[0_0_50px_rgba(79,70,229,0.5)]">
            <span className="text-white font-black text-4xl italic tracking-tighter uppercase">Turno del Jugador {turnOverlay}</span>
            <span className="text-indigo-200 text-xs font-bold uppercase tracking-[0.5em] mt-2">Preparando Radar...</span>
          </div>
        </div>
      )}

      {phase === 'won' ? (
        <div className="flex-1 flex flex-col items-center justify-center space-y-8 animate-in zoom-in duration-500">
          <div className="text-8xl drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">🎖️</div>
          <div className="text-center">
            <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase mb-2">¡FLOTA ELIMINADA!</h2>
            <p className="text-cyan-400 font-bold text-xl uppercase tracking-widest">VICTORIA TOTAL P{winner}</p>
          </div>
          <button onClick={reset} className="w-full max-w-xs bg-cyan-600 text-white py-5 rounded-3xl font-black text-xl shadow-[0_0_30px_rgba(8,145,178,0.4)] active:scale-95 transition-all">NUEVA CAMPAÑA</button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-between py-2">
          <div className="w-full flex justify-between items-center px-2 mb-4">
            <div className={`flex flex-col items-center p-3 rounded-2xl border-2 transition-all ${phase.includes('1') ? 'border-cyan-500 bg-cyan-500/10 shadow-[0_0_15px_rgba(34,211,238,0.2)]' : 'border-slate-800 opacity-40'}`}>
              <span className="text-[9px] font-black text-slate-500 uppercase">Jugador 1</span>
              <span className="text-white font-black text-lg">{boards[1].remainingShips} <span className="text-[10px] text-slate-500">HP</span></span>
            </div>
            <div className="flex flex-col items-center">
               <div className="w-1 h-8 bg-gradient-to-b from-transparent via-slate-800 to-transparent" />
               <span className="text-slate-700 font-black italic text-xs">RADAR</span>
            </div>
            <div className={`flex flex-col items-center p-3 rounded-2xl border-2 transition-all ${phase.includes('2') ? 'border-rose-500 bg-rose-500/10 shadow-[0_0_15px_rgba(244,63,94,0.2)]' : 'border-slate-800 opacity-40'}`}>
              <span className="text-[9px] font-black text-slate-500 uppercase">Jugador 2</span>
              <span className="text-white font-black text-lg">{boards[2].remainingShips} <span className="text-[10px] text-slate-500">HP</span></span>
            </div>
          </div>

          <div className="text-center mb-4">
            <h3 className="text-white font-black text-2xl uppercase tracking-tighter italic">
              {phase.startsWith('setup') ? 'Despliegue Naval' : 'Ataque Táctico'}
            </h3>
            <p className="text-indigo-400 text-[10px] font-bold uppercase tracking-[0.4em] mt-1">
              {phase.startsWith('setup') 
                ? `P${phase.endsWith('1') ? '1' : '2'} · BARCO: ${SHIPS[currentShipIndex]} NODOS` 
                : `JUGADOR ${phase.endsWith('1') ? '1' : '2'} DISPARANDO`}
            </p>
          </div>

          <div className="relative group p-4">
            {phase === 'setup1' && <GridDisplay grid={boards[1].grid} onCellClick={(r, c) => handleSetupClick(r, c, 1)} />}
            {phase === 'setup2' && <GridDisplay grid={boards[2].grid} onCellClick={(r, c) => handleSetupClick(r, c, 2)} />}
            {phase === 'battle1' && <GridDisplay grid={boards[2].grid} hideShips={true} onCellClick={(r, c) => handleBattleClick(r, c, 1)} />}
            {phase === 'battle2' && <GridDisplay grid={boards[1].grid} hideShips={true} onCellClick={(r, c) => handleBattleClick(r, c, 2)} />}
            <div className="absolute -inset-2 border-2 border-indigo-500/10 rounded-[3rem] pointer-events-none -z-10 animate-pulse" />
          </div>

          <div className="w-full max-w-xs mt-6">
            {phase.startsWith('setup') ? (
              <div className="flex flex-col gap-4">
                <button 
                  onClick={() => {
                    setOrientation(o => o === 'H' ? 'V' : 'H');
                    setPreviewPos(null); // Reset preview on rotate
                  }}
                  className="w-full flex items-center justify-center gap-3 bg-slate-800 border-2 border-slate-700 py-4 rounded-2xl text-white font-black active:scale-95 transition-all shadow-xl group"
                >
                  <span className={`text-2xl transition-transform duration-500 ${orientation === 'V' ? 'rotate-90' : ''}`}>🚢</span>
                  <div className="text-left">
                    <p className="text-[10px] text-indigo-400 uppercase font-black leading-none mb-1">Girar Barco</p>
                    <p className="text-sm uppercase leading-none">{orientation === 'H' ? 'Horizontal' : 'Vertical'}</p>
                  </div>
                </button>
                <div className="text-center px-4">
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1 animate-pulse">
                    {previewPos ? '¡Toca otra vez para confirmar!' : 'Selecciona posición en el radar'}
                  </p>
                  <p className="text-[8px] text-slate-600 font-medium">Pulsa dos veces para desplegar definitivamente</p>
                </div>
              </div>
            ) : (
              <div className="text-center px-6">
                 <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] animate-pulse">
                    Identifica y destruye los objetivos enemigos en el radar inferior.
                 </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SinkFleet;
