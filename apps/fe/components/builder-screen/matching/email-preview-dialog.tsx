"use client";

import { Button } from "@resume-builder/ui/components/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@resume-builder/ui/components/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@resume-builder/ui/components/tooltip";
import {
  Check,
  ClipboardCheck,
  ClipboardCopy,
  Pencil,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { useTranslations } from "next-intl";
import React from "react";

import { type GenerateEmailResponse } from "@/types/resume.type";

interface EmailPreviewDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  emailResult: GenerateEmailResponse | null;
  isGenerating: boolean;
  onRegenerate: () => void;
  onCopy: () => void;
  isCopied: boolean;
  onCopySubject: () => void;
  isSubjectCopied: boolean;
  onEmailUpdate?: (updated: GenerateEmailResponse) => void;
}

const splitIntoParagraphs = (body: string): string[] => {
  // Force a paragraph break between sign-off and the candidate's name
  // if they are generated on the same line or separated by a single newline.
  const formattedBody = body.replace(
    /(Sincerely|Best regards|Regards|Thank you|Warm regards|Trân trọng|Thân mến)(,?)\s+([^\n.]{2,40})$/i,
    "$1$2\n$3",
  );

  return formattedBody
    .split(/\n\n+/)
    .filter(Boolean)
    .map((p) => p.trim());
};

