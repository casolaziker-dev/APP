
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { record1PScore, getStats } from '../services/scoreService';

const GRID_SIZE = 15;
const INITIAL_SNAKE = [{ x: 3, y: 7 }, { x: 2, y: 7 }, { x: 1, y: 7 }];

const SnakeGame: React.FC = () => {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState({ x: 10, y: 7 });
  const [dir, setDir] = useState({ x: 1, y: 0 });
  const [nextDir, setNextDir] = useState({ x: 1, y: 0 });
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameOver'>('idle');
  const [highScore, setHighScore] = useState(0);

  const snakeRef = useRef(INITIAL_SNAKE);
  const foodRef = useRef({ x: 10, y: 7 });
  const dirRef = useRef({ x: 1, y: 0 });

  useEffect(() => {
    setHighScore(getStats('snake').highScore || 0);
  }, []);

  const generateFood = useCallback(() => {
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      const onSnake = snakeRef.current.some(seg => seg.x === newFood!.x && seg.y === newFood!.y);
      if (!onSnake) break;
    }
    setFood(newFood);
    foodRef.current = newFood;
  }, []);

  const moveSnake = useCallback(() => {
    dirRef.current = nextDir;
    const head = { 
      x: snakeRef.current[0].x + dirRef.current.x, 
      y: snakeRef.current[0].y + dirRef.current.y 
    };
    
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE ||
        snakeRef.current.some(seg => seg.x === head.x && seg.y === head.y)) {
      setGameState('gameOver');
      record1PScore('snake', score, 'high');
      return;
    }

    const newSnake = [head, ...snakeRef.current];
    if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
      setScore(s => s + 1);
      generateFood();
    } else {
      newSnake.pop();
    }

    snakeRef.current = newSnake;
    setSnake(newSnake);
  }, [nextDir, generateFood, score]);

  useEffect(() => {
    if (gameState === 'playing') {
      // VELOCIDAD REDUCIDA: 200ms para un control más pausado
      const timer = setInterval(moveSnake, 200);
      return () => clearInterval(timer);
    }
  }, [gameState, moveSnake]);

  const handleInput = (d: {x: number, y: number}) => {
    if (gameState === 'idle') setGameState('playing');
    if (d.x !== 0 && dirRef.current.x !== 0) return;
    if (d.y !== 0 && dirRef.current.y !== 0) return;
    setNextDir(d);
  };

  const getEyeRotation = () => {
    if (nextDir.x === 1) return 'rotate-0';
    if (nextDir.x === -1) return 'rotate-180';
    if (nextDir.y === 1) return 'rotate-90';
    return '-rotate-90';
  };

  return (
    <div className="flex flex-col h-full bg-[#578a34] select-none overflow-hidden">
      {/* Top Bar Style Google */}
      <div className="flex items-center justify-between px-6 py-3 bg-[#4a752c] shadow-md z-10">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🍎</span>
          <span className="text-2xl font-bold text-white leading-none">{score}</span>
        </div>
        <div className="flex gap-4">
          <button className="text-white/80 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>
          </button>
          <button className="text-white/80 hover:text-white">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
          </button>
        </div>
      </div>

      {/* Game Area */}
      <div className="flex-1 flex items-center justify-center p-4 relative">
        <div 
          className="relative rounded shadow-2xl overflow-hidden"
          style={{ 
            width: 'min(360px, 90vw)', 
            height: 'min(360px, 90vw)',
            display: 'grid',
            gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
            gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`
          }}
        >
          {/* Checkered Background */}
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
            const x = i % GRID_SIZE;
            const y = Math.floor(i / GRID_SIZE);
            return (
              <div 
                key={i} 
                className={(x + y) % 2 === 0 ? 'bg-[#aad751]' : 'bg-[#a2d149]'}
              />
            );
          })}

          {/* Food */}
          <div 
            className="absolute flex items-center justify-center transition-all duration-300"
            style={{ 
              width: `${100/GRID_SIZE}%`, 
              height: `${100/GRID_SIZE}%`,
              left: `${(food.x * 100) / GRID_SIZE}%`,
              top: `${(food.y * 100) / GRID_SIZE}%`
            }}
          >
            <span className="text-2xl drop-shadow-md">🍎</span>
          </div>

          {/* Snake */}
          {snake.map((seg, i) => {
            const isHead = i === 0;
            return (
              <div 
                key={i}
                className={`absolute transition-all duration-150 ${isHead ? 'z-20' : 'z-10'}`}
                style={{ 
                  width: `${100/GRID_SIZE}%`, 
                  height: `${100/GRID_SIZE}%`,
                  left: `${(seg.x * 100) / GRID_SIZE}%`,
                  top: `${(seg.y * 100) / GRID_SIZE}%`,
                  padding: '2px'
                }}
              >
                <div className={`w-full h-full bg-[#4572e8] ${isHead ? 'rounded-md' : 'rounded-sm'} flex items-center justify-center relative`}>
                  {isHead && (
                    <div className={`flex gap-1.5 transition-transform duration-200 ${getEyeRotation()}`}>
                      <div className="w-1.5 h-1.5 bg-white rounded-full flex items-center justify-center">
                        <div className="w-0.5 h-0.5 bg-[#4572e8] rounded-full translate-x-0.5" />
                      </div>
                      <div className="w-1.5 h-1.5 bg-white rounded-full flex items-center justify-center">
                        <div className="w-0.5 h-0.5 bg-[#4572e8] rounded-full translate-x-0.5" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Instructions Overlay */}
          {gameState === 'idle' && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-30">
              <div className="bg-[#4a752c]/90 p-4 rounded-2xl flex flex-col items-center gap-2">
                <div className="relative">
                  <div className="grid grid-cols-3 gap-1">
                    <div /><div className="w-6 h-6 border-2 border-white/40 rounded flex items-center justify-center text-[10px] text-white">▲</div><div />
                    <div className="w-6 h-6 border-2 border-white/40 rounded flex items-center justify-center text-[10px] text-white">◀</div>
                    <div className="w-6 h-6 border-2 border-white/40 rounded flex items-center justify-center text-[10px] text-white">▼</div>
                    <div className="w-6 h-6 border-2 border-white/40 rounded flex items-center justify-center text-[10px] text-white">▶</div>
                  </div>
                  <div className="absolute top-4 right-[-10px] text-3xl">👆</div>
                </div>
              </div>
            </div>
          )}

          {/* Game Over Screen */}
          {gameState === 'gameOver' && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-40 backdrop-blur-sm animate-in fade-in duration-300">
              <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl text-center max-w-[260px]">
                <h3 className="text-3xl font-bold text-slate-800 mb-2">Puntuación</h3>
                <div className="flex items-center justify-center gap-2 mb-6">
                  <span className="text-3xl">🍎</span>
                  <span className="text-4xl font-black text-slate-900">{score}</span>
                </div>
                <button 
                  onClick={() => {
                    setSnake(INITIAL_SNAKE);
                    snakeRef.current = INITIAL_SNAKE;
                    setScore(0);
                    setGameState('idle');
                    setNextDir({ x: 1, y: 0 });
                    dirRef.current = { x: 1, y: 0 };
                  }}
                  className="w-full bg-[#4572e8] hover:bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition-all"
                >
                  REINTENTAR
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Control D-Pad Clean */}
      <div className="bg-[#578a34] p-8 flex flex-col items-center gap-2">
        <button 
          onClick={() => handleInput({x:0, y:-1})}
          className="w-16 h-16 bg-[#4a752c] rounded-2xl flex items-center justify-center text-white active:bg-[#3d6124] transition-colors shadow-lg"
        >
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M7 14l5-5 5 5H7z"/></svg>
        </button>
        <div className="flex gap-12">
          <button 
            onClick={() => handleInput({x:-1, y:0})}
            className="w-16 h-16 bg-[#4a752c] rounded-2xl flex items-center justify-center text-white active:bg-[#3d6124] transition-colors shadow-lg"
          >
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M14 7l-5 5 5 5V7z"/></svg>
          </button>
          <button 
            onClick={() => handleInput({x:1, y:0})}
            className="w-16 h-16 bg-[#4a752c] rounded-2xl flex items-center justify-center text-white active:bg-[#3d6124] transition-colors shadow-lg"
          >
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M10 17l5-5-5-5v10z"/></svg>
          </button>
        </div>
        <button 
          onClick={() => handleInput({x:0, y:1})}
          className="w-16 h-16 bg-[#4a752c] rounded-2xl flex items-center justify-center text-white active:bg-[#3d6124] transition-colors shadow-lg"
        >
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5H7z"/></svg>
        </button>
      </div>
    </div>
  );
};

export default SnakeGame;
