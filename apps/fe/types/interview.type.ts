// ─── Enums ────────────────────────────────────────────────

export enum InterviewType {
  TECHNICAL = "TECHNICAL",
  BEHAVIORAL = "BEHAVIORAL",
  ALL = "ALL",
}

export enum InterviewStatus {
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export type InterviewState =
  | "idle"
  | "setup"
  | "connecting"
  | "active"
  | "evaluating"
  | "result"
  | "error";

// ─── Config & Payloads ───────────────────────────────────

export interface InterviewConfig {
  jobDescription: string;
  questionCount: number;
  interviewType: InterviewType;
  voiceName?: string;
  language?: string;
  speechRate?: number;
}

export interface StartInterviewPayload {
  jobDescription: string;
  questionCount: number;
  interviewType: InterviewType;
  voiceName?: string;
  language?: string;
  speechRate?: number;
}

// ─── Server Events ───────────────────────────────────────

export interface TurnCompleteData {
  questionNumber: number;
  totalQuestions: number;
}

// ─── Feedback ────────────────────────────────────────────

export interface QuestionFeedback {
  questionNumber: number;
  question: string;
  score: number;
  feedback: string;
  suggestions: string;
}

export interface EvaluationCriteria {
  technicalKnowledge: number;
  communicationSkills: number;
  problemSolving: number;
  relevanceToRole: number;
  interviewConduct: number;
}

export interface InterviewFeedback {
  overallScore: number;
  verdict: "PASS" | "BORDERLINE" | "FAIL";
  summary: string;
  criteria: EvaluationCriteria;
  questionFeedbacks: QuestionFeedback[];
  strengths: string[];
  improvements: string[];
}
