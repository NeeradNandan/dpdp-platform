import en from "./en";
import hi from "./hi";
import ta from "./ta";
import bn from "./bn";
import te from "./te";

/** Structural type: same keys as English locale, values are strings (any language) */
type DeepStringRecord<T> = {
  [K in keyof T]: T[K] extends object ? DeepStringRecord<T[K]> : string;
};

export type TranslationKeys = DeepStringRecord<typeof en>;

export const locales: Record<LocaleCode, TranslationKeys> = {
  en,
  hi,
  ta,
  bn,
  te,
};

export type LocaleCode = "en" | "hi" | "ta" | "bn" | "te";

export function getTranslations(lang: string): TranslationKeys {
  const code = lang.toLowerCase().split("-")[0];
  if (code in locales) {
    return locales[code as LocaleCode];
  }
  return en;
}
