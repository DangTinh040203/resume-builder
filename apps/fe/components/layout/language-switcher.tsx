'use client';

import { Button } from '@resume-builder/ui/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@resume-builder/ui/components/dropdown-menu';
import { ChevronDown, Languages } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { usePathname, useRouter } from '@/i18n/navigation';
import { type AppLocale, locales } from '@/i18n/routing';

export function LanguageSwitcher() {
  const t = useTranslations('Language');
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const pathname = usePathname();

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='sm' className='gap-2'>
          <Languages className='h-4 w-4' />
          <span
            className={`
              hidden
              sm:inline
            `}
          >
            {t(locale)}
          </span>
          <ChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => router.replace(pathname, { locale: loc })}
            className={locale === loc ? 'bg-accent' : ''}
          >
            {t(loc)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
