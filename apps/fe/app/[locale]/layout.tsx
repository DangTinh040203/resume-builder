import '@/styles/theme.css';
import '@resume-builder/ui/globals.css';

import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from '@resume-builder/ui/components/sonner';
import { type Metadata } from 'next';
import { Geist_Mono, Plus_Jakarta_Sans } from 'next/font/google';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import NextTopLoader from 'nextjs-toploader';

import { ScrollToTop } from '@/components/common/scroll-to-top';
import MotionProvider from '@/components/providers/motion-provider';
import StoreProvider from '@/components/providers/store-provider';
import { routing } from '@/i18n/routing';

const fontMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

const fontSans = Plus_Jakarta_Sans({
  subsets: ['latin', 'latin-ext', 'vietnamese'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  preload: true,
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    return {};
  }

  const titles: Record<string, string> = {
    en: 'CVCraft - AI-Powered Professional CV Builder',
    vi: 'CVCraft - Trình tạo CV chuyên nghiệp với AI',
    ja: 'CVCraft - AIでプロの履歴書を作成',
    zh: 'CVCraft - AI驱动的专业简历生成器',
    th: 'CVCraft - สร้างเรซูเม่อาชีพด้วย AI',
    hi: 'CVCraft - AI से प्रोफेशनल CV बनाएं',
    es: 'CVCraft - Creador de CV profesional con IA',
    fr: 'CVCraft - Créateur de CV professionnel avec IA',
    ar: 'CVCraft - منشئ سيرة ذاتية احترافية بالذكاء الاصطناعي',
    ko: 'CVCraft - AI 전문 이력서 빌더',
    de: 'CVCraft - KI-gestützter professioneller Lebenslauf-Builder',
  };

  const descriptions: Record<string, string> = {
    en: 'Build a stunning, professional, and ATS-optimized CV in minutes with CVCraft.',
    vi: 'Tạo CV chuyên nghiệp, tối ưu ATS chỉ trong vài phút với CVCraft.',
    ja: '数分で見栄えよくプロ並みのATS対応履歴書を作成。',
    zh: '几分钟内打造精美、专业且可通过ATS筛选的简历。',
    th: 'สร้างเรซูเม่สวย เป็นมืออาชีพ และผ่าน ATS ในไม่กี่นาที',
    hi: 'कुछ ही मिनटों में ATS के अनुकूल, प्रोफेशनल CV बनाएं।',
    es: 'Crea un CV profesional y optimizado para ATS en minutos con CVCraft.',
    fr: 'Créez un CV professionnel et optimisé ATS en quelques minutes avec CVCraft.',
    ar: 'أنشئ سيرة ذاتية احترافية ومتوافقة مع أنظمة ATS في دقائق مع CVCraft.',
    ko: 'CVCraft로 몇 분 만에 전문적이고 ATS에 최적화된 이력서를 만드세요.',
    de: 'Erstellen Sie in wenigen Minuten einen professionellen, ATS-optimierten Lebenslauf mit CVCraft.',
  };

  const title = (titles[locale] ?? titles.en) as string;
  const description = (descriptions[locale] ?? descriptions.en) as string;

  return {
    title: {
      default: title,
      template: '%s | CVCraft',
    },
    description,
    keywords: [
      'CV builder',
      'resume builder',
      'AI CV',
      'ATS',
      'mock interview',
    ],
    authors: [{ name: 'CVCraft Team' }],
    creator: 'CVCraft',
    openGraph: {
      type: 'website',
      locale: locale === 'en' ? 'en_US' : locale,
      url: 'http://cv-builder.site',
      title,
      description,
      siteName: 'CVCraft',
      images: [
        {
          url: 'http://cv-builder.site/og-image.png',
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['http://cv-builder.site/og-image.png'],
      creator: '@cvcraft',
    },
    robots: {
      index: true,
      follow: true,
    },
    verification: {
      google: 'your-google-verification-code',
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <ClerkProvider
      signInFallbackRedirectUrl='/builder'
      afterSignOutUrl='/auth/sign-in'
    >
      <html
        lang={locale}
        dir={locale === 'ar' ? 'rtl' : 'ltr'}
        suppressHydrationWarning
        className='overflow-x-hidden'
      >
        <body
          className={`
            ${fontSans.variable}
            ${fontMono.variable}
            w-full max-w-screen scrollbar-thin overflow-x-hidden font-sans
            antialiased
          `}
        >
          <NextIntlClientProvider locale={locale} messages={messages}>
            <StoreProvider>
              <MotionProvider>
                <Toaster richColors />
                <NextTopLoader
                  color='#6c23d7'
                  showSpinner={false}
                  easing='ease-in-out'
                />
                <ScrollToTop />
                {children}
              </MotionProvider>
            </StoreProvider>
          </NextIntlClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
