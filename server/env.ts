import { z } from "zod";

/**
 * Loads and validates environment variables ONCE at server start. The LLM key
 * lives here and nowhere near the client bundle.
 *
 * Provider auto-selection: if LLM_PROVIDER is set, it wins; otherwise we use
 * `gemini` when a key is present and fall back to `mock` so the app runs with
 * zero setup (`npm install && npm start`).
 */

// Node 20.12+/24 can read a .env file with no dependency. Missing file is fine.
try {
  process.loadEnvFile();
} catch {
  // No .env present — the mock provider fallback keeps the app working.
}

const envSchema = z.object({
  GEMINI_API_KEY: z.string().trim().min(1).optional(),
  GEMINI_MODEL: z.string().trim().min(1).default("gemini-2.5-flash"),
  LLM_PROVIDER: z.enum(["gemini", "mock"]).optional(),
  PORT: z.coerce.number().int().positive().default(8787),
  // Fault-injection demo is on by default (it only fires when the client sends an
  // explicit x-fault header). Set FAULT_DEMO=0 to disable in a real deployment.
  FAULT_DEMO: z
    .enum(["0", "1", "true", "false"])
    .default("1")
    .transform((v) => v === "1" || v === "true"),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error("Invalid environment configuration:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const raw = parsed.data;

export const providerName: "gemini" | "mock" =
  raw.LLM_PROVIDER ?? (raw.GEMINI_API_KEY ? "gemini" : "mock");

export const env = {
  port: raw.PORT,
  faultDemoEnabled: raw.FAULT_DEMO,
  gemini: {
    apiKey: raw.GEMINI_API_KEY,
    model: raw.GEMINI_MODEL,
  },
  providerName,
} as const;
