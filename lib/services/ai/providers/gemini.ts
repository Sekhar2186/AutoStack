import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

/**
 * Bare Gemini provider.
 * Responsibility: build the request, call the API, return the response.
 * No retry logic. No fallback. No error classification.
 * All of that lives in modelRouter.ts / retryUtils.ts.
 */
export async function generateWithGemini(prompt: any, config: any = {}) {
    const model = genAI.getGenerativeModel({
        model: process.env.NEXT_PUBLIC_GEMINI_MODEL || "gemini-2.5-flash",
        generationConfig: config,
    });

    const result = await model.generateContent(prompt);
    return result.response.text();
}
