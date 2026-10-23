import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { LudoGameEngine } from './LudoGameEngine';
import { GameState, Move, PlayerId } from './types';
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
  availableMoves: MoveOption[];
  captureBanner: string | null;
  clearCaptureBanner: () => void;
  extraTurnToast: string | null;
  clearExtraTurnToast: () => void;
  logs: GameLogEntry[];
  winner: Player | null;
  rollDice: () => void;
  executeMove: (tokenId: number) => void;
  advanceActiveToken: () => void;
  restartGame: () => void;
}

export interface UseLudoGameOptions {
  playerCount?: number;
}

export function useLudoGame(options?: UseLudoGameOptions): UseLudoGameReturn {
  const pCount = options?.playerCount ?? 2;
  const engineRef = useRef<LudoGameEngine | null>(null);

  if (!engineRef.current) {
    engineRef.current = new LudoGameEngine({ playerCount: pCount, firstPlayer: 'red' });
  }

  const engine = engineRef.current;
  const [state, setState] = useState<GameState>(() => engine.getState());
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const isRollingRef = useRef<boolean>(false);
  const rollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [animatedRollDisplay, setAnimatedRollDisplay] = useState<number | null>(null);
  const [captureBanner, setCaptureBanner] = useState<string | null>(null);
  const [extraTurnToast, setExtraTurnToast] = useState<string | null>(null);

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
    };
  }, [engine]);

  // Roll dice with smooth tumble animation
  const rollDice = useCallback(() => {
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
          }
        } catch (err) {
          console.error('Error rolling dice:', err);
        } finally {
          isRollingRef.current = false;
          setIsRolling(false);
        }
      }
    }, 55);
  }, [engine]);

  // Execute token move
  const executeMove = useCallback(
    (tokenId: number) => {
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
    [engine]
  );

  const restartGame = useCallback(() => {
    if (rollIntervalRef.current) {
      clearInterval(rollIntervalRef.current);
      rollIntervalRef.current = null;
    }
    isRollingRef.current = false;
    engine.reset({ playerCount: pCount, firstPlayer: 'red' });
    setAnimatedRollDisplay(null);
    setCaptureBanner(null);
    setIsRolling(false);
  }, [engine, pCount]);

  const clearCaptureBanner = useCallback(() => {
    setCaptureBanner(null);
  }, []);

  const clearExtraTurnToast = useCallback(() => {
    setExtraTurnToast(null);
  }, []);

  // Advance active movable token with single tap on action button
  const advanceActiveToken = useCallback(() => {
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
  }, [engine, executeMove]);

  // Compute active factions in game
  const activeColors: PlayerColor[] = useMemo(() => {
    if (pCount === 3) return ['red', 'green', 'yellow'];
    if (pCount === 4) return ['red', 'green', 'yellow', 'blue'];
    return ['red', 'green'];
  }, [pCount]);

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
    activeColors,
    diceValue: isRolling ? animatedRollDisplay : state.currentRoll ?? animatedRollDisplay,
    isRolling,
    hasRolled: state.phase === 'NEED_MOVE',
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
