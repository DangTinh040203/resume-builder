'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@resume-builder/ui/components/alert-dialog';
import { Button } from '@resume-builder/ui/components/button';
import { Progress } from '@resume-builder/ui/components/progress';
import { motion } from 'framer-motion';
import { Mic, MicOff, Square } from 'lucide-react';
import { useTranslations } from 'next-intl';
import React, { useCallback, useEffect, useRef } from 'react';

interface InterviewActiveProps {
  isAISpeaking: boolean;
  isMuted: boolean;
  questionProgress: { current: number; total: number };
  elapsedTime: number;
  analyserNode: AnalyserNode | null;
  playbackAnalyserNode: AnalyserNode | null;
  onStop: () => void;
  onToggleMute: () => void;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export const InterviewActive = ({
  isAISpeaking,
  isMuted,
  questionProgress,
  elapsedTime,
  analyserNode,
  playbackAnalyserNode,
  onStop,
  onToggleMute,
}: InterviewActiveProps) => {
  const t = useTranslations('Interview');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  // ─── Voice Wave Visualization ─────────────────────────
  const drawWave = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');

    if (!canvas || !ctx) {
      animationRef.current = requestAnimationFrame(drawWave);
      return;
    }

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Use playback analyser when AI is speaking, mic analyser otherwise
    const activeAnalyser = isAISpeaking ? playbackAnalyserNode : analyserNode;

    if (!activeAnalyser) {
      animationRef.current = requestAnimationFrame(drawWave);
      return;
    }

    const bufferLength = activeAnalyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    activeAnalyser.getByteFrequencyData(dataArray);

    const barCount = 48;
    const barWidth = (width / barCount) * 0.6;
    const gap = (width / barCount) * 0.4;
    const step = Math.floor(bufferLength / barCount);

    for (let i = 0; i < barCount; i++) {
      const value = dataArray[i * step] ?? 0;
      const barHeight = (value / 255) * (height * 0.8) + 4;

      const x = i * (barWidth + gap) + gap / 2;
      const y = (height - barHeight) / 2;

      // Color: primary when user speaking, amber when AI speaking
      if (isAISpeaking) {
        ctx.fillStyle = `hsla(45, 93%, 55%, ${0.5 + (value / 255) * 0.5})`;
      } else if (isMuted) {
        ctx.fillStyle = `hsla(0, 0%, 60%, 0.4)`;
      } else {
        ctx.fillStyle = `hsla(262, 83%, 58%, ${0.4 + (value / 255) * 0.6})`;
      }

      // Draw rounded bar
      const radius = Math.min(barWidth / 2, 3);
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + barWidth - radius, y);
      ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius);
      ctx.lineTo(x + barWidth, y + barHeight - radius);
      ctx.quadraticCurveTo(
        x + barWidth,
        y + barHeight,
        x + barWidth - radius,
        y + barHeight,
      );
      ctx.lineTo(x + radius, y + barHeight);
      ctx.quadraticCurveTo(x, y + barHeight, x, y + barHeight - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.fill();
    }

    animationRef.current = requestAnimationFrame(drawWave);
  }, [analyserNode, playbackAnalyserNode, isAISpeaking, isMuted]);

  useEffect(() => {
    animationRef.current = requestAnimationFrame(drawWave);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [drawWave]);

  // Handle canvas resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      }
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  const progressPercent =
    questionProgress.total > 0
      ? (questionProgress.current / questionProgress.total) * 100
      : 0;

  return (
    <div className='flex flex-col items-center gap-6 py-4'>
      {/* Voice Wave */}
      <div className='relative w-full'>
        <div
          className={`border-border/50 to-muted/30 relative flex items-center justify-center overflow-hidden rounded-2xl border bg-gradient-to-b from-transparent p-6`}
        >
          <canvas
            ref={canvasRef}
            className='mx-auto h-32 w-full'
            style={{ width: '100%', height: '128px' }}
          />
        </div>
      </div>

      {/* Status */}
      <motion.div
        className='flex flex-col items-center gap-1'
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className='flex items-center gap-2'>
          <span
            className={`h-2 w-2 rounded-full ${
              isAISpeaking
                ? 'bg-amber-500'
                : isMuted
                  ? 'bg-gray-400'
                  : 'bg-green-500'
            } `}
          />
          <span className='text-sm font-medium'>
            {isAISpeaking
              ? t('active.aiSpeaking')
              : isMuted
                ? t('active.muted')
                : t('active.listening')}
          </span>
        </div>
      </motion.div>

      {/* Question Progress */}
      <div className='w-full max-w-sm space-y-2'>
        <div className='flex items-center justify-between text-sm'>
          <span className='text-muted-foreground'>{t('active.progress')}</span>
          <span className='font-semibold'>
            {t('active.questionProgress', {
              current: questionProgress.current,
              total: questionProgress.total,
            })}
          </span>
        </div>
        <Progress value={progressPercent} className='h-2' />
      </div>

      {/* Timer */}
      <div
        className={`text-muted-foreground font-mono text-2xl font-light tracking-wider`}
      >
        {formatTime(elapsedTime)}
      </div>

      {/* Controls */}
      <div className='flex items-center gap-4'>
        <Button
          variant={isMuted ? 'default' : 'outline'}
          size='lg'
          onClick={onToggleMute}
          disabled={isAISpeaking}
          className='gap-2'
        >
          {isMuted ? (
            <>
              <MicOff className='h-4 w-4' /> {t('active.unmute')}
            </>
          ) : (
            <>
              <Mic className='h-4 w-4' /> {t('active.mute')}
            </>
          )}
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size='lg' className='gap-2' variant={'default'}>
              <Square className='h-4 w-4' /> {t('active.stopInterview')}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('active.stopTitle')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('active.stopDescription')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('active.continue')}</AlertDialogCancel>
              <AlertDialogAction onClick={onStop}>
                {t('active.stopAndEvaluate')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};
