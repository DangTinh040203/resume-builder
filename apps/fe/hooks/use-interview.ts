'use client';

import { useSession } from '@clerk/nextjs';
import { toast } from '@resume-builder/ui/components/sonner';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef, useState } from 'react';

import { AUDIO_CONFIG } from '@/constants/interview.constant';
import { InterviewService } from '@/services/interview.service';
import type {
  InterviewConfig,
  InterviewFeedback,
  InterviewState,
  TurnCompleteData,
} from '@/types/interview.type';

export interface UseInterviewReturn {
  // State
  state: InterviewState;
  sessionId: string | null;
  questionProgress: { current: number; total: number };
  feedback: InterviewFeedback | null;
  error: string | null;
  isAISpeaking: boolean;
  isMuted: boolean;
  elapsedTime: number;

  // Actions
  startInterview: (config: InterviewConfig) => Promise<void>;
  stopInterview: () => void;
  toggleMute: () => void;
  reset: () => void;

  // Audio
  analyserNode: AnalyserNode | null;
  playbackAnalyserNode: AnalyserNode | null;
}

export function useInterview(): UseInterviewReturn {
  const t = useTranslations('Interview');
  const { session: clerkSession } = useSession();

  // ─── State ────────────────────────────────────────────
  const [state, setState] = useState<InterviewState>('idle');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questionProgress, setQuestionProgress] = useState({
    current: 0,
    total: 0,
  });
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);
  const [playbackAnalyserNode, setPlaybackAnalyserNode] =
    useState<AnalyserNode | null>(null);

  // ─── Refs ─────────────────────────────────────────────
  const serviceRef = useRef<InterviewService | null>(null);
  const captureCtxRef = useRef<AudioContext | null>(null);
  const playbackCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const playbackAnalyserRef = useRef<AnalyserNode | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMutedRef = useRef(false);
  const isAISpeakingRef = useRef(false);
  const speechRateRef = useRef(1.0);

  // Keep mute ref in sync with state
  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  // ─── Audio Playback (Gapless Scheduled) ───────────────
  const nextPlayTimeRef = useRef(0);
  const activeSourceCountRef = useRef(0);

  const scheduleAudioChunk = useCallback((pcmData: Float32Array) => {
    const ctx = playbackCtxRef.current;
    if (!ctx || pcmData.length === 0) return;

    // Ensure playback context is running (browsers may suspend it)
    if (ctx.state === 'suspended') {
      void ctx.resume();
    }

    const audioBuffer = ctx.createBuffer(
      1,
      pcmData.length,
      AUDIO_CONFIG.OUTPUT_SAMPLE_RATE,
    );
    audioBuffer.getChannelData(0).set(pcmData);

    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;

    // Apply speech rate (playback speed) from user config
    const rate = speechRateRef.current;
    source.playbackRate.value = rate;

    // Route through the playback analyser for waveform visualization
    if (playbackAnalyserRef.current) {
      source.connect(playbackAnalyserRef.current);
    } else {
      source.connect(ctx.destination);
    }

    // Schedule precisely: each chunk starts exactly where previous ended
    // Duration is adjusted by playback rate (faster rate = shorter duration)
    const startTime = Math.max(ctx.currentTime, nextPlayTimeRef.current);
    nextPlayTimeRef.current = startTime + audioBuffer.duration / rate;

    activeSourceCountRef.current++;
    setIsAISpeaking(true);
    isAISpeakingRef.current = true;

    source.onended = () => {
      activeSourceCountRef.current--;
      if (activeSourceCountRef.current <= 0) {
        activeSourceCountRef.current = 0;
        // Brief cooldown before re-enabling mic to let echo/reverb dissipate
        // and prevent Gemini's VAD from picking up leftover speaker output.
        setTimeout(() => {
          setIsAISpeaking(false);
          isAISpeakingRef.current = false;
          serviceRef.current?.sendPlaybackComplete();
        }, 300);
      }
    };

    source.start(startTime);
  }, []);

  const enqueueAudio = useCallback(
    (base64Audio: string) => {
      const binaryString = atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Ensure even byte length for Int16Array alignment
      const evenLength = bytes.length & ~1;
      if (evenLength === 0) return;

      // Convert 16-bit PCM to Float32
      const int16 = new Int16Array(
        bytes.buffer,
        bytes.byteOffset,
        evenLength / 2,
      );
      const float32 = new Float32Array(int16.length);
      for (let i = 0; i < int16.length; i++) {
        float32[i] = (int16[i] ?? 0) / 32768;
      }

      scheduleAudioChunk(float32);
    },
    [scheduleAudioChunk],
  );

  // ─── Audio Capture ────────────────────────────────────
  const startAudioCapture = useCallback(async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: AUDIO_CONFIG.INPUT_SAMPLE_RATE,
          channelCount: AUDIO_CONFIG.INPUT_CHANNELS,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      mediaStreamRef.current = stream;

      // Capture context at 16kHz for mic input
      const audioContext = new AudioContext({
        sampleRate: AUDIO_CONFIG.INPUT_SAMPLE_RATE,
      });
      captureCtxRef.current = audioContext;

      // Separate playback context at default sample rate for AI audio output
      const playbackCtx = new AudioContext();
      playbackCtxRef.current = playbackCtx;

      // Playback analyser for AI speech waveform visualization
      const playbackAnalyser = playbackCtx.createAnalyser();
      playbackAnalyser.fftSize = 256;
      playbackAnalyser.connect(playbackCtx.destination);
      playbackAnalyserRef.current = playbackAnalyser;
      setPlaybackAnalyserNode(playbackAnalyser);

      const source = audioContext.createMediaStreamSource(stream);
      sourceRef.current = source;

      // Analyser for voice wave visualization
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      setAnalyserNode(analyser);

      // Script processor for capturing raw PCM and sending to backend
      const processor = audioContext.createScriptProcessor(
        AUDIO_CONFIG.BUFFER_SIZE,
        AUDIO_CONFIG.INPUT_CHANNELS,
        AUDIO_CONFIG.INPUT_CHANNELS,
      );
      processorRef.current = processor;

      processor.onaudioprocess = (event) => {
        // Don't send mic audio while AI is speaking — prevents echo,
        // accidental interruption, and mic noise during AI output.
        if (isMutedRef.current || isAISpeakingRef.current) return;

        const inputData = event.inputBuffer.getChannelData(0);

        // Convert Float32 → Int16 PCM
        const int16 = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          const sample = inputData[i] ?? 0;
          const clamped = Math.max(-1, Math.min(1, sample));
          int16[i] = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
        }

        // Convert to base64 and send
        const uint8 = new Uint8Array(int16.buffer);
        let binary = '';
        for (let i = 0; i < uint8.length; i++) {
          binary += String.fromCharCode(uint8[i]!);
        }
        const base64 = btoa(binary);

        serviceRef.current?.sendAudio(base64);
      };

      source.connect(processor);
      processor.connect(audioContext.destination);

      return true;
    } catch {
      toast.error(t('errors.microphoneDenied'));
      return false;
    }
  }, [t]);

  const stopAudioCapture = useCallback(() => {
    processorRef.current?.disconnect();
    processorRef.current = null;

    sourceRef.current?.disconnect();
    sourceRef.current = null;

    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;

    // Don't close AudioContext here — playback may still need it
    setAnalyserNode(null);
    setPlaybackAnalyserNode(null);
    playbackAnalyserRef.current = null;
  }, []);

  // ─── Timer ────────────────────────────────────────────
  const startTimer = useCallback(() => {
    setElapsedTime(0);
    timerRef.current = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // ─── Full Cleanup ─────────────────────────────────────
  const cleanup = useCallback(() => {
    stopTimer();
    stopAudioCapture();

    // Reset playback scheduling
    nextPlayTimeRef.current = 0;
    activeSourceCountRef.current = 0;

    // Close both audio contexts
    if (captureCtxRef.current?.state !== 'closed') {
      void captureCtxRef.current?.close();
    }
    captureCtxRef.current = null;

    if (playbackCtxRef.current?.state !== 'closed') {
      void playbackCtxRef.current?.close();
    }
    playbackCtxRef.current = null;

    // Disconnect socket
    serviceRef.current?.disconnect();
    serviceRef.current = null;
  }, [stopTimer, stopAudioCapture]);

  // ─── Actions ──────────────────────────────────────────

  const startInterview = useCallback(
    async (config: InterviewConfig) => {
      if (!clerkSession) {
        toast.error(t('errors.signInRequired'));
        return;
      }

      setState('connecting');
      setError(null);
      setFeedback(null);
      setQuestionProgress({ current: 0, total: config.questionCount });

      // Store speech rate for audio playback speed adjustment
      speechRateRef.current = config.speechRate ?? 1.0;

      try {
        // 1. Request microphone access
        const micGranted = await startAudioCapture();
        if (!micGranted) {
          setState('setup');
          return;
        }

        // 2. Create service & connect WebSocket
        const service = new InterviewService();
        serviceRef.current = service;

        const socket = service.connect(async () => {
          return await clerkSession.getToken();
        });

        // 3. Register event listeners
        socket.on('connect', () => {
          // Socket connected — now send the start command
          service.startInterview({
            jobDescription: config.jobDescription,
            questionCount: config.questionCount,
            interviewType: config.interviewType,
            voiceName: config.voiceName,
            language: config.language,
            speechRate: config.speechRate,
          });
        });

        socket.on('connect_error', () => {
          setError(t('errors.connectFailed'));
          setState('error');
          cleanup();
        });

        service.onStarted(({ sessionId: sid }) => {
          setSessionId(sid);
          setState('active');
          startTimer();

          // AI is about to speak (greeting + first question) — block mic
          // until it finishes so user audio isn't sent during AI output.
          setIsAISpeaking(true);
          isAISpeakingRef.current = true;
        });

        service.onAudioResponse(({ audio }) => {
          enqueueAudio(audio);
        });

        service.onTurnComplete((data: TurnCompleteData) => {
          setQuestionProgress({
            current: data.questionNumber,
            total: data.totalQuestions,
          });
          setIsAISpeaking(false);
          isAISpeakingRef.current = false;
        });

        service.onInterrupted(() => {
          setIsAISpeaking(false);
          isAISpeakingRef.current = false;
          nextPlayTimeRef.current = 0;
          activeSourceCountRef.current = 0;
        });

        service.onEvaluating(() => {
          setState('evaluating');
          stopAudioCapture();
          stopTimer();
        });

        service.onFeedback((fb) => {
          setFeedback(fb);
          setState('result');
          cleanup();
        });

        service.onError(({ message }) => {
          toast.error(message);
          setError(message);
          setState('error');
          cleanup();
        });

        service.onSessionLost(({ message }) => {
          const fallbackMessage = t('errors.sessionLost');
          toast.error(message || fallbackMessage);
          setError(message || fallbackMessage);
          setState('error');
          cleanup();
        });
      } catch {
        setError(t('errors.startFailed'));
        setState('error');
        cleanup();
      }
    },
    [
      clerkSession,
      startAudioCapture,
      startTimer,
      enqueueAudio,
      stopAudioCapture,
      stopTimer,
      cleanup,
      t,
    ],
  );

  const stopInterview = useCallback(() => {
    serviceRef.current?.stopInterview();
    // The server will emit 'interview:evaluating' then 'interview:feedback'
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  const reset = useCallback(() => {
    cleanup();
    setState('idle');
    setSessionId(null);
    setQuestionProgress({ current: 0, total: 0 });
    setFeedback(null);
    setError(null);
    setIsAISpeaking(false);
    isAISpeakingRef.current = false;
    setIsMuted(false);
    setElapsedTime(0);
  }, [cleanup]);

  // ─── Cleanup on Unmount ───────────────────────────────
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    state,
    sessionId,
    questionProgress,
    feedback,
    error,
    isAISpeaking,
    isMuted,
    elapsedTime,
    startInterview,
    stopInterview,
    toggleMute,
    reset,
    analyserNode,
    playbackAnalyserNode,
  };
}
