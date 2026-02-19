import { en } from './en';
import { es } from './es';
import type { I18n } from './en';

export const translations: Record<string, I18n> = { en, es };

export function useTranslations(lang: string): I18n {
    return translations[lang] ?? translations['en'];
}

export function getAlternateLang(lang: string): string {
    return lang === 'en' ? 'es' : 'en';
}

export const supportedLangs = ['en', 'es'] as const;
export type SupportedLang = typeof supportedLangs[number];
