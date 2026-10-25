import React, { useMemo } from 'react';
import { PlayerColor, Player, MoveOption } from '../../types/game';
import { FACTIONS, getTokenCoordinate } from '../../constants/boardData';
import { TokenPiece } from './TokenPiece';
import { KONARK_WHEEL_IMG_URL } from '../../utils/assets';

export interface LudoBoardProps {
  players: Record<PlayerColor, Player>;
  currentColor: PlayerColor;
  availableMoves: MoveOption[];
  onTokenClick: (tokenId: number) => void;
  activeColors: PlayerColor[];
  hasRolled?: boolean;
  isRolling?: boolean;
  diceValue?: number | null;
}

interface CellMeta {
  row: number;
  col: number;
  type: 'yard_green' | 'yard_yellow' | 'yard_red' | 'yard_blue' | 'center' | 'track';
  isSafe?: boolean;
  isHomePath?: boolean;
  homePathColor?: PlayerColor;
  isStartSquare?: boolean;
  startColor?: PlayerColor;
}

export const LudoBoard: React.FC<LudoBoardProps> = ({
  players,
  currentColor,
  availableMoves,
  onTokenClick,
  activeColors,
  hasRolled = false,
  isRolling = false,
  diceValue = null,
}) => {
  // Pre-calculate token positions and group overlapping tokens
  const tokensOnBoard = useMemo(() => {
    const list: Array<{
      playerColor: PlayerColor;
      tokenId: number;
      row: number;
      col: number;
      isMovable: boolean;
      status: string;
    }> = [];

    activeColors.forEach((color) => {
      const p = players[color];
      if (!p) return;
      p.tokens.forEach((tok) => {
        const coord = getTokenCoordinate(color, tok.id, tok.stepCount);
        const isMovable =
          color === currentColor &&
          availableMoves.some((m) => m.tokenId === tok.id);

        list.push({
          playerColor: color,
          tokenId: tok.id,
          row: coord.row,
          col: coord.col,
          isMovable,
          status: tok.status,
        });
      });
    });

    return list;
  }, [players, currentColor, availableMoves, activeColors]);

  // Group tokens by integer cell coordinate for tidy multi-token rendering
  const cellTokensMap = useMemo(() => {
    const map = new Map<string, typeof tokensOnBoard>();
    tokensOnBoard.forEach((item) => {
      // In yard, coordinates can have .5 (e.g., 1.5, 1.5)
      const key = `${item.row.toFixed(1)}_${item.col.toFixed(1)}`;
      const arr = map.get(key) || [];
      arr.push(item);
      map.set(key, arr);
    });
    return map;
  }, [tokensOnBoard]);

  // Determine metadata for track cells (15x15)
  const getCellMeta = (row: number, col: number): CellMeta => {
    // Yards (6x6 corners)
    if (row < 6 && col < 6) return { row, col, type: 'yard_green' };
    if (row < 6 && col > 8) return { row, col, type: 'yard_yellow' };
    if (row > 8 && col < 6) return { row, col, type: 'yard_red' };
    if (row > 8 && col > 8) return { row, col, type: 'yard_blue' };

    // Center (3x3 sanctum)
    if (row >= 6 && row <= 8 && col >= 6 && col <= 8) {
      return { row, col, type: 'center' };
    }

    // Home Column Straights
    if (col === 7 && row >= 1 && row <= 5) {
      return { row, col, type: 'track', isHomePath: true, homePathColor: 'yellow' };
    }
    if (col === 7 && row >= 9 && row <= 13) {
      return { row, col, type: 'track', isHomePath: true, homePathColor: 'red' };
    }
    if (row === 7 && col >= 1 && col <= 5) {
      return { row, col, type: 'track', isHomePath: true, homePathColor: 'green' };
    }
    if (row === 7 && col >= 9 && col <= 13) {
      return { row, col, type: 'track', isHomePath: true, homePathColor: 'blue' };
    }

    // Starting Safe Squares
    if (row === 13 && col === 6) return { row, col, type: 'track', isSafe: true, isStartSquare: true, startColor: 'red' };
    if (row === 6 && col === 1) return { row, col, type: 'track', isSafe: true, isStartSquare: true, startColor: 'green' };
    if (row === 1 && col === 8) return { row, col, type: 'track', isSafe: true, isStartSquare: true, startColor: 'yellow' };
    if (row === 8 && col === 13) return { row, col, type: 'track', isSafe: true, isStartSquare: true, startColor: 'blue' };

    // Star Safe Squares
    if (
      (row === 8 && col === 2) ||
      (row === 2 && col === 6) ||
      (row === 6 && col === 12) ||
      (row === 12 && col === 8)
    ) {
      return { row, col, type: 'track', isSafe: true };
    }

    return { row, col, type: 'track' };
  };

  return (
    <div className="relative w-full max-w-[min(94vw,500px)] aspect-square mx-auto select-none p-1.5 sm:p-2.5 rounded-2xl bg-gradient-to-br from-[#302318] via-[#1a1410] to-[#0c0805] sandstone-border shadow-2xl">
      {/* Decorative Ornate Temple Frame Corner Flutes */}
      <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-[#d4af37]" aria-hidden="true" />
      <div className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-[#d4af37]" aria-hidden="true" />
      <div className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-[#d4af37]" aria-hidden="true" />
      <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-[#d4af37]" aria-hidden="true" />

      {/* The 15x15 Grid Arena */}
      <div className="relative w-full h-full grid grid-cols-15 grid-rows-15 bg-[#121926] rounded-xl overflow-hidden border border-[#d4af37]/40 shadow-inner">
        {/* Render cells for the structural board */}
        {Array.from({ length: 15 }).map((_, r) =>
          Array.from({ length: 15 }).map((_, c) => {
            const meta = getCellMeta(r, c);

            // Hide individual cells inside 6x6 yards and 3x3 center so we can render compound custom zones
            const isYardTopLeft = r === 0 && c === 0;
            const isYardTopRight = r === 0 && c === 9;
            const isYardBottomLeft = r === 9 && c === 0;
            const isYardBottomRight = r === 9 && c === 9;
            const isCenterRoot = r === 6 && c === 6;

            if (
              meta.type.startsWith('yard_') &&
              !isYardTopLeft &&
              !isYardTopRight &&
              !isYardBottomLeft &&
              !isYardBottomRight
            ) {
              return null; // Covered by composite yard block
            }

            if (meta.type === 'center' && !isCenterRoot) {
              return null; // Covered by composite center block
            }

            // Compound Zone: Green Yard (Top Left: 6x6) - Utkala Vana
            if (isYardTopLeft) {
              const isGreenActive = activeColors.includes('green');
              const isGreenTurn = currentColor === 'green';
              const isGreenFlashing = isGreenActive && isGreenTurn && (hasRolled || isRolling);

              return (
                <div
                  key="yard-green"
                  className={`border-r-2 border-b-2 relative flex flex-col items-center justify-between transition-all duration-300 overflow-hidden ${
                    isGreenFlashing
                      ? 'house-flashing-active bg-gradient-to-br from-[#15803d] via-[#166534] to-[#0a2f18] border-r-2 border-b-2 border-[#ffd700]'
                      : isGreenActive
                      ? 'border-[#d4af37]/60 bg-gradient-to-br from-[#14532d] to-[#0a2f18]'
                      : 'border-[#d4af37]/30 bg-gradient-to-br from-[#1b253b]/40 to-[#0e1726]/40 opacity-70'
                  }`}
                  style={{ gridRow: '1 / span 6', gridColumn: '1 / span 6' }}
                >
                  {/* Flashing Ambient Flare - Light & Contained */}
                  {isGreenFlashing && (
                    <div
                      className="absolute inset-0 bg-radial from-[#22c55e]/15 via-[#ffd700]/10 to-transparent pointer-events-none"
                      aria-hidden="true"
                    />
                  )}

                  <div className="w-full flex justify-between items-center px-2 pt-1 text-[10px] sm:text-xs font-cinzel text-[#86efac] tracking-wider uppercase font-semibold z-10">
                    <span className="flex items-center gap-1">
                      <span className={`w-2 h-2 rounded-full bg-[#22c55e] ${isGreenFlashing ? 'animate-ping' : ''}`} />
                      Utkala Vana
                    </span>
                    {isGreenFlashing ? (
                      <span className="house-flash-badge px-1.5 py-0.2 rounded-full bg-[#ffd700] text-black text-[9px] font-sans font-black uppercase tracking-tight shadow-md">
                        {hasRolled && diceValue ? `⚡ ROLLED: ${diceValue}` : '🎲 ROLLING...'}
                      </span>
                    ) : (
                      <span className="text-[#d4af37]">★</span>
                    )}
                  </div>
                  {/* Inner Stone Pedestal for the 4 Yard Tokens */}
                  <div className="w-[84%] h-[76%] rounded-xl bg-[#081f11] border border-[#22c55e]/40 p-2 grid grid-cols-2 grid-rows-2 gap-2 shadow-inner z-10">
                    {[0, 1, 2, 3].map((slotIdx) => {
                      const coord = getTokenCoordinate('green', slotIdx, -1);
                      const key = `${coord.row.toFixed(1)}_${coord.col.toFixed(1)}`;
                      const tokensHere = cellTokensMap.get(key) || [];
                      const isSlotMovable = tokensHere.length > 0 && tokensHere[0].isMovable;

                      return (
                        <div
                          key={`yard-green-${slotIdx}`}
                          onClick={() => {
                            if (isSlotMovable) {
                              onTokenClick(tokensHere[0].tokenId);
                            }
                          }}
                          className={`rounded-full border flex items-center justify-center p-0.5 shadow-sm transition-all duration-200 ${
                            isSlotMovable
                              ? 'bg-[#15803d]/90 border-[#ffd700] cursor-pointer hover:scale-105 z-10'
                              : 'bg-[#14532d]/60 border-[#22c55e]/30'
                          }`}
                        >
                          {tokensHere.length > 0 && (
                            <TokenPiece
                              color="green"
                              tokenId={tokensHere[0].tokenId}
                              isMovable={tokensHere[0].isMovable}
                              onClick={() => onTokenClick(tokensHere[0].tokenId)}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            }

            // Compound Zone: Yellow Yard (Top Right: 6x6) - Surya Rath (Dormant in 2-Player mode)
            if (isYardTopRight) {
              const isYellowActive = activeColors.includes('yellow');
              const isYellowTurn = currentColor === 'yellow';
              const isYellowFlashing = isYellowActive && isYellowTurn && (hasRolled || isRolling);

              return (
                <div
                  key="yard-yellow"
                  className={`border-l-2 border-b-2 relative flex flex-col items-center justify-between transition-all duration-300 overflow-hidden ${
                    isYellowFlashing
                      ? 'house-flashing-active bg-gradient-to-br from-[#d97706] via-[#b45309] to-[#78350f] border-l-2 border-b-2 border-[#ffd700]'
                      : isYellowActive
                      ? 'border-[#d4af37]/60 bg-gradient-to-br from-[#b45309] to-[#78350f]'
                      : 'border-[#d4af37]/30 bg-gradient-to-br from-[#1e1710]/80 to-[#120d09]/80 opacity-75'
                  }`}
                  style={{ gridRow: '1 / span 6', gridColumn: '10 / span 6' }}
                >
                  {/* Flashing Ambient Flare - Light & Contained */}
                  {isYellowFlashing && (
                    <div
                      className="absolute inset-0 bg-radial from-[#eab308]/15 via-[#ffd700]/10 to-transparent pointer-events-none"
                      aria-hidden="true"
                    />
                  )}

                  <div className="w-full flex justify-between items-center px-2 pt-1 text-[10px] sm:text-xs font-cinzel text-[#fde047] tracking-wider uppercase font-semibold z-10">
                    <span className="flex items-center gap-1">
                      <span className={`w-2 h-2 rounded-full bg-[#eab308] ${isYellowFlashing ? 'animate-ping' : ''}`} />
                      Surya Rath
                    </span>
                    {isYellowFlashing ? (
                      <span className="house-flash-badge px-1.5 py-0.2 rounded-full bg-[#ffd700] text-black text-[9px] font-sans font-black uppercase tracking-tight shadow-md">
                        {hasRolled && diceValue ? `⚡ ROLLED: ${diceValue}` : '🎲 ROLLING...'}
                      </span>
                    ) : (
                      <span className="text-[#d4af37]/60">☸</span>
                    )}
                  </div>
                  <div className="w-[84%] h-[76%] rounded-xl bg-[#1c130b] border border-[#d4af37]/25 p-2 grid grid-cols-2 grid-rows-2 gap-2 shadow-inner z-10">
                    {[0, 1, 2, 3].map((slotIdx) => {
                      const coord = getTokenCoordinate('yellow', slotIdx, -1);
                      const key = `${coord.row.toFixed(1)}_${coord.col.toFixed(1)}`;
                      const tokensHere = cellTokensMap.get(key) || [];
                      const isSlotMovable = tokensHere.length > 0 && tokensHere[0].isMovable;

                      return (
                        <div
                          key={`yard-yellow-${slotIdx}`}
                          onClick={() => {
                            if (isSlotMovable) {
                              onTokenClick(tokensHere[0].tokenId);
                            }
                          }}
                          className={`rounded-full border flex items-center justify-center p-0.5 shadow-sm transition-all duration-200 ${
                            isSlotMovable
                              ? 'bg-[#b45309]/90 border-[#ffd700] cursor-pointer hover:scale-105 z-10'
                              : 'bg-[#2a1d12]/60 border-[#d4af37]/20'
                          }`}
                        >
                          {tokensHere.length > 0 && (
                            <TokenPiece
                              color="yellow"
                              tokenId={tokensHere[0].tokenId}
                              isMovable={tokensHere[0].isMovable}
                              onClick={() => onTokenClick(tokensHere[0].tokenId)}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <span className="text-[9px] font-cinzel text-[#d4af37]/70 tracking-wider pb-1 z-10">
                    {isYellowFlashing ? '⚡ Active Roll' : isYellowActive ? 'Active House' : 'Dormant Sanctuary'}
                  </span>
                </div>
              );
            }

            // Compound Zone: Red Yard (Bottom Left: 6x6) - Kalinga Sena
            if (isYardBottomLeft) {
              const isRedActive = activeColors.includes('red');
              const isRedTurn = currentColor === 'red';
              const isRedFlashing = isRedActive && isRedTurn && (hasRolled || isRolling);

              return (
                <div
                  key="yard-red"
                  className={`border-r-2 border-t-2 relative flex flex-col items-center justify-between transition-all duration-300 overflow-hidden ${
                    isRedFlashing
                      ? 'house-flashing-active bg-gradient-to-br from-[#b91c1c] via-[#991b1b] to-[#450a0a] border-r-2 border-t-2 border-[#ffd700]'
                      : isRedActive
                      ? 'border-[#d4af37]/60 bg-gradient-to-br from-[#991b1b] to-[#450a0a]'
                      : 'border-[#d4af37]/30 bg-gradient-to-br from-[#1e0f0f]/80 to-[#100606]/80 opacity-75'
                  }`}
                  style={{ gridRow: '10 / span 6', gridColumn: '1 / span 6' }}
                >
                  {/* Flashing Ambient Flare - Light & Contained */}
                  {isRedFlashing && (
                    <div
                      className="absolute inset-0 bg-radial from-[#ef4444]/15 via-[#ffd700]/10 to-transparent pointer-events-none"
                      aria-hidden="true"
                    />
                  )}

                  <div className="w-[84%] h-[76%] rounded-xl bg-[#240505] border border-[#ef4444]/40 p-2 grid grid-cols-2 grid-rows-2 gap-2 shadow-inner mt-1 z-10">
                    {[0, 1, 2, 3].map((slotIdx) => {
                      const coord = getTokenCoordinate('red', slotIdx, -1);
                      const key = `${coord.row.toFixed(1)}_${coord.col.toFixed(1)}`;
                      const tokensHere = cellTokensMap.get(key) || [];
                      const isSlotMovable = tokensHere.length > 0 && tokensHere[0].isMovable;

                      return (
                        <div
                          key={`yard-red-${slotIdx}`}
                          onClick={() => {
                            if (isSlotMovable) {
                              onTokenClick(tokensHere[0].tokenId);
                            }
                          }}
                          className={`rounded-full border flex items-center justify-center p-0.5 shadow-sm transition-all duration-200 ${
                            isSlotMovable
                              ? 'bg-[#b91c1c]/90 border-[#ffd700] cursor-pointer hover:scale-105 z-10'
                              : 'bg-[#991b1b]/60 border-[#ef4444]/30'
                          }`}
                        >
                          {tokensHere.length > 0 && (
                            <TokenPiece
                              color="red"
                              tokenId={tokensHere[0].tokenId}
                              isMovable={tokensHere[0].isMovable}
                              onClick={() => onTokenClick(tokensHere[0].tokenId)}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="w-full flex justify-between items-center px-2 pb-1 text-[10px] sm:text-xs font-cinzel text-[#fca5a5] tracking-wider uppercase font-semibold z-10">
                    <span className="flex items-center gap-1">
                      <span className={`w-2 h-2 rounded-full bg-[#ef4444] ${isRedFlashing ? 'animate-ping' : ''}`} />
                      Kalinga Sena
                    </span>
                    {isRedFlashing ? (
                      <span className="house-flash-badge px-1.5 py-0.2 rounded-full bg-[#ffd700] text-black text-[9px] font-sans font-black uppercase tracking-tight shadow-md">
                        {hasRolled && diceValue ? `⚡ ROLLED: ${diceValue}` : '🎲 ROLLING...'}
                      </span>
                    ) : (
                      <span className="text-[9px] font-cinzel text-[#d4af37]/70 tracking-wider">
                        {isRedActive ? 'Active House' : 'Dormant Sanctuary'}
                      </span>
                    )}
                  </div>
                </div>
              );
            }

            // Compound Zone: Blue Yard (Bottom Right: 6x6) - Nilachala
            if (isYardBottomRight) {
              const isBlueActive = activeColors.includes('blue');
              const isBlueTurn = currentColor === 'blue';
              const isBlueFlashing = isBlueActive && isBlueTurn && (hasRolled || isRolling);

              return (
                <div
                  key="yard-blue"
                  className={`border-l-2 border-t-2 relative flex flex-col items-center justify-between transition-all duration-300 overflow-hidden ${
                    isBlueFlashing
                      ? 'house-flashing-active bg-gradient-to-br from-[#2563eb] via-[#1d4ed8] to-[#0f172a] border-l-2 border-t-2 border-[#ffd700]'
                      : isBlueActive
                      ? 'border-[#d4af37]/60 bg-gradient-to-br from-[#1e3a8a] to-[#0f172a]'
                      : 'border-[#d4af37]/30 bg-gradient-to-br from-[#0c1322]/80 to-[#070b14]/80 opacity-75'
                  }`}
                  style={{ gridRow: '10 / span 6', gridColumn: '10 / span 6' }}
                >
                  {/* Flashing Ambient Flare - Light & Contained */}
                  {isBlueFlashing && (
                    <div
                      className="absolute inset-0 bg-radial from-[#3b82f6]/15 via-[#ffd700]/10 to-transparent pointer-events-none"
                      aria-hidden="true"
                    />
                  )}

                  <div className="w-[84%] h-[76%] rounded-xl bg-[#091024] border border-[#3b82f6]/25 p-2 grid grid-cols-2 grid-rows-2 gap-2 shadow-inner mt-1 z-10">
                    {[0, 1, 2, 3].map((slotIdx) => {
                      const coord = getTokenCoordinate('blue', slotIdx, -1);
                      const key = `${coord.row.toFixed(1)}_${coord.col.toFixed(1)}`;
                      const tokensHere = cellTokensMap.get(key) || [];
                      const isSlotMovable = tokensHere.length > 0 && tokensHere[0].isMovable;

                      return (
                        <div
                          key={`yard-blue-${slotIdx}`}
                          onClick={() => {
                            if (isSlotMovable) {
                              onTokenClick(tokensHere[0].tokenId);
                            }
                          }}
                          className={`rounded-full border flex items-center justify-center p-0.5 shadow-sm transition-all duration-200 ${
                            isSlotMovable
                              ? 'bg-[#1e3a8a]/90 border-[#ffd700] cursor-pointer hover:scale-105 z-10'
                              : 'bg-[#091024]/60 border-[#3b82f6]/20'
                          }`}
                        >
                          {tokensHere.length > 0 && (
                            <TokenPiece
                              color="blue"
                              tokenId={tokensHere[0].tokenId}
                              isMovable={tokensHere[0].isMovable}
                              onClick={() => onTokenClick(tokensHere[0].tokenId)}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="w-full flex justify-between items-center px-2 pb-1 text-[10px] sm:text-xs font-cinzel text-[#93c5fd] tracking-wider uppercase font-semibold z-10">
                    <span className="flex items-center gap-1">
                      <span className={`w-2 h-2 rounded-full bg-[#3b82f6] ${isBlueFlashing ? 'animate-ping' : ''}`} />
                      Nilachala Sena
                    </span>
                    {isBlueFlashing ? (
                      <span className="house-flash-badge px-1.5 py-0.2 rounded-full bg-[#ffd700] text-black text-[9px] font-sans font-black uppercase tracking-tight shadow-md">
                        {hasRolled && diceValue ? `⚡ ROLLED: ${diceValue}` : '🎲 ROLLING...'}
                      </span>
                    ) : (
                      <span className="text-[9px] font-cinzel text-[#d4af37]/70 tracking-wider">
                        {isBlueActive ? 'Active House' : 'Dormant Sanctuary'}
                      </span>
                    )}
                  </div>
                </div>
              );
            }

            // Compound Zone: Center Finishing Sanctuary (3x3: cols 6-8, rows 6-8)
            if (isCenterRoot) {
              return (
                <div
                  key="center-sanctuary"
                  className="relative bg-[#1c1510] border-2 border-[#d4af37] shadow-2xl overflow-hidden flex items-center justify-center"
                  style={{ gridRow: '7 / span 3', gridColumn: '7 / span 3' }}
                >
                  {/* 4 Colored Triangular Wings Meeting in Center */}
                  {/* Top: Yellow (or dormant sandstone) */}
                  <div
                    className="absolute inset-0"
                    style={{
                      clipPath: 'polygon(0 0, 100% 0, 50% 50%)',
                      backgroundColor: '#5c401b',
                      opacity: 0.8,
                    }}
                  />
                  {/* Bottom: Red (Kalinga) */}
                  <div
                    className="absolute inset-0"
                    style={{
                      clipPath: 'polygon(0 100%, 100% 100%, 50% 50%)',
                      backgroundColor: '#991b1b',
                      opacity: 0.95,
                    }}
                  />
                  {/* Left: Green (Utkala) */}
                  <div
                    className="absolute inset-0"
                    style={{
                      clipPath: 'polygon(0 0, 0 100%, 50% 50%)',
                      backgroundColor: '#14532d',
                      opacity: 0.95,
                    }}
                  />
                  {/* Right: Blue (Nilachala) */}
                  <div
                    className="absolute inset-0"
                    style={{
                      clipPath: 'polygon(100% 0, 100% 100%, 50% 50%)',
                      backgroundColor: '#1a2942',
                      opacity: 0.8,
                    }}
                  />

                  {/* Central Sacred Konark Wheel & Garbhagriha */}
                  <div className="relative z-10 w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#ffd700] via-[#d4af37] to-[#78350f] border-2 border-[#ffffff] flex items-center justify-center shadow-lg overflow-hidden p-0.5">
                    <img
                      src={KONARK_WHEEL_IMG_URL}
                      alt="Konark Sun Temple Wheel"
                      className="w-full h-full object-contain rounded-full select-none pointer-events-none drop-shadow-[0_0_6px_rgba(255,215,0,0.7)]"
                      style={{ animation: 'spin 24s linear infinite' }}
                    />
                  </div>

                  {/* Render Finished Tokens in Center Sanctuary for Active Players */}
                  {activeColors.map((col) => {
                    const p = players[col];
                    if (!p || p.tokensFinished === 0) return null;

                    // Position inside corresponding triangle
                    const posClass =
                      col === 'red'
                        ? 'bottom-1.5'
                        : col === 'green'
                        ? 'left-1.5'
                        : col === 'yellow'
                        ? 'top-1.5'
                        : 'right-1.5';

                    return (
                      <div
                        key={`finished-${col}`}
                        className={`absolute z-20 flex items-center justify-center ${posClass}`}
                      >
                        <span className="text-[9px] sm:text-[10px] font-bold text-white bg-black/80 px-1.5 py-0.5 rounded-full border border-[#ffd700] shadow-md">
                          {p.tokensFinished}/4
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            }

            // Regular Track Cells (1x1)
            let cellBg = 'bg-[#1b253b]';
            let cellBorder = 'border-[#2d3a54]';

            if (meta.isHomePath && meta.homePathColor) {
              const isColActive = activeColors.includes(meta.homePathColor);
              if (meta.homePathColor === 'red') cellBg = 'bg-[#991b1b]';
              else if (meta.homePathColor === 'green') cellBg = 'bg-[#14532d]';
              else if (meta.homePathColor === 'yellow') cellBg = isColActive ? 'bg-[#b45309]' : 'bg-[#42311f]';
              else if (meta.homePathColor === 'blue') cellBg = isColActive ? 'bg-[#1e3a8a]' : 'bg-[#1a2538]';
              cellBorder = 'border-[#d4af37]/50';
            } else if (meta.isStartSquare && meta.startColor) {
              if (meta.startColor === 'red') cellBg = 'bg-[#7f1d1d]';
              else if (meta.startColor === 'green') cellBg = 'bg-[#14532d]';
              else if (meta.startColor === 'yellow') cellBg = 'bg-[#92400e]';
              else if (meta.startColor === 'blue') cellBg = 'bg-[#1e3a8a]';
              cellBorder = 'border-[#ffd700]';
            } else if (meta.isSafe) {
              cellBg = 'bg-[#26354f]';
              cellBorder = 'border-[#d4af37]/70';
            }

            // Check if tokens exist on this track cell
            const cellKey = `${r.toFixed(1)}_${c.toFixed(1)}`;
            const tokensOnThisCell = cellTokensMap.get(cellKey) || [];

            // Interaction helpers:
            const movableToken = tokensOnThisCell.find((t) => t.isMovable);
            const isCurrentPlayerStart = meta.isStartSquare && meta.startColor === currentColor;
            const baseExitMove = isCurrentPlayerStart ? availableMoves.find((m) => m.isBaseExit) : undefined;
            const isClickableCell = Boolean(movableToken || baseExitMove);

            const handleCellClick = () => {
              if (movableToken) {
                onTokenClick(movableToken.tokenId);
              } else if (baseExitMove) {
                onTokenClick(baseExitMove.tokenId);
              }
            };

            return (
              <div
                key={`cell-${r}-${c}`}
                onClick={isClickableCell ? handleCellClick : undefined}
                style={{ gridRowStart: r + 1, gridColumnStart: c + 1 }}
                className={`relative flex items-center justify-center border ${cellBorder} ${cellBg} transition-colors duration-150 overflow-hidden p-0.5 ${
                  isClickableCell ? 'cursor-pointer hover:brightness-125' : ''
                } ${baseExitMove ? 'ring-1.5 ring-[#ffd700] ring-inset' : ''}`}
                title={
                  baseExitMove
                    ? 'Start Square: Tap to enter token onto battlefield!'
                    : movableToken
                    ? 'Tap to move active token forward'
                    : undefined
                }
              >
                {/* Safe Square Sacred Star Sigil */}
                {meta.isSafe && tokensOnThisCell.length === 0 && (
                  <span
                    className={`text-xs sm:text-sm font-bold opacity-80 select-none ${
                      baseExitMove ? 'text-[#ffffff] scale-110' : 'text-[#ffd700]'
                    }`}
                    title={baseExitMove ? 'Tap to enter token!' : 'Safe Square - Protected by Destiny'}
                    aria-label="Safe square"
                  >
                    ★
                  </span>
                )}

                {/* Home Path Directional Arrow Indicator */}
                {meta.isHomePath && tokensOnThisCell.length === 0 && (
                  <span className="text-white/40 text-[9px] sm:text-[10px] font-bold">
                    {meta.homePathColor === 'red' && '▲'}
                    {meta.homePathColor === 'yellow' && '▼'}
                    {meta.homePathColor === 'green' && '▶'}
                    {meta.homePathColor === 'blue' && '◀'}
                  </span>
                )}

                {/* Render Multiple Tokens on this cell if present */}
                {tokensOnThisCell.length > 0 && (
                  <div className="relative w-full h-full flex items-center justify-center">
                    {tokensOnThisCell.length === 1 ? (
                      // Single token: standard centered piece
                      <TokenPiece
                        color={tokensOnThisCell[0].playerColor}
                        tokenId={tokensOnThisCell[0].tokenId}
                        isMovable={tokensOnThisCell[0].isMovable}
                        onClick={() => onTokenClick(tokensOnThisCell[0].tokenId)}
                        size="full"
                      />
                    ) : tokensOnThisCell.length === 2 ? (
                      // Exactly 2 tokens sharing square: side-by-side layout, both directly clickable!
                      <div className="w-full h-full flex items-center justify-around gap-0.5">
                        {tokensOnThisCell.map((tok) => (
                          <div key={`tok-${tok.playerColor}-${tok.tokenId}`} className="w-1/2 h-full flex items-center justify-center">
                            <TokenPiece
                              color={tok.playerColor}
                              tokenId={tok.tokenId}
                              isMovable={tok.isMovable}
                              onClick={() => onTokenClick(tok.tokenId)}
                              size="sm"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      // 3 or 4 tokens sharing square: 2x2 grid layout, each directly clickable!
                      <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-0.5 place-items-center">
                        {tokensOnThisCell.map((tok) => (
                          <div key={`tok-${tok.playerColor}-${tok.tokenId}`} className="w-full h-full flex items-center justify-center">
                            <TokenPiece
                              color={tok.playerColor}
                              tokenId={tok.tokenId}
                              isMovable={tok.isMovable}
                              onClick={() => onTokenClick(tok.tokenId)}
                              size="sm"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
