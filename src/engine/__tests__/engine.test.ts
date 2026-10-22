import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { LudoGameEngine } from '../LudoGameEngine';
import { DeterministicDiceRoller } from '../dice';
import { MAX_STEP, TRACK_STEP_LIMIT, getAbsoluteTrackIndex } from '../boardPaths';

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
});
