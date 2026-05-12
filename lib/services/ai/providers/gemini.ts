import { GoogleGenerativeAI } from "@google/generative-ai";
import { withRetry } from "@/lib/utils/retryUtils";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function generateWithGemini(prompt: any, config: any = {}) {
    const model = genAI.getGenerativeModel({
        model: process.env.NEXT_PUBLIC_GEMINI_MODEL || "gemini-2.5-flash",
        generationConfig: config
    });

    return withRetry(async () => {
        const result = await model.generateContent(prompt);
        return result.response.text();
    });
}
