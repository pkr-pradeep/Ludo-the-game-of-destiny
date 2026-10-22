import React from 'react';
import { X, ShieldCheck, Flame, Award, Compass } from 'lucide-react';

export interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="rules-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm select-none"
    >
      <div className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl bg-gradient-to-b from-[#1b140f] to-[#0d0906] border border-[#d4af37]/50 shadow-2xl p-5 sm:p-6 text-[#e8ded1]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#d4af37]/30">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#ffd700]" />
            <h3 id="rules-title" className="text-lg font-cinzel font-bold text-[#f5ecd8]">
              The Code of Destiny
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close rules"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-[#c8b69b] hover:text-[#ffd700] hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Narrative & Rules Prose */}
        <div className="mt-4 space-y-4 text-sm leading-relaxed text-[#dfd3c3]">
          <p className="italic text-[#d4af37] text-xs">
            "Just as the fateful game of dice in Hastinapur shaped the epic Mahabharata, each cast upon the sacred sandstone board determines your fortune."
          </p>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Flame className="w-5 h-5 text-[#f59e0b] shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-medium">1. The Sacred 6 & Deployment</strong>
                <span>Roll a 6 to release a token from your sanctuary yard onto your fortress starting square. Rolling a 6 also earns you an immediate bonus turn.</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-[#38bdf8] shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-medium">2. Safe Havens & Stars (★)</strong>
                <span>Squares marked with the golden Konark Star and starting fortress cells are sacred havens. Opponents cannot capture tokens resting on these safe squares.</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Flame className="w-5 h-5 text-[#ef4444] shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-medium">3. Captures & Recompense</strong>
                <span>Landing directly on an opponent's token on any standard track square banishes them back to their home yard and rewards you with a bonus dice roll.</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Award className="w-5 h-5 text-[#ffd700] shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-medium">4. The Central Garbhagriha</strong>
                <span>After completing a clockwise pilgrimage around the 52 perimeter squares, guide your tokens down your sacred home path. An exact dice roll is required to enter the center. The first faction to bring all 4 tokens to the center claims victory!</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Button */}
        <div className="mt-6 pt-4 border-t border-[#d4af37]/20 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-6 py-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b45309] text-[#1c1510] font-cinzel font-bold text-sm hover:brightness-110 cursor-pointer shadow-md"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
