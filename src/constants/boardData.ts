import { BoardCoordinate, PlayerColor, PlayerFaction } from '../types/game';

/**
 * 4 Factions rooted in Odisha's Heritage and the Mahabharata
 */
export const FACTIONS: Record<PlayerColor, PlayerFaction> = {
  red: {
    id: 'red',
    name: 'Kalinga Sena',
    epicTitle: 'Valor of the Agni',
    shortName: 'Kalinga',
    bgHex: '#991b1b', // Deep Vermilion
    accentHex: '#ef4444',
    borderHex: '#b91c1c',
    glowHex: '#f87171',
    sanctuaryName: 'Fortress of Dhauli',
    sigil: 'Vedic Fire Altar',
  },
  green: {
    id: 'green',
    name: 'Utkala Vana',
    epicTitle: 'Guardians of the Sacred Grove',
    shortName: 'Utkala',
    bgHex: '#14532d', // Deep Emerald
    accentHex: '#22c55e',
    borderHex: '#15803d',
    glowHex: '#4ade80',
    sanctuaryName: 'Forest of Gandhamardan',
    sigil: 'Sacred Banyan Leaf',
  },
  yellow: {
    id: 'yellow',
    name: 'Surya Rath',
    epicTitle: 'Charioteers of Konark',
    shortName: 'Surya',
    bgHex: '#b45309', // Konark Gold / Ochre
    accentHex: '#f59e0b',
    borderHex: '#d97706',
    glowHex: '#fbbf24',
    sanctuaryName: 'Chariot of the Sun',
    sigil: 'Twelve-Spoked Solar Wheel',
  },
  blue: {
    id: 'blue',
    name: 'Nilachala Yoddha',
    epicTitle: 'Keepers of the Sacred Ocean',
    shortName: 'Nilachala',
    bgHex: '#1e3a8a', // Nilachala Indigo
    accentHex: '#3b82f6',
    borderHex: '#2563eb',
    glowHex: '#60a5fa',
    sanctuaryName: 'Sanctum of Puri',
    sigil: 'Nilachakra Disc',
  },
};

export const COLOR_ORDER: PlayerColor[] = ['red', 'green', 'yellow', 'blue'];

/**
 * Coordinates for the 52-cell outer track in clockwise sequence.
 * Index 0 corresponds to Red's start square at (row 13, col 6).
 */
export const TRACK_COORDINATES: BoardCoordinate[] = [
  // 0..4: Bottom arm ascending on col 6
  { row: 13, col: 6 }, // 0: RED START (Safe)
  { row: 12, col: 6 }, // 1
  { row: 11, col: 6 }, // 2
  { row: 10, col: 6 }, // 3
  { row: 9, col: 6 },  // 4

  // 5..10: Left arm moving left on row 8
  { row: 8, col: 5 },  // 5
  { row: 8, col: 4 },  // 6
  { row: 8, col: 3 },  // 7
  { row: 8, col: 2 },  // 8: SAFE STAR
  { row: 8, col: 1 },  // 9
  { row: 8, col: 0 },  // 10

  // 11..12: Left end moving up on col 0
  { row: 7, col: 0 },  // 11: GREEN HOME ENTRY POINT
  { row: 6, col: 0 },  // 12

  // 13..17: Left arm moving right on row 6
  { row: 6, col: 1 },  // 13: GREEN START (Safe)
  { row: 6, col: 2 },  // 14
  { row: 6, col: 3 },  // 15
  { row: 6, col: 4 },  // 16
  { row: 6, col: 5 },  // 17

  // 18..23: Top arm ascending on col 6
  { row: 5, col: 6 },  // 18
  { row: 4, col: 6 },  // 19
  { row: 3, col: 6 },  // 20
  { row: 2, col: 6 },  // 21: SAFE STAR
  { row: 1, col: 6 },  // 22
  { row: 0, col: 6 },  // 23

  // 24..25: Top end moving right on row 0
  { row: 0, col: 7 },  // 24: YELLOW HOME ENTRY POINT
  { row: 0, col: 8 },  // 25

  // 26..30: Top arm descending on col 8
  { row: 1, col: 8 },  // 26: YELLOW START (Safe)
  { row: 2, col: 8 },  // 27
  { row: 3, col: 8 },  // 28
  { row: 4, col: 8 },  // 29
  { row: 5, col: 8 },  // 30

  // 31..36: Right arm moving right on row 6
  { row: 6, col: 9 },  // 31
  { row: 6, col: 10 }, // 32
  { row: 6, col: 11 }, // 33
  { row: 6, col: 12 }, // 34: SAFE STAR
  { row: 6, col: 13 }, // 35
  { row: 6, col: 14 }, // 36

  // 37..38: Right end moving down on col 14
  { row: 7, col: 14 }, // 37: BLUE HOME ENTRY POINT
  { row: 8, col: 14 }, // 38

  // 39..43: Right arm moving left on row 8
  { row: 8, col: 13 }, // 39: BLUE START (Safe)
  { row: 8, col: 12 }, // 40
  { row: 8, col: 11 }, // 41
  { row: 8, col: 10 }, // 42
  { row: 8, col: 9 },  // 43

  // 44..49: Bottom arm descending on col 8
  { row: 9, col: 8 },  // 44
  { row: 10, col: 8 }, // 45
  { row: 11, col: 8 }, // 46
  { row: 12, col: 8 }, // 47: SAFE STAR
  { row: 13, col: 8 }, // 48
  { row: 14, col: 8 }, // 49

  // 50..51: Bottom end moving left on row 14
  { row: 14, col: 7 }, // 50: RED HOME ENTRY POINT
  { row: 14, col: 6 }, // 51
];

