import React, { useState } from 'react';
import { Play, Users, HelpCircle, Compass, Sparkles } from 'lucide-react';
import { FACTIONS } from '../constants/boardData';
import { RulesModal } from '../components/modals/RulesModal';
import { JoinGameModal } from '../components/modals/JoinGameModal';
import { LoaderPreviewModal } from '../components/modals/LoaderPreviewModal';

export interface HomeScreenProps {
  onStartGame: (playerCount: 2 | 3 | 4) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onStartGame }) => {
  const [selectedPlayerCount, setSelectedPlayerCount] = useState<2 | 3 | 4>(2);
  const [isRulesOpen, setIsRulesOpen] = useState<boolean>(false);
  const [isJoinOpen, setIsJoinOpen] = useState<boolean>(false);
  const [isLoaderPreviewOpen, setIsLoaderPreviewOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-temple-pattern relative overflow-x-hidden selection:bg-[#d4af37]/30 selection:text-[#ffd700]">
      {/* Decorative Golden Ambient Halo in Background */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[350px] bg-gradient-to-b from-[#d4af37]/15 via-[#b45309]/5 to-transparent blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      {/* Top Bar */}
      <header className="w-full px-4 py-3 sm:py-4 border-b border-[#d4af37]/20 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ffd700] via-[#d4af37] to-[#78350f] p-0.5 shadow-md">
            <div className="w-full h-full rounded-full bg-[#0b1329] flex items-center justify-center">
              <span className="text-xs font-cinzel font-black text-[#ffd700]">ॐ</span>
            </div>
          </div>
          <span className="text-xs sm:text-sm font-cinzel font-bold tracking-wider text-[#f5ecd8] uppercase">
            Heritage of Bharat
          </span>
        </div>

        {/* Konark Wheel Component Inspector Button */}
        <button
          type="button"
          onClick={() => setIsLoaderPreviewOpen(true)}
          className="min-h-[44px] px-3 py-1.5 rounded-lg text-xs font-cinzel text-[#d4af37] border border-[#d4af37]/40 hover:bg-[#d4af37]/10 flex items-center gap-1.5 transition-colors cursor-pointer"
          title="Inspect the Konark Sun Temple Wheel Loader component"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#ffd700]" />
          <span>Konark Wheel</span>
        </button>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-lg mx-auto px-4 py-6 sm:py-10 flex-1 flex flex-col items-center justify-center text-center z-10">
        {/* Sacred Konark Sun Temple Wheel with Spinning Animation */}
        <div className="relative mb-4 sm:mb-6">
          {/* Ambient golden aura glow */}
          <div
            className="absolute -inset-3 rounded-full bg-radial from-[#d4af37]/35 via-[#b45309]/15 to-transparent blur-md pointer-events-none"
            aria-hidden="true"
          />

          {/* Outer concentric filigree dashed ring */}
          <div className="absolute -inset-2 rounded-full border border-[#d4af37]/40 border-dashed pointer-events-none" />

          {/* Golden Ring Frame */}
          <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full p-1 bg-gradient-to-br from-[#ffd700] via-[#d4af37] to-[#451a03] shadow-2xl flex items-center justify-center">
            {/* Inner Circular Viewport containing the spinning authentic Konark Wheel */}
            <div className="w-full h-full rounded-full overflow-hidden bg-[#0c1424] border-2 border-[#ffd700]/80 flex items-center justify-center shadow-inner relative">
              {/* Subtle back ambient glow */}
              <div className="absolute inset-0 bg-radial from-[#d4af37]/20 via-transparent to-transparent pointer-events-none" />
              <img
                src="/assets/aistudio/image_ca70523e.png"
                alt="Konark Sun Temple Wheel"
                className="w-full h-full object-contain p-0.5 rounded-full select-none pointer-events-none drop-shadow-[0_0_10px_rgba(212,175,55,0.4)]"
                style={{
                  animation: 'spin 24s linear infinite',
                }}
              />
            </div>
          </div>
        </div>

        {/* Title & Cultural Subtitle */}
        <h1 className="text-2xl sm:text-4xl font-cinzel font-black text-white tracking-wide uppercase drop-shadow-lg">
          Ludo: The Game of Destiny
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-[#dfd3c3] max-w-md mx-auto leading-relaxed">
          Inspired by Odisha's sacred Sun Temple of Konark and the legendary dice contest of the Mahabharata. Four factions assemble to fulfill their destiny.
        </p>

        {/* Player Count Selector for Local Game */}
        <div className="mt-6 w-full max-w-sm bg-[#161f36]/80 p-3 rounded-2xl border border-[#d4af37]/30 shadow-lg">
          <label className="block text-xs font-cinzel tracking-wider text-[#c8b69b] uppercase mb-2">
            Select Warrior Factions:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {([2, 3, 4] as const).map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => setSelectedPlayerCount(count)}
                className={`min-h-[44px] rounded-xl font-cinzel text-xs font-bold transition-all cursor-pointer select-none flex flex-col items-center justify-center ${
                  selectedPlayerCount === count
                    ? 'bg-gradient-to-r from-[#d4af37] to-[#b45309] text-[#1c1510] shadow-md scale-102'
                    : 'bg-[#0d1629] text-[#c8b69b] hover:text-white hover:bg-[#1a233a] border border-[#d4af37]/20'
                }`}
              >
                <span>{count} Warriors</span>
                <span className="text-[10px] font-normal opacity-85">
                  {count === 2 ? 'Kalinga vs Utkala' : count === 3 ? '3 Factions' : 'All 4 Houses'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons: Play Game, Join Game, How to Play */}
        <div className="mt-6 w-full max-w-sm flex flex-col gap-3">
          {/* Primary CTA: Play Game */}
          <button
            type="button"
            onClick={() => onStartGame(selectedPlayerCount)}
            className="w-full min-h-[50px] px-6 py-3 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#f59e0b] to-[#b45309] text-[#1c1510] font-cinzel font-bold text-sm uppercase tracking-wider shadow-xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#ffd700]"
          >
            <Play className="w-5 h-5 fill-current" />
            Play Game
          </button>

          {/* Secondary CTA: Join Game */}
          <button
            type="button"
            onClick={() => setIsJoinOpen(true)}
            className="w-full min-h-[48px] px-6 py-2.5 rounded-xl bg-[#141d33] hover:bg-[#1b253f] text-[#f5ecd8] border border-[#d4af37]/40 font-cinzel font-bold text-xs uppercase tracking-wider shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Users className="w-4 h-4 text-[#38bdf8]" />
            Join Game
          </button>

          {/* Tertiary CTA: How to Play */}
          <button
            type="button"
            onClick={() => setIsRulesOpen(true)}
            className="w-full min-h-[44px] px-6 py-2 rounded-xl text-[#c8b69b] hover:text-[#ffd700] hover:bg-white/5 font-cinzel text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <HelpCircle className="w-4 h-4" />
            How to Play
          </button>
        </div>

        {/* The 4 Warrior Houses Preview Strip */}
        <div className="mt-8 w-full max-w-sm pt-4 border-t border-[#d4af37]/20">
          <div className="text-[11px] font-cinzel tracking-wider text-[#c8b69b]/80 uppercase mb-2">
            The Four Factions of Kalinga & Utkala
          </div>
          <div className="grid grid-cols-4 gap-1.5 text-center">
            {Object.values(FACTIONS).map((f) => (
              <div
                key={f.id}
                className="p-1.5 rounded-lg bg-[#0e172c]/90 border border-[#d4af37]/20 flex flex-col items-center"
              >
                <span
                  className="w-3 h-3 rounded-full mb-1 shadow-sm"
                  style={{ backgroundColor: f.accentHex }}
                />
                <span className="text-[10px] font-cinzel text-white font-medium truncate w-full">
                  {f.shortName}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-3 px-4 border-t border-[#d4af37]/20 text-center text-[11px] text-[#c8b69b]/70 z-10">
        <span>Handcrafted with reverence for Odisha's stonecraft & the Mahabharata epic</span>
      </footer>

      {/* Modals */}
      <RulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />
      <JoinGameModal
        isOpen={isJoinOpen}
        onClose={() => setIsJoinOpen(false)}
        onStartLocalGame={() => onStartGame(selectedPlayerCount)}
      />
      <LoaderPreviewModal
        isOpen={isLoaderPreviewOpen}
        onClose={() => setIsLoaderPreviewOpen(false)}
      />
    </div>
  );
};
