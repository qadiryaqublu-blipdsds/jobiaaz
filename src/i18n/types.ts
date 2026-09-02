export type Language = 'az' | 'en' | 'ru';

export interface LanguageOption {
  code: Language;
  label: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'az', label: 'AZ', nativeName: 'Azərbaycan', flag: '🇦🇿' },
  { code: 'en', label: 'EN', nativeName: 'English', flag: '🇬🇧' },
  { code: 'ru', label: 'RU', nativeName: 'Русский', flag: '🇷🇺' },
];
