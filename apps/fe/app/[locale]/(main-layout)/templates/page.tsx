"use client";

import { Button } from "@resume-builder/ui/components/button";
import { toast } from "@resume-builder/ui/components/sonner";
import { AxiosError } from "axios";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import React, { useState } from "react";

import BlurText from "@/components/common/blur-text";
import FloatingParticles from "@/components/common/floating-particles";
import { TemplateSelectionDialog } from "@/components/templates/template-selection-dialog";
import TemplateWrapper from "@/components/templates/template-wrapper";
import { TEMPLATES } from "@/configs/template.config";
import { MOCK_RESUME } from "@/constants/resume.constant";
import { useService } from "@/hooks/use-http";
import { ResumeService } from "@/services/resume.service";
import { setResume } from "@/stores/features/resume.slice";
import {
  defaultFormat,
  setTemplateSelected,
} from "@/stores/features/template.slice";
import { useAppDispatch } from "@/stores/store";
import { fadeInUp, staggerContainer } from "@/styles/animation";
import { type ErrorResponse } from "@/types/error.response";
import { toastErrorMessage } from "@/utils/toast-error-message.util";

const Templates = () => {
  const t = useTranslations("TemplatesPage");
  const [isSelectionOpen, setIsSelectionOpen] = useState(false);
  const [selectedTemplateForBuilder, setSelectedTemplateForBuilder] = useState<
    string | null
  >(null);
  const [isParsing, setIsParsing] = useState(false);

  const router = useRouter();
  const dispatch = useAppDispatch();
  const resumeService = useService(ResumeService);

  const handleSelectTemplate = (template: string) => {
    setSelectedTemplateForBuilder(template);
    setIsSelectionOpen(true);
  };

  const handleSelectionConfirm = async (
    type: "upload" | "scratch",
    file?: File,
  ) => {
    if (!selectedTemplateForBuilder) return;

    if (type === "scratch") {
      dispatch(setTemplateSelected(selectedTemplateForBuilder));
      router.push("/builder");
    } else if (type === "upload" && file) {
      try {
        setIsParsing(true);
        dispatch(setTemplateSelected(selectedTemplateForBuilder));

        const [parsed, existing] = await Promise.all([
          resumeService.resumeParse(file),
          resumeService.getResume(),
        ]);

        // Map parsed data to Resume structure with real IDs
        const resume = {
          ...MOCK_RESUME,
          id: existing.id,
          userId: existing.userId,
          title: parsed.title,
          subTitle: parsed.subTitle,
          overview: parsed.overview,
          avatar: parsed.avatar,
          information: parsed.information.map((item) => ({
            ...item,
            id: crypto.randomUUID(),
            resumeId: existing.id,
          })),
          educations: parsed.educations.map((item) => ({
            ...item,
            id: crypto.randomUUID(),
            resumeId: existing.id,
          })),
          skills: parsed.skills.map((item) => ({
            ...item,
            id: crypto.randomUUID(),
            resumeId: existing.id,
          })),
          workExperiences: parsed.workExperiences.map((item) => ({
            ...item,
            id: crypto.randomUUID(),
            resumeId: existing.id,
          })),
          projects: parsed.projects.map((item) => ({
            ...item,
            id: crypto.randomUUID(),
            resumeId: existing.id,
          })),
          certifications: parsed.certifications.map((item) => ({
            ...item,
            id: crypto.randomUUID(),
            resumeId: existing.id,
          })),
          languages: parsed.languages.map((item) => ({
            ...item,
            id: crypto.randomUUID(),
            resumeId: existing.id,
          })),
        };

        dispatch(setResume(resume));
        router.push("/builder");
      } catch (e) {
        if (e instanceof AxiosError) {
          const error = e.response?.data as ErrorResponse;
          toastErrorMessage(error.message);
        } else {
          toast.error(t("errors.generic"));
        }

        return false;
      } finally {
        setIsParsing(false);
      }
    }
  };

  return (
    <div
      className={`
        from-background via-primary/5 to-accent/10 relative min-h-screen
        overflow-hidden bg-linear-to-br
      `}
    >
      <FloatingParticles />

      {/* Animated background elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className={`
            bg-primary/15 absolute top-20 right-[10%] h-96 w-96 rounded-full
            blur-[120px]
          `}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{ duration: 4, ease: "easeInOut" }}
        />
        <motion.div
          className={`
            bg-accent/15 absolute bottom-20 left-[5%] h-80 w-80 rounded-full
            blur-[100px]
          `}
          animate={{
            scale: [1, 1.3, 1],
            x: [0, 20, 0],
          }}
          transition={{ duration: 5, ease: "easeInOut" }}
        />
      </div>

      <div className={`relative z-10 container pt-24 pb-12`}>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="mb-12 text-center"
        >
          <BlurText
            text={t("title")}
            delay={80}
            animateBy="words"
            direction="top"
            className={`
              font-display mb-4 justify-center text-3xl font-bold
              md:text-5xl
            `}
          />
          <motion.p
            variants={fadeInUp}
            className="text-muted-foreground mx-auto max-w-2xl text-lg"
          >
            {t("description")}
          </motion.p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className={`
            grid grid-cols-2 gap-6
            lg:grid-cols-3
            xl:grid-cols-4
          `}
        >
          {Object.entries(TEMPLATES).map(([templateId, profile], i) => {
            const Template = profile.component;
            return (
              <motion.div
                variants={fadeInUp}
                key={i}
                className={`group relative transition-all`}
              >
                <div
                  className={`
                    group-hover:border-primary/50 group-hover:shadow-xl
                    bg-card/50 overflow-hidden rounded-xl border shadow-sm
                    transition-all
                  `}
                >
                  <div
                    className={`
                      transition-all duration-300
                      group-hover:scale-[102%] group-hover:blur-[2px]
                    `}
                  >
                    <TemplateWrapper
                      scrollable={false}
                      selectable={false}
                      document={
                        <Template
                          resume={MOCK_RESUME}
                          templateFormat={{
                            ...defaultFormat,
                            sectionOrder: profile.defaultSectionOrder,
                            color: "#1e3a8a",
                          }}
                        />
                      }
                    />
                  </div>
                </div>

                {/* Desktop Button */}
                <div
                  className={`
                    group-hover:bg-muted/10 group-hover:shadow-2xl
                    absolute top-0 left-0 z-10 hidden size-full items-end
                    justify-center rounded-2xl bg-transparent px-6
                    lg:flex
                  `}
                >
                  <Button
                    onClick={() => handleSelectTemplate(templateId)}
                    className={`
                      mb-10 w-full rounded-full opacity-0 transition-opacity
                      group-hover:opacity-100
                    `}
                    size={"lg"}
                  >
                    {t("useTemplate")}
                  </Button>
                </div>

                {/* Mobile button */}
                <div
                  className={`
                    group-hover:bg-muted/10 group-hover:shadow-2xl
                    absolute top-0 left-0 z-10 flex size-full items-end
                    justify-center rounded-2xl bg-transparent px-6
                    lg:hidden
                  `}
                >
                  <Button
                    onClick={() => handleSelectTemplate(templateId)}
                    className={`mb-4 w-full rounded-full transition-opacity`}
                    size={"sm"}
                  >
                    {t("useTemplate")}
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
      <TemplateSelectionDialog
        isOpen={isSelectionOpen}
        isLoading={isParsing}
        onOpenChange={setIsSelectionOpen}
        onSelect={handleSelectionConfirm}
      />
    </div>
  );
};

export default Templates;
