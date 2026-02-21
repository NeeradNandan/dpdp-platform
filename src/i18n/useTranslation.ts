"use client";

import { useState, useCallback } from "react";
import { getTranslations } from "./locales";
import {
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
  getLanguageByCode,
} from "./config";
import type { TranslationKeys } from "./locales";

const STORAGE_KEY = "dpdp-lang";

function getInitialLanguage(): string {
  if (typeof window === "undefined") {
    return DEFAULT_LANGUAGE;
  }
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    const lang = getLanguageByCode(stored);
    if (lang) return lang.code;
  }
  const browserLang = navigator.language?.toLowerCase().split("-")[0];
  const supported = SUPPORTED_LANGUAGES.some((l) => l.code === browserLang);
  return supported ? browserLang : DEFAULT_LANGUAGE;
}

function resolveLanguage(code?: string): string {
  if (!code) return getInitialLanguage();
  return getLanguageByCode(code)?.code ?? DEFAULT_LANGUAGE;
}

export function useTranslation(initialLang?: string) {
  const [lang, setLangState] = useState<string>(() => resolveLanguage(initialLang));
  const [prevInitialLang, setPrevInitialLang] = useState(initialLang);

  if (initialLang !== prevInitialLang) {
    setPrevInitialLang(initialLang);
    setLangState(resolveLanguage(initialLang));
  }

  const setLang = useCallback((newLang: string) => {
    const resolved = getLanguageByCode(newLang);
    const code = resolved?.code ?? DEFAULT_LANGUAGE;
    setLangState(code);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, code);
    }
  }, []);

  const t: TranslationKeys = getTranslations(lang);

  return {
    t,
    lang,
    setLang,
    languages: SUPPORTED_LANGUAGES,
  };
}
