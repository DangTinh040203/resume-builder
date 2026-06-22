"use client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@resume-builder/ui/components/accordion";
import { Badge } from "@resume-builder/ui/components/badge";
import { Button } from "@resume-builder/ui/components/button";
import { ScrollArea } from "@resume-builder/ui/components/scroll-area";
import { toast } from "@resume-builder/ui/components/sonner";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@resume-builder/ui/components/tabs";
import { AxiosError } from "axios";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Lightbulb,
  Loader2,
  Mail,
  RefreshCw,
  Search,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useTranslations } from "next-intl";
import React from "react";

import { EmailPreviewDialog } from "@/components/builder-screen/matching/email-preview-dialog";
import { ScoreGauge } from "@/components/builder-screen/score-gauge";
import { useService } from "@/hooks/use-http";
import { ResumeService } from "@/services/resume.service";
import { type ErrorResponse } from "@/types/error.response";
import {
  type GenerateEmailResponse,
  type MatchResult,
} from "@/types/resume.type";
import { toastErrorMessage } from "@/utils/toast-error-message.util";

interface MatchingResultProps {
  matchResult: MatchResult;
  onReset: () => void;
  jdText: string;
  resumeId: string;
}

export const MatchingResult = ({
  matchResult,
  onReset,
  jdText,
  resumeId,
}: MatchingResultProps) => {
  const t = useTranslations("Matching");
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isCopied, setIsCopied] = React.useState(false);
  const [isSubjectCopied, setIsSubjectCopied] = React.useState(false);
  const [emailResult, setEmailResult] =
    React.useState<GenerateEmailResponse | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const resumeService = useService(ResumeService);

  const getScoreLabel = (score: number) => {
    if (score >= 80) {
      return { label: t("result.score.excellent"), color: "text-green-500" };
    }
    if (score >= 60) {
      return { label: t("result.score.good"), color: "text-blue-500" };
    }
    if (score >= 40) {
      return { label: t("result.score.fair"), color: "text-yellow-500" };
    }
    return {
      label: t("result.score.needsImprovement"),
      color: "text-red-500",
    };
  };

  const overallStatus = getScoreLabel(matchResult.overallScore);

  const handleGenerateEmail = async () => {
    setIsDialogOpen(false);
    setIsGenerating(true);
    try {
      const result = await resumeService.generateEmail(
        resumeId,
        jdText,
        matchResult,
      );
      setEmailResult(result);
      setIsDialogOpen(true);
    } catch (e) {
      if (e instanceof AxiosError) {
        const error = e.response?.data as ErrorResponse;
        toastErrorMessage(error.message);
      } else {
        toast.error(t("email.generateFailed"));
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyEmail = async () => {
    if (!emailResult) return;

    try {
      await navigator.clipboard.writeText(emailResult.body);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      toast.error(t("email.copyFailed"));
    }
  };

  const handleCopySubject = async () => {
    if (!emailResult) return;

    try {
      await navigator.clipboard.writeText(emailResult.subject);
      setIsSubjectCopied(true);
      toast.success(t("email.subjectCopied"));
      setTimeout(() => setIsSubjectCopied(false), 2000);
    } catch {
      toast.error(t("email.copyFailed"));
    }
  };

  return (
    <ScrollArea className="scrollbar-thin max-h-[80vh] pr-4">
      <div className="space-y-4 pb-4">
        {/* Overall Score Summary - Always visible */}
        <div
          className={`
            border-border/50 bg-background flex items-center gap-5 gap-6
            rounded-xl border p-5
          `}
        >
          <div className="shrink-0">
            <ScoreGauge score={matchResult.overallScore} />
          </div>
          <div className="flex-1 space-y-1.5">
            <h3
              className={`
                text-lg font-bold tracking-tight
                ${overallStatus.color}
              `}
            >
              {overallStatus.label}
            </h3>
            <p className={`text-muted-foreground text-sm leading-relaxed`}>
              {matchResult.summary}
            </p>
          </div>
        </div>

        {/* Tabbed Content */}
        <Tabs defaultValue="breakdown" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="breakdown" className="gap-1.5">
              <TrendingUp size={15} />
              {t("result.tabs.breakdown")}
            </TabsTrigger>
            <TabsTrigger value="analysis" className="gap-1.5">
              <Search size={15} />
              {t("result.tabs.analysis")}
            </TabsTrigger>
            <TabsTrigger value="improve" className="gap-1.5">
              <Lightbulb size={15} />
              {t("result.tabs.improve")}
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Score Breakdown */}
          <TabsContent value="breakdown" className="space-y-3 pt-2">
            <Accordion type="single" collapsible className="w-full space-y-3">
              {matchResult.criteria.map((criterion) => {
                const scoreColor =
                  criterion.score < 50
                    ? "border-l-red-500"
                    : criterion.score <= 80
                      ? "border-l-yellow-500"
                      : "border-l-green-500";
                const scoreBg =
                  criterion.score < 50
                    ? "bg-red-500/10 text-red-600 dark:text-red-400"
                    : criterion.score <= 80
                      ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                      : "bg-green-500/10 text-green-600 dark:text-green-400";

                return (
                  <AccordionItem
                    key={criterion.name}
                    value={criterion.name}
                    className={`
                      border-primary/20 overflow-hidden rounded-xl border
                      border-l-[3px] shadow-sm transition-all
                      hover:border-primary/40 hover:shadow-md
                      ${scoreColor}
                    `}
                  >
                    <AccordionTrigger
                      className={`
                        px-4 py-4
                        hover:no-underline
                      `}
                    >
                      <div className="flex w-full flex-col gap-3 pr-4">
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-foreground text-sm font-semibold`}
                          >
                            {criterion.name}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className={`text-muted-foreground text-xs`}>
                              {t("result.weight", {
                                weight: criterion.weight,
                              })}
                            </span>
                            <span
                              className={`
                                rounded-full px-2.5 py-0.5 text-xs font-bold
                                ${scoreBg}
                              `}
                            >
                              {criterion.score}%
                            </span>
                          </div>
                        </div>
                        {/* Inline mini progress bar */}
                        <div
                          className={`
                            bg-primary/10 h-1.5 w-full overflow-hidden
                            rounded-full
                          `}
                        >
                          <div
                            className={`
                              h-full rounded-full transition-all duration-500
                            `}
                            style={{
                              width: `${criterion.score}%`,
                              backgroundColor:
                                criterion.score < 50
                                  ? "#ef4444"
                                  : criterion.score <= 80
                                    ? "#eab308"
                                    : "#22c55e",
                            }}
                          />
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pt-0 pb-4">
                      <p
                        className={`
                          text-muted-foreground border-primary/15 border-t pt-3
                          text-sm leading-relaxed
                        `}
                      >
                        {criterion.explanation}
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </TabsContent>

          {/* Tab 2: Strengths & Missing Keywords */}
          <TabsContent value="analysis" className="space-y-4 pt-2">
            {/* Strengths */}
            <div
              className={`
                rounded-xl border border-green-200/60 bg-green-50/50 p-5
                dark:border-green-900/50 dark:bg-green-950/20
              `}
            >
              <div className="flex items-center gap-2 pb-4">
                <CheckCircle2
                  size={18}
                  className={`
                    text-green-600
                    dark:text-green-500
                  `}
                />
                <h4
                  className={`
                    text-xs font-bold tracking-wider text-green-700 uppercase
                    dark:text-green-400
                  `}
                >
                  {t("result.strengths")}
                </h4>
              </div>
              <ul className="space-y-3">
                {(matchResult.strengths || []).length > 0 ? (
                  matchResult.strengths!.map((strength, i) => (
                    <li
                      key={i}
                      className={`
                        flex items-start gap-2 text-sm text-green-900
                        dark:text-green-200
                      `}
                    >
                      <Check
                        size={16}
                        className="mt-0.5 shrink-0 text-green-500"
                      />
                      <span className="leading-tight">{strength}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-green-700/70 italic">
                    {t("result.noStrengths")}
                  </li>
                )}
              </ul>
            </div>

            {/* Missing Keywords */}
            <div
              className={`
                rounded-xl border border-red-200/60 bg-red-50/50 p-5
                dark:border-red-900/50 dark:bg-red-950/20
              `}
            >
              <div className="flex items-center gap-2 pb-4">
                <AlertCircle size={18} className="text-red-500" />
                <h4
                  className={`
                    text-xs font-bold tracking-wider text-red-700 uppercase
                    dark:text-red-400
                  `}
                >
                  {t("result.missingKeywords")}
                </h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {matchResult.missingKeywords.length > 0 ? (
                  matchResult.missingKeywords.map((keyword) => (
                    <Badge
                      key={keyword}
                      variant="secondary"
                      className={`
                        border-transparent bg-red-100 font-normal text-red-700
                        hover:bg-red-200
                        dark:bg-red-900/40 dark:text-red-300
                      `}
                    >
                      {keyword}
                    </Badge>
                  ))
                ) : (
                  <Badge
                    variant="secondary"
                    className="bg-red-100 font-normal text-red-700"
                  >
                    {t("result.invalidJobDescription")}
                  </Badge>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Tab 3: Suggestions */}
          <TabsContent value="improve" className="space-y-4 pt-2">
            {matchResult.suggestions.length > 0 ? (
              <div
                className={`
                  rounded-xl border border-amber-200/60 bg-amber-50/50 p-5
                  dark:border-amber-900/50 dark:bg-amber-950/20
                `}
              >
                <div className="flex items-center gap-2 pb-4">
                  <Lightbulb size={18} className="text-amber-500" />
                  <h4
                    className={`
                      text-xs font-bold tracking-wider text-amber-700 uppercase
                      dark:text-amber-400
                    `}
                  >
                    {t("result.suggestionsToImprove")}
                  </h4>
                </div>
                <ul className="space-y-3">
                  {matchResult.suggestions.map((suggestion, i) => (
                    <li
                      key={i}
                      className={`
                        flex items-start gap-3 text-sm text-amber-900
                        dark:text-amber-200
                      `}
                    >
                      <div
                        className={`
                          mt-1.5 flex h-5 w-5 shrink-0 items-center
                          justify-center rounded-full bg-amber-200/60
                          text-[10px] font-bold text-amber-700
                          dark:bg-amber-900/60 dark:text-amber-400
                        `}
                      >
                        {i + 1}
                      </div>
                      <span className="pt-0.5 leading-relaxed">
                        {suggestion}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div
                className={`
                  text-muted-foreground flex flex-col items-center
                  justify-center rounded-xl border p-8 text-sm italic
                `}
              >
                {t("result.noSuggestions")}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <EmailPreviewDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          emailResult={emailResult}
          isGenerating={isGenerating}
          onRegenerate={handleGenerateEmail}
          onCopy={handleCopyEmail}
          isCopied={isCopied}
          onCopySubject={handleCopySubject}
          isSubjectCopied={isSubjectCopied}
          onEmailUpdate={(updated) => setEmailResult(updated)}
        />

        {/* Action Buttons */}
        <div
          className={`
            flex flex-col gap-3 pt-2
            sm:flex-row
          `}
        >
          <Button
            variant="outline"
            className={`
              text-foreground group h-12 flex-1 gap-2.5 rounded-xl border
              shadow-sm transition-all duration-200
              hover:border-border hover:bg-muted/50 hover:shadow-md
            `}
            onClick={onReset}
          >
            <RefreshCw
              size={17}
              className={`
                text-muted-foreground transition-colors
                group-hover:text-foreground
              `}
            />
            <span className="text-sm font-medium">
              {t("result.analyzeAnother")}
            </span>
          </Button>

          <Button
            className={`
              group relative h-12 flex-1 gap-2.5 overflow-hidden rounded-xl
              shadow-md transition-all duration-200
              hover:shadow-lg
              active:scale-[0.98]
            `}
            onClick={() => {
              if (emailResult) {
                setIsDialogOpen(true);
              } else {
                handleGenerateEmail();
              }
            }}
            disabled={isGenerating || matchResult.overallScore === 0}
          >
            {/* Shimmer effect on initial state */}
            {!emailResult && !isGenerating && (
              <span
                className={`
                  pointer-events-none absolute inset-0 -translate-x-full
                  animate-[btn-shine_3s_ease-in-out_infinite] bg-linear-to-r
                  from-transparent via-white/15 to-transparent
                `}
              />
            )}
            {isGenerating ? (
              <>
                <Loader2 size={17} className="animate-spin" />
                <span className="text-sm font-medium">
                  {t("email.generating")}
                </span>
              </>
            ) : emailResult ? (
              <>
                <Mail
                  size={17}
                  className={`
                    mt-0.5 transition-transform
                    group-hover:translate-x-0.5 group-hover:-translate-y-0.5
                  `}
                />
                <span className="text-sm font-medium">{t("email.view")}</span>
              </>
            ) : (
              <>
                <Sparkles size={17} />
                <span className="text-sm font-medium">
                  {t("email.generate")}
                </span>
              </>
            )}
          </Button>
        </div>
      </div>
    </ScrollArea>
  );
};
