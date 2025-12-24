
import React, { useState, useEffect } from 'react';
import { record2PWin, getStats } from '../services/scoreService';

const TicTacToe: React.FC = () => {
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [history, setHistory] = useState({ p1: 0, p2: 0 });

  useEffect(() => {
    const stats = getStats('tictactoe');
    setHistory({ p1: stats.p1Wins || 0, p2: stats.p2Wins || 0 });
  }, []);

  const calculateWinner = (squares: (string | null)[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    for (const [a, b, c] of lines) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return squares.includes(null) ? null : 'Draw';
  };

  const winner = calculateWinner(board);

  const handleClick = (idx: number) => {
    if (board[idx] || winner) return;
    const newBoard = [...board];
    newBoard[idx] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    setIsXNext(!isXNext);

    const nextWinner = calculateWinner(newBoard);
    if (nextWinner) {
      if (nextWinner === 'X') {
        record2PWin('tictactoe', 1);
      } else if (nextWinner === 'O') {
        record2PWin('tictactoe', 2);
      } else {
        record2PWin('tictactoe', 'draw');
      }
    }
  };

  const reset = () => {
    const stats = getStats('tictactoe');
    setHistory({ p1: stats.p1Wins || 0, p2: stats.p2Wins || 0 });
    setBoard(Array(9).fill(null));
    setIsXNext(true);
  };

  return (
    <div className="flex flex-col items-center pt-8 space-y-8">
      <div className="flex space-x-12 items-center">
        <div className="flex flex-col items-center">
          <div className={`p-4 rounded-2xl border-2 mb-2 ${isXNext && !winner ? 'border-blue-400 bg-blue-500/10' : 'border-transparent'}`}>
            <span className="text-3xl font-bold text-blue-400">X</span>
          </div>
          <span className="text-xs font-bold text-slate-500 uppercase">Victorias: {history.p1}</span>
        </div>
        
        <div className="flex flex-col items-center">
          <div className={`p-4 rounded-2xl border-2 mb-2 ${!isXNext && !winner ? 'border-red-400 bg-red-500/10' : 'border-transparent'}`}>
            <span className="text-3xl font-bold text-red-400">O</span>
          </div>
          <span className="text-xs font-bold text-slate-500 uppercase">Victorias: {history.p2}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 bg-slate-800 p-2 rounded-2xl shadow-2xl">
        {board.map((val, idx) => (
          <button
            key={idx}
            onClick={() => handleClick(idx)}
            className="w-24 h-24 bg-slate-900 rounded-xl flex items-center justify-center text-4xl font-black transition-transform active:scale-90"
          >
            <span className={val === 'X' ? 'text-blue-400' : 'text-red-400'}>
              {val}
            </span>
          </button>
        ))}
      </div>

      {winner && (
        <div className="text-center space-y-4">
          <h3 className="text-2xl font-bold text-white">
            {winner === 'Draw' ? '¡Empate!' : `¡Ganó ${winner}!`}
          </h3>
          <button
            onClick={reset}
            className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold active:scale-95 transition-transform"
          >
            Reiniciar
          </button>
        </div>
      )}
    </div>
  );
};

export default TicTacToe;
