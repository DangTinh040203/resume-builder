import { InterviewType } from "@/types/interview.type";

export const INTERVIEW_TYPE_OPTIONS = [
  { label: "Technical", value: InterviewType.TECHNICAL },
  { label: "Behavioral", value: InterviewType.BEHAVIORAL },
  { label: "All (Mixed)", value: InterviewType.ALL },
] as const;

export const QUESTION_COUNT_MIN = 1;
export const QUESTION_COUNT_MAX = 10;
export const QUESTION_COUNT_DEFAULT = 5;
export const INTERVIEW_TYPE_DEFAULT = InterviewType.ALL;

// ─── Voice Options ───────────────────────────────────────
export const VOICE_OPTIONS = [
  { label: "Zephyr — Bright", value: "Zephyr" },
  { label: "Puck — Upbeat", value: "Puck" },
  { label: "Charon — Informative", value: "Charon" },
  { label: "Kore — Firm", value: "Kore" },
  { label: "Fenrir — Excitable", value: "Fenrir" },
  { label: "Leda — Youthful", value: "Leda" },
  { label: "Orus — Firm", value: "Orus" },
] as const;

export const VOICE_DEFAULT = "Kore";

// ─── Language Options ────────────────────────────────────
export const LANGUAGE_OPTIONS = [
  { label: "English", value: "English" },
  { label: "Vietnamese", value: "Vietnamese" },
  { label: "Japanese", value: "Japanese" },
  { label: "Korean", value: "Korean" },
  { label: "Chinese (Mandarin)", value: "Chinese" },
  { label: "French", value: "French" },
  { label: "German", value: "German" },
  { label: "Spanish", value: "Spanish" },
  { label: "Portuguese", value: "Portuguese" },
  { label: "Thai", value: "Thai" },
  { label: "Indonesian", value: "Indonesian" },
  { label: "Hindi", value: "Hindi" },
] as const;

export const LANGUAGE_DEFAULT = "English";

// ─── Speech Rate ─────────────────────────────────────────
export const SPEECH_RATE_MIN = 0.5;
export const SPEECH_RATE_MAX = 2.0;
export const SPEECH_RATE_STEP = 0.1;
export const SPEECH_RATE_DEFAULT = 1.0;

/** Audio configuration matching the Gemini Live API requirements */
export const AUDIO_CONFIG = {
  /** Input: 16-bit PCM, 16kHz, mono */
  INPUT_SAMPLE_RATE: 16000,
  INPUT_CHANNELS: 1,

  /** Output from Gemini: 24kHz PCM */
  OUTPUT_SAMPLE_RATE: 24000,

  /** Buffer size for ScriptProcessorNode (power of 2) */
  BUFFER_SIZE: 4096,
} as const;
