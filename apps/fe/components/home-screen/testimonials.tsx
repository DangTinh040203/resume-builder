'use client';
import { Card, CardContent } from '@resume-builder/ui/components/card';
import { m } from 'framer-motion';
import { Star } from 'lucide-react';
import { useTranslations } from 'next-intl';
import React from 'react';

import BlurText from '@/components/common/blur-text';
import ShinyText from '@/components/common/shiny-text';
import { fadeInUp, staggerContainer } from '@/styles/animation';

const testimonialIndices = ['0', '1', '2'] as const;
const initials = ['SC', 'MR', 'EW'];

const TestimonialsSection = () => {
  const t = useTranslations('Testimonials');

  return (
    <section className={`
      relative overflow-hidden px-2 py-8
      md:px-4 md:py-24
    `}>
      <div className='container mx-auto'>
        <m.div
          className='mb-20 text-center'
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <m.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className={`
              text-primary bg-primary/10 mb-6 inline-block rounded-full px-4
              py-1.5 text-sm font-semibold tracking-wider uppercase
            `}
          >
            <ShinyText
              text={t('badge')}
              speed={3}
              className='text-sm font-semibold tracking-wider uppercase'
            />
          </m.div>
          <BlurText
            text={t('title')}
            delay={80}
            animateBy='words'
            direction='top'
            className={`
              font-display mb-6 flex-wrap justify-center text-3xl font-extrabold
              tracking-tight
              md:text-5xl
            `}
          />
          <p
            className={`
              text-muted-foreground mx-auto max-w-2xl text-base leading-relaxed
              md:text-lg
            `}
          >
            {t('description')}
          </p>
        </m.div>

        <m.div
          className={`
            grid gap-8
            md:grid-cols-3
          `}
          variants={staggerContainer}
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true, margin: '-50px' }}
        >
          {testimonialIndices.map((idx, index) => (
            <m.div
              key={idx}
              variants={fadeInUp}
              whileHover={{ y: -12 }}
              transition={{ duration: 0.4 }}
            >
              <Card
                className={`
                  border-border/50 bg-card/60
                  hover:border-primary/20
                  h-full rounded-3xl backdrop-blur-sm transition-all
                  duration-500
                  hover:shadow-2xl
                `}
              >
                <CardContent className='p-8'>
                  <div className='mb-6 flex gap-1'>
                    {[...Array(5)].map((_, i) => (
                      <m.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 + i * 0.1, type: 'spring' }}
                      >
                        <Star
                          className={`h-5 w-5 fill-yellow-400 text-yellow-400`}
                        />
                      </m.div>
                    ))}
                  </div>
                  <p
                    className={`
                      text-foreground mb-8 text-base leading-relaxed font-medium
                      md:text-lg
                    `}
                  >
                    &quot;{t(`items.${idx}.content`)}&quot;
                  </p>
                  <div
                    className={`
                      border-border/60 flex items-center gap-4 border-t pt-6
                    `}
                  >
                    <m.div
                      className={`
                        from-primary to-accent text-primary-foreground
                        shadow-primary/20 flex h-14 w-14 items-center
                        justify-center rounded-2xl bg-linear-to-br font-bold
                        shadow-lg
                      `}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      {initials[index]}
                    </m.div>
                    <div>
                      <div className={`
                        text-base font-bold
                        md:text-lg
                      `}>
                        {t(`items.${idx}.name`)}
                      </div>
                      <div className='text-primary text-sm font-medium'>
                        {t(`items.${idx}.role`)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </m.div>
          ))}
        </m.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
