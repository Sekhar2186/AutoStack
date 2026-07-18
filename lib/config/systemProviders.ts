/**
 * System-level AI provider configuration.
 *
 * This is the SINGLE SOURCE OF TRUTH for all system API keys and default models.
 * No other file in the codebase should read GEMINI_API_KEY, GROQ_API_KEY, etc.
 * from process.env — they must import from here instead.
 *
 * User-supplied keys are resolved separately via providerResolver.ts and are
 * decrypted at runtime from the UserAISettings collection.
 */

import type { SupportedProvider } from "@/lib/db/models/UserAISettings";

export interface SystemProviderConfig {
    apiKey: string;
    model: string;
}

export const systemProviders: Record<SupportedProvider, SystemProviderConfig> = {
    gemini: {
        apiKey: process.env.GEMINI_API_KEY ?? "",
        model: process.env.NEXT_PUBLIC_GEMINI_MODEL ?? "gemini-2.5-flash",
    },
    groq: {
        apiKey: process.env.GROQ_API_KEY ?? "",
        model: process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile",
    },
    openai: {
        apiKey: process.env.OPENAI_API_KEY ?? "",
        model: process.env.OPENAI_MODEL ?? "gpt-4o",
    },
    claude: {
        apiKey: process.env.CLAUDE_API_KEY ?? "",
        model: process.env.CLAUDE_MODEL ?? "claude-3-5-sonnet-20241022",
    },
} as const;

/**
 * Dedicated fallback provider used when a user's personal API key fails (rate limit, quota, etc).
 * This key is separate from the main system Groq key to protect auto-mode quota.
 */
export const userFallbackProvider: SystemProviderConfig = {
    apiKey: process.env.GROQ_USER_FALLBACK_API_KEY ?? "",
    model: process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile",
};
