'use client';
import { Button } from '@resume-builder/ui/components/button';
import { motion } from 'framer-motion';
import { ArrowLeft, Home } from 'lucide-react';
import { useTranslations } from 'next-intl';
import React from 'react';

import { Link } from '@/i18n/navigation';

const NotFound = () => {
  const t = useTranslations('NotFound');

  return (
    <div
      className={`
        from-background via-muted/50 to-background flex min-h-screen
        items-center justify-center bg-linear-to-br p-4
      `}
    >
      <div className='max-w-md text-center'>
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
        >
          <h1 className='text-primary/20 text-9xl font-bold'>404</h1>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h2 className='text-foreground mb-2 text-2xl font-semibold'>
            {t('title')}
          </h2>
          <p className='text-muted-foreground mb-8'>{t('description')}</p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className={`
            flex flex-col justify-center gap-3
            sm:flex-row
          `}
        >
          <Button variant='outline' onClick={() => window.history.back()}>
            <ArrowLeft className='mr-2 h-4 w-4' />
            {t('back')}
          </Button>
          <Button asChild>
            <Link href='/'>
              <Home className='mr-2 h-4 w-4' />
              {t('home')}
            </Link>
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
