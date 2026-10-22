/**
 * Types and schemas for the Learn & Earn Quiz Section.
 */

export type QuizCategory = 'mathematics' | 'gita';
export type QuizDifficulty = 'easy' | 'medium' | 'hard';

export interface QuizQuestion {
  id: string;
  category: QuizCategory;
  difficulty: QuizDifficulty;
  question: string;
  shlokaSnippet?: string; // Verbatim Sanskrit/transliteration snippet for Gita questions
  options: [string, string, string, string]; // Exactly four choices
  correctAnswerIndex: 0 | 1 | 2 | 3;
  explanation: string;
  rewardCoins: number;
}

export interface QuizBankJSON {
  version: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
}

export interface DailyAttemptRecord {
  date: string; // YYYY-MM-DD local date
  attemptsCount: number; // Max 10 per day
  answeredQuestionIds: string[];
  correctQuestionIds: string[];
  coinsEarnedToday: number;
}
