/**
 * Verified Bhagavad Gita types and schemas based on Gita Press, Gorakhpur.
 */

export interface GitaChapter {
  number: number; // 1 to 18
  sanskritName: string;
  englishTitle: string;
  totalVerses: number;
  synopsis: string;
}

export interface GitaVerse {
  id: string; // e.g. "BG_2_47"
  chapter: number;
  verse: number;
  sanskritText: string;
  transliteration: string;
  englishTranslation: string;
  spiritualMeaning: string;
  attribution: string;
}

export interface GitaMetadata {
  publisher: string;
  sourceEdition: string;
  isbn: string;
  location: string;
}