export const EmailPreviewDialog = ({
  isOpen,
  onOpenChange,
  emailResult,
  isGenerating,
  onRegenerate,
  onCopy,
  isCopied,
  onCopySubject,
  isSubjectCopied,
  onEmailUpdate,
}: EmailPreviewDialogProps) => {
  const t = useTranslations("Matching");
  const [isEditing, setIsEditing] = React.useState(false);
  const [editedSubject, setEditedSubject] = React.useState("");
  const [editedBody, setEditedBody] = React.useState("");
  const bodyRef = React.useRef<HTMLTextAreaElement>(null);

  // Sync local edit state when emailResult changes
  React.useEffect(() => {
    if (emailResult) {
      setEditedSubject(emailResult.subject);
      setEditedBody(emailResult.body);
    }
  }, [emailResult]);

  // Reset edit mode when dialog closes
  React.useEffect(() => {
    if (!isOpen) setIsEditing(false);
  }, [isOpen]);

  // Auto-resize textarea
  React.useEffect(() => {
    if (isEditing && bodyRef.current) {
      bodyRef.current.style.height = "auto";
      bodyRef.current.style.height = `${bodyRef.current.scrollHeight}px`;
    }
  }, [isEditing, editedBody]);

  const handleSaveEdit = () => {
    setIsEditing(false);
    onEmailUpdate?.({ subject: editedSubject, body: editedBody });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (emailResult) {
      setEditedSubject(emailResult.subject);
      setEditedBody(emailResult.body);
    }
  };

  // Use edited content for display
  const displaySubject = isEditing
    ? editedSubject
    : (emailResult?.subject ?? "");
  const displayBody = isEditing ? editedBody : (emailResult?.body ?? "");

  const paragraphs = React.useMemo(
    () => (displayBody ? splitIntoParagraphs(displayBody) : []),
    [displayBody],
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={`
          flex max-h-[90vh] w-full max-w-3xl flex-col gap-0 overflow-hidden
          border-none p-0 shadow-2xl
          sm:rounded-2xl
          md:max-w-4xl
        `}
      >
        {/* Header Section */}
        <div
          className={`
            gradient-bg relative flex shrink-0 flex-col px-4 py-4 text-white
            md:px-8 md:py-8
          `}
        >
          {/* Decorative Elements */}
          <div
            className={`
              pointer-events-none absolute -top-12 -right-12 h-40 w-40
              rounded-full bg-white/[0.07] blur-2xl
            `}
          />
          <div
            className={`
              pointer-events-none absolute bottom-0 left-1/4 h-24 w-24
              rounded-full bg-white/4 blur-xl
            `}
          />

          <div
            className={`relative z-10 flex items-start justify-between gap-4`}
          >
            <div
              className={`
                flex items-center gap-3
                sm:gap-4
              `}
            >
              <div
                className={`
                  flex h-10 w-10 shrink-0 items-center justify-center
                  rounded-2xl bg-white/20 shadow-inner backdrop-blur-md
                  sm:h-12 sm:w-12
                `}
              >
                <Sparkles
                  size={24}
                  className={`
                    h-5 w-5 text-white drop-shadow-md
                    sm:h-6 sm:w-6
                  `}
                />
              </div>
              <div className="flex flex-col">
                <DialogTitle
                  className={`
                    text-lg font-bold tracking-tight text-white drop-shadow-sm
                    sm:text-2xl
                  `}
                >
                  {t("email.dialogTitle")}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  {t("email.dialogDescription")}
                </DialogDescription>
                <p
                  className={`
                    mt-0.5 text-xs font-medium text-white/70
                    sm:mt-1 sm:text-sm
                  `}
                >
                  {t("email.ready")}
                </p>
              </div>
            </div>

            {/* Actions for generated email */}
            {emailResult && (
              <TooltipProvider delayDuration={200}>
                <div
                  className={`
                    flex shrink-0 items-center gap-1 rounded-xl bg-white/10 p-1
                    backdrop-blur-sm
                    sm:gap-2
                  `}
                >
                  {/* Edit / Save toggle */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={
                          isEditing ? handleSaveEdit : () => setIsEditing(true)
                        }
                        disabled={isGenerating}
                        className={`
                          h-8 w-8 rounded-lg text-white
                          hover:bg-white/20
                          sm:h-10 sm:w-10
                          ${isEditing ? "bg-white/20" : ""}
                        `}
                      >
                        {isEditing ? <Check size={16} /> : <Pencil size={16} />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {isEditing ? t("email.saveChanges") : t("email.edit")}
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={onRegenerate}
                        disabled={isGenerating || isEditing}
                        className={`
                          h-8 w-8 rounded-lg text-white
                          hover:bg-white/20
                          sm:h-10 sm:w-10
                        `}
                      >
                        <RefreshCw size={16} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{t("email.regenerate")}</TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>
            )}
          </div>

          {emailResult && (
            <div
              className={`
                relative z-10 mt-6 rounded-xl border border-white/10 bg-white/10
                px-4 py-3 backdrop-blur-sm
              `}
            >
              <div
                className={`
                  flex items-center gap-3 text-sm
                  md:text-base
                `}
              >
                <span
                  className={`
                    hidden shrink-0 text-white/60
                    md:block
                  `}
                >
                  {t("email.subject")}
                </span>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedSubject}
                    onChange={(e) => setEditedSubject(e.target.value)}
                    className={`
                      flex-1 rounded-lg border border-white/20 bg-white/10 px-3
                      py-1.5 font-semibold text-white backdrop-blur-sm
                      outline-none
                      placeholder:text-white/40
                      focus:border-white/40 focus:ring-1 focus:ring-white/30
                    `}
                    placeholder={t("email.subjectPlaceholder")}
                  />
                ) : (
                  <span className={`flex-1 font-semibold`}>
                    {displaySubject}
                  </span>
                )}
                {!isEditing && (
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={onCopySubject}
                          className={`
                            h-7 w-7 shrink-0 rounded-md transition-all
                            ${
                              isSubjectCopied
                                ? "bg-white/30 text-white"
                                : `
                                  text-white
                                  hover:bg-white/20
                                `
                            }
                          `}
                        >
                          {isSubjectCopied ? (
                            <ClipboardCheck size={14} />
                          ) : (
                            <ClipboardCopy size={14} />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {isSubjectCopied
                          ? t("email.copied")
                          : t("email.copySubject")}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div
          className={`
            bg-background relative flex min-h-[300px] flex-1 flex-col
            overflow-hidden
            sm:min-h-[400px]
          `}
        >
          {emailResult ? (
            <>
              <div
                className={`
                  scrollbar-thin flex-1 overflow-y-auto px-4 py-4
                  sm:px-8 sm:py-8
                `}
              >
                {isEditing ? (
                  <textarea
                    ref={bodyRef}
                    value={editedBody}
                    onChange={(e) => setEditedBody(e.target.value)}
                    className={`
                      text-foreground/80 min-h-[300px] w-full resize-none
                      border-none bg-transparent p-0 text-[15px] leading-relaxed
                      outline-none
                    `}
                    placeholder={t("email.bodyPlaceholder")}
                  />
                ) : (
                  <div className="space-y-5">
                    {paragraphs.map((paragraph, i) => (
                      <p
                        key={i}
                        className={`
                          text-foreground/80 text-[15px] leading-relaxed
                          whitespace-pre-wrap
                        `}
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div
                className={`
                  border-border/40 bg-muted/30 flex flex-col-reverse justify-end
                  gap-3 border-t px-6 py-4
                  sm:flex-row sm:gap-4 sm:px-8
                `}
              >
                {isEditing ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={handleCancelEdit}
                      className={`
                        h-12 w-full gap-2 px-8 shadow-md transition-all
                        sm:w-auto
                      `}
                    >
                      {t("email.cancel")}
                    </Button>
                    <Button
                      onClick={handleSaveEdit}
                      className={`
                        h-12 w-full gap-2 px-8 shadow-md transition-all
                        sm:w-auto
                      `}
                    >
                      <Check size={18} />
                      {t("email.saveChanges")}
                    </Button>
                  </>
                ) : (
                  <>
                    <DialogClose asChild>
                      <Button
                        variant="outline"
                        className={`
                          h-12 w-full gap-2 px-8 shadow-md transition-all
                          sm:w-auto
                        `}
                      >
                        {t("email.close")}
                      </Button>
                    </DialogClose>

                    <Button
                      onClick={onCopy}
                      className={`
                        h-12 w-full gap-2 px-8 shadow-md transition-all
                        sm:w-auto
                        ${
                          isCopied
                            ? `
                              bg-green-600! text-white!
                              hover:bg-green-700!
                            `
                            : `
                              bg-primary! text-primary-foreground!
                              hover:bg-primary/90!
                            `
                        }
                      `}
                    >
                      {isCopied ? (
                        <>
                          <ClipboardCheck size={18} />
                          {t("email.copied")}
                        </>
                      ) : (
                        <>
                          <ClipboardCopy size={18} />
                          {t("email.copyToClipboard")}
                        </>
                      )}
                    </Button>
                  </>
                )}
              </div>
            </>
          ) : (
            <div
              className={`
                absolute inset-0 flex flex-col items-center justify-center gap-4
              `}
            >
              <p className="text-muted-foreground text-sm">
                {t("email.displayFailed")}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
