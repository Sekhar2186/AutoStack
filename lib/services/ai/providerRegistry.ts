/**
 * AI Provider Registry
 *
 * The single lookup table for all supported AI providers.
 * Adding a new provider = add one entry here. No switch statements anywhere.
 *
 * Each entry exposes:
 *   - name: string  (for logging / identification)
 *   - generate(options): Promise<string>
 *
 * Consumers (providerFactory.ts, modelRouter.ts) must only interact with
 * providers through this registry — never import providers directly.
 */

import * as gemini from "@/lib/services/ai/providers/gemini";
import * as groq from "@/lib/services/ai/providers/groq";
import * as openai from "@/lib/services/ai/providers/openai";
import * as claude from "@/lib/services/ai/providers/claude";

// ─── Contract ─────────────────────────────────────────────────────────────────

export interface ProviderGenerateOptions {
    /** Prompt string, or an array of parts (e.g. Gemini multi-part). */
    prompt: string | unknown[];
    /** Model ID to use (e.g. "gemini-2.5-flash", "llama-3.3-70b-versatile"). */
    model: string;
    /** API key — supplied by caller (system or user), never read from env here. */
    apiKey: string;
    /** Optional generation config (temperature, maxOutputTokens, etc.). */
    config?: Record<string, unknown>;
}

export interface AIProvider {
    name: string;
    generate(options: ProviderGenerateOptions): Promise<string>;
}

// ─── Registry ─────────────────────────────────────────────────────────────────

export const providerRegistry: Record<string, AIProvider> = {
    gemini,
    groq,
    openai,
    claude,
} as const;

export type RegisteredProviderName = keyof typeof providerRegistry;
