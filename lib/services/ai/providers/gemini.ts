/**
 * Gemini AI provider — stateless.
 *
 * Responsibility: Build the request, call the Google Generative AI API,
 * and return the raw text response.
 *
 * This provider:
 *   - NEVER reads process.env directly.
 *   - Accepts apiKey and model from the caller.
 *   - Has NO retry logic, NO fallback, NO error classification.
 *   - All orchestration lives in modelRouter.ts / retryUtils.ts.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import type { GenerateOptions } from "../types";

export const name = "gemini";
export const supportsStreaming = true;
export const supportsVision = true;
export const supportsJSON = true;
export const maxTokens = 8192;

/**
 * Generate a response from the Gemini API.
 *
 * @param options.prompt  - The prompt to send (string or Part array).
 * @param options.model   - The Gemini model ID to use.
 * @param options.apiKey  - A valid Gemini API key (caller-supplied, never read from env here).
 * @param options.config  - Optional generation config (temperature, maxOutputTokens, etc.).
 */
export async function generate({
    prompt,
    model,
    apiKey,
    config = {},
}: GenerateOptions): Promise<string> {
    if (!apiKey) {
        throw new Error("[Gemini] No API key provided. Cannot call Gemini API.");
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const geminiModel = genAI.getGenerativeModel({
        model,
        generationConfig: config as import("@google/generative-ai").GenerationConfig,
    });

    const result = await geminiModel.generateContent(
        prompt as string | import("@google/generative-ai").GenerateContentRequest
    );
    return result.response.text();
}
