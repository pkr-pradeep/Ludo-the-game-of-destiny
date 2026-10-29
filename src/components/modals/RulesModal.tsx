import React from 'react';
import { X, ShieldCheck, Flame, Award, Compass, Zap, Shield, RotateCw } from 'lucide-react';
import { FACTIONS } from '../../constants/boardData';

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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md select-none"
    >
      <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-2xl bg-gradient-to-b from-[#1b140f] via-[#120e0a] to-[#090604] border border-[#d4af37]/60 shadow-2xl text-[#e8ded1]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#d4af37]/30 shrink-0">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#ffd700]" />
            <h3 id="rules-title" className="text-base sm:text-lg font-cinzel font-bold text-[#f5ecd8]">
              The Code of Destiny & House Lore
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

        {/* Scrollable Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 text-xs sm:text-sm leading-relaxed text-[#dfd3c3]">
          {/* Epigraph */}
          <div className="p-3 rounded-xl bg-[#2a1d12]/40 border border-[#d4af37]/25 italic text-[#d4af37] text-xs">
            "Just as the fateful game of dice in Hastinapur shaped the epic Mahabharata, each cast upon the sacred sandstone board determines your fortune."
          </div>

          {/* Section: The Four Sacred Houses & Factions Lore */}
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <Shield className="w-4 h-4 text-[#ffd700]" />
              <h4 className="font-cinzel font-bold text-sm text-[#ffd700] uppercase tracking-wider">
                The Four Sacred Houses & What Colors Stand For
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* RED */}
              <div className="p-3 rounded-xl bg-[#1e1010] border border-[#ef4444]/40 flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#ef4444] shadow-[0_0_8px_#ef4444]" />
                  <span className="font-cinzel font-bold text-white text-xs">
                    RED — {FACTIONS.red.name}
                  </span>
                </div>
                <p className="text-[11px] text-[#e2d5c5] leading-normal">
                  <strong className="text-[#fca5a5]">Valor & Martial Heritage:</strong> Represents the unyielding courage of the ancient Kalinga warrior clan of Odisha who fiercely defended their sacred land. Guards the Southern fortress sanctuary.
                </p>
              </div>

              {/* GREEN */}
              <div className="p-3 rounded-xl bg-[#0d1c12] border border-[#22c55e]/40 flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#22c55e] shadow-[0_0_8px_#22c55e]" />
                  <span className="font-cinzel font-bold text-white text-xs">
                    GREEN — {FACTIONS.green.name}
                  </span>
                </div>
                <p className="text-[11px] text-[#e2d5c5] leading-normal">
                  <strong className="text-[#86efac]">Nature & Sacred Groves:</strong> Represents the lush coastal mangroves, Chilika waters, and eternal flora of Utkala. Guards the Northwest fortress sanctuary.
                </p>
              </div>

              {/* YELLOW */}
              <div className="p-3 rounded-xl bg-[#1f1a09] border border-[#eab308]/40 flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#eab308] shadow-[0_0_8px_#eab308]" />
                  <span className="font-cinzel font-bold text-white text-xs">
                    YELLOW — {FACTIONS.yellow.name}
                  </span>
                </div>
                <p className="text-[11px] text-[#e2d5c5] leading-normal">
                  <strong className="text-[#fde047]">Cosmic Light & Surya Chariot:</strong> Inspired by the Sun God of Konark and the 24 stone-carved chariot wheels tracking cosmic time. Guards the Northeast fortress sanctuary.
                </p>
              </div>

              {/* BLUE */}
              <div className="p-3 rounded-xl bg-[#0c1626] border border-[#3b82f6]/40 flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#3b82f6] shadow-[0_0_8px_#3b82f6]" />
                  <span className="font-cinzel font-bold text-white text-xs">
                    BLUE — {FACTIONS.blue.name}
                  </span>
                </div>
                <p className="text-[11px] text-[#e2d5c5] leading-normal">
                  <strong className="text-[#93c5fd]">Devotion & Ocean Depth:</strong> Represents the sacred blue hill (Nilachala) of Jagannath Puri and the majestic Bay of Bengal. Guards the Southeast fortress sanctuary.
                </p>
              </div>
            </div>
          </div>

          {/* Section: Core Gameplay Rules */}
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <Compass className="w-4 h-4 text-[#ffd700]" />
              <h4 className="font-cinzel font-bold text-sm text-[#ffd700] uppercase tracking-wider">
                Temple Rules & Sacred Mechanics
              </h4>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[#140e0a] border border-[#d4af37]/20">
                <Flame className="w-5 h-5 text-[#f59e0b] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-medium">1. The Sacred 6 & Deployment</strong>
                  <span>Roll a 6 to deploy a warrior token from your home yard onto your fortress starting track square. Rolling a 6 also earns you an immediate bonus roll.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[#140e0a] border border-[#d4af37]/20">
                <ShieldCheck className="w-5 h-5 text-[#38bdf8] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-medium">2. Safe Havens & Stars (★)</strong>
                  <span>Squares marked with the golden Konark Star and starting fortress cells are safe havens. Opponents cannot capture tokens resting on these protected squares.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[#140e0a] border border-[#d4af37]/20">
                <Flame className="w-5 h-5 text-[#ef4444] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-medium">3. Captures & Bonus Rolls</strong>
                  <span>Landing directly on an opponent's token on any standard track square banishes them back to their home yard and rewards you with a bonus roll.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[#140e0a] border border-[#d4af37]/20">
                <Award className="w-5 h-5 text-[#ffd700] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-medium">4. The Central Garbhagriha & Victory</strong>
                  <span>After completing the 52-square perimeter pilgrimage, guide your tokens down your sacred home column into the Garbhagriha. The first player to bring all 4 tokens to the center wins!</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[#140e0a] border border-[#d4af37]/20">
                <Zap className="w-5 h-5 text-[#22c55e] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-medium">5. Swift Advance (Time-Saver Rule)</strong>
                  <span>When only one token is active on the board, it automatically moves forward according to your rolled dice without delay, until a second token enters play!</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[#140e0a] border border-[#d4af37]/20">
                <RotateCw className="w-5 h-5 text-[#a855f7] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-medium">6. Adaptive Board Orientation</strong>
                  <span>When you choose Yellow or Green, the sacred board automatically rotates 180° so your chosen house is placed directly at the bottom nearest to your screen.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Button */}
        <div className="p-3 sm:p-4 border-t border-[#d4af37]/20 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-6 py-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b45309] text-[#1c1510] font-cinzel font-bold text-xs uppercase tracking-wider hover:brightness-110 cursor-pointer shadow-md"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
