'use client';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@resume-builder/ui/components/accordion';
import { m } from 'framer-motion';
import { useTranslations } from 'next-intl';
import React from 'react';

import BlurText from '@/components/common/blur-text';
import ShinyText from '@/components/common/shiny-text';

const faqIndices = ['0', '1', '2', '3', '4'] as const;

const FAQSection = () => {
  const t = useTranslations('FAQ');

  return (
    <section
      className={`
        bg-background relative overflow-hidden px-2 py-8
        md:px-4 md:py-24
      `}
    >
      <div className='relative z-10 container mx-auto max-w-3xl'>
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
              text-muted-foreground mx-auto max-w-xl text-base leading-relaxed
              md:text-lg
            `}
          >
            {t('description')}
          </p>
        </m.div>

        <m.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
        >
          <Accordion type='single' collapsible className='w-full space-y-4'>
            {faqIndices.map((idx, index) => (
              <m.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <AccordionItem
                  value={`item-${idx}`}
                  className={`
                    bg-card/40 border-border/50 rounded-2xl border px-6
                    backdrop-blur-sm transition-all duration-300
                    hover:border-primary/20
                  `}
                >
                  <AccordionTrigger
                    className={`
                      hover:text-primary hover:no-underline
                      py-6 text-left text-base font-bold transition-colors
                      md:text-lg
                    `}
                  >
                    {t(`items.${idx}.q`)}
                  </AccordionTrigger>
                  <AccordionContent
                    className={`
                      text-muted-foreground pb-6 text-base leading-relaxed
                    `}
                  >
                    {t(`items.${idx}.a`)}
                  </AccordionContent>
                </AccordionItem>
              </m.div>
            ))}
          </Accordion>
        </m.div>
      </div>
    </section>
  );
};

export default FAQSection;
