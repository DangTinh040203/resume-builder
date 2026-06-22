'use client';

import { Brain, Mic, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import React from 'react';

interface InterviewLoadingProps {
  text?: string;
}

export const InterviewLoading = ({ text }: InterviewLoadingProps) => {
  const t = useTranslations('Interview');

  return (
    <div className='flex flex-col items-center justify-center gap-8 py-24'>
      {/* Animated Rings */}
      <div className='relative flex h-32 w-32 items-center justify-center'>
        <div
          className='bg-primary/5 absolute inset-0 animate-ping rounded-full'
          style={{ animationDuration: '3s' }}
        />
        <div
          className='bg-primary/10 absolute inset-2 animate-ping rounded-full'
          style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}
        />
        <div
          className='bg-primary/20 absolute inset-4 animate-ping rounded-full'
          style={{ animationDuration: '2s', animationDelay: '1s' }}
        />
        <div
          className={`
            border-primary/30 bg-background/90 shadow-primary/20 relative z-10
            flex h-20 w-20 items-center justify-center rounded-full border-2
            shadow-[0_0_40px_hsl(var(--primary)/0.4)] backdrop-blur-xl
          `}
        >
          <Mic className='text-primary h-10 w-10 animate-pulse' />
          <Sparkles
            className={`
              absolute -top-2 -right-2 h-6 w-6 animate-bounce text-amber-500
            `}
          />
        </div>
      </div>

      {/* Text */}
      <div className='flex flex-col items-center gap-3 text-center'>
        <h3
          className={`
            from-primary to-primary/50 bg-linear-to-r bg-clip-text text-2xl
            font-bold tracking-tight text-transparent
          `}
        >
          {t('loading.title')}
        </h3>
        <div className='text-muted-foreground flex items-center gap-2'>
          <Brain
            className='text-primary/70 h-5 w-5 animate-spin'
            style={{ animationDuration: '4s' }}
          />
          <p className='animate-pulse text-sm font-medium'>
            {text ?? t('loading.evaluating')}
          </p>
        </div>
        <div className='mt-2 flex items-center gap-1.5'>
          <span
            className='bg-primary/80 h-1.5 w-1.5 animate-bounce rounded-full'
            style={{ animationDelay: '0ms' }}
          />
          <span
            className='bg-primary/80 h-1.5 w-1.5 animate-bounce rounded-full'
            style={{ animationDelay: '150ms' }}
          />
          <span
            className='bg-primary/80 h-1.5 w-1.5 animate-bounce rounded-full'
            style={{ animationDelay: '300ms' }}
          />
        </div>
      </div>
    </div>
  );
};
