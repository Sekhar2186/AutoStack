/**
 * Anthropic Claude provider — stateless.
 *
 * Responsibility: Build the request, call the Anthropic Messages API,
 * and return the raw text response.
 *
 * This provider:
 *   - NEVER reads process.env directly.
 *   - Accepts apiKey and model from the caller (user-supplied or system-supplied).
 *   - Has NO retry logic, NO fallback, NO error classification.
 *   - All orchestration lives in modelRouter.ts / retryUtils.ts.
 *
 * NOTE: The @anthropic-ai/sdk package must be installed:
 *   npm install @anthropic-ai/sdk
 * Until a system CLAUDE_API_KEY is configured, this provider is only
 * reachable by users who supply their own key via /api/user/ai-settings.
 */

import type { GenerateOptions } from "../types";

export const name = "claude";
export const supportsStreaming = true;
export const supportsVision = true;
export const supportsJSON = true;
export const maxTokens = 8192;

/**
 * Generate a response from the Anthropic Claude Messages API.
 *
 * @param options.prompt  - The prompt to send (string or array — arrays are JSON-stringified).
 * @param options.model   - Claude model ID (e.g. "claude-3-5-sonnet-20241022").
 * @param options.apiKey  - A valid Anthropic API key (caller-supplied).
 * @param options.config  - Optional config: temperature, maxOutputTokens.
 */
export async function generate({
    prompt,
    model,
    apiKey,
    config = {} as Record<string, unknown>,
}: GenerateOptions): Promise<string> {
    if (!apiKey) {
        throw new Error(
            "[Claude] No API key provided. " +
            "Supply your own Anthropic key via Settings → AI Providers."
        );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let AnthropicClass: any;
    try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const mod = require("@anthropic-ai/sdk") as { default?: unknown };
        AnthropicClass = mod.default ?? mod;
    } catch {
        throw new Error(
            "[Claude] The '@anthropic-ai/sdk' package is not installed. " +
            "Run: npm install @anthropic-ai/sdk"
        );
    }

    const client = new AnthropicClass({ apiKey });

    const message = await client.messages.create({
        model,
        max_tokens: config.maxOutputTokens ?? 8192,
        messages: [
            {
                role: "user",
                content:
                    typeof prompt === "string"
                        ? prompt
                        : JSON.stringify(prompt),
            },
        ],
        ...(config.temperature !== undefined
            ? { temperature: config.temperature }
            : {}),
    });

    // Extract text from first content block
    const block = message.content[0];
    if (block?.type === "text") {
        return block.text;
    }

    return "";
}
