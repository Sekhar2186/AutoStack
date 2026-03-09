import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function coderAgent(blueprint: any) {
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
    });

    const instruction = `You are a web developer.

Generate a simple full-stack web app based on the blueprint.

Return ONLY JSON.

JSON format:
{
{
  "routes": {
    "fileName.js": "express route code"
  },
  "models": {
    "fileName.js": "mongoose schema code"
  },
  "components": {
    "fileName.js": "react component code"
  }
}
    Rules:
- Return raw JSON only
- No explanations
- No markdown

`;

    const result = await model.generateContent([
        instruction,
        JSON.stringify(blueprint)
    ]);

    const response = result.response.text();

    const cleaned = response
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

    return JSON.parse(cleaned);
}