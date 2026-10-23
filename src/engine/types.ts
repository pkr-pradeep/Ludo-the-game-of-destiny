/**
 * Reusable, framework-agnostic TypeScript types for Ludo: The Game of Destiny.
 */

export type PlayerId = 'red' | 'green' | 'yellow' | 'blue';

export type TokenLocation = 'base' | 'track' | 'home' | 'goal';

export interface BoardCoordinate {
  row: number; // 0-14
  col: number; // 0-14
}

export interface TokenState {
  id: number; // 0, 1, 2, 3
  player: PlayerId;
  step: number; // -1 for base; 0..50 for outer track; 51..55 for home column; 56 for goal
  location: TokenLocation;
  isSafe: boolean;
  coordinate: BoardCoordinate;
}

export interface PlayerState {
  id: PlayerId;
  name: string;
  tokens: TokenState[];
  finishedCount: number;
  hasWon: boolean;
}

export interface Move {
  tokenId: number;
  player: PlayerId;
  fromStep: number;
  toStep: number;
  isBaseExit: boolean;
  isCapture: boolean;
  capturedToken?: {
    player: PlayerId;
    tokenId: number;
  };
  isGoal: boolean;
}

export type TurnPhase = 'NEED_ROLL' | 'NEED_MOVE' | 'GAME_OVER';

export type ExtraTurnReason = 'ROLLED_SIX' | 'CAPTURE' | 'FINISHED';

export type GameEventType =
  | 'DICE_ROLLED'
  | 'TOKEN_MOVED'
  | 'TOKEN_CAPTURED'
  | 'TOKEN_FINISHED'
  | 'EXTRA_TURN_AWARDED'
  | 'NO_LEGAL_MOVES'
  | 'TURN_CHANGED'
  | 'GAME_WON';

export interface GameEvent {
  id: string;
  timestamp: number;
  type: GameEventType;
  player: PlayerId;
  message: string;
  roll?: number;
  move?: Move;
  extraTurnReason?: ExtraTurnReason;
  winner?: PlayerId;
}

export interface GameState {
  players: Record<PlayerId, PlayerState>;
  activePlayer: PlayerId;
  currentRoll: number | null;
  phase: TurnPhase;
  legalMoves: Move[];
  winner: PlayerId | null;
  consecutiveSixes: number;
  lastCaptureMessage: string | null;
  turnCount: number;
  history: GameEvent[];
}

export interface GameEngineOptions {
  /** Initial starting player, defaults to 'red' */
  firstPlayer?: PlayerId;
  /** Max consecutive sixes allowed before losing turn (default: 3) */
  maxConsecutiveSixes?: number;
  /** Custom dice roll provider (useful for deterministic tests) */
  diceRoller?: () => number;
  /** Number of active players (2, 3, or 4). Defaults to 2. */
  playerCount?: number;
  /** Explicit list of active players in turn order */
  activePlayers?: PlayerId[];
}
