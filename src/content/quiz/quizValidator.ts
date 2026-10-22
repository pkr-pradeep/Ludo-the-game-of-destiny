import { QuizQuestion, QuizBankJSON } from './quizTypes';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  validatedCount: number;
}

export class QuizValidator {
  /**
   * Validate a question bank against strict structural and content requirements.
   */
  public static validate(data: unknown): { valid: boolean; errors: string[]; bank?: QuizBankJSON } {
    const errors: string[] = [];

    if (!data || typeof data !== 'object') {
      return { valid: false, errors: ['Input JSON must be an object.'] };
    }

    const obj = data as Partial<QuizBankJSON>;

    if (!obj.version || typeof obj.version !== 'string') {
      errors.push('Missing or invalid "version" string.');
    }
    if (!obj.title || typeof obj.title !== 'string') {
      errors.push('Missing or invalid "title" string.');
    }
    if (!Array.isArray(obj.questions) || obj.questions.length === 0) {
      errors.push('"questions" must be a non-empty array.');
      return { valid: false, errors };
    }

    const seenIds = new Set<string>();

    obj.questions.forEach((q, idx) => {
      const prefix = `Question #${idx + 1}`;

      if (!q.id || typeof q.id !== 'string') {
        errors.push(`${prefix}: Missing valid "id".`);
      } else if (seenIds.has(q.id)) {
        errors.push(`${prefix}: Duplicate id "${q.id}" detected.`);
      } else {
        seenIds.add(q.id);
      }

      if (q.category !== 'mathematics' && q.category !== 'gita') {
        errors.push(`${prefix}: "category" must be either "mathematics" or "gita". Received: ${q.category}`);
      }

      if (q.difficulty !== 'easy' && q.difficulty !== 'medium' && q.difficulty !== 'hard') {
        errors.push(`${prefix}: "difficulty" must be "easy", "medium", or "hard".`);
      }

      if (!q.question || typeof q.question !== 'string' || q.question.trim().length === 0) {
        errors.push(`${prefix}: "question" text must be non-empty.`);
      }

      if (!Array.isArray(q.options) || q.options.length !== 4) {
        errors.push(`${prefix}: "options" must contain exactly four choices.`);
      } else {
        q.options.forEach((opt, optIdx) => {
          if (typeof opt !== 'string' || opt.trim().length === 0) {
            errors.push(`${prefix}: Option #${optIdx + 1} must be a non-empty string.`);
          }
        });
      }

      if (
        typeof q.correctAnswerIndex !== 'number' ||
        !Number.isInteger(q.correctAnswerIndex) ||
        q.correctAnswerIndex < 0 ||
        q.correctAnswerIndex > 3
      ) {
        errors.push(`${prefix}: "correctAnswerIndex" must be an integer between 0 and 3.`);
      }

      if (!q.explanation || typeof q.explanation !== 'string' || q.explanation.trim().length === 0) {
        errors.push(`${prefix}: "explanation" must be a non-empty string.`);
      }

      if (typeof q.rewardCoins !== 'number' || q.rewardCoins <= 0) {
        errors.push(`${prefix}: "rewardCoins" must be a positive integer.`);
      }

      // Gita questions check
      if (q.category === 'gita' && (!q.shlokaSnippet || q.shlokaSnippet.trim().length === 0)) {
        errors.push(`${prefix}: Category "gita" must supply an authentic "shlokaSnippet".`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
      bank: errors.length === 0 ? (obj as QuizBankJSON) : undefined,
    };
  }
}
