import React from 'react';
import { PlayerColor } from '../../types/game';
import { FACTIONS } from '../../constants/boardData';
import { Dices, Sparkles, Swords, AlertCircle } from 'lucide-react';

export interface DiceRollerProps {
  currentColor: PlayerColor;
  diceValue: number | null;
  isRolling: boolean;
  hasRolled: boolean;
  isAutoMoving?: boolean;
  availableMovesCount: number;
  onRoll: () => void;
  onAdvanceToken?: () => void;
  advanceButtonLabel?: string;
  disabled?: boolean;
  captureMessage?: string | null;
  onDismissCapture?: () => void;
  extraTurnToast?: string | null;
  onDismissExtraTurn?: () => void;
  playerColor?: PlayerColor;
}

export const DiceRoller: React.FC<DiceRollerProps> = React.memo(({
  currentColor,
  diceValue,
  isRolling,
  hasRolled,
  isAutoMoving = false,
  availableMovesCount,
  onRoll,
  onAdvanceToken,
  advanceButtonLabel,
  disabled = false,
  captureMessage,
  onDismissCapture,
  extraTurnToast,
  onDismissExtraTurn,
  playerColor,
}) => {
  const faction = FACTIONS[currentColor];

  // Render dice pips based on value (1..6)
  const renderPips = (val: number | null) => {
    const pipClass =
      'w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#0f172a] shadow-[inset_0_2px_4px_rgba(0,0,0,0.8),0_1px_1px_rgba(255,255,255,0.8)] border border-slate-900';
    const rubyPipClass =
      'w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-gradient-to-br from-[#ef4444] to-[#991b1b] shadow-[0_0_6px_rgba(239,68,68,0.7),inset_0_1px_2px_rgba(255,255,255,0.6)] border border-[#b91c1c]';

    if (!val) {
      return (
        <div className="flex flex-col items-center justify-center w-full h-full p-1 select-none">
          <Dices className="w-8 h-8 sm:w-9 sm:h-9 text-[#b91c1c] drop-shadow-[0_2px_4px_rgba(185,28,28,0.4)] animate-bounce" />
          <span className="text-[10px] sm:text-[11px] font-cinzel font-black tracking-widest text-[#991b1b] uppercase mt-0.5 bg-[#ffd700] px-2 py-0.5 rounded-full border border-[#b45309] shadow-md">
            ROLL
          </span>
        </div>
      );
    }

    switch (val) {
      case 1:
        return (
          <div className="w-full h-full flex items-center justify-center">
            <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gradient-to-br from-[#ef4444] to-[#991b1b] ring-2 ring-[#ffd700] shadow-[0_0_12px_rgba(239,68,68,0.8),inset_0_2px_4px_rgba(255,255,255,0.6)]" />
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
            <span className={`${rubyPipClass} absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ring-1 ring-[#b45309]`} />
          </div>
        );
      case 6:
        return (
          <div className="w-full h-full grid grid-cols-2 grid-rows-3 p-1.5 sm:p-2 place-items-center">
            <span className={rubyPipClass} />
            <span className={rubyPipClass} />
            <span className={rubyPipClass} />
            <span className={rubyPipClass} />
            <span className={rubyPipClass} />
            <span className={rubyPipClass} />
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
    : isAutoMoving
    ? 'Auto-Advancing...'
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
      <div className="flex items-center justify-center gap-4 sm:gap-6 w-full py-1">
        {/* Interactive 3D Ancient Dice Component */}
        <div className="relative flex flex-col items-center">
          {/* Floating 'TAP TO ROLL' Badge when it's time to roll */}
          {isRollActionAllowed && (
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20 px-2 py-0.5 rounded-full bg-gradient-to-r from-[#ffd700] via-[#f59e0b] to-[#ffd700] text-[#1c1510] text-[9px] font-cinzel font-black tracking-wider uppercase shadow-[0_2px_8px_rgba(0,0,0,0.5)] border border-white whitespace-nowrap animate-bounce pointer-events-none">
              TAP TO ROLL
            </div>
          )}

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
            className={`relative w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-br from-[#ffffff] via-[#f8fafc] to-[#e2e8f0] border-2 border-[#d4af37] flex items-center justify-center transition-all duration-200 select-none ${
              isRolling
                ? 'rotate-180 scale-110 animate-spin cursor-wait'
                : isRollActionAllowed || canAdvance
                ? 'cursor-pointer hover:scale-108 active:scale-95 ring-4 ring-[#ffd700] ring-offset-2 ring-offset-[#0b1329] shadow-[0_0_24px_rgba(255,215,0,0.85),0_8px_20px_rgba(0,0,0,0.6)] animate-pulse'
                : 'cursor-not-allowed opacity-90 shadow-md'
            }`}
            style={{
              boxShadow: isRollActionAllowed
                ? `0 10px 25px rgba(0,0,0,0.7), 0 0 24px rgba(255,215,0,0.8), inset 0 2px 4px rgba(255,255,255,1), inset 0 -3px 6px rgba(0,0,0,0.15)`
                : `0 8px 18px rgba(0,0,0,0.6), inset 0 2px 4px rgba(255,255,255,0.9), inset 0 -2px 4px rgba(0,0,0,0.1)`,
            }}
          >
            {/* Subtle ivory corner accents */}
            <div className="absolute inset-0.5 rounded-xl border border-[#ffffff] pointer-events-none" />
            {renderPips(diceValue)}
          </button>
        </div>

        {/* Primary Action Button: Cast Dice or Advance Token */}
        <button
          type="button"
          onClick={handleActionClick}
          disabled={!isRollActionAllowed && !canAdvance}
          className={`min-h-[50px] px-6 py-2.5 rounded-xl font-cinzel font-black text-sm tracking-wide uppercase transition-all duration-200 select-none shadow-xl active:scale-95 flex items-center justify-center gap-2.5 ${
            !isRollActionAllowed && !canAdvance
              ? 'bg-[#1e293b]/70 text-[#94a3b8]/50 border border-slate-700/50 cursor-not-allowed'
              : 'bg-gradient-to-r from-[#ffd700] via-[#f59e0b] to-[#d97706] text-[#1c1510] hover:brightness-110 border-2 border-[#ffd700] cursor-pointer shadow-[0_0_20px_rgba(255,215,0,0.5)] ring-2 ring-[#ffd700]/80'
          }`}
        >
          {canAdvance ? (
            <Sparkles className="w-5 h-5 text-[#1c1510]" />
          ) : (
            <Dices className="w-5 h-5 text-[#1c1510] animate-bounce" />
          )}
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
            {currentColor === playerColor ? (
              <span className="text-[#ffd700] font-semibold">Your Turn ({faction.name})</span>
            ) : (
              <span>{faction.name}'s Turn</span>
            )}
            {' · Tap '}<strong className="text-[#ffd700]">Cast Dice</strong>
          </span>
        )}
        {!isRolling && hasRolled && availableMovesCount > 0 && (
          isAutoMoving ? (
            <span className="text-[#ffd700] font-semibold flex items-center gap-1.5 animate-pulse">
              <Sparkles className="w-4 h-4 text-[#ffd700]" />
              Single token active · Auto-advancing forward {diceValue} steps...
            </span>
          ) : (
            <span className="text-[#86efac] font-medium flex items-center gap-1.5 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
              Rolled <strong className="font-bold text-[#ffd700] text-sm">{diceValue}</strong>! Tap glowing token, start square, or button above
            </span>
          )
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
});
