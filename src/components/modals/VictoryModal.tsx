import React from 'react';
import { Player } from '../../types/game';
import { FACTIONS } from '../../constants/boardData';
import { Trophy, RotateCcw, Home } from 'lucide-react';

export interface VictoryModalProps {
  winner: Player | null;
  onPlayAgain: () => void;
  onHome: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  winner,
  onPlayAgain,
  onHome,
}) => {
  if (!winner) return null;
  const faction = FACTIONS[winner.color];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="victory-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none"
    >
      <div className="relative w-full max-w-md rounded-2xl bg-gradient-to-b from-[#24170d] via-[#16100a] to-[#0a0705] border-2 border-[#ffd700] shadow-[0_0_50px_rgba(212,175,55,0.4)] p-6 text-center text-[#e8ded1] animate-in fade-in zoom-in-95 duration-300">
        {/* Crown / Trophy Icon */}
        <div className="relative w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#ffd700] via-[#d4af37] to-[#8c7355] p-1 flex items-center justify-center shadow-lg">
          <div className="w-full h-full rounded-full bg-[#1c1510] flex items-center justify-center">
            <Trophy className="w-10 h-10 text-[#ffd700] animate-bounce" />
          </div>
        </div>

        {/* Victory Titles */}
        <span className="text-xs uppercase tracking-widest font-cinzel text-[#d4af37]">
          Destiny Fulfilled
        </span>
        <h2
          id="victory-title"
          className="text-2xl sm:text-3xl font-cinzel font-black text-white mt-1 drop-shadow-md"
        >
          {faction.name} Triumphs!
        </h2>
        <p className="text-xs text-[#c8b69b] mt-1 font-cinzel tracking-wider">
          {faction.epicTitle}
        </p>

        <p className="mt-4 text-sm text-[#dfd3c3] leading-relaxed">
          Through the wisdom of strategy and the turning wheels of Konark, all four sacred seals have reached the central Garbhagriha!
        </p>

        {/* Buttons */}
        <div className="mt-6 pt-4 border-t border-[#d4af37]/30 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={onPlayAgain}
            className="w-full sm:w-auto min-h-[48px] px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#f59e0b] to-[#b45309] text-[#1c1510] font-cinzel font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 hover:brightness-110 cursor-pointer shadow-lg active:scale-95 transition-transform"
          >
            <RotateCcw className="w-4 h-4" />
            Play Again
          </button>
          <button
            type="button"
            onClick={onHome}
            className="w-full sm:w-auto min-h-[48px] px-5 py-2.5 rounded-xl border border-[#d4af37]/50 text-[#c8b69b] hover:text-white hover:bg-white/5 font-cinzel text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <Home className="w-4 h-4" />
            Main Sanctuary
          </button>
        </div>
      </div>
    </div>
  );
};
