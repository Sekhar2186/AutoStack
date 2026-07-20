/**
 * Groq AI provider — stateless.
 *
 * Responsibility: Build the request, call the Groq API,
 * and return the raw text response.
 *
 * This provider:
 *   - NEVER reads process.env directly.
 *   - Accepts apiKey and model from the caller.
 *   - Has NO retry logic, NO fallback, NO error classification.
 *   - All orchestration lives in modelRouter.ts / retryUtils.ts.
 */

import Groq from "groq-sdk";
import type { GenerateOptions } from "../types";

export const name = "groq";
export const supportsStreaming = true;
export const supportsVision = false;
export const supportsJSON = true;
export const maxTokens = 8192;

/**
 * Generate a response from the Groq API.
 *
 * @param options.prompt  - The prompt to send (string or array — arrays are JSON-stringified).
 * @param options.model   - The Groq model ID to use (e.g. "llama-3.3-70b-versatile").
 * @param options.apiKey  - A valid Groq API key (caller-supplied, never read from env here).
 * @param options.config  - Optional config: temperature, maxOutputTokens.
 */
export async function generate({
    prompt,
    model,
    apiKey,
    config = {},
}: GenerateOptions): Promise<string> {
    if (!apiKey) {
        throw new Error("[Groq] No API key provided. Cannot call Groq API.");
    }

    const groq = new Groq({ apiKey });

    const completion = await groq.chat.completions.create({
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
        temperature: (config.temperature as number | undefined) ?? 0.7,
        max_tokens: (config.maxOutputTokens as number | undefined) ?? 8192,
        ...(config.responseMimeType === "application/json" && {
            response_format: { type: "json_object" },
        }),
    });

    return completion.choices[0]?.message?.content ?? "";
}
