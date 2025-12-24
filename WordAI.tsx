
import React, { useState, useEffect } from 'react';
import { getWordClue } from '../services/geminiService';
import { record1PScore } from '../services/scoreService';

const WordAI: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ word: '', clue: '' });
  const [guess, setGuess] = useState('');
  const [message, setMessage] = useState('');
  const [tries, setTries] = useState(0);
  const [solved, setSolved] = useState(false);

  const fetchNewWord = async () => {
    setLoading(true);
    setSolved(false);
    setGuess('');
    setMessage('');
    setTries(0);
    const result = await getWordClue();
    setData({ word: result.word.toUpperCase(), clue: result.clue });
    setLoading(false);
  };

  useEffect(() => {
    fetchNewWord();
  }, []);

  const handleCheck = () => {
    if (guess.toUpperCase().trim() === data.word) {
      setSolved(true);
      setMessage('¡Correcto! Eres un genio.');
      record1PScore('word-ai', 10, 'high');
    } else {
      setTries(t => t + 1);
      setMessage('Nop, intenta de nuevo.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full pt-20">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-400">Gemini está pensando una palabra...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 flex flex-col items-center">
      <div className="bg-slate-800 p-6 rounded-2xl border border-indigo-500/30 w-full shadow-2xl">
        <h3 className="text-xs font-bold text-indigo-400 uppercase mb-2 tracking-widest">Pista de la IA:</h3>
        <p className="text-lg text-white font-medium italic">"{data.clue}"</p>
      </div>

      <div className="w-full space-y-4">
        <input
          type="text"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          disabled={solved}
          placeholder="Escribe tu respuesta..."
          className="w-full bg-slate-900 border-2 border-slate-700 rounded-xl p-4 text-center text-xl font-bold text-white focus:border-indigo-500 outline-none transition-all uppercase"
        />
        
        {!solved ? (
          <button
            onClick={handleCheck}
            className="w-full bg-indigo-600 p-4 rounded-xl font-black text-white active:scale-95 transition-transform"
          >
            COMPROBAR
          </button>
        ) : (
          <button
            onClick={fetchNewWord}
            className="w-full bg-emerald-600 p-4 rounded-xl font-black text-white active:scale-95 transition-transform"
          >
            SIGUIENTE PALABRA
          </button>
        )}
      </div>

      <div className="text-center">
        <p className={`font-bold ${solved ? 'text-emerald-400' : 'text-rose-400'}`}>{message}</p>
        <p className="text-slate-500 text-xs mt-2 uppercase font-bold">Intentos: {tries}</p>
      </div>
    </div>
  );
};

export default WordAI;
