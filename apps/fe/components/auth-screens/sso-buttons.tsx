'use client';
import { useSignIn } from '@clerk/nextjs';
import { type OAuthStrategy } from '@clerk/shared/types';
import { Button } from '@resume-builder/ui/components/button';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

import { handleClerkError } from '@/libs/clerk-toast';
import { buttonScaleVariants, formItemVariants } from '@/styles/animation';

const redirectUrl = process.env.NEXT_PUBLIC_REDIRECT_URL || null;

const SSOButtons = () => {
  const t = useTranslations('Auth');
  const { isLoaded, signIn } = useSignIn();

  const signInWith = async (strategy: OAuthStrategy) => {
    if (!isLoaded || !redirectUrl) return;

    try {
      await signIn.authenticateWithRedirect({
        strategy,
        redirectUrl: redirectUrl,
        redirectUrlComplete: '/',
      });
    } catch (err: unknown) {
      handleClerkError(err, {
        fallbackMessage: t('errors.generic'),
      });
    }
  };

  return (
    <motion.div variants={formItemVariants} className='flex w-full gap-2'>
      <motion.div
        variants={buttonScaleVariants}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className='flex-1'
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      >
        <Button
          onClick={() => signInWith('oauth_google')}
          className='w-full'
          type='button'
          variant='outline'
        >
          <Image src='/icons/google.svg' alt='Google' width={20} height={20} />
          Google
        </Button>
      </motion.div>

      <motion.div
        variants={buttonScaleVariants}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className='flex-1'
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      >
        <Button
          onClick={() => signInWith('oauth_github')}
          className='w-full'
          type='button'
          variant='outline'
        >
          <Image src='/icons/github.svg' alt='Github' width={20} height={20} />
          Github
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default SSOButtons;
