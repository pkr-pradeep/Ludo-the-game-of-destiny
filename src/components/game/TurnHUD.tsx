import React from 'react';
import { PlayerColor, Player } from '../../types/game';
import { FACTIONS } from '../../constants/boardData';
import { Volume2, VolumeX, Home, RotateCcw, HelpCircle, Sliders } from 'lucide-react';
import { CoinBucket } from '../coins/CoinBucket';

export interface TurnHUDProps {
  currentColor: PlayerColor;
  players: Record<PlayerColor, Player>;
  activeColors: PlayerColor[];
  playerColor?: PlayerColor;
  isMuted: boolean;
  onToggleMute: () => void;
  onHome: () => void;
  onRestart: () => void;
  onOpenRules: () => void;
  onOpenSettings?: () => void;
}

export const TurnHUD: React.FC<TurnHUDProps> = ({
  currentColor,
  players,
  activeColors,
  playerColor,
  isMuted,
  onToggleMute,
  onHome,
  onRestart,
  onOpenRules,
  onOpenSettings,
}) => {
  const currentFaction = FACTIONS[currentColor];

  return (
    <header className="w-full bg-[#0d1629]/90 backdrop-blur-md border-b border-[#d4af37]/25 px-3 py-2 sm:px-4 sm:py-3 sticky top-0 z-40">
      <div className="max-w-3xl mx-auto flex items-center justify-between gap-2">
        {/* Left: Home Return & Rules */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onHome}
            aria-label="Return to Home screen"
            title="Return to Home"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-[#c8b69b] hover:text-[#ffd700] hover:bg-[#1a233a] transition-colors cursor-pointer"
          >
            <Home className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={onOpenRules}
            aria-label="How to play rules"
            title="Rules of Destiny"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-[#c8b69b] hover:text-[#ffd700] hover:bg-[#1a233a] transition-colors cursor-pointer"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Center: Current Turn Faction Indicator */}
        <div className="flex flex-col items-center text-center truncate px-2">
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block shadow-sm"
              style={{
                backgroundColor: currentFaction.accentHex,
                boxShadow: `0 0 8px ${currentFaction.glowHex}`,
              }}
              aria-hidden="true"
            />
            <h2 className="text-sm sm:text-base font-cinzel font-bold text-[#f5ecd8] tracking-wide truncate flex items-center gap-1.5">
              {currentFaction.name}
              {currentColor === playerColor && (
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#ffd700] text-black font-sans font-extrabold uppercase tracking-tight shadow">
                  YOU
                </span>
              )}
            </h2>
          </div>
          <span className="text-[11px] text-[#c8b69b]/80 truncate">
            {currentFaction.epicTitle}
          </span>
        </div>

        {/* Right: Coin Treasury, Sound Mute, Settings, & Restart */}
        <div className="flex items-center gap-1.5 shrink-0">
          <CoinBucket />
          <button
            type="button"
            onClick={onToggleMute}
            aria-label={isMuted ? 'Unmute sounds' : 'Mute sounds'}
            title={isMuted ? 'Unmute audio' : 'Mute audio'}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-[#c8b69b] hover:text-[#ffd700] hover:bg-[#1a233a] transition-colors cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
          </button>
          {onOpenSettings && (
            <button
              type="button"
              onClick={onOpenSettings}
              aria-label="Audio & Settings"
              title="Audio & Settings"
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-[#c8b69b] hover:text-[#ffd700] hover:bg-[#1a233a] transition-colors cursor-pointer"
            >
              <Sliders className="w-4 h-4 text-[#ffd700]" />
            </button>
          )}
          <button
            type="button"
            onClick={onRestart}
            aria-label="Restart match"
            title="Restart Match"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-[#c8b69b] hover:text-[#ffd700] hover:bg-[#1a233a] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Factions Progress Strip */}
      <div className="max-w-3xl mx-auto mt-2 pt-1.5 border-t border-[#d4af37]/15 flex items-center justify-around text-xs">
        {activeColors.map((col) => {
          const f = FACTIONS[col];
          const p = players[col];
          const isCurrent = col === currentColor;
          const isUser = col === playerColor;

          return (
            <div
              key={`hud-faction-${col}`}
              className={`flex items-center gap-1 px-2 py-0.5 rounded transition-colors ${
                isCurrent ? 'bg-[#d4af37]/15 text-[#ffd700] font-semibold' : 'text-[#c8b69b]/70'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: f.accentHex }}
              />
              <span className="truncate max-w-[70px] sm:max-w-none">{f.shortName}</span>
              {isUser && (
                <span className="text-[8px] px-1 py-0 rounded bg-[#d4af37]/30 text-[#ffd700] font-bold">
                  YOU
                </span>
              )}
              <span className="text-[10px] tabular-nums font-mono">({p.tokensFinished}/4)</span>
            </div>
          );
        })}
      </div>
    </header>
  );
};
