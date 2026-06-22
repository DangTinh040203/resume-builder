'use client';

import { ArrowUp } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

export const ScrollToTop = () => {
  const t = useTranslations('Common');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) return null;

  return (
    <div
      className={`
        animate-in fade-in zoom-in fixed right-8 bottom-8 z-50 duration-300
      `}
    >
      <button
        onClick={scrollToTop}
        className={`
          bg-primary text-primary-foreground
          hover:bg-primary/90
          flex size-12 cursor-pointer items-center justify-center rounded-full
          shadow-lg transition-all
          hover:shadow-xl
          focus:ring-2 focus:ring-offset-2 focus:outline-none
        `}
        aria-label={t('scrollToTop')}
      >
        <ArrowUp className='size-6' />
      </button>
    </div>
  );
};
