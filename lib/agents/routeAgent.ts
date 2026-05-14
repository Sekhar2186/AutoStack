import { GoogleGenerativeAI } from "@google/generative-ai";
import { safeJsonParse } from "@/lib/utils/jsonUtils";
import { generateAI } from "../services/ai/modelRouter";

export async function routeAgent(blueprint: any, previousPath?: string) {

  const instruction = `
Generate API routes ONLY if required.

RULES:
- Use Next.js route.ts format
- Use NextRequest, NextResponse
- MOCK DATA — CRITICAL: If no database is specified, ALWAYS return realistic mock data (JSON).
- SYMMETRY: Ensure routes match the expected endpoints called by the frontend (e.g., /api/chat, /api/predict, /api/predictions).
- DELAY SIMULATION: Add a small artificial delay (e.g., await new Promise(res => setTimeout(res, 1000))) to simulate network latency for better UX testing.
- No MongoDB unless required
- No todo logic unless asked
- NO PLACEHOLDERS: Every route MUST return a valid JSON response with realistic mock data. Never return "Coming Soon" or empty bodies.

STRICT JSON RULES:
- Escape all quotes using \"
- Escape newlines using \\n
- Do NOT include markdown blocks (no \`\`\`json)
- Return ONLY valid parseable JSON. No conversational text.


Return JSON:

{
  "routeName.ts": "code"
}
`;
  let promptParts = instruction + "\n\nUSER REQUEST: " + (blueprint?.appName || "") + "\n\n" + JSON.stringify(blueprint);

  if (previousPath) {
    promptParts += `\n\nExisting project is at: ${previousPath}. Ensure API routes are consistent with existing structure.`;
  }

  const raw = await generateAI("gemini", [promptParts], {
    responseMimeType: "application/json",
  });

  try {
    return safeJsonParse(raw);
  } catch (err) {
    console.error("JSON parse failed in routeAgent. Raw text snippet:", raw.slice(0, 200));
    throw err;
  }
}