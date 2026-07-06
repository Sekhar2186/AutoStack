/**
 * AI Model Router — pure orchestrator.
 *
 * This module is the single entry point for all AI generation in AutoStack.
 * It orchestrates provider selection and fallback — it knows NOTHING about
 * how individual providers work internally.
 *
 * Generation flow:
 *
 *   generateAI(model, prompt, config, userId?)
 *       │
 *       ├─ userId provided?
 *       │       │
 *       │       ├─ YES → resolveProviderForUser(userId)
 *       │       │           │
 *       │       │           ├─ isUserProvider → getProvider(name).generate()
 *       │       │           │
 *       │       │           └─ "auto"  → system fallback chain ↓
 *       │       │
 *       │       └─ NO  → system fallback chain ↓
 *       │
 *       └─ System fallback chain:
 *               Gemini (with retry)
 *                   │
 *                   └─ fail → Groq (with retry)
 *                                 │
 *                                 └─ fail → throw
 */

import { withRetry } from "@/lib/utils/retryUtils";
import { isAuthError, isQuotaError } from "@/lib/services/ai/errorUtils";
import {
    getActiveProvider,
    setActiveProvider,
    isFallbackActive,
} from "@/lib/services/ai/providerSession";
import { getProvider } from "@/lib/services/ai/providerFactory";
import { resolveProviderForUser } from "@/lib/services/ai/providerResolver";
import { systemProviders } from "@/lib/config/systemProviders";

// Re-export so callers (e.g. the generate route) only need one import.
export { resetProviderSession } from "@/lib/services/ai/providerSession";

// ─── Types ────────────────────────────────────────────────────────────────────

interface GenerateConfig {
    temperature?: number;
    maxOutputTokens?: number;
    [key: string]: unknown;
}

// ─── System Fallback Chain ────────────────────────────────────────────────────

/**
 * Runs generation with Gemini (system key).
 * On non-auth failure, falls back to Groq (system key).
 * Reuses the active session to skip Gemini when already in fallback mode.
 */
async function runSystemFallbackChain(
    prompt: string | unknown[],
    config: GenerateConfig
): Promise<string> {
    // If a previous call in this session already switched to Groq, skip Gemini.
    if (isFallbackActive()) {
        console.log(
            "[AI Router] Provider Session = Groq (reusing fallback from earlier in this session)"
        );
        return runSystemGroq(prompt, config);
    }

    console.log("[AI Router] Active Provider: Gemini (system)");

    try {
        const geminiProvider = getProvider("gemini");
        const { apiKey, model } = systemProviders.gemini;

        const result = await withRetry(() =>
            geminiProvider.generate({ prompt, model, apiKey, config })
        );

        console.log("[AI Router] Gemini generation completed successfully.");
        return result;
    } catch (error: unknown) {
        const err = error as { message?: string; stack?: string; status?: number };
        // Auth failures mean misconfiguration — switching providers won't help.
        if (isAuthError(err)) {
            console.error(
                "[AI Router] Gemini authentication error. Check GEMINI_API_KEY."
            );
            console.error(`[Gemini] Error: ${err?.message ?? "Unknown error"}`);
            throw error;
        }

        const reason = isQuotaError(err)
            ? "quota / rate-limit exhausted"
            : "all retries failed";

        console.warn(
            `[AI Router] Gemini exhausted all retry attempts (${reason}).`
        );
        console.warn(`[Gemini] Error: ${err?.message ?? "Unknown error"}`);
        if (err?.stack) {
            console.warn(`[Gemini] Stack trace:\n${err.stack}`);
        }

        console.log("[AI Router] Switching provider from Gemini → Groq");
        setActiveProvider("groq");

        return runSystemGroq(prompt, config);
    }
}

/**
 * Runs generation with Groq (system key).
 */
async function runSystemGroq(
    prompt: string | unknown[],
    config: GenerateConfig
): Promise<string> {
    try {
        const groqProvider = getProvider("groq");
        const { apiKey, model } = systemProviders.groq;

        const result = await withRetry(() =>
            groqProvider.generate({ prompt, model, apiKey, config })
        );

        console.log("[AI Router] Groq generation completed successfully.");
        console.log(
            `[AI Router] Provider Session = ${getActiveProvider().toUpperCase()}`
        );
        return result;
    } catch (groqError: unknown) {
        const err = groqError as { message?: string; stack?: string };
        console.error("[AI Router] Groq generation failed.");
        console.error(
            `[Groq] Error: ${err?.message ?? "Unknown error"}`
        );
        if (err?.stack) {
            console.error(`[Groq] Stack trace:\n${err.stack}`);
        }
        throw groqError;
    }
}

// ─── User Provider Path ───────────────────────────────────────────────────────

/**
 * Runs generation using the user's configured provider.
 * Wraps with retry — falls through on auth errors.
 */
async function runUserProvider(
    providerName: string,
    apiKey: string,
    model: string,
    prompt: string | unknown[],
    config: GenerateConfig
): Promise<string> {
    const provider = getProvider(providerName);

    console.log(
        `[AI Router] Using user provider: "${providerName}" (model: ${model})`
    );

    return withRetry(() =>
        provider.generate({ prompt, model, apiKey, config })
    );
}

// ─── Public API ───────────────────────────────────────────────────────────────

export interface GenerateAIParams {
    provider?: string;
    prompt: string | unknown[];
    config?: GenerateConfig;
    userId?: string;
}

/**
 * Main entry point for all AI generation in AutoStack.
 *
 * @param params.provider - Preferred provider hint (e.g. "gemini"). Ignored if userId resolves a user provider.
 * @param params.prompt   - Prompt string or array of parts.
 * @param params.config   - Optional generation config.
 * @param params.userId   - Optional user ID. When provided, attempts to resolve user's custom provider first.
 */
export async function generateAI({
    provider = "gemini",
    prompt,
    config = {},
    userId
}: GenerateAIParams): Promise<string> {
    // 1. Attempt user provider if userId is provided
    if (userId) {
        const resolved = await resolveProviderForUser(userId);

        if (resolved.isUserProvider) {
            return runUserProvider(
                resolved.provider,
                resolved.apiKey,
                resolved.model,
                prompt,
                config
            );
        }
        // else: fall through to system provider chain
    }

    // 2. System fallback chain: Gemini → Groq
    return runSystemFallbackChain(prompt, config);
}
