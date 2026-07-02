import { generateWithGemini } from "./providers/gemini";
import { generateWithGroq } from "./providers/groq";
import { withRetry } from "@/lib/utils/retryUtils";
import { isAuthError, isQuotaError } from "@/lib/services/ai/errorUtils";
import {
    getActiveProvider,
    setActiveProvider,
    isFallbackActive,
} from "@/lib/services/ai/providerSession";
// import { generateWithOpenAI } from "./providers/openai";
// import { generateWithClaude } from "./providers/claude";

// Re-export so callers (e.g. the generate route) only need one import.
export { resetProviderSession } from "@/lib/services/ai/providerSession";

// ─── Internal: Run with retry, then fall back to Groq ────────────────────────

async function runWithGeminiFallback(prompt: any, config: any): Promise<any> {
    // If a previous call already switched to Groq, skip Gemini entirely.
    if (isFallbackActive()) {
        console.log("[AI Router] Provider Session = Groq (reusing fallback from earlier in this session)");
        return runGroq(prompt, config);
    }

    console.log("[AI Router] Active Provider: Gemini");
    try {
        const result = await withRetry(() => generateWithGemini(prompt, config));
        console.log("[AI Router] Gemini generation completed successfully.");
        return result;
    } catch (error: any) {
        // Auth failures mean misconfiguration — switching providers won't help.
        if (isAuthError(error)) {
            console.error("[AI Router] Gemini authentication error. Check GEMINI_API_KEY.");
            console.error(`[Gemini] Error: ${error?.message ?? "Unknown error"}`);
            throw error;
        }

        const reason = isQuotaError(error)
            ? "quota / rate-limit exhausted"
            : "all retries failed";
        console.warn(`[AI Router] Gemini exhausted all retry attempts (${reason}).`);
        console.warn(`[Gemini] Error: ${error?.message ?? "Unknown error"}`);
        if (error?.stack) {
            console.warn(`[Gemini] Stack trace:\n${error.stack}`);
        }

        console.log("[AI Router] Switching provider from Gemini -> Groq");
        setActiveProvider("groq");

        return runGroq(prompt, config);
    }
}

async function runGroq(prompt: any, config: any): Promise<any> {
    try {
        const result = await withRetry(() => generateWithGroq(prompt, config));
        console.log("[AI Router] Groq generation completed successfully.");
        console.log(`[AI Router] Provider Session = ${getActiveProvider().toUpperCase()}`);
        return result;
    } catch (groqError: any) {
        console.error("[AI Router] Groq generation failed.");
        console.error(`[Groq] Error: ${groqError?.message ?? "Unknown error"}`);
        if (groqError?.stack) {
            console.error(`[Groq] Stack trace:\n${groqError.stack}`);
        }
        throw groqError;
    }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function generateAI(model: string, prompt: any, config: any = {}) {
    switch (model) {
        case "gemini":
            return runWithGeminiFallback(prompt, config);

        case "openai":
            throw new Error("OpenAI not enabled yet");

        case "claude":
            throw new Error("Claude not enabled yet");

        default:
            return runWithGeminiFallback(prompt, config);
    }
}
