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
 * Return the next player's ID in active turn order.
 */
export function getNextPlayerId(
  player: PlayerId,
  activeOrder: PlayerId[] = ['red', 'green']
): PlayerId {
  const idx = activeOrder.indexOf(player);
  if (idx === -1) return activeOrder[0];
  return activeOrder[(idx + 1) % activeOrder.length];
}

/**
 * Return the opponent's ID in a two-player game (or next player in multi-player).
 */
export function getOpponentId(
  player: PlayerId,
  activeOrder?: PlayerId[]
): PlayerId {
  if (activeOrder && activeOrder.length > 0) {
    return getNextPlayerId(player, activeOrder);
  }
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

    // Check if opponent token is on the player's start square
    let isCapture = false;
    let capturedToken: Move['capturedToken'];

    if (!isSafeTrackIndex(trackIndex)) {
      for (const [oppId, opponent] of Object.entries(allPlayers)) {
        if (oppId === token.player || !opponent) continue;
        const victim = opponent.tokens.find((t) => {
          const oppTrack = getAbsoluteTrackIndex(oppId as PlayerId, t.step);
          return oppTrack === trackIndex;
        });

        if (victim) {
          isCapture = true;
          capturedToken = { player: oppId as PlayerId, tokenId: victim.id };
          break;
        }
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
      for (const [oppId, opponent] of Object.entries(allPlayers)) {
        if (oppId === token.player || !opponent) continue;
        const victim = opponent.tokens.find((t) => {
          const oppTrack = getAbsoluteTrackIndex(oppId as PlayerId, t.step);
          return oppTrack === targetTrackIndex;
        });

        if (victim) {
          isCapture = true;
          capturedToken = { player: oppId as PlayerId, tokenId: victim.id };
          break;
        }
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

/**
 * Swift Advance Rule (Time Saver):
 * If only one token is enabled on board (step >= 0 and step < MAX_STEP),
 * then it will move forward automatically based on the number generated through
 * rolling dice until a second token comes to play.
 *
 * - When a 6 is rolled and tokens remain in yard (step === -1), a second token CAN
 *   come to play or the existing token can advance. In that case, returns null to
 *   give the player the strategic choice.
 * - When 0 tokens are on board and 6 is rolled, the only legal move is base exit,
 *   so deploying the first token automatically saves time.
 * - When 2 or more tokens are enabled on board, returns null (player must choose).
 */
export function getAutoAdvanceTokenId(
  player: PlayerState,
  roll: number,
  legalMoves: Move[]
): number | null {
  if (!legalMoves || legalMoves.length === 0) {
    return null;
  }

  const activeTokensOnBoard = player.tokens.filter(
    (t) => t.step >= 0 && t.step < MAX_STEP
  );

  // Case 1: Exactly one token is enabled on board
  if (activeTokensOnBoard.length === 1) {
    const singleToken = activeTokensOnBoard[0];
    const canSingleTokenMove = legalMoves.some((m) => m.tokenId === singleToken.id);

    // If 6 is rolled and yard has tokens, second token CAN come to play
    const canBringSecondToken =
      roll === 6 &&
      player.tokens.some((t) => t.step === -1) &&
      legalMoves.some((m) => m.isBaseExit);

    // Give player choice when a second token can be brought to play
    if (canBringSecondToken) {
      return null;
    }

    if (canSingleTokenMove) {
      return singleToken.id;
    }

    return null;
  }

  // Case 2: Zero tokens on board and rolled a 6 -> deploy the first token
  if (activeTokensOnBoard.length === 0 && roll === 6) {
    const baseExitMove = legalMoves.find((m) => m.isBaseExit);
    if (baseExitMove) {
      return baseExitMove.tokenId;
    }
  }

  // 2 or more tokens enabled on board -> manual selection
  return null;
}
