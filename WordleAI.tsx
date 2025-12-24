
import React, { useState, useEffect } from 'react';
import { getWordleWord } from '../services/geminiService';
import { record1PScore } from '../services/scoreService';

type Status = 'correct' | 'present' | 'absent' | 'empty';

const WordleAI: React.FC = () => {
  const [targetWord, setTargetWord] = useState('');
  const [guesses, setGuesses] = useState<string[]>(Array(6).fill(''));
  const [currentGuessIndex, setCurrentGuessIndex] = useState(0);
  const [currentLetter, setCurrentLetter] = useState(0);
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost' | 'loading'>('loading');
  const [usedLetters, setUsedLetters] = useState<Record<string, Status>>({});

  const initGame = async () => {
    setGameState('loading');
    const word = await getWordleWord();
    setTargetWord(word);
    setGuesses(Array(6).fill(''));
    setCurrentGuessIndex(0);
    setCurrentLetter(0);
    setUsedLetters({});
    setGameState('playing');
  };

  useEffect(() => {
    initGame();
  }, []);

  const onKeyPress = (key: string) => {
    if (gameState !== 'playing') return;

    if (key === 'ENTER') {
      if (currentLetter === 5) {
        submitGuess();
      }
      return;
    }

    if (key === 'BACKSPACE') {
      if (currentLetter > 0) {
        const newGuesses = [...guesses];
        const row = newGuesses[currentGuessIndex];
        newGuesses[currentGuessIndex] = row.substring(0, row.length - 1);
        setGuesses(newGuesses);
        setCurrentLetter(currentLetter - 1);
      }
      return;
    }

    if (currentLetter < 5 && key.length === 1 && key.match(/[A-Z]/)) {
      const newGuesses = [...guesses];
      newGuesses[currentGuessIndex] += key;
      setGuesses(newGuesses);
      setCurrentLetter(currentLetter + 1);
    }
  };

  const submitGuess = () => {
    const guess = guesses[currentGuessIndex];
    const newUsedLetters = { ...usedLetters };

    for (let i = 0; i < 5; i++) {
      const char = guess[i];
      let status: Status = 'absent';
      if (targetWord[i] === char) {
        status = 'correct';
      } else if (targetWord.includes(char)) {
        status = 'present';
      }

      if (newUsedLetters[char] !== 'correct') {
        newUsedLetters[char] = status;
      }
    }

    setUsedLetters(newUsedLetters);

    if (guess === targetWord) {
      setGameState('won');
      record1PScore('wordle-ai', 6 - currentGuessIndex, 'high');
    } else if (currentGuessIndex === 5) {
      setGameState('lost');
    } else {
      setCurrentGuessIndex(currentGuessIndex + 1);
      setCurrentLetter(0);
    }
  };

  const getLetterStatus = (rowIdx: number, colIdx: number): Status => {
    if (rowIdx >= currentGuessIndex) return 'empty';
    
    const char = guesses[rowIdx][colIdx];
    if (targetWord[colIdx] === char) return 'correct';
    if (targetWord.includes(char)) return 'present';
    return 'absent';
  };

  const getStatusColor = (status: Status) => {
    switch (status) {
      case 'correct': return 'bg-emerald-500 border-emerald-500 text-white';
      case 'present': return 'bg-amber-500 border-amber-500 text-white';
      case 'absent': return 'bg-slate-700 border-slate-700 text-white';
      default: return 'bg-transparent border-slate-700 text-white';
    }
  };

  if (gameState === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center h-full pt-20">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-400">Gemini está eligiendo una palabra...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center h-full p-2 space-y-4">
      {/* Grid */}
      <div className="grid grid-rows-6 gap-2">
        {guesses.map((row, r) => (
          <div key={r} className="grid grid-cols-5 gap-2">
            {[0, 1, 2, 3, 4].map((c) => {
              const char = row[c] || '';
              const status = getLetterStatus(r, c);
              return (
                <div
                  key={c}
                  className={`w-12 h-12 border-2 flex items-center justify-center text-2xl font-black rounded-lg transition-all duration-500 ${getStatusColor(status)} ${char ? 'scale-105' : ''}`}
                >
                  {char}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {gameState !== 'playing' && (
        <div className="text-center bg-slate-800 p-4 rounded-2xl border border-slate-700 shadow-xl w-full max-w-[300px]">
          <h2 className={`text-xl font-bold mb-1 ${gameState === 'won' ? 'text-emerald-400' : 'text-rose-400'}`}>
            {gameState === 'won' ? '¡Increíble!' : '¡Oh no!'}
          </h2>
          <p className="text-slate-400 text-xs mb-3">La palabra era: <span className="text-white font-black">{targetWord}</span></p>
          <button 
            onClick={initGame}
            className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold text-sm active:scale-95 transition-all"
          >
            NUEVA PALABRA
          </button>
        </div>
      )}

      {/* Keyboard */}
      <div className="w-full max-w-[400px] space-y-2 pb-4">
        {[
          ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
          ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ñ'],
          ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
        ].map((row, i) => (
          <div key={i} className="flex justify-center gap-1">
            {row.map((key) => (
              <button
                key={key}
                onClick={() => onKeyPress(key)}
                className={`
                  ${key.length > 1 ? 'px-2 text-[10px]' : 'w-8 h-10 text-sm'} 
                  rounded flex items-center justify-center font-bold transition-all active:scale-90
                  ${usedLetters[key] === 'correct' ? 'bg-emerald-500 text-white' : 
                    usedLetters[key] === 'present' ? 'bg-amber-500 text-white' :
                    usedLetters[key] === 'absent' ? 'bg-slate-800 text-slate-500' : 
                    'bg-slate-700 text-white'}
                `}
              >
                {key === 'BACKSPACE' ? '⌫' : key}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WordleAI;
