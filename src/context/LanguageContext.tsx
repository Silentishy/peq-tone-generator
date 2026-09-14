import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, Translations, TRANSLATIONS } from '../utils/i18n';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'peq_lang_pref';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Language | null;
      if (saved === 'en' || saved === 'zh') return saved;
      if (typeof navigator !== 'undefined' && navigator.language && navigator.language.toLowerCase().startsWith('zh')) {
        return 'zh';
      }
    } catch {}
    return 'en';
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
    } catch {}
  };

  const toggleLang = () => {
    setLang(lang === 'en' ? 'zh' : 'en');
  };

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const value = {
    lang,
    setLang,
    toggleLang,
    t: TRANSLATIONS[lang],
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = (): LanguageContextType => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
};
