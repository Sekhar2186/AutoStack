import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function pageAgent(blueprint: any) {
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
    });

    const instruction = `
You are a Next.js frontend developer.

Generate ONLY the main page (app/page.tsx).

STRICT RULES:
- Use TypeScript (.tsx)
- Use React functional component
- Use Tailwind CSS
- Use ONLY components passed/imported
- DO NOT create new layout
- DO NOT modify layout.tsx
- Follow template styling
- Ensure responsive UI

IMPORTANT:
- STRICTLY follow user request
- DO NOT generate Todo UI unless asked
- Use proper structure (hero, sections, cards, etc.)
- Keep UI clean and modern

RETURN JSON:

{
  "imports": "all required import statements",
  "page": "complete page.tsx code"
}

Rules:
- Return raw JSON only
- No markdown
- No explanations
`;

    const result = await model.generateContent([
        instruction,
        "USER REQUEST: " + (blueprint?.appName || ""),
        JSON.stringify(blueprint),
    ]);

    const text = result.response.text();

    const cleaned = text.replace(/```json|```/g, "").trim();

    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid JSON from pageAgent");

    return JSON.parse(jsonMatch[0]);
}
