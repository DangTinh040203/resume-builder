"use client";
import { Button } from "@resume-builder/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@resume-builder/ui/components/dialog";
import { toast } from "@resume-builder/ui/components/sonner";
import { AxiosError } from "axios";
import { Brain, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import React from "react";

import { MatchingForm } from "@/components/builder-screen/matching/matching-form";
import { MatchingLoading } from "@/components/builder-screen/matching/matching-loading";
import { MatchingResult } from "@/components/builder-screen/matching/matching-result";
import { useService } from "@/hooks/use-http";
import { useSyncResume } from "@/hooks/use-sync-resume";
import { ResumeService } from "@/services/resume.service";
import { type ErrorResponse } from "@/types/error.response";
import { type MatchResult } from "@/types/resume.type";
import { toastErrorMessage } from "@/utils/toast-error-message.util";

const MatchingDialog = () => {
  const t = useTranslations("Matching");
  const [showDialog, setShowDialog] = React.useState(false);
  const [jdText, setJdText] = React.useState("");
  const [jdFile, setJdFile] = React.useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [matchResult, setMatchResult] = React.useState<MatchResult | null>(
    null,
  );

  const { resume } = useSyncResume();
  const resumeService = useService(ResumeService);

  const handleAnalyze = async () => {
    if (!resume) {
      toast.error(t("errors.noResume"));
      return;
    }

    if (!jdText.trim() && !jdFile) {
      toast.error(t("errors.noJobDescription"));
      return;
    }

    setIsAnalyzing(true);

    try {
      const result = await resumeService.matchResume(
        resume.id,
        jdFile ? undefined : jdText,
        jdFile ?? undefined,
      );
      setMatchResult(result);
    } catch (e) {
      if (e instanceof AxiosError) {
        const error = e.response?.data as ErrorResponse;
        toastErrorMessage(error.message);
      } else {
        toast.error(t("errors.generic"));
      }

      return false;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setMatchResult(null);
    setJdText("");
    setJdFile(null);
  };

  const handleDialogChange = (open: boolean) => {
    setShowDialog(open);
    if (!open) {
      handleReset();
      setIsAnalyzing(false);
    }
  };

  return (
    <Dialog open={showDialog} onOpenChange={handleDialogChange}>
      <DialogTrigger asChild>
        <Button
          variant={"secondary"}
          className={`
            border-primary w-full border shadow-xl
            sm:w-auto
          `}
        >
          <Brain className="mr-2 h-4 w-4" /> {t("trigger")}
        </Button>
      </DialogTrigger>

      <DialogContent
        className={`
          w-[90vw] space-y-2
          sm:max-w-4xl
        `}
      >
        <div className="space-y-2">
          <DialogTitle className="flex items-center gap-2">
            <Sparkles size={20} /> {t("title")}
          </DialogTitle>
          <DialogDescription>
            {matchResult ? t("description.result") : t("description.form")}
          </DialogDescription>
        </div>

        {isAnalyzing ? (
          <MatchingLoading />
        ) : matchResult ? (
          <MatchingResult
            matchResult={matchResult}
            onReset={handleReset}
            jdText={jdText}
            resumeId={resume?.id ?? ""}
          />
        ) : (
          <MatchingForm
            jdText={jdText}
            setJdText={setJdText}
            jdFile={jdFile}
            setJdFile={setJdFile}
            onAnalyze={handleAnalyze}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MatchingDialog;
