import { QuizQuestion, DailyAttemptRecord } from '../../content/quiz/quizTypes';
import { QuizValidator } from '../../content/quiz/quizValidator';
import rawQuestionBank from '../../content/quiz/questionBank.json';
import { coinService } from '../coins/coinService';

const DAILY_ATTEMPT_LIMIT = 10;
const STORAGE_PREFIX = 'ludo_daily_quiz_';

export interface QuizAttemptResult {
  questionId: string;
  isCorrect: boolean;
  selectedOptionIndex: number;
  correctOptionIndex: number;
  explanation: string;
  coinsEarned: number;
  alreadyAttempted: boolean;
  dailyLimitReached: boolean;
  remainingToday: number;
}

export class QuizService {
  private questions: QuizQuestion[] = [];

  constructor() {
    this.loadQuestionBank();
  }

  private loadQuestionBank() {
    const valResult = QuizValidator.validate(rawQuestionBank);
    if (valResult.valid && valResult.bank) {
      this.questions = valResult.bank.questions;
    } else {
      console.error('Quiz bank validation failed:', valResult.errors);
      this.questions = [];
    }
  }

  public getQuestions(): QuizQuestion[] {
    return [...this.questions];
  }

  public getQuestionsByCategory(category: 'mathematics' | 'gita'): QuizQuestion[] {
    return this.questions.filter((q) => q.category === category);
  }

  /**
   * Current calendar date key formatted as YYYY-MM-DD (local time)
   */
  public getTodayDateKey(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Time remaining until midnight in milliseconds.
   */
  public getTimeUntilMidnightMs(): number {
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
    return Math.max(0, midnight.getTime() - now.getTime());
  }

  private memoryRecords: Map<string, DailyAttemptRecord> = new Map();

  /**
   * Reset daily records and question state (for unit testing)
   */
  public resetForTesting(dateKey?: string) {
    const key = dateKey || this.getTodayDateKey();
    this.memoryRecords.delete(key);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
      } catch {
        // ignore
      }
    }
  }

  /**
   * Load daily attempt record for today.
   */
  public getDailyRecord(dateKey?: string): DailyAttemptRecord {
    const targetDate = dateKey || this.getTodayDateKey();
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(`${STORAGE_PREFIX}${targetDate}`);
        if (raw) {
          const parsed = JSON.parse(raw);
          return {
            date: targetDate,
            attemptsCount: typeof parsed.attemptsCount === 'number' ? parsed.attemptsCount : 0,
            answeredQuestionIds: Array.isArray(parsed.answeredQuestionIds) ? parsed.answeredQuestionIds : [],
            correctQuestionIds: Array.isArray(parsed.correctQuestionIds) ? parsed.correctQuestionIds : [],
            coinsEarnedToday: typeof parsed.coinsEarnedToday === 'number' ? parsed.coinsEarnedToday : 0,
          };
        }
      } catch (err) {
        console.error('Failed to load daily quiz record:', err);
      }
    }

    if (this.memoryRecords.has(targetDate)) {
      return JSON.parse(JSON.stringify(this.memoryRecords.get(targetDate)!));
    }

    return {
      date: targetDate,
      attemptsCount: 0,
      answeredQuestionIds: [],
      correctQuestionIds: [],
      coinsEarnedToday: 0,
    };
  }

  private saveDailyRecord(record: DailyAttemptRecord) {
    this.memoryRecords.set(record.date, JSON.parse(JSON.stringify(record)));
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`${STORAGE_PREFIX}${record.date}`, JSON.stringify(record));
      } catch (err) {
        console.error('Failed to save daily quiz record:', err);
      }
    }
  }

  public getRemainingAttemptsToday(): number {
    const record = this.getDailyRecord();
    return Math.max(0, DAILY_ATTEMPT_LIMIT - record.attemptsCount);
  }

  public isDailyLimitReached(): boolean {
    return this.getRemainingAttemptsToday() <= 0;
  }

  /**
   * Submit an answer for a question.
   * Counts towards daily attempts. Awards coins for correct answer only.
   */
  public submitAnswer(questionId: string, selectedOptionIndex: number): QuizAttemptResult {
    const question = this.questions.find((q) => q.id === questionId);
    if (!question) {
      throw new Error(`Question ${questionId} not found in question bank.`);
    }

    const record = this.getDailyRecord();

    // Check if question was already attempted
    if (record.answeredQuestionIds.includes(questionId)) {
      const isPrevCorrect = record.correctQuestionIds.includes(questionId);
      return {
        questionId,
        isCorrect: isPrevCorrect,
        selectedOptionIndex,
        correctOptionIndex: question.correctAnswerIndex,
        explanation: question.explanation,
        coinsEarned: 0,
        alreadyAttempted: true,
        dailyLimitReached: record.attemptsCount >= DAILY_ATTEMPT_LIMIT,
        remainingToday: Math.max(0, DAILY_ATTEMPT_LIMIT - record.attemptsCount),
      };
    }

    // Check daily limit
    if (record.attemptsCount >= DAILY_ATTEMPT_LIMIT) {
      return {
        questionId,
        isCorrect: false,
        selectedOptionIndex,
        correctOptionIndex: question.correctAnswerIndex,
        explanation: question.explanation,
        coinsEarned: 0,
        alreadyAttempted: false,
        dailyLimitReached: true,
        remainingToday: 0,
      };
    }

    // Process new attempt
    const isCorrect = selectedOptionIndex === question.correctAnswerIndex;
    let coinsEarned = 0;

    record.attemptsCount += 1;
    record.answeredQuestionIds.push(questionId);

    if (isCorrect) {
      record.correctQuestionIds.push(questionId);
      coinsEarned = question.rewardCoins;
      record.coinsEarnedToday += coinsEarned;
      // Award coins via CoinService
      coinService.awardQuiz(questionId, coinsEarned);
    }

    this.saveDailyRecord(record);

    return {
      questionId,
      isCorrect,
      selectedOptionIndex,
      correctOptionIndex: question.correctAnswerIndex,
      explanation: question.explanation,
      coinsEarned,
      alreadyAttempted: false,
      dailyLimitReached: record.attemptsCount >= DAILY_ATTEMPT_LIMIT,
      remainingToday: Math.max(0, DAILY_ATTEMPT_LIMIT - record.attemptsCount),
    };
  }

  /**
   * Explicitly skip a question.
   * Counts towards the 10 daily attempts, but awards 0 coins.
   */
  public skipQuestion(questionId: string): { remainingToday: number; dailyLimitReached: boolean } {
    const record = this.getDailyRecord();

    if (record.answeredQuestionIds.includes(questionId)) {
      return {
        remainingToday: Math.max(0, DAILY_ATTEMPT_LIMIT - record.attemptsCount),
        dailyLimitReached: record.attemptsCount >= DAILY_ATTEMPT_LIMIT,
      };
    }

    if (record.attemptsCount < DAILY_ATTEMPT_LIMIT) {
      record.attemptsCount += 1;
      record.answeredQuestionIds.push(questionId);
      this.saveDailyRecord(record);
    }

    return {
      remainingToday: Math.max(0, DAILY_ATTEMPT_LIMIT - record.attemptsCount),
      dailyLimitReached: record.attemptsCount >= DAILY_ATTEMPT_LIMIT,
    };
  }
}

export const quizService = new QuizService();
