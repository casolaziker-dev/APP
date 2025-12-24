
import React, { useState, useEffect } from 'react';
import { record2PWin, getStats } from '../services/scoreService';

const MathDuel: React.FC = () => {
  const [problem, setProblem] = useState({ text: '', ans: 0 });
  const [options, setOptions] = useState<number[]>([]);
  const [winner, setWinner] = useState<number | null>(null);
  const [scores, setScores] = useState({ p1: 0, p2: 0 });

  const generateProblem = () => {
    const a = Math.floor(Math.random() * 20) + 5;
    const b = Math.floor(Math.random() * 20) + 5;
    const ans = a + b;
    const opts = [ans, ans + 2, ans - 2, ans + 10].sort(() => Math.random() - 0.5);
    setProblem({ text: `${a} + ${b}`, ans });
    setOptions(opts);
    setWinner(null);
  };

  useEffect(() => {
    generateProblem();
    const stats = getStats('math-duel');
    setScores({ p1: stats.p1Wins || 0, p2: stats.p2Wins || 0 });
  }, []);

  const handleAnswer = (p: 1 | 2, opt: number) => {
    if (winner) return;
    if (opt === problem.ans) {
      setWinner(p);
      record2PWin('math-duel', p);
      setTimeout(generateProblem, 2000);
    } else {
      // Penalty or just ignore? Let's ignore to keep it simple.
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950">
      {/* Player 1 Top */}
      <div className="flex-1 rotate-180 p-4 flex flex-col items-center justify-center border-b border-slate-800 bg-blue-900/10">
        <h3 className="text-xl font-bold text-white mb-4">{problem.text} = ?</h3>
        <div className="grid grid-cols-2 gap-2 w-full max-w-[300px]">
          {options.map((o, i) => (
            <button key={i} onClick={() => handleAnswer(1, o)} className={`p-3 rounded-lg font-bold text-white ${winner === 1 ? 'bg-green-500' : 'bg-slate-800'}`}>
              {o}
            </button>
          ))}
        </div>
        <div className="mt-4 text-xs font-bold text-blue-400">Victorias: {scores.p1}</div>
      </div>

      <div className="h-1 bg-yellow-500" />

      {/* Player 2 Bottom */}
      <div className="flex-1 p-4 flex flex-col items-center justify-center bg-red-900/10">
        <h3 className="text-xl font-bold text-white mb-4">{problem.text} = ?</h3>
        <div className="grid grid-cols-2 gap-2 w-full max-w-[300px]">
          {options.map((o, i) => (
            <button key={i} onClick={() => handleAnswer(2, o)} className={`p-3 rounded-lg font-bold text-white ${winner === 2 ? 'bg-green-500' : 'bg-slate-800'}`}>
              {o}
            </button>
          ))}
        </div>
        <div className="mt-4 text-xs font-bold text-red-400">Victorias: {scores.p2}</div>
      </div>
    </div>
  );
};

export default MathDuel;
