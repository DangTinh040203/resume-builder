import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const Env = createEnv({
  client: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string(),
    NEXT_PUBLIC_BASE_URL: z.string(),
    NEXT_PUBLIC_WS_URL: z.string().optional(),
  },
  server: {},

  runtimeEnv: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
  },
});
