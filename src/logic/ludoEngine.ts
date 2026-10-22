import { useState, useCallback, useRef } from 'react';
import {
  PlayerColor,
  Token,
  Player,
  MoveOption,
  GameLogEntry,
} from '../types/game';
import {
  FACTIONS,
  COLOR_ORDER,
  START_TRACK_INDICES,
  SAFE_TRACK_INDICES,
  getTokenCoordinate,
} from '../constants/boardData';
import { soundManager } from '../utils/sound';

export interface UseLudoEngineProps {
  playerCount: 2 | 3 | 4;
  onGameEnd?: (winner: Player) => void;
}

export function useLudoEngine({ playerCount = 2 }: UseLudoEngineProps) {
  // Determine active colors based on player count
  // 2 players: Red & Yellow (Opposite sides, standard traditional duel)
  // 3 players: Red, Green, Yellow
  // 4 players: Red, Green, Yellow, Blue
  const activeColors: PlayerColor[] =
    playerCount === 2
      ? ['red', 'yellow']
      : playerCount === 3
      ? ['red', 'green', 'yellow']
      : ['red', 'green', 'yellow', 'blue'];

  // Initialize players
  const initialPlayers: Record<PlayerColor, Player> = {
    red: {
      color: 'red',
      name: FACTIONS.red.shortName,
      isAi: false,
      tokensFinished: 0,
      hasFinished: false,
      tokens: [0, 1, 2, 3].map((id) => ({
        id,
        color: 'red',
        status: 'yard',
        stepCount: -1,
        boardPosition: getTokenCoordinate('red', id, -1),
      })),
    },
    green: {
      color: 'green',
      name: FACTIONS.green.shortName,
      isAi: false,
      tokensFinished: 0,
      hasFinished: false,
      tokens: [0, 1, 2, 3].map((id) => ({
        id,
        color: 'green',
        status: 'yard',
        stepCount: -1,
        boardPosition: getTokenCoordinate('green', id, -1),
      })),
    },
    yellow: {
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
    },
    blue: {
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
    },
  };

  const [players, setPlayers] = useState<Record<PlayerColor, Player>>(initialPlayers);
  const [currentTurnIndex, setCurrentTurnIndex] = useState<number>(0);
  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [consecutiveSixes, setConsecutiveSixes] = useState<number>(0);
  const [availableMoves, setAvailableMoves] = useState<MoveOption[]>([]);
  const [logs, setLogs] = useState<GameLogEntry[]>([]);
  const [winner, setWinner] = useState<Player | null>(null);
  const [hasRolled, setHasRolled] = useState<boolean>(false);

  const currentColor = activeColors[currentTurnIndex];
  const currentPlayer = players[currentColor];

  const logCounterRef = useRef<number>(0);

  const addLog = useCallback(
    (text: string, color?: PlayerColor, type: GameLogEntry['type'] = 'info') => {
      logCounterRef.current += 1;
      const newEntry: GameLogEntry = {
        id: `log-${Date.now()}-${logCounterRef.current}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text,
        color,
        type,
      };
      setLogs((prev) => [newEntry, ...prev.slice(0, 30)]);
    },
    []
  );

  /**
   * Calculate which track cell (0..51) a token lands on if stepCount <= 50
   */
  const getAbsoluteTrackIndex = useCallback((color: PlayerColor, stepCount: number): number | null => {
    if (stepCount < 0 || stepCount > 50) return null;
    const startIdx = START_TRACK_INDICES[color];
    return (startIdx + stepCount) % 52;
  }, []);

  /**
   * Check for possible moves for the current player with the current dice roll
   */
  const computeLegalMoves = useCallback(
    (color: PlayerColor, roll: number, currentPlayersState: Record<PlayerColor, Player>): MoveOption[] => {
      const player = currentPlayersState[color];
      const moves: MoveOption[] = [];

      player.tokens.forEach((token) => {
        // Case 1: Token in yard
        if (token.stepCount === -1) {
          if (roll === 6) {
            // Can deploy to step 0
            const trackIdx = START_TRACK_INDICES[color];
            // Check if any opponent token is on our start cell
            let willCapture = false;
            let capturedColor: PlayerColor | undefined;
            let capturedTokenId: number | undefined;

            // Notice start cell is safe in standard rules, but let's check
            if (!SAFE_TRACK_INDICES.has(trackIdx)) {
              activeColors.forEach((oppColor) => {
                if (oppColor !== color) {
                  currentPlayersState[oppColor].tokens.forEach((oppToken) => {
                    const oppTrack = getAbsoluteTrackIndex(oppColor, oppToken.stepCount);
                    if (oppTrack === trackIdx) {
                      willCapture = true;
                      capturedColor = oppColor;
                      capturedTokenId = oppToken.id;
                    }
                  });
                }
              });
            }

            moves.push({
              tokenId: token.id,
              fromStep: -1,
              toStep: 0,
              willCapture,
              capturedColor,
              capturedTokenId,
              willFinish: false,
            });
          }
          return;
        }

        // Case 2: Token on track or in home straight
        if (token.stepCount >= 0 && token.stepCount < 56) {
          const nextStep = token.stepCount + roll;

          // Cannot overshoot 56 (the central sanctuary)
          if (nextStep > 56) {
            return;
          }

          const willFinish = nextStep === 56;
          let willCapture = false;
          let capturedColor: PlayerColor | undefined;
          let capturedTokenId: number | undefined;

          // Check for capture on the outer track (steps 0..50)
          if (nextStep <= 50) {
            const nextTrackIdx = getAbsoluteTrackIndex(color, nextStep);
            if (nextTrackIdx !== null && !SAFE_TRACK_INDICES.has(nextTrackIdx)) {
              activeColors.forEach((oppColor) => {
                if (oppColor !== color) {
                  currentPlayersState[oppColor].tokens.forEach((oppToken) => {
                    const oppTrack = getAbsoluteTrackIndex(oppColor, oppToken.stepCount);
                    if (oppTrack === nextTrackIdx) {
                      willCapture = true;
                      capturedColor = oppColor;
                      capturedTokenId = oppToken.id;
                    }
                  });
                }
              });
            }
          }

          moves.push({
            tokenId: token.id,
            fromStep: token.stepCount,
            toStep: nextStep,
            willCapture,
            capturedColor,
            capturedTokenId,
            willFinish,
          });
        }
      });

      return moves;
    },
    [activeColors, getAbsoluteTrackIndex]
  );

  /**
   * Advance to the next player
   */
  const passTurn = useCallback(() => {
    setDiceValue(null);
    setHasRolled(false);
    setAvailableMoves([]);
    setConsecutiveSixes(0);

    // Find next unfinished player
    let nextIdx = (currentTurnIndex + 1) % activeColors.length;
    let attempts = 0;
    while (players[activeColors[nextIdx]].hasFinished && attempts < activeColors.length) {
      nextIdx = (nextIdx + 1) % activeColors.length;
      attempts++;
    }

    setCurrentTurnIndex(nextIdx);
    const nextFaction = FACTIONS[activeColors[nextIdx]];
    addLog(`Turn shifted to ${nextFaction.name} (${nextFaction.epicTitle})`, activeColors[nextIdx], 'turn');
  }, [currentTurnIndex, activeColors, players, addLog]);

  /**
   * Roll the sacred dice of destiny
   */
  const rollDice = useCallback(() => {
    if (isRolling || hasRolled || winner) return;

    setIsRolling(true);
    soundManager.playDiceRoll();

    // Dice animation interval
    let rollTicks = 0;
    const interval = setInterval(() => {
      rollTicks++;
      setDiceValue(Math.floor(Math.random() * 6) + 1);
      if (rollTicks >= 6) {
        clearInterval(interval);
        const finalRoll = Math.floor(Math.random() * 6) + 1;
        setDiceValue(finalRoll);
        setIsRolling(false);
        setHasRolled(true);

        const faction = FACTIONS[currentColor];

        // Three sixes rule check
        if (finalRoll === 6) {
          const newSixes = consecutiveSixes + 1;
          setConsecutiveSixes(newSixes);
          soundManager.playTempleChime();

          if (newSixes === 3) {
            addLog(`${faction.name} rolled three 6s in a row! Destiny intervenes; turn lost.`, currentColor, 'roll');
            setTimeout(() => {
              passTurn();
            }, 1200);
            return;
          }
          addLog(`${faction.name} rolled a royal 6! A bonus turn is granted by destiny.`, currentColor, 'roll');
        } else {
          setConsecutiveSixes(0);
          addLog(`${faction.name} cast the dice: rolled ${finalRoll}`, currentColor, 'roll');
        }

        // Compute valid moves
        const legalMoves = computeLegalMoves(currentColor, finalRoll, players);
        setAvailableMoves(legalMoves);

        if (legalMoves.length === 0) {
          addLog(`No valid moves for ${faction.name}. The turn passes.`, currentColor, 'info');
          setTimeout(() => {
            passTurn();
          }, 1100);
        }
      }
    }, 60);
  }, [
    isRolling,
    hasRolled,
    winner,
    currentColor,
    consecutiveSixes,
    computeLegalMoves,
    players,
    addLog,
    passTurn,
  ]);

  /**
   * Execute a move when a player taps an eligible token
   */
  const executeMove = useCallback(
    (tokenId: number) => {
      const move = availableMoves.find((m) => m.tokenId === tokenId);
      if (!move) return;

      soundManager.playTokenStep();

      setPlayers((prevPlayers) => {
        const player = prevPlayers[currentColor];
        const updatedTokens = player.tokens.map((tok) => {
          if (tok.id === tokenId) {
            const newStatus =
              move.toStep === 56
                ? 'finished'
                : move.toStep >= 51
                ? 'home_column'
                : 'track';
            return {
              ...tok,
              stepCount: move.toStep,
              status: newStatus,
              boardPosition: getTokenCoordinate(currentColor, tokenId, move.toStep),
            };
          }
          return tok;
        });

        const newFinishedCount = updatedTokens.filter((t) => t.status === 'finished').length;
        const playerHasFinished = newFinishedCount === 4;

        let nextState = {
          ...prevPlayers,
          [currentColor]: {
            ...player,
            tokens: updatedTokens,
            tokensFinished: newFinishedCount,
            hasFinished: playerHasFinished,
          },
        };

        // Handle capture
        if (move.willCapture && move.capturedColor && move.capturedTokenId !== undefined) {
          const capColor = move.capturedColor;
          const capTokId = move.capturedTokenId;
          soundManager.playCapture();

          const oppPlayer = nextState[capColor];
          const oppTokens = oppPlayer.tokens.map((tok) => {
            if (tok.id === capTokId) {
              return {
                ...tok,
                stepCount: -1,
                status: 'yard' as const,
                boardPosition: getTokenCoordinate(capColor, capTokId, -1),
              };
            }
            return tok;
          });

          nextState = {
            ...nextState,
            [capColor]: {
              ...oppPlayer,
              tokens: oppTokens,
            },
          };

          addLog(
            `${FACTIONS[currentColor].name} captured a token of ${FACTIONS[capColor].name}! Bonus turn earned.`,
            currentColor,
            'capture'
          );
        }

        // Check if token entered the finish sanctuary
        if (move.willFinish) {
          soundManager.playTempleChime();
          addLog(
            `A token of ${FACTIONS[currentColor].name} reached the sacred Garbhagriha! (${newFinishedCount}/4)`,
            currentColor,
            'finish'
          );

          if (playerHasFinished) {
            soundManager.playVictoryFanfare();
            const victoriousPlayer = nextState[currentColor];
            setWinner(victoriousPlayer);
            addLog(
              `👑 ${FACTIONS[currentColor].name} has fulfilled their destiny and triumphed in the Game of Destiny!`,
              currentColor,
              'finish'
            );
          }
        }

        return nextState;
      });

      // Clear current moves
      setAvailableMoves([]);

      // Bonus turn rules:
      // - Rolled a 6
      // - Made a capture
      // - Reached the central finish
      const getsBonusTurn = (diceValue === 6 || move.willCapture || move.willFinish) && !winner;

      if (getsBonusTurn) {
        setDiceValue(null);
        setHasRolled(false);
        addLog(
          `${FACTIONS[currentColor].name} receives a bonus roll from destiny!`,
          currentColor,
          'info'
        );
      } else {
        setTimeout(() => {
          passTurn();
        }, 400);
      }
    },
    [availableMoves, currentColor, diceValue, winner, addLog, passTurn]
  );

  /**
   * Reset game with fresh state
   */
  const restartGame = useCallback(() => {
    setPlayers(initialPlayers);
    setCurrentTurnIndex(0);
    setDiceValue(null);
    setIsRolling(false);
    setConsecutiveSixes(0);
    setAvailableMoves([]);
    setWinner(null);
    setHasRolled(false);
    setLogs([]);
    addLog('A new Game of Destiny begins. The dice await the warriors of Bharat.', undefined, 'info');
  }, [addLog]);

  return {
    players,
    activeColors,
    currentColor,
    currentPlayer,
    diceValue,
    isRolling,
    hasRolled,
    availableMoves,
    logs,
    winner,
    rollDice,
    executeMove,
    passTurn,
    restartGame,
  };
}
