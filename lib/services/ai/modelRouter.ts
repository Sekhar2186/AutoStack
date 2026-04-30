import { generateWithGemini } from "./providers/gemini";
// import { generateWithOpenAI } from "./providers/openai";
// import { generateWithClaude } from "./providers/claude";

export async function generateAI(model: string, prompt: any) {
    switch (model) {
        case "gemini":
            return generateWithGemini(prompt);

        case "openai":
            throw new Error("OpenAI not enabled yet");

        case "claude":
            throw new Error("Claude not enabled yet");

        default:
            return generateWithGemini(prompt);
    }
}
