"use client";
import { Button } from "@resume-builder/ui/components/button";
import { toast } from "@resume-builder/ui/components/sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@resume-builder/ui/components/tooltip";
import { cn } from "@resume-builder/ui/lib/utils";
import { AxiosError } from "axios";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  FileText,
  Loader2,
  Mic,
  Save,
  Upload,
} from "lucide-react";
import { useTranslations } from "next-intl";
import React from "react";

import InterviewDialog from "@/components/builder-screen/interview-dialog";
import MatchingDialog from "@/components/builder-screen/matching-dialog";
import DownloadPdf from "@/components/templates/download-pdf";
import { useService } from "@/hooks/use-http";
import { useSyncResume } from "@/hooks/use-sync-resume";
import { ResumeService } from "@/services/resume.service";
import { setResume } from "@/stores/features/resume.slice";
import {
  templateConfigSelector,
  updatePreviewMode,
} from "@/stores/features/template.slice";
import { useAppDispatch, useAppSelector } from "@/stores/store";
import { type ErrorResponse } from "@/types/error.response";
import { toastErrorMessage } from "@/utils/toast-error-message.util";

const ResumeControl = () => {
  const t = useTranslations("Builder");
  const { resume, sync, isSyncing } = useSyncResume();
  const { previewMode } = useAppSelector(templateConfigSelector);
  const dispatch = useAppDispatch();
  const resumeService = useService(ResumeService);
  const parseFileInputRef = React.useRef<HTMLInputElement>(null);
  const [isParsing, setIsParsing] = React.useState(false);
  const [showInterview, setShowInterview] = React.useState(false);

  const handleTogglePreviewMode = () => {
    dispatch(updatePreviewMode(!previewMode));
  };

  const handleParseResume = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !resume) return;

    // Reset input so the same file can be re-selected
    e.target.value = "";

    setIsParsing(true);
    try {
      const parsed = await resumeService.resumeParse(file);

      const updatedResume = {
        ...resume,
        title: parsed.title,
        subTitle: parsed.subTitle,
        overview: parsed.overview,
        avatar: parsed.avatar,
        information: parsed.information.map((item) => ({
          ...item,
          id: crypto.randomUUID(),
          resumeId: resume.id,
        })),
        educations: parsed.educations.map((item) => ({
          ...item,
          id: crypto.randomUUID(),
          resumeId: resume.id,
        })),
        skills: parsed.skills.map((item) => ({
          ...item,
          id: crypto.randomUUID(),
          resumeId: resume.id,
        })),
        workExperiences: parsed.workExperiences.map((item) => ({
          ...item,
          id: crypto.randomUUID(),
          resumeId: resume.id,
        })),
        projects: parsed.projects.map((item) => ({
          ...item,
          id: crypto.randomUUID(),
          resumeId: resume.id,
        })),
        certifications: parsed.certifications.map((item) => ({
          ...item,
          id: crypto.randomUUID(),
          resumeId: resume.id,
        })),
        languages: parsed.languages.map((item) => ({
          ...item,
          id: crypto.randomUUID(),
          resumeId: resume.id,
        })),
      };

      dispatch(setResume(updatedResume));
      toast.success(t("resumeControl.parseSuccess"));
    } catch (e) {
      if (e instanceof AxiosError) {
        const error = e.response?.data as ErrorResponse;
        toastErrorMessage(error.message);
      } else {
        toast.error(t("resumeControl.parseFailed"));
      }
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="mb-4">
      {/* Hidden file input for Parse Resume */}
      <input
        ref={parseFileInputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={handleParseResume}
      />

      <div className="my-4 flex items-center gap-4">
        <div
          className={`
            from-primary to-primary/70 flex h-10 w-10 shrink-0 items-center
            justify-center rounded-xl bg-linear-to-br
            md:h-12 md:w-12
          `}
        >
          <FileText
            className={`
              text-primary-foreground h-5 w-5
              md:h-6 md:w-6
            `}
          />
        </div>
        <div>
          <h1
            className={`
              font-display from-foreground to-foreground/70 bg-linear-to-br
              bg-clip-text text-xl font-bold text-transparent
              md:text-2xl
              lg:text-3xl
            `}
          >
            {t("resumeControl.title")}
          </h1>
          <p
            className={`
              text-muted-foreground text-xs
              md:text-sm
            `}
          >
            {t("resumeControl.subtitle")}
          </p>
        </div>
      </div>

      <div
        className={`
          grid grid-cols-2 gap-2
          sm:flex sm:flex-wrap sm:gap-4
        `}
      >
        <motion.div
          className={`
            w-full
            sm:w-auto
          `}
        >
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="gradient"
                  className={cn(
                    `
                      w-full shrink-0 gap-2 transition-all duration-200
                      sm:w-auto
                    `,
                  )}
                  onClick={sync}
                  disabled={isSyncing}
                >
                  {isSyncing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {t("resumeControl.save")}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t("resumeControl.saveTooltip")}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </motion.div>

        <motion.div
          className={`
            w-full
            sm:w-auto
          `}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            variant="secondary"
            className={cn(
              `
                w-full shrink-0 gap-2 transition-colors duration-200
                sm:w-auto
              `,
            )}
            onClick={handleTogglePreviewMode}
          >
            <motion.div
              initial={false}
              animate={{ rotate: previewMode ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {previewMode ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </motion.div>
            {previewMode
              ? t("resumeControl.edit")
              : t("resumeControl.customize")}
          </Button>
        </motion.div>

        {resume && (
          <div
            className={`
              w-full
              sm:w-auto
            `}
          >
            <DownloadPdf resume={resume} />
          </div>
        )}

        <div
          className={`
            w-full
            sm:w-auto
          `}
        >
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  className={`
                    border-primary w-full border shadow-xl
                    sm:w-auto
                  `}
                  onClick={() => parseFileInputRef.current?.click()}
                  disabled={isParsing || !resume}
                >
                  {isParsing ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="mr-2 h-4 w-4" />
                  )}
                  {isParsing
                    ? t("resumeControl.parsing")
                    : t("resumeControl.parseResume")}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t("resumeControl.parseTooltip")}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div
          className={`
            w-full
            sm:w-auto
          `}
        >
          <MatchingDialog />
        </div>

        <div
          className={`
            w-full
            sm:w-auto
          `}
        >
          <Button
            variant="secondary"
            className={`
              border-primary w-full border shadow-xl
              sm:w-auto
            `}
            onClick={() => setShowInterview(true)}
          >
            <Mic className="mr-2 h-4 w-4" /> {t("resumeControl.mockInterview")}
          </Button>
          <InterviewDialog
            open={showInterview}
            onOpenChange={setShowInterview}
          />
        </div>
      </div>
    </div>
  );
};

export default ResumeControl;
