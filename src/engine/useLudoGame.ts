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
  logs: GameLogEntry[];
  winner: Player | null;
  rollDice: () => void;
  executeMove: (tokenId: number) => void;
  restartGame: () => void;
}

export function useLudoGame(): UseLudoGameReturn {
  const engineRef = useRef<LudoGameEngine | null>(null);

  if (!engineRef.current) {
    engineRef.current = new LudoGameEngine({ firstPlayer: 'red' });
  }

  const engine = engineRef.current;
  const [state, setState] = useState<GameState>(() => engine.getState());
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [animatedRollDisplay, setAnimatedRollDisplay] = useState<number | null>(null);
  const [captureBanner, setCaptureBanner] = useState<string | null>(null);

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
        } else if (event.type === 'EXTRA_TURN_AWARDED' && event.extraTurnReason === 'ROLLED_SIX') {
          soundManager.playTempleChime();
        }
      }
    });

    return unsubscribe;
  }, [engine]);

  // Roll dice with smooth tumble animation
  const rollDice = useCallback(() => {
    if (state.phase !== 'NEED_ROLL' || state.winner || isRolling) {
      return;
    }

    setIsRolling(true);
    soundManager.playDiceRoll();

    let ticks = 0;
    const interval = setInterval(() => {
      ticks++;
      setAnimatedRollDisplay(Math.floor(Math.random() * 6) + 1);

      if (ticks >= 7) {
        clearInterval(interval);
        try {
          const finalRoll = engine.roll();
          setAnimatedRollDisplay(finalRoll);
        } catch (err) {
          console.error('Error rolling dice:', err);
        } finally {
          setIsRolling(false);
        }
      }
    }, 55);
  }, [state.phase, state.winner, isRolling, engine]);

  // Execute token move
  const executeMove = useCallback(
    (tokenId: number) => {
      if (state.phase !== 'NEED_MOVE' || state.winner || isRolling) {
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
    [state.phase, state.winner, isRolling, engine]
  );

  const restartGame = useCallback(() => {
    engine.reset({ firstPlayer: 'red' });
    setAnimatedRollDisplay(null);
    setCaptureBanner(null);
    setIsRolling(false);
  }, [engine]);

  const clearCaptureBanner = useCallback(() => {
    setCaptureBanner(null);
  }, []);

  // Map pure engine players into UI Player structures
  const players = useMemo((): Record<PlayerColor, Player> => {
    const redEngine = state.players.red;
    const greenEngine = state.players.green;

    const redPlayer: Player = {
      color: 'red',
      name: redEngine.name,
      isAi: false,
      tokensFinished: redEngine.finishedCount,
      hasFinished: redEngine.hasWon,
      tokens: redEngine.tokens.map((t) => ({
        id: t.id,
        color: 'red',
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

    const greenPlayer: Player = {
      color: 'green',
      name: greenEngine.name,
      isAi: false,
      tokensFinished: greenEngine.finishedCount,
      hasFinished: greenEngine.hasWon,
      tokens: greenEngine.tokens.map((t) => ({
        id: t.id,
        color: 'green',
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

    // Dormant yellow and blue for 2-player mode
    const yellowPlayer: Player = {
      color: 'yellow',
      name: FACTIONS.yellow.shortName,
      isAi: false,
      tokensFinished: 0,
      hasFinished: false,
      tokens: [0, 1, 2, 3].map((id) => ({
        id,
        color: 'yellow',
        status: 'yard',
        stepCount: -1,
        boardPosition: getTokenCoordinate('yellow', id, -1),
      })),
    };

    const bluePlayer: Player = {
      color: 'blue',
      name: FACTIONS.blue.shortName,
      isAi: false,
      tokensFinished: 0,
      hasFinished: false,
      tokens: [0, 1, 2, 3].map((id) => ({
        id,
        color: 'blue',
        status: 'yard',
        stepCount: -1,
        boardPosition: getTokenCoordinate('blue', id, -1),
      })),
    };

    return {
      red: redPlayer,
      green: greenPlayer,
      yellow: yellowPlayer,
      blue: bluePlayer,
    };
  }, [state.players]);

  const currentColor: PlayerColor = state.activePlayer;
  const activeColors: PlayerColor[] = ['red', 'green'];

  // Map engine legal moves to UI MoveOption format
  const availableMoves = useMemo((): MoveOption[] => {
    return state.legalMoves.map((m) => ({
      tokenId: m.tokenId,
      fromStep: m.fromStep,
      toStep: m.toStep,
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
    logs,
    winner,
    rollDice,
    executeMove,
    restartGame,
  };
}
