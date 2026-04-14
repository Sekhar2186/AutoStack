import { GoogleGenerativeAI } from "@google/generative-ai";
import { safeJsonParse } from "@/lib/utils/jsonUtils";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function routeAgent(blueprint: any, previousPath?: string) {
  const model = genAI.getGenerativeModel({
    model: process.env.NEXT_PUBLIC_GEMINI_MODEL || "gemini-1.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  const instruction = `
Generate API routes ONLY if required.

RULES:
- Use Next.js route.ts format
- Use NextRequest, NextResponse
- No MongoDB unless required
- No todo logic unless asked

STRICT JSON RULES:
- Escape all quotes using \"
- Escape newlines using \\n
- Do NOT include markdown
- Return only valid JSON


Return JSON:

{
  "routeName.ts": "code"
}
`;
  let promptParts = instruction + "\n\nUSER REQUEST: " + (blueprint?.appName || "") + "\n\n" + JSON.stringify(blueprint);

  if (previousPath) {
    promptParts += `\n\nExisting project is at: ${previousPath}. Ensure API routes are consistent with existing structure.`;
  }

  const result = await model.generateContent([promptParts]);

  const raw = result.response.text();

  try {
    return safeJsonParse(raw);
  } catch (err) {
    console.error("JSON parse failed in routeAgent. Raw text snippet:", raw.slice(0, 200));
    throw err;
  }
}