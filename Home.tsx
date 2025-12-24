
import React from 'react';
import { Sector } from '../types';

interface HomeProps {
  onSelectSector: (sector: Sector) => void;
  isDark: boolean;
}

const Home: React.FC<HomeProps> = ({ onSelectSector, isDark }: HomeProps) => {
  return (
    <div className={`flex flex-col space-y-10 pt-12 relative h-full px-6 transition-colors duration-300
      ${isDark ? 'bg-slate-950' : 'bg-slate-50'}
    `}>
      <div className="text-center space-y-3">
        <h2 className={`text-5xl font-black tracking-tight leading-none transition-colors
          ${isDark ? 'text-white' : 'text-slate-900'}
        `}>
          MUNDO<br/>
          <span className="text-indigo-600">MINIJUEGOS</span>
        </h2>
        <p className={`font-medium transition-colors ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Elige tu modo de desafío
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Sector 1 JUGADOR */}
        <button
          onClick={() => onSelectSector('1P')}
          className={`group relative overflow-hidden rounded-[2.5rem] border-b-8 p-10 flex items-center justify-between transition-all hover:-translate-y-1 active:translate-y-1 shadow-xl
            ${isDark 
              ? 'bg-slate-900 border-indigo-900/50 text-white' 
              : 'bg-white border-indigo-100 text-slate-800'}
          `}
        >
          <div className="flex flex-col items-start text-left">
            <h3 className="text-3xl font-black uppercase italic">Solitario</h3>
            <p className={`text-sm font-bold mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Sectores de IA</p>
          </div>
          <span className="text-6xl group-hover:scale-110 transition-transform">👤</span>
          <div className={`absolute top-0 right-0 w-24 h-24 rounded-full -mr-12 -mt-12 opacity-30
            ${isDark ? 'bg-indigo-500/10' : 'bg-indigo-50'}
          `} />
        </button>

        {/* Sector 2 JUGADORES */}
        <button
          onClick={() => onSelectSector('2P')}
          className={`group relative overflow-hidden rounded-[2.5rem] border-b-8 p-10 flex items-center justify-between transition-all hover:-translate-y-1 active:translate-y-1 shadow-xl
            ${isDark 
              ? 'bg-slate-900 border-rose-900/50 text-white' 
              : 'bg-white border-rose-100 text-slate-800'}
          `}
        >
          <div className="flex flex-col items-start text-left">
            <h3 className="text-3xl font-black uppercase italic">Duelo</h3>
            <p className={`text-sm font-bold mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>1 vs 1 Local</p>
          </div>
          <span className="text-6xl group-hover:scale-110 transition-transform">👥</span>
          <div className={`absolute top-0 right-0 w-24 h-24 rounded-full -mr-12 -mt-12 opacity-30
            ${isDark ? 'bg-rose-500/10' : 'bg-rose-50'}
          `} />
        </button>
      </div>

      <div className="mt-auto pb-10 text-center">
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border
          ${isDark ? 'bg-indigo-500/5 border-indigo-500/20' : 'bg-indigo-50 border-indigo-100'}
        `}>
           <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
           <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Powered by Gemini AI</span>
        </div>
      </div>
    </div>
  );
};

export default Home;
