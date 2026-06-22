'use client';
import { m } from 'framer-motion';
import { useTranslations } from 'next-intl';
import React from 'react';

import CountUp from '@/components/common/count-up';
import { scaleIn, staggerContainer } from '@/styles/animation';

const statsMeta = [
  { value: '50', suffix: 'K+' },
  { value: '10', suffix: 'K+' },
  { value: '95', suffix: '%' },
];

const StatsSection = () => {
  const t = useTranslations('Stats');

  return (
    <section className={`
      relative overflow-hidden px-2 py-8
      md:px-4 md:py-24
    `}>
      <div
        className={`
          via-primary/20 absolute top-0 left-0 h-px w-full bg-linear-to-r
          from-transparent to-transparent
        `}
      />
      <div
        className={`
          via-primary/20 absolute bottom-0 left-0 h-px w-full bg-linear-to-r
          from-transparent to-transparent
        `}
      />

      <div className='container mx-auto'>
        <m.div
          className={`
            grid grid-cols-1 gap-12
            sm:grid-cols-3
            md:gap-24
          `}
          variants={staggerContainer}
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true }}
        >
          {statsMeta.map((stat, index) => (
            <m.div key={index} className='group text-center' variants={scaleIn}>
              <m.div
                className={`
                  font-display gradient-text mb-2 text-4xl font-extrabold
                  tracking-tighter
                  md:text-6xl
                  lg:text-7xl
                `}
                whileHover={{ scale: 1.05 }}
              >
                <CountUp
                  from={0}
                  to={parseInt(stat.value)}
                  duration={2.5}
                  separator=','
                />
                {stat.suffix}
              </m.div>
              <div
                className={`
                  text-muted-foreground text-sm font-semibold tracking-widest
                  uppercase opacity-80 transition-opacity
                  group-hover:opacity-100
                `}
              >
                {t(`${index}.label`)}
              </div>
            </m.div>
          ))}
        </m.div>
      </div>
    </section>
  );
};

export default StatsSection;
