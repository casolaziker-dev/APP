
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { record1PScore } from '../services/scoreService';

const SIZE = 12; // 12x12 grid

interface Cell {
  r: number;
  c: number;
  walls: { top: boolean; right: boolean; bottom: boolean; left: boolean };
  visited: boolean;
}

const Maze1P: React.FC = () => {
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [player, setPlayer] = useState({ r: 0, c: 0 });
  const [won, setWon] = useState(false);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const timerRef = useRef<number | null>(null);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const centis = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centis.toString().padStart(2, '0')}`;
  };

  const generateMaze = useCallback(() => {
    // Limpiar estado previo
    if (timerRef.current) clearInterval(timerRef.current);
    setTimerActive(false);
    setTime(0);
    setMoves(0);
    setWon(false);
    setPlayer({ r: 0, c: 0 });

    const newGrid: Cell[][] = [];
    for (let r = 0; r < SIZE; r++) {
      newGrid[r] = [];
      for (let c = 0; c < SIZE; c++) {
        newGrid[r][c] = {
          r, c,
          walls: { top: true, right: true, bottom: true, left: true },
          visited: false
        };
      }
    }

    const stack: Cell[] = [];
    const startCell = newGrid[0][0];
    startCell.visited = true;
    stack.push(startCell);

    while (stack.length > 0) {
      const current = stack[stack.length - 1];
      const neighbors: { cell: Cell; dir: 'top' | 'right' | 'bottom' | 'left' }[] = [];

      const { r, c } = current;
      if (r > 0 && !newGrid[r - 1][c].visited) neighbors.push({ cell: newGrid[r - 1][c], dir: 'top' });
      if (c < SIZE - 1 && !newGrid[r][c + 1].visited) neighbors.push({ cell: newGrid[r][c + 1], dir: 'right' });
      if (r < SIZE - 1 && !newGrid[r + 1][c].visited) neighbors.push({ cell: newGrid[r + 1][c], dir: 'bottom' });
      if (c > 0 && !newGrid[r][c - 1].visited) neighbors.push({ cell: newGrid[r][c - 1], dir: 'left' });

      if (neighbors.length > 0) {
        const next = neighbors[Math.floor(Math.random() * neighbors.length)];
        if (next.dir === 'top') { current.walls.top = false; next.cell.walls.bottom = false; }
        else if (next.dir === 'right') { current.walls.right = false; next.cell.walls.left = false; }
        else if (next.dir === 'bottom') { current.walls.bottom = false; next.cell.walls.top = false; }
        else if (next.dir === 'left') { current.walls.left = false; next.cell.walls.right = false; }
        next.cell.visited = true;
        stack.push(next.cell);
      } else {
        stack.pop();
      }
    }

    setGrid(newGrid);
  }, []);

  useEffect(() => {
    generateMaze();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [generateMaze]);

  useEffect(() => {
    if (timerActive && !won) {
      const start = Date.now() - time;
      timerRef.current = window.setInterval(() => {
        setTime(Date.now() - start);
      }, 33);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerActive, won]);

  const move = useCallback((dr: number, dc: number, dir: 'top' | 'right' | 'bottom' | 'left') => {
    if (won || grid.length === 0 || !grid[player.r]) return;

    const currentCell = grid[player.r][player.c];
    if (!currentCell || currentCell.walls[dir]) return;

    const nr = player.r + dr;
    const nc = player.c + dc;

    if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE) {
      if (!timerActive) {
        setTimerActive(true);
      }

      setPlayer({ r: nr, c: nc });
      setMoves(m => m + 1);

      if (nr === SIZE - 1 && nc === SIZE - 1) {
        setWon(true);
        setTimerActive(false);
        record1PScore('maze-1p', moves + 1, 'low');
      }
    }
  }, [grid, player, won, moves, timerActive]);

  const NavButton = ({ direction, icon, dr, dc }: { direction: 'top' | 'right' | 'bottom' | 'left', icon: React.ReactNode, dr: number, dc: number }) => (
    <button
      onPointerDown={(e) => { 
        e.preventDefault(); 
        move(dr, dc, direction); 
      }}
      className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-800 rounded-2xl flex items-center justify-center text-indigo-400 border-2 border-slate-700 shadow-[0_4px_0_rgb(30,41,59)] active:shadow-none active:translate-y-1 active:bg-indigo-600 active:text-white transition-all duration-75 group select-none touch-none"
    >
      <div className="group-active:scale-125 transition-transform pointer-events-none">
        {icon}
      </div>
    </button>
  );

  return (
    <div className="flex flex-col h-full bg-slate-950 overflow-hidden relative select-none">
      <style>{`
        .player-glow { animation: player-pulse 2s infinite; }
        @keyframes player-pulse {
          0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(99, 102, 241, 0); }
          100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
        }
      `}</style>

      {/* HUD Superior - Compacto */}
      <div className="flex-none p-3 px-4 flex justify-between items-center border-b border-slate-900 bg-slate-950/50 backdrop-blur-md z-20">
        <div className="flex flex-col">
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Pasos</span>
          <span className="text-xl font-black text-white leading-none">{moves}</span>
        </div>
        
        <div className="flex flex-col items-center bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
          <span className="text-[8px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-0.5 leading-none">Tiempo</span>
          <span className="text-lg font-black text-white font-mono leading-none">{formatTime(time)}</span>
        </div>

        <div className="flex flex-col items-end">
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Meta</span>
          <span className="text-xl leading-none">🏁</span>
        </div>
      </div>

      {/* Área del Laberinto - Centrada y adaptable */}
      <div className="flex-1 flex items-center justify-center p-4 min-h-0 overflow-hidden">
        {grid.length > 0 ? (
          <div 
            className="relative bg-slate-900 border-4 border-slate-800 p-1 rounded-xl shadow-2xl flex-shrink"
            style={{ 
              width: 'min(340px, 80vw, 80vh)', 
              height: 'min(340px, 80vw, 80vh)',
              maxWidth: '100%',
              maxHeight: '100%'
            }}
          >
            <div className="grid grid-cols-12 grid-rows-12 h-full w-full">
              {grid.map((row, r) => 
                row.map((cell, c) => (
                  <div
                    key={`${r}-${c}`}
                    className={`relative border-slate-700/20 
                      ${cell.walls.top ? 'border-t-2' : ''} 
                      ${cell.walls.right ? 'border-r-2' : ''} 
                      ${cell.walls.bottom ? 'border-b-2' : ''} 
                      ${cell.walls.left ? 'border-l-2' : ''}
                    `}
                  >
                    {r === SIZE - 1 && c === SIZE - 1 && (
                      <div className="absolute inset-0 flex items-center justify-center text-[10px] bg-emerald-500/10 animate-pulse">
                        🏁
                      </div>
                    )}
                    {player.r === r && player.c === c && (
                      <div className="absolute inset-1 bg-indigo-500 rounded-full player-glow transition-all duration-150 z-10" />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Generando nivel...</span>
          </div>
        )}
      </div>

      {/* Controles e Interfaz Final - Altura fija contenida */}
      <div className="flex-none p-4 pb-8 sm:pb-10 bg-slate-950/80 backdrop-blur-sm z-20">
        {won ? (
          <div className="text-center bg-slate-900 border border-emerald-500/30 p-5 rounded-3xl animate-in fade-in zoom-in duration-300 shadow-2xl max-w-sm mx-auto">
            <h2 className="text-2xl font-black text-emerald-400 mb-1 italic tracking-tighter">¡LOGRADO!</h2>
            <div className="flex justify-center gap-4 mb-5 mt-2">
              <div className="text-center">
                <p className="text-[9px] text-slate-500 font-bold uppercase">Pasos</p>
                <p className="text-lg font-black text-white">{moves}</p>
              </div>
              <div className="w-[1px] bg-slate-800" />
              <div className="text-center">
                <p className="text-[9px] text-slate-500 font-bold uppercase">Tiempo</p>
                <p className="text-lg font-black text-white">{formatTime(time)}</p>
              </div>
            </div>
            <button 
              onClick={generateMaze}
              className="w-full bg-emerald-600 text-white py-3 rounded-2xl font-black text-base active:scale-95 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]"
            >
              SIGUIENTE NIVEL
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div />
              <NavButton 
                direction="top" dr={-1} dc={0} 
                icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>} 
              />
              <div />
              
              <NavButton 
                direction="left" dr={0} dc={-1} 
                icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>} 
              />
              <NavButton 
                direction="bottom" dr={1} dc={0} 
                icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>} 
              />
              <NavButton 
                direction="right" dr={0} dc={1} 
                icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="m9 6 6 6-6 6"/></svg>} 
              />
            </div>
            <p className="mt-3 text-[9px] text-slate-600 font-black uppercase tracking-[0.3em] animate-pulse">
              {!timerActive ? 'Pulsa para empezar' : 'Encuentra la salida'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Maze1P;
