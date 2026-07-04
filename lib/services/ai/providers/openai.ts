/**
 * OpenAI provider — stateless.
 *
 * Responsibility: Build the request, call the OpenAI Chat Completions API,
 * and return the raw text response.
 *
 * This provider:
 *   - NEVER reads process.env directly.
 *   - Accepts apiKey and model from the caller (user-supplied or system-supplied).
 *   - Has NO retry logic, NO fallback, NO error classification.
 *   - All orchestration lives in modelRouter.ts / retryUtils.ts.
 *
 * NOTE: The openai package must be installed:  npm install openai
 * Until a system OPENAI_API_KEY is configured, this provider is only
 * reachable by users who supply their own key via /api/user/ai-settings.
 */

import type { ProviderGenerateOptions } from "../providerRegistry";

export const name = "openai";

/**
 * Generate a response from the OpenAI Chat Completions API.
 *
 * @param options.prompt  - The prompt to send (string or array — arrays are JSON-stringified).
 * @param options.model   - The OpenAI model ID (e.g. "gpt-4o", "gpt-4-turbo").
 * @param options.apiKey  - A valid OpenAI API key (caller-supplied).
 * @param options.config  - Optional config: temperature, maxOutputTokens.
 */
export async function generate({
    prompt,
    model,
    apiKey,
    config = {} as Record<string, unknown>,
}: ProviderGenerateOptions): Promise<string> {
    if (!apiKey) {
        throw new Error(
            "[OpenAI] No API key provided. " +
            "Supply your own OpenAI key via Settings → AI Providers."
        );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let OpenAIClass: any;
    try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const mod = require("openai") as { default?: unknown };
        OpenAIClass = mod.default ?? mod;
    } catch {
        throw new Error(
            "[OpenAI] The 'openai' package is not installed. Run: npm install openai"
        );
    }

    const client = new OpenAIClass({ apiKey });

    const completion = await client.chat.completions.create({
        model,
        messages: [
            {
                role: "user",
                content:
                    typeof prompt === "string"
                        ? prompt
                        : JSON.stringify(prompt),
            },
        ],
        temperature: config.temperature ?? 0.7,
        max_tokens: config.maxOutputTokens ?? 8192,
    });

    return completion.choices[0]?.message?.content ?? "";
}
