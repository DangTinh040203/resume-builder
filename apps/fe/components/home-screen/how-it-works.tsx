"use client";
import { m } from "framer-motion";
import { Download, Upload, Wand2 } from "lucide-react";
import { useTranslations } from "next-intl";
import React from "react";

import BlurText from "@/components/common/blur-text";
import ShinyText from "@/components/common/shiny-text";

const stepsConfig = [
  { step: "01", icon: Upload, index: "0" as const },
  { step: "02", icon: Wand2, index: "1" as const },
  { step: "03", icon: Download, index: "2" as const },
];

const HowItWorksSection = () => {
  const t = useTranslations("HowItWorks");

  return (
    <section
      className={`
        relative overflow-hidden px-2 py-8
        md:px-4 md:py-24
      `}
    >
      <div
        className={`
          via-primary/20 absolute top-0 left-0 h-px w-full bg-linear-to-r
          from-transparent to-transparent
        `}
      />

      <div className="container mx-auto">
        <m.div
          className="mb-20 text-center"
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
              text={t("badge")}
              speed={3}
              className="text-sm font-semibold tracking-wider uppercase"
            />
          </m.div>
          <BlurText
            text={t("title")}
            delay={80}
            animateBy="words"
            direction="top"
            className={`
              font-display mb-6 justify-center text-2xl font-extrabold
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
            {t("description")}
          </p>
        </m.div>

        <div
          className={`
            relative grid gap-12
            md:grid-cols-3
          `}
        >
          <m.div
            className={`
              from-primary via-accent to-primary absolute top-10 right-1/4
              left-1/4 hidden h-0.5 bg-linear-to-r opacity-20
              md:block
            `}
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
          />

          {stepsConfig.map((item, index) => (
            <m.div
              key={item.step}
              className="group relative text-center"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="relative mb-10 inline-block">
                <div
                  className={`
                    from-primary to-accent shadow-primary/30 relative z-10 flex
                    h-20 w-20 items-center justify-center rounded-[24px]
                    bg-linear-to-br shadow-xl transition-all duration-500
                    group-hover:shadow-primary/50 group-hover:rotate-6
                  `}
                >
                  <item.icon className="text-primary-foreground h-10 w-10" />
                </div>

                <m.div
                  className={`
                    text-primary/10 absolute -top-6 -right-6 text-4xl font-black
                    transition-colors select-none
                    group-hover:text-primary/20
                    md:text-6xl
                  `}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 + 0.5 }}
                >
                  {item.step}
                </m.div>
              </div>

              <h3
                className={`
                  font-display mb-4 text-xl font-bold transition-colors
                  group-hover:text-primary
                  md:text-2xl
                `}
              >
                {t(`steps.${item.index}.title`)}
              </h3>
              <p
                className={`
                  text-muted-foreground mx-auto max-w-xs text-base
                  leading-relaxed
                  md:text-lg
                `}
              >
                {t(`steps.${item.index}.description`)}
              </p>

              <div
                className={`
                  bg-primary/20 mx-auto mt-8 h-1 w-12 rounded-full
                  transition-all
                  group-hover:bg-primary/40 group-hover:w-20
                `}
              />
            </m.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
