import { SupportedLanguage, SUPPORTED_LANGUAGES, TRANSLATIONS } from './translations';

export class LanguageService {
  private currentLanguage: SupportedLanguage = 'en';
  private listeners: Set<(lang: SupportedLanguage) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ludo_language') as SupportedLanguage | null;
      if (saved && (saved === 'en' || saved === 'or' || saved === 'hi' || saved === 'te' || saved === 'bn')) {
        this.currentLanguage = saved;
      }
    }
  }

  public getLanguage(): SupportedLanguage {
    return this.currentLanguage;
  }

  public setLanguage(lang: SupportedLanguage) {
    this.currentLanguage = lang;
    if (typeof window !== 'undefined') {
      localStorage.setItem('ludo_language', lang);
    }
    this.notify();
  }

  public subscribe(listener: (lang: SupportedLanguage) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((fn) => fn(this.currentLanguage));
  }

  /**
   * Safe translation lookup with fallback to English
   */
  public t(key: string, params?: Record<string, string | number>): string {
    const langDict = TRANSLATIONS[this.currentLanguage] || TRANSLATIONS.en;
    let text = langDict[key] || TRANSLATIONS.en[key] || key;

    if (params) {
      Object.entries(params).forEach(([paramKey, val]) => {
        text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(val));
      });
    }

    return text;
  }
}

export const languageService = new LanguageService();
