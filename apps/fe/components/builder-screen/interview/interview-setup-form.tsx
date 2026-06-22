'use client';

import { Button } from '@resume-builder/ui/components/button';
import { Label } from '@resume-builder/ui/components/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@resume-builder/ui/components/select';
import { Separator } from '@resume-builder/ui/components/separator';
import { Slider } from '@resume-builder/ui/components/slider';
import { Textarea } from '@resume-builder/ui/components/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@resume-builder/ui/components/tooltip';
import { cn } from '@resume-builder/ui/lib/utils';
import {
  AlertCircle,
  Code,
  Globe,
  Info,
  Loader2,
  Mic,
  Shuffle,
  Users,
  Volume2,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import React, { useState } from 'react';

import {
  INTERVIEW_TYPE_DEFAULT,
  LANGUAGE_DEFAULT,
  LANGUAGE_OPTIONS,
  QUESTION_COUNT_DEFAULT,
  QUESTION_COUNT_MAX,
  QUESTION_COUNT_MIN,
  SPEECH_RATE_DEFAULT,
  SPEECH_RATE_MAX,
  SPEECH_RATE_MIN,
  SPEECH_RATE_STEP,
  VOICE_DEFAULT,
  VOICE_OPTIONS,
} from '@/constants/interview.constant';
import { useSyncResume } from '@/hooks/use-sync-resume';
import { type InterviewConfig, InterviewType } from '@/types/interview.type';

const INTERVIEW_TYPE_CARDS = [
  {
    value: InterviewType.ALL,
    labelKey: 'setup.types.all.label',
    icon: Shuffle,
    descriptionKey: 'setup.types.all.description',
  },
  {
    value: InterviewType.BEHAVIORAL,
    labelKey: 'setup.types.behavioral.label',
    icon: Users,
    descriptionKey: 'setup.types.behavioral.description',
  },
  {
    value: InterviewType.TECHNICAL,
    labelKey: 'setup.types.technical.label',
    icon: Code,
    descriptionKey: 'setup.types.technical.description',
  },
] as const;

interface InterviewSetupFormProps {
  onStart: (config: InterviewConfig) => Promise<void>;
  error: string | null;
  onRetry: () => void;
}

export const InterviewSetupForm = ({
  onStart,
  error,
  onRetry,
}: InterviewSetupFormProps) => {
  const t = useTranslations('Interview');
  const [jdText, setJdText] = useState('');
  const [questionCount, setQuestionCount] = useState(QUESTION_COUNT_DEFAULT);
  const [interviewType, setInterviewType] = useState<InterviewType>(
    INTERVIEW_TYPE_DEFAULT,
  );
  const [voiceName, setVoiceName] = useState(VOICE_DEFAULT);
  const [language, setLanguage] = useState(LANGUAGE_DEFAULT);
  const [speechRate, setSpeechRate] = useState(SPEECH_RATE_DEFAULT);
  const [isStarting, setIsStarting] = useState(false);

  const { sync, isSyncing } = useSyncResume();

  const handleStart = async () => {
    if (!jdText.trim()) return;

    setIsStarting(true);
    try {
      // Sync resume to backend first
      const synced = await sync();
      if (!synced) {
        setIsStarting(false);
        return;
      }

      await onStart({
        jobDescription: jdText,
        questionCount,
        interviewType,
        voiceName,
        language,
        speechRate,
      });
    } finally {
      setIsStarting(false);
    }
  };

  const isLoading = isStarting || isSyncing;
  const hasInput = jdText.trim().length > 0;

  return (
    <TooltipProvider delayDuration={300}>
      <div className='space-y-5 pt-2'>
        {/* Error Banner */}
        {error && (
          <div
            className={`flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900/50 dark:bg-red-950/20`}
          >
            <AlertCircle className='mt-0.5 h-4 w-4 shrink-0 text-red-500' />
            <div className='flex-1'>
              <p
                className={`text-sm font-medium text-red-800 dark:text-red-200`}
              >
                {error}
              </p>
              <Button
                variant='link'
                size='sm'
                className={`mt-1 h-auto p-0 text-red-600 dark:text-red-400`}
                onClick={onRetry}
              >
                {t('setup.tryAgain')}
              </Button>
            </div>
          </div>
        )}

        {/* Job Description */}
        <div className='space-y-1.5'>
          <Label className='text-sm font-medium'>
            {t('setup.jobDescription')}
          </Label>
          <Textarea
            className='h-32 resize-none scrollbar-thin overflow-y-auto text-sm'
            placeholder={t('setup.jobDescriptionPlaceholder')}
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            disabled={isLoading}
          />
          <p className='text-muted-foreground text-xs'>
            {t('setup.jobDescriptionHelp')}
          </p>
        </div>

        <Separator />

        {/* Interview Type — Card Selection */}
        <div className='space-y-2'>
          <Label className='text-sm font-medium'>
            {t('setup.interviewType')}
          </Label>
          <div className='grid grid-cols-3 gap-2'>
            {INTERVIEW_TYPE_CARDS.map((card) => {
              const Icon = card.icon;
              const isSelected = interviewType === card.value;
              return (
                <button
                  key={card.value}
                  type='button'
                  disabled={isLoading}
                  onClick={() => setInterviewType(card.value)}
                  className={cn(
                    `flex flex-col items-center gap-1.5 rounded-lg border-2 px-3 py-3 transition-all`,
                    'hover:border-primary/50 hover:bg-primary/5',
                    'disabled:pointer-events-none disabled:opacity-50',
                    isSelected
                      ? 'border-primary bg-primary/10 text-primary shadow-sm'
                      : 'border-muted bg-background text-muted-foreground',
                  )}
                >
                  <Icon
                    size={20}
                    className={cn(
                      isSelected ? 'text-primary' : 'text-muted-foreground',
                    )}
                  />
                  <span className='text-xs font-semibold'>
                    {t(card.labelKey)}
                  </span>
                  <span
                    className={cn(
                      'text-[10px] leading-tight',
                      isSelected
                        ? 'text-primary/70'
                        : 'text-muted-foreground/70',
                    )}
                  >
                    {t(card.descriptionKey)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Questions Count + Speech Speed — Side by side */}
        <div className='grid grid-cols-2 gap-4'>
          {/* Number of Questions */}
          <div className='space-y-2.5'>
            <div className='flex items-center justify-between'>
              <Label className='text-sm font-medium'>
                {t('setup.questions')}
              </Label>
              <span
                className={`bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-bold tabular-nums`}
              >
                {questionCount}
              </span>
            </div>
            <Slider
              value={[questionCount]}
              onValueChange={(val) =>
                setQuestionCount(val[0] ?? QUESTION_COUNT_DEFAULT)
              }
              min={QUESTION_COUNT_MIN}
              max={QUESTION_COUNT_MAX}
              step={1}
              disabled={isLoading}
            />
            <div
              className={`text-muted-foreground flex justify-between text-[10px]`}
            >
              <span>{QUESTION_COUNT_MIN}</span>
              <span>{QUESTION_COUNT_MAX}</span>
            </div>
          </div>

          {/* Speech Speed */}
          <div className='space-y-2.5'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-1'>
                <Label className='text-sm font-medium'>
                  {t('setup.speed')}
                </Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info size={12} className='text-muted-foreground' />
                  </TooltipTrigger>
                  <TooltipContent side='top' className='max-w-52 text-xs'>
                    {t('setup.speedTooltip')}
                  </TooltipContent>
                </Tooltip>
              </div>
              <span
                className={`bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-bold tabular-nums`}
              >
                {speechRate.toFixed(1)}x
              </span>
            </div>
            <Slider
              value={[speechRate]}
              onValueChange={(val) =>
                setSpeechRate(val[0] ?? SPEECH_RATE_DEFAULT)
              }
              min={SPEECH_RATE_MIN}
              max={SPEECH_RATE_MAX}
              step={SPEECH_RATE_STEP}
              disabled={isLoading}
            />
            <div
              className={`text-muted-foreground flex justify-between text-[10px]`}
            >
              <span>{t('setup.slow')}</span>
              <span>{t('setup.fast')}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Language + Voice — Side by side */}
        <div className='grid grid-cols-2 gap-4'>
          {/* Language */}
          <div className='space-y-1.5'>
            <div className='flex items-center gap-1.5'>
              <Globe size={14} className='text-muted-foreground' />
              <Label className='text-sm font-medium'>
                {t('setup.language')}
              </Label>
            </div>
            <Select
              value={language}
              onValueChange={setLanguage}
              disabled={isLoading}
            >
              <SelectTrigger
                className={`focus:border-primary focus:ring-primary/50 h-9 w-full text-sm`}
              >
                <SelectValue placeholder={t('setup.selectLanguage')} />
              </SelectTrigger>
              <SelectContent align='start' side='bottom'>
                {LANGUAGE_OPTIONS.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className='focus:bg-primary/10 focus:text-primary'
                  >
                    {t(`setup.languages.${option.value}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Voice */}
          <div className='space-y-1.5'>
            <div className='flex items-center gap-1.5'>
              <Volume2 size={14} className='text-muted-foreground' />
              <Label className='text-sm font-medium'>{t('setup.voice')}</Label>
            </div>
            <Select
              value={voiceName}
              onValueChange={setVoiceName}
              disabled={isLoading}
            >
              <SelectTrigger
                className={`focus:border-primary focus:ring-primary/50 h-9 w-full text-sm`}
              >
                <SelectValue placeholder={t('setup.selectVoice')} />
              </SelectTrigger>
              <SelectContent align='start' className='max-h-40'>
                {VOICE_OPTIONS.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className='focus:bg-primary/10 focus:text-primary'
                  >
                    {t(`setup.voices.${option.value}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Start Button */}
        <div className='pt-1'>
          <Button
            onClick={handleStart}
            disabled={!hasInput || isLoading}
            className='w-full'
            variant='gradient'
          >
            {isLoading ? (
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            ) : (
              <Mic className='mr-2 h-4 w-4' />
            )}
            {isSyncing
              ? t('setup.savingResume')
              : isStarting
                ? t('setup.starting')
                : t('setup.start')}
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
};
