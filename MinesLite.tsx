
import React, { useState, useEffect } from 'react';
import { record1PScore, getStats } from '../services/scoreService';

const GRID_SIZE = 8;
const TOTAL_MINES = 10;

interface Cell {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborCount: number;
}

const MinesLite: React.FC = () => {
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [isWin, setIsWin] = useState(false);
  const [flagMode, setFlagMode] = useState(false);
  const [flagsUsed, setFlagsUsed] = useState(0);

  const initGrid = () => {
    let newGrid: Cell[][] = Array.from({ length: GRID_SIZE }, () =>
      Array.from({ length: GRID_SIZE }, () => ({
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        neighborCount: 0,
      }))
    );

    // Place mines
    let minesPlaced = 0;
    while (minesPlaced < TOTAL_MINES) {
      const r = Math.floor(Math.random() * GRID_SIZE);
      const c = Math.floor(Math.random() * GRID_SIZE);
      if (!newGrid[r][c].isMine) {
        newGrid[r][c].isMine = true;
        minesPlaced++;
      }
    }

    // Calculate neighbors
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (!newGrid[r][c].isMine) {
          let count = 0;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = r + dr, nc = c + dc;
              if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE && newGrid[nr][nc].isMine) {
                count++;
              }
            }
          }
          newGrid[r][c].neighborCount = count;
        }
      }
    }
    setGrid(newGrid);
    setGameOver(false);
    setIsWin(false);
    setFlagsUsed(0);
  };

  useEffect(() => {
    initGrid();
  }, []);

  const revealCell = (r: number, c: number) => {
    if (gameOver || grid[r][c].isRevealed || grid[r][c].isFlagged) return;

    const newGrid = [...grid.map(row => [...row])];

    if (newGrid[r][c].isMine) {
      // Game Over
      newGrid[r][c].isRevealed = true;
      setGrid(newGrid);
      setGameOver(true);
      return;
    }

    const floodFill = (row: number, col: number) => {
      if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE || newGrid[row][col].isRevealed || newGrid[row][col].isMine) return;
      
      newGrid[row][col].isRevealed = true;
      if (newGrid[row][col].neighborCount === 0) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            floodFill(row + dr, col + dc);
          }
        }
      }
    };

    floodFill(r, c);
    setGrid(newGrid);

    // Check Win
    const allNonMinesRevealed = newGrid.every(row => 
      row.every(cell => cell.isMine || cell.isRevealed)
    );
    if (allNonMinesRevealed) {
      setIsWin(true);
      setGameOver(true);
      record1PScore('mine-lite', 1, 'high'); // Record win
    }
  };

  const toggleFlag = (r: number, c: number) => {
    if (gameOver || grid[r][c].isRevealed) return;
    const newGrid = [...grid.map(row => [...row])];
    const cell = newGrid[r][c];
    cell.isFlagged = !cell.isFlagged;
    setFlagsUsed(prev => cell.isFlagged ? prev + 1 : prev - 1);
    setGrid(newGrid);
  };

  const handleCellClick = (r: number, c: number) => {
    if (flagMode) {
      toggleFlag(r, c);
    } else {
      revealCell(r, c);
    }
  };

  return (
    <div className="flex flex-col items-center h-full p-4">
      <div className="w-full flex justify-between items-center mb-6 px-2">
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-500 font-bold uppercase">Mina-Lite</span>
          <span className="text-xl font-bold text-white">💣 {TOTAL_MINES - flagsUsed}</span>
        </div>
        <button 
          onClick={() => setFlagMode(!flagMode)}
          className={`px-4 py-2 rounded-xl font-bold transition-all ${flagMode ? 'bg-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-slate-800 text-slate-400'}`}
        >
          {flagMode ? '🚩 MODO BANDERA' : '👆 MODO REVELAR'}
        </button>
      </div>

      <div className="bg-slate-900 p-2 rounded-2xl shadow-2xl border-4 border-slate-800">
        <div className="grid grid-cols-8 gap-1">
          {grid.map((row, r) => 
            row.map((cell, c) => (
              <button
                key={`${r}-${c}`}
                onClick={() => handleCellClick(r, c)}
                className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm transition-all
                  ${cell.isRevealed 
                    ? cell.isMine ? 'bg-red-500' : 'bg-slate-800 text-indigo-400' 
                    : 'bg-slate-700 active:scale-90 hover:bg-slate-600 shadow-inner'
                  }
                `}
              >
                {cell.isRevealed ? (
                  cell.isMine ? '💥' : cell.neighborCount > 0 ? cell.neighborCount : ''
                ) : (
                  cell.isFlagged ? '🚩' : ''
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {gameOver && (
        <div className="mt-8 text-center bg-slate-800/80 p-6 rounded-3xl border border-slate-700 w-full">
          <h2 className={`text-2xl font-black mb-2 ${isWin ? 'text-emerald-400' : 'text-red-500'}`}>
            {isWin ? '¡DESACTIVADO CON ÉXITO!' : '¡BOMBA DETONADA!'}
          </h2>
          <button 
            onClick={initGrid}
            className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold active:scale-95 transition-transform"
          >
            NUEVA MISIÓN
          </button>
        </div>
      )}
    </div>
  );
};

export default MinesLite;
