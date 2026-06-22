"use client";

import { useUser } from "@clerk/nextjs";
import { toast } from "@resume-builder/ui/components/sonner";
import { cn } from "@resume-builder/ui/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import React, { useCallback, useEffect, useRef } from "react";

import EducationForm from "@/components/builder-screen/forms/education-form";
import ExperienceForm from "@/components/builder-screen/forms/experience-form";
import ExtraForm from "@/components/builder-screen/forms/extra-form";
import PersonalForm from "@/components/builder-screen/forms/personal-form";
import ProjectsForm from "@/components/builder-screen/forms/projects-form";
import SkillsForm from "@/components/builder-screen/forms/skills-form";
import SummaryForm from "@/components/builder-screen/forms/summary-form";
import ResumeBuilderSidebar, {
  Section,
} from "@/components/builder-screen/resume-builder-sidebar";
import ResumeControl from "@/components/builder-screen/resume-control";
import TemplateFormat from "@/components/builder-screen/template-format";
import TemplatePreview from "@/components/builder-screen/template-preview";
import NotFound from "@/components/common/not-found";
import { useService } from "@/hooks/use-http";
import { useSyncResume } from "@/hooks/use-sync-resume";
import { ResumeService } from "@/services/resume.service";
import { setResume } from "@/stores/features/resume.slice";
import {
  templateConfigSelector,
  templateSelectedSelector,
  updatePreviewMode,
} from "@/stores/features/template.slice";
import { useAppDispatch, useAppSelector } from "@/stores/store";

const BuilderScreen = () => {
  const t = useTranslations("Builder");
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentStep = searchParams.get("step") as Section;

  const [activeSection, setActiveSection] = React.useState<Section>(
    Object.values(Section).includes(currentStep)
      ? currentStep
      : Section.Personal,
  );

  const { resume, sync } = useSyncResume();

  // Ctrl+S / Cmd+S global save shortcut
  const syncRef = useRef(sync);
  useEffect(() => {
    syncRef.current = sync;
  }, [sync]);

  const handleSaveShortcut = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "s") {
      e.preventDefault();
      syncRef.current();
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleSaveShortcut);
    return () => window.removeEventListener("keydown", handleSaveShortcut);
  }, [handleSaveShortcut]);
  const { previewMode } = useAppSelector(templateConfigSelector);
  const templateSelected = useAppSelector(templateSelectedSelector);

  const { isLoaded, user } = useUser();
  const resumeService = useService(ResumeService);
  const dispatch = useAppDispatch();

  const [isFetching, setIsFetching] = React.useState(true);

  useEffect(() => {
    if (!templateSelected) {
      toast.warning(t("selectTemplateWarning"), {
        id: "no-template-selected",
      });
      router.push("/templates");
    }
  }, [templateSelected, router, t]);

  useEffect(() => {
    if (!isLoaded) return; // Wait until Clerk auth is fully loaded

    const fetchResume = async () => {
      if (user && !resume) {
        try {
          const resumeRes = await resumeService.getResume();
          if (resumeRes) {
            dispatch(setResume(resumeRes));
          }
        } finally {
          setIsFetching(false);
        }
      } else {
        setIsFetching(false);
      }
    };
    fetchResume();
  }, [dispatch, resume, resumeService, user, isLoaded]);

  useEffect(() => {
    const step = searchParams.get("step") as Section;
    const targetSection =
      step && Object.values(Section).includes(step) ? step : Section.Personal;

    if (targetSection !== activeSection) {
      setActiveSection(targetSection);
    }
  }, [searchParams, activeSection]);

  const handleSectionChange = (section: Section) => {
    if (previewMode) {
      dispatch(updatePreviewMode(false));
    }
    const params = new URLSearchParams(searchParams.toString());
    params.set("step", section);
    router.push(`/builder?${params.toString()}`, { scroll: false });
  };

  const sectionOrder = [
    Section.Personal,
    Section.Summary,
    Section.Skills,
    Section.Education,
    Section.Experience,
    Section.Projects,
    Section.Extra,
  ];

  const handleNext = () => {
    const currentIndex = sectionOrder.indexOf(activeSection);
    const nextSection = sectionOrder[currentIndex + 1];
    if (currentIndex < sectionOrder.length - 1 && nextSection) {
      handleSectionChange(nextSection);
    }
  };

  const handleBack = () => {
    const currentIndex = sectionOrder.indexOf(activeSection);
    const prevSection = sectionOrder[currentIndex - 1];
    if (currentIndex > 0 && prevSection) {
      handleSectionChange(prevSection);
    }
  };

  if (!templateSelected) {
    return <NotFound />;
  }

  return (
    <div className="container mb-10">
      <ResumeControl />

      <div
        className={`
          grid grid-cols-1 gap-6
          lg:grid-cols-12
        `}
      >
        <div
          className={`
            col-span-1
            lg:col-span-2
          `}
        >
          <ResumeBuilderSidebar
            activeSection={activeSection}
            onSectionChange={handleSectionChange}
          />
        </div>

        <div
          className={`
            col-span-1
            lg:col-span-7
          `}
        >
          {isFetching ? (
            <div className="flex h-[400px] w-full items-center justify-center">
              <Loader2 className="text-primary h-8 w-8 animate-spin" />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {!previewMode ? (
                <motion.div
                  key="forms"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {activeSection === Section.Personal && (
                    <PersonalForm onNext={handleNext} />
                  )}
                  {activeSection === Section.Summary && (
                    <SummaryForm onNext={handleNext} onBack={handleBack} />
                  )}
                  {activeSection === Section.Skills && (
                    <SkillsForm onNext={handleNext} onBack={handleBack} />
                  )}
                  {activeSection === Section.Education && (
                    <EducationForm onNext={handleNext} onBack={handleBack} />
                  )}
                  {activeSection === Section.Experience && (
                    <ExperienceForm onNext={handleNext} onBack={handleBack} />
                  )}
                  {activeSection === Section.Projects && (
                    <ProjectsForm onNext={handleNext} onBack={handleBack} />
                  )}
                  {activeSection === Section.Extra && (
                    <ExtraForm onBack={handleBack} />
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="preview-main"
                  layoutId="template-preview-container"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <TemplatePreview />
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>

        <div
          className={cn(`
            col-span-1
            lg:col-span-3
          `)}
        >
          <AnimatePresence mode="wait">
            {!previewMode ? (
              <motion.div
                key="preview-sidebar"
                layoutId="template-preview-container"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <TemplatePreview />
              </motion.div>
            ) : (
              <motion.div
                key="template-format"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <TemplateFormat />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default BuilderScreen;
