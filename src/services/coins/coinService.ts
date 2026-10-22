/**
 * Virtual Coin Service for Ludo: The Game of Destiny.
 * Strictly virtual currency with zero real-money purchases, betting, or gambling.
 */

export interface CoinTransaction {
  id: string;
  timestamp: number;
  amount: number;
  reason: string;
  balanceAfter: number;
}

export interface CoinState {
  balance: number;
  transactions: CoinTransaction[];
  awardedMatchIds: string[];
  awardedQuestionIds: string[];
}

const STORAGE_KEY = 'ludo_virtual_coin_state_v1';
const INITIAL_COINS = 100;
const DEFAULT_VICTORY_REWARD = 50;
const DEFAULT_QUIZ_REWARD = 10;

export class CoinService {
  private state: CoinState;
  private listeners: Set<(state: CoinState) => void> = new Set();

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): CoinState {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (typeof parsed.balance === 'number' && parsed.balance >= 0) {
            return {
              balance: parsed.balance,
              transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [],
              awardedMatchIds: Array.isArray(parsed.awardedMatchIds) ? parsed.awardedMatchIds : [],
              awardedQuestionIds: Array.isArray(parsed.awardedQuestionIds) ? parsed.awardedQuestionIds : [],
            };
          }
        }
      } catch (err) {
        console.error('Failed to parse coin storage:', err);
      }
    }

    // Default initial state for new player
    return {
      balance: INITIAL_COINS,
      transactions: [
        {
          id: `tx-init-${Date.now()}`,
          timestamp: Date.now(),
          amount: INITIAL_COINS,
          reason: 'Blessing of Bharat: Initial Player Balance',
          balanceAfter: INITIAL_COINS,
        },
      ],
      awardedMatchIds: [],
      awardedQuestionIds: [],
    };
  }

  private saveState() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      } catch (err) {
        console.error('Failed to save coin state:', err);
      }
    }
    this.notify();
  }

  public subscribe(listener: (state: CoinState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const snapshot = this.getState();
    this.listeners.forEach((fn) => fn(snapshot));
  }

  public getState(): CoinState {
    return JSON.parse(JSON.stringify(this.state));
  }

  public getBalance(): number {
    return this.state.balance;
  }

  /**
   * Award coins for confirmed match victory.
   * Strictly prevents duplicate rewards for the same matchId.
   */
  public awardVictory(matchId: string, rewardAmount: number = DEFAULT_VICTORY_REWARD): {
    success: boolean;
    reward: number;
    newBalance: number;
    alreadyAwarded: boolean;
  } {
    if (this.state.awardedMatchIds.includes(matchId)) {
      return {
        success: false,
        reward: 0,
        newBalance: this.state.balance,
        alreadyAwarded: true,
      };
    }

    const newBalance = this.state.balance + rewardAmount;
    const tx: CoinTransaction = {
      id: `tx-vic-${Date.now()}-${matchId}`,
      timestamp: Date.now(),
      amount: rewardAmount,
      reason: `Match Victory (${matchId})`,
      balanceAfter: newBalance,
    };

    this.state.balance = newBalance;
    this.state.transactions.unshift(tx);
    this.state.awardedMatchIds.push(matchId);
    this.saveState();

    return {
      success: true,
      reward: rewardAmount,
      newBalance,
      alreadyAwarded: false,
    };
  }

  /**
   * Award coins for correct answer in Learn & Earn quiz.
   * Strictly prevents duplicate rewards for the same questionId.
   */
  public awardQuiz(questionId: string, rewardAmount: number = DEFAULT_QUIZ_REWARD): {
    success: boolean;
    reward: number;
    newBalance: number;
    alreadyAwarded: boolean;
  } {
    if (this.state.awardedQuestionIds.includes(questionId)) {
      return {
        success: false,
        reward: 0,
        newBalance: this.state.balance,
        alreadyAwarded: true,
      };
    }

    const newBalance = this.state.balance + rewardAmount;
    const tx: CoinTransaction = {
      id: `tx-quiz-${Date.now()}-${questionId}`,
      timestamp: Date.now(),
      amount: rewardAmount,
      reason: `Quiz Excellence: Question ${questionId}`,
      balanceAfter: newBalance,
    };

    this.state.balance = newBalance;
    this.state.transactions.unshift(tx);
    this.state.awardedQuestionIds.push(questionId);
    this.saveState();

    return {
      success: true,
      reward: rewardAmount,
      newBalance,
      alreadyAwarded: false,
    };
  }

  /**
   * Deduct coins, preventing negative balance.
   */
  public deductCoins(amount: number, reason: string): boolean {
    if (amount <= 0 || this.state.balance < amount) {
      return false; // Negative balance strictly prevented
    }

    const newBalance = this.state.balance - amount;
    const tx: CoinTransaction = {
      id: `tx-ded-${Date.now()}`,
      timestamp: Date.now(),
      amount: -amount,
      reason,
      balanceAfter: newBalance,
    };

    this.state.balance = newBalance;
    this.state.transactions.unshift(tx);
    this.saveState();
    return true;
  }

  /**
   * Reset balance (useful for testing or full clear)
   */
  public resetToDefault(initialBalance: number = INITIAL_COINS) {
    this.state = {
      balance: initialBalance,
      transactions: [
        {
          id: `tx-reset-${Date.now()}`,
          timestamp: Date.now(),
          amount: initialBalance,
          reason: 'Reset to initial balance',
          balanceAfter: initialBalance,
        },
      ],
      awardedMatchIds: [],
      awardedQuestionIds: [],
    };
    this.saveState();
  }
}

export const coinService = new CoinService();
