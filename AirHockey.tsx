
import React, { useState, useEffect, useRef } from 'react';
import { record2PWin } from '../services/scoreService';

const TABLE_WIDTH = 320;
const TABLE_HEIGHT = 480;
const PADDLE_RADIUS = 28;
const PUCK_RADIUS = 16;
const GOAL_WIDTH = 130;
const WIN_SCORE = 5; // Cambiado a 5 goles
const MAX_PUCK_SPEED = 15;

interface Entity {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

const AirHockey: React.FC = () => {
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'gameOver' | 'goal'>('waiting');
  const [lastScorer, setLastScorer] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Refs para física
  const puck = useRef<Entity>({ x: TABLE_WIDTH / 2, y: TABLE_HEIGHT / 2, vx: 0, vy: 0 });
  const paddle1 = useRef<Entity>({ x: TABLE_WIDTH / 2, y: 80, vx: 0, vy: 0 });
  const paddle2 = useRef<Entity>({ x: TABLE_WIDTH / 2, y: TABLE_HEIGHT - 80, vx: 0, vy: 0 });
  const animationRef = useRef<number>(null);

  const resetPuck = () => {
    puck.current = { 
      x: TABLE_WIDTH / 2, 
      y: TABLE_HEIGHT / 2, 
      vx: 0, 
      vy: 0 
    };
    setGameState('waiting');
  };

  const handleGoal = (player: number) => {
    setLastScorer(player);
    setGameState('goal');
    
    // Vibración si está disponible
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

    // Pausa para la animación antes de resetear
    setTimeout(() => {
      setScores(s => {
        const next = player === 1 ? { ...s, p1: s.p1 + 1 } : { ...s, p2: s.p2 + 1 };
        if (next.p1 >= WIN_SCORE || next.p2 >= WIN_SCORE) {
          setGameState('gameOver');
        } else {
          resetPuck();
        }
        return next;
      });
    }, 1500);
  };

  const handleInput = (e: React.TouchEvent | React.MouseEvent) => {
    if (gameState === 'gameOver' || gameState === 'goal') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = TABLE_WIDTH / rect.width;
    const scaleY = TABLE_HEIGHT / rect.height;

    const processTouch = (clientX: number, clientY: number) => {
      const x = (clientX - rect.left) * scaleX;
      const y = (clientY - rect.top) * scaleY;

      if (gameState === 'waiting') setGameState('playing');

      if (y < TABLE_HEIGHT / 2) {
        paddle1.current.x = Math.max(PADDLE_RADIUS, Math.min(TABLE_WIDTH - PADDLE_RADIUS, x));
        paddle1.current.y = Math.max(PADDLE_RADIUS, Math.min(TABLE_HEIGHT / 2 - PADDLE_RADIUS - 5, y));
      } else {
        paddle2.current.x = Math.max(PADDLE_RADIUS, Math.min(TABLE_WIDTH - PADDLE_RADIUS, x));
        paddle2.current.y = Math.max(TABLE_HEIGHT / 2 + PADDLE_RADIUS + 5, Math.min(TABLE_HEIGHT - PADDLE_RADIUS, y));
      }
    };

    if ('touches' in e) {
      const touchEvent = e as React.TouchEvent;
      for (let i = 0; i < touchEvent.touches.length; i++) {
        const t = touchEvent.touches[i];
        processTouch(t.clientX, t.clientY);
      }
    } else {
      const mouseEvent = e as React.MouseEvent;
      processTouch(mouseEvent.clientX, mouseEvent.clientY);
    }
  };

  useEffect(() => {
    const update = () => {
      const p = puck.current;
      
      if (gameState === 'playing') {
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.99;
        p.vy *= 0.99;

        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed > MAX_PUCK_SPEED) {
          p.vx = (p.vx / speed) * MAX_PUCK_SPEED;
          p.vy = (p.vy / speed) * MAX_PUCK_SPEED;
        }

        if (p.x < PUCK_RADIUS) { p.x = PUCK_RADIUS; p.vx *= -0.8; }
        if (p.x > TABLE_WIDTH - PUCK_RADIUS) { p.x = TABLE_WIDTH - PUCK_RADIUS; p.vx *= -0.8; }

        const isInGoalWidth = p.x > (TABLE_WIDTH - GOAL_WIDTH) / 2 && p.x < (TABLE_WIDTH + GOAL_WIDTH) / 2;
        
        if (p.y < PUCK_RADIUS) {
          if (isInGoalWidth) {
            handleGoal(2);
          } else {
            p.y = PUCK_RADIUS; p.vy *= -0.8;
          }
        }

        if (p.y > TABLE_HEIGHT - PUCK_RADIUS) {
          if (isInGoalWidth) {
            handleGoal(1);
          } else {
            p.y = TABLE_HEIGHT - PUCK_RADIUS; p.vy *= -0.8;
          }
        }

        [paddle1.current, paddle2.current].forEach(paddle => {
          const dx = p.x - paddle.x;
          const dy = p.y - paddle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const minDistance = PADDLE_RADIUS + PUCK_RADIUS;
          if (distance < minDistance) {
            const angle = Math.atan2(dy, dx);
            p.x = paddle.x + Math.cos(angle) * minDistance;
            p.y = paddle.y + Math.sin(angle) * minDistance;
            p.vx = Math.cos(angle) * (speed + 6);
            p.vy = Math.sin(angle) * (speed + 6);
          }
        });
      }

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, TABLE_WIDTH, TABLE_HEIGHT);
        
        // Mesa
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 4;
        ctx.strokeRect(2, 2, TABLE_WIDTH - 4, TABLE_HEIGHT - 4);
        ctx.setLineDash([10, 10]);
        ctx.beginPath(); ctx.moveTo(0, TABLE_HEIGHT / 2); ctx.lineTo(TABLE_WIDTH, TABLE_HEIGHT / 2); ctx.stroke();
        ctx.setLineDash([]);

        // Goles
        ctx.lineWidth = 6;
        ctx.shadowBlur = 15;
        ctx.strokeStyle = '#3b82f6'; ctx.shadowColor = '#3b82f6';
        ctx.beginPath(); ctx.moveTo((TABLE_WIDTH - GOAL_WIDTH) / 2, 3); ctx.lineTo((TABLE_WIDTH + GOAL_WIDTH) / 2, 3); ctx.stroke();
        ctx.strokeStyle = '#ef4444'; ctx.shadowColor = '#ef4444';
        ctx.beginPath(); ctx.moveTo((TABLE_WIDTH - GOAL_WIDTH) / 2, TABLE_HEIGHT - 3); ctx.lineTo((TABLE_WIDTH + GOAL_WIDTH) / 2, TABLE_HEIGHT - 3); ctx.stroke();
        ctx.shadowBlur = 0;

        // Mazos
        const drawPaddle = (pad: Entity, color: string, glow: string) => {
          ctx.shadowBlur = 20; ctx.shadowColor = glow;
          ctx.fillStyle = color;
          ctx.beginPath(); ctx.arc(pad.x, pad.y, PADDLE_RADIUS, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = 'white'; ctx.lineWidth = 3; ctx.stroke();
          ctx.shadowBlur = 0;
        };
        drawPaddle(paddle1.current, '#3b82f6', '#2563eb');
        drawPaddle(paddle2.current, '#ef4444', '#dc2626');

        // Disco
        if (gameState !== 'goal') {
          ctx.shadowBlur = 15; ctx.shadowColor = 'white';
          ctx.fillStyle = gameState === 'waiting' ? `rgba(255,255,255,${0.5 + Math.sin(Date.now() / 100) * 0.5})` : 'white';
          ctx.beginPath(); ctx.arc(p.x, p.y, PUCK_RADIUS, 0, Math.PI * 2); ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
      animationRef.current = requestAnimationFrame(update);
    };

    animationRef.current = requestAnimationFrame(update);
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, [gameState]);

  const resetGame = () => {
    setScores({ p1: 0, p2: 0 });
    setGameState('waiting');
    resetPuck();
  };

  return (
    <div className="flex flex-col h-full items-center justify-center bg-slate-950 p-4 touch-none select-none overflow-hidden relative">
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(-5px, 5px); }
          50% { transform: translate(5px, -5px); }
          75% { transform: translate(-5px, -5px); }
        }
        .screen-shake {
          animation: shake 0.1s linear infinite;
        }
        @keyframes goal-pop {
          0% { transform: scale(0.5); opacity: 0; }
          50% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-goal {
          animation: goal-pop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}</style>

      {/* Marcador */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center pointer-events-none z-10">
        <div className={`transition-all duration-300 ${gameState === 'goal' && lastScorer === 1 ? 'scale-125' : ''}`}>
          <div className="bg-blue-600/20 px-4 py-2 rounded-xl border border-blue-500/30 backdrop-blur-sm">
            <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest">P1</p>
            <p className="text-2xl font-black text-white">{scores.p1}</p>
          </div>
        </div>
        <div className={`transition-all duration-300 ${gameState === 'goal' && lastScorer === 2 ? 'scale-125' : ''}`}>
          <div className="bg-red-600/20 px-4 py-2 rounded-xl border border-red-500/30 backdrop-blur-sm text-right">
            <p className="text-[10px] text-red-400 font-black uppercase tracking-widest">P2</p>
            <p className="text-2xl font-black text-white">{scores.p2}</p>
          </div>
        </div>
      </div>

      {/* Mesa de juego */}
      <div className={`relative border-4 border-slate-800 rounded-3xl bg-slate-900/30 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] ${gameState === 'goal' ? 'screen-shake' : ''}`}>
        <canvas 
          ref={canvasRef}
          width={TABLE_WIDTH}
          height={TABLE_HEIGHT}
          className="max-h-[75vh] w-auto aspect-[320/480] cursor-none"
          onTouchStart={handleInput}
          onTouchMove={handleInput}
          onMouseMove={handleInput}
          onMouseDown={handleInput}
        />

        {/* Animación de GOL */}
        {gameState === 'goal' && (
          <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div className={`animate-goal px-10 py-6 rounded-3xl border-4 backdrop-blur-md shadow-[0_0_50px_rgba(0,0,0,0.5)] 
              ${lastScorer === 1 ? 'bg-blue-600/40 border-blue-400 shadow-blue-500/50' : 'bg-red-600/40 border-red-400 shadow-red-500/50'}`}
            >
              <h2 className="text-6xl font-black text-white italic tracking-tighter drop-shadow-2xl">
                ¡GOOOL!
              </h2>
              <p className="text-center text-white font-black text-xl uppercase mt-2">
                P{lastScorer} ANOTA
              </p>
            </div>
            {/* Partículas de explosión (simuladas con gradientes radiales) */}
            <div className={`absolute inset-0 animate-ping opacity-30 ${lastScorer === 1 ? 'bg-blue-500' : 'bg-red-500'}`} />
          </div>
        )}

        {gameState === 'waiting' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-white font-black text-xs uppercase tracking-[0.5em] animate-pulse bg-black/40 px-4 py-2 rounded-full">Toca para Sacar</p>
          </div>
        )}

        {gameState === 'gameOver' && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center z-50 animate-in fade-in duration-300">
             <div className="text-6xl mb-4 animate-bounce">🏆</div>
             <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-1">
               ¡Victoria P{scores.p1 >= WIN_SCORE ? '1' : '2'}!
             </h2>
             <p className="text-slate-500 font-bold mb-8 uppercase tracking-widest text-xs">A los 5 goles conseguidos</p>
             <button 
                onClick={resetGame}
                className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-xl shadow-[0_0_20px_rgba(79,70,229,0.4)] active:scale-95 transition-all"
             >
                NUEVO DUELO
             </button>
          </div>
        )}
      </div>

      <div className="mt-6 text-center">
        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.3em]">Primer jugador a 5 puntos gana</p>
      </div>
    </div>
  );
};

export default AirHockey;
