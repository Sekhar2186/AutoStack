import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 15000; // 15 seconds base delay for rate limit retries

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function generateWithGemini(prompt: any) {
    const model = genAI.getGenerativeModel({
        model: process.env.NEXT_PUBLIC_GEMINI_MODEL || "gemini-2.5-flash",
    });

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
            const result = await model.generateContent(prompt);
            return result.response.text();
        } catch (error: any) {
            const is429 = error?.status === 429 || error?.message?.includes("429") || error?.message?.includes("Too Many Requests");

            if (is429 && attempt < MAX_RETRIES) {
                // Extract retry delay from error if available, otherwise use exponential backoff
                let retryDelay = BASE_DELAY_MS * (attempt + 1);

                const retryMatch = error?.message?.match(/retry in (\d+\.?\d*)/i);
                if (retryMatch) {
                    retryDelay = Math.ceil(parseFloat(retryMatch[1]) * 1000) + 2000; // Add 2s buffer
                }

                console.log(`[Gemini] Rate limited (429). Retrying in ${retryDelay / 1000}s (attempt ${attempt + 1}/${MAX_RETRIES})...`);
                await sleep(retryDelay);
                continue;
            }

            throw error;
        }
    }

    throw new Error("Gemini generation failed after max retries");
}
