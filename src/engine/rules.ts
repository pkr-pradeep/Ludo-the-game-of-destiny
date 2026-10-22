import {
  PlayerId,
  PlayerState,
  TokenState,
  Move,
} from './types';
import {
  MAX_STEP,
  TRACK_STEP_LIMIT,
  getAbsoluteTrackIndex,
  isSafeTrackIndex,
} from './boardPaths';

/**
 * Check if the roll allows a token to leave base (must be 6).
 */
export function canExitBase(roll: number): boolean {
  return roll === 6;
}

/**
 * Return the opponent's ID in a two-player game between Red and Green.
 */
export function getOpponentId(player: PlayerId): PlayerId {
  return player === 'red' ? 'green' : 'red';
}

/**
 * Compute the legal move for a specific token given a roll value.
 * Returns null if the token cannot move with this roll.
 */
export function computeLegalMoveForToken(
  token: TokenState,
  roll: number,
  allPlayers: Record<PlayerId, PlayerState>
): Move | null {
  // Case 1: Token in base yard
  if (token.step === -1) {
    if (!canExitBase(roll)) {
      return null;
    }

    const toStep = 0;
    const trackIndex = getAbsoluteTrackIndex(token.player, toStep)!;
    const opponentId = getOpponentId(token.player);
    const opponent = allPlayers[opponentId];

    // Check if opponent token is on the player's start square
    // (Note: start squares 0 and 13 are marked safe, but we evaluate dynamically)
    let isCapture = false;
    let capturedToken: Move['capturedToken'];

    if (!isSafeTrackIndex(trackIndex)) {
      const victim = opponent.tokens.find((t) => {
        const oppTrack = getAbsoluteTrackIndex(opponentId, t.step);
        return oppTrack === trackIndex;
      });

      if (victim) {
        isCapture = true;
        capturedToken = { player: opponentId, tokenId: victim.id };
      }
    }

    return {
      tokenId: token.id,
      player: token.player,
      fromStep: -1,
      toStep,
      isBaseExit: true,
      isCapture,
      capturedToken,
      isGoal: false,
    };
  }

  // Case 2: Token already at goal (finished) - cannot move anymore
  if (token.step === MAX_STEP) {
    return null;
  }

  // Case 3: Token on track or in home stretch
  const nextStep = token.step + roll;

  // Exact roll required to enter the goal (step 56)
  if (nextStep > MAX_STEP) {
    return null;
  }

  const isGoal = nextStep === MAX_STEP;
  let isCapture = false;
  let capturedToken: Move['capturedToken'];

  // Check for captures if landing on the outer 52-cell track
  if (nextStep <= TRACK_STEP_LIMIT) {
    const targetTrackIndex = getAbsoluteTrackIndex(token.player, nextStep)!;

    if (!isSafeTrackIndex(targetTrackIndex)) {
      const opponentId = getOpponentId(token.player);
      const opponent = allPlayers[opponentId];

      const victim = opponent.tokens.find((t) => {
        const oppTrack = getAbsoluteTrackIndex(opponentId, t.step);
        return oppTrack === targetTrackIndex;
      });

      if (victim) {
        isCapture = true;
        capturedToken = { player: opponentId, tokenId: victim.id };
      }
    }
  }

  return {
    tokenId: token.id,
    player: token.player,
    fromStep: token.step,
    toStep: nextStep,
    isBaseExit: false,
    isCapture,
    capturedToken,
    isGoal,
  };
}

/**
 * Compute all legal moves available for a player given the current dice roll.
 */
export function computeLegalMoves(
  player: PlayerState,
  roll: number,
  allPlayers: Record<PlayerId, PlayerState>
): Move[] {
  const moves: Move[] = [];

  for (const token of player.tokens) {
    const move = computeLegalMoveForToken(token, roll, allPlayers);
    if (move) {
      moves.push(move);
    }
  }

  return moves;
}

/**
 * Check if player has brought all 4 tokens to the goal (step 56).
 */
export function isPlayerVictor(player: PlayerState): boolean {
  return player.tokens.length === 4 && player.tokens.every((t) => t.step === MAX_STEP);
}
