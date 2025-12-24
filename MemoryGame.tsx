
import React, { useState, useEffect } from 'react';
import { record1PScore, getStats } from '../services/scoreService';

const EMOJIS = ['🚀', '🦊', '🎨', '🍕', '🎸', '🌈', '💎', '⚽'];

interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const MemoryGame: React.FC = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [bestMoves, setBestMoves] = useState<number | undefined>(undefined);

  const initGame = () => {
    const stats = getStats('memory');
    setBestMoves(stats.bestMoves);
    
    const deck = [...EMOJIS, ...EMOJIS]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false,
      }));
    setCards(deck);
    setFlippedCards([]);
    setMoves(0);
  };

  useEffect(() => {
    initGame();
  }, []);

  useEffect(() => {
    if (flippedCards.length === 2) {
      const [idx1, idx2] = flippedCards;
      if (cards[idx1].emoji === cards[idx2].emoji) {
        setCards(prev => prev.map((card, i) => 
          (i === idx1 || i === idx2) ? { ...card, isMatched: true } : card
        ));
        setFlippedCards([]);
      } else {
        setTimeout(() => {
          setCards(prev => prev.map((card, i) => 
            (i === idx1 || i === idx2) ? { ...card, isFlipped: false } : card
          ));
          setFlippedCards([]);
        }, 1000);
      }
      setMoves(m => m + 1);
    }
  }, [flippedCards, cards]);

  const handleFlip = (idx: number) => {
    if (flippedCards.length === 2 || cards[idx].isFlipped || cards[idx].isMatched) return;
    
    setCards(prev => prev.map((card, i) => i === idx ? { ...card, isFlipped: true } : card));
    setFlippedCards(prev => [...prev, idx]);
  };

  const isWon = cards.length > 0 && cards.every(c => c.isMatched);

  useEffect(() => {
    if (isWon) {
      record1PScore('memory', moves, 'low');
    }
  }, [isWon]);

  return (
    <div className="flex flex-col items-center pt-4 space-y-6">
      <div className="flex flex-col items-center w-full space-y-1">
        <div className="flex justify-between w-full px-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
           <span>Movimientos: {moves}</span>
           <span>Récord: {bestMoves || '--'}</span>
        </div>
        {isWon && (
          <div className="text-center">
            <h3 className="text-emerald-400 font-bold animate-bounce text-lg">¡COMPLETADO!</h3>
            {(!bestMoves || moves < bestMoves) && <p className="text-xs text-yellow-400 font-bold">¡NUEVO RÉCORD!</p>}
          </div>
        )}
      </div>

      <div className="grid grid-cols-4 gap-2">
        {cards.map((card, idx) => (
          <button
            key={card.id}
            onClick={() => handleFlip(idx)}
            className={`w-20 h-24 rounded-xl flex items-center justify-center text-3xl transition-all transform duration-500 shadow-lg
              ${card.isFlipped || card.isMatched ? 'bg-slate-800 rotate-y-180' : 'bg-indigo-600'}
              ${card.isMatched ? 'opacity-40 grayscale-[0.5]' : ''}
              active:scale-90
            `}
          >
            {(card.isFlipped || card.isMatched) ? card.emoji : '?'}
          </button>
        ))}
      </div>

      {isWon && (
        <button
          onClick={initGame}
          className="mt-4 px-10 py-3 bg-emerald-600 text-white font-bold rounded-xl active:scale-95 transition-transform"
        >
          Jugar de nuevo
        </button>
      )}
    </div>
  );
};

export default MemoryGame;
