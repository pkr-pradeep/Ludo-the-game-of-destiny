import {
  PlayerId,
  PlayerState,
  TokenState,
  Move,
  GameState,
  GameEvent,
  GameEventType,
  GameEngineOptions,
  ExtraTurnReason,
} from './types';
import {
  getTokenCoordinate,
  getTokenLocation,
  isTokenSafe,
  MAX_STEP,
} from './boardPaths';
import {
  computeLegalMoves,
  getOpponentId,
  getNextPlayerId,
  isPlayerVictor,
} from './rules';
import { IDiceRoller, StandardDiceRoller, isValidRoll } from './dice';

export type StateChangeListener = (state: GameState, event?: GameEvent) => void;

export class LudoGameEngine {
  private state: GameState;
  private diceRoller: IDiceRoller;
  private maxConsecutiveSixes: number;
  private listeners: Set<StateChangeListener> = new Set();
  private eventCounter: number = 0;
  private activePlayerOrder: PlayerId[] = ['red', 'green'];

  constructor(options?: GameEngineOptions) {
    this.diceRoller = options?.diceRoller
      ? { roll: options.diceRoller }
      : new StandardDiceRoller();
    this.maxConsecutiveSixes = options?.maxConsecutiveSixes ?? 3;
    if (options?.activePlayers && options.activePlayers.length >= 2) {
      this.activePlayerOrder = options.activePlayers;
    } else if (options?.playerCount === 3) {
      this.activePlayerOrder = ['red', 'green', 'yellow'];
    } else if (options?.playerCount === 4) {
      this.activePlayerOrder = ['red', 'green', 'yellow', 'blue'];
    } else {
      this.activePlayerOrder = ['red', 'green'];
    }
    this.state = this.createInitialState(options?.firstPlayer ?? 'red');
  }

  private createInitialTokens(player: PlayerId): TokenState[] {
    return [0, 1, 2, 3].map((id) => ({
      id,
      player,
      step: -1,
      location: 'base',
      isSafe: true,
      coordinate: getTokenCoordinate(player, id, -1),
    }));
  }

  private createInitialState(firstPlayer: PlayerId): GameState {
    const factionNames: Record<PlayerId, string> = {
      red: 'Kalinga Sena',
      green: 'Utkala Vana',
      yellow: 'Surya Rath',
      blue: 'Nilachala Sena',
    };

    const players = {} as Record<PlayerId, PlayerState>;
    for (const pid of this.activePlayerOrder) {
      players[pid] = {
        id: pid,
        name: factionNames[pid],
        tokens: this.createInitialTokens(pid),
        finishedCount: 0,
        hasWon: false,
      };
    }

    const startPlayer = this.activePlayerOrder.includes(firstPlayer)
      ? firstPlayer
      : this.activePlayerOrder[0];

    return {
      players,
      activePlayer: startPlayer,
      currentRoll: null,
      phase: 'NEED_ROLL',
      legalMoves: [],
      winner: null,
      consecutiveSixes: 0,
      lastCaptureMessage: null,
      turnCount: 1,
      history: [],
    };
  }

  public getState(): GameState {
    return JSON.parse(JSON.stringify(this.state));
  }

