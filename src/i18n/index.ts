/**
 * DPDP PaaS i18n Module
 * Supports 22 scheduled Indian languages + English per DPDP Act 2023
 */

export {
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
  getLanguageByCode,
  isRTL,
} from "./config";
export type { SupportedLanguage, LanguageCode } from "./config";

export {
  locales,
  getTranslations,
  type TranslationKeys,
  type LocaleCode,
} from "./locales";

export { useTranslation } from "./useTranslation";
