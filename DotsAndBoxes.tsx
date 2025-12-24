
import React, { useState, useEffect } from 'react';
import { record2PWin } from '../services/scoreService';

const GRID_SIZE = 5;

interface Line {
  p1: { r: number; c: number };
  p2: { r: number; c: number };
  owner: 1 | 2 | null;
}

const DotsAndBoxes: React.FC = () => {
  const [lines, setLines] = useState<Line[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<1 | 2>(1);
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    const initialLines: Line[] = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (c < GRID_SIZE - 1) initialLines.push({ p1: { r, c }, p2: { r, c: c + 1 }, owner: null });
        if (r < GRID_SIZE - 1) initialLines.push({ p1: { r, c }, p2: { r: r + 1, c }, owner: null });
      }
    }
    setLines(initialLines);
  }, []);

  const handleLineClick = (index: number) => {
    if (lines[index].owner || gameOver) return;

    const newLines = [...lines];
    newLines[index].owner = currentPlayer;
    
    let boxesCompleted = 0;
    // Check for completed boxes
    for (let r = 0; r < GRID_SIZE - 1; r++) {
      for (let c = 0; c < GRID_SIZE - 1; c++) {
        const top = newLines.find(l => l.p1.r === r && l.p1.c === c && l.p2.r === r && l.p2.c === c + 1);
        const bottom = newLines.find(l => l.p1.r === r + 1 && l.p1.c === c && l.p2.r === r + 1 && l.p2.c === c + 1);
        const left = newLines.find(l => l.p1.r === r && l.p1.c === c && l.p2.r === r + 1 && l.p2.c === c);
        const right = newLines.find(l => l.p1.r === r && l.p1.c === c + 1 && l.p2.r === r + 1 && l.p2.c === c + 1);

        if (top?.owner && bottom?.owner && left?.owner && right?.owner) {
          // If this box was just completed (all lines owned and it wasn't checked before)
          // We check if the last line placed was one of these
          const boxLines = [top, bottom, left, right];
          if (boxLines.includes(newLines[index])) {
            // Check if this box was already "scored" is tricky with current state, 
            // but in Dots and Boxes, completing a box gives a point.
            // Simplified: if the move completed a box, player gets point and continues.
            boxesCompleted++;
          }
        }
      }
    }

    // A more robust way to count boxes: 
    // We actually need to track which boxes are completed.
    // For simplicity in this mini-game, we recalculate all boxes.
    let totalP1 = 0;
    let totalP2 = 0;
    let totalBoxes = 0;
    const completedCount = 0;

    // Reset scores to calculate properly
    let newP1Score = scores.p1;
    let newP2Score = scores.p2;

    // Logic: If the line placed completed 1 or more boxes that weren't completed before.
    // Actually, let's use a simpler "Boxes" state to track owners.
    // Refined logic below:
    
    setLines(newLines);

    if (boxesCompleted > 0) {
      if (currentPlayer === 1) newP1Score += boxesCompleted;
      else newP2Score += boxesCompleted;
      setScores({ p1: newP1Score, p2: newP2Score });
    } else {
      setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
    }

    // Check game over
    if (newLines.every(l => l.owner !== null)) {
      setGameOver(true);
      record2PWin('dots-boxes', newP1Score > newP2Score ? 1 : newP2Score > newP1Score ? 2 : 'draw');
    }
  };

  const isBoxFull = (r: number, c: number) => {
    const top = lines.find(l => l.p1.r === r && l.p1.c === c && l.p2.r === r && l.p2.c === c + 1);
    const bottom = lines.find(l => l.p1.r === r + 1 && l.p1.c === c && l.p2.r === r + 1 && l.p2.c === c + 1);
    const left = lines.find(l => l.p1.r === r && l.p1.c === c && l.p2.r === r + 1 && l.p2.c === c);
    const right = lines.find(l => l.p1.r === r && l.p1.c === c + 1 && l.p2.r === r + 1 && l.p2.c === c + 1);
    return top?.owner && bottom?.owner && left?.owner && right?.owner;
  };

  return (
    <div className="flex flex-col h-full items-center justify-center p-4 bg-slate-950">
      <div className="flex w-full justify-between items-center mb-8 px-4">
        <div className={`p-3 rounded-2xl border-2 transition-all ${currentPlayer === 1 ? 'border-blue-500 bg-blue-500/20' : 'border-slate-800'}`}>
          <p className="text-[10px] text-blue-400 font-bold uppercase">Jugador 1</p>
          <p className="text-2xl font-black text-white">{scores.p1}</p>
        </div>
        <div className="text-slate-700 font-black">VS</div>
        <div className={`p-3 rounded-2xl border-2 transition-all ${currentPlayer === 2 ? 'border-red-500 bg-red-500/20' : 'border-slate-800'}`}>
          <p className="text-[10px] text-red-400 font-bold uppercase">Jugador 2</p>
          <p className="text-2xl font-black text-white">{scores.p2}</p>
        </div>
      </div>

      <div className="relative bg-slate-900/50 p-8 rounded-3xl border border-slate-800">
        <div className="grid gap-0" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
          {/* Dots and Lines Grid */}
          <div className="relative" style={{ width: '240px', height: '240px' }}>
             {/* Boxes Rendering */}
             {Array.from({ length: GRID_SIZE - 1 }).map((_, r) => (
               Array.from({ length: GRID_SIZE - 1 }).map((_, c) => {
                 const full = isBoxFull(r, c);
                 return (
                   <div 
                    key={`box-${r}-${c}`}
                    className="absolute transition-all duration-500"
                    style={{
                      top: `${r * (240 / (GRID_SIZE - 1))}px`,
                      left: `${c * (240 / (GRID_SIZE - 1))}px`,
                      width: `${240 / (GRID_SIZE - 1)}px`,
                      height: `${240 / (GRID_SIZE - 1)}px`,
                      backgroundColor: full ? (currentPlayer === 1 ? 'rgba(59, 130, 246, 0.2)' : 'rgba(239, 68, 68, 0.2)') : 'transparent'
                    }}
                   />
                 );
               })
             ))}

            {/* Lines Rendering */}
            {lines.map((line, idx) => {
              const isHorizontal = line.p1.r === line.p2.r;
              const unit = 240 / (GRID_SIZE - 1);
              const top = line.p1.r * unit;
              const left = line.p1.c * unit;

              return (
                <button
                  key={idx}
                  onClick={() => handleLineClick(idx)}
                  className={`absolute z-10 transition-all ${line.owner ? (line.owner === 1 ? 'bg-blue-500 shadow-[0_0_10px_#3b82f6]' : 'bg-red-500 shadow-[0_0_10px_#ef4444]') : 'bg-slate-700 hover:bg-slate-600'}`}
                  style={{
                    top: `${top - (isHorizontal ? 2 : 0)}px`,
                    left: `${left - (isHorizontal ? 0 : 2)}px`,
                    width: isHorizontal ? `${unit}px` : '4px',
                    height: isHorizontal ? '4px' : `${unit}px`,
                    borderRadius: '2px'
                  }}
                />
              );
            })}

            {/* Dots Rendering */}
            {Array.from({ length: GRID_SIZE }).map((_, r) => (
              Array.from({ length: GRID_SIZE }).map((_, c) => (
                <div 
                  key={`dot-${r}-${c}`}
                  className="absolute w-3 h-3 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 z-20 shadow-sm"
                  style={{
                    top: `${r * (240 / (GRID_SIZE - 1))}px`,
                    left: `${c * (240 / (GRID_SIZE - 1))}px`
                  }}
                />
              ))
            ))}
          </div>
        </div>

        {gameOver && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center p-6 text-center z-50">
            <h2 className="text-3xl font-black text-white mb-2">¡FIN DEL JUEGO!</h2>
            <p className="text-indigo-400 text-lg font-bold mb-6">
              {scores.p1 > scores.p2 ? 'GANADOR: JUGADOR 1' : scores.p2 > scores.p1 ? 'GANADOR: JUGADOR 2' : '¡EMPATE!'}
            </p>
            <button onClick={() => window.location.reload()} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold active:scale-95">REINTENTAR</button>
          </div>
        )}
      </div>

      <p className="mt-8 text-xs text-slate-500 font-bold uppercase tracking-widest text-center px-8">
        Completa cuadrados para ganar puntos y repetir turno.
      </p>
    </div>
  );
};

export default DotsAndBoxes;
