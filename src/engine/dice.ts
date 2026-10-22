/**
 * Dice logic and interfaces for Ludo: The Game of Destiny.
 */

export interface IDiceRoller {
  roll(): number;
}

export class StandardDiceRoller implements IDiceRoller {
  roll(): number {
    return Math.floor(Math.random() * 6) + 1;
  }
}

/**
 * Deterministic dice roller for unit testing.
 * Supplies a sequence of predetermined rolls.
 */
export class DeterministicDiceRoller implements IDiceRoller {
  private sequence: number[];
  private index: number = 0;

  constructor(sequence: number[]) {
    this.sequence = [...sequence];
  }

  setSequence(newSequence: number[]) {
    this.sequence = [...newSequence];
    this.index = 0;
  }

  roll(): number {
    if (this.sequence.length === 0) {
      return 1;
    }
    const val = this.sequence[this.index % this.sequence.length];
    this.index++;
    return val;
  }
}

/**
 * Validate that a roll is an integer between 1 and 6.
 */
export function isValidRoll(roll: number): boolean {
  return Number.isInteger(roll) && roll >= 1 && roll <= 6;
}
