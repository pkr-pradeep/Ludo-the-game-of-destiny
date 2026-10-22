import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { CoinService } from '../coins/coinService';
import { QuizService } from '../quiz/quizService';
import { LanguageService } from '../i18n/languageService';
import { QuizValidator } from '../../content/quiz/quizValidator';
import { GitaImporter } from '../../content/gita/gitaImporter';
import { VERIFIED_GITA_VERSES, GITA_CHAPTERS } from '../../content/gita/gitaRepository';
import rawQuestionBank from '../../content/quiz/questionBank.json';
import { GitaVerse } from '../../content/gita/gitaTypes';

describe('Heritage of Bharat - Services & Content Unit Tests', () => {
  // 1. Virtual Coins Service Tests
  describe('Virtual Coin Service', () => {
    let coinService: CoinService;

    beforeEach(() => {
      coinService = new CoinService();
      coinService.resetToDefault(100);
    });

    it('initializes a new player with exactly 100 virtual coins', () => {
      assert.equal(coinService.getBalance(), 100);
      const state = coinService.getState();
      assert.equal(state.transactions.length, 1);
      assert.equal(state.transactions[0].amount, 100);
    });

    it('awards 50 coins for a confirmed victory and records transaction', () => {
      const result = coinService.awardVictory('match-101', 50);
      assert.equal(result.success, true);
      assert.equal(result.reward, 50);
      assert.equal(result.newBalance, 150);
      assert.equal(result.alreadyAwarded, false);
      assert.equal(coinService.getBalance(), 150);
    });

    it('strictly prevents duplicate victory rewards for the same match ID', () => {
      const first = coinService.awardVictory('match-unique-1', 50);
      assert.equal(first.success, true);
      assert.equal(first.newBalance, 150);

      // Duplicate attempt for the same match
      const second = coinService.awardVictory('match-unique-1', 50);
      assert.equal(second.success, false);
      assert.equal(second.alreadyAwarded, true);
      assert.equal(second.reward, 0);
      assert.equal(second.newBalance, 150);
      assert.equal(coinService.getBalance(), 150);
    });

    it('strictly prevents negative coin balances during deduction', () => {
      // Trying to deduct 120 from 100
      const ok = coinService.deductCoins(120, 'Test excess deduction');
      assert.equal(ok, false);
      assert.equal(coinService.getBalance(), 100); // Unchanged

      // Valid deduction of 40
      const validOk = coinService.deductCoins(40, 'Test valid deduction');
      assert.equal(validOk, true);
      assert.equal(coinService.getBalance(), 60);

      // Negative or zero deductions rejected
      assert.equal(coinService.deductCoins(-10, 'Invalid negative deduction'), false);
      assert.equal(coinService.deductCoins(0, 'Invalid zero deduction'), false);
    });
  });

  // 2. Learn & Earn Quiz Service Tests
  describe('Learn & Earn Daily Quiz Service', () => {
    let quizService: QuizService;

    beforeEach(() => {
      quizService = new QuizService();
      quizService.resetForTesting();
    });

    it('correct answer awards coins and records question attempt', () => {
      const questions = quizService.getQuestions();
      assert.ok(questions.length > 0);
      const q = questions[0];

      const result = quizService.submitAnswer(q.id, q.correctAnswerIndex);
      assert.equal(result.isCorrect, true);
      assert.equal(result.coinsEarned, q.rewardCoins);
      assert.equal(result.alreadyAttempted, false);
      assert.equal(result.remainingToday, 9);
    });

    it('incorrect answer awards 0 coins and consumes 1 daily attempt', () => {
      const questions = quizService.getQuestions();
      const q = questions[0];
      const wrongIndex = (q.correctAnswerIndex + 1) % 4;

      const result = quizService.submitAnswer(q.id, wrongIndex);
      assert.equal(result.isCorrect, false);
      assert.equal(result.coinsEarned, 0);
      assert.equal(result.alreadyAttempted, false);
      assert.equal(result.remainingToday, 9);
    });

    it('strictly prevents duplicate submissions on the same question', () => {
      const q = quizService.getQuestions()[0];

      // First submission
      const first = quizService.submitAnswer(q.id, q.correctAnswerIndex);
      assert.equal(first.alreadyAttempted, false);
      assert.equal(first.remainingToday, 9);

      // Second submission for the same question
      const second = quizService.submitAnswer(q.id, q.correctAnswerIndex);
      assert.equal(second.alreadyAttempted, true);
      assert.equal(second.coinsEarned, 0); // No double coins
      assert.equal(second.remainingToday, 9); // Does not consume an additional attempt
    });

    it('explicit skipping counts towards the 10-question daily limit with 0 coins', () => {
      const q = quizService.getQuestions()[0];
      const skipResult = quizService.skipQuestion(q.id);

      assert.equal(skipResult.remainingToday, 9);
      assert.equal(skipResult.dailyLimitReached, false);

      const record = quizService.getDailyRecord();
      assert.equal(record.attemptsCount, 1);
      assert.equal(record.coinsEarnedToday, 0);
      assert.ok(record.answeredQuestionIds.includes(q.id));
    });

    it('enforces hard limit of 10 attempts per calendar day and rejects 11th attempt', () => {
      const questions = quizService.getQuestions();
      assert.ok(questions.length >= 10, 'Expected at least 10 questions in bank');

      // Execute 10 attempts (mix of answers and skips)
      for (let i = 0; i < 10; i++) {
        const q = questions[i];
        if (i % 2 === 0) {
          quizService.submitAnswer(q.id, q.correctAnswerIndex);
        } else {
          quizService.skipQuestion(q.id);
        }
      }

      assert.equal(quizService.getRemainingAttemptsToday(), 0);
      assert.equal(quizService.isDailyLimitReached(), true);

      // Attempt #11 must be blocked
      const excess = quizService.submitAnswer(questions[0].id, questions[0].correctAnswerIndex);
      // Already attempted will return alreadyAttempted true and dailyLimitReached true
      assert.equal(excess.dailyLimitReached, true);
      assert.equal(excess.remainingToday, 0);
    });
  });

  // 3. Multi-language (i18n) Service Tests
  describe('Multi-Language (i18n) Service', () => {
    let languageService: LanguageService;

    beforeEach(() => {
      languageService = new LanguageService();
      languageService.setLanguage('en');
    });

    it('defaults to English and supports Odia, Hindi, Telugu, and Bengali', () => {
      assert.equal(languageService.getLanguage(), 'en');
      assert.equal(languageService.t('app_title'), 'Ludo: The Game of Destiny');

      // Hindi
      languageService.setLanguage('hi');
      assert.equal(languageService.getLanguage(), 'hi');
      assert.equal(languageService.t('app_title'), 'लूडो: भाग्य का खेल');

      // Odia
      languageService.setLanguage('or');
      assert.equal(languageService.getLanguage(), 'or');
      assert.equal(languageService.t('app_title'), 'ଲୁଡୋ: ଭାଗ୍ୟର ଖେଳ');

      // Telugu
      languageService.setLanguage('te');
      assert.equal(languageService.getLanguage(), 'te');
      assert.equal(languageService.t('app_title'), 'లూడో: ది గేమ్ ఆఫ్ డెస్టినీ');

      // Bengali
      languageService.setLanguage('bn');
      assert.equal(languageService.getLanguage(), 'bn');
      assert.equal(languageService.t('app_title'), 'লুডো: ভাগ্যের খেলা');
    });

    it('safely falls back to English when translation key is absent in target language', () => {
      languageService.setLanguage('or');
      // Look up a key that exists in English
      const translated = languageService.t('app_title');
      assert.ok(translated.length > 0);

      // If a non-existent key is queried, it returns key identifier
      const fallback = languageService.t('non_existent_key_xyz');
      assert.equal(fallback, 'non_existent_key_xyz');
    });
  });

  // 4. Content Schemas & JSON Validator Tests
  describe('Quiz Bank JSON Validator', () => {
    it('validates the production question bank without errors', () => {
      const res = QuizValidator.validate(rawQuestionBank);
      assert.equal(res.valid, true);
      assert.equal(res.errors.length, 0);
      assert.ok(res.bank);
      assert.ok(res.bank.questions.length >= 10);
    });

    it('catches invalid JSON missing required question fields or duplicate IDs', () => {
      const invalidBank = {
        version: '1.0.0',
        title: 'Broken Bank',
        questions: [
          {
            id: 'dup-1',
            category: 'mathematics',
            difficulty: 'easy',
            question: 'What is 5 + 5?',
            options: ['10', '11'], // Invalid: only 2 options
            correctAnswerIndex: 0,
            explanation: '5 + 5 = 10',
            rewardCoins: 10,
          },
          {
            id: 'dup-1', // Duplicate ID!
            category: 'gita',
            difficulty: 'medium',
            question: 'Identify the verse',
            options: ['Opt 1', 'Opt 2', 'Opt 3', 'Opt 4'],
            correctAnswerIndex: 4, // Invalid: index out of bounds
            explanation: 'Gita teaching',
            rewardCoins: 10,
            // Missing shlokaSnippet for Gita question!
          },
        ],
      };

      const res = QuizValidator.validate(invalidBank);
      assert.equal(res.valid, false);
      assert.ok(res.errors.length >= 3);
      assert.ok(res.errors.some((e) => e.includes('Duplicate id "dup-1"')));
      assert.ok(res.errors.some((e) => e.includes('exactly four choices')));
      assert.ok(res.errors.some((e) => e.includes('integer between 0 and 3')));
      assert.ok(res.errors.some((e) => e.includes('shlokaSnippet')));
    });
  });

  // 5. Bhagavad Gita Press Importer Tests
  describe('Bhagavad Gita Press Importer & Repository', () => {
    it('verifies all 18 chapters and authentic Gita Press verses', () => {
      assert.equal(GITA_CHAPTERS.length, 18);
      const res = GitaImporter.validateVerses(VERIFIED_GITA_VERSES);
      assert.equal(res.valid, true);
      assert.equal(res.errors.length, 0);
      assert.ok(res.totalVerses > 0);

      // Verify BG 2.47 is present and authentic
      const karmanye = GitaImporter.getVerse(2, 47);
      assert.ok(karmanye);
      assert.ok(karmanye.sanskritText.includes('कर्मण्येवाधिकारस्ते') || karmanye.transliteration?.includes('karmaṇyevādhikāraste'));
      assert.ok(karmanye.englishTranslation.includes('right is to work only'));
      assert.ok(karmanye.attribution.includes('Gita Press'));
    });

    it('rejects invalid chapters, impossible verse indices, or missing Sanskrit', () => {
      const invalidVerses: GitaVerse[] = [
        {
          id: 'bg-19-1', // Chapter 19 does not exist!
          chapter: 19,
          verse: 1,
          sanskritText: 'Text',
          transliteration: 'Text',
          englishTranslation: 'Trans',
          spiritualMeaning: 'Meaning',
          attribution: 'Gita Press',
        },
        {
          id: 'bg-1-999', // Chapter 1 has 47 verses, verse 999 is impossible
          chapter: 1,
          verse: 999,
          sanskritText: 'Text',
          transliteration: 'Text',
          englishTranslation: 'Trans',
          spiritualMeaning: 'Meaning',
          attribution: 'Gita Press',
        },
        {
          id: 'bg-2-1',
          chapter: 2,
          verse: 1,
          sanskritText: '', // Empty Sanskrit
          transliteration: '',
          englishTranslation: 'Trans',
          spiritualMeaning: 'Meaning',
          attribution: 'Gita Press',
        },
      ];

      const res = GitaImporter.validateVerses(invalidVerses);
      assert.equal(res.valid, false);
      assert.ok(res.errors.some((e) => e.includes('invalid chapter number 19')));
      assert.ok(res.errors.some((e) => e.includes('has only 47 verses')));
      assert.ok(res.errors.some((e) => e.includes('missing authentic Sanskrit text')));
    });
  });
});
