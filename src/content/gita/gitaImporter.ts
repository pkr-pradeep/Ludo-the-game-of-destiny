import { GitaVerse, GitaChapter } from './gitaTypes';
import { GITA_CHAPTERS, VERIFIED_GITA_VERSES } from './gitaRepository';

export interface GitaValidationResult {
  valid: boolean;
  errors: string[];
  totalVerses: number;
}

export class GitaImporter {
  /**
   * Validate a set of verses against chapter constraints and content authenticity.
   */
  public static validateVerses(verses: GitaVerse[]): GitaValidationResult {
    const errors: string[] = [];
    const idSet = new Set<string>();

    verses.forEach((verse, idx) => {
      // Check ID
      if (!verse.id || typeof verse.id !== 'string') {
        errors.push(`Verse at index ${idx} is missing a valid id.`);
      } else if (idSet.has(verse.id)) {
        errors.push(`Duplicate verse id detected: ${verse.id}`);
      } else {
        idSet.add(verse.id);
      }

      // Check Chapter
      if (!verse.chapter || verse.chapter < 1 || verse.chapter > 18) {
        errors.push(`Verse ${verse.id} has invalid chapter number ${verse.chapter}. Must be 1 to 18.`);
      } else {
        const chapterMeta = GITA_CHAPTERS.find((c) => c.number === verse.chapter);
        if (chapterMeta && (verse.verse < 1 || verse.verse > chapterMeta.totalVerses)) {
          errors.push(
            `Verse ${verse.id} specifies verse ${verse.verse}, but Chapter ${verse.chapter} (${chapterMeta.sanskritName}) has only ${chapterMeta.totalVerses} verses.`
          );
        }
      }

      // Check Non-empty Sanskrit & Translation
      if (!verse.sanskritText || verse.sanskritText.trim().length === 0) {
        errors.push(`Verse ${verse.id} is missing authentic Sanskrit text.`);
      }
      if (!verse.englishTranslation || verse.englishTranslation.trim().length === 0) {
        errors.push(`Verse ${verse.id} is missing authentic English translation.`);
      }
      if (!verse.attribution || !verse.attribution.includes('Gita Press')) {
        errors.push(`Verse ${verse.id} lacks verified Gita Press attribution metadata.`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
      totalVerses: verses.length,
    };
  }

  /**
   * Retrieve all verified verses.
   */
  public static getVerifiedVerses(): GitaVerse[] {
    return [...VERIFIED_GITA_VERSES];
  }

  /**
   * Get verse by chapter and verse number.
   */
  public static getVerse(chapter: number, verse: number): GitaVerse | undefined {
    return VERIFIED_GITA_VERSES.find((v) => v.chapter === chapter && v.verse === verse);
  }

  /**
   * Get chapter metadata.
   */
  public static getChapter(chapterNumber: number): GitaChapter | undefined {
    return GITA_CHAPTERS.find((c) => c.number === chapterNumber);
  }
}
