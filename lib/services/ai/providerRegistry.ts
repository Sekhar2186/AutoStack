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
import type { AIProvider } from "@/lib/services/ai/types";

// ─── Registry ─────────────────────────────────────────────────────────────────

export const providerRegistry: Record<string, AIProvider> = {
    gemini,
    groq,
    openai,
    claude,
} as const;

export type RegisteredProviderName = keyof typeof providerRegistry;
