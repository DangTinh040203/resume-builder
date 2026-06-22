"use client";

import { io, type Socket } from "socket.io-client";

import { Env } from "@/configs/env.config";
import type {
  InterviewFeedback,
  StartInterviewPayload,
  TurnCompleteData,
} from "@/types/interview.type";

export type GetTokenFn = () => Promise<string | null>;

export class InterviewService {
  private socket: Socket | null = null;

  /**
   * Connect to the interview WebSocket namespace.
   * Uses Clerk token for authentication in the handshake.
   */
  connect(getToken: GetTokenFn): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    // Extract origin from base URL (e.g. "http://localhost:3000/api/v1" → "http://localhost:3000")
    const baseUrl = Env.NEXT_PUBLIC_WS_URL ?? Env.NEXT_PUBLIC_BASE_URL;
    const wsOrigin = new URL(baseUrl).origin;

    this.socket = io(`${wsOrigin}/interview`, {
      auth: async (cb) => {
        const token = await getToken();
        cb({ token });
      },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 1000,
    });

    return this.socket;
  }

  /** Disconnect and cleanup the socket. */
  disconnect(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /** Get the underlying socket instance (may be null). */
  getSocket(): Socket | null {
    return this.socket;
  }

  /** Check if the socket is currently connected. */
  get isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  // ─── Emitters (Client → Server) ────────────────────────

  startInterview(payload: StartInterviewPayload): void {
    this.socket?.emit("interview:start", payload);
  }

  sendAudio(audioBase64: string): void {
    this.socket?.emit("interview:audio", { audio: audioBase64 });
  }

  stopInterview(): void {
    this.socket?.emit("interview:stop");
  }

  /** Notify server that AI audio playback finished on the client. */
  sendPlaybackComplete(): void {
    this.socket?.emit("interview:playback-complete");
  }

  // ─── Listeners (Server → Client) ──────────────────────

  onStarted(callback: (data: { sessionId: string }) => void): void {
    this.socket?.on("interview:started", callback);
  }

  onAudioResponse(callback: (data: { audio: string }) => void): void {
    this.socket?.on("interview:audio", callback);
  }

  onTurnComplete(callback: (data: TurnCompleteData) => void): void {
    this.socket?.on("interview:turn-complete", callback);
  }

  onInterrupted(callback: () => void): void {
    this.socket?.on("interview:interrupted", callback);
  }

  onEvaluating(callback: () => void): void {
    this.socket?.on("interview:evaluating", callback);
  }

  onFeedback(callback: (data: InterviewFeedback) => void): void {
    this.socket?.on("interview:feedback", callback);
  }

  onError(callback: (data: { message: string }) => void): void {
    this.socket?.on("interview:error", callback);
  }

  onSessionLost(callback: (data: { message: string }) => void): void {
    this.socket?.on("interview:session-lost", callback);
  }
}
