import React from 'react';
import { X, Globe2, Sparkles } from 'lucide-react';

export interface JoinGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartLocalGame: () => void;
}

export const JoinGameModal: React.FC<JoinGameModalProps> = ({
  isOpen,
  onClose,
  onStartLocalGame,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="join-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm select-none"
    >
      <div className="relative w-full max-w-md rounded-2xl bg-gradient-to-b from-[#1b140f] to-[#0d0906] border border-[#d4af37]/50 shadow-2xl p-5 sm:p-6 text-[#e8ded1]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#d4af37]/30">
          <div className="flex items-center gap-2">
            <Globe2 className="w-5 h-5 text-[#38bdf8]" />
            <h3 id="join-modal-title" className="text-lg font-cinzel font-bold text-[#f5ecd8]">
              Join Chamber of Destiny
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-[#c8b69b] hover:text-[#ffd700] hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-4 space-y-4 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#d4af37]/10 border border-[#d4af37]/40 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-[#ffd700] animate-pulse" />
          </div>

          <p className="text-sm text-[#dfd3c3] leading-relaxed">
            The remote multiplayer halls and room codes are currently being inscribed by the temple artisans for the forthcoming expansion.
          </p>

          <p className="text-xs text-[#c8b69b]/80">
            You can immediately embark upon the journey right now through our fully featured <strong>Local Pass-and-Play</strong> arena with 2, 3, or 4 warrior factions!
          </p>
        </div>

        {/* Actions */}
        <div className="mt-6 pt-4 border-t border-[#d4af37]/20 flex flex-col sm:flex-row items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto min-h-[44px] px-4 py-2 rounded-xl text-xs font-cinzel text-[#c8b69b] hover:text-white transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onStartLocalGame();
            }}
            className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b45309] text-[#1c1510] font-cinzel font-bold text-xs uppercase tracking-wide hover:brightness-110 cursor-pointer shadow-md"
          >
            Play Local Match
          </button>
        </div>
      </div>
    </div>
  );
};