  public subscribe(listener: StateChangeListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emitEvent(
    type: GameEventType,
    message: string,
    extra?: Partial<GameEvent>
  ) {
    this.eventCounter++;
    const event: GameEvent = {
      id: `evt-${Date.now()}-${this.eventCounter}`,
      timestamp: Date.now(),
      type,
      player: this.state.activePlayer,
      message,
      ...extra,
    };

    this.state.history.unshift(event);
    if (this.state.history.length > 50) {
      this.state.history.pop();
    }

    const stateSnapshot = this.getState();
    this.listeners.forEach((listener) => {
      try {
        listener(stateSnapshot, event);
      } catch (err) {
        console.error('Error in engine listener:', err);
      }
    });
  }

  /**
   * Roll the dice for the active player.
   * Optionally takes a forced value for deterministic testing.
   */
  public roll(forcedValue?: number): number {
    if (this.state.phase === 'GAME_OVER') {
      throw new Error('Cannot roll dice: Game has already ended.');
    }

    if (this.state.phase !== 'NEED_ROLL') {
      throw new Error(`Cannot roll dice: Player must move a token first (phase: ${this.state.phase}).`);
    }

    const rollValue = forcedValue !== undefined ? forcedValue : this.diceRoller.roll();

    if (!isValidRoll(rollValue)) {
      throw new Error(`Invalid roll value: ${rollValue}. Must be an integer from 1 to 6.`);
    }

    this.state.currentRoll = rollValue;
    const player = this.state.players[this.state.activePlayer];

    // Check consecutive sixes
    if (rollValue === 6) {
      this.state.consecutiveSixes++;
      if (this.state.consecutiveSixes >= this.maxConsecutiveSixes) {
        // Penalty for 3 consecutive sixes: turn lost
        const prevPlayer = this.state.activePlayer;
        this.emitEvent(
          'NO_LEGAL_MOVES',
          `${player.name} rolled three consecutive 6s! Destiny intervenes; turn lost.`,
          { roll: rollValue }
        );

        this.state.consecutiveSixes = 0;
        this.state.currentRoll = null;
        this.state.legalMoves = [];
        this.state.activePlayer = getNextPlayerId(prevPlayer, this.activePlayerOrder);
        this.state.phase = 'NEED_ROLL';
        this.state.turnCount++;

        this.emitEvent(
          'TURN_CHANGED',
          `Turn passed to ${this.state.players[this.state.activePlayer].name}.`
        );
        return rollValue;
      }
    } else {
      this.state.consecutiveSixes = 0;
    }

    // Compute legal moves
    const legalMoves = computeLegalMoves(player, rollValue, this.state.players);
    this.state.legalMoves = legalMoves;

    if (legalMoves.length === 0) {
      // No legal moves possible with this roll
      this.state.phase = 'NEED_ROLL';
      this.emitEvent(
        'DICE_ROLLED',
        `${player.name} rolled a ${rollValue}.`,
        { roll: rollValue }
      );

      const prevPlayer = this.state.activePlayer;
      this.emitEvent(
        'NO_LEGAL_MOVES',
        `${player.name} rolled a ${rollValue}, but has no legal moves. Turn passes.`,
        { roll: rollValue }
      );

      this.state.currentRoll = null;
      this.state.legalMoves = [];
      this.state.activePlayer = getNextPlayerId(prevPlayer, this.activePlayerOrder);
      this.state.phase = 'NEED_ROLL';
      this.state.turnCount++;

      this.emitEvent(
        'TURN_CHANGED',
        `Turn passed to ${this.state.players[this.state.activePlayer].name}.`
      );
    } else {
      this.state.phase = 'NEED_MOVE';
      this.emitEvent(
        'DICE_ROLLED',
        `${player.name} rolled a ${rollValue}.`,
        { roll: rollValue }
      );
    }

    return rollValue;
  }

  /**
   * Execute a move for a specific token of the active player.
   */
  public moveToken(tokenId: number): Move {
    if (this.state.phase === 'GAME_OVER') {
      throw new Error('Cannot move token: Game has already ended.');
    }

    if (this.state.phase !== 'NEED_MOVE') {
      throw new Error(`Cannot move token: Dice must be rolled first (phase: ${this.state.phase}).`);
    }

    const move = this.state.legalMoves.find((m) => m.tokenId === tokenId);
    if (!move) {
      throw new Error(`Invalid move: Token ${tokenId} cannot move with current roll ${this.state.currentRoll}.`);
    }

    const player = this.state.players[this.state.activePlayer];
    const token = player.tokens.find((t) => t.id === tokenId)!;

    // Apply move to token
    token.step = move.toStep;
    token.location = getTokenLocation(move.toStep);
    token.coordinate = getTokenCoordinate(this.state.activePlayer, tokenId, move.toStep);
    token.isSafe = isTokenSafe(this.state.activePlayer, move.toStep);

    // Apply capture if applicable
    if (move.isCapture && move.capturedToken) {
      const oppId = move.capturedToken.player;
      const oppTokenId = move.capturedToken.tokenId;
      const opponent = this.state.players[oppId];
      const victimToken = opponent.tokens.find((t) => t.id === oppTokenId)!;

      victimToken.step = -1;
      victimToken.location = 'base';
      victimToken.coordinate = getTokenCoordinate(oppId, oppTokenId, -1);
      victimToken.isSafe = true;

      const captureMsg = `${player.name} captured ${opponent.name}'s Token ${oppTokenId + 1}!`;
      this.state.lastCaptureMessage = captureMsg;

      this.emitEvent('TOKEN_CAPTURED', captureMsg, {
        move,
      });
    }

    // Apply goal if applicable
    if (move.isGoal) {
      player.finishedCount = player.tokens.filter((t) => t.step === MAX_STEP).length;
      this.emitEvent(
        'TOKEN_FINISHED',
        `${player.name}'s Token ${tokenId + 1} reached the sacred Garbhagriha! (${player.finishedCount}/4)`,
        { move }
      );

      // Check victory condition
      if (isPlayerVictor(player)) {
        player.hasWon = true;
        this.state.winner = player.id;
        this.state.phase = 'GAME_OVER';
        this.state.legalMoves = [];
        this.state.currentRoll = null;

        this.emitEvent(
          'GAME_WON',
          `👑 ${player.name} has brought all four sacred seals home and won the Game of Destiny!`,
          { winner: player.id }
        );
        return move;
      }
    }

    this.emitEvent(
      'TOKEN_MOVED',
      `${player.name} moved Token ${tokenId + 1} to step ${move.toStep}.`,
      { move }
    );

    // Evaluate Extra Turn logic:
    // 1. Rolled a 6
    // 2. Captured an opponent token
    // 3. Reached the goal
    let extraTurnReason: ExtraTurnReason | null = null;
    if (this.state.currentRoll === 6) {
      extraTurnReason = 'ROLLED_SIX';
    } else if (move.isCapture) {
      extraTurnReason = 'CAPTURE';
    } else if (move.isGoal) {
      extraTurnReason = 'FINISHED';
    }

    if (extraTurnReason) {
      this.state.currentRoll = null;
      this.state.legalMoves = [];
      this.state.phase = 'NEED_ROLL';

      const reasonDesc =
        extraTurnReason === 'ROLLED_SIX'
          ? 'rolling a royal 6'
          : extraTurnReason === 'CAPTURE'
          ? 'capturing an opponent'
          : 'reaching the Garbhagriha';

      this.emitEvent(
        'EXTRA_TURN_AWARDED',
        `${player.name} is blessed with an extra turn for ${reasonDesc}!`,
        { extraTurnReason }
      );
    } else {
      // Normal turn handover
      this.state.consecutiveSixes = 0;
      this.state.currentRoll = null;
      this.state.legalMoves = [];
      const prevPlayer = this.state.activePlayer;
      this.state.activePlayer = getNextPlayerId(prevPlayer, this.activePlayerOrder);
      this.state.phase = 'NEED_ROLL';
      this.state.turnCount++;

      this.emitEvent(
        'TURN_CHANGED',
        `Turn passed to ${this.state.players[this.state.activePlayer].name}.`
      );
    }

    return move;
  }

  /**
   * Reset match with fresh state.
   */
  public reset(options?: GameEngineOptions) {
    if (options?.diceRoller) {
      this.diceRoller = { roll: options.diceRoller };
    }
    if (options?.maxConsecutiveSixes !== undefined) {
      this.maxConsecutiveSixes = options.maxConsecutiveSixes;
    }
    if (options?.activePlayers && options.activePlayers.length >= 2) {
      this.activePlayerOrder = options.activePlayers;
    } else if (options?.playerCount === 3) {
      this.activePlayerOrder = ['red', 'green', 'yellow'];
    } else if (options?.playerCount === 4) {
      this.activePlayerOrder = ['red', 'green', 'yellow', 'blue'];
    }
    this.state = this.createInitialState(options?.firstPlayer ?? 'red');
    this.emitEvent('TURN_CHANGED', 'A new Game of Destiny has begun.');
  }

  /**
   * Helper for deterministic testing: sets specific positions for tokens.
   */
  public _setTokenStep(player: PlayerId, tokenId: number, step: number) {
    const p = this.state.players[player];
    const token = p.tokens.find((t) => t.id === tokenId);
    if (!token) throw new Error(`Token ${tokenId} not found`);

    token.step = step;
    token.location = getTokenLocation(step);
    token.coordinate = getTokenCoordinate(player, tokenId, step);
    token.isSafe = isTokenSafe(player, step);
    p.finishedCount = p.tokens.filter((t) => t.step === MAX_STEP).length;
  }

  public _setActivePlayer(player: PlayerId) {
    this.state.activePlayer = player;
  }

  public _setPhase(phase: GameState['phase']) {
    this.state.phase = phase;
  }

  public _setDiceRoller(roller: IDiceRoller) {
    this.diceRoller = roller;
  }
}
