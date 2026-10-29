import React, { useState, useEffect } from 'react';
import { Users, HelpCircle, Sliders, Shield, Swords, Check, RotateCw } from 'lucide-react';
import { FACTIONS } from '../constants/boardData';
import { PlayerColor } from '../types/game';
import { RulesModal } from '../components/modals/RulesModal';
import { JoinGameModal } from '../components/modals/JoinGameModal';
import { LoaderPreviewModal } from '../components/modals/LoaderPreviewModal';
import { CoinBucket } from '../components/coins/CoinBucket';
import { CoinTreasuryModal } from '../components/coins/CoinTreasuryModal';
import { LearnAndEarnModal } from '../components/quiz/LearnAndEarnModal';
import { AudioSettingsModal } from '../components/settings/AudioSettingsModal';
import { audioService } from '../services/audio/audioService';
import { KONARK_WHEEL_IMG_URL } from '../utils/assets';

export interface StartGameConfig {
  playerCount: 2 | 3 | 4;
  playerColor: PlayerColor;
  activePlayers: PlayerColor[];
}

export interface HomeScreenProps {
  onStartGame: (config: StartGameConfig) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onStartGame }) => {
  // Player turn sequence with non-overlapping color permutation
  const [playerColors, setPlayerColors] = useState<PlayerColor[]>([
    'red',
    'green',
    'yellow',
    'blue',
  ]);
  const [selectedPlayerCount, setSelectedPlayerCount] = useState<2 | 3 | 4>(2);

  const [isCoinTreasuryOpen, setIsCoinTreasuryOpen] = useState<boolean>(false);
  const [isRulesOpen, setIsRulesOpen] = useState<boolean>(false);
  const [isJoinOpen, setIsJoinOpen] = useState<boolean>(false);
  const [isLoaderPreviewOpen, setIsLoaderPreviewOpen] = useState<boolean>(false);
  const [isQuizOpen, setIsQuizOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  useEffect(() => {
    audioService.playBgm('home');
  }, []);

  // Assign color to player slot, automatically swapping to guarantee NO overlapping colors
  const assignPlayerColor = (targetSlot: number, newColor: PlayerColor) => {
    setPlayerColors((prev) => {
      const currentColor = prev[targetSlot];
      if (currentColor === newColor) return prev;

      const existingIndex = prev.indexOf(newColor);
      const nextColors = [...prev];

      if (existingIndex !== -1) {
        // Swap colors so no two players ever have the same color
        nextColors[targetSlot] = newColor;
        nextColors[existingIndex] = currentColor;
      } else {
        nextColors[targetSlot] = newColor;
      }

      return nextColors;
    });
  };

  // Rotate turn sequence among active players (e.g. P1 -> P2 -> P3 -> P1)
  const handleRotateSequence = () => {
    setPlayerColors((prev) => {
      const active = prev.slice(0, selectedPlayerCount);
      const inactive = prev.slice(selectedPlayerCount);
      const rotated = [...active.slice(1), active[0]];
      return [...rotated, ...inactive];
    });
  };

  const handleLaunchGame = () => {
    const active = playerColors.slice(0, selectedPlayerCount);
    onStartGame({
      playerCount: selectedPlayerCount,
      playerColor: playerColors[0], // Player 1 (You)
      activePlayers: active,        // Exact turn sequence of chosen non-overlapping colors
    });
  };

  const primaryFaction = FACTIONS[playerColors[0]];
  const activeFactions = playerColors.slice(0, selectedPlayerCount);

  return (
    <div className="h-[100dvh] w-full flex flex-col justify-between bg-temple-pattern relative overflow-hidden selection:bg-[#d4af37]/30 selection:text-[#ffd700]">
      {/* Decorative Golden Ambient Halo in Background */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[450px] h-[300px] bg-gradient-to-b from-[#d4af37]/15 via-[#b45309]/5 to-transparent blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      {/* Top Header Strip with Controls & How to Play (?) on Left */}
      <header className="w-full flex items-center justify-between px-3 py-2 border-b border-[#d4af37]/25 bg-[#0a1122]/85 backdrop-blur-md z-30 shrink-0">
        {/* Left: How to Play (?) Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsRulesOpen(true)}
            aria-label="How to Play Rules & House Lore"
            title="How to Play Rules & House Lore (?)"
            className="min-h-[38px] px-2.5 py-1 rounded-xl bg-[#141d33] border border-[#d4af37]/40 text-[#ffd700] hover:text-white hover:bg-[#1b253f] transition-all flex items-center gap-1.5 font-cinzel text-xs font-bold shadow cursor-pointer active:scale-95"
          >
            <HelpCircle className="w-4 h-4 text-[#ffd700]" />
            <span className="text-[11px] font-semibold tracking-wide">How to Play</span>
          </button>
        </div>

        {/* Right: Clickable Coins + Settings */}
        <div className="flex items-center gap-2">
          <CoinBucket onClick={() => setIsCoinTreasuryOpen(true)} />
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            aria-label="Audio & Settings"
            title="Audio & Settings"
            className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl bg-[#141d33] border border-[#d4af37]/40 text-[#c8b69b] hover:text-[#ffd700] hover:bg-[#1a233a] transition-colors cursor-pointer"
          >
            <Sliders className="w-4 h-4 text-[#ffd700]" />
          </button>
        </div>
      </header>

      {/* Main Hero & Game Configuration Body */}
      <main className="flex-1 w-full max-w-md mx-auto flex flex-col items-center justify-center px-3 py-1.5 text-center z-10 overflow-y-auto sm:overflow-visible">
        {/* Sacred Chariot Wheel of Konark Emblem - MOVING WHEEL PRESERVED INTACT */}
        <div className="relative mb-1 flex items-center justify-center shrink-0">
          <div
            className="absolute w-24 h-24 rounded-full bg-radial from-[#d4af37]/30 via-[#b45309]/10 to-transparent blur-xl pointer-events-none"
            aria-hidden="true"
          />

          {/* Golden Ring Frame with Continuous Moving Konark Wheel */}
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full p-1 bg-gradient-to-br from-[#ffd700] via-[#d4af37] to-[#451a03] shadow-xl flex items-center justify-center">
            <div className="w-full h-full rounded-full overflow-hidden bg-[#0c1424] border-2 border-[#ffd700]/80 flex items-center justify-center shadow-inner relative">
              <div className="absolute inset-0 bg-radial from-[#d4af37]/20 via-transparent to-transparent pointer-events-none" />
              <img
                src={KONARK_WHEEL_IMG_URL}
                alt="Konark Sun Temple Wheel"
                className="w-full h-full object-contain p-0.5 rounded-full select-none pointer-events-none drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]"
                style={{
                  animation: 'spin 24s linear infinite',
                }}
              />
            </div>
          </div>
        </div>

        {/* Title & Cultural Subtitle */}
        <h1 className="text-base sm:text-lg font-cinzel font-black text-white tracking-wide uppercase drop-shadow-md">
          Ludo: The Game of Destiny
        </h1>
        <p className="text-[10px] text-[#dfd3c3] max-w-xs mx-auto leading-tight line-clamp-1 opacity-90">
          Inspired by Odisha's Sun Temple of Konark & Mahabharata
        </p>

        {/* 1. ARENA WARRIOR COUNT */}
        <div className="mt-2 w-full bg-[#131b30]/90 p-2 rounded-xl border border-[#d4af37]/35 shadow-md text-left">
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] font-cinzel font-bold tracking-wider text-[#ffd700] uppercase">
              Arena Warriors:
            </label>
            <span className="text-[10px] text-[#c8b69b] font-cinzel">
              {selectedPlayerCount === 2 ? '1v1 Duel' : selectedPlayerCount === 3 ? '3 Factions' : 'All 4 Houses'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {([2, 3, 4] as const).map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => setSelectedPlayerCount(count)}
                className={`py-1 rounded-lg font-cinzel text-[11px] font-bold transition-all cursor-pointer select-none flex items-center justify-center gap-1 ${
                  selectedPlayerCount === count
                    ? 'bg-gradient-to-r from-[#d4af37] to-[#b45309] text-[#1c1510] shadow scale-[1.02] border border-[#ffd700]'
                    : 'bg-[#0d1629] text-[#c8b69b] hover:text-white hover:bg-[#1a233a] border border-[#d4af37]/20'
                }`}
              >
                <span>{count} Players</span>
              </button>
            ))}
          </div>
        </div>

        {/* 2. TURN SEQUENCE & NON-OVERLAPPING HOUSE COLOR SELECTION */}
        <div className="mt-2 w-full bg-[#131b30]/90 p-2 rounded-xl border border-[#d4af37]/40 shadow-lg text-left">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#ffd700]" />
              <span className="text-[11px] font-cinzel font-bold tracking-wider text-[#ffd700] uppercase">
                Turn Sequence & Colors:
              </span>
            </div>
            <button
              type="button"
              onClick={handleRotateSequence}
              title="Cycle turn order"
              className="text-[10px] font-cinzel text-[#c8b69b] hover:text-[#ffd700] flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#0d1527] border border-[#d4af37]/25 hover:border-[#d4af37]/60 transition-colors cursor-pointer"
            >
              <RotateCw className="w-3 h-3 text-[#ffd700]" />
              <span>Rotate Order</span>
            </button>
          </div>

          {/* Roster Slots for Each Player in the Sequence */}
          <div className="space-y-1.5">
            {Array.from({ length: selectedPlayerCount }).map((_, slotIdx) => {
              const color = playerColors[slotIdx];
              const faction = FACTIONS[color];
              const isUser = slotIdx === 0;

              return (
                <div
                  key={`slot-${slotIdx}`}
                  className={`flex items-center justify-between py-1 px-2 rounded-lg transition-all ${
                    isUser
                      ? 'bg-gradient-to-r from-[#17223b] to-[#0f172a] border border-[#ffd700]/50 shadow-sm'
                      : 'bg-[#0b1220] border border-[#d4af37]/20'
                  }`}
                >
                  {/* Player Slot Info */}
                  <div className="flex items-center gap-1.5 min-w-0 pr-1">
                    <span className="w-4 h-4 rounded-full bg-[#d4af37] text-[#1c1510] font-mono font-bold text-[10px] flex items-center justify-center shrink-0">
                      {slotIdx + 1}
                    </span>
                    <span className="text-[11px] font-cinzel font-bold text-white truncate">
                      {isUser ? 'Player 1 (You)' : `Player ${slotIdx + 1}`}
                    </span>
                    <span
                      className="text-[10px] font-cinzel font-semibold px-1.5 py-0.2 rounded shrink-0"
                      style={{
                        color: faction.accentHex,
                        backgroundColor: `${faction.accentHex}20`,
                      }}
                    >
                      {faction.shortName}
                    </span>
                  </div>

                  {/* 4 Color Orbs for this Player */}
                  <div className="flex items-center gap-1 shrink-0">
                    {(['red', 'green', 'yellow', 'blue'] as const).map((c) => {
                      const isSelected = color === c;
                      const f = FACTIONS[c];
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => assignPlayerColor(slotIdx, c)}
                          aria-label={`Assign ${f.shortName} to Player ${slotIdx + 1}`}
                          title={`Select ${f.shortName} (${c.toUpperCase()})`}
                          className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full transition-all cursor-pointer flex items-center justify-center border ${
                            isSelected
                              ? 'scale-110 border-white shadow-[0_0_8px_rgba(255,215,0,0.6)] ring-1 ring-[#ffd700] z-10'
                              : 'border-transparent opacity-40 hover:opacity-90 hover:scale-105'
                          }`}
                          style={{
                            backgroundColor: f.accentHex,
                          }}
                        >
                          {isSelected && <Check className="w-3 h-3 text-white stroke-[3.5]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-1.5 flex items-center justify-between text-[10px] text-[#c8b69b]/80 px-0.5">
            <span>Colors auto-swap (zero overlaps)</span>
            <span className="font-mono text-[#ffd700]">
              {activeFactions.map((c) => FACTIONS[c].shortName).join(' ➔ ')}
            </span>
          </div>
        </div>

        {/* Action Buttons: Clean & approachable */}
        <div className="mt-2 w-full flex flex-col gap-1.5">
          {/* Primary CTA: Start Match */}
          <button
            type="button"
            onClick={handleLaunchGame}
            className="w-full min-h-[42px] py-2 px-4 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#f59e0b] to-[#b45309] text-[#1c1510] font-cinzel font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer border-2 border-[#ffd700]"
          >
            <Swords className="w-4 h-4 fill-current" />
            <span>Play as {primaryFaction.shortName} ({activeFactions.map((c) => FACTIONS[c].shortName).join(' ➔ ')})</span>
          </button>

          {/* Secondary CTA: Join Chamber */}
          <button
            type="button"
            onClick={() => setIsJoinOpen(true)}
            className="w-full min-h-[34px] py-1 px-4 rounded-xl bg-[#141d33] hover:bg-[#1b253f] text-[#f5ecd8] border border-[#d4af37]/40 font-cinzel font-bold text-[11px] uppercase tracking-wider shadow active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Users className="w-3.5 h-3.5 text-[#38bdf8]" />
            Join Game Room
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-1 px-3 border-t border-[#d4af37]/20 text-center text-[10px] text-[#c8b69b]/70 z-10 shrink-0">
        <span>Handcrafted with reverence for Odisha's stonecraft & the Mahabharata epic</span>
      </footer>

      {/* Modals */}
      <CoinTreasuryModal
        isOpen={isCoinTreasuryOpen}
        onClose={() => setIsCoinTreasuryOpen(false)}
        onOpenLearnAndEarn={() => {
          setIsCoinTreasuryOpen(false);
          setIsQuizOpen(true);
        }}
      />
      <RulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />
      <JoinGameModal
        isOpen={isJoinOpen}
        onClose={() => setIsJoinOpen(false)}
        onStartLocalGame={handleLaunchGame}
      />
      <LoaderPreviewModal
        isOpen={isLoaderPreviewOpen}
        onClose={() => setIsLoaderPreviewOpen(false)}
      />
      <LearnAndEarnModal
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
      />
      <AudioSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};
