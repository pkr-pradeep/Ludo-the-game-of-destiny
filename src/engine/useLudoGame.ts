import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { LudoGameEngine } from './LudoGameEngine';
import { GameState, Move, PlayerId } from './types';
import { getAutoAdvanceTokenId } from './rules';
import { Player, PlayerColor, MoveOption, GameLogEntry } from '../types/game';
import { FACTIONS, getTokenCoordinate } from '../constants/boardData';
import { soundManager } from '../utils/sound';

export interface UseLudoGameReturn {
  engine: LudoGameEngine;
  state: GameState;
  players: Record<PlayerColor, Player>;
  currentColor: PlayerColor;
  activeColors: PlayerColor[];
  diceValue: number | null;
  isRolling: boolean;
  hasRolled: boolean;
  isAutoMoving: boolean;
  availableMoves: MoveOption[];
  captureBanner: string | null;
  clearCaptureBanner: () => void;
  extraTurnToast: string | null;
  clearExtraTurnToast: () => void;
  playerColor: PlayerColor;
  logs: GameLogEntry[];
  winner: Player | null;
  rollDice: () => void;
  executeMove: (tokenId: number) => void;
  advanceActiveToken: () => void;
  restartGame: () => void;
}

export interface UseLudoGameOptions {
  playerCount?: number;
  playerColor?: PlayerColor;
  activePlayers?: PlayerColor[];
}

