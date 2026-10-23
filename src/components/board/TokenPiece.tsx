import React from 'react';
import { PlayerColor } from '../../types/game';
import { FACTIONS } from '../../constants/boardData';

export interface TokenPieceProps {
  color: PlayerColor;
  tokenId: number;
  isMovable: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'full';
}

export const TokenPiece: React.FC<TokenPieceProps> = ({
  color,
  tokenId,
  isMovable,
  onClick,
  size = 'full',
}) => {
  const faction = FACTIONS[color];

  // Dynamic styling based on size variant
  const isSmall = size === 'sm';
  const isMedium = size === 'md';

  const containerStyle = isSmall
    ? 'w-full h-full max-w-[16px] max-h-[16px] sm:max-w-[18px] sm:max-h-[18px]'
    : isMedium
    ? 'w-full h-full max-w-[24px] max-h-[24px]'
    : 'w-full h-full max-w-[34px] max-h-[34px]';

  return (
    <button
      type="button"
      onClick={(e) => {
        if (isMovable && onClick) {
          e.stopPropagation();
          onClick();
        }
      }}
      disabled={!isMovable}
      title={`${faction.name} Token ${tokenId + 1}${
        isMovable ? ' (Tap to advance)' : ' (Cannot move this turn)'
      }`}
      aria-label={`${faction.name} Token ${tokenId + 1}${isMovable ? ' - Tap to move' : ''}`}
      className={`relative group flex items-center justify-center p-0 select-none transition-transform duration-200 w-full h-full min-w-[28px] min-h-[28px] ${
        isMovable
          ? 'cursor-pointer hover:scale-125 active:scale-95 z-30'
          : 'cursor-default opacity-90 z-10'
      }`}
    >
      {/* Movable Pulsing Halo */}
      {isMovable && (
        <span
          className="absolute -inset-1 rounded-full animate-ping opacity-80 pointer-events-none"
          style={{ backgroundColor: faction.glowHex }}
          aria-hidden="true"
        />
      )}

      {/* Main Token Medallion (Temple Seal Coin) */}
      <div
        className={`relative ${containerStyle} rounded-full flex items-center justify-center shadow-lg transition-all duration-200 ${
          isMovable
            ? 'ring-2 ring-[#ffd700] ring-offset-1 ring-offset-[#0b1329] shadow-[#d4af37]/60 scale-105'
            : 'shadow-black/70'
        }`}
        style={{
          background: `radial-gradient(circle at 35% 30%, ${faction.accentHex} 0%, ${faction.bgHex} 65%, #0e0a07 100%)`,
          border: `${isSmall ? '1px' : '2px'} solid ${isMovable ? '#ffd700' : '#d4af37'}`,
        }}
      >
        {/* Inner Gold Rim & Carved Core */}
        <div className="w-[60%] h-[60%] rounded-full border border-[#d4af37]/60 flex items-center justify-center bg-black/30">
          <span
            className="rounded-full block shadow-inner"
            style={{
              width: isSmall ? '4px' : '8px',
              height: isSmall ? '4px' : '8px',
              backgroundColor: isMovable ? '#ffffff' : faction.accentHex,
              boxShadow: isMovable ? `0 0 6px ${faction.glowHex}` : 'none',
            }}
          />
        </div>

        {/* Movable bouncing badge for larger sizes */}
        {isMovable && !isSmall && (
          <span
            className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#ffd700] rounded-full border border-black animate-bounce pointer-events-none"
            aria-hidden="true"
          />
        )}
      </div>
    </button>
  );
};
