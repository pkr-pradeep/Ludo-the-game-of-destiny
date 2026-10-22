import { BoardCoordinate, PlayerId, TokenLocation } from './types';

/**
 * 52 Outer Track Coordinates around the 15x15 board in clockwise sequence.
 * Index 0 = Red's start square at (row 13, col 6).
 * Index 13 = Green's start square at (row 6, col 1).
 */
export const TRACK_COORDINATES: readonly BoardCoordinate[] = [
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
  { row: 7, col: 0 },  // 11: GREEN HOME ENTRY
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
  { row: 0, col: 7 },  // 24
  { row: 0, col: 8 },  // 25

  // 26..30: Top arm descending on col 8
  { row: 1, col: 8 },  // 26: SAFE STAR (Yellow start)
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
  { row: 7, col: 14 }, // 37
  { row: 8, col: 14 }, // 38

  // 39..43: Right arm moving left on row 8
  { row: 8, col: 13 }, // 39: SAFE STAR (Blue start)
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
  { row: 14, col: 7 }, // 50: RED HOME ENTRY
  { row: 14, col: 6 }, // 51
];

/**
 * Starting track indices (0..51) for players.
 */
export const START_TRACK_INDEX: Record<PlayerId, number> = {
  red: 0,
  green: 13,
};

/**
 * The 8 traditional safe squares on the outer track where tokens cannot be captured.
 */
export const SAFE_TRACK_INDICES = new Set<number>([0, 8, 13, 21, 26, 34, 39, 47]);

/**
 * 5 Home Column cells leading directly into the center for each player (steps 51..55).
 */
export const HOME_COLUMNS: Record<PlayerId, readonly BoardCoordinate[]> = {
  red: [
    { row: 13, col: 7 }, // step 51
    { row: 12, col: 7 }, // step 52
    { row: 11, col: 7 }, // step 53
    { row: 10, col: 7 }, // step 54
    { row: 9, col: 7 },  // step 55
  ],
  green: [
    { row: 7, col: 1 },  // step 51
    { row: 7, col: 2 },  // step 52
    { row: 7, col: 3 },  // step 53
    { row: 7, col: 4 },  // step 54
    { row: 7, col: 5 },  // step 55
  ],
};

/**
 * Central finishing sanctuary coordinates (step 56).
 */
export const GOAL_COORDINATES: Record<PlayerId, BoardCoordinate> = {
  red: { row: 8, col: 7 },
  green: { row: 7, col: 6 },
};

/**
 * Base yard slots for each player's 4 tokens before entering play.
 */
export const BASE_SLOTS: Record<PlayerId, readonly BoardCoordinate[]> = {
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
};

export const MAX_STEP = 56;
export const TRACK_STEP_LIMIT = 50;

/**
 * Convert player's relative step into absolute outer track index (0..51).
 * Returns null if token is in base, in home column, or in goal.
 */
export function getAbsoluteTrackIndex(player: PlayerId, step: number): number | null {
  if (step < 0 || step > TRACK_STEP_LIMIT) return null;
  const startIdx = START_TRACK_INDEX[player];
  return (startIdx + step) % TRACK_COORDINATES.length;
}

/**
 * Check whether a given outer track index is a safe square.
 */
export function isSafeTrackIndex(trackIndex: number): boolean {
  return SAFE_TRACK_INDICES.has(trackIndex);
}

/**
 * Derive token location enum from step.
 */
export function getTokenLocation(step: number): TokenLocation {
  if (step < 0) return 'base';
  if (step <= TRACK_STEP_LIMIT) return 'track';
  if (step < MAX_STEP) return 'home';
  return 'goal';
}

/**
 * Check if token at a given step is immune to capture.
 */
export function isTokenSafe(player: PlayerId, step: number): boolean {
  if (step < 0 || step > TRACK_STEP_LIMIT) {
    // Base, home column, and goal are inherently safe from opponent captures
    return true;
  }
  const trackIdx = getAbsoluteTrackIndex(player, step);
  return trackIdx !== null && isSafeTrackIndex(trackIdx);
}

/**
 * Compute the 15x15 board coordinate for a token.
 */
export function getTokenCoordinate(
  player: PlayerId,
  tokenId: number,
  step: number
): BoardCoordinate {
  if (step < 0) {
    return BASE_SLOTS[player][tokenId];
  }

  if (step <= TRACK_STEP_LIMIT) {
    const trackIndex = getAbsoluteTrackIndex(player, step)!;
    return TRACK_COORDINATES[trackIndex];
  }

  if (step < MAX_STEP) {
    const homeIndex = step - (TRACK_STEP_LIMIT + 1);
    return HOME_COLUMNS[player][homeIndex];
  }

  return GOAL_COORDINATES[player];
}
