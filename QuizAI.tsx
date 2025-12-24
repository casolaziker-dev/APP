
import React, { useState, useEffect } from 'react';
import { generateQuizQuestions } from '../services/geminiService';
import { record1PScore, getStats } from '../services/scoreService';
import { QuizQuestion } from '../types';

const TOPICS = ["Animales", "Geografía", "Cine", "Historia", "Tecnología", "Deportes"];

const QuizAI: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    const stats = getStats('quiz-ai');
    setHighScore(stats.highScore || 0);
  }, []);

  const startQuiz = async (selectedTopic: string) => {
    setTopic(selectedTopic);
    setLoading(true);
    const qs = await generateQuizQuestions(selectedTopic);
    setQuestions(qs);
    setLoading(false);
    setCurrentIndex(0);
    setScore(0);
    setFinished(false);
  };

  const handleAnswer = (idx: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(idx);
    
    let newScore = score;
    if (idx === questions[currentIndex].correctIndex) {
      newScore = score + 1;
      setScore(newScore);
    }
    
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(c => c + 1);
        setSelectedAnswer(null);
      } else {
        record1PScore('quiz-ai', newScore, 'high');
        setFinished(true);
      }
    }, 1500);
  };

  if (!topic) {
    return (
      <div className="space-y-4 pt-4">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-white">Selecciona un Tema</h3>
          {highScore > 0 && (
            <p className="text-purple-400 text-xs font-bold uppercase tracking-wider mt-1">
              Tu mejor marca: {highScore} pts
            </p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {TOPICS.map(t => (
            <button
              key={t}
              onClick={() => startQuiz(t)}
              className="p-4 bg-slate-800 rounded-xl text-white font-medium active:scale-95 transition-all border border-slate-700"
            >
              {t}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center pt-20 space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 animate-pulse">Generando preguntas únicas con IA...</p>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="flex flex-col items-center justify-center pt-10 space-y-6">
        <span className="text-7xl">🏆</span>
        <div className="text-center">
          <h3 className="text-2xl font-bold text-white">¡Juego Terminado!</h3>
          <p className="text-slate-400">Puntuación final: {score} / {questions.length}</p>
          {score > highScore && (
            <p className="text-emerald-400 font-bold mt-2 animate-bounce">¡NUEVO RÉCORD!</p>
          )}
        </div>
        <button
          onClick={() => {
            setTopic(null);
            setHighScore(getStats('quiz-ai').highScore || 0);
          }}
          className="w-full py-4 bg-indigo-600 rounded-xl font-bold text-white shadow-lg active:scale-95 transition-transform"
        >
          Volver a Temas
        </button>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="space-y-6 pt-4">
      <div className="flex justify-between items-center text-xs font-bold text-indigo-400 uppercase tracking-widest">
        <span>Pregunta {currentIndex + 1} de {questions.length}</span>
        <span>Score: {score}</span>
      </div>
      
      <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 shadow-xl min-h-[140px] flex items-center justify-center">
        <p className="text-xl font-medium text-white text-center leading-relaxed">
          {currentQ.question}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {currentQ.options.map((opt, idx) => {
          let bgColor = 'bg-slate-800';
          let borderColor = 'border-slate-700';
          
          if (selectedAnswer !== null) {
            if (idx === currentQ.correctIndex) {
              bgColor = 'bg-green-600/50';
              borderColor = 'border-green-400';
            } else if (idx === selectedAnswer) {
              bgColor = 'bg-red-600/50';
              borderColor = 'border-red-400';
            }
          }

          return (
            <button
              key={idx}
              disabled={selectedAnswer !== null}
              onClick={() => handleAnswer(idx)}
              className={`p-4 rounded-xl border-2 ${borderColor} ${bgColor} text-left font-medium text-white transition-all active:scale-[0.98]`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuizAI;
