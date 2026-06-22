import { defineRouting } from 'next-intl/routing';

export const locales = [
  'en',
  'vi',
  'ja',
  'zh',
  'th',
  'hi',
  'es',
  'fr',
  'ar',
  'ko',
  'de',
] as const;
export type AppLocale = (typeof locales)[number];

export const routing = defineRouting({
  locales: [...locales],
  defaultLocale: 'en',
  localePrefix: 'as-needed',
});
