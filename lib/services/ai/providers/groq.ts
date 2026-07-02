import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Bare Groq provider.
 * Responsibility: build the request, call the API, return the response.
 * No retry logic. No fallback. No error classification.
 * All of that lives in modelRouter.ts / retryUtils.ts.
 */
export async function generateWithGroq(prompt: any, config: any = {}) {
    const model = config.model || process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

    const completion = await groq.chat.completions.create({
        model,
        messages: [
            {
                role: "user",
                content: typeof prompt === "string" ? prompt : JSON.stringify(prompt),
            },
        ],
        temperature: config.temperature ?? 0.7,
        max_tokens: config.maxOutputTokens ?? 8192,
    });

    return completion.choices[0]?.message?.content ?? "";
}