/**
 * Starting track index (0..51) for each player color.
 */
export const START_TRACK_INDICES: Record<PlayerColor, number> = {
  red: 0,
  green: 13,
  yellow: 26,
  blue: 39,
};

/**
 * 8 Safe squares on the track where tokens cannot be captured.
 * Includes the 4 start cells and the 4 mid-arm Chaupar star cells.
 */
export const SAFE_TRACK_INDICES = new Set<number>([0, 8, 13, 21, 26, 34, 39, 47]);

/**
 * 5 Home Column cells leading directly into the center for each player.
 * Step 51 to 55. Step 56 is the finish center.
 */
export const HOME_COLUMNS: Record<PlayerColor, BoardCoordinate[]> = {
  red: [
    { row: 13, col: 7 },
    { row: 12, col: 7 },
    { row: 11, col: 7 },
    { row: 10, col: 7 },
    { row: 9, col: 7 },
  ],
  green: [
    { row: 7, col: 1 },
    { row: 7, col: 2 },
    { row: 7, col: 3 },
    { row: 7, col: 4 },
    { row: 7, col: 5 },
  ],
  yellow: [
    { row: 1, col: 7 },
    { row: 2, col: 7 },
    { row: 3, col: 7 },
    { row: 4, col: 7 },
    { row: 5, col: 7 },
  ],
  blue: [
    { row: 7, col: 13 },
    { row: 7, col: 12 },
    { row: 7, col: 11 },
    { row: 7, col: 10 },
    { row: 7, col: 9 },
  ],
};

/**
 * Center finish coordinates for the 4 colors.
 */
export const FINISH_COORDINATES: Record<PlayerColor, BoardCoordinate> = {
  red: { row: 8, col: 7 },
  green: { row: 7, col: 6 },
  yellow: { row: 6, col: 7 },
  blue: { row: 7, col: 8 },
};

/**
 * 4 Yard slots for each color where tokens rest before entering the track.
 */
export const YARD_SLOTS: Record<PlayerColor, BoardCoordinate[]> = {
  red: [
    { row: 10.5, col: 1.5 },
    { row: 10.5, col: 3.5 },
    { row: 12.5, col: 1.5 },
    { row: 12.5, col: 3.5 },
  ],
  green: [
    { row: 1.5, col: 1.5 },
    { row: 1.5, col: 3.5 },
    { row: 3.5, col: 1.5 },
    { row: 3.5, col: 3.5 },
  ],
  yellow: [
    { row: 1.5, col: 10.5 },
    { row: 1.5, col: 12.5 },
    { row: 3.5, col: 10.5 },
    { row: 3.5, col: 12.5 },
  ],
  blue: [
    { row: 10.5, col: 10.5 },
    { row: 10.5, col: 12.5 },
    { row: 12.5, col: 10.5 },
    { row: 12.5, col: 12.5 },
  ],
};

/**
 * Compute the (row, col) for a token given its color and stepCount.
 * stepCount:
 *  -1 = in yard
 *  0..50 = on outer track
 *  51..55 = in home column
 *  56 = finished in central sanctuary
 */
export function getTokenCoordinate(
  color: PlayerColor,
  tokenId: number,
  stepCount: number
): BoardCoordinate {
  if (stepCount < 0) {
    return YARD_SLOTS[color][tokenId];
  }

  if (stepCount <= 50) {
    const baseStartIndex = START_TRACK_INDICES[color];
    const trackIndex = (baseStartIndex + stepCount) % 52;
    return TRACK_COORDINATES[trackIndex];
  }

  if (stepCount >= 51 && stepCount <= 55) {
    const homeIndex = stepCount - 51;
    return HOME_COLUMNS[color][homeIndex];
  }

  // Finished at center
  return FINISH_COORDINATES[color];
}
