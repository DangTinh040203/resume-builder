import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';

import { deepMerge } from '@/i18n/merge-messages';
import { routing } from '@/i18n/routing';
import ar from '@/messages/ar.json';
import de from '@/messages/de.json';
import en from '@/messages/en.json';
import es from '@/messages/es.json';
import fr from '@/messages/fr.json';
import hi from '@/messages/hi.json';
import ja from '@/messages/ja.json';
import ko from '@/messages/ko.json';
import th from '@/messages/th.json';
import vi from '@/messages/vi.json';
import zh from '@/messages/zh.json';

const overlays: Record<string, Record<string, unknown>> = {
  vi,
  ja,
  zh,
  th,
  hi,
  es,
  fr,
  ar,
  ko,
  de,
};

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const overlay = overlays[locale];
  const messages = overlay
    ? deepMerge(en as Record<string, unknown>, overlay)
    : en;

  return {
    locale,
    messages,
  };
});