export function useLudoGame(options?: UseLudoGameOptions): UseLudoGameReturn {
  const pCount = options?.playerCount ?? 2;
  const userColor: PlayerColor = options?.playerColor ?? 'red';

  // Compute active factions in game
  const activeColors: PlayerColor[] = useMemo(() => {
    if (options?.activePlayers && options.activePlayers.length >= 2) {
      return options.activePlayers;
    }
    if (pCount === 4) return ['red', 'green', 'yellow', 'blue'];
    if (pCount === 3) {
      const all: PlayerColor[] = ['red', 'green', 'yellow', 'blue'];
      const rivals = all.filter((c) => c !== userColor);
      return [userColor, rivals[0], rivals[1]];
    }
    // 2 players: userColor and opposite/rival
    const rivalMap: Record<PlayerColor, PlayerColor> = {
      red: 'green',
      green: 'red',
      yellow: 'blue',
      blue: 'yellow',
    };
    return [userColor, rivalMap[userColor]];
  }, [options?.activePlayers, pCount, userColor]);

  const engineRef = useRef<LudoGameEngine | null>(null);

  if (!engineRef.current) {
    engineRef.current = new LudoGameEngine({
      playerCount: pCount,
      activePlayers: activeColors,
      firstPlayer: userColor,
    });
  }

  const engine = engineRef.current;
  const [state, setState] = useState<GameState>(() => engine.getState());
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const isRollingRef = useRef<boolean>(false);
  const rollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [animatedRollDisplay, setAnimatedRollDisplay] = useState<number | null>(null);
  const [captureBanner, setCaptureBanner] = useState<string | null>(null);
  const [extraTurnToast, setExtraTurnToast] = useState<string | null>(null);
  const [isAutoMoving, setIsAutoMoving] = useState<boolean>(false);
  const autoMoveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const executeMoveRef = useRef<(tokenId: number) => void>(() => {});

  const cancelAutoMove = useCallback(() => {
    if (autoMoveTimeoutRef.current) {
      clearTimeout(autoMoveTimeoutRef.current);
      autoMoveTimeoutRef.current = null;
    }
    setIsAutoMoving(false);
  }, []);

  // Subscribe to engine events for audio, state syncing, and capture messages
  useEffect(() => {
    const unsubscribe = engine.subscribe((newState, event) => {
      setState(newState);

      if (event) {
        if (event.type === 'TOKEN_CAPTURED') {
          soundManager.playCapture();
          setCaptureBanner(event.message);
        } else if (event.type === 'TOKEN_FINISHED') {
          soundManager.playTempleChime();
        } else if (event.type === 'GAME_WON') {
          soundManager.playVictoryFanfare();
        } else if (event.type === 'TOKEN_MOVED') {
          soundManager.playTokenStep();
        } else if (event.type === 'EXTRA_TURN_AWARDED') {
          soundManager.playTempleChime();
          if (event.extraTurnReason === 'ROLLED_SIX') {
            setExtraTurnToast('✨ Royal 6! Token entered the path. Roll again for your extra turn!');
          }
        }
      }
    });

    return () => {
      unsubscribe();
      if (rollIntervalRef.current) {
        clearInterval(rollIntervalRef.current);
        rollIntervalRef.current = null;
      }
      cancelAutoMove();
    };
  }, [engine, cancelAutoMove]);

  // Roll dice with smooth tumble animation
  const rollDice = useCallback(() => {
    cancelAutoMove();
    const currentEngineState = engine.getState();
    // Guard using both synchronous ref and engine's current state to eliminate race conditions
    if (
      isRollingRef.current ||
      currentEngineState.phase !== 'NEED_ROLL' ||
      currentEngineState.winner
    ) {
      return;
    }

    // Clear any previous interval if still running
    if (rollIntervalRef.current) {
      clearInterval(rollIntervalRef.current);
      rollIntervalRef.current = null;
    }

    isRollingRef.current = true;
    setIsRolling(true);
    soundManager.playDiceRoll();

    let ticks = 0;
    rollIntervalRef.current = setInterval(() => {
      ticks++;
      setAnimatedRollDisplay(Math.floor(Math.random() * 6) + 1);

      if (ticks >= 7) {
        if (rollIntervalRef.current) {
          clearInterval(rollIntervalRef.current);
          rollIntervalRef.current = null;
        }

        try {
          // Double-check engine phase before rolling
          if (engine.getState().phase === 'NEED_ROLL') {
            const finalRoll = engine.roll();
            setAnimatedRollDisplay(finalRoll);

            // Rule: if only one token is enabled on board, it will move forward
            // automatically based on the dice roll until a second token comes to play (to save time)
            const postRollState = engine.getState();
            if (postRollState.phase === 'NEED_MOVE' && postRollState.currentRoll !== null) {
              const activePl = postRollState.players[postRollState.activePlayer];
              const autoTokenId = getAutoAdvanceTokenId(
                activePl,
                postRollState.currentRoll,
                postRollState.legalMoves
              );

              if (autoTokenId !== null) {
                setIsAutoMoving(true);
                autoMoveTimeoutRef.current = setTimeout(() => {
                  autoMoveTimeoutRef.current = null;
                  setIsAutoMoving(false);
                  executeMoveRef.current(autoTokenId);
                }, 520);
              }
            }
          }
        } catch (err) {
          console.error('Error rolling dice:', err);
        } finally {
          isRollingRef.current = false;
          setIsRolling(false);
        }
      }
    }, 55);
  }, [engine, cancelAutoMove]);

  // Execute token move
  const executeMove = useCallback(
    (tokenId: number) => {
      cancelAutoMove();
      const currentEngineState = engine.getState();
      if (
        currentEngineState.phase !== 'NEED_MOVE' ||
        currentEngineState.winner ||
        isRollingRef.current
      ) {
        return;
      }

      try {
        engine.moveToken(tokenId);
        // Clear tumble display after move executes
        setAnimatedRollDisplay(null);
      } catch (err) {
        console.error('Error executing move:', err);
      }
    },
    [engine, cancelAutoMove]
  );

  useEffect(() => {
    executeMoveRef.current = executeMove;
  }, [executeMove]);

  const restartGame = useCallback(() => {
    cancelAutoMove();
    if (rollIntervalRef.current) {
      clearInterval(rollIntervalRef.current);
      rollIntervalRef.current = null;
    }
    isRollingRef.current = false;
    engine.reset({
      playerCount: pCount,
      activePlayers: activeColors,
      firstPlayer: userColor,
    });
    setAnimatedRollDisplay(null);
    setCaptureBanner(null);
    setIsRolling(false);
  }, [engine, pCount, activeColors, userColor, cancelAutoMove]);

  const clearCaptureBanner = useCallback(() => {
    setCaptureBanner(null);
  }, []);

  const clearExtraTurnToast = useCallback(() => {
    setExtraTurnToast(null);
  }, []);

  // Advance active movable token with single tap on action button
  const advanceActiveToken = useCallback(() => {
    cancelAutoMove();
    const currentEngineState = engine.getState();
    if (
      currentEngineState.phase !== 'NEED_MOVE' ||
      currentEngineState.winner ||
      isRollingRef.current ||
      currentEngineState.legalMoves.length === 0
    ) {
      return;
    }

    // Smart selection: if a token is already out on the track, prioritize advancing it forward.
    // Otherwise, choose base exit.
    const activePlayerState = currentEngineState.players[currentEngineState.activePlayer];
    const trackMove = currentEngineState.legalMoves.find((m) => {
      const tok = activePlayerState.tokens.find((t) => t.id === m.tokenId);
      return tok && tok.step >= 0;
    });

    const chosenMove = trackMove || currentEngineState.legalMoves[0];
    if (chosenMove) {
      executeMove(chosenMove.tokenId);
    }
  }, [engine, executeMove, cancelAutoMove]);

  // Map pure engine players into UI Player structures
  const players = useMemo((): Record<PlayerColor, Player> => {
    const mapPlayer = (color: PlayerColor): Player => {
      const eng = state.players[color];
      if (eng) {
        return {
          color,
          name: eng.name,
          isAi: false,
          tokensFinished: eng.finishedCount,
          hasFinished: eng.hasWon,
          tokens: eng.tokens.map((t) => ({
            id: t.id,
            color,
            status:
              t.location === 'base'
                ? 'yard'
                : t.location === 'home'
                ? 'home_column'
                : t.location === 'goal'
                ? 'finished'
                : 'track',
            stepCount: t.step,
            boardPosition: t.coordinate,
          })),
        };
      }

      return {
        color,
        name: FACTIONS[color].shortName,
        isAi: false,
        tokensFinished: 0,
        hasFinished: false,
        tokens: [0, 1, 2, 3].map((id) => ({
          id,
          color,
          status: 'yard',
          stepCount: -1,
          boardPosition: getTokenCoordinate(color, id, -1),
        })),
      };
    };

    return {
      red: mapPlayer('red'),
      green: mapPlayer('green'),
      yellow: mapPlayer('yellow'),
      blue: mapPlayer('blue'),
    };
  }, [state.players]);

  const currentColor: PlayerColor = state.activePlayer;

  // Map engine legal moves to UI MoveOption format
  const availableMoves = useMemo((): MoveOption[] => {
    return state.legalMoves.map((m) => ({
      tokenId: m.tokenId,
      fromStep: m.fromStep,
      toStep: m.toStep,
      isBaseExit: m.isBaseExit,
      willCapture: m.isCapture,
      capturedColor: m.capturedToken?.player,
      capturedTokenId: m.capturedToken?.tokenId,
      willFinish: m.isGoal,
    }));
  }, [state.legalMoves]);

  // Convert engine history into UI GameLogEntry format
  const logs = useMemo((): GameLogEntry[] => {
    return state.history.map((h) => ({
      id: h.id,
      timestamp: new Date(h.timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      text: h.message,
      color: h.player,
      type:
        h.type === 'TOKEN_CAPTURED'
          ? 'capture'
          : h.type === 'TOKEN_FINISHED' || h.type === 'GAME_WON'
          ? 'finish'
          : h.type === 'DICE_ROLLED'
          ? 'roll'
          : h.type === 'TURN_CHANGED'
          ? 'turn'
          : 'info',
    }));
  }, [state.history]);

  const winner: Player | null = state.winner ? players[state.winner] : null;

  return {
    engine,
    state,
    players,
    currentColor,
    playerColor: userColor,
    activeColors,
    diceValue: isRolling ? animatedRollDisplay : state.currentRoll ?? animatedRollDisplay,
    isRolling,
    hasRolled: state.phase === 'NEED_MOVE',
    isAutoMoving,
    availableMoves,
    captureBanner,
    clearCaptureBanner,
    extraTurnToast,
    clearExtraTurnToast,
    logs,
    winner,
    rollDice,
    executeMove,
    advanceActiveToken,
    restartGame,
  };
}
