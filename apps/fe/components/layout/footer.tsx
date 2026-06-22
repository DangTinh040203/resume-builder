'use client';
import { m } from 'framer-motion';
import { FileText } from 'lucide-react';
import { useTranslations } from 'next-intl';
import React from 'react';

import { fadeInUp, staggerContainer } from '@/styles/animation';

const Footer = () => {
  const t = useTranslations('Footer');

  const productLinks = [0, 1, 2, 3].map((i) => t(`productLinks.${i}`));
  const companyLinks = [0, 1, 2, 3].map((i) => t(`companyLinks.${i}`));
  const legalLinks = [0, 1, 2].map((i) => t(`legalLinks.${i}`));

  const sections = [
    { title: t('product'), links: productLinks },
    { title: t('company'), links: companyLinks },
    { title: t('legal'), links: legalLinks },
  ];

  return (
    <footer className='border-border bg-muted/30 border-t px-4 py-12'>
      <div className='container mx-auto'>
        <m.div
          className={`
            grid grid-cols-2 gap-8
            md:grid-cols-4
          `}
          variants={staggerContainer}
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true }}
        >
          <m.div variants={fadeInUp} className={`
            col-span-2
            md:col-span-1
          `}>
            <div className='mb-4 flex items-center gap-2'>
              <m.div
                className={`
                  gradient-bg flex h-8 w-8 items-center justify-center
                  rounded-lg
                `}
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <FileText className='text-primary-foreground h-5 w-5' />
              </m.div>
              <span className='font-display text-xl font-bold'>CVCraft</span>
            </div>
            <p className='text-muted-foreground text-sm'>{t('tagline')}</p>
          </m.div>

          {sections.map((section) => (
            <m.div key={section.title} variants={fadeInUp}>
              <h4 className='mb-4 font-semibold'>{section.title}</h4>
              <ul className='space-y-2'>
                {section.links.map((link) => (
                  <li key={link}>
                    <m.a
                      href='#'
                      className={`
                        text-muted-foreground
                        hover:text-foreground
                        text-sm transition-colors
                      `}
                      whileHover={{ x: 5 }}
                    >
                      {link}
                    </m.a>
                  </li>
                ))}
              </ul>
            </m.div>
          ))}
        </m.div>

        <m.div
          className={`
            border-border text-muted-foreground mt-12 border-t pt-8 text-center
            text-sm
          `}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          {t('copyright')}
        </m.div>
      </div>
    </footer>
  );
};

export default Footer;
