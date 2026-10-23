import React from 'react';
import { PlayerColor } from '../../types/game';
import { FACTIONS } from '../../constants/boardData';
import { Dices, Sparkles, Swords, AlertCircle } from 'lucide-react';

export interface DiceRollerProps {
  currentColor: PlayerColor;
  diceValue: number | null;
  isRolling: boolean;
  hasRolled: boolean;
  availableMovesCount: number;
  onRoll: () => void;
  onAdvanceToken?: () => void;
  advanceButtonLabel?: string;
  disabled?: boolean;
  captureMessage?: string | null;
  onDismissCapture?: () => void;
  extraTurnToast?: string | null;
  onDismissExtraTurn?: () => void;
}

export const DiceRoller: React.FC<DiceRollerProps> = ({
  currentColor,
  diceValue,
  isRolling,
  hasRolled,
  availableMovesCount,
  onRoll,
  onAdvanceToken,
  advanceButtonLabel,
  disabled = false,
  captureMessage,
  onDismissCapture,
  extraTurnToast,
  onDismissExtraTurn,
}) => {
  const faction = FACTIONS[currentColor];

  // Render dice pips based on value (1..6)
  const renderPips = (val: number | null) => {
    if (!val) {
      return (
        <div className="flex flex-col items-center justify-center text-xs font-cinzel text-[#d4af37]/80">
          <Dices className="w-6 h-6 animate-pulse" />
          <span className="text-[10px] mt-0.5 tracking-wider">ROLL</span>
        </div>
      );
    }

    const pipClass = 'w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#1c1510] shadow-inner';

    switch (val) {
      case 1:
        return (
          <div className="w-full h-full flex items-center justify-center">
            <span className={`${pipClass} w-3.5 h-3.5 sm:w-4 sm:h-4 bg-[#b91c1c] ring-1 ring-[#ffd700]`} />
          </div>
        );
      case 2:
        return (
          <div className="w-full h-full flex justify-between p-2">
            <span className={pipClass} />
            <span className={`${pipClass} self-end`} />
          </div>
        );
      case 3:
        return (
          <div className="w-full h-full flex justify-between p-2">
            <span className={pipClass} />
            <span className={`${pipClass} self-center`} />
            <span className={`${pipClass} self-end`} />
          </div>
        );
      case 4:
        return (
          <div className="w-full h-full grid grid-cols-2 grid-rows-2 p-2 place-items-center">
            <span className={pipClass} />
            <span className={pipClass} />
            <span className={pipClass} />
            <span className={pipClass} />
          </div>
        );
      case 5:
        return (
          <div className="relative w-full h-full p-2">
            <div className="w-full h-full grid grid-cols-2 grid-rows-2 place-items-center">
              <span className={pipClass} />
              <span className={pipClass} />
              <span className={pipClass} />
              <span className={pipClass} />
            </div>
            <span className={`${pipClass} absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ring-1 ring-[#b45309]`} />
          </div>
        );
      case 6:
        return (
          <div className="w-full h-full grid grid-cols-2 grid-rows-3 p-1.5 sm:p-2 place-items-center">
            <span className={`${pipClass} bg-[#b91c1c]`} />
            <span className={`${pipClass} bg-[#b91c1c]`} />
            <span className={`${pipClass} bg-[#b91c1c]`} />
            <span className={`${pipClass} bg-[#b91c1c]`} />
            <span className={`${pipClass} bg-[#b91c1c]`} />
            <span className={`${pipClass} bg-[#b91c1c]`} />
          </div>
        );
      default:
        return null;
    }
  };

  const isRollActionAllowed = !disabled && !isRolling && !hasRolled && availableMovesCount === 0;
  const canAdvance = !disabled && !isRolling && (hasRolled || availableMovesCount > 0) && availableMovesCount > 0;

  const defaultActionText = diceValue === 6 ? 'Enter / Run Token' : 'Advance Token';
  const actionButtonText = isRolling
    ? 'Casting...'
    : canAdvance
    ? (advanceButtonLabel || defaultActionText)
    : hasRolled
    ? 'Awaiting Move'
    : 'Cast Dice';

  const handleActionClick = () => {
    if (canAdvance && onAdvanceToken) {
      onAdvanceToken();
    } else if (isRollActionAllowed) {
      onRoll();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-2.5 w-full select-none">
      {/* Capture Announcement Banner */}
      {captureMessage && (
        <div
          role="status"
          aria-live="polite"
          className="w-full flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#991b1b]/90 via-[#7f1d1d] to-[#450a0a] border border-[#f87171]/70 text-[#fee2e2] text-xs shadow-lg animate-in fade-in slide-in-from-top-2 duration-300"
        >
          <div className="flex items-center gap-1.5 truncate">
            <Swords className="w-4 h-4 text-[#ffd700] shrink-0 animate-bounce" />
            <span className="font-medium truncate font-cinzel tracking-wide">{captureMessage}</span>
          </div>
          {onDismissCapture && (
            <button
              type="button"
              onClick={onDismissCapture}
              className="text-[#fca5a5] hover:text-white text-xs px-1 cursor-pointer font-bold"
              aria-label="Dismiss capture alert"
            >
              ×
            </button>
          )}
        </div>
      )}

      {/* Royal 6 Extra Turn Toast Banner */}
      {extraTurnToast && (
        <div
          role="status"
          aria-live="polite"
          className="w-full flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#b45309]/90 via-[#92400e] to-[#78350f] border border-[#fbbf24]/80 text-[#fef3c7] text-xs shadow-lg animate-in fade-in slide-in-from-top-2 duration-300"
        >
          <div className="flex items-center gap-1.5 truncate">
            <Sparkles className="w-4 h-4 text-[#ffd700] shrink-0 animate-pulse" />
            <span className="font-medium truncate font-cinzel tracking-wide">{extraTurnToast}</span>
          </div>
          {onDismissExtraTurn && (
            <button
              type="button"
              onClick={onDismissExtraTurn}
              className="text-[#fde68a] hover:text-white text-xs px-1 cursor-pointer font-bold"
              aria-label="Dismiss extra turn announcement"
            >
              ×
            </button>
          )}
        </div>
      )}

      {/* Main Dice & Action Trigger Strip */}
      <div className="flex items-center justify-center gap-4 w-full">
        {/* Interactive 3D Ancient Dice Component */}
        <button
          type="button"
          onClick={handleActionClick}
          disabled={!isRollActionAllowed && !canAdvance}
          aria-label={
            isRollActionAllowed
              ? `Cast dice for ${faction.name}`
              : canAdvance
              ? `Tap to advance ${faction.name} token`
              : 'Rolling dice...'
          }
          title={
            isRollActionAllowed
              ? 'Tap to cast the dice of destiny'
              : canAdvance
              ? 'Tap to advance token'
              : undefined
          }
          className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-[#dfd3c3] via-[#c8b69b] to-[#8c7355] border-2 border-[#d4af37] shadow-xl flex items-center justify-center transition-all duration-200 select-none ${
            isRolling
              ? 'rotate-180 scale-110 animate-spin cursor-wait'
              : isRollActionAllowed || canAdvance
              ? 'cursor-pointer hover:scale-105 active:scale-95 ring-2 ring-[#ffd700] shadow-[#d4af37]/50'
              : 'cursor-not-allowed opacity-90'
          }`}
          style={{
            boxShadow: `0 6px 16px -2px rgba(0,0,0,0.6), 0 0 14px ${faction.glowHex}40`,
          }}
        >
          {/* Subtle ivory corner accents */}
          <div className="absolute inset-0.5 rounded-lg border border-[#ffffff]/40 pointer-events-none" />
          {renderPips(diceValue)}
        </button>

        {/* Primary Action Button: Cast Dice or Advance Token */}
        <button
          type="button"
          onClick={handleActionClick}
          disabled={!isRollActionAllowed && !canAdvance}
          className={`min-h-[48px] px-6 py-2.5 rounded-xl font-cinzel font-bold text-sm tracking-wide uppercase transition-all duration-200 select-none shadow-lg active:scale-95 flex items-center justify-center gap-2 ${
            !isRollActionAllowed && !canAdvance
              ? 'bg-[#1e293b]/70 text-[#94a3b8]/50 border border-slate-700/50 cursor-not-allowed'
              : 'bg-gradient-to-r from-[#d4af37] via-[#f59e0b] to-[#b45309] text-[#1c1510] hover:brightness-110 border border-[#ffd700] cursor-pointer shadow-[#d4af37]/30 ring-2 ring-[#ffd700]/60 animate-pulse'
          }`}
        >
          {canAdvance ? <Sparkles className="w-4 h-4 text-[#1c1510]" /> : <Dices className="w-4 h-4" />}
          <span>{actionButtonText}</span>
        </button>
      </div>

      {/* Helpful Status & Guidance Caption */}
      <div className="text-center text-xs tracking-wide min-h-[20px] flex items-center justify-center">
        {isRolling && (
          <span className="text-[#ffd700] animate-pulse flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#ffd700]" />
            The dice tumble upon sacred sandstone...
          </span>
        )}
        {!isRolling && !hasRolled && (
          <span className="text-[#e2d5c3]/90">
            {faction.name}'s Turn · Tap <strong className="text-[#ffd700]">Cast Dice</strong>
          </span>
        )}
        {!isRolling && hasRolled && availableMovesCount > 0 && (
          <span className="text-[#86efac] font-medium flex items-center gap-1.5 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
            Rolled <strong className="font-bold text-[#ffd700] text-sm">{diceValue}</strong>! Tap glowing token, start square, or button above
          </span>
        )}
        {!isRolling && hasRolled && availableMovesCount === 0 && (
          <span className="text-[#fca5a5] flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-[#f87171]" />
            Rolled {diceValue} · No legal moves possible. Turn passes...
          </span>
        )}
      </div>
    </div>
  );
};
