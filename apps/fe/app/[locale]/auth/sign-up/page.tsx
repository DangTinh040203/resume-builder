'use client';
import { useSignUp } from '@clerk/nextjs';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@resume-builder/ui/components/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@resume-builder/ui/components/form';
import { Input } from '@resume-builder/ui/components/input';
import { Separator } from '@resume-builder/ui/components/separator';
import { motion } from 'framer-motion';
import { ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'nextjs-toploader/app';
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import SSOButtons from '@/components/auth-screens/sso-buttons';
import { Link } from '@/i18n/navigation';
import { handleClerkError } from '@/libs/clerk-toast';
import {
  buttonScaleVariants,
  formContainerVariants,
  formItemVariants,
} from '@/styles/animation';

const SignUp = () => {
  const t = useTranslations('Auth');
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const { isLoaded, signUp } = useSignUp();
  const router = useRouter();

  const formSchema = React.useMemo(
    () =>
      z
        .object({
          email: z
            .string()
            .min(1, t('validation.emailRequired'))
            .email(t('validation.emailInvalid')),
          password: z
            .string()
            .min(1, t('validation.passwordRequired'))
            .min(8, t('validation.passwordMin'))
            .max(50, t('validation.passwordMax')),
          confirmPassword: z
            .string()
            .min(1, t('validation.confirmPasswordRequired')),
        })
        .refine((data) => data.password === data.confirmPassword, {
          message: t('validation.passwordsDoNotMatch'),
          path: ['confirmPassword'],
        }),
    [t],
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!isLoaded) return;

    setIsLoading(true);

    try {
      await signUp.create({
        emailAddress: values.email,
        password: values.password,
      });

      // Send OTP to email
      await signUp.prepareEmailAddressVerification({
        strategy: 'email_code',
      });

      // Redirect to verify OTP page
      router.push(`/auth/verify-otp?email=${encodeURIComponent(values.email)}`);
    } catch (error) {
      handleClerkError(error, {
        fallbackMessage: t('errors.generic'),
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <motion.div
      variants={formContainerVariants}
      initial='hidden'
      animate='visible'
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          <motion.div variants={formItemVariants}>
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields.email')}</FormLabel>
                  <FormControl>
                    <motion.div
                      whileFocus={{ scale: 1.01 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <Input
                        placeholder={t('placeholders.email')}
                        disabled={isLoading}
                        {...field}
                      />
                    </motion.div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>

          <motion.div variants={formItemVariants}>
            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields.password')}</FormLabel>
                  <FormControl>
                    <motion.div
                      whileFocus={{ scale: 1.01 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      className='relative'
                    >
                      <Input
                        {...field}
                        placeholder={t('placeholders.createPassword')}
                        type={showPassword ? 'text' : 'password'}
                        disabled={isLoading}
                        className='pr-10'
                      />
                      <Button
                        variant='ghost'
                        size={'icon'}
                        type='button'
                        className='absolute top-1/2 right-2 -translate-y-1/2'
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff /> : <Eye />}
                      </Button>
                    </motion.div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>

          <motion.div variants={formItemVariants}>
            <FormField
              control={form.control}
              name='confirmPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields.confirmPassword')}</FormLabel>
                  <FormControl>
                    <motion.div
                      whileFocus={{ scale: 1.01 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      className='relative'
                    >
                      <Input
                        {...field}
                        placeholder={t('placeholders.confirmPassword')}
                        type={showConfirmPassword ? 'text' : 'password'}
                        disabled={isLoading}
                        className='pr-10'
                      />
                      <Button
                        variant='ghost'
                        size={'icon'}
                        type='button'
                        className='absolute top-1/2 right-2 -translate-y-1/2'
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? <EyeOff /> : <Eye />}
                      </Button>
                    </motion.div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>

          {/* Clerk Smart CAPTCHA mounts here; without it Clerk falls back to
              Invisible CAPTCHA and logs a warning on signUp.create() */}
          <div id='clerk-captcha' />

          <motion.div
            variants={buttonScaleVariants}
            whileHover={
              isLoading
                ? {}
                : {
                    scale: 1.02,
                  }
            }
            whileTap={isLoading ? {} : { scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            <Button
              type='submit'
              size='lg'
              className='w-full rounded-full'
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className='h-5 w-5 animate-spin' />
                  {t('signUp.loading')}
                </>
              ) : (
                <>
                  {t('signUp.submit')}
                  <motion.span
                    initial={{ x: 0 }}
                    whileHover={{ x: 5 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    <ArrowRight className='h-5 w-5' />
                  </motion.span>
                </>
              )}
            </Button>
          </motion.div>

          <motion.div
            variants={formItemVariants}
            className='flex w-full items-center gap-2'
          >
            <Separator className='my-2 flex-1' />
            <p className='text-muted-foreground text-center text-xs'>
              {t('continueWith')}
            </p>
            <Separator className='my-2 flex-1' />
          </motion.div>

          <SSOButtons />

          <motion.p
            variants={formItemVariants}
            className='text-muted-foreground text-center text-sm'
          >
            {t('signUp.hasAccount')}{' '}
            <Link
              href='/auth/sign-in'
              className={`
                text-primary font-medium transition-all
                hover:underline
              `}
            >
              <motion.span
                whileHover={{ scale: 1.05 }}
                className='inline-block'
              >
                {t('signUp.signInLink')}
              </motion.span>
            </Link>
          </motion.p>
        </form>
      </Form>
    </motion.div>
  );
};

export default SignUp;
