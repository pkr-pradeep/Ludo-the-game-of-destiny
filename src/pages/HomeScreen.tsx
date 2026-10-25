import React, { useState, useEffect } from 'react';
import { Play, Users, HelpCircle, Sparkles, GraduationCap, Sliders, Shield, Swords, Check } from 'lucide-react';
import { FACTIONS } from '../constants/boardData';
import { PlayerColor } from '../types/game';
import { RulesModal } from '../components/modals/RulesModal';
import { JoinGameModal } from '../components/modals/JoinGameModal';
import { LoaderPreviewModal } from '../components/modals/LoaderPreviewModal';
import { CoinBucket } from '../components/coins/CoinBucket';
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
  const [selectedColor, setSelectedColor] = useState<PlayerColor>('red');
  const [selectedPlayerCount, setSelectedPlayerCount] = useState<2 | 3 | 4>(2);
  const [selectedRival, setSelectedRival] = useState<PlayerColor>('green');
  const [selectedRestingColor, setSelectedRestingColor] = useState<PlayerColor>('blue');

  const [isRulesOpen, setIsRulesOpen] = useState<boolean>(false);
  const [isJoinOpen, setIsJoinOpen] = useState<boolean>(false);
  const [isLoaderPreviewOpen, setIsLoaderPreviewOpen] = useState<boolean>(false);
  const [isQuizOpen, setIsQuizOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  useEffect(() => {
    audioService.playBgm('home');
  }, []);

  // When selectedColor changes, adjust rival if conflicting
  const handleSelectColor = (color: PlayerColor) => {
    setSelectedColor(color);
    if (selectedRival === color) {
      const naturalOpposite: Record<PlayerColor, PlayerColor> = {
        red: 'green',
        green: 'red',
        yellow: 'blue',
        blue: 'yellow',
      };
      setSelectedRival(naturalOpposite[color]);
    }
    if (selectedRestingColor === color) {
      const all: PlayerColor[] = ['red', 'green', 'yellow', 'blue'];
      const nextRest = all.find((c) => c !== color && c !== 'blue') || 'blue';
      setSelectedRestingColor(nextRest);
    }
  };

  const handleLaunchGame = () => {
    let active: PlayerColor[] = [];
    if (selectedPlayerCount === 4) {
      // 4 players in clockwise order starting with user's selected color
      const clockwise: PlayerColor[] = ['red', 'green', 'yellow', 'blue'];
      const startIdx = clockwise.indexOf(selectedColor);
      active = [
        clockwise[startIdx],
        clockwise[(startIdx + 1) % 4],
        clockwise[(startIdx + 2) % 4],
        clockwise[(startIdx + 3) % 4],
      ];
    } else if (selectedPlayerCount === 3) {
      // 3 players: user's color + 2 rivals (excluding resting color)
      const all: PlayerColor[] = ['red', 'green', 'yellow', 'blue'];
      const resting =
        selectedRestingColor === selectedColor
          ? all.find((c) => c !== selectedColor) || 'blue'
          : selectedRestingColor;
      const participating = all.filter((c) => c !== resting);
      const remaining = participating.filter((c) => c !== selectedColor);
      active = [selectedColor, remaining[0], remaining[1]];
    } else {
      // 2 players: user's color vs chosen rival
      const rival =
        selectedRival === selectedColor
          ? selectedColor === 'red'
            ? 'green'
            : selectedColor === 'green'
            ? 'red'
            : selectedColor === 'yellow'
            ? 'blue'
            : 'yellow'
          : selectedRival;
      active = [selectedColor, rival];
    }

    onStartGame({
      playerCount: selectedPlayerCount,
      playerColor: selectedColor,
      activePlayers: active,
    });
  };

  const chosenFaction = FACTIONS[selectedColor];
  const rivalFaction = FACTIONS[selectedRival];

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-temple-pattern relative overflow-x-hidden selection:bg-[#d4af37]/30 selection:text-[#ffd700]">
      {/* Decorative Golden Ambient Halo in Background */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[350px] bg-gradient-to-b from-[#d4af37]/15 via-[#b45309]/5 to-transparent blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      {/* Top Header Strip with Controls */}
      <header className="w-full flex items-center justify-between px-4 py-3 border-b border-[#d4af37]/25 bg-[#0a1122]/80 backdrop-blur-md z-30">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ffd700] animate-ping" />
          <span className="font-cinzel text-xs uppercase tracking-widest text-[#d4af37]">
            Temple of Destiny
          </span>
        </div>

        <div className="flex items-center gap-2">
          <CoinBucket />
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            aria-label="Audio & Settings"
            title="Audio & Settings"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-[#c8b69b] hover:text-[#ffd700] hover:bg-[#1a233a] transition-colors cursor-pointer"
          >
            <Sliders className="w-4 h-4 text-[#ffd700]" />
          </button>
          <button
            type="button"
            onClick={() => setIsRulesOpen(true)}
            aria-label="View Game Rules"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-[#c8b69b] hover:text-[#ffd700] hover:bg-white/5 transition-colors cursor-pointer"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Hero & Game Configuration Body */}
      <main className="flex-1 w-full max-w-lg mx-auto flex flex-col items-center justify-center px-4 py-5 text-center z-10">
        {/* Sacred Chariot Wheel of Konark Emblem */}
        <div className="relative mb-2 flex items-center justify-center">
          <div
            className="absolute w-32 h-32 rounded-full bg-radial from-[#d4af37]/35 via-[#b45309]/15 to-transparent blur-xl pointer-events-none"
            aria-hidden="true"
          />

          {/* Golden Ring Frame */}
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 bg-gradient-to-br from-[#ffd700] via-[#d4af37] to-[#451a03] shadow-2xl flex items-center justify-center">
            <div className="w-full h-full rounded-full overflow-hidden bg-[#0c1424] border-2 border-[#ffd700]/80 flex items-center justify-center shadow-inner relative">
              <div className="absolute inset-0 bg-radial from-[#d4af37]/20 via-transparent to-transparent pointer-events-none" />
              <img
                src={KONARK_WHEEL_IMG_URL}
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
        <h1 className="text-xl sm:text-2xl font-cinzel font-black text-white tracking-wide uppercase drop-shadow-lg">
          Ludo: The Game of Destiny
        </h1>
        <p className="mt-0.5 text-xs text-[#dfd3c3] max-w-sm mx-auto leading-relaxed">
          Inspired by Odisha's sacred Sun Temple of Konark and the legendary dice contest of the Mahabharata.
        </p>

        {/* STEP 1: CHOOSE YOUR COLOR / WARRIOR HOUSE */}
        <div className="mt-4 w-full bg-[#131b30]/90 p-3 sm:p-3.5 rounded-2xl border border-[#d4af37]/40 shadow-xl text-left">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-cinzel font-bold tracking-wider text-[#ffd700] uppercase flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#ffd700]" />
              1. Choose Your House & Color:
            </label>
            <span className="text-[10px] text-[#c8b69b] font-medium font-cinzel">
              Selected: <strong style={{ color: chosenFaction.accentHex }}>{chosenFaction.shortName}</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {(['red', 'green', 'yellow', 'blue'] as const).map((color) => {
              const f = FACTIONS[color];
              const isSelected = selectedColor === color;

              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleSelectColor(color)}
                  className={`relative p-2 rounded-xl transition-all duration-200 cursor-pointer select-none text-left flex items-center gap-2.5 ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#1f2a48] to-[#16213a] border-2 border-[#ffd700] shadow-[0_0_14px_rgba(255,215,0,0.35)] scale-[1.02] z-10'
                      : 'bg-[#0d1527] border border-[#d4af37]/20 hover:border-[#d4af37]/50 hover:bg-[#141f36]'
                  }`}
                >
                  {/* Color Orb */}
                  <div
                    className="relative w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-md border"
                    style={{
                      backgroundColor: f.accentHex,
                      borderColor: isSelected ? '#ffffff' : `${f.accentHex}88`,
                      boxShadow: isSelected ? `0 0 10px ${f.glowHex}` : undefined,
                    }}
                  >
                    {isSelected && <Check className="w-4 h-4 text-white stroke-[3]" />}
                  </div>

                  {/* Faction Name & Title */}
                  <div className="truncate">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-cinzel font-bold text-white truncate">
                        {f.shortName}
                      </span>
                      {isSelected && (
                        <span className="text-[8px] font-extrabold px-1 py-0.2 rounded bg-[#ffd700] text-black uppercase tracking-tight">
                          YOU
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-[#c8b69b] block truncate opacity-85">
                      {color.toUpperCase()} · {color === 'red' ? 'Crimson' : color === 'green' ? 'Emerald' : color === 'yellow' ? 'Solar Gold' : 'Sapphire'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* STEP 2: NUMBER OF WARRIOR HOUSES */}
        <div className="mt-3 w-full bg-[#131b30]/90 p-3 rounded-2xl border border-[#d4af37]/30 shadow-lg text-left">
          <label className="block text-xs font-cinzel font-bold tracking-wider text-[#c8b69b] uppercase mb-2">
            2. Number of Warriors in Arena:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {([2, 3, 4] as const).map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => setSelectedPlayerCount(count)}
                className={`min-h-[42px] rounded-xl font-cinzel text-xs font-bold transition-all cursor-pointer select-none flex flex-col items-center justify-center ${
                  selectedPlayerCount === count
                    ? 'bg-gradient-to-r from-[#d4af37] to-[#b45309] text-[#1c1510] shadow-md scale-102 border border-[#ffd700]'
                    : 'bg-[#0d1629] text-[#c8b69b] hover:text-white hover:bg-[#1a233a] border border-[#d4af37]/20'
                }`}
              >
                <span>{count} Warriors</span>
                <span className="text-[9px] font-normal opacity-90">
                  {count === 2 ? '1v1 Duel' : count === 3 ? '3 Factions' : 'All 4 Houses'}
                </span>
              </button>
            ))}
          </div>

          {/* Opponent Selection for 2-Player mode */}
          {selectedPlayerCount === 2 && (
            <div className="mt-3 pt-2.5 border-t border-[#d4af37]/20">
              <div className="text-[11px] font-cinzel text-[#c8b69b] mb-1.5 flex items-center justify-between">
                <span>Select Rival House:</span>
                <span className="text-[10px] text-[#ffd700] font-sans">
                  {chosenFaction.shortName} vs {rivalFaction.shortName}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {(['red', 'green', 'yellow', 'blue'] as const)
                  .filter((c) => c !== selectedColor)
                  .map((rivalCol) => {
                    const rf = FACTIONS[rivalCol];
                    const isRivalSelected = selectedRival === rivalCol;
                    return (
                      <button
                        key={`rival-${rivalCol}`}
                        type="button"
                        onClick={() => setSelectedRival(rivalCol)}
                        className={`py-1.5 px-2 rounded-lg text-[10px] font-cinzel font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          isRivalSelected
                            ? 'bg-[#d4af37]/20 border border-[#ffd700] text-[#ffd700] shadow'
                            : 'bg-[#0b1220] border border-slate-700/60 text-[#c8b69b] hover:border-slate-500'
                        }`}
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: rf.accentHex }}
                        />
                        <span>{rf.shortName}</span>
                      </button>
                    );
                  })}
              </div>
            </div>
          )}

          {/* 3-Player Resting House Configuration */}
          {selectedPlayerCount === 3 && (
            <div className="mt-3 pt-2.5 border-t border-[#d4af37]/20">
              <div className="text-[11px] font-cinzel text-[#c8b69b] mb-1.5 flex items-center justify-between">
                <span>Dormant (Resting) House:</span>
                <span className="text-[10px] text-amber-300 font-sans">
                  {FACTIONS[selectedRestingColor].shortName} rests
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {(['red', 'green', 'yellow', 'blue'] as const)
                  .filter((c) => c !== selectedColor)
                  .map((dormantCol) => {
                    const df = FACTIONS[dormantCol];
                    const isResting = selectedRestingColor === dormantCol;
                    return (
                      <button
                        key={`dormant-${dormantCol}`}
                        type="button"
                        onClick={() => setSelectedRestingColor(dormantCol)}
                        className={`py-1.5 px-2 rounded-lg text-[10px] font-cinzel font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          isResting
                            ? 'bg-amber-950/60 border border-amber-500 text-amber-300 shadow'
                            : 'bg-[#0b1220] border border-slate-700/60 text-[#c8b69b] hover:border-slate-500'
                        }`}
                      >
                        <span
                          className="w-2 h-2 rounded-full opacity-60"
                          style={{ backgroundColor: df.accentHex }}
                        />
                        <span>{df.shortName}</span>
                      </button>
                    );
                  })}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons: Play Game, Join Game, How to Play */}
        <div className="mt-4 w-full flex flex-col gap-2.5">
          {/* Primary CTA: Play as Selected Faction */}
          <button
            type="button"
            onClick={handleLaunchGame}
            className="w-full min-h-[50px] px-6 py-3 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#f59e0b] to-[#b45309] text-[#1c1510] font-cinzel font-black text-sm uppercase tracking-wider shadow-xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer border-2 border-[#ffd700]"
          >
            <Swords className="w-5 h-5 fill-current" />
            <span>Play as {chosenFaction.shortName} ({selectedColor.toUpperCase()})</span>
          </button>

          {/* Secondary CTA: Join Chamber */}
          <button
            type="button"
            onClick={() => setIsJoinOpen(true)}
            className="w-full min-h-[44px] px-6 py-2 rounded-xl bg-[#141d33] hover:bg-[#1b253f] text-[#f5ecd8] border border-[#d4af37]/40 font-cinzel font-bold text-xs uppercase tracking-wider shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Users className="w-4 h-4 text-[#38bdf8]" />
            Join Game Room
          </button>

          {/* Learn & Earn Daily Quiz Button */}
          <button
            type="button"
            onClick={() => setIsQuizOpen(true)}
            className="w-full min-h-[44px] px-6 py-2 rounded-xl bg-gradient-to-r from-[#1e293b] to-[#0f172a] hover:from-[#334155] hover:to-[#1e293b] text-[#fde047] border border-[#d4af37]/60 font-cinzel font-bold text-xs uppercase tracking-wider shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <GraduationCap className="w-4 h-4 text-[#ffd700]" />
            Learn & Earn (Daily Gita & Math Quiz)
          </button>

          {/* Tertiary CTA: How to Play */}
          <button
            type="button"
            onClick={() => setIsRulesOpen(true)}
            className="w-full min-h-[40px] px-6 py-1.5 rounded-xl text-[#c8b69b] hover:text-[#ffd700] hover:bg-white/5 font-cinzel text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <HelpCircle className="w-4 h-4" />
            How to Play Rules
          </button>
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
