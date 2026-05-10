import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function generateWithGemini(prompt: any) {
    const model = genAI.getGenerativeModel({
        model: process.env.NEXT_PUBLIC_GEMINI_MODEL || "gemini-2.5-flash",
    });

    const result = await model.generateContent(prompt);
    return result.response.text();
}
