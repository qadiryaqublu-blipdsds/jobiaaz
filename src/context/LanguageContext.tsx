import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, SUPPORTED_LANGUAGES, LanguageOption } from '../i18n/types';
import { translations, Translations } from '../i18n/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  dict: Translations;
  currentLangOption: LanguageOption;
  brandAcronym: string;
  brandSlogan: string;
  brandAcronymFull: string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'jobia_selected_language';

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && (saved === 'az' || saved === 'en' || saved === 'ru')) {
      return saved as Language;
    }
    return 'az';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const dict = translations[language] || translations.az;
  const currentLangOption = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        dict,
        currentLangOption,
        brandAcronym: dict.brand.acronym,
        brandSlogan: dict.brand.slogan,
        brandAcronymFull: dict.brand.acronymFull,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    // Fallback if rendered outside provider
    return {
      language: 'az',
      setLanguage: () => {},
      dict: translations.az,
      currentLangOption: SUPPORTED_LANGUAGES[0],
      brandAcronym: translations.az.brand.acronym,
      brandSlogan: translations.az.brand.slogan,
      brandAcronymFull: translations.az.brand.acronymFull,
    };
  }
  return context;
};
