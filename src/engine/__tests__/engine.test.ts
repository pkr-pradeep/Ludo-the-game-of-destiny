import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { LudoGameEngine } from '../LudoGameEngine';
import { DeterministicDiceRoller } from '../dice';
import { MAX_STEP, TRACK_STEP_LIMIT, getAbsoluteTrackIndex } from '../boardPaths';
import { getAutoAdvanceTokenId } from '../rules';

describe('LudoGameEngine Deterministic Unit Tests', () => {
  // 1. Base Exits
  describe('Base Exits', () => {
    it('cannot exit base on a roll of 1 to 5', () => {
      const engine = new LudoGameEngine();
      for (const roll of [1, 2, 3, 4, 5]) {
        engine.reset({ firstPlayer: 'red' });
        engine.roll(roll);
        const state = engine.getState();
        // Since no tokens can exit, legal moves must be empty and turn passes to green
        assert.equal(state.legalMoves.length, 0);
        assert.equal(state.activePlayer, 'green');
        assert.equal(state.players.red.tokens[0].step, -1);
      }
    });

    it('can exit base on a roll of 6 and places token at step 0', () => {
      const engine = new LudoGameEngine();
      engine.roll(6);
      const stateBeforeMove = engine.getState();
      assert.equal(stateBeforeMove.phase, 'NEED_MOVE');
      assert.equal(stateBeforeMove.legalMoves.length, 4); // all 4 tokens can exit
      assert.equal(stateBeforeMove.legalMoves[0].toStep, 0);
      assert.equal(stateBeforeMove.legalMoves[0].isBaseExit, true);

      // Execute move for token 0
      engine.moveToken(0);
      const stateAfter = engine.getState();
      assert.equal(stateAfter.players.red.tokens[0].step, 0);
      assert.equal(stateAfter.players.red.tokens[0].location, 'track');
      assert.equal(stateAfter.players.red.tokens[0].coordinate.row, 13);
      assert.equal(stateAfter.players.red.tokens[0].coordinate.col, 6);
    });

    it('notifies subscribers with phase NEED_MOVE immediately upon rolling a 6', () => {
      const engine = new LudoGameEngine();
      let capturedPhase: string | null = null;
      engine.subscribe((state, event) => {
        if (event?.type === 'DICE_ROLLED') {
          capturedPhase = state.phase;
        }
      });
      engine.roll(6);
      assert.equal(capturedPhase, 'NEED_MOVE');
    });

    it('exits base on 6 and runs along track on subsequent extra-turn roll', () => {
      const engine = new LudoGameEngine();
      // Roll 6 to exit base
      engine.roll(6);
      engine.moveToken(0); // Token 0 is now at step 0 (Red Start Square)

      // Player gets extra turn to roll again!
      const stateAfterExit = engine.getState();
      assert.equal(stateAfterExit.phase, 'NEED_ROLL');
      assert.equal(stateAfterExit.activePlayer, 'red');

      // Roll 4 on extra turn
      engine.roll(4);
      const stateAfterRoll4 = engine.getState();
      assert.equal(stateAfterRoll4.phase, 'NEED_MOVE');
      
      // Token 0 can move to step 4
      const move = stateAfterRoll4.legalMoves.find((m) => m.tokenId === 0);
      assert.ok(move);
      assert.equal(move.fromStep, 0);
      assert.equal(move.toStep, 4);

      // Execute move: token runs forward 4 steps
      engine.moveToken(0);
      const stateFinal = engine.getState();
      assert.equal(stateFinal.players.red.tokens[0].step, 4);
      assert.equal(stateFinal.activePlayer, 'green'); // Turn passes to green after normal roll
    });
  });

  // 2. Movement
  describe('Movement', () => {
    it('advances a token along the track according to dice value', () => {
      const engine = new LudoGameEngine();
      // Put Red token 0 at step 0
      engine._setTokenStep('red', 0, 0);
      engine.roll(4);

      const state = engine.getState();
      assert.equal(state.phase, 'NEED_MOVE');
      const move = state.legalMoves.find((m) => m.tokenId === 0);
      assert.ok(move);
      assert.equal(move.fromStep, 0);
      assert.equal(move.toStep, 4);

      engine.moveToken(0);
      const after = engine.getState();
      assert.equal(after.players.red.tokens[0].step, 4);
    });

    it('advances green token along green path correctly', () => {
      const engine = new LudoGameEngine({ firstPlayer: 'green' });
      engine._setTokenStep('green', 0, 0);
      engine.roll(3);

      const state = engine.getState();
      const move = state.legalMoves.find((m) => m.tokenId === 0);
      assert.ok(move);
      assert.equal(move.toStep, 3);

      engine.moveToken(0);
      const after = engine.getState();
      assert.equal(after.players.green.tokens[0].step, 3);
      // Green start track index is 13, step 3 is track index 16
      const greenTrack = getAbsoluteTrackIndex('green', 3);
      assert.equal(greenTrack, 16);
    });
  });

  // 3. Captures
  describe('Captures', () => {
    it('captures an opponent token on standard track square, sends it to base, and awards extra turn', () => {
      const engine = new LudoGameEngine({ firstPlayer: 'red' });
      // Red starts at track 0.
      // Green start track index is 13.
      // Let's place Green Token 0 at track index 5.
      // For Green: track index 5 corresponds to relative step (5 - 13 + 52) % 52 = 44.
      const greenStepForTrack5 = 44;
      assert.equal(getAbsoluteTrackIndex('green', greenStepForTrack5), 5);

      engine._setTokenStep('green', 0, greenStepForTrack5);
      // Place Red Token 0 at step 2 (track index 2)
      engine._setTokenStep('red', 0, 2);

      // Red rolls a 3 -> lands on step 5 (track index 5), which is NOT a safe square
      engine.roll(3);
      const state = engine.getState();
      const move = state.legalMoves.find((m) => m.tokenId === 0);
      assert.ok(move);
      assert.equal(move.isCapture, true);
      assert.deepEqual(move.capturedToken, { player: 'green', tokenId: 0 });

      engine.moveToken(0);
      const after = engine.getState();
      // Opponent green token returned to base
      assert.equal(after.players.green.tokens[0].step, -1);
      assert.equal(after.players.green.tokens[0].location, 'base');
      // Red player gets extra turn (activePlayer remains 'red', phase is 'NEED_ROLL')
      assert.equal(after.activePlayer, 'red');
      assert.equal(after.phase, 'NEED_ROLL');
      assert.ok(after.lastCaptureMessage?.includes('captured'));
    });
  });

  // 4. Safe Squares
  describe('Safe Squares', () => {
    it('does not capture opponent tokens resting on safe squares', () => {
      const engine = new LudoGameEngine({ firstPlayer: 'red' });
      // Safe star square at track index 8
      // Red start is 0, so step 8 is track index 8
      // Green step for track index 8: (8 - 13 + 52) % 52 = 47.
      const greenStepForTrack8 = 47;
      assert.equal(getAbsoluteTrackIndex('green', greenStepForTrack8), 8);

      engine._setTokenStep('green', 0, greenStepForTrack8);
      // Red is at step 5
      engine._setTokenStep('red', 0, 5);

      // Red rolls 3 -> lands on step 8
      engine.roll(3);
      const state = engine.getState();
      const move = state.legalMoves.find((m) => m.tokenId === 0);
      assert.ok(move);
      assert.equal(move.toStep, 8);
      // Move should NOT be a capture because track index 8 is a safe square
      assert.equal(move.isCapture, false);
      assert.equal(move.capturedToken, undefined);

      engine.moveToken(0);
      const after = engine.getState();
      // Green token is NOT captured
      assert.equal(after.players.green.tokens[0].step, greenStepForTrack8);
      assert.equal(after.players.red.tokens[0].step, 8);
    });
  });

  // 5. Extra Turns
  describe('Extra Turns', () => {
    it('awards an extra turn on rolling a 6', () => {
      const engine = new LudoGameEngine({ firstPlayer: 'red' });
      engine.roll(6);
      engine.moveToken(0); // Exits base to step 0

      const state = engine.getState();
      // Rolling a 6 awards an extra turn to the same player
      assert.equal(state.activePlayer, 'red');
      assert.equal(state.phase, 'NEED_ROLL');
    });

    it('limits consecutive sixes to 3, causing a turn loss', () => {
      const engine = new LudoGameEngine({ firstPlayer: 'red', maxConsecutiveSixes: 3 });
      // Roll 1: 6
      engine.roll(6);
      engine.moveToken(0);
      assert.equal(engine.getState().activePlayer, 'red');

      // Roll 2: 6
      engine.roll(6);
      engine.moveToken(0);
      assert.equal(engine.getState().activePlayer, 'red');

      // Roll 3: 6 -> 3rd consecutive 6 causes turn penalty
      engine.roll(6);
      const state = engine.getState();
      // Turn immediately forfeited and passed to green
      assert.equal(state.activePlayer, 'green');
      assert.equal(state.phase, 'NEED_ROLL');
      assert.equal(state.consecutiveSixes, 0);
    });
  });

  // 6. No Legal Moves
  describe('No Legal Moves', () => {
    it('automatically passes the turn when no moves are possible', () => {
      const engine = new LudoGameEngine({ firstPlayer: 'red' });
      // All tokens in base, roll is 2
      engine.roll(2);

      const state = engine.getState();
      assert.equal(state.activePlayer, 'green');
      assert.equal(state.phase, 'NEED_ROLL');
      assert.equal(state.legalMoves.length, 0);
    });
  });

  // 7. Finishing (Exact Roll to Finish)
  describe('Finishing', () => {
    it('allows a token to enter the goal with an exact roll', () => {
      const engine = new LudoGameEngine({ firstPlayer: 'red' });
      // Set Red Token 0 at step 54
      engine._setTokenStep('red', 0, 54);
      // Goal is at step 56. Roll 2 is exact!
      engine.roll(2);

      const state = engine.getState();
      const move = state.legalMoves.find((m) => m.tokenId === 0);
      assert.ok(move);
      assert.equal(move.toStep, 56);
      assert.equal(move.isGoal, true);

      engine.moveToken(0);
      const after = engine.getState();
      assert.equal(after.players.red.tokens[0].step, 56);
      assert.equal(after.players.red.tokens[0].location, 'goal');
      assert.equal(after.players.red.finishedCount, 1);
      // Finishing a token grants an extra turn
      assert.equal(after.activePlayer, 'red');
      assert.equal(after.phase, 'NEED_ROLL');
    });

    it('rejects an overshoot roll that exceeds step 56', () => {
      const engine = new LudoGameEngine({ firstPlayer: 'red' });
      // Set Red Token 0 at step 54. Overshoot roll: 3 (54 + 3 = 57 > 56)
      engine._setTokenStep('red', 0, 54);
      engine.roll(3);

      const state = engine.getState();
      // Token 0 cannot move; no other tokens are in play, so no legal moves
      assert.equal(state.legalMoves.length, 0);
      assert.equal(state.activePlayer, 'green'); // Passes turn
    });
  });

  // 8. Winning Detection
  describe('Winning Detection', () => {
    it('declares the player winner as soon as all 4 tokens reach the goal', () => {
      const engine = new LudoGameEngine({ firstPlayer: 'red' });
      // Put 3 tokens already in goal, token 3 at step 55
      engine._setTokenStep('red', 0, 56);
      engine._setTokenStep('red', 1, 56);
      engine._setTokenStep('red', 2, 56);
      engine._setTokenStep('red', 3, 55);

      engine.roll(1); // Exact roll to finish last token
      const state = engine.getState();
      const move = state.legalMoves.find((m) => m.tokenId === 3);
      assert.ok(move);

      engine.moveToken(3);
      const after = engine.getState();
      assert.equal(after.winner, 'red');
      assert.equal(after.players.red.hasWon, true);
      assert.equal(after.phase, 'GAME_OVER');
      assert.equal(after.players.red.finishedCount, 4);
    });
  });

  // 9. Post-Game Restrictions
  describe('Post-Game Restrictions', () => {
    it('strictly prohibits rolling or moving after game is over', () => {
      const engine = new LudoGameEngine({ firstPlayer: 'red' });
      engine._setTokenStep('red', 0, 56);
      engine._setTokenStep('red', 1, 56);
      engine._setTokenStep('red', 2, 56);
      engine._setTokenStep('red', 3, 55);

      engine.roll(1);
      engine.moveToken(3);
      assert.equal(engine.getState().phase, 'GAME_OVER');

      // Attempting to roll after game over must throw error
      assert.throws(() => {
        engine.roll(6);
      }, /Game has already ended/);

      // Attempting to move after game over must throw error
      assert.throws(() => {
        engine.moveToken(0);
      }, /Game has already ended/);
    });
  });

  // 10. Multi-Player Faction Modes (3 & 4 Players)
  describe('Multi-Player Configuration and Factions', () => {
    it('supports 3-player mode rotating Red -> Green -> Yellow -> Red', () => {
      const engine = new LudoGameEngine({ playerCount: 3, firstPlayer: 'red' });
      assert.equal(engine.getState().activePlayer, 'red');

      // Red rolls non-6 with no legal moves -> turn passes to Green
      engine.roll(3);
      assert.equal(engine.getState().activePlayer, 'green');

      // Green rolls non-6 with no legal moves -> turn passes to Yellow
      engine.roll(2);
      assert.equal(engine.getState().activePlayer, 'yellow');

      // Yellow rolls non-6 with no legal moves -> turn passes back to Red
      engine.roll(4);
      assert.equal(engine.getState().activePlayer, 'red');
    });

    it('supports 4-player mode rotating Red -> Green -> Yellow -> Blue -> Red', () => {
      const engine = new LudoGameEngine({ playerCount: 4, firstPlayer: 'red' });
      assert.equal(engine.getState().activePlayer, 'red');

      engine.roll(3); // Red turn lost
      assert.equal(engine.getState().activePlayer, 'green');

      engine.roll(2); // Green turn lost
      assert.equal(engine.getState().activePlayer, 'yellow');

      engine.roll(4); // Yellow turn lost
      assert.equal(engine.getState().activePlayer, 'blue');

      engine.roll(5); // Blue turn lost
      assert.equal(engine.getState().activePlayer, 'red');
    });

    it('allows Red to capture Blue in a 4-player game on standard track', () => {
      const engine = new LudoGameEngine({ playerCount: 4, firstPlayer: 'red' });
      // Red starts at index 0. Step 5 = absolute track index 5 (unsafe)
      // Blue starts at index 39. Absolute track index 5 is (39 + 18) % 52 = 57 % 52 = 5!
      // So Blue at step 18 is also at track index 5.
      engine._setTokenStep('red', 0, 2); // Red token 0 at step 2 (track index 2)
      engine._setTokenStep('blue', 0, 18); // Blue token 0 at track index 5

      // Red rolls 3 to move from step 2 to step 5
      engine.roll(3);
      const state = engine.getState();
      const move = state.legalMoves.find((m) => m.tokenId === 0);
      assert.ok(move);
      assert.equal(move.isCapture, true);
      assert.equal(move.capturedToken?.player, 'blue');
      assert.equal(move.capturedToken?.tokenId, 0);

      engine.moveToken(0);
      const after = engine.getState();
      assert.equal(after.players.red.tokens[0].step, 5);
      assert.equal(after.players.blue.tokens[0].step, -1); // Blue sent back to yard
      assert.equal(after.players.blue.tokens[0].location, 'base');
    });

    it('supports custom chosen player color and rival pairing (e.g. Yellow vs Blue)', () => {
      const engine = new LudoGameEngine({
        activePlayers: ['yellow', 'blue'],
        firstPlayer: 'yellow',
      });

      const state = engine.getState();
      assert.equal(state.activePlayer, 'yellow');
      assert.deepEqual(Object.keys(state.players).sort(), ['blue', 'yellow'].sort());

      // Yellow rolls 3 with no legal moves -> turn passes directly to Blue
      engine.roll(3);
      assert.equal(engine.getState().activePlayer, 'blue');

      // Blue rolls 2 with no legal moves -> turn passes back to Yellow
      engine.roll(2);
      assert.equal(engine.getState().activePlayer, 'yellow');
    });

    it('supports custom starting player in 4-player game (e.g. Blue starts first)', () => {
      const engine = new LudoGameEngine({
        activePlayers: ['blue', 'red', 'green', 'yellow'],
        firstPlayer: 'blue',
      });

      assert.equal(engine.getState().activePlayer, 'blue');
      engine.roll(4); // Blue passes
      assert.equal(engine.getState().activePlayer, 'red');
    });
  });

  // 11. Swift Advance Rule (Time Saver)
  describe('Swift Advance Rule (getAutoAdvanceTokenId)', () => {
    it('automatically advances the single active token on rolls 1 to 5', () => {
      const engine = new LudoGameEngine();
      // Roll 6 and move token 0 onto the board (step 0)
      engine.roll(6);
      engine.moveToken(0);

      // Now only token 0 is enabled on board (step 0), other 3 tokens are in yard
      const redPlayer = engine.getState().players.red;
      assert.equal(redPlayer.tokens.filter((t) => t.step >= 0 && t.step < MAX_STEP).length, 1);

      // Roll 4 on extra turn
      engine.roll(4);
      const stateAfterRoll4 = engine.getState();

      const autoId = getAutoAdvanceTokenId(
        stateAfterRoll4.players.red,
        4,
        stateAfterRoll4.legalMoves
      );

      // Token 0 should be chosen automatically
      assert.equal(autoId, 0);
    });

    it('does NOT auto-advance on a roll of 6 when yard tokens can be brought into play', () => {
      const engine = new LudoGameEngine();
      engine.roll(6);
      engine.moveToken(0); // Token 0 is at step 0; tokens 1, 2, 3 are in yard

      // Roll 6 on extra turn
      engine.roll(6);
      const stateAfterRoll6 = engine.getState();

      const autoId = getAutoAdvanceTokenId(
        stateAfterRoll6.players.red,
        6,
        stateAfterRoll6.legalMoves
      );

      // Returns null because player must be able to choose whether to bring second token into play!
      assert.equal(autoId, null);
    });

    it('does NOT auto-advance when two tokens are enabled on the board', () => {
      const engine = new LudoGameEngine();
      // Deploy token 0
      engine.roll(6);
      engine.moveToken(0);

      // Deploy token 1
      engine.roll(6);
      engine.moveToken(1);

      const redPlayer = engine.getState().players.red;
      assert.equal(redPlayer.tokens.filter((t) => t.step >= 0 && t.step < MAX_STEP).length, 2);

      // Roll 3 on extra turn: both tokens can move
      engine.roll(3);
      const stateAfterRoll3 = engine.getState();

      const autoId = getAutoAdvanceTokenId(
        stateAfterRoll3.players.red,
        3,
        stateAfterRoll3.legalMoves
      );

      // Both tokens are in play, player must choose manually
      assert.equal(autoId, null);
    });

    it('auto-deploys token 0 from yard when 0 tokens are on board and 6 is rolled', () => {
      const engine = new LudoGameEngine();
      engine.roll(6);
      const state = engine.getState();

      const autoId = getAutoAdvanceTokenId(
        state.players.red,
        6,
        state.legalMoves
      );

      assert.equal(autoId, 0);
    });

    it('returns null when single token on board cannot move (overshoot past goal)', () => {
      const engine = new LudoGameEngine();
      engine.roll(6);
      engine.moveToken(0);

      // Manually set token 0 to step 54 (needs exact 2 to finish at 56)
      const state = engine.getState();
      state.players.red.tokens[0].step = 54;

      // Legal moves for a roll of 5 would overshoot (54 + 5 = 59 > 56) -> no legal moves
      const autoId = getAutoAdvanceTokenId(
        state.players.red,
        5,
        [] // empty legal moves
      );

      assert.equal(autoId, null);
    });
  });
});
